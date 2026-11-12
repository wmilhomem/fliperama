/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const TAU = Math.PI * 2;

export function aleatorio(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

export function distancia(x1: number, y1: number, x2: number, y2: number): number {
  return Math.hypot(x2 - x1, y2 - y1);
}

/**
 * Aplica o efeito de tela infinita: o que sai de uma borda entra na oposta.
 */
export function aplicarWrap(
  x: number,
  y: number,
  raio: number,
  largura: number,
  altura: number
): { x: number; y: number } {
  let nx = x;
  let ny = y;

  if (nx < -raio) nx = largura + raio;
  else if (nx > largura + raio) nx = -raio;

  if (ny < -raio) ny = altura + raio;
  else if (ny > altura + raio) ny = -raio;

  return { x: nx, y: ny };
}


