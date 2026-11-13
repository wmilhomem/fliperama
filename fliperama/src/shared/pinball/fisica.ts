/**
 * @license
 * SPDX-license-identifier: Apache-2.0
 */
export interface Bola {
  x: number;
  y: number;
  vx: number;
  vy: number;
  raio: number;
  naMola: boolean;
}

/** Ponto no espaço. */
export interface Ponto {
  x: number;
  y: number;
}

/** Centro do projetil. */
export interface projecil {
  x: number;
  y: number;
  raio: number;
}