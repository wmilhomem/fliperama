/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/** Míssil inimigo guiado — lento, curva de leve, 3 s de vida, derrubável com 1 bala (50 pts). */

import { MISSIL_INIMIGO_CURVA, MISSIL_INIMIGO_VEL, MISSIL_INIMIGO_VIDA } from '../config';
import { MissilInimigo } from '../tipos';

export function criarMissilInimigo(x: number, y: number, vx: number, vy: number): MissilInimigo {
  const vel = Math.hypot(vx, vy) || 1;
  return {
    x,
    y,
    vx: (vx / vel) * MISSIL_INIMIGO_VEL,
    vy: (vy / vel) * MISSIL_INIMIGO_VEL,
    vida: MISSIL_INIMIGO_VIDA,
  };
}

/** O míssil curva de leve em direção ao helicóptero. */
export function atualizarMissilInimigo(m: MissilInimigo, alvoX: number, alvoY: number, dt: number): void {
  const dx = alvoX - m.x;
  const dy = alvoY - m.y;
  const dist = Math.hypot(dx, dy) || 1;

  // Direção desejada normalizada
  const desX = (dx / dist) * MISSIL_INIMIGO_VEL;
  const desY = (dy / dist) * MISSIL_INIMIGO_VEL;

  // Interpolação curva (curvatura leve)
  const k = Math.min(1, MISSIL_INIMIGO_CURVA * dt);
  m.vx += (desX - m.vx) * k;
  m.vy += (desY - m.vy) * k;

  m.x += m.vx * dt;
  m.y += m.vy * dt;
  m.vida -= dt;
}

export function desenharMissilInimigo(g: CanvasRenderingContext2D, m: MissilInimigo): void {
  const ang = Math.atan2(m.vy, m.vx);
  g.save();
  g.translate(m.x, m.y);
  g.rotate(ang + Math.PI / 2);

  // Corpo vermelho-escuro
  g.fillStyle = '#991B1B';
  g.fillRect(-3, -10, 6, 14);
  g.fillStyle = '#DC2626';
  g.fillRect(-3, -10, 6, 4);
  // Ponta
  g.fillStyle = '#FDE047';
  g.beginPath();
  g.moveTo(0, -14);
  g.lineTo(-3, -9);
  g.lineTo(3, -9);
  g.closePath();
  g.fill();
  // Chamas na traseira
  g.fillStyle = '#F97316';
  g.fillRect(-2, 4, 4, 5);
  g.fillStyle = '#FDE047';
  g.fillRect(-1, 4, 2, 3);

  g.restore();
}
