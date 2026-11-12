/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Nave {
  x: number;
  y: number;
  raio: number;
  invulneravel: number;
  timerTiro: number;
  acelerando: boolean;
  desacelerando: boolean;
  inclinacao: number;
}

export type OrigemTiro = 'jogador' | 'inimigo';

export interface Tiro {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  raio: number;
  origem: OrigemTiro;
  dano: number;
  vida: number;
}

export type TipoInimigo = 'lancha' | 'patrulha' | 'helicoptero' | 'drone' | 'garca';

export interface Inimigo {
  id: number;
  tipo: TipoInimigo;
  x: number;
  d: number;
  y: number;
  raio: number;
  hp: number;
  pontos: number;
  vd: number;
  vx: number;
  baseX: number;
  amplitude: number;
  fase: number;
  timerTiro: number;
  intervaloTiro: number;
}

export type TipoObstaculo = 'tronco' | 'pedra';

export interface Obstaculo {
  id: number;
  tipo: TipoObstaculo;
  x: number;
  d: number;
  y: number;
  raio: number;
  rotacao: number;
  velRotacao: number;
}

export interface Tanque {
  id: number;
  x: number;
  d: number;
  y: number;
  raio: number;
  restante: number;
}

export interface Barreira {
  x: number;
  y: number;
  d: number;
  largura: number;
  altura: number;
  hp: number;
  hpMax: number;
  timerTiro: number;
  travada: boolean;
}

export interface Particula {
  x: number;
  y: number;
  vx: number;
  vy: number;
  vida: number;
  maxVida: number;
  cor: string;
  tamanho: number;
}

export interface DisparoInimigo {
  x: number;
  y: number;
  angulo: number;
  velocidade: number;
}

export interface AmostraRio {
  d: number;
  centro: number;
  largura: number;
  ilhaLargura: number;
  esquerda: number;
  direita: number;
}

export interface IlhaRio {
  inicio: number;
  fim: number;
  largura: number;
}

export interface SecaoRio {
  numero: number;
  comprimento: number;
  inicio: number;
  fim: number;
  passo: number;
  amostras: AmostraRio[];
  ilhas: IlhaRio[];
}

export type TipoDecoracao = 'arvore' | 'palafita' | 'pedra' | 'moita';

export interface Decoracao {
  tipo: TipoDecoracao;
  x: number;
  d: number;
  variacao: number;
}

export interface Agenda {
  timerInimigo: number;
  timerObstaculo: number;
  timerTanque: number;
}

export type EventoSpawn = 'inimigo' | 'obstaculo' | 'tanque';
