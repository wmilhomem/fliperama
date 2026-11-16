/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/** Tipos de entidades do Asa Rasante — campanha de missões. */

export interface TiroJogador {
  x: number;
  y: number;
  vy: number;
}

export interface MissilJogador {
  x: number;
  y: number;
  vy: number;
}

export interface Explosao {
  x: number;
  y: number;
  raio: number;
  vida: number;
  maxVida: number;
  cor: string;
}

// ===== Helicóptero do jogador =====
export interface HelicopteroJogador {
  x: number;
  y: number;
  /** Inclinação visual ao manobrar. */
  inclinacao: number;
  /** Rotação do rotor principal (0..2) para animação de giro. */
  rotor: number;
  /** Cooldown das balas (segundos). */
  cooldown: number;
  /** Cooldown dos mísseis (segundos). */
  cooldownMissil: number;
  /** Segundos restantes de invulnerabilidade após dano. */
  invulneravel: number;
}

// ===== Armadura =====
export interface EstadoArmadura {
  /** Pontos de armadura restantes (0..ARMADURA_MAX, passo de 1 = meio ícone). */
  pontos: number;
}

// ===== Inimigos e alvos =====
export interface DronePatrulha {
  tipo: 'dronePatrulha';
  x: number;
  y: number;
  vx: number;
  vy: number;
  vida: number;
  flash: number;
}

export interface BateriaAntiaerea {
  tipo: 'bateria';
  x: number;
  y: number;
  timer: number;
  vida: number;
  flash: number;
}

export type InimigoAereo = DronePatrulha;
export type AlvoSolo = BateriaAntiaerea;

// Mísseis guiados inimigos
export interface MissilInimigo {
  x: number;
  y: number;
  vx: number;
  vy: number;
  vida: number; // segundos restantes
}

// ===== Avião-tanque =====
export interface Tanque {
  x: number;
  y: number;
  vx: number;
  vy: number;
  ativo: boolean;
  proximaEm: number; // segundos até o próximo aparecimento
  aviso: boolean;
  recarregando: number; // segundos restantes de conexão (-1 se vazio)
}

// ===== Partículas e textos flutuantes =====
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

// ===== Estado geral da partida =====
export type EstadoJogo =
  | 'ficha'
  | 'decolagem'
  | 'percurso'
  | 'preChefe'
  | 'duelo'
  | 'explosaoChefe'
  | 'pouso'
  | 'resumo'
  | 'final'
  | 'gameOver';
