/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { InputState } from './types';

export class UnifiedInputManager {
  private teclasPressionadas: Set<string> = new Set();
  private touchEstados: Partial<Record<keyof InputState, boolean>> = {};
  private estadosAnteriores: {
    acao: boolean;
    acao2: boolean;
    cima: boolean;
    baixo: boolean;
    esquerda: boolean;
    direita: boolean;
    pausa: boolean;
    reiniciar: boolean;
    voltar: boolean;
    mudo: boolean;
  } = {
    acao: false,
    acao2: false,
    cima: false,
    baixo: false,
    esquerda: false,
    direita: false,
    pausa: false,
    reiniciar: false,
    voltar: false,
    mudo: false,
  };

  private boundKeyDown: (e: KeyboardEvent) => void;
  private boundKeyUp: (e: KeyboardEvent) => void;
  private listening: boolean = false;

  /**
   * Teclas alternativas declaradas pelo jogo (ex.: Z e / como flippers).
   * As teclas registradas aqui têm precedência sobre o mapeamento padrão,
   * sem alterar o comportamento dos demais jogos.
   */
  private teclasExtras: Record<string, keyof InputState> = {};
  private codigosExtras = new Set<string>();
  private letrasIgnoradas = new Set<string>();

  constructor() {
    this.boundKeyDown = this.aoPressionarTecla.bind(this);
    this.boundKeyUp = this.aoSoltarTecla.bind(this);
  }

  /** Define o mapa de teclas alternativas do jogo atual. */
  definirTeclasExtras(mapa: Record<string, keyof InputState>): void {
    this.teclasExtras = { ...mapa };
    this.codigosExtras = new Set(Object.keys(mapa));
    this.letrasIgnoradas = new Set<string>();
    for (const codigo of Object.keys(mapa)) {
      // Teclas de letra também chegam como "a"/"A" no evento do teclado.
      if (codigo.startsWith('Key') && codigo.length === 4) {
        const letra = codigo.slice(3).toLowerCase();
        this.letrasIgnoradas.add(letra);
        this.letrasIgnoradas.add(letra.toUpperCase());
      }
    }
  }

  iniciar(): void {
    if (this.listening || typeof window === 'undefined') return;
    window.addEventListener('keydown', this.boundKeyDown, { passive: false });
    window.addEventListener('keyup', this.boundKeyUp, { passive: false });
    this.listening = true;
  }

  parar(): void {
    if (!this.listening || typeof window === 'undefined') return;
    window.removeEventListener('keydown', this.boundKeyDown);
    window.removeEventListener('keyup', this.boundKeyUp);
    this.teclasPressionadas.clear();
    this.touchEstados = {};
    this.listening = false;
    this.teclasExtras = {};
    this.codigosExtras.clear();
  }

  /** Verifica uma tecla do mapeamento padrão (ignorando teclas alternativas). */
  private pressionadaPadrao(code: string): boolean {
    if (this.codigosExtras.has(code)) return false;
    return this.teclasPressionadas.has(code);
  }

  /** Verifica uma letra do mapeamento padrão (ignorando letras alternativas). */
  private pressionadaLetra(letra: string): boolean {
    if (this.letrasIgnoradas.has(letra)) return false;
    return this.teclasPressionadas.has(letra);
  }

  /** Verifica se alguma tecla alternativa está acionando a ação. */
  private extrasAtivas(acao: keyof InputState): boolean {
    for (const codigo of Object.keys(this.teclasExtras)) {
      if (this.teclasExtras[codigo] === acao && this.teclasPressionadas.has(codigo)) {
        return true;
      }
    }
    return false;
  }

  private aoPressionarTecla(e: KeyboardEvent): void {
    const code = e.code;
    const key = e.key;

    // Teclas do jogo que previnem rolagem
    if (
      ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(code) ||
      ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(key)
    ) {
      e.preventDefault();
    }

    this.teclasPressionadas.add(code);
    this.teclasPressionadas.add(key);
  }

  private aoSoltarTecla(e: KeyboardEvent): void {
    this.teclasPressionadas.delete(e.code);
    this.teclasPressionadas.delete(e.key);
  }

  definirTouch(botao: keyof InputState, ativo: boolean): void {
    this.touchEstados[botao] = ativo;
  }

  private lerGamepad(): {
    esquerda: boolean;
    direita: boolean;
    cima: boolean;
    baixo: boolean;
    acao: boolean;
    acao2: boolean;
  } {
    const res = {
      esquerda: false,
      direita: false,
      cima: false,
      baixo: false,
      acao: false,
      acao2: false,
    };

    if (typeof navigator === 'undefined' || !navigator.getGamepads) return res;

    try {
      const gamepads = navigator.getGamepads();
      if (!gamepads) return res;

      for (let i = 0; i < gamepads.length; i++) {
        const gp = gamepads[i];
        if (!gp || !gp.connected) continue;

        // D-Pad standard / axes
        const axisX = gp.axes[0] || 0;
        const axisY = gp.axes[1] || 0;

        const bUp = gp.buttons[12]?.pressed || axisY < -0.4;
        const bDown = gp.buttons[13]?.pressed || axisY > 0.4;
        const bLeft = gp.buttons[14]?.pressed || axisX < -0.4;
        const bRight = gp.buttons[15]?.pressed || axisX > 0.4;

        // Botão A (0) / Botão B (1)
        const bAction = gp.buttons[0]?.pressed || gp.buttons[2]?.pressed || false;
        const bAction2 = gp.buttons[1]?.pressed || gp.buttons[3]?.pressed || false;

        res.cima = res.cima || bUp;
        res.baixo = res.baixo || bDown;
        res.esquerda = res.esquerda || bLeft;
        res.direita = res.direita || bRight;
        res.acao = res.acao || bAction;
        res.acao2 = res.acao2 || bAction2;
      }
    } catch {
      // Ignora erro de acesso a gamepad
    }

    return res;
  }

  obterEstado(): InputState {
    const gp = this.lerGamepad();

    const kLeft =
      this.pressionadaPadrao('ArrowLeft') ||
      this.pressionadaPadrao('KeyA') ||
      this.pressionadaLetra('a') ||
      this.pressionadaLetra('A');

    const kRight =
      this.pressionadaPadrao('ArrowRight') ||
      this.pressionadaPadrao('KeyD') ||
      this.pressionadaLetra('d') ||
      this.pressionadaLetra('D');

    const kUp =
      this.pressionadaPadrao('ArrowUp') ||
      this.pressionadaPadrao('KeyW') ||
      this.pressionadaLetra('w') ||
      this.pressionadaLetra('W');

    const kDown =
      this.pressionadaPadrao('ArrowDown') ||
      this.pressionadaPadrao('KeyS') ||
      this.pressionadaLetra('s') ||
      this.pressionadaLetra('S');

    const kAction =
      this.pressionadaPadrao('Space') ||
      this.teclasPressionadas.has(' ') ||
      this.pressionadaPadrao('KeyZ') ||
      this.pressionadaLetra('z') ||
      this.pressionadaLetra('Z') ||
      this.teclasPressionadas.has('Enter');

    const kAction2 =
      this.pressionadaPadrao('ShiftLeft') ||
      this.pressionadaPadrao('ShiftRight') ||
      this.pressionadaPadrao('KeyX') ||
      this.pressionadaLetra('x') ||
      this.pressionadaLetra('X');

    const kPause =
      this.pressionadaPadrao('KeyP') ||
      this.pressionadaLetra('p') ||
      this.pressionadaLetra('P');

    const kReset =
      this.pressionadaPadrao('KeyR') ||
      this.pressionadaLetra('r') ||
      this.pressionadaLetra('R');

    const kVoltar =
      this.pressionadaPadrao('Escape') ||
      this.teclasPressionadas.has('Esc');

    const kMudo =
      this.pressionadaPadrao('KeyM') ||
      this.pressionadaLetra('m') ||
      this.pressionadaLetra('M');

    const esquerda =
      kLeft ||
      this.extrasAtivas('esquerda') ||
      !!this.touchEstados.esquerda ||
      gp.esquerda;
    const direita =
      kRight ||
      this.extrasAtivas('direita') ||
      !!this.touchEstados.direita ||
      gp.direita;
    const cima = kUp || !!this.touchEstados.cima || gp.cima;
    const baixo = kDown || !!this.touchEstados.baixo || gp.baixo;
    const acao =
      kAction ||
      this.extrasAtivas('acao') ||
      !!this.touchEstados.acao ||
      gp.acao;
    const acao2 =
      kAction2 ||
      this.extrasAtivas('acao2') ||
      !!this.touchEstados.acao2 ||
      gp.acao2;
    const pausa = kPause || !!this.touchEstados.pausarPressionado;
    const reiniciar = kReset || !!this.touchEstados.reiniciarPressionado;
    const voltar = kVoltar;
    const mudo = kMudo;

    // Detecção de borda de subida (just pressed)
    const acaoPressionada = acao && !this.estadosAnteriores.acao;
    const acao2Pressionada = acao2 && !this.estadosAnteriores.acao2;
    const cimaPressionada = cima && !this.estadosAnteriores.cima;
    const baixoPressionada = baixo && !this.estadosAnteriores.baixo;
    const esquerdaPressionada = esquerda && !this.estadosAnteriores.esquerda;
    const direitaPressionada = direita && !this.estadosAnteriores.direita;
    const pausarPressionado = pausa && !this.estadosAnteriores.pausa;
    const reiniciarPressionado = reiniciar && !this.estadosAnteriores.reiniciar;
    const voltarPressionado = voltar && !this.estadosAnteriores.voltar;
    const mudoPressionado = mudo && !this.estadosAnteriores.mudo;

    // Salvar estado atual para o próximo frame
    this.estadosAnteriores = {
      acao,
      acao2,
      cima,
      baixo,
      esquerda,
      direita,
      pausa,
      reiniciar,
      voltar,
      mudo,
    };

    return {
      esquerda,
      direita,
      cima,
      baixo,
      acao,
      acao2,
      acaoPressionada,
      acao2Pressionada,
      cimaPressionada,
      baixoPressionada,
      esquerdaPressionada,
      direitaPressionada,
      pausarPressionado,
      reiniciarPressionado,
      voltarPressionado,
      mudoPressionado,
    };
  }

  limpar(): void {
    this.teclasPressionadas.clear();
    this.touchEstados = {};
    this.estadosAnteriores = {
      acao: false,
      acao2: false,
      cima: false,
      baixo: false,
      esquerda: false,
      direita: false,
      pausa: false,
      reiniciar: false,
      voltar: false,
      mudo: false,
    };
  }
}
