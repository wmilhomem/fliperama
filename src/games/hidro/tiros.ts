/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ALTURA_MUNDO, LARGURA_MUNDO, VELOCIDADE_TIRO } from './constantes';
import { Nave, Tiro } from './tipos';

export function criarTiroJogador(nave: Nave, id: number): Tiro {
  return {
    id,
    x: nave.x,
    y: nave.y - 12,
    vx: 0,
    vy: -VELOCIDADE_TIRO,
    raio: 2.4,
    origem: 'jogador',
    dano: 10,
    vida: 2.5,
  };
}

export function criarTiroInimigo(
  x: number,
  y: number,
  angulo: number,
  velocidade: number,
  id: number
): Tiro {
  return {
    id,
    x,
    y,
    vx: Math.cos(angulo) * velocidade,
    vy: Math.sin(angulo) * velocidade,
    raio: 2.5,
    origem: 'inimigo',
    dano: 1,
    vida: 5,
  };
}

export function atualizarTiros(tiros: Tiro[], dt: number): Tiro[] {
  return tiros.filter((tiro) => {
    tiro.x += tiro.vx * dt;
    tiro.y += tiro.vy * dt;
    tiro.vida -= dt;

    return (
      tiro.vida > 0 &&
      tiro.y > -20 &&
      tiro.y < ALTURA_MUNDO + 20 &&
      tiro.x > -20 &&
      tiro.x < LARGURA_MUNDO + 20
    );
  });
}
