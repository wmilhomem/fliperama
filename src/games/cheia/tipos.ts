/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type EstadoJogo = 'titulo' | 'jogando' | 'transicao' | 'gameOver';

export type EstadoJogador =
  | 'parado'
  | 'andando'
  | 'pulando'
  | 'afogando'
  | 'comemorando';

export interface Pulo {
  destinoFileira: number;
  origemY: number;
  destinoY: number;
  tempo: number;
  duracao: number;
  altura: number;
}

export interface Jogador {
  x: number;
  y: number;
  fileira: number;
  direcao: -1 | 1;
  estado: EstadoJogador;
  tempoAnim: number;
  plataformaId: number | null;
  pulo: Pulo | null;
  invulneravel: number;
  tempoAfogando: number;
}

export type TipoPlataforma = 'lirio' | 'tartaruga';
export type EstadoTartaruga = 'flutuando' | 'aviso' | 'submersa' | 'subindo';

export interface Plataforma {
  id: number;
  fileira: number;
  x: number;
  y: number;
  largura: number;
  altura: number;
  direcao: -1 | 1;
  velocidade: number;
  tipo: TipoPlataforma;
  florida: boolean;
  estadoTartaruga: EstadoTartaruga;
  tempoCiclo: number;
  tremor: number;
  xAnterior: number;
  wrapou: boolean;
  submergiuAgora: boolean;
}

export interface Gaviao {
  x: number;
  y: number;
  vx: number;
  largura: number;
  altura: number;
  tempo: number;
  fileiraVisual: number;
}

export interface Piranha {
  x: number;
  y: number;
  vy: number;
  largura: number;
  altura: number;
  vida: number;
  tempo: number;
}

export interface Siri {
  x: number;
  y: number;
  fileira: number;
  velocidade: number;
  direcao: -1 | 1;
  largura: number;
  altura: number;
  tempo: number;
}

export interface Onca {
  x: number;
  y: number;
  velocidade: number;
  direcao: -1 | 1;
  largura: number;
  altura: number;
  ativa: boolean;
  tempo: number;
  rugiu: boolean;
}

export interface Peixe {
  x: number;
  y: number;
  vx: number;
  vy: number;
  largura: number;
  altura: number;
  tempo: number;
  brilho: number;
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
  tipo: 'quadrado' | 'circulo';
}

export interface TextoFlutuante {
  x: number;
  y: number;
  texto: string;
  cor: string;
  vida: number;
}

export interface MedidorCheia {
  inicial: number;
  restante: number;
  timerAlerta: number;
}
