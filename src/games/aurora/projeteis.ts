/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SpriteUtils } from '../../engine/types';
import { desenharOrbe, desenharTiro } from './arte';
import { ALTURA, HUD_ALTURA, MAX_ORBES, VELOCIDADE_TIRO } from './constantes';
import { Canhao, Orbe, TiroJogador } from './tipos';

export function criarTiro(canhao: Canhao): TiroJogador {
  return {
    x: canhao.x,
    y: canhao.y - 2,
    vy: -VELOCIDADE_TIRO,
  };
}

export function atualizarTiro(tiro: TiroJogador, dt: number): boolean {
  tiro.y += tiro.vy * dt;
  return tiro.y < HUD_ALTURA - 24;
}

export function desenharTiroJogador(
  g: CanvasRenderingContext2D,
  sprites: SpriteUtils,
  tiro: TiroJogador
): void {
  desenharTiro(g, sprites, tiro);
}

export function criarOrbe(
  orbes: Orbe[],
  x: number,
  y: number,
  alvoX: number,
  alvoY: number,
  velocidade: number,
  cor = '#c4b5fd'
): void {
  if (orbes.length >= MAX_ORBES) return;

  const dx = alvoX - x;
  const dy = alvoY - y;
  const distancia = Math.hypot(dx, dy) || 1;

  orbes.push({
    x,
    y,
    vx: (dx / distancia) * velocidade,
    vy: (dy / distancia) * velocidade,
    raio: 7,
    tempo: 0,
    cor,
    remover: false,
  });
}

export function criarLeque(
  orbes: Orbe[],
  x: number,
  y: number,
  alvoX: number,
  alvoY: number,
  quantidade: number,
  abertura: number,
  velocidade: number
): void {
  if (orbes.length >= MAX_ORBES) return;

  const anguloBase = Math.atan2(alvoY - y, alvoX - x);
  const inicio = anguloBase - abertura / 2;
  const passo = quantidade > 1 ? abertura / (quantidade - 1) : 0;

  for (let i = 0; i < quantidade; i++) {
    if (orbes.length >= MAX_ORBES) break;
    const angulo = inicio + passo * i;
    orbes.push({
      x,
      y,
      vx: Math.cos(angulo) * velocidade,
      vy: Math.sin(angulo) * velocidade,
      raio: 8,
      tempo: 0,
      cor: '#f0abfc',
      remover: false,
    });
  }
}

export function atualizarOrbes(orbes: Orbe[], dt: number): void {
  for (const orbe of orbes) {
    orbe.tempo += dt;
    orbe.x += orbe.vx * dt;
    orbe.y += orbe.vy * dt;

    if (
      orbe.x < -24 ||
      orbe.x > 504 ||
      orbe.y < HUD_ALTURA - 24 ||
      orbe.y > ALTURA + 24
    ) {
      orbe.remover = true;
    }
  }
}

export function desenharOrbes(
  g: CanvasRenderingContext2D,
  sprites: SpriteUtils,
  orbes: Orbe[]
): void {
  for (const orbe of orbes) {
    desenharOrbe(g, sprites, orbe);
  }
}
