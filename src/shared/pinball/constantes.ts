/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Constantes da física de pinball.
 *
 * A simulação roda com passo fixo de 1/240 s (4 subpassos por quadro de
 * 60 FPS), independente do FPS real do dispositivo.
 */

/** Duração de um subpasso da simulação. */
export const PASSO_FIXO = 1 / 240;

/** Quantidade de subpassos por quadro de 60 FPS. */
export const SUBPASSOS_POR_QUADRO = 4;

/** Raio da bola em pixels (diâmetro 16 = uma unidade de arte). */
export const RAIO_BOLA = 8;

/**
 * Gravidade padrão do campo inclinado.
 * Equivale a uma inclinação de ~6,5° na escala da mesa (16 px = 1 unidade
 * de arte). Ajustável por mesa em `DefinicaoMesa.gravidade`.
 */
export const GRAVIDADE_PADRAO = 560;

/** Velocidade máxima da bola (evita atravessar paredes em queda livre). */
export const VELOCIDADE_MAXIMA = 1400;

/** Restituição padrão das paredes do campo. */
export const RESTITUICAO_PADRAO = 0.42;

/** Atrito padrão (perda de velocidade tangencial). */
export const ATRITO_PADRAO = 0.03;

/** Atrito das paredes do campo (um pouco mais "grippy" que o padrão). */
export const ATRITO_PAREDE = 0.06;

/** Velocidade angular do flipper na subida (rad/s) — ~60 ms de resposta. */
export const VELOCIDADE_ANGULAR_FLIPPER = 30;

/** Velocidade angular do flipper na descida (rad/s). */
export const VELOCIDADE_ANGULAR_DESCIDA = 16;

/** Restituição do flipper. */
export const RESTITUICAO_FLIPPER = 0.32;

/** Impulso extra do flipper proporcional ao braço de alavanca. */
export const IMPULSO_FLIPPER = 0.42;

/** Tempo parado (sem movimento) até o empurrão anti-travamento. */
export const TEMPO_PARADO_LIMITE = 5;

/** Velocidade mínima para considerar a bola "parada". */
export const VELOCIDADE_PARADA = 12;

/** Impulso aplicado quando a bola fica parada por muito tempo. */
export const IMPULSO_ANTI_TRAVA = 70;

/** Bolas por partida (padrão). */
export const BOLAS_PADRAO = 3;

/** Multiplicador máximo de bônus. */
export const MULTIPLICADOR_MAXIMO = 5;

/** Janela de tempo (s) para acumular empurrões e causar tilt. */
export const JANELA_TILT = 5;

/** Quantidade de empurrões dentro da janela que causam tilt. */
export const EMPURROES_PARA_TILT = 3;

/** Intensidade do empurrão (nudge). */
export const FORCA_EMPURRAO = 190;

/** Duração da animação de contagem do bônus (s). */
export const TEMPO_BONUS = 2.2;

/** Valor de cada elemento aceso no bônus final de bola. */
export const VALOR_ELEMENTO_BONUS = 1000;
