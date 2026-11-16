/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/** Drone de patrulha — voa em linha reta na horizontal. */

import { DronePatrulha } from '../tipos';

export function criarDrone(x: number, y: number, direcao = 1, velocidade = 120): DronePatrulha {
  return {
    tipo: 'dronePatrulha',
    x,
    y,
    vx: direcao * velocidade,
    vy: 0,
    vida: 1,
    flash: 0,
  };
}

export function atualizarDrone(d: DronePatrulha, dt: number): void {
  d.flash = Math.max(0, d.flash - dt * 3);
  d.x += d.vx * dt;
  d.y += d.vy * dt;
}

export function desenharDrone(g: CanvasRenderingContext2D, d: DronePatrulha, tempo: number): void {
  g.save();
  g.translate(d.x, d.y);
  const dir = d.vx >= 0 ? 1 : -1;
  g.scale(dir, 1);

  // Corpo (cinza com faixa ciano)
  g.fillStyle = d.flash > 0 ? '#FFFFFF' : '#475569';
  g.fillRect(-10, -6, 20, 12);
  g.fillStyle = d.flash > 0 ? '#FFFFFF' : '#22D3EE';
  g.fillRect(-4, -2, 8, 4);

  // Asas horizontais
  g.fillStyle = '#1E293B';
  g.fillRect(-16, -2, 6, 4);
  g.fillRect(10, -2, 6, 4);

  // Hélices nos extremos
  const fase = Math.floor(tempo * 30 + d.x * 0.1) % 2 === 0;
  g.fillStyle = '#0F172A';
  if (fase) {
    g.fillRect(-18, -4, 4, 8);
    g.fillRect(14, -4, 4, 8);
  } else {
    g.fillRect(-18, -1, 4, 2);
    g.fillRect(14, -1, 4, 2);
  }

  g.restore();
}
