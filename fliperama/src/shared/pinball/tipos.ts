/**
 * @license
 * SPDX-license-identifier: Apache-2.0
 */
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

/** Tipos de elementos da mesa. */
export type TipoElemento = 'bumper' | 'slingshot' | 'alvo' | 'trilho' | 'pinball';