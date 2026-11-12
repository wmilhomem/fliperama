/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MAX_PARTICULAS } from './constantes';
import { TAU } from './semente';
import { Particula } from './tipos';

export function criarExplosao(
  particulas: Particula[],
  x: number,
  y: number,
  cor: string,
  quantidade: number,
  velocidade: number
): void {
  if (particulas.length >= MAX_PARTICULAS) return;

  const total = Math.min(quantidade, MAX_PARTICULAS - particulas.length);

  for (let i = 0; i < total; i++) {
    const angulo = Math.random() * TAU;
    const forca = velocidade * (0.35 + Math.random() * 0.65);
    const vida = 0.3 + Math.random() * 0.5;

    particulas.push({
      x,
      y,
      vx: Math.cos(angulo) * forca,
      vy: Math.sin(angulo) * forca - 20,
      vida,
      maxVida: vida,
      cor,
      tamanho: Math.random() < 0.35 ? 3 : 2,
    });
  }
}

export function criarPoeira(particulas: Particula[], x: number, y: number, cor = '#A16207'): void {
  if (particulas.length >= MAX_PARTICULAS) return;

  particulas.push({
    x: x + (Math.random() - 0.5) * 34,
    y,
    vx: (Math.random() - 0.5) * 80,
    vy: -40 - Math.random() * 60,
    vida: 0.35 + Math.random() * 0.25,
    maxVida: 0.6,
    cor,
    tamanho: 2 + Math.random() * 2,
  });
}

export function criarFaisca(particulas: Particula[], x: number, y: number): void {
  criarExplosao(particulas, x, y, '#FDE68A', 5, 90);
}

export function atualizarParticulas(particulas: Particula[], dt: number): void {
  for (let i = particulas.length - 1; i >= 0; i--) {
    const p = particulas[i];
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vx *= Math.pow(0.12, dt);
    p.vy *= Math.pow(0.12, dt);
    p.vy += 55 * dt;
    p.vida -= dt;

    if (p.vida <= 0) particulas.splice(i, 1);
  }
}

export function desenharParticulas(
  g: CanvasRenderingContext2D,
  particulas: Particula[]
): void {
  for (const p of particulas) {
    g.globalAlpha = Math.max(0, Math.min(1, p.vida / p.maxVida));
    g.fillStyle = p.cor;
    g.fillRect(p.x - p.tamanho / 2, p.y - p.tamanho / 2, p.tamanho, p.tamanho);
  }
  g.globalAlpha = 1;
}
