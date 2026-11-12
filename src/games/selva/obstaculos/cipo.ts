/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SUBSOLO_TOPO, TRILHA_Y } from '../constantes';
import { CipoObstaculo, Explorador } from '../tipos';

export interface PontoCipo {
  x: number;
  y: number;
  angulo: number;
}

export function pontoCipo(cipo: CipoObstaculo, tempo: number): PontoCipo {
  const angulo = Math.sin(tempo * 1.25 + cipo.fase) * 0.68;

  return {
    x: cipo.ancoraX + Math.sin(angulo) * cipo.comprimento,
    y: cipo.ancoraY + Math.cos(angulo) * cipo.comprimento,
    angulo,
  };
}

export function pertoDoCipo(
  jogador: Explorador,
  cipo: CipoObstaculo,
  tempo: number
): boolean {
  const ponto = pontoCipo(cipo, tempo);
  const maoX = jogador.x;
  const maoY = jogador.y - 12;

  return Math.hypot(maoX - ponto.x, maoY - ponto.y) < 19;
}

export function desenharPocoCipo(
  g: CanvasRenderingContext2D,
  cipo: CipoObstaculo,
  tempo: number
): void {
  g.fillStyle = '#061510';
  g.fillRect(cipo.x, TRILHA_Y, cipo.largura, SUBSOLO_TOPO - TRILHA_Y + 2);
  g.fillStyle = '#0A2419';
  g.fillRect(cipo.x + 3, TRILHA_Y + 4, cipo.largura - 6, 15);
  g.fillStyle = '#123326';
  g.fillRect(cipo.x + 8, TRILHA_Y + 8, cipo.largura - 16, 7);

  const ponto = pontoCipo(cipo, tempo);
  const balanco = Math.sin(tempo * 2.2 + cipo.fase);

  g.strokeStyle = '#6B4A22';
  g.lineWidth = 2;
  g.beginPath();
  g.moveTo(cipo.ancoraX, 30);
  g.lineTo(cipo.ancoraX, cipo.ancoraY);
  g.lineTo(Math.round(ponto.x), Math.round(ponto.y));
  g.stroke();

  g.strokeStyle = '#A87333';
  g.lineWidth = 1;
  g.beginPath();
  g.moveTo(cipo.ancoraX + 1, 31);
  g.lineTo(cipo.ancoraX + 1, cipo.ancoraY + 2);
  g.lineTo(Math.round(ponto.x) + 1, Math.round(ponto.y) - 2);
  g.stroke();

  g.fillStyle = '#2B8A4A';
  g.fillRect(Math.round(ponto.x) - 5, Math.round(ponto.y) - 2, 11, 3);
  g.fillStyle = '#63D471';
  g.fillRect(Math.round(ponto.x) - 3, Math.round(ponto.y) - 4, 6, 3);
  g.fillStyle = '#A3E635';
  g.fillRect(Math.round(ponto.x) + (balanco > 0 ? 2 : -3), Math.round(ponto.y) - 5, 2, 2);

  g.fillStyle = '#1C6B3A';
  g.fillRect(cipo.ancoraX - 9, 30, 18, 3);
  g.fillStyle = '#37A856';
  g.fillRect(cipo.ancoraX - 14, 27, 9, 3);
  g.fillRect(cipo.ancoraX + 5, 27, 10, 3);
}

