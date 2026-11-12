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

export const Y_NAVE = 198;
export const Y_BARREIRA = 70;
export const ALTURA_BARREIRA = 18;

export const VELOCIDADE_NAVE = 104;
export const VELOCIDADE_SCROLL_BASE = 62;
export const AUMENTO_SCROLL_SECAO = 5;
export const VELOCIDADE_SCROLL_MAXIMA = 112;
export const MULT_ACELERANDO = 1.55;
export const MULT_DESACELERANDO = 0.66;

export const VIDAS_INICIAIS = 3;
export const VIDAS_MAXIMAS = 9;
export const INTERVALO_VIDA_EXTRA = 10000;

export const FUEL_MAX = 100;
export const DRENAGEM_BASE = 3.2;
export const DRENAGEM_ACELERANDO = 5.2;
export const DRENAGEM_DESACELERANDO = 1.7;
export const TAXA_ABASTECIMENTO = 34;
export const FUEL_TANQUE = 40;
export const ALERTA_COMBUSTIVEL = 25;

export const MAX_TIROS_JOGADOR = 2;
export const RECARGA_TIRO = 0.2;
export const VELOCIDADE_TIRO = 300;
export const DANO_TIRO = 10;

export const COMPRIMENTO_SECAO_BASE = 780;
export const AUMENTO_COMPRIMENTO_SECAO = 80;
export const INICIO_RIO = -220;
export const PASSO_RIO = 8;
export const EXTRA_RIO = 3000;
export const MARGEM_HUD = 47;
export const MARGEM_RIO = 9;
export const LARGURA_RIO_MIN = 124;
export const LARGURA_RIO_MAX = 194;

export const DISTANCIA_SPAWN = Y_NAVE + 46;
export const DURACAO_INVULNERAVEL = 1.7;
export const DURACAO_MORTE = 1.25;
export const DURACAO_TRANSICAO = 1.6;

export const PONTOS_BARREIRA = 500;
export const PONTOS_TANQUE = 80;
