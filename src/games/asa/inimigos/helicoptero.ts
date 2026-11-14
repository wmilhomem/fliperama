/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Helicoptero } from '../tipos';

/**
 * HELICÓPTERO — voa na horizontal indo e voltando, atira uma vez por passagem.
 */
export function criarHelicoptero(x: number, y: number, direcao: 1 | -1): Helicoptero {
  return {
    tipo: 'helicoptero',
    x,
    y,
    vx: direcao * 55,
    vy: 0,
    direcao,
    atirou: false,
    vida: 1,
    flash: 0,
  };
}

export function atualizarHelicoptero(
  heli: Helicoptero,
  dt: number,
  largura: number
): void {
  heli.x += heli.vx * dt;
  heli.flash = Math.max(0, heli.flash - dt * 3);
  if (heli.x > largura + 40 || heli.x < -40) {
    heli.vx *= -1;
    heli.direcao = heli.vx >= 0 ? 1 : -1;
    heli.x = Math.max(-40, Math.min(largura + 40, heli.x));
    heli.atirou = false;
  }
}

export function desenharHelicoptero(g: CanvasRenderingContext2D, heli: Helicoptero, tempo: number): void {
  g.save();
  g.translate(heli.x, heli.y);
  const dir = heli.direcao;

  // Corpo
  g.fillStyle = heli.flash > 0 ? '#FFFFFF' : '#FACC15';
  g.fillRect(-18, -7, 36, 12);
  g.fillStyle = heli.flash > 0 ? '#FFFFFF' : '#A16207';
  g.fillRect(-18, 3, 36, 3);

  // Cauda
  g.fillStyle = heli.flash > 0 ? '#FFFFFF' : '#EAB308';
  g.fillRect(-28, -3, 10, 5);
  g.fillRect(-30, -6, 4, 11);

  // Rotor (animação por tempo)
  const rotor = Math.floor(tempo * 18) % 2 === 0;
  g.fillStyle = '#1E293B';
  g.fillRect(-30, -11, 60, 2);
  if (rotor) g.fillRect(-4, -14, 8, 3);

  // Rotor de cauda
  g.fillRect(-33, -9, 2, 7);

  // Cockpit
  g.fillStyle = heli.flash > 0 ? '#FFFFFF' : '#38BDF8';
  g.fillRect(6, -9, 9, 6);

  g.restore();

  // Refletor quando atira
  if (heli.atirou) {
    g.fillStyle = 'rgba(253,224,71,0.5)';
    g.fillRect(heli.x - 2, heli.y + 5, 4, 10);
  }
}
