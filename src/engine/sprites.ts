/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SpriteUtils } from './types';

export const sprites: SpriteUtils = {
  desenharMatriz(
    g: CanvasRenderingContext2D,
    matriz: string[],
    paleta: Record<string, string>,
    x: number,
    y: number,
    tamanhoPixel = 2,
    espelharX = false
  ): void {
    if (!matriz || matriz.length === 0) return;

    const linhas = matriz.length;
    const colunas = matriz[0].length;

    g.save();
    for (let r = 0; r < linhas; r++) {
      const linha = matriz[r];
      for (let c = 0; c < colunas; c++) {
        const char = linha[c];
        if (char === ' ' || char === '.' || !paleta[char]) {
          continue; // Transparente
        }

        const colIdx = espelharX ? colunas - 1 - c : c;
        const px = Math.floor(x + colIdx * tamanhoPixel);
        const py = Math.floor(y + r * tamanhoPixel);

        g.fillStyle = paleta[char];
        g.fillRect(px, py, tamanhoPixel, tamanhoPixel);
      }
    }
    g.restore();
  },
};
