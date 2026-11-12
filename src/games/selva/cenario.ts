/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ALTURA,
  HUD_ALTURA,
  LARGURA,
  SEMENTE_MUNDO,
  SUBSOLO_TOPO,
  TRILHA_Y,
} from './constantes';
import { rngDaTela } from './semente';
import { TelaSelva } from './tipos';

export function desenharCenario(
  g: CanvasRenderingContext2D,
  tela: TelaSelva,
  tempo: number
): void {
  g.fillStyle = '#0A2A1C';
  g.fillRect(0, HUD_ALTURA, LARGURA, ALTURA - HUD_ALTURA);

  g.fillStyle = '#123D29';
  g.fillRect(0, HUD_ALTURA, LARGURA, 34);
  g.fillStyle = '#174A31';
  g.fillRect(0, HUD_ALTURA + 34, LARGURA, 26);

  const rng = rngDaTela(SEMENTE_MUNDO, tela.indice, 0x31);

  const solX = 54 + Math.floor(rng() * 40);
  g.fillStyle = 'rgba(250, 204, 21, 0.16)';
  g.fillRect(solX - 18, HUD_ALTURA + 10, 42, 22);
  g.fillStyle = '#FDE68A';
  g.fillRect(solX, HUD_ALTURA + 14, 11, 11);
  g.fillStyle = '#FEF3C7';
  g.fillRect(solX + 2, HUD_ALTURA + 16, 7, 7);

  for (let i = 0; i < 6; i++) {
    const x = Math.floor(rng() * LARGURA);
    const y = HUD_ALTURA + 16 + Math.floor(rng() * 24);
    const largura = 26 + Math.floor(rng() * 26);
    const altura = 11 + Math.floor(rng() * 9);

    g.fillStyle = '#0E3322';
    g.fillRect(x - largura / 2, y, largura, altura);
    g.fillStyle = '#12402A';
    g.fillRect(x - largura / 2 + 4, y - 4, largura - 8, altura - 4);
  }

  const troncos = [30, 92, 158, 226, 292];

  for (let i = 0; i < troncos.length; i++) {
    const x = troncos[i] + Math.floor(rng() * 9);
    const altura = 55 + Math.floor(rng() * 34);
    const largura = 8 + Math.floor(rng() * 4);

    g.fillStyle = '#1C2F1B';
    g.fillRect(x, TRILHA_Y - altura, largura, altura);
    g.fillStyle = '#294A26';
    g.fillRect(x + 2, TRILHA_Y - altura, 2, altura);

    const copaY = TRILHA_Y - altura - 9;
    g.fillStyle = '#1F5A35';
    g.fillRect(x - 13, copaY + 4, 33, 11);
    g.fillRect(x - 8, copaY - 4, 22, 10);
    g.fillStyle = '#2C7A45';
    g.fillRect(x - 7, copaY - 2, 19, 7);
    g.fillStyle = '#4CAF50';
    g.fillRect(x - 3, copaY - 5, 10, 4);
    g.fillStyle = '#86EFAC';
    g.fillRect(x + 1, copaY - 4, 3, 2);
  }

  for (let i = 0; i < 8; i++) {
    const x = 15 + Math.floor(rng() * (LARGURA - 30));
    const altura = 20 + Math.floor(rng() * 40);
    const balanco = Math.sin(tempo * 0.9 + i) * 3;
    g.fillStyle = i % 2 === 0 ? '#1E6B3F' : '#2C8A4E';
    g.fillRect(x + balanco, HUD_ALTURA, 1, altura);
    g.fillRect(x + balanco - 2, HUD_ALTURA + altura * 0.45, 5, 2);
    g.fillRect(x + balanco - 1, HUD_ALTURA + altura * 0.7, 4, 2);
  }

  g.fillStyle = '#5B3A1E';
  g.fillRect(0, TRILHA_Y, LARGURA, SUBSOLO_TOPO - TRILHA_Y);
  g.fillStyle = '#6F4A27';
  g.fillRect(0, TRILHA_Y + 3, LARGURA, SUBSOLO_TOPO - TRILHA_Y - 3);
  g.fillStyle = '#7ED957';
  g.fillRect(0, TRILHA_Y - 2, LARGURA, 4);
  g.fillStyle = '#4CAF50';
  g.fillRect(0, TRILHA_Y, LARGURA, 2);
  g.fillStyle = '#B6F36A';
  for (let x = 2; x < LARGURA; x += 9) {
    const altura = 2 + Math.floor(rng() * 4);
    g.fillRect(x, TRILHA_Y - altura, 2, altura);
  }

  g.fillStyle = '#4A2E19';
  for (let i = 0; i < 15; i++) {
    const x = Math.floor(rng() * LARGURA);
    const y = TRILHA_Y + 7 + Math.floor(rng() * 17);
    g.fillRect(x, y, 2 + Math.floor(rng() * 4), 2);
  }

  g.fillStyle = '#8A6537';
  for (let i = 0; i < 5; i++) {
    const x = 12 + Math.floor(rng() * (LARGURA - 24));
    g.fillRect(x, TRILHA_Y + 5, 1, 5 + Math.floor(rng() * 6));
  }

  for (let i = 0; i < 4; i++) {
    const x = 24 + rng() * (LARGURA - 48);
    const y = 58 + rng() * 46 + Math.sin(tempo * 2 + i) * 2;
    g.fillStyle = 'rgba(250, 204, 21, 0.7)';
    g.fillRect(Math.round(x), Math.round(y), 1, 1);
  }
}
