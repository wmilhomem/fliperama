/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LARGURA_MUNDO, SUBSOLO_CHAO, SUBSOLO_TOPO } from '../constantes';
import { Escorpiao, Explorador, Parede } from '../tipos';

export function atualizarEscorpiao(
  escorpiao: Escorpiao,
  dt: number,
  parede: Parede | null
): void {
  escorpiao.x += escorpiao.vx * dt;

  let minimo = 26;
  let maximo = LARGURA_MUNDO - 26;

  if (parede) {
    if (escorpiao.x + escorpiao.largura < parede.x) {
      maximo = parede.x - 4;
    } else if (escorpiao.x > parede.x + parede.largura) {
      minimo = parede.x + parede.largura + 4;
    } else if (escorpiao.vx > 0) {
      escorpiao.x = parede.x - 4 - escorpiao.largura;
      escorpiao.vx = -Math.abs(escorpiao.vx);
    } else {
      escorpiao.x = parede.x + parede.largura + 4;
      escorpiao.vx = Math.abs(escorpiao.vx);
    }
  }

  if (escorpiao.x < minimo) {
    escorpiao.x = minimo;
    escorpiao.vx = Math.abs(escorpiao.vx);
  } else if (escorpiao.x + escorpiao.largura > maximo) {
    escorpiao.x = maximo - escorpiao.largura;
    escorpiao.vx = -Math.abs(escorpiao.vx);
  }

  escorpiao.y = SUBSOLO_CHAO - escorpiao.altura;
}

export function colideEscorpiao(jogador: Explorador, escorpiao: Escorpiao): boolean {
  return (
    jogador.x + 5 > escorpiao.x &&
    jogador.x - 5 < escorpiao.x + escorpiao.largura &&
    jogador.y > escorpiao.y &&
    jogador.y - 17 < escorpiao.y + escorpiao.altura
  );
}

export function desenharEscorpiao(
  g: CanvasRenderingContext2D,
  escorpiao: Escorpiao,
  tempo: number
): void {
  const x = Math.round(escorpiao.x);
  const y = Math.round(escorpiao.y);
  const perna = Math.floor(tempo * 10) % 2;

  g.fillStyle = '#7C2D12';
  g.fillRect(x + 1, y + 1, escorpiao.largura - 2, 3);
  g.fillStyle = '#EA580C';
  g.fillRect(x + 2, y, escorpiao.largura - 4, 2);
  g.fillStyle = '#FDBA74';
  g.fillRect(x + 4, y + 1, 2, 1);

  for (let i = 0; i < 3; i++) {
    g.fillStyle = '#9A3412';
    g.fillRect(x + 2 + i * 3, y + 3 + perna, 2, 2);
    g.fillRect(x + 2 + i * 3, y + 3 + (1 - perna), 2, 1);
  }

  g.fillStyle = '#7C2D12';
  g.fillRect(x + escorpiao.largura - 1, y - 2, 3, 4);
  g.fillRect(x + escorpiao.largura + 1, y - 3, 2, 2);
  g.fillStyle = '#F97316';
  g.fillRect(x - 1, y + 1, 2, 1);

  g.fillStyle = '#111827';
  g.fillRect(x + 4, y + 1, 1, 1);
  g.fillRect(x + 8, y + 1, 1, 1);
}

export function desenharTrilhoSubsolo(g: CanvasRenderingContext2D): void {
  g.fillStyle = '#1F2937';
  g.fillRect(0, SUBSOLO_CHAO, LARGURA_MUNDO, 2);
  g.fillStyle = '#111827';
  g.fillRect(0, SUBSOLO_CHAO + 2, LARGURA_MUNDO, 10);
  g.fillStyle = '#374151';
  for (let x = 8; x < LARGURA_MUNDO; x += 24) {
    g.fillRect(x, SUBSOLO_TOPO + 2, 1, 4);
    g.fillRect(x + 8, SUBSOLO_CHAO - 1, 3, 1);
  }
}
