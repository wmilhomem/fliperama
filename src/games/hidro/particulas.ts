/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Particula } from './tipos';
import { TAU } from './semente';

const MAX_PARTICULAS = 260;

export function criarExplosao(
  particulas: Particula[],
  x: number,
  y: number,
  cor: string,
  quantidade: number,
  velocidade: number
): void {
  if (particulas.length >= MAX_PARTICULAS) return;

  const espaco = Math.max(0, MAX_PARTICULAS - particulas.length);
  const total = Math.min(quantidade, espaco);

  for (let i = 0; i < total; i++) {
    const angulo = Math.random() * TAU;
    const forca = velocidade * (0.35 + Math.random() * 0.65);
    const vida = 0.3 + Math.random() * 0.55;

    particulas.push({
      x,
      y,
      vx: Math.cos(angulo) * forca,
      vy: Math.sin(angulo) * forca,
      vida,
      maxVida: vida,
      cor,
      tamanho: Math.random() < 0.3 ? 2.5 : 1.6,
    });
  }
}

export function criarRespingo(
  particulas: Particula[],
  x: number,
  y: number,
  cor = '#BAE6FD'
): void {
  criarExplosao(particulas, x, y, cor, 6, 55);
}

export function atualizarParticulas(particulas: Particula[], dt: number): Particula[] {
  for (const particula of particulas) {
    particula.x += particula.vx * dt;
    particula.y += particula.vy * dt;
    particula.vx *= Math.pow(0.08, dt);
    particula.vy *= Math.pow(0.08, dt);
    particula.vida -= dt;
  }

  return particulas.filter((particula) => particula.vida > 0);
}
