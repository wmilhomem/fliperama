/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Estrela {
  x: number;
  y: number;
  fase: number;
  velocidade: number;
}

export interface Nave {
  x: number;
  y: number;
  vx: number;
  vy: number;
  angulo: number;
  raio: number;
  invulneravel: number;
  acelerando: boolean;
  timerPropulsor: number;
  timerTiro: number;
  recargaSalto: number;
  tempoDuplo: number;
}

export type TamanhoRocha = 'grande' | 'media' | 'pequena';

export interface Rocha {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  raio: number;
  tamanho: TamanhoRocha;
  rotacao: number;
  velRotacao: number;
  forma: number[];
}

export type OrigemTiro = 'jogador' | 'pirata';

export interface Tiro {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  raio: number;
  vida: number;
  maxVida: number;
  origem: OrigemTiro;
}

export interface Cristal {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  raio: number;
  vida: number;
  maxVida: number;
}

export type TipoPirata = 'grande' | 'pequeno';

export interface Pirata {
  id: number;
  tipo: TipoPirata;
  x: number;
  y: number;
  vx: number;
  vy: number;
  raio: number;
  angulo: number;
  timerTiro: number;
  intervaloTiro: number;
}

export interface Particula {
  x: number;
  y: number;
  vx: number;
  vy: number;
  vida: number;
  maxVida: number;
  cor: string;
  comprimento: number;
}
