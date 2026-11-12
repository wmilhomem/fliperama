/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AGUA_BASE, LARGURA } from './constantes';
import { Peixe } from './tipos';

export function criarPeixe(): Peixe {
  const direcao = Math.random() > 0.5 ? 1 : -1;
  return {
    x: 60 + Math.random() * (LARGURA - 120),
    y: AGUA_BASE - 2,
    vx: direcao * (26 + Math.random() * 22),
    vy: -(300 + Math.random() * 60),
    largura: 32,
    altura: 16,
    tempo: Math.random() * 3,
    brilho: Math.random(),
  };
}

export function atualizarPeixes(peixes: Peixe[], dt: number): void {
  for (let i = peixes.length - 1; i >= 0; i--) {
    const p = peixes[i];
    p.x += p.vx * dt;
    p.vy += 620 * dt;
    p.y += p.vy * dt;
    p.tempo += dt;
    if (p.y > AGUA_BASE + 8 || p.x < -48 || p.x > LARGURA + 48) {
      peixes.splice(i, 1);
    }
  }
}

export function desenharPeixes(
  g: CanvasRenderingContext2D,
  peixes: Peixe[]
): void {
  for (const p of peixes) {
    const x = Math.floor(p.x);
    const y = Math.floor(p.y);
    const brilho = Math.floor(p.tempo * 6 + p.brilho * 10) % 2 === 0;

    g.save();
    g.translate(x, y);
    if (p.vx < 0) {
      g.scale(-1, 1);
    }

    g.fillStyle = 'rgba(253, 224, 71, 0.22)';
    g.fillRect(-18, -10, 36, 20);

    g.fillStyle = '#B45309';
    g.fillRect(-16, -2, 10, 6);
    g.fillRect(-20, -6, 6, 4);
    g.fillRect(-20, 2, 6, 4);

    g.fillStyle = '#F59E0B';
    g.fillRect(-10, -6, 26, 12);
    g.fillRect(-4, -8, 18, 16);
    g.fillStyle = '#FDE68A';
    g.fillRect(-6, -4, 20, 6);
    g.fillRect(6, -2, 8, 4);
    g.fillStyle = '#FBBF24';
    g.fillRect(10, -4, 10, 8);
    g.fillRect(18, 0, 6, 4);

    g.fillStyle = '#78350F';
    g.fillRect(6, -2, 2, 2);
    g.fillStyle = '#F8FAFC';
    g.fillRect(7, -2, 1, 1);
    g.fillStyle = brilho ? '#FEF3C7' : '#FDE68A';
    g.fillRect(-2, -7, 4, 2);
    g.fillRect(2, 5, 4, 2);
    g.restore();
  }
}
