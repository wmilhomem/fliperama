/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LARGURA_MUNDO } from '../constantes';
import { Explorador, TroncoObstaculo } from '../tipos';

export function atualizarTronco(tronco: TroncoObstaculo, dt: number): void {
  tronco.x += tronco.vx * dt;

  if (tronco.x < 18) {
    tronco.x = 18;
    tronco.vx = Math.abs(tronco.vx);
  } else if (tronco.x + tronco.largura > LARGURA_MUNDO - 18) {
    tronco.x = LARGURA_MUNDO - 18 - tronco.largura;
    tronco.vx = -Math.abs(tronco.vx);
  }
}

export function colideTronco(jogador: Explorador, tronco: TroncoObstaculo): boolean {
  const esquerda = jogador.x - 5;
  const direita = jogador.x + 5;
  const topo = jogador.y - 17;

  return (
    direita > tronco.x &&
    esquerda < tronco.x + tronco.largura &&
    jogador.y > tronco.y + 1 &&
    topo < tronco.y + tronco.altura
  );
}

export function desenharTronco(
  g: CanvasRenderingContext2D,
  tronco: TroncoObstaculo,
  tempo: number
): void {
  const x = Math.round(tronco.x);
  const y = tronco.y;

  g.fillStyle = '#3F2A16';
  g.fillRect(x, y + 2, tronco.largura, tronco.altura - 2);
  g.fillStyle = '#6B3F1D';
  g.fillRect(x + 1, y, tronco.largura - 2, tronco.altura - 2);
  g.fillStyle = '#9A5B2B';
  g.fillRect(x + 3, y + 1, tronco.largura - 6, 2);
  g.fillStyle = '#2B1B0E';
  g.fillRect(x + 2, y + 4, tronco.largura - 4, 1);

  const brilho = Math.floor(tempo * 10) % 4;
  g.fillStyle = '#D6A05A';
  g.fillRect(x + 3 + brilho, y + 2, 3, 1);

  g.fillStyle = '#5A3518';
  g.fillRect(x - 1, y + 4, 2, 5);
  g.fillRect(x + tronco.largura - 1, y + 4, 2, 5);
}
