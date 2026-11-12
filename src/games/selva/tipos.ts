/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Camada = 'superficie' | 'subsolo';

export type TipoTela =
  | 'livre'
  | 'tronco'
  | 'fileira'
  | 'jacare'
  | 'cipo'
  | 'areia'
  | 'cobra'
  | 'fogueira';

export type TipoTesouro = 'bau' | 'barra' | 'anel' | 'diamante' | 'pulseira';

export type EstadoJogo = 'titulo' | 'jogando' | 'morrendo' | 'resultado';

export type EstadoVisual =
  | 'parado'
  | 'andando'
  | 'pulando'
  | 'caindo'
  | 'escada'
  | 'cipo'
  | 'derrotado';

export interface Tesouro {
  id: string;
  tela: number;
  camada: Camada;
  x: number;
  y: number;
  tipo: TipoTesouro;
  valor: number;
}

export interface Jacare {
  x: number;
  largura: number;
  fase: number;
}

export interface TroncoObstaculo {
  tipo: 'tronco';
  x: number;
  y: number;
  largura: number;
  altura: number;
  vx: number;
}

export interface FileiraObstaculo {
  tipo: 'fileira';
  x: number;
  y: number;
  largura: number;
  altura: number;
  troncos: number[];
}

export interface JacareObstaculo {
  tipo: 'jacare';
  x: number;
  largura: number;
  jacares: Jacare[];
}

export interface CipoObstaculo {
  tipo: 'cipo';
  x: number;
  largura: number;
  ancoraX: number;
  ancoraY: number;
  comprimento: number;
  fase: number;
}

export interface AreiaObstaculo {
  tipo: 'areia';
  x: number;
  largura: number;
}

export interface CobraObstaculo {
  tipo: 'cobra';
  x: number;
  y: number;
  largura: number;
  altura: number;
}

export interface FogueiraObstaculo {
  tipo: 'fogueira';
  x: number;
  y: number;
  largura: number;
  altura: number;
  fase: number;
}

export type Obstaculo =
  | TroncoObstaculo
  | FileiraObstaculo
  | JacareObstaculo
  | CipoObstaculo
  | AreiaObstaculo
  | CobraObstaculo
  | FogueiraObstaculo;

export interface Escorpiao {
  id: number;
  x: number;
  y: number;
  vx: number;
  largura: number;
  altura: number;
}

export interface Parede {
  x: number;
  largura: number;
}

export interface TelaSelva {
  indice: number;
  semente: number;
  tipo: TipoTela;
  obstaculos: Obstaculo[];
  escorpioes: Escorpiao[];
  parede: Parede | null;
  escadas: number[];
}

export interface MundoSelva {
  telas: TelaSelva[];
  tesouros: Tesouro[];
}

export interface Explorador {
  x: number;
  y: number;
  vx: number;
  vy: number;
  virado: 1 | -1;
  noChao: boolean;
  emEscada: boolean;
  emCipo: boolean;
  estado: EstadoVisual;
  tempoAnim: number;
  tempoPasso: number;
  atordoado: number;
  invulneravel: number;
  danoCooldown: number;
}

export interface Particula {
  x: number;
  y: number;
  vx: number;
  vy: number;
  vida: number;
  vidaMax: number;
  cor: string;
  tamanho: number;
  gravidade: number;
}

export interface CipoAtual {
  obstaculo: CipoObstaculo;
  anteriorX: number;
  anteriorY: number;
}
