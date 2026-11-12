/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ALTURA_MUNDO,
  LARGURA_MUNDO,
  SEMENTE_MUNDO,
  SUBSOLO_CHAO,
  SUBSOLO_TOPO,
  TRILHA_Y,
} from './constantes';
import { rngDaTela } from './semente';
import { TelaSelva } from './tipos';

export function escadaPerto(tela: TelaSelva, x: number): number | null {
  for (const escada of tela.escadas) {
    if (Math.abs(x - escada) <= 9) return escada;
  }

  return null;
}

export function desenharSubsolo(
  g: CanvasRenderingContext2D,
  tela: TelaSelva,
  tempo: number
): void {
  g.fillStyle = '#111827';
  g.fillRect(0, SUBSOLO_TOPO, LARGURA_MUNDO, ALTURA_MUNDO - SUBSOLO_TOPO);
  g.fillStyle = '#1F2937';
  g.fillRect(0, SUBSOLO_TOPO, LARGURA_MUNDO, 4);
  g.fillStyle = '#0F172A';
  g.fillRect(0, SUBSOLO_CHAO, LARGURA_MUNDO, ALTURA_MUNDO - SUBSOLO_CHAO);

  const rng = rngDaTela(SEMENTE_MUNDO, tela.indice, 0x51);

  for (let i = 0; i < 34; i++) {
    const x = Math.floor(rng() * LARGURA_MUNDO);
    const y = SUBSOLO_TOPO + 5 + Math.floor(rng() * 38);
    const tom = rng() > 0.55 ? '#263449' : '#1A2434';
    g.fillStyle = tom;
    g.fillRect(x, y, 1 + Math.floor(rng() * 3), 1 + Math.floor(rng() * 2));
  }

  for (let i = 0; i < 18; i++) {
    const x = Math.floor(rng() * LARGURA_MUNDO);
    g.fillStyle = i % 3 === 0 ? '#334155' : '#1E293B';
    g.fillRect(x, SUBSOLO_CHAO - 1, 2 + Math.floor(rng() * 4), 2);
  }

  g.fillStyle = '#0B1120';
  for (let x = 0; x < LARGURA_MUNDO; x += 12) {
    const altura = 2 + Math.floor(rng() * 4);
    g.fillRect(x, SUBSOLO_TOPO - altura, 8, altura);
  }

  for (const escada of tela.escadas) {
    desenharEscada(g, escada, tempo);
  }

  g.fillStyle = '#0B1120';
  g.fillRect(0, SUBSOLO_CHAO + 2, LARGURA_MUNDO, 1);
  g.fillStyle = '#334155';
  g.fillRect(0, SUBSOLO_CHAO + 3, LARGURA_MUNDO, 1);
}

function desenharEscada(
  g: CanvasRenderingContext2D,
  x: number,
  tempo: number
): void {
  g.fillStyle = '#1C120B';
  g.fillRect(x - 7, TRILHA_Y, 14, SUBSOLO_TOPO - TRILHA_Y);
  g.fillStyle = '#2A1A10';
  g.fillRect(x - 5, TRILHA_Y + 2, 10, SUBSOLO_TOPO - TRILHA_Y - 2);

  g.fillStyle = '#6B4A2A';
  g.fillRect(x - 4, TRILHA_Y + 1, 2, SUBSOLO_CHAO - TRILHA_Y);
  g.fillRect(x + 3, TRILHA_Y + 1, 2, SUBSOLO_CHAO - TRILHA_Y);

  g.fillStyle = '#B98A50';
  for (let y = TRILHA_Y + 4; y < SUBSOLO_CHAO - 1; y += 6) {
    g.fillRect(x - 5, y, 11, 2);
    g.fillStyle = '#8A6537';
    g.fillRect(x - 5, y + 2, 11, 1);
    g.fillStyle = '#B98A50';
  }

  g.fillStyle = 'rgba(250, 204, 21, 0.45)';
  const brilho = Math.floor(tempo * 3) % 4;
  g.fillRect(x - 2 + brilho, SUBSOLO_TOPO + 3, 1, 1);
  g.fillRect(x + 2 - brilho, SUBSOLO_TOPO + 12, 1, 1);
}
