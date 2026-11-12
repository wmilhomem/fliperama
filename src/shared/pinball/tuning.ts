/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * AJUSTES (TUNING) DA BIBLIOTECA DE PINBALL
 * ==========================================
 *
 * Todos os números de física e de comportamento ficam aqui.
 * Para mudar a "sensação" da mesa, mexe somente neste arquivo.
 *
 * Valores em pixels e segundos. O campo de jogo usa unidades de arte de 16x16.
 */

/* ------------------------------------------------------------------ */
/* SIMULAÇÃO                                                          */
/* ------------------------------------------------------------------ */

/** Duração de um subpasso da física (4 subpassos por quadro de 60 FPS). */
export const PASSO_FIXO = 1 / 240;

/** Quantidade de subpassos executados por quadro de 60 FPS. */
export const SUBPASSOS_POR_QUADRO = 4;

/* ------------------------------------------------------------------ */
/* BOLA                                                               */
/* ------------------------------------------------------------------ */

/** Raio da bola em pixels (diâmetro 16 = 1 unidade de arte). */
export const RAIO_BOLA = 8;

/**
 * Gravidade padrão do campo inclinado (px/s²).
 * Equivale a uma inclinação de ~6,5° na escala da mesa (16 px = 1 unidade).
 * A mesa pode sobrescrever em `DefinicaoMesa.gravidade`.
 */
export const GRAVIDADE_PADRAO = 425;

/** Limite de velocidade da bola: evita que ela "fure" as paredes. */
export const VELOCIDADE_MAXIMA = 1150;

/** Restituição padrão das paredes (0 = sem quique, 1 = elástico). */
export const RESTITUICAO_PADRAO = 0.5;

/** Atrito padrão (perda de velocidade tangencial). */
export const ATRITO_PADRAO = 0.03;

/** Atrito das paredes do campo (um pouco mais "grippy" que o padrão). */
export const ATRITO_PAREDE = 0.05;

/* ------------------------------------------------------------------ */
/* FLIPPERS                                                           */
/* ------------------------------------------------------------------ */

/** Velocidade angular do flipper na subida (rad/s) — resposta ~60 ms. */
export const VELOCIDADE_ANGULAR_FLIPPER = 26;

/** Velocidade angular do flipper na descida (rad/s). */
export const VELOCIDADE_ANGULAR_DESCIDA = 14;

/** Restituição do flipper. */
export const RESTITUICAO_FLIPPER = 0.32;

/**
 * Quanto da velocidade do flipper é transferida para a bola.
 * Maior = a ponta lança mais forte (e a base quase não lança).
 */
export const IMPULSO_FLIPPER = 0.42;

/**
 * Abaixo desta velocidade, a bola "gruda" no flipper parado
 * (permitindo pegar e segurar a bola com o flipper erguido).
 */
export const VELOCIDADE_CAPTURA = 90;

/** Atrito aplicado quando a bola está parada sobre um flipper. */
export const ATRITO_CAPTURA = 0.35;

/* ------------------------------------------------------------------ */
/* LANÇADOR (PLUNGER)                                                 */
/* ------------------------------------------------------------------ */

/** Tempo (s) para carregar 100% da força do lançador. */
export const TEMPO_CARGA_PLUNGER = 0.9;

/** Fração da força máxima usada no toque mais curto (a bola sai da pista). */
export const FORCA_PLUNGER_MINIMA = 0.62;

/* ------------------------------------------------------------------ */
/* REGRAS COMUNS                                                      */
/* ------------------------------------------------------------------ */

/** Bolas por partida (padrão). */
export const BOLAS_PADRAO = 3;

/** Multiplicador máximo de bônus. */
export const MULTIPLICADOR_MAXIMO = 5;

/** Janela de tempo (s) para acumular empurrões e causar tilt. */
export const JANELA_TILT = 5;

/** Quantidade de empurrões dentro da janela que causam tilt. */
export const EMPURROES_PARA_TILT = 3;

/** Intensidade do empurrão (nudge) aplicada à bola. */
export const FORCA_EMPURRAO = 190;

/** Duração da animação de contagem do bônus de fim de bola (s). */
export const TEMPO_BONUS = 2.2;

/** Valor de cada elemento aceso no bônus final de bola. */
export const VALOR_ELEMENTO_BONUS = 1000;

/** Segundos de "ball save" depois do lançamento (bola salva sem custar bola). */
export const BALL_SAVE_PADRAO = 10;

/** Tempo (s) que o aviso "BOLA SALVA" fica piscando. */
export const TEMPO_AVISO_BOLA_SALVA = 3;

/* ------------------------------------------------------------------ */
/* ANTI-TRAVAMENTO                                                     */
/* ------------------------------------------------------------------ */

/** Tempo parado (sem movimento) até o empurrão anti-travamento. */
export const TEMPO_PARADO_LIMITE = 4;

/** Velocidade mínima para considerar a bola "parada". */
export const VELOCIDADE_PARADA = 14;

/** Impulso aplicado quando a bola fica parada por muito tempo. */
export const IMPULSO_ANTI_TRAVA = 80;
