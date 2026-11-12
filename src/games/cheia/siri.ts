/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FILEIRAS_Y, LARGURA } from './constantes';
import { Siri } from './tipos';

export function criarSiris(fase: number): Siri[] {
  if (fase < 2) return [];

  const total = Math.min(3, Math.floor(fase / 2));
  const siris: Siri[] = [];

  for (let i = 0; i < total; i++) {
    const fileira = 2 + (i % 2);
    const direcao: -1 | 1 = i % 2 === 0 ? 1 : -1;
    siris.push({
      x: 70 + i * 110,
      y: FILEIRAS_Y[fileira],
      fileira,
      velocidade: 30 + fase * 3,
      direcao,
      largura: 18,
      altura: 14,
      tempo: Math.random() * 2,
    });
  }

  return siris;
}

export function atualizarSiris(siris: Siri[], dt: number): void {
  for (const s of siris) {
    s.tempo += dt;
    s.x += s.direcao * s.velocidade * dt;

    if (s.x > LARGURA + 20) {
      s.x = -20;
    } else if (s.x < -20) {
      s.x = LARGURA + 20;
    }
  }
}

export function desenharSiris(
  g: CanvasRenderingContext2D,
  siris: Siri[]
): void {
  for (const s of siris) {
    const x = Math.floor(s.x);
    const y = Math.floor(s.y);
    const passo = Math.floor(s.tempo * 10) % 2 === 0;

    g.save();
    g.translate(x, y - 8);

    g.fillStyle = '#7F1D1D';
    g.fillRect(-8, 0, 16, 8);
    g.fillStyle = '#DC2626';
    g.fillRect(-6, 2, 12, 6);
    g.fillStyle = '#FCA5A5';
    g.fillRect(-3, 3, 6, 2);
    g.fillStyle = '#991B1B';
    g.fillRect(-11, -2, 4, 5);
    g.fillRect(7, -2, 4, 5);
    g.fillRect(-10, 6, 5, 3);
    g.fillRect(5, 6, 5, 3);
    g.fillStyle = '#F8FAFC';
    g.fillRect(-4, 1, 2, 2);
    g.fillRect(2, 1, 2, 2);
    g.fillStyle = '#1F2937';
    g.fillRect(-3, 2, 1, 1);
    g.fillRect(3, 2, 1, 1);

    g.fillStyle = '#DC2626';
    if (passo) {
      g.fillRect(-12, 8, 4, 3);
      g.fillRect(-6, 8, 4, 3);
      g.fillRect(2, 8, 4, 3);
      g.fillRect(8, 8, 4, 3);
    } else {
      g.fillRect(-13, 8, 4, 3);
      g.fillRect(-4, 8, 4, 3);
      g.fillRect(1, 8, 4, 3);
      g.fillRect(9, 8, 4, 3);
    }

    g.restore();
  }
}
