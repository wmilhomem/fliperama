/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Canhão da Sentinela (jogador) de "Invasores Cósmicos 84".
 *
 * Move-se só na horizontal, com velocidade constante, e fica preso nas bordas.
 */

import {
  CANHAO_ALTURA,
  CANHAO_LARGURA,
  CANHAO_VELOCIDADE,
  CANHAO_Y,
  LARGURA,
  PALETA,
  TIRO_ALTURA,
  TIRO_LARGURA,
  TIRO_VELOCIDADE,
} from './constantes';

export interface Canhao {
  x: number;
  y: number;
  largura: number;
  altura: number;
  velocidade: number;
  /** Tiro em voo (apenas 1 por vez). */
  tiro: Tiro | null;
  /** Tempo de espera para reaparecer após ser atingido. */
  tempoOculto: number;
  /** Animação de recarga. */
  animacao: number;
}

export interface Tiro {
  x: number;
  y: number;
  largura: number;
  altura: number;
  vy: number;
}

export function criarCanhao(): Canhao {
  return {
    x: (LARGURA - CANHAO_LARGURA) / 2,
    y: CANHAO_Y,
    largura: CANHAO_LARGURA,
    altura: CANHAO_ALTURA,
    velocidade: CANHAO_VELOCIDADE,
    tiro: null,
    tempoOculto: 0,
    animacao: 0,
  };
}

/** Atualiza a posição do canhão e o tiro em voo. */
export function atualizarCanhao(
  canhao: Canhao,
  moverEsquerda: boolean,
  moverDireita: boolean,
  dt: number
): void {
  canhao.animacao += dt;

  if (canhao.tempoOculto > 0) {
    canhao.tempoOculto = Math.max(0, canhao.tempoOculto - dt);
    return;
  }

  let direcao = 0;
  if (moverEsquerda) direcao -= 1;
  if (moverDireita) direcao += 1;

  if (direcao !== 0) {
    canhao.x += direcao * canhao.velocidade * dt;
  }

  // Fica preso nas bordas
  if (canhao.x < 0) canhao.x = 0;
  if (canhao.x + canhao.largura > LARGURA) canhao.x = LARGURA - canhao.largura;

  if (canhao.tiro) {
    canhao.tiro.y += canhao.tiro.vy * dt;
    if (canhao.tiro.y + canhao.tiro.altura < 0) {
      canhao.tiro = null;
    }
  }
}

/** Dispara um tiro (apenas 1 por vez). */
export function atirar(canhao: Canhao): boolean {
  if (canhao.tiro || canhao.tempoOculto > 0) return false;
  canhao.tiro = {
    x: canhao.x + canhao.largura / 2 - TIRO_LARGURA / 2,
    y: canhao.y - TIRO_ALTURA,
    largura: TIRO_LARGURA,
    altura: TIRO_ALTURA,
    vy: -TIRO_VELOCIDADE,
  };
  return true;
}

/** Retângulo de colisão do canhão. */
export function caixaCanhao(canhao: Canhao): {
  x: number;
  y: number;
  largura: number;
  altura: number;
} {
  return { x: canhao.x, y: canhao.y, largura: canhao.largura, altura: canhao.altura };
}

/** Desenha o canhão da Sentinela (32x16) com luz de sinalização. */
export function desenharCanhao(g: CanvasRenderingContext2D, canhao: Canhao, tempo: number): void {
  if (canhao.tempoOculto > 0) return;

  const x = Math.round(canhao.x);
  const y = Math.round(canhao.y);

  g.save();

  // Base metálica
  g.fillStyle = PALETA.metalEscuro;
  g.fillRect(x, y + 10, canhao.largura, 6);
  g.fillStyle = PALETA.metal;
  g.fillRect(x + 2, y + 10, canhao.largura - 4, 3);

  // Corpo do canhão
  g.fillStyle = PALETA.metalClaro;
  g.fillRect(x + 8, y + 4, 16, 8);
  g.fillStyle = PALETA.metal;
  g.fillRect(x + 12, y, 8, 6);

  // Boca do canhão (brilho fósforo)
  g.fillStyle = PALETA.fosforo;
  g.fillRect(x + 13, y - 2, 6, 4);

  // Luz de sinalização piscando
  const pisca = Math.floor(tempo * 6) % 2 === 0;
  g.fillStyle = pisca ? PALETA.fosforoClaro : PALETA.fosforoEscuro;
  g.fillRect(x + 3, y + 12, 3, 3);
  g.fillRect(x + canhao.largura - 6, y + 12, 3, 3);

  g.restore();
}

/** Desenha o tiro do canhão. */
export function desenharTiro(g: CanvasRenderingContext2D, canhao: Canhao): void {
  const t = canhao.tiro;
  if (!t) return;
  g.save();
  g.fillStyle = PALETA.fosforoClaro;
  g.fillRect(Math.round(t.x), Math.round(t.y), t.largura, t.altura);
  g.globalAlpha = 0.4;
  g.fillStyle = PALETA.fosforo;
  g.fillRect(Math.round(t.x) - 2, Math.round(t.y), t.largura + 4, t.altura);
  g.restore();
}
