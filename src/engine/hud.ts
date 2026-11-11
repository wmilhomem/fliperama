/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { HUDService, HUDState } from './types';

export interface FloatingText {
  x: number;
  y: number;
  texto: string;
  cor: string;
  vida: number; // 0.0 a 1.0
}

export class StandardHUDManager implements HUDService {
  private estado: HUDState = {
    pontuacao: 0,
    recorde: 0,
    vidas: 3,
    fase: 1,
    bonus: 5000,
    vidasMax: 5,
  };

  private textosFlutuantes: FloatingText[] = [];

  constructor(estadoInicial?: Partial<HUDState>) {
    if (estadoInicial) {
      this.definirEstado(estadoInicial);
    }
  }

  definirEstado(novo: Partial<HUDState>): void {
    if (novo.pontuacao !== undefined) {
      this.estado.pontuacao = Math.floor(novo.pontuacao);
    }
    if (novo.recorde !== undefined) {
      this.estado.recorde = Math.floor(novo.recorde);
    }
    if (novo.vidas !== undefined) {
      this.estado.vidas = Math.max(0, Math.floor(novo.vidas));
    }
    if (novo.fase !== undefined) {
      this.estado.fase = Math.max(1, Math.floor(novo.fase));
    }
    if (novo.bonus !== undefined) {
      this.estado.bonus = Math.max(0, Math.floor(novo.bonus));
    }
    if (novo.tituloFase !== undefined) {
      this.estado.tituloFase = novo.tituloFase;
    }
    if (novo.statusTexto !== undefined) {
      this.estado.statusTexto = novo.statusTexto;
    }
    if (novo.vidasMax !== undefined) {
      this.estado.vidasMax = novo.vidasMax;
    }
  }

  obterEstado(): HUDState {
    return {
      ...this.estado,
      pontuacao: Math.floor(this.estado.pontuacao),
      recorde: Math.floor(this.estado.recorde),
      bonus: this.estado.bonus !== undefined ? Math.floor(this.estado.bonus) : undefined,
    };
  }

  adicionarPontos(pts: number, x?: number, y?: number, cor = '#FACC15'): void {
    const intPts = Math.floor(pts);
    this.estado.pontuacao = Math.floor(this.estado.pontuacao) + intPts;
    if (this.estado.pontuacao > this.estado.recorde) {
      this.estado.recorde = this.estado.pontuacao;
    }

    if (x !== undefined && y !== undefined) {
      this.textosFlutuantes.push({
        x,
        y,
        texto: `+${intPts}`,
        cor,
        vida: 1.0,
      });
    }
  }

  perderVida(): number {
    this.estado.vidas = Math.max(0, this.estado.vidas - 1);
    return this.estado.vidas;
  }

  ganharVida(): number {
    const max = this.estado.vidasMax ?? 5;
    this.estado.vidas = Math.min(max, this.estado.vidas + 1);
    return this.estado.vidas;
  }

  definirFase(fase: number): void {
    this.estado.fase = Math.max(1, Math.floor(fase));
  }

  proximaFase(): number {
    this.estado.fase += 1;
    return this.estado.fase;
  }

  definirBonus(bonus: number): void {
    this.estado.bonus = Math.max(0, Math.floor(bonus));
  }

  subtrairBonus(delta: number): number {
    if (this.estado.bonus === undefined) return 0;
    this.estado.bonus = Math.max(0, Math.floor(this.estado.bonus - delta));
    return this.estado.bonus;
  }

  atualizarTextosFlutuantes(dt: number): void {
    for (let i = this.textosFlutuantes.length - 1; i >= 0; i--) {
      const tf = this.textosFlutuantes[i];
      tf.y -= 25 * dt;
      tf.vida -= dt * 1.4;
      if (tf.vida <= 0) {
        this.textosFlutuantes.splice(i, 1);
      }
    }
  }

  desenharHUD(g: CanvasRenderingContext2D, largura: number, altura: number): void {
    g.save();
    g.font = '9px "Press Start 2P", monospace';

    // 1UP e Pontuação (Sempre inteiro com 6 dígitos)
    g.fillStyle = '#EF4444';
    g.textAlign = 'left';
    g.fillText('1UP', 18, 18);
    g.fillStyle = '#FFFFFF';
    const scoreStr = Math.floor(this.estado.pontuacao).toString().padStart(6, '0');
    g.fillText(scoreStr, 18, 31);

    // RECORDE
    g.fillStyle = '#EF4444';
    g.textAlign = 'center';
    g.fillText('RECORDE', largura / 2, 18);
    g.fillStyle = '#FFFFFF';
    const recordStr = Math.floor(this.estado.recorde).toString().padStart(6, '0');
    g.fillText(recordStr, largura / 2, 31);

    // BÔNUS (se houver)
    if (this.estado.bonus !== undefined) {
      g.fillStyle = '#06B6D4';
      g.textAlign = 'right';
      g.fillText('BÔNUS', largura - 18, 18);
      g.fillStyle = '#FACC15';
      const bonusStr = Math.floor(this.estado.bonus).toString().padStart(4, '0');
      g.fillText(bonusStr, largura - 18, 31);
    }

    // FASE
    g.fillStyle = '#22D3EE';
    g.font = '8px "Press Start 2P", monospace';
    g.textAlign = 'left';
    g.fillText(`FASE ${this.estado.fase}`, 18, 47);

    // Vidas (ícones retrô)
    const totalVidas = this.estado.vidas;
    const itemW = 8;
    const itemH = 8;
    for (let i = 0; i < totalVidas; i++) {
      const vx = largura - 22 - i * 14;
      const vy = 41;
      g.fillStyle = '#EF4444';
      // Mini coração retrô
      g.fillRect(vx + 1, vy, 2, 2);
      g.fillRect(vx + 5, vy, 2, 2);
      g.fillRect(vx, vy + 2, 8, 3);
      g.fillRect(vx + 1, vy + 5, 6, 2);
      g.fillRect(vx + 3, vy + 7, 2, 1);
    }

    // Textos flutuantes
    for (const tf of this.textosFlutuantes) {
      g.save();
      g.globalAlpha = Math.max(0, Math.min(1, tf.vida));
      g.fillStyle = tf.cor;
      g.font = '8px "Press Start 2P", monospace';
      g.textAlign = 'center';
      g.fillText(tf.texto, tf.x, tf.y);
      g.restore();
    }

    g.restore();
  }

  desenharTelaPausa(g: CanvasRenderingContext2D, largura: number, altura: number): void {
    g.save();
    g.fillStyle = 'rgba(3, 7, 18, 0.78)';
    g.fillRect(0, 0, largura, altura);

    g.textAlign = 'center';
    g.font = '16px "Press Start 2P", monospace';
    g.fillStyle = '#FACC15';
    g.fillText('PAUSADO', largura / 2, altura / 2 - 20);

    g.font = '8px "Press Start 2P", monospace';
    g.fillStyle = '#FFFFFF';
    g.fillText('PRESSIONE P OU TOQUE', largura / 2, altura / 2 + 10);
    g.fillText('PARA CONTINUAR', largura / 2, altura / 2 + 25);

    g.fillStyle = '#94A3B8';
    g.font = '7px "Press Start 2P", monospace';
    g.fillText('R: REINICIAR · ESC: HUB', largura / 2, altura / 2 + 55);

    g.restore();
  }

  desenharGameOver(
    g: CanvasRenderingContext2D,
    largura: number,
    altura: number,
    aoPressionarReiniciar?: string
  ): void {
    g.save();
    g.fillStyle = 'rgba(3, 7, 18, 0.85)';
    g.fillRect(0, 0, largura, altura);

    g.textAlign = 'center';
    g.font = '22px "Press Start 2P", monospace';
    g.fillStyle = '#EF4444';
    g.fillText('GAME OVER', largura / 2, altura / 2 - 40);

    g.font = '9px "Press Start 2P", monospace';
    g.fillStyle = '#FFFFFF';
    g.fillText(`PONTUAÇÃO: ${Math.floor(this.estado.pontuacao)}`, largura / 2, altura / 2 + 5);
    g.fillText(`RECORDE: ${Math.floor(this.estado.recorde)}`, largura / 2, altura / 2 + 25);

    const time = performance.now() / 300;
    if (Math.sin(time * 3) > 0) {
      g.fillStyle = '#FACC15';
      g.fillText(aoPressionarReiniciar || 'PRESSIONE ENTER / TOQUE', largura / 2, altura / 2 + 75);
    }

    g.restore();
  }

  desenharVitoria(
    g: CanvasRenderingContext2D,
    largura: number,
    altura: number,
    mensagem: string,
    bonusObtido = 0
  ): void {
    g.save();
    g.fillStyle = 'rgba(3, 7, 18, 0.8)';
    g.fillRect(0, 0, largura, altura);

    g.textAlign = 'center';
    g.font = '18px "Press Start 2P", monospace';
    g.fillStyle = '#10B981';
    g.fillText(mensagem, largura / 2, altura / 2 - 45);

    g.font = '9px "Press Start 2P", monospace';
    g.fillStyle = '#FFFFFF';
    g.fillText(`FASE ${this.estado.fase} CONCLUÍDA!`, largura / 2, altura / 2 - 10);

    if (bonusObtido > 0) {
      g.fillStyle = '#FACC15';
      g.fillText(`BÔNUS OBTIDO: +${Math.floor(bonusObtido)}`, largura / 2, altura / 2 + 15);
    }

    const time = performance.now() / 300;
    if (Math.sin(time * 3) > 0) {
      g.fillStyle = '#22D3EE';
      g.fillText('PRESSIONE ENTER / TOQUE', largura / 2, altura / 2 + 65);
    }

    g.restore();
  }
}
