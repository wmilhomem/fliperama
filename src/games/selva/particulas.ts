/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Particula, Tesouro } from './tipos';
import { corTesouro } from './tesouros';

export function criarExplosao(
  particulas: Particula[],
  x: number,
  y: number,
  cor: string,
  quantidade: number,
  velocidade: number
): void {
  for (let i = 0; i < quantidade; i++) {
    const angulo = Math.random() * Math.PI * 2;
    const forca = velocidade * (0.35 + Math.random() * 0.65);
    const vida = 0.35 + Math.random() * 0.45;

    particulas.push({
      x,
      y,
      vx: Math.cos(angulo) * forca,
      vy: Math.sin(angulo) * forca - 25,
      vida,
      vidaMax: vida,
      cor,
      tamanho: Math.random() < 0.3 ? 2 : 1,
      gravidade: 220,
    });
  }
}

export function criarColeta(particulas: Particula[], tesouro: Tesouro): void {
  criarExplosao(particulas, tesouro.x, tesouro.y, corTesouro(tesouro.tipo), 14, 95);
  criarExplosao(particulas, tesouro.x, tesouro.y, '#FEF9C3', 5, 55);
}

export function criarImpacto(particulas: Particula[], x: number, y: number): void {
  for (let i = 0; i < 5; i++) {
    particulas.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 55,
      vy: -Math.random() * 40,
      vida: 0.35,
      vidaMax: 0.35,
      cor: '#FDE68A',
      tamanho: 1,
      gravidade: 160,
    });
  }
}

export function atualizarParticulas(particulas: Particula[], dt: number): Particula[] {
  for (let i = particulas.length - 1; i >= 0; i--) {
    const p = particulas[i];
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += p.gravidade * dt;
    p.vida -= dt;

    if (p.vida <= 0) {
      particulas.splice(i, 1);
    }
  }

  return particulas;
}

export function desenharParticulas(
  g: CanvasRenderingContext2D,
  particulas: Particula[]
): void {
  g.save();

  for (const p of particulas) {
    g.globalAlpha = Math.max(0, Math.min(1, p.vida / p.vidaMax));
    g.fillStyle = p.cor;
    g.fillRect(Math.round(p.x), Math.round(p.y), p.tamanho, p.tamanho);
  }

  g.restore();
}
