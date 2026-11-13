/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Tubarão-lanterna: cruza a faixa em linha reta com um brilho na
 * ponta da nadadeira. Destruído com 1 torpedo.
 */

import { AGUA_Y, FAIXA_ALTURA, LARGURA, PALETA } from '../constantes';
import { InimigoBase, criarInimigoBase, envolverHorizontal } from './base';

export const TUBARAO_LARGURA = 64;
export const TUBARAO_ALTURA = 32;

export function criarTubarao(x: number, faixa: number, velocidade: number, pontos: number): InimigoBase {
  const y = AGUA_Y + faixa * FAIXA_ALTURA + FAIXA_ALTURA / 2 - TUBARAO_ALTURA / 2;
  const inimigo = criarInimigoBase(
    'tubarao',
    x,
    y,
    TUBARAO_LARGURA,
    TUBARAO_ALTURA,
    velocidade,
    faixa,
    pontos
  );
  return inimigo;
}

export function atualizarTubarao(inimigo: InimigoBase, dt: number): void {
  inimigo.animacao += dt;
  inimigo.x += inimigo.vx * dt;
  envolverHorizontal(inimigo, LARGURA);
}

export function desenharTubarao(g: CanvasRenderingContext2D, inimigo: InimigoBase): void {
  const dir = inimigo.vx >= 0 ? 1 : -1;
  g.save();
  g.translate(Math.round(inimigo.x), Math.round(inimigo.y));
  if (dir < 0) {
    g.translate(inimigo.largura, 0);
    g.scale(-1, 1);
  }

  // Corpo
  g.fillStyle = PALETA.tubarao;
  g.fillRect(8, 8, 40, 18);
  g.fillRect(0, 12, 12, 12);
  g.fillRect(44, 4, 16, 12);

  // Barriga clara
  g.fillStyle = PALETA.tubaraoClaro;
  g.fillRect(10, 20, 34, 4);

  // Dorsal
  g.fillStyle = PALETA.tubarao;
  g.fillRect(22, 0, 8, 8);

  // Cauda
  const cauda = Math.floor(inimigo.animacao * 6) % 2 === 0 ? 0 : 4;
  g.fillRect(-10 + cauda, 8, 12, 16);
  g.fillRect(-14 + cauda, 4, 8, 8);
  g.fillRect(-14 + cauda, 20, 8, 8);

  // Nadadeira inferior
  g.fillRect(18, 26, 8, 6);

  // Brilho na ponta da nadadeira (lanterna)
  const brilho = 0.5 + 0.5 * Math.sin(inimigo.animacao * 8);
  g.fillStyle = `rgba(254, 249, 195, ${brilho})`;
  g.fillRect(56, 6, 8, 8);
  g.globalAlpha = brilho * 0.35;
  g.fillStyle = '#FEF9C3';
  g.fillRect(52, 2, 16, 16);
  g.globalAlpha = 1;

  // Olho
  g.fillStyle = '#FDE047';
  g.fillRect(48, 8, 4, 4);

  // Dentes
  g.fillStyle = '#FFFFFF';
  g.fillRect(56, 18, 4, 4);

  g.restore();
}
