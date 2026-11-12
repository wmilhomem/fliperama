/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FILEIRAS_Y, LARGURA } from './constantes';
import { Gaviao } from './tipos';

function reiniciarGaviao(gaviao: Gaviao, fase: number, indice: number): void {
  const daEsquerda = (indice + fase) % 2 === 0;
  const fileira = (indice + fase) % FILEIRAS_Y.length;
  gaviao.x = daEsquerda ? -24 : LARGURA + 24;
  gaviao.y = FILEIRAS_Y[fileira] - 28 + (indice % 2) * 12;
  gaviao.vx = (daEsquerda ? 1 : -1) * (58 + fase * 8 + Math.random() * 18);
  gaviao.largura = 28;
  gaviao.altura = 14;
  gaviao.tempo = Math.random() * 2;
  gaviao.fileiraVisual = fileira;
}

export function criarGavioes(fase: number): Gaviao[] {
  const total = Math.min(4, 1 + Math.floor((fase - 1) / 2));
  const gavioes: Gaviao[] = [];

  for (let i = 0; i < total; i++) {
    const gaviao: Gaviao = {
      x: 0,
      y: 0,
      vx: 0,
      largura: 28,
      altura: 14,
      tempo: 0,
      fileiraVisual: 0,
    };
    reiniciarGaviao(gaviao, fase, i);
    if (i === 0) {
      gaviao.x = 90 + Math.random() * 260;
      gaviao.vx = (i % 2 === 0 ? 1 : -1) * (58 + fase * 8);
    }
    gavioes.push(gaviao);
  }

  return gavioes;
}

export function atualizarGavioes(gavioes: Gaviao[], dt: number, fase: number): void {
  for (let i = 0; i < gavioes.length; i++) {
    const g = gavioes[i];
    g.x += g.vx * dt;
    g.tempo += dt;

    if (g.x < -40 || g.x > LARGURA + 40) {
      reiniciarGaviao(g, fase, i);
    }
  }
}

export function desenharGavioes(
  g: CanvasRenderingContext2D,
  gavioes: Gaviao[],
  tempo: number
): void {
  for (const gaviao of gavioes) {
    const x = Math.floor(gaviao.x);
    const y = Math.floor(gaviao.y);
    const asa = Math.floor(tempo * 10 + gaviao.tempo * 5) % 2 === 0;

    g.save();
    g.translate(x, y);
    if (gaviao.vx < 0) {
      g.scale(-1, 1);
    }

    g.fillStyle = '#78350F';
    g.fillRect(-12, -2, 24, 4);
    g.fillStyle = '#D97706';
    g.fillRect(-8, -6, 16, 8);
    g.fillStyle = '#FDE68A';
    g.fillRect(-4, -4, 8, 4);

    g.fillStyle = '#92400E';
    if (asa) {
      g.fillRect(-16, -8, 10, 3);
      g.fillRect(-14, -6, 8, 3);
      g.fillRect(6, -8, 10, 3);
      g.fillRect(6, -6, 8, 3);
    } else {
      g.fillRect(-14, -12, 9, 3);
      g.fillRect(-12, -9, 8, 3);
      g.fillRect(5, -12, 9, 3);
      g.fillRect(4, -9, 8, 3);
    }

    g.fillStyle = '#1F2937';
    g.fillRect(8, -4, 2, 2);
    g.fillStyle = '#FACC15';
    g.fillRect(12, -2, 5, 2);
    g.fillStyle = '#7C2D12';
    g.fillRect(-4, 2, 2, 3);
    g.fillRect(2, 2, 2, 3);

    g.restore();
  }
}
