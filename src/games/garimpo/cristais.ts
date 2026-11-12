/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Cristal } from './tipos';
import { aleatorio, aplicarWrap } from './vetor';

export const VIDA_CRISTAL = 6.0;

let proximoId = 1;

export function criarCristal(x: number, y: number): Cristal {
  return {
    id: proximoId++,
    x,
    y,
    vx: aleatorio(-12, 12),
    vy: aleatorio(-12, 12),
    raio: 5,
    vida: VIDA_CRISTAL,
    maxVida: VIDA_CRISTAL,
  };
}

export function atualizarCristais(
  cristais: Cristal[],
  dt: number,
  largura: number,
  altura: number
): Cristal[] {
  for (const cristal of cristais) {
    cristal.vida -= dt;
    cristal.x += cristal.vx * dt;
    cristal.y += cristal.vy * dt;

    const posicao = aplicarWrap(cristal.x, cristal.y, cristal.raio, largura, altura);
    cristal.x = posicao.x;
    cristal.y = posicao.y;
  }

  return cristais.filter((cristal) => cristal.vida > 0);
}
