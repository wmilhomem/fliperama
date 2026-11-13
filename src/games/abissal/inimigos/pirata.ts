/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Submarino pirata: pequeno, vermelho, dispara torpedos na horizontal
 * dentro da própria faixa. Destruído com 1 torpedo.
 */

import { AGUA_Y, FAIXA_ALTURA, LARGURA, PALETA } from '../constantes';
import { InimigoBase, criarInimigoBase, envolverHorizontal } from './base';

export const PIRATA_LARGURA = 32;
export const PIRATA_ALTURA = 16;
export const TORPEDO_PIRATA_LARGURA = 16;
export const TORPEDO_PIRATA_ALTURA = 8;
export const VELOCIDADE_TORPEDO_PIRATA = 200;

export interface TorpedoPirata {
  x: number;
  y: number;
  vx: number;
  vida: number;
}

export function criarPirata(x: number, faixa: number, velocidade: number, pontos: number): InimigoBase {
  const y = AGUA_Y + faixa * FAIXA_ALTURA + FAIXA_ALTURA / 2 - PIRATA_ALTURA / 2;
  return criarInimigoBase(
    'pirata',
    x,
    y,
    PIRATA_LARGURA,
    PIRATA_ALTURA,
    velocidade,
    faixa,
    pontos
  );
}

/** Atualiza o pirata e devolve os torpedos disparados neste quadro. */
export function atualizarPirata(
  inimigo: InimigoBase,
  dt: number,
  tempoDisparo: number
): TorpedoPirata[] {
  inimigo.animacao += dt;
  inimigo.x += inimigo.vx * dt;
  inimigo.tempoTiro -= dt;
  envolverHorizontal(inimigo, LARGURA);

  const torpedos: TorpedoPirata[] = [];
  if (inimigo.tempoTiro <= 0) {
    inimigo.tempoTiro = Math.max(1.1, tempoDisparo);
    const dir = inimigo.vx >= 0 ? 1 : -1;
    torpedos.push({
      x: dir > 0 ? inimigo.x + inimigo.largura : inimigo.x - TORPEDO_PIRATA_LARGURA,
      y: inimigo.y + inimigo.altura / 2 - TORPEDO_PIRATA_ALTURA / 2,
      vx: dir * VELOCIDADE_TORPEDO_PIRATA,
      vida: 4,
    });
  }
  return torpedos;
}

export function desenharPirata(g: CanvasRenderingContext2D, inimigo: InimigoBase): void {
  const dir = inimigo.vx >= 0 ? 1 : -1;
  g.save();
  g.translate(Math.round(inimigo.x), Math.round(inimigo.y));
  if (dir < 0) {
    g.translate(inimigo.largura, 0);
    g.scale(-1, 1);
  }

  // Casco vermelho
  g.fillStyle = PALETA.vermelhoEscuro;
  g.fillRect(0, 2, 32, 12);
  g.fillStyle = PALETA.vermelho;
  g.fillRect(2, 3, 28, 8);

  // Cabine e torre
  g.fillStyle = '#7F1D1D';
  g.fillRect(10, 0, 10, 4);
  g.fillStyle = '#FCA5A5';
  g.fillRect(22, 4, 4, 4);

  // Hélice
  const giro = Math.floor(inimigo.animacao * 10) % 2 === 0 ? 0 : 3;
  g.fillStyle = PALETA.metalEscuro;
  g.fillRect(-4 + giro, 4, 5, 8);

  g.restore();
}

export function desenharTorpedoPirata(g: CanvasRenderingContext2D, t: TorpedoPirata): void {
  g.save();
  g.fillStyle = '#F87171';
  g.fillRect(Math.round(t.x), Math.round(t.y), TORPEDO_PIRATA_LARGURA, 4);
  g.fillStyle = '#FECACA';
  g.fillRect(Math.round(t.x), Math.round(t.y) + 4, TORPEDO_PIRATA_LARGURA, 2);
  g.restore();
}
