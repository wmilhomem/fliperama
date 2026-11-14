/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CacaMergulho } from '../tipos';

/**
 * CAÇA EM MERGULHO — entra pelo topo e mergulha em direção ao jogador.
 * Estado 'entrando': desce reto. Ao alinhar, entra em 'mergulhando' e persegue.
 */
export function criarCacaMergulho(x: number, y: number): CacaMergulho {
  return { tipo: 'mergulho', x, y, vx: 0, vy: 0, estado: 'entrando', vida: 1, flash: 0 };
}

export function atualizarCacaMergulho(
  caca: CacaMergulho,
  alvoX: number,
  alvoY: number,
  dt: number,
  velocidade: number
): void {
  caca.flash = Math.max(0, caca.flash - dt * 3);

  if (caca.estado === 'entrando') {
    caca.vy = velocidade;
    caca.y += caca.vy * dt;
    if (caca.y > 140) {
      caca.estado = 'mergulhando';
      const dx = alvoX - caca.x;
      const dy = alvoY - caca.y;
      const dist = Math.hypot(dx, dy) || 1;
      const vel = velocidade * 1.35;
      caca.vx = (dx / dist) * vel;
      caca.vy = (dy / dist) * vel;
    }
    return;
  }

  caca.x += caca.vx * dt;
  caca.y += caca.vy * dt;
}

export function desenharCacaMergulho(g: CanvasRenderingContext2D, caca: CacaMergulho): void {
  g.save();
  g.translate(caca.x, caca.y);
  const angulo = caca.estado === 'mergulhando' ? Math.atan2(caca.vy, caca.vx) + Math.PI / 2 : 0;
  g.rotate(angulo);

  // Fuselagem esguia
  g.fillStyle = caca.flash > 0 ? '#FFFFFF' : '#7C3AED';
  g.fillRect(-5, -14, 10, 26);
  g.fillStyle = caca.flash > 0 ? '#FFFFFF' : '#A78BFA';
  g.fillRect(-5, -14, 10, 6);

  // Asas em V (mergulho)
  g.fillStyle = caca.flash > 0 ? '#FFFFFF' : '#8B5CF6';
  g.beginPath();
  g.moveTo(-16, 2);
  g.lineTo(0, -8);
  g.lineTo(16, 2);
  g.closePath();
  g.fill();

  // Canópia
  g.fillStyle = caca.flash > 0 ? '#FFFFFF' : '#FDE68A';
  g.fillRect(-3, -6, 6, 5);

  g.restore();
}
