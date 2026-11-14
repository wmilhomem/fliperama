/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/** Tipos de entidades do Asa Rasante. */

export interface TiroJogador {
  x: number;
  y: number;
  vy: number;
}

export interface BombaJogador {
  x: number;
  y: number;
  vy: number;
  tempo: number;
}

export interface Explosao {
  x: number;
  y: number;
  raio: number;
  vida: number;
  maxVida: number;
  cor: string;
}

// ===== Inimigos aéreos =====
export interface Caca {
  tipo: 'caca';
  x: number;
  y: number;
  vx: number;
  vy: number;
  vida: number;
  flash: number;
}

export interface CacaMergulho {
  tipo: 'mergulho';
  x: number;
  y: number;
  vx: number;
  vy: number;
  estado: 'entrando' | 'mergulhando';
  vida: number;
  flash: number;
}

export interface Helicoptero {
  tipo: 'helicoptero';
  x: number;
  y: number;
  vx: number;
  vy: number;
  direcao: 1 | -1;
  atirou: boolean;
  vida: number;
  flash: number;
}

export interface Drone {
  tipo: 'drone';
  x: number;
  y: number;
  vx: number;
  vy: number;
  fase: number;
  vida: number;
  flash: number;
}

export type InimigoAereo = Caca | CacaMergulho | Helicoptero | Drone;

// ===== Alvos de solo =====
export interface TorreAntiaerea {
  tipo: 'torre';
  x: number;
  y: number;
  timer: number;
  vida: number;
}

export interface Caminhao {
  tipo: 'caminhao';
  x: number;
  y: number;
  vx: number;
  vida: number;
}

export interface Bunker {
  tipo: 'bunker';
  x: number;
  y: number;
  acertos: number;
}

export interface Lancha {
  tipo: 'lancha';
  x: number;
  y: number;
  vx: number;
  vida: number;
}

export type AlvoSolo = TorreAntiaerea | Caminhao | Bunker | Lancha;

// ===== Projetis inimigos =====
export interface ProjetilInimigo {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

// ===== Avião-tanque =====
export interface Tanque {
  x: number;
  y: number;
  vx: number;
  vy: number;
  ativo: boolean;
  proximaEm: number; // segundos até o próximo aparecimento
  aviso: boolean; // tocou o aviso sonoro
}

// ===== Asa do jogador =====
export interface Aviao {
  x: number;
  y: number;
  velocidadeX: number;
  inclinacao: number;
  helice: number; // frame da hélice
  cooldown: number;
  cooldownBomba: number;
  invulneravel: number;
}

// ===== Radar central (chefe) =====
export interface CentralRadar {
  ativo: boolean;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  torres: Array<{ x: number; y: number; timer: number }>;
  giro: number;
}

// ===== Partículas =====
export interface Particula {
  x: number;
  y: number;
  vx: number;
  vy: number;
  vida: number;
  cor: string;
  tamanho: number;
}

export interface TextoFlutuante {
  x: number;
  y: number;
  texto: string;
  cor: string;
  vida: number;
}
