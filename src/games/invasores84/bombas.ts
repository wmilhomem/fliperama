/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Bombas dos invasores de "Invasores Cósmicos 84".
 *
 * Dois tipos: reta e ondulante (zigue-zague). No máximo 3 na tela.
 */

import {
  BOMBA_ALTURA,
  BOMBA_LARGURA,
  BOMBA_VELOCIDADE,
  BOMBAS_MAXIMAS,
  LARGURA,
  PALETA,
} from './constantes';

export type TipoBomba = 'reta' | 'ondulante';

export interface Bomba {
  x: number;
  y: number;
  largura: number;
  altura: number;
  vy: number;
  tipo: TipoBomba;
  /** Fase da ondulação. */
  fase: number;
  /** Deslocamento horizontal acumulado. */
  deriva: number;
}

export function criarBombas(): Bomba[] {
  return [];
}

/** Cria uma bomba. */
export function criarBomba(x: number, y: number, tipo: TipoBomba): Bomba {
  return {
    x,
    y,
    largura: BOMBA_LARGURA,
    altura: BOMBA_ALTURA,
    vy: BOMBA_VELOCIDADE,
    tipo,
    fase: Math.random() * Math.PI * 2,
    deriva: 0,
  };
}

/** Atualiza as bombas (as ondulantes serpenteiam). */
export function atualizarBombas(bombas: Bomba[], dt: number): void {
  for (let i = bombas.length - 1; i >= 0; i--) {
    const b = bombas[i];
    b.y += b.vy * dt;

    if (b.tipo === 'ondulante') {
      b.fase += dt * 9;
      b.deriva += Math.sin(b.fase) * 70 * dt;
      b.x += b.deriva * dt * 6;
      b.deriva *= 0.94;
    }

    if (b.y > 560 || b.x < -20 || b.x > LARGURA + 20) {
      bombas.splice(i, 1);
    }
  }
}

/** Limita a quantidade de bombas simultâneas. */
export function limitarBombas(bombas: Bomba[]): void {
  while (bombas.length > BOMBAS_MAXIMAS) {
    bombas.shift();
  }
}

/** Retângulo de colisão da bomba. */
export function caixaBomba(b: Bomba): {
  x: number;
  y: number;
  largura: number;
  altura: number;
} {
  return { x: b.x, y: b.y, largura: b.largura, altura: b.altura };
}

/** Desenha uma bomba (reta ou zigue-zague). */
export function desenharBomba(g: CanvasRenderingContext2D, b: Bomba): void {
  g.save();
  const x = Math.round(b.x);
  const y = Math.round(b.y);
  g.fillStyle = PALETA.fosforo;
  g.fillRect(x, y, b.largura, b.altura);
  g.fillStyle = PALETA.fosforoClaro;
  g.fillRect(x + 2, y, 4, 4);
  g.fillStyle = PALETA.fosforoEscuro;
  g.fillRect(x, y + 10, b.largura, 6);
  g.restore();
}
