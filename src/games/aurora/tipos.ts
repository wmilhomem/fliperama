/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type EstadoJogo = 'titulo' | 'jogando' | 'transicao' | 'gameOver';

export type TipoAve = 'grande' | 'pequena' | 'escudo' | 'mergulho';

export interface Canhao {
  x: number;
  y: number;
  recuo: number;
  calor: number;
  travado: number;
  cooldown: number;
}

export interface Ave {
  id: number;
  tipo: TipoAve;
  x: number;
  y: number;
  baseX: number;
  largura: number;
  altura: number;
  hp: number;
  hpMax: number;
  tempo: number;
  fase: number;
  amplitude: number;
  frequencia: number;
  velocidadeQueda: number;
  podeAtirar: boolean;
  timerTiro: number;
  intervaloBaseTiro: number;
  timerMergulho: number;
  mergulhando: boolean;
  vx: number;
  vy: number;
  flash: number;
  remover: boolean;
}

export interface Chefe {
  x: number;
  y: number;
  largura: number;
  altura: number;
  hp: number;
  hpMax: number;
  tempo: number;
  fase: number;
  timerTiro: number;
  timerFilhote: number;
  flash: number;
}

export interface TiroJogador {
  x: number;
  y: number;
  vy: number;
}

export interface Orbe {
  x: number;
  y: number;
  vx: number;
  vy: number;
  raio: number;
  tempo: number;
  cor: string;
  remover: boolean;
}

export interface Particula {
  x: number;
  y: number;
  vx: number;
  vy: number;
  vida: number;
  vidaMax: number;
  tamanho: number;
  cor: string;
  gravidade: number;
}

export interface TextoFlutuante {
  x: number;
  y: number;
  texto: string;
  cor: string;
  vida: number;
  vidaMax: number;
}
