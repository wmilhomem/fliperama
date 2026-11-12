/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Nave, Tiro } from './tipos';
import { aplicarWrap } from './vetor';

export const MAX_TIROS_JOGADOR = 4;
export const VIDA_TIRO = 1.0;

let proximoId = 1;

export function criarTiroJogador(nave: Nave, desvioAngulo = 0): Tiro {
  const angulo = nave.angulo + desvioAngulo;
  const cos = Math.cos(angulo);
  const sin = Math.sin(angulo);

  return {
    id: proximoId++,
    x: nave.x + cos * 11,
    y: nave.y + sin * 11,
    vx: cos * 285 + nave.vx * 0.2,
    vy: sin * 285 + nave.vy * 0.2,
    raio: 2,
    vida: VIDA_TIRO,
    maxVida: VIDA_TIRO,
    origem: 'jogador',
  };
}

export function criarTiroPirata(
  x: number,
  y: number,
  angulo: number,
  velocidade: number
): Tiro {
  return {
    id: proximoId++,
    x,
    y,
    vx: Math.cos(angulo) * velocidade,
    vy: Math.sin(angulo) * velocidade,
    raio: 2.5,
    vida: 3.5,
    maxVida: 3.5,
    origem: 'pirata',
  };
}

export function atualizarTiros(
  tiros: Tiro[],
  dt: number,
  largura: number,
  altura: number
): Tiro[] {
  for (const tiro of tiros) {
    tiro.vida -= dt;
    tiro.x += tiro.vx * dt;
    tiro.y += tiro.vy * dt;

    const posicao = aplicarWrap(tiro.x, tiro.y, tiro.raio, largura, altura);
    tiro.x = posicao.x;
    tiro.y = posicao.y;
  }

  return tiros.filter((tiro) => tiro.vida > 0);
}
