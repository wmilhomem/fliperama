/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Água-viva elétrica: sobe e desce devagar entre duas faixas e dá choque
 * ao toque. Só pode ser destruída por torpedo.
 */

import { AGUA_Y, FAIXA_ALTURA, PALETA } from '../constantes';
import { InimigoBase, criarInimigoBase } from './base';

export const AGUA_VIVA_LARGURA = 32;
export const AGUA_VIVA_ALTURA = 32;

export function criarAguaViva(
  x: number,
  faixa: number,
  velocidade: number,
  pontos: number
): InimigoBase {
  const y = AGUA_Y + faixa * FAIXA_ALTURA + FAIXA_ALTURA / 2 - AGUA_VIVA_ALTURA / 2;
  const inimigo = criarInimigoBase(
    'aguaviva',
    x,
    y,
    AGUA_VIVA_LARGURA,
    AGUA_VIVA_ALTURA,
    velocidade,
    faixa,
    pontos
  );
  return inimigo;
}

/** Atualiza a água-viva (sobe/desce entre duas faixas). */
export function atualizarAguaViva(
  inimigo: InimigoBase,
  dt: number,
  yMinimo: number,
  yMaximo: number
): void {
  inimigo.animacao += dt;
  inimigo.x += inimigo.vx * dt;
  inimigo.y += Math.sin(inimigo.animacao * 1.1) * 18 * dt;

  if (inimigo.y < yMinimo) {
    inimigo.y = yMinimo;
  }
  if (inimigo.y > yMaximo) {
    inimigo.y = yMaximo;
  }
}

export function desenharAguaViva(g: CanvasRenderingContext2D, inimigo: InimigoBase): void {
  g.save();
  g.translate(Math.round(inimigo.x), Math.round(inimigo.y));

  const pulso = 0.6 + 0.4 * Math.sin(inimigo.animacao * 4);

  // Domo
  g.fillStyle = PALETA.aguaViva;
  g.beginPath();
  g.arc(16, 14, 14, Math.PI, 0);
  g.lineTo(30, 22);
  g.lineTo(2, 22);
  g.closePath();
  g.fill();

  // Brilho interno
  g.globalAlpha = pulso * 0.55;
  g.fillStyle = PALETA.aguaVivaBrilho;
  g.beginPath();
  g.arc(16, 12, 8, Math.PI, 0);
  g.lineTo(24, 18);
  g.lineTo(8, 18);
  g.closePath();
  g.fill();
  g.globalAlpha = 1;

  // Tentáculos
  g.fillStyle = PALETA.aguaViva;
  for (let i = 0; i < 4; i++) {
    const onda = Math.sin(inimigo.animacao * 5 + i) * 2;
    g.fillRect(5 + i * 7 + onda, 22, 3, 10);
  }

  // Núcleo elétrico
  g.fillStyle = `rgba(250, 204, 21, ${pulso})`;
  g.fillRect(14, 10, 4, 4);

  g.restore();
}
