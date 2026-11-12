/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Explorador, FileiraObstaculo } from '../tipos';

export function colideFileira(jogador: Explorador, fileira: FileiraObstaculo): boolean {
  const esquerda = jogador.x - 5;
  const direita = jogador.x + 5;
  const topo = jogador.y - 17;

  return fileira.troncos.some(
    (x) =>
      direita > x &&
      esquerda < x + 9 &&
      jogador.y > fileira.y + 1 &&
      topo < fileira.y + fileira.altura
  );
}

export function desenharFileira(
  g: CanvasRenderingContext2D,
  fileira: FileiraObstaculo
): void {
  for (const x of fileira.troncos) {
    g.fillStyle = '#3B2412';
    g.fillRect(x, fileira.y + 2, 9, fileira.altura - 2);
    g.fillStyle = '#7C4A22';
    g.fillRect(x + 1, fileira.y, 7, fileira.altura - 2);
    g.fillStyle = '#B9753B';
    g.fillRect(x + 2, fileira.y + 1, 4, 2);
    g.fillStyle = '#5A3518';
    g.fillRect(x + 1, fileira.y + 5, 7, 1);
    g.fillRect(x + 3, fileira.y + 7, 3, 1);
  }
}
