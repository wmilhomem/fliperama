/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Caca } from '../tipos';

/** CAÇA LEVE — entra pela lateral e cruza a tela em linha reta. */
export function criarCaca(x: number, y: number, direcao: 1 | -1, velocidade: number): Caca {
  return { tipo: 'caca', x, y, vx: direcao * velocidade, vy: 0, vida: 1, flash: 0 };
}

export function atualizarCaca(caca: Caca, dt: number): void {
  caca.x += caca.vx * dt;
  caca.flash = Math.max(0, caca.flash - dt * 3);
}

export function desenharCaca(g: CanvasRenderingContext2D, caca: Caca): void {
  g.save();
  g.translate(caca.x, caca.y);
  const dir = caca.vx >= 0 ? 1 : -1;
  g.scale(dir, 1);

  // Fuselagem
  g.fillStyle = caca.flash > 0 ? '#FFFFFF' : '#DC2626';
  g.fillRect(-16, -4, 32, 8);
  g.fillStyle = caca.flash > 0 ? '#FFFFFF' : '#991B1B';
  g.fillRect(-16, 2, 32, 3);

  // Cockpit
  g.fillStyle = caca.flash > 0 ? '#FFFFFF' : '#FDE047';
  g.fillRect(-6, -7, 12, 4);

  // Asas
  g.fillStyle = caca.flash > 0 ? '#FFFFFF' : '#EF4444';
  g.fillRect(-8, -10, 4, 20);
  g.fillRect(6, -10, 4, 20);

  // Nariz
  g.fillStyle = caca.flash > 0 ? '#FFFFFF' : '#F97316';
  g.fillRect(14, -3, 4, 6);

  g.restore();
}
