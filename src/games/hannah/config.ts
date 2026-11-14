/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * CONFIGURAÇÃO DE DIFICULDADE — SALVE A HANNAH
 *
 * Constantes de dificuldade por ciclo. O índice 0 é o Ciclo 1. A partir de
 * um certo ciclo os valores ficam congelados nos limites máximos para que a
 * partida continue sempre possível.
 */

export interface Dificuldade {
  /** Velocidade do barril comum (px/s). */
  barrilVelocidade: number;
  /** Intervalo mínimo entre barris (segundos). */
  barrilIntervalo: number;
  /** Quantidade de bolas de fogo ativas no início da tela. */
  bolasFogo: number;
  /** Velocidade das bolas de fogo (px/s). */
  velocidadeBolaFogo: number;
  /** Velocidade das molas na Tela 3 (px/s). */
  molaVelocidade: number;
  /** Intervalo entre molas (segundos). */
  molaIntervalo: number;
  /** Intervalo do tique do contador de bônus (segundos). */
  bonusTickSeg: number;
}

export const DIFICULDADE_POR_CICLO: Dificuldade[] = [
  { barrilVelocidade: 88, barrilIntervalo: 2.7, bolasFogo: 1, velocidadeBolaFogo: 52, molaVelocidade: 150, molaIntervalo: 2.1, bonusTickSeg: 1.6 },
  { barrilVelocidade: 105, barrilIntervalo: 2.2, bolasFogo: 2, velocidadeBolaFogo: 64, molaVelocidade: 175, molaIntervalo: 1.7, bonusTickSeg: 1.4 },
  { barrilVelocidade: 122, barrilIntervalo: 1.75, bolasFogo: 3, velocidadeBolaFogo: 76, molaVelocidade: 200, molaIntervalo: 1.35, bonusTickSeg: 1.2 },
  { barrilVelocidade: 138, barrilIntervalo: 1.4, bolasFogo: 4, velocidadeBolaFogo: 88, molaVelocidade: 220, molaIntervalo: 1.1, bonusTickSeg: 1.0 },
];

/** Retorna a dificuldade de um ciclo (limitada ao máximo configurado). */
export function dificuldadeDoCiclo(ciclo: number): Dificuldade {
  const indice = Math.min(Math.max(1, ciclo), DIFICULDADE_POR_CICLO.length) - 1;
  return DIFICULDADE_POR_CICLO[indice];
}

export const VIDAS_INICIAIS = 3;
export const PONTOS_VIDA_EXTRA_1 = 7000;

export const PONTOS_PULO_1 = 100;
export const PONTOS_PULO_2 = 300;
export const PONTOS_PULO_3 = 500;

export const PONTOS_INTERROMPER = 100;

export const PONTOS_QUEBRAR_MARTELO: [number, number] = [300, 800];

export const PONTOS_ITEM_BONUS = {
  chapeu: 300,
  bolsa: 500,
  'guarda-chuva': 800,
} as const;

/** Chance de um barril descer por uma escada INTEIRA. */
export const CHANCE_ESCADA_INTEIRA = 0.22;
/** Chance de um barril descer por uma escada QUEBRADA. */
export const CHANCE_ESCADA_QUEBRADA = 0.55;

/** Queda maior que isto (px) sem tocar no chão = morte. */
export const ALTURA_QUEDA_MORTE = 78;

export const MARTELO_DURACAO = 10;
/** Segundos finais com aviso piscando do martelo. */
export const MARTELO_AVISO = 2.5;

export const COYOTE_MS = 100;
export const BUFFER_PULO_MS = 100;

export const TOLERANCIA_ESCADA = 10;

export const VELOCIDADE_JOGADOR = 150;
export const VELOCIDADE_ESCADA = 92;
export const PULO_VELOCIDADE = 265;
export const GRAVIDADE = 920;
