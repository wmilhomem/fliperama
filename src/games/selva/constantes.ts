/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/** Resolução lógica do canvas, alinhada aos demais jogos amplos. */
export const LARGURA = 480;
export const ALTURA = 560;

/** Escala inteira aplicada ao mundo (pixel art nítida, sem borrões). */
export const ESCALA = 2;
export const OFFSET_X = 16;
export const OFFSET_Y = 48;

/**
 * Mundo lógico em blocos de 8x8, renderizado em 16x16 pixels.
 * Grade de 28 colunas x 31 linhas = 448x496 px dentro do canvas 480x560.
 */
export const LARGURA_MUNDO = 224;
export const ALTURA_MUNDO = 248;
export const BLOCO_MUNDO = 8;

export const TRILHA_Y = 154;
export const SUBSOLO_TOPO = 182;
export const SUBSOLO_CHAO = 234;

export const TOTAL_TELAS = 120;
export const TOTAL_TESOUROS = 32;
export const DURACAO_JOGO = 20 * 60;

export const PONTOS_INICIAIS = 2000;
export const PENALIDADE = 100;
export const VIDAS_INICIAIS = 3;

export const GRAVIDADE = 510;
export const VELOCIDADE_PULO = -188;
export const VELOCIDADE_ANDAR = 82;
export const VELOCIDADE_ESCADA = 54;

export const LARGURA_JOGADOR = 10;
export const ALTURA_JOGADOR = 17;

export const DURACAO_ATORDOAMENTO = 1;
export const DURACAO_INVULNERAVEL = 1.5;
export const DURACAO_MORTE = 1.15;
export const DURACAO_BRILHO = 0.32;

export const SEMENTE_MUNDO = 0x5e1a2026;
