/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * PASSARO — apenas atrapalha; eliminado por 1 tiro.
 * Não foi colocado em tipos.ts de propósito para manter o módulo independente.
 */

export interface Passaro {
  x: number;
  y: number;
  vx: number;
  vy: number;
  batimento: number;
  flash: number;
}

export function criarPassaro(x: number, y: number, direcao: 1 | -1): Passaro {
  return {
    x,
    y,
    vx: direcao * 130,
    vy: (Math.random() - 0.5) * 40,
    batimento: Math.random() * Math.PI * 2,
    flash: 0,
  };
}

export function atualizarPassaro(passaro: Passaro, dt: number): void {
  passaro.x += passaro.vx * dt;
  passaro.y += passaro.vy * dt + Math.sin(passaro.batimento) * 12 * dt;
  passaro.batimento += dt * 10;
  passaro.flash = Math.max(0, passaro.flash - dt * 3);
}

export function desenharPassaro(g: CanvasRenderingContext2D, passaro: Passaro): void {
  g.save();
  g.translate(passaro.x, passaro.y);
  const asa = Math.sin(passaro.batimento) * 4;

  // Corpo
  g.fillStyle = passaro.flash > 0 ? '#FFFFFF' : '#F8FAFC';
  g.beginPath();
  g.ellipse(0, 0, 5, 3.5, 0, 0, Math.PI * 2);
  g.fill();

  // Cabeça e bico
  g.fillStyle = passaro.flash > 0 ? '#FFFFFF' : '#E2E8F0';
  g.beginPath();
  g.arc(5, -1, 2.4, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = '#F97316';
  g.fillRect(7, -2, 3, 1.6);

  // Asas batendo
  g.fillStyle = passaro.flash > 0 ? '#FFFFFF' : '#CBD5F5';
  g.beginPath();
  g.moveTo(-3, 0);
  g.lineTo(-9, -4 - asa);
  g.lineTo(-6, 1);
  g.closePath();
  g.fill();
  g.beginPath();
  g.moveTo(3, 0);
  g.lineTo(9, -4 + asa);
  g.lineTo(6, 1);
  g.closePath();
  g.fill();

  g.restore();
}
