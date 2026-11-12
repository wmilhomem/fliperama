/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * AJUSTES (TUNING) DA MESA "NOITE NA GAFIEIRA"
 * =============================================
 *
 * A geometria padrão do campo (moldura, funil inferior, flippers, sensores,
 * lançador, portão e dreno) é compartilhada pela biblioteca e vem de
 * `src/shared/pinball/tuning.ts` (reexportada aqui).
 *
 * Aqui ficam apenas os valores PRÓPRIOS desta mesa: posições dos elementos
 * do salão, decoração e pontuação.
 */

/* Medidas padrão do campo (compartilhadas com as outras mesas). */
export {
  ALTURA,
  ALTURA_PORTAO,
  ALTURA_V_FUNIL,
  BASE_GUIA_OUTLANE,
  BASE_LANCADOR_Y,
  CAMPO_DIREITA,
  CANTO_RAIO,
  DIVISORIA,
  DRENO_Y,
  FLIPPER_ANGULO_ATIVO,
  FLIPPER_ANGULO_REPOUSO,
  FLIPPER_COMPRIMENTO,
  FLIPPER_ESPESSURA_BASE,
  FLIPPER_ESPESSURA_PONTA,
  FLIPPER_PIVO_DIREITO_X,
  FLIPPER_PIVO_ESQUERDO_X,
  FLIPPER_PIVO_Y,
  FORCA_LANCADOR,
  GUIA_OUTLANE_DIREITA,
  GUIA_OUTLANE_ESQUERDA,
  INLANE_DIREITA,
  INLANE_ESQUERDA,
  LARGURA,
  LARGURA_OUTLANE,
  OUTLANE_DIREITA,
  OUTLANE_ESQUERDA,
  PAINEL_ALTURA,
  PAREDE_ESQUERDA,
  PISTA_CENTRO,
  PISTA_DIREITA,
  REGIAO_CENTRO,
  REGIAO_OUTLANE_DIREITA,
  REGIAO_OUTLANE_ESQUERDA,
  TOPO_CAMPO,
  TOPO_DIVISORIA,
  VAO_FLIPPERS,
} from '../../shared/pinball/tuning';

/* ------------------------------------------------------------------ */
/* ELEMENTOS DO CAMPO                                                  */
/* ------------------------------------------------------------------ */

/** Raio dos bumpers de pop (tamborins). */
export const RAIO_BUMPER = 26;

/** Força de impulso dos bumpers (moderada: não manda a bola em disparada). */
export const FORCA_BUMPER = 300;

/** Centro dos três tamborins (triângulo no alto do campo). */
export const BUMPERS = [
  { x: 268, y: 200 },
  { x: 196, y: 262 },
  { x: 340, y: 262 },
] as const;

/** Banco de alvos de queda com as letras S-A-M-B-A. */
export const LETRAS = [
  { id: 'samba_s', letra: 'S', x: 140, y: 336 },
  { id: 'samba_a1', letra: 'A', x: 204, y: 318 },
  { id: 'samba_m', letra: 'M', x: 268, y: 312 },
  { id: 'samba_b', letra: 'B', x: 332, y: 318 },
  { id: 'samba_a2', letra: 'A', x: 396, y: 336 },
] as const;

/** Tamanho dos alvos de queda. */
export const ALVO_QUEDA_LARGURA = 32;
export const ALVO_QUEDA_ALTURA = 22;

/** Pistas de rolagem do topo (luz PALCO). */
export const PALCO_X = [470, 420];
export const PALCO_Y = 175;
export const PALCO_LARGURA = 30;
export const PALCO_ALTURA = 110;

/** Trio de alvos fixos (cavaquinho, surdo e tamborim). */
export const TRIO = [
  { id: 'cavaquinho', rotulo: 'CAVAQUINHO', x: 168, y: 460 },
  { id: 'surdo', rotulo: 'SURDO', x: 268, y: 500 },
  { id: 'tamborim_alvo', rotulo: 'TAMBORIM', x: 368, y: 460 },
] as const;

/** Tamanho dos alvos fixos. */
export const ALVO_FIXO_LARGURA = 38;
export const ALVO_FIXO_ALTURA = 24;

/** Canal do spinner (pandeiro) no lado esquerdo. */
export const SPINNER_X = 60;
export const SPINNER_Y = 445;
export const SPINNER_LARGURA = 30;
export const SPINNER_ALTURA = 6;
export const SPINNER_GUIA_X = [44, 76];
export const SPINNER_GUIA_TOPO = 420;
export const SPINNER_GUIA_BASE = 470;

/* ------------------------------------------------------------------ */
/* REGRAS DE PONTUAÇÃO                                                  */
/* ------------------------------------------------------------------ */

export const PONTOS_BUMPER = 100;
export const PONTOS_ALVO_FIXO = 500;
export const PONTOS_ALVO_QUEDA = 1000;
export const PONTOS_SPINNER = 100;
export const PONTOS_PALCO = 5000;
export const PONTOS_TRIO = 3000;

/* ------------------------------------------------------------------ */
/* DECORAÇÃO (posições fixas, nunca colidem com o texto do painel)      */
/* ------------------------------------------------------------------ */

/** Bola de espelhos do salão, no canto superior esquerdo do painel. */
export const BOLA_ESPELHOS = { x: 54, y: 22, raio: 14 };

/** Sambista fictício no painel (à esquerda do título). */
export const SAMBISTA_PAINEL = { x: 112, y: 30, escala: 0.72 };

/** Passista fictício no painel (à direita do título). */
export const PASSISTA_PAINEL = { x: 468, y: 30, escala: 0.72 };

/** Instrumentos decorativos nas laterais do campo. */
export const DECORACAO_CAMPO = [
  { tipo: 'cavaquinho', x: 104, y: 660, escala: 0.9 },
  { tipo: 'surdo', x: 452, y: 600, escala: 0.9 },
  { tipo: 'pandeiro', x: 430, y: 690, escala: 0.9 },
] as const;

/** Personagens ilustrados nas laterais do campo. */
export const PASSISTA_CAMPO = { x: 66, y: 600, escala: 1.15 };
export const SAMBISTA_CAMPO = { x: 490, y: 420, escala: 1.1 };
