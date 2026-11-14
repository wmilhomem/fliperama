/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * CENAS — ABERTURA, RAPTOS ENTRE TELAS E FINAL DE CICLO
 *
 * Cenas curtas, puláveis com a ação. Estado próprio, sem dependência do
 * gameplay das telas. As cenas vistas são lembradas para que "Pular"
 * apareça imediatamente em partidas seguintes.
 */

import {
  desenharGrotao,
  desenharHannah,
  desenharZeca,
} from './personagens';

export type TipoCena = 'abertura' | 'rapto' | 'final';

const CENA_KEY = 'hannahCenasVistasV1';

let _cenasVistasCache: boolean | null = null;

export function cenasVistas(): boolean {
  if (_cenasVistasCache !== null) return _cenasVistasCache;
  try {
    _cenasVistasCache = localStorage.getItem(CENA_KEY) === '1';
  } catch {
    _cenasVistasCache = false;
  }
  return _cenasVistasCache;
}

export function marcarCenaVista(): void {
  try {
    localStorage.setItem(CENA_KEY, '1');
  } catch {
    // ignora
  }
}

export interface Cena {
  tipo: TipoCena;
  /** Altura exibida no rapto e no final (metros). */
  alturaMetros: number;
  /** Ciclo exibido no final. */
  ciclo: number;
}

export class MotorDeCenas {
  private cena: Cena | null = null;
  private tempo = 0;
  private frame = 0;
  private tremor = 0;
  private partesQueda: { x: number; y: number; vy: number; rot: number; vr: number; w: number; h: number }[] = [];
  private concluida = false;

  iniciar(cena: Cena) {
    this.cena = cena;
    this.tempo = 0;
    this.frame = 0;
    this.tremor = 0;
    this.concluida = false;
    this.partesQueda = [];
    if (cena.tipo === 'final') {
      // Desabamento: peças de viga caindo
      for (let i = 0; i < 7; i++) {
        this.partesQueda.push({
          x: 60 + i * 60 + Math.random() * 24,
          y: 120 + Math.random() * 200,
          vy: 0,
          rot: 0,
          vr: (Math.random() - 0.5) * 1.6,
          w: 34 + Math.random() * 22,
          h: 10,
        });
      }
    }
  }

  /** Atualiza; devolve true quando a cena terminou (ou foi pulada). */
  atualizar(dt: number, pularPressionado: boolean): boolean {
    if (!this.cena) return true;
    this.tempo += dt;
    this.frame += dt * 60;

    if (this.cena.tipo === 'final') {
      this.tremor = Math.max(0, this.tremor - dt);
      for (const parte of this.partesQueda) {
        parte.vy += 500 * dt;
        parte.y += parte.vy * dt;
        parte.rot += parte.vr * dt;
      }
    }

    const duracao = this.cena.tipo === 'abertura' ? 6 : this.cena.tipo === 'rapto' ? 3 : 6.5;
    if (pularPressionado) {
      marcarCenaVista();
      return true;
    }
    if (this.tempo >= duracao) {
      marcarCenaVista();
      return true;
    }
    return false;
  }

  /** Desenha a cena atual. */
  desenhar(g: CanvasRenderingContext2D, largura: number, altura: number) {
    if (!this.cena) return;
    const t = this.tempo;
    const vista = cenasVistas();

    // Céu e fundo
    const grad = g.createLinearGradient(0, 0, 0, altura);
    grad.addColorStop(0, '#1E3A5F');
    grad.addColorStop(0.55, '#3B5F8A');
    grad.addColorStop(1, '#7A5A3A');
    g.fillStyle = grad;
    g.fillRect(0, 0, largura, altura);
    // Sol baixo
    g.fillStyle = '#FBBF24';
    g.beginPath();
    g.arc(largura - 70, novanta(t), 26, 0, Math.PI * 2);
    g.fill();

    g.save();
    if (this.tremor > 0) {
      g.translate((Math.random() - 0.5) * 6 * this.tremor, (Math.random() - 0.5) * 6 * this.tremor);
    }

    if (this.cena.tipo === 'abertura') this.desenharAbertura(g, largura, altura, t);
    else if (this.cena.tipo === 'rapto') this.desenharRapto(g, largura, altura, t);
    else this.desenharFinal(g, largura, altura, t);

    g.restore();

    // "Pular" (aparece imediatamente se a cena já foi vista antes)
    if (vista || t > 0.8) {
      g.fillStyle = 'rgba(255,255,255,0.85)';
      g.font = '10px "Press Start 2P", monospace';
      g.textAlign = 'center';
      g.fillText('PULAR ▸', largura - 62, altura - 18);
    }
  }

  private desenharEstruturaSilhueta(
    g: CanvasRenderingContext2D,
    cx: number,
    baseY: number,
    andares: number,
    inclinar: number
  ) {
    g.strokeStyle = '#4B5563';
    g.lineWidth = 5;
    // Colunas
    g.beginPath();
    g.moveTo(cx - 60, baseY);
    g.lineTo(cx - 60 + inclinar, baseY - andares * 34);
    g.moveTo(cx + 60, baseY);
    g.lineTo(cx + 60 + inclinar, baseY - andares * 34);
    g.stroke();
    // Vigas horizontais
    for (let i = 0; i <= andares; i++) {
      const y = baseY - i * 34;
      const desvio = (i / andares) * inclinar;
      g.beginPath();
      g.moveTo(cx - 64 + desvio, y);
      g.lineTo(cx + 64 + desvio, y);
      g.stroke();
    }
    // X entrevigais
    g.lineWidth = 2;
    for (let i = 0; i < andares; i++) {
      const y1 = baseY - i * 34;
      const y2 = baseY - (i + 1) * 34;
      const d1 = (i / andares) * inclinar;
      const d2 = ((i + 1) / andares) * inclinar;
      g.beginPath();
      g.moveTo(cx - 60 + d1, y1);
      g.lineTo(cx + 60 + d2, y2);
      g.moveTo(cx + 60 + d1, y1);
      g.lineTo(cx - 60 + d2, y2);
      g.stroke();
    }
  }

  private desenharAbertura(
    g: CanvasRenderingContext2D,
    largura: number,
    altura: number,
    t: number
  ) {
    const andares = 5;
    const inclinar = Math.max(0, (t - 3.6) * 14);

    // Estrutura ao fundo
    this.desenharEstruturaSilhueta(g, largura / 2, altura - 40, andares, inclinar);

    // Fase do Grotão subindo com a Hannah (0..1 sobe, depois bate o pé)
    const subida = Math.min(1, t / 3.4);
    const gemido = Math.max(0, t - 3.4);
    this.tremor = gemido > 0 && gemido < 0.7 ? 1 : 0;

    const gx = largura / 2;
    const gy = altura - 40 - subida * (andares * 34);
    desenharGrotao(g, gx - 10, gy, 1, this.frame, false);
    desenharHannah(g, gx + 12, gy + 2, this.frame, true);

    // Zeca embaixo olhando para cima
    if (t > 2.2) {
      desenharZeca(g, largura / 2 - 40, altura - 40, 1, Math.floor(this.frame / 6), false);
    }

    g.fillStyle = '#FDE68A';
    g.font = '8px "Press Start 2P", monospace';
    g.textAlign = 'center';
    g.fillText('UM DIA DE TRABALHO...', largura / 2, 30);
  }

  private desenharRapto(
    g: CanvasRenderingContext2D,
    largura: number,
    altura: number,
    t: number
  ) {
    // Estrutura ao fundo
    this.desenharEstruturaSilhueta(g, largura / 2, altura - 30, 4, 10);

    const subir = Math.min(1, t / 2.2);
    // Zeca e Hannah juntos no começo; Grotão agarra e sobe
    const faseCoracao = t < 1.0;

    if (faseCoracao) {
      desenharZeca(g, largura / 2 - 22, altura - 60, 1, Math.floor(this.frame / 6), false);
      desenharHannah(g, largura / 2 + 10, altura - 58, this.frame, true);
      // Coração flutuando
      const pulso = 1 + Math.sin(t * 6) * 0.15;
      g.save();
      g.translate(largura / 2 - 6, altura - 100);
      g.scale(pulso, pulso);
      g.fillStyle = '#EF4444';
      g.beginPath();
      g.arc(-4, 0, 5, Math.PI, 0);
      g.arc(4, 0, 5, Math.PI, 0);
      g.lineTo(0, 8);
      g.closePath();
      g.fill();
      g.restore();
    } else {
      // Grotão levando a Hannah para cima
      const gy = altura - 40 - subir * (altura - 110);
      desenharGrotao(g, largura / 2 - 8, gy, 1, this.frame, false);
      desenharHannah(g, largura / 2 + 14, gy + 2, this.frame, true);
    }

    // Altura exibida
    g.fillStyle = '#F8FAFC';
    g.font = '16px "Press Start 2P", monospace';
    g.textAlign = 'center';
    g.fillText(`${this.cena!.alturaMetros} m`, largura / 2, 42);
    g.font = '7px "Press Start 2P", monospace';
    g.fillStyle = '#FDE68A';
    g.fillText('O GROTÃO LEVOU A HANNAH DE NOVO...', largura / 2, 62);
  }

  private desenharFinal(
    g: CanvasRenderingContext2D,
    largura: number,
    altura: number,
    t: number
  ) {
    const baseY = altura - 30;

    // Estrutura desabando (as peças caem)
    if (t < 2.6) {
      this.desenharEstruturaSilhueta(g, largura / 2, baseY, 5, -10);
      for (const parte of this.partesQueda) {
        g.save();
        g.translate(parte.x, Math.min(parte.y, baseY - 6));
        g.rotate(parte.rot);
        g.fillStyle = '#4B5563';
        g.fillRect(-parte.w / 2, -parte.h / 2, parte.w, parte.h);
        g.restore();
      }
    } else {
      // Escombros
      g.fillStyle = '#374151';
      g.beginPath();
      g.moveTo(0, baseY);
      g.lineTo(80, baseY - 26);
      g.lineTo(150, baseY - 10);
      g.lineTo(230, baseY - 34);
      g.lineTo(310, baseY - 12);
      g.lineTo(400, baseY - 24);
      g.lineTo(largura, baseY);
      g.closePath();
      g.fill();
    }

    // Grotão caído com estrelas (sem violência)
    if (t > 1.6) {
      g.save();
      g.translate(largura / 2 + 60, baseY - 8);
      g.rotate(-0.5);
      desenharGrotao(g, 0, 0, 1, 0, true);
      g.restore();
      // Estrelinhas
      g.fillStyle = '#FDE68A';
      for (let i = 0; i < 3; i++) {
        const ang = t * 2 + (i * Math.PI * 2) / 3;
        const sx = largura / 2 + 60 + Math.cos(ang) * 24;
        const sy = baseY - 40 + Math.sin(ang) * 8;
        desenharEstrela(g, sx, sy, 4);
      }
    }

    // Zeca e Hannah sob um coração grande
    if (t > 2.4) {
      desenharZeca(g, largura / 2 - 26, baseY - 2, 1, Math.floor(this.frame / 6), false);
      desenharHannah(g, largura / 2 + 16, baseY - 2, this.frame, true);
      const pulso = 1 + Math.sin((t - 2.4) * 5) * 0.12;
      g.save();
      g.translate(largura / 2 - 5, baseY - 54);
      g.scale(pulso, pulso);
      g.fillStyle = '#EF4444';
      g.beginPath();
      g.arc(-8, 0, 10, Math.PI, 0);
      g.arc(8, 0, 10, Math.PI, 0);
      g.lineTo(0, 16);
      g.closePath();
      g.fill();
      g.restore();
    }

    if (t > 3.2) {
      g.fillStyle = '#FDE68A';
      g.font = '14px "Press Start 2P", monospace';
      g.textAlign = 'center';
      g.fillText('PARABÉNS!', largura / 2, 66);
    }
    if (t > 4.2) {
      g.fillStyle = '#F8FAFC';
      g.font = '10px "Press Start 2P", monospace';
      g.fillText(`CICLO ${this.cena!.ciclo + 1}`, largura / 2, 92);
    }
  }
}

function novanta(x: number) {
  return 90 - Math.min(1, x / 6) * 30;
}

function desenharEstrela(
  g: CanvasRenderingContext2D,
  x: number,
  y: number,
  raio: number
) {
  g.beginPath();
  for (let i = 0; i < 5; i++) {
    const ang = (i * 4 * Math.PI) / 5 - Math.PI / 2;
    const px = x + Math.cos(ang) * raio;
    const py = y + Math.sin(ang) * raio;
    if (i === 0) g.moveTo(px, py);
    else g.lineTo(px, py);
  }
  g.closePath();
  g.fill();
}
