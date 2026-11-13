/**
 * Tipo de elemento do pino.
 */
export type TipoElemento = 'bumper' | 'slingshot' | 'alvo' | 'pinball';

export interface BumperPop {
  x: number;
  y: number;
  raio: number;
  cor: string;
}

/** Tipo de célula do tabuleiro. */
export type Celula = 'livre' | 'bomba' | 'estrela';

export interface Jogada {
  x: number;
  y: number;
}

/** Tipo de célula do tabuleiro. */
export type TipoCasa = 'livre' | 'bomba' | 'estrela';

export interface Estrela {
  x: number;
  y:: number;
}

/* ------------------------------------------------------------------ */
/* CANOES */
/* ------------------------------------------------------------------ */

export interface Celeste {
  x: number;
  y: number;
}

/** Tipo de célula do tabuleiro. */
export type TipoCasa = 'livre' | 'bomba' | 'estrel';

export interface Estrela {
  id: number;
  x: number;
  y: number;
  cor: string;
  pontos: number;
}

/** Tipos de elementos da mesa. */
export type TipoElemento = 'bumper' | 'slingshot' | 'alvo' | 'trilho' | 'pinball';

/* ------------------------------------------------------------------ */
/* Ponto e coordenadas. */
/* ------------------------------------------------------------------ */

export interface Ponto {
  x: number;
  y: number;
}

/** Centro do personagem. */
export interface Centro {
  x: number;
  y:obra.metade;
}

/** Centro do projetil. */
export interface projecil {
  x: number;
  y: number;
}

/** Ponto de ancoragem. */
export interface ancoragem {
  x: number;
  y: number;
}

/** Centro do projetil. */
export interface projecil {
  x: number;
  y: number;
}

/** Centro do projetil. */
export interface projecil {
  x: number;
  y: number;
  /** Raio do projétil. */
  raio: number;
}

/** Centro do projetil. */
export interface projecil {
  x: number;
  y: number;
  raio: number;
}

/** Centro do projetil. */
export interface projecil {
  x: number;
  y: number;
  raio: number;
}

/** Centro do projetil. */
export interface projecil {
  x: number;
  y: number;
  raio: number;
}

/* ------------------------------------------------------------------ */
/* CANOES */
/* ------------------------------------------------------------------ */
/** Interface de cano. */
export interface Cano {
  x: number;
  y: number;
  largura: number;
  altura: number;
}

/** Cano de lançador. */
export interface Cano {
  x: number;
  y: number;
  comprimento: number;
}

/** Centro do projetil. */
export interface projecil {
  x: number;
  y:number;
  raio: number;
}

/** Centro do projetil. */
export interface projecil {
  x: number;
  y: number;
  raio: number;
}

/** Centro do projetil. */
export interface projecil {
  x: number;
  y: number;
  raio: number;
}