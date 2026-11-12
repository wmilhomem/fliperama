/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AGUA_BASE, LARGURA } from './constantes';
import { Piranha } from './tipos';

export function criarPiranha(): Piranha {
  return {
    x: 36 + Math.random() * (LARGURA - 72),
    y: AGUA_BASE - 18,
    vy: -(300 + Math.random() * 65),
    largura: 18,
    altura: 16,
    vida: 1.25,
    tempo: 0,
  };
}

export function atualizarPiranhas(piranhas: Piranha[], dt: number): void {
  for (let i = piranhas.length - 1; i >= 0; i--) {
    const p = piranhas[i];
    p.tempo += dt;
    p.vida -= dt;
    p.vy += 620 * dt;
    p.y += p.vy * dt;

    if (p.vida <= 0 || p.y > AGUA_BASE + 24) {
      piranhas.splice(i, 1);
    }
  }
}

export function desenharPiranhas(
  g: CanvasRenderingContext2D,
  piranhas: Piranha[]
): void {
  for (const p of piranhas) {
    const x = Math.floor(p.x);
    const y = Math.floor(p.y);
    const pisca = Math.floor(p.tempo * 12) % 2 === 0;

    g.save();
    g.translate(x, y);
    if (p.vy < 0) {
      g.scale(1, -1);
    }

    g.fillStyle = '#7F1D1D';
    g.fillRect(-8, -6, 16, 12);
    g.fillStyle = '#B91C1C';
    g.fillRect(-6, -4, 12, 8);
    g.fillStyle = '#F87171';
    g.fillRect(-2, -2, 7, 5);
    g.fillStyle = '#FDE68A';
    g.fillRect(-8, 4, 16, 2);
    g.fillStyle = '#1F2937';
    g.fillRect(-4, 5, 2, 2);
    g.fillRect(0, 5, 2, 2);
    g.fillRect(4, 5, 2, 2);
    g.fillStyle = pisca ? '#F8FAFC' : '#FACC15';
    g.fillRect(4, -3, 2, 2);
    g.fillStyle = '#7F1D1D';
    g.fillRect(-12, -2, 5, 4);
    g.fillRect(-10, -5, 3, 3);
    g.restore();
  }
}
