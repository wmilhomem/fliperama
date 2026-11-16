/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/** Bateria antiaérea costeira — inofensiva parada, perigosa quando dispara. */

import { BateriaAntiaerea } from '../tipos';

export function criarBateria(x: number, y: number): BateriaAntiaerea {
  return { tipo: 'bateria', x, y, timer: 1.2, vida: 2, flash: 0 };
}

export function atualizarBateria(b: BateriaAntiaerea, dt: number): void {
  b.flash = Math.max(0, b.flash - dt * 3);
  b.timer = Math.max(0, b.timer - dt);
}

/** Pontos de dano que a bateria precisa para ser destruída (2 acertos de bala, ou 1 míssil). */
export const VIDA_BATERIA = 2;

export function desenharBateria(g: CanvasRenderingContext2D, b: BateriaAntiaerea, tempo: number): void {
  g.save();
  g.translate(b.x, b.y);

  // Base de concreto
  g.fillStyle = '#44403C';
  g.fillRect(-12, 2, 24, 6);
  g.fillStyle = '#292524';
  g.fillRect(-12, 6, 24, 2);

  // Corpo da bateria (laranja-queimado nas baterias costeiras)
  g.fillStyle = b.flash > 0 ? '#FFFFFF' : '#C2410C';
  g.fillRect(-9, -8, 18, 10);
  g.fillStyle = '#7C2D12';
  g.fillRect(-9, -2, 18, 4);

  // Cano duplo (levantado, apontando para cima)
  const recuo = Math.max(0, b.timer - 0.8) * 6; // pequeno recuo ao atirar
  g.fillStyle = '#1F2937';
  g.fillRect(-6 - recuo / 2, -14, 4, 7);
  g.fillRect(2 + recuo / 2, -14, 4, 7);
  g.fillStyle = '#374151';
  g.fillRect(-6 - recuo / 2, -15, 4, 2);
  g.fillRect(2 + recuo / 2, -15, 4, 2);

  // Luz de alerta no topo (pisca quando está prestes a disparar)
  const preFlash = b.timer < 0.55 && Math.floor(tempo * 10) % 2 === 0;
  g.fillStyle = preFlash ? '#FDE047' : '#F97316';
  g.fillRect(-2, -10, 4, 3);

  g.restore();
}
