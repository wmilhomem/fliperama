/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Circle, CollisionUtils, Point, Rect } from './types';

export const collision: CollisionUtils = {
  retanguloRetangulo(r1: Rect, r2: Rect): boolean {
    return (
      r1.x < r2.x + r2.largura &&
      r1.x + r1.largura > r2.x &&
      r1.y < r2.y + r2.altura &&
      r1.y + r1.altura > r2.y
    );
  },

  pontoRetangulo(px: number, py: number, r: Rect): boolean {
    return (
      px >= r.x &&
      px <= r.x + r.largura &&
      py >= r.y &&
      py <= r.y + r.altura
    );
  },

  circuloCirculo(c1: Circle, c2: Circle): boolean {
    const dx = c1.x - c2.x;
    const dy = c1.y - c2.y;
    const distSq = dx * dx + dy * dy;
    const raioSoma = c1.raio + c2.raio;
    return distSq <= raioSoma * raioSoma;
  },

  circuloRetangulo(c: Circle, r: Rect): boolean {
    // Ponto mais próximo do retângulo ao centro do círculo
    const maisProximoX = Math.max(r.x, Math.min(c.x, r.x + r.largura));
    const maisProximoY = Math.max(r.y, Math.min(c.y, r.y + r.altura));

    const dx = c.x - maisProximoX;
    const dy = c.y - maisProximoY;
    return dx * dx + dy * dy <= c.raio * c.raio;
  },

  linhaInterseccao(p1: Point, p2: Point, p3: Point, p4: Point): boolean {
    const det = (p2.x - p1.x) * (p4.y - p3.y) - (p2.y - p1.y) * (p4.x - p3.x);
    if (det === 0) return false;

    const lambda = ((p4.y - p3.y) * (p4.x - p1.x) + (p3.x - p4.x) * (p4.y - p1.y)) / det;
    const gamma = ((p1.y - p2.y) * (p4.x - p1.x) + (p2.x - p1.x) * (p4.y - p1.y)) / det;
    return 0 < lambda && lambda < 1 && 0 < gamma && gamma < 1;
  },
};
