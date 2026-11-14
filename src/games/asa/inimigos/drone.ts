/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Drone } from '../tipos';

/**
 * DRONE DE PATRULHA — voa em quadrado (sobe, vai pra esquerda/direita, desce).
 */
export function criarDrone(x: number, y: number): Drone {
  return { tipo: 'drone', x, y, vx: 60, vy: 0, fase: 0, vida: 1, flash: 0 };
}

export function atualizarDrone(drone: Drone, dt: number): void {
  drone.flash = Math.max(0, drone.flash - dt * 3);
  drone.fase += dt * 1.4;

  // Movimento quadrado: cima → lado → baixo → volta
  const t = drone.fase % 4;
  if (t < 1) {
    drone.vx = 0;
    drone.vy = -55;
  } else if (t < 2) {
    drone.vx = 75;
    drone.vy = 0;
  } else if (t < 3) {
    drone.vx = 0;
    drone.vy = 55;
  } else {
    drone.vx = -75;
    drone.vy = 0;
  }

  drone.x += drone.vx * dt;
  drone.y += drone.vy * dt;
}

export function desenharDrone(g: CanvasRenderingContext2D, drone: Drone, tempo: number): void {
  g.save();
  g.translate(drone.x, drone.y);

  // Corpo quadriculado
  g.fillStyle = drone.flash > 0 ? '#FFFFFF' : '#22D3EE';
  g.fillRect(-8, -8, 16, 16);
  g.fillStyle = drone.flash > 0 ? '#FFFFFF' : '#155E75';
  g.fillRect(-8, 4, 16, 4);

  // Olho (scanner) pulsante
  const brilho = 0.5 + 0.5 * Math.sin(tempo * 8);
  g.fillStyle = `rgba(252, 165, 165, ${brilho})`;
  g.beginPath();
  g.arc(0, -1, 4, 0, Math.PI * 2);
  g.fill();

  // Hélices nos cantos
  g.fillStyle = '#164E63';
  g.fillRect(-12, -12, 6, 3);
  g.fillRect(6, -12, 6, 3);
  g.fillRect(-12, 9, 6, 3);
  g.fillRect(6, 9, 6, 3);

  g.restore();
}
