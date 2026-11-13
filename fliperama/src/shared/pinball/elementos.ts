/**
 * @license
 * SPDX-license-identifier: Apache-2.0
 */
export type TipoElemento = 'bumper' | 'slingshot' | 'alvo' | 'pinball';

export interface BumperPop {
  x: number;
  y: number;
  raio: number;
  cor: string;
}

export interface Alvo {
  x: number;
  y: number;
  valor: number;
  destruido: boolean;
}

export interface Spinner {
  x: number;
  y: number;
  largura: number;
  altura: number;
  giro: number;
}