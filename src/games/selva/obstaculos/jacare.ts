/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SUBSOLO_TOPO, TRILHA_Y } from '../constantes';
import { Explorador, Jacare, JacareObstaculo } from '../tipos';

const ALTURA_CABECA = 10;

export function estadoBoca(jacare: Jacare, tempo: number): {
  abertura: number;
  fechada: boolean;
} {
  const ciclo = (tempo * 0.9 + jacare.fase) % 2.4;
  let abertura = 0;

  if (ciclo > 0.9 && ciclo < 1.5) {
    abertura = Math.sin(((ciclo - 0.9) / 0.6) * Math.PI);
  }

  return { abertura, fechada: abertura < 0.28 };
}

export function obterSuporteJacare(
  poco: JacareObstaculo,
  x: number,
  tempo: number
): number | null {
  for (const jacare of poco.jacares) {
    if (x < jacare.x - 2 || x > jacare.x + jacare.largura + 2) continue;

    const boca = estadoBoca(jacare, tempo);
    if (boca.fechada) return TRILHA_Y - ALTURA_CABECA;
  }

  return null;
}

export function colideJacare(
  jogador: Explorador,
  poco: JacareObstaculo,
  tempo: number
): boolean {
  if (jogador.x < poco.x - 4 || jogador.x > poco.x + poco.largura + 4) return false;

  if (jogador.y >= TRILHA_Y + 3) return true;

  for (const jacare of poco.jacares) {
    if (jogador.x < jacare.x - 3 || jogador.x > jacare.x + jacare.largura + 3) {
      continue;
    }

    const boca = estadoBoca(jacare, tempo);
    if (!boca.fechada && jogador.y > TRILHA_Y - ALTURA_CABECA - 2) {
      return true;
    }
  }

  return false;
}

export function desenharPocoJacare(
  g: CanvasRenderingContext2D,
  poco: JacareObstaculo,
  tempo: number
): void {
  g.fillStyle = '#071A17';
  g.fillRect(poco.x, TRILHA_Y, poco.largura, SUBSOLO_TOPO - TRILHA_Y + 2);

  g.fillStyle = '#0E4A4A';
  g.fillRect(poco.x, TRILHA_Y + 4, poco.largura, 14);
  g.fillStyle = '#166A63';
  g.fillRect(poco.x + 3, TRILHA_Y + 7, poco.largura - 6, 2);
  g.fillStyle = 'rgba(103, 232, 249, 0.35)';
  const onda = Math.floor(tempo * 12) % 12;
  g.fillRect(poco.x + 8 + onda, TRILHA_Y + 12, 9, 1);
  g.fillRect(poco.x + poco.largura - 27 - onda, TRILHA_Y + 17, 7, 1);

  for (const jacare of poco.jacares) {
    desenharJacare(g, jacare, tempo);
  }
}

function desenharJacare(
  g: CanvasRenderingContext2D,
  jacare: Jacare,
  tempo: number
): void {
  const x = Math.round(jacare.x);
  const y = TRILHA_Y - ALTURA_CABECA;
  const boca = estadoBoca(jacare, tempo);

  g.fillStyle = '#285E2F';
  g.fillRect(x + 1, y + 5, jacare.largura - 2, 5);
  g.fillStyle = '#3E8B3F';
  g.fillRect(x + 2, y + 4, jacare.largura - 4, 2);

  g.fillStyle = '#B7D36B';
  g.fillRect(x + 3, y, 2, 2);
  g.fillRect(x + jacare.largura - 5, y, 2, 2);
  g.fillStyle = '#0B2D1A';
  g.fillRect(x + 4, y + 1, 1, 1);
  g.fillRect(x + jacare.largura - 4, y + 1, 1, 1);

  const abertura = Math.round(boca.abertura * 5);

  if (abertura === 0) {
    g.fillStyle = '#2B6D32';
    g.fillRect(x + 1, y + 3, jacare.largura - 2, 5);
    g.fillStyle = '#D9F99D';
    g.fillRect(x + 4, y + 7, 12, 1);
    g.fillStyle = '#7A2E1F';
    g.fillRect(x + 6, y + 8, 8, 1);
  } else {
    g.fillStyle = '#2B6D32';
    g.fillRect(x + 1, y + 3 - Math.floor(abertura / 3), jacare.largura - 2, 3);
    g.fillStyle = '#7A2E1F';
    g.fillRect(x + 3, y + 6, jacare.largura - 6, abertura + 1);
    g.fillStyle = '#D9F99D';
    for (let i = 0; i < 4; i++) {
      g.fillRect(x + 4 + i * 4, y + 5, 2, 2);
      g.fillRect(x + 4 + i * 4, y + 7 + abertura, 2, 1);
    }
    g.fillStyle = '#3E8B3F';
    g.fillRect(x + 1, y + 7 + abertura, jacare.largura - 2, 3);
  }
}
