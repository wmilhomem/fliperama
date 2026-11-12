/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Explorador, CobraObstaculo } from '../tipos';

export function colideCobra(jogador: Explorador, cobra: CobraObstaculo): boolean {
  const esquerda = jogador.x - 5;
  const direita = jogador.x + 5;
  const topo = jogador.y - 17;

  return (
    direita > cobra.x &&
    esquerda < cobra.x + cobra.largura &&
    jogador.y > cobra.y + 2 &&
    topo < cobra.y + cobra.altura
  );
}

export function desenharCobra(
  g: CanvasRenderingContext2D,
  cobra: CobraObstaculo,
  tempo: number
): void {
  const x = Math.round(cobra.x);
  const y = cobra.y;

  g.fillStyle = '#27421B';
  g.fillRect(x + 1, y + 5, cobra.largura - 2, 5);
  g.fillStyle = '#4D7A2C';
  g.fillRect(x, y + 2, cobra.largura, 5);
  g.fillStyle = '#7FB83F';
  g.fillRect(x + 2, y, 5, 4);
  g.fillRect(x + 9, y + 1, 4, 3);
  g.fillStyle = '#FDE047';
  g.fillRect(x + 2, y + 2, 1, 1);
  g.fillRect(x + 5, y + 2, 1, 1);
  g.fillStyle = '#111827';
  g.fillRect(x + 3, y + 2, 1, 1);
  g.fillRect(x + 6, y + 2, 1, 1);

  const lingua = Math.floor(tempo * 8) % 2 === 0 ? 2 : 4;
  g.fillStyle = '#EF4444';
  g.fillRect(x - lingua, y + 3, lingua, 1);

  g.fillStyle = '#C28C2E';
  g.fillRect(x + 3, y + 7, 2, 1);
  g.fillRect(x + 8, y + 7, 2, 1);
  g.fillRect(x + 12, y + 7, 2, 1);
}
