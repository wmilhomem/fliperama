/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * CAMADA DE ENTRADA POR GESTOS — piloto "arrastar" (Invasores Cósmicos 84)
 *
 * Pointer Events com setPointerCapture e rastreio por pointerId (multitoque
 * real: um polegar arrasta enquanto o outro atira). Nenhum estado fica
 * preso: ao perder o foco, ocultar a aba, trocar de esquema, pausar ou
 * receber pointercancel, tudo é liberado via `liberarTudo()`.
 *
 * Sem alocação de memória por quadro na leitura (`lerFrame`): os ponteiros
 * ficam num Map estável e o arrasteDX é acumulado e zerado na leitura.
 */

import { lerControles, ModoTiro } from '../shared/controles';

export interface GestureFrame {
  /** Deslocamento horizontal acumulado (pixels lógicos), zerado na leitura. */
  arrasteDX: number;
  /** Deslocamento vertical acumulado (pixels lógicos), zerado na leitura. */
  arrasteDY: number;
  /** Verdadeiro enquanto houver ao menos um dedo na faixa de arrasto. */
  arrastando: boolean;
  /** Ação mantida (ATIRAR pressionado, ou "auto" com dedo na faixa). */
  acao: boolean;
  /** Borda de pressão/toque (consumida na leitura). */
  acaoPressionada: boolean;
}

export interface PonteiroInfo {
  id: number;
  x: number;
  y: number;
  zona: 'faixa' | 'atirar';
}

export interface DiagnosticoTouch {
  ponteiros: PonteiroInfo[];
  arrasteDX: number;
  arrasteDY: number;
  arrastando: boolean;
  atirarHeld: boolean;
  modoTiro: ModoTiro;
  sensibilidade: number;
  canhoto: boolean;
  latenciaMs: number;
  descartadas: number;
}

interface Ponteiro {
  id: number;
  zona: 'faixa' | 'atirar';
  ultimoX: number;
  ultimoY: number;
  inicioX: number;
  inicioY: number;
  inicioT: number;
  movidos: number;
}

export class GestureInputManager {
  private faixa: HTMLElement | null = null;
  private botao: HTMLElement | null = null;
  private larguraLogica = 480;
  private escala = 1;

  private ponteiros = new Map<number, Ponteiro>();
  private arrasteDX = 0;
  private arrasteDY = 0;
  private atirarHeld = false;
  private atirarEdge = false;
  private latenciaMs = 0;
  private ultimoEventoT: number | null = null;
  private ultimoArrasteDX = 0;
  private ultimoArrasteDY = 0;
  private descartadas = 0;

  private anexosFaixa: (() => void)[] = [];
  private anexosBotao: (() => void)[] = [];

  /** Registra os elementos da faixa e do botão ATIRAR (refs do React). */
  registrarFaixa(el: HTMLElement | null): void {
    if (this.faixa === el) return;
    this.desanexarFaixa();
    this.faixa = el;
    if (!el) return;
    this.escala = this.larguraLogica / Math.max(1, el.getBoundingClientRect().width);
    this.anexar(this.anexosFaixa, el, 'pointerdown', this.aoFaixaDown);
    this.anexar(this.anexosFaixa, el, 'pointermove', this.aoFaixaMove);
    this.anexar(this.anexosFaixa, el, 'pointerup', this.aoFaixaFim);
    this.anexar(this.anexosFaixa, el, 'pointercancel', this.aoFaixaFim);
    this.anexar(this.anexosFaixa, el, 'lostpointercapture', this.aoFaixaFim);
  }

  registrarBotao(el: HTMLElement | null): void {
    if (this.botao === el) return;
    this.desanexarBotao();
    this.botao = el;
    if (!el) return;
    this.anexar(this.anexosBotao, el, 'pointerdown', this.aoBotaoDown);
    this.anexar(this.anexosBotao, el, 'pointerup', this.aoBotaoFim);
    this.anexar(this.anexosBotao, el, 'pointercancel', this.aoBotaoFim);
    this.anexar(this.anexosBotao, el, 'lostpointercapture', this.aoBotaoFim);
  }

  definirLarguraLogica(largura: number): void {
    this.larguraLogica = largura;
    if (this.faixa) {
      this.escala = largura / Math.max(1, this.faixa.getBoundingClientRect().width);
    }
  }

  private desanexarFaixa(): void {
    for (const fn of this.anexosFaixa) fn();
    this.anexosFaixa = [];
    this.faixa = null;
  }

  private desanexarBotao(): void {
    for (const fn of this.anexosBotao) fn();
    this.anexosBotao = [];
    this.botao = null;
  }

  private anexar(
    lista: (() => void)[],
    alvo: HTMLElement,
    tipo: string,
    fn: (e: PointerEvent) => void
  ): void {
    const h = (e: Event) => fn(e as PointerEvent);
    alvo.addEventListener(tipo, h, { passive: false });
    lista.push(() => alvo.removeEventListener(tipo, h));
  }

  private marcarEvento(): void {
    this.ultimoEventoT = performance.now();
  }

  private aoFaixaDown = (e: PointerEvent): void => {
    e.preventDefault();
    this.marcarEvento();
    try {
      this.faixa?.setPointerCapture(e.pointerId);
    } catch {
      // Captura opcional; sem ela o ponteiro pode "perder" ao sair da faixa.
    }
    this.ponteiros.set(e.pointerId, {
      id: e.pointerId,
      zona: 'faixa',
      ultimoX: e.clientX,
      ultimoY: e.clientY,
      inicioX: e.clientX,
      inicioY: e.clientY,
      inicioT: performance.now(),
      movidos: 0,
    });
  };

  private aoFaixaMove = (e: PointerEvent): void => {
    const p = this.ponteiros.get(e.pointerId);
    if (!p || p.zona !== 'faixa') {
      // Só conta como descarte quando há ponteiro(s) ativo(s) e o evento
      // não corresponde a nenhum deles — hover de mouse sem toque é normal.
      if (this.ponteiros.size > 0) this.descartadas++;
      return;
    }
    this.marcarEvento();
    const dx = e.clientX - p.ultimoX;
    const dy = e.clientY - p.ultimoY;
    p.ultimoX = e.clientX;
    p.ultimoY = e.clientY;
    p.movidos += Math.abs(dx) + Math.abs(dy);
    this.arrasteDX += dx * this.escala;
    this.arrasteDY += dy * this.escala;
  };

  private aoFaixaFim = (e: PointerEvent): void => {
    const p = this.ponteiros.get(e.pointerId);
    if (p && p.zona === 'faixa') {
      const config = lerControles();
      const duracao = performance.now() - p.inicioT;
      const parado = p.movidos <= 12;
      if (config.modoTiro === 'toque' && duracao < 300 && parado) {
        this.atirarEdge = true;
      }
    }
    this.ponteiros.delete(e.pointerId);
    this.marcarEvento();
  };

  private aoBotaoDown = (e: PointerEvent): void => {
    e.preventDefault();
    this.marcarEvento();
    try {
      this.botao?.setPointerCapture(e.pointerId);
    } catch {
      // Captura opcional
    }
    this.ponteiros.set(e.pointerId, {
      id: e.pointerId,
      zona: 'atirar',
      ultimoX: e.clientX,
      ultimoY: e.clientY,
      inicioX: e.clientX,
      inicioY: e.clientY,
      inicioT: performance.now(),
      movidos: 0,
    });
    this.atirarHeld = true;
    this.atirarEdge = true;
  };

  private aoBotaoFim = (e: PointerEvent): void => {
    this.ponteiros.delete(e.pointerId);
    this.atirarHeld = [...this.ponteiros.values()].some((p) => p.zona === 'atirar');
    this.marcarEvento();
  };

  /** Libera tudo (troca de aba, pausa, troca de esquema, blur, unmount). */
  liberarTudo(): void {
    this.ponteiros.clear();
    this.arrasteDX = 0;
    this.arrasteDY = 0;
    this.atirarHeld = false;
    this.atirarEdge = false;
  }

  /** Leitura por quadro: devolve o frame e zera os acumuladores. */
  lerFrame(): GestureFrame {
    const config = lerControles();
    let temFaixa = false;
    for (const p of this.ponteiros.values()) {
      if (p.zona === 'faixa') {
        temFaixa = true;
        break;
      }
    }
    const acaoHeld = config.modoTiro === 'auto' ? temFaixa : this.atirarHeld;
    const frame: GestureFrame = {
      arrasteDX: this.arrasteDX,
      arrasteDY: this.arrasteDY,
      arrastando: temFaixa,
      acao: acaoHeld,
      acaoPressionada: this.atirarEdge,
    };
    if (this.arrasteDX !== 0) this.ultimoArrasteDX = this.arrasteDX;
    if (this.arrasteDY !== 0) this.ultimoArrasteDY = this.arrasteDY;
    this.arrasteDX = 0;
    this.arrasteDY = 0;
    this.atirarEdge = false;
    if (this.ultimoEventoT !== null) {
      this.latenciaMs = performance.now() - this.ultimoEventoT;
      this.ultimoEventoT = null;
    }
    return frame;
  }

  lerDiagnostico(): DiagnosticoTouch {
    const config = lerControles();
    const ponteiros: PonteiroInfo[] = [];
    for (const p of this.ponteiros.values()) {
      ponteiros.push({ id: p.id, x: Math.round(p.ultimoX), y: Math.round(p.inicioY), zona: p.zona });
    }
    return {
      ponteiros,
      arrasteDX: this.ultimoArrasteDX,
      arrasteDY: this.ultimoArrasteDY,
      arrastando: ponteiros.some((p) => p.zona === 'faixa'),
      atirarHeld: this.atirarHeld,
      modoTiro: config.modoTiro,
      sensibilidade: config.sensibilidade,
      canhoto: config.canhoto,
      latenciaMs: Math.round(this.latenciaMs),
      descartadas: this.descartadas,
    };
  }

  destruir(): void {
    this.liberarTudo();
    for (const fn of this.anexosFaixa) fn();
    for (const fn of this.anexosBotao) fn();
    this.anexosFaixa = [];
    this.anexosBotao = [];
    this.faixa = null;
    this.botao = null;
  }
}
