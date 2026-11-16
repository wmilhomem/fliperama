/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/** Drone de enxame — pequenos drones em grupo (usado na Cidade e pelo Senhor da Tempestade). */

import { LARGURA } from '../config';

export interface EnxameDrone {
  x: number;
  y: number;
  vx: number;
  vy: number;
  fase: number;
  vida: number;
  flash: number;
}

export interface Enxame {
  /** Centro do enxame (o líder). */
  x: number;
  y: number;
  /** Direção de movimento (1 = direita, -1 = esquerda). */
  direcao: 1 | -1;
  /** Membros do enxame (orbitando o líder). */
  membros: EnxameDrone[];
}

export function criarEnxame(x: number, y: number, direcao: 1 | -1): Enxame {
  const membros: EnxameDrone[] = [];
  // 5 drones por enxame em formação de diamante
  const offsets: [number, number][] = [
    [0, 0],
    [-16, -10],
    [16, -10],
    [-16, 10],
    [16, 10],
  ];
  for (const [ox, oy] of offsets) {
    membros.push({
      x: x + ox,
      y: y + oy,
      vx: 0,
      vy: 0,
      fase: Math.random() * Math.PI * 2,
      vida: 1,
      flash: 0,
    });
  }
  return { x, y, direcao, membros };
}

export function atualizarEnxame(e: Enxame, dt: number): void {
  e.x += e.direcao * 92 * dt;
  for (const m of e.membros) {
    m.fase += dt * 3.2;
    m.flash = Math.max(0, m.flash - dt * 4);
    // Orbita o líder com balanço
    const dx = m.x - e.x;
    const dy = m.y - e.y;
    m.x += Math.sign(dx) * 8 * dt + Math.cos(m.fase) * 14 * dt;
    m.y += Math.sign(dy) * 8 * dt + Math.sin(m.fase * 1.1) * 12 * dt;
  }
}

export function desenharEnxame(g: CanvasRenderingContext2D, e: Enxame, tempo: number): void {
  for (const m of e.membros) {
    if (m.vida <= 0) continue;
    g.save();
    g.translate(m.x, m.y);
    const dir = e.direcao;
    g.scale(dir, 1);

    // Corpo mini (violeta enxame)
    g.fillStyle = m.flash > 0 ? '#FFFFFF' : '#6D28D9';
    g.fillRect(-5, -4, 10, 8);
    g.fillStyle = m.flash > 0 ? '#FFFFFF' : '#A78BFA';
    g.fillRect(-3, -2, 6, 4);

    // Hélices
    const fase = Math.floor(tempo * 24 + m.fase) % 2 === 0;
    g.fillStyle = '#1F2937';
    if (fase) {
      g.fillRect(-8, -5, 4, 2);
      g.fillRect(4, -5, 4, 2);
    } else {
      g.fillRect(-8, -4, 4, 1);
      g.fillRect(4, -4, 4, 1);
    }

    // Olho vermelho
    g.fillStyle = '#EF4444';
    g.fillRect(-1, -1, 2, 2);

    g.restore();
  }
}
