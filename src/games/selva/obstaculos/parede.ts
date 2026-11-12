/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SUBSOLO_CHAO, SUBSOLO_TOPO } from '../constantes';
import { Parede } from '../tipos';

export function bloqueiaParede(
  parede: Parede | null,
  x: number,
  meiaLargura = 5
): boolean {
  if (!parede) return false;

  return x + meiaLargura > parede.x && x - meiaLargura < parede.x + parede.largura;
}

export function desenharParede(g: CanvasRenderingContext2D, parede: Parede): void {
  const y = SUBSOLO_TOPO + 5;
  const altura = SUBSOLO_CHAO - y;

  g.fillStyle = '#0B1220';
  g.fillRect(parede.x - 1, y - 2, parede.largura + 2, altura + 3);

  for (let linha = 0; linha < 5; linha++) {
    const offset = linha % 2 === 0 ? 0 : 4;
    for (let x = parede.x - offset; x < parede.x + parede.largura; x += 8) {
      const largura = Math.min(7, parede.x + parede.largura - x);
      if (largura <= 0) continue;

      g.fillStyle = linha % 2 === 0 ? '#7C3F2B' : '#8B4A2F';
      g.fillRect(Math.max(parede.x, x), y + linha * 8, largura, 7);
      g.fillStyle = '#B56A45';
      g.fillRect(Math.max(parede.x, x) + 1, y + linha * 8 + 1, Math.max(1, largura - 2), 1);
    }
  }

  g.fillStyle = '#3F1F17';
  g.fillRect(parede.x - 2, y - 1, parede.largura + 4, 2);
  g.fillRect(parede.x - 2, SUBSOLO_CHAO - 2, parede.largura + 4, 2);
}
