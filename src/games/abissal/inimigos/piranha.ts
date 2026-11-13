/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Piranha-abissal: pequena e rápida, anda em cardume de 3 a 5.
 * Cada uma é destruída com 1 torpedo.
 */

import { AGUA_Y, FAIXA_ALTURA, LARGURA, PALETA } from '../constantes';
import { InimigoBase, criarInimigoBase, envolverHorizontal } from './base';

export const PIRANHA_LARGURA = 32;
export const PIRANHA_ALTURA = 16;

/** Cria um cardume de piranhas dentro de uma faixa. */
export function criarCardume(
  xInicial: number,
  faixa: number,
  velocidade: number,
  pontos: number,
  tamanho: number
): InimigoBase[] {
  const cardume: InimigoBase[] = [];
  const y = AGUA_Y + faixa * FAIXA_ALTURA + FAIXA_ALTURA / 2 - PIRANHA_ALTURA / 2;
  for (let i = 0; i < tamanho; i++) {
    const inimigo = criarInimigoBase(
      'piranha',
      xInicial - i * 40,
      y + (i % 2 === 0 ? 0 : 12),
      PIRANHA_LARGURA,
      PIRANHA_ALTURA,
      velocidade * (1 + i * 0.04),
      faixa,
      pontos
    );
    cardume.push(inimigo);
  }
  return cardume;
}

export function atualizarPiranha(inimigo: InimigoBase, dt: number): void {
  inimigo.animacao += dt;
  inimigo.x += inimigo.vx * dt;
  // Ondulação vertical
  inimigo.y += Math.sin(inimigo.animacao * 6) * 14 * dt;
  envolverHorizontal(inimigo, LARGURA);
}

export function desenharPiranha(g: CanvasRenderingContext2D, inimigo: InimigoBase): void {
  const dir = inimigo.vx >= 0 ? 1 : -1;
  g.save();
  g.translate(Math.round(inimigo.x), Math.round(inimigo.y));
  if (dir < 0) {
    g.translate(inimigo.largura, 0);
    g.scale(-1, 1);
  }

  // Corpo
  g.fillStyle = PALETA.piranha;
  g.fillRect(4, 4, 20, 8);
  g.fillRect(24, 2, 8, 12);

  // Cauda
  const cauda = Math.floor(inimigo.animacao * 12) % 2 === 0 ? 0 : 4;
  g.fillRect(-6 + cauda, 4, 10, 8);

  // Nadadeiras
  g.fillRect(12, 10, 4, 4);
  g.fillRect(20, 0, 4, 4);

  // Barriga e boca com dentes
  g.fillStyle = PALETA.piranhaEscuro;
  g.fillRect(6, 8, 18, 4);
  g.fillStyle = '#FFFFFF';
  g.fillRect(28, 4, 2, 2);
  g.fillRect(28, 10, 2, 2);

  // Olho
  g.fillStyle = '#FDE047';
  g.fillRect(24, 4, 4, 4);
  g.fillStyle = '#111827';
  g.fillRect(26, 5, 2, 2);

  g.restore();
}
