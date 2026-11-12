/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SUBSOLO_TOPO, TRILHA_Y } from '../constantes';
import { AreiaObstaculo } from '../tipos';

export function desenharAreiaMovedica(
  g: CanvasRenderingContext2D,
  areia: AreiaObstaculo,
  tempo: number
): void {
  g.fillStyle = '#2A2114';
  g.fillRect(areia.x, TRILHA_Y, areia.largura, SUBSOLO_TOPO - TRILHA_Y + 2);
  g.fillStyle = '#4A381E';
  g.fillRect(areia.x + 2, TRILHA_Y + 2, areia.largura - 4, 16);
  g.fillStyle = '#6B5128';
  g.fillRect(areia.x + 4, TRILHA_Y + 5, areia.largura - 8, 2);

  const fase = Math.floor(tempo * 5) % 3;
  g.fillStyle = '#A8803E';
  g.fillRect(areia.x + 9, TRILHA_Y + 9 + fase, 5, 2);
  g.fillRect(areia.x + areia.largura - 19, TRILHA_Y + 14 - fase, 4, 2);
  g.fillStyle = '#D6B05E';
  g.fillRect(areia.x + 12, TRILHA_Y + 12 - fase, 2, 1);
  g.fillRect(areia.x + areia.largura - 15, TRILHA_Y + 8 + fase, 2, 1);
}
