/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * AJUSTES (TUNING) DA MESA "EXPEDIÇÃO ASTRO"
 * ============================================
 *
 * A geometria padrão do campo (moldura, funil inferior, flippers, sensores,
 * lançador, portão e dreno) vem da biblioteca compartilhada
 * (`src/shared/pinball/tuning.ts` + `criarFundoPadrao`).
 *
 * Aqui ficam apenas os valores PRÓPRIOS desta mesa: a metade de cima do
 * campo, os elementos do meio, a decoração e a pontuação.
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
  PONTOS_SLINGSHOT,
  REGIAO_CENTRO,
  REGIAO_OUTLANE_DIREITA,
  REGIAO_OUTLANE_ESQUERDA,
  TOPO_CAMPO,
  TOPO_DIVISORIA,
  VAO_FLIPPERS,
} from '../../shared/pinball/tuning';

/* ------------------------------------------------------------------ */
/* COMETAS (bumpers de pop em arco na parte alta)                       */
/* ------------------------------------------------------------------ */

/** Raio dos cometas. */
export const RAIO_COMETA = 24;

/** Impulso dos cometas (moderado). */
export const FORCA_COMETA = 300;

/** Os três cometas, em arco no alto do campo. */
export const COMETAS = [
  { x: 138, y: 196 },
  { x: 230, y: 158 },
  { x: 322, y: 196 },
] as const;

/* ------------------------------------------------------------------ */
/* ALVOS DE QUEDA A-S-T-R-O (arcada à esquerda)                          */
/* ------------------------------------------------------------------ */

export const ASTRO_LETRAS = [
  { id: 'astro_a', letra: 'A', x: 104, y: 300 },
  { id: 'astro_s', letra: 'S', x: 86, y: 342 },
  { id: 'astro_t', letra: 'T', x: 84, y: 384 },
  { id: 'astro_r', letra: 'R', x: 100, y: 426 },
  { id: 'astro_o', letra: 'O', x: 130, y: 460 },
] as const;

export const ALVO_QUEDA_LARGURA = 30;
export const ALVO_QUEDA_ALTURA = 20;

/* ------------------------------------------------------------------ */
/* ESTAÇÕES (pista central com 5 luzes)                                 */
/* ------------------------------------------------------------------ */

export const ESTACOES = [
  { id: 'est_satelite', rotulo: 'SATELITE', x: 268, y: 296 },
  { id: 'est_lua', rotulo: 'LUA', x: 268, y: 352 },
  { id: 'est_base', rotulo: 'BASE', x: 268, y: 408 },
  { id: 'est_foguete', rotulo: 'FOGUETE', x: 268, y: 464 },
  { id: 'est_estrela', rotulo: 'ESTRELA', x: 268, y: 520 },
] as const;

export const ESTACAO_LARGURA = 100;
export const ESTACAO_ALTURA = 22;

/* ------------------------------------------------------------------ */
/* PLANETAS (dois alvos fixos no meio do campo)                         */
/* ------------------------------------------------------------------ */

export const PLANETAS = [
  { id: 'planeta_azul', rotulo: 'AZUL', x: 176, y: 470, cor: 'azul' },
  { id: 'planeta_roxo', rotulo: 'ROXO', x: 360, y: 470, cor: 'roxo' },
] as const;

export const ALVO_FIXO_LARGURA = 38;
export const ALVO_FIXO_ALTURA = 24;

/* ------------------------------------------------------------------ */
/* SPINNER (antena parabólica em canal lateral à direita)               */
/* ------------------------------------------------------------------ */

export const SPINNER_X = 464;
export const SPINNER_Y = 350;
export const SPINNER_LARGURA = 30;
export const SPINNER_ALTURA = 6;
export const SPINNER_GUIA_X = [448, 480];
export const SPINNER_GUIA_TOPO = 270;
export const SPINNER_GUIA_BASE = 430;

/* ------------------------------------------------------------------ */
/* RAMPA EM ÓRBITA (canal no topo que devolve a bola ao centro)         */
/* ------------------------------------------------------------------ */

/** Trilho superior da rampa (a bola desce por dentro do canal). */
export const ORBITA_TRILHO_SUPERIOR = {
  x1: 470,
  y1: 138,
  x2: 300,
  y2: 252,
} as const;

/** Trilho inferior da rampa. */
export const ORBITA_TRILHO_INFERIOR = {
  x1: 484,
  y1: 160,
  x2: 314,
  y2: 274,
} as const;

/** Sensor que conta as passagens pela rampa. */
export const ORBITA_SENSOR = { x: 477, y: 150, largura: 52, altura: 54 };

/* ------------------------------------------------------------------ */
/* PONTUAÇÃO E REGRAS                                                   */
/* ------------------------------------------------------------------ */

export const PONTOS_COMETA = 100;
export const PONTOS_ALVO_FIXO = 500;
export const PONTOS_ALVO_QUEDA = 1000;
export const PONTOS_ESTACAO = 2000;
export const PONTOS_ORBITA = 1500;
export const PONTOS_SPINNER = 100;

/** Bônus por acender as 5 estações. */
export const PONTOS_ESTACOES_COMPLETAS = 10000;

/** Passagens pelo arco para ativar o modo foguete. */
export const ORBITAS_PARA_MODO_FOGUETE = 3;

/** Duração do modo foguete (segundos). */
export const DURACAO_MODO_FOGUETE = 20;

/** Multiplicador dos cometas no modo foguete. */
export const MULTIPLICADOR_MODO_FOGUETE = 3;

/* ------------------------------------------------------------------ */
/* DECORAÇÃO                                                            */
/* ------------------------------------------------------------------ */

/** Astronauta fictício no painel de placar (à esquerda do título). */
export const ASTRONAUTA_PAINEL = { x: 62, y: 30, escala: 0.72 };

/** Planeta decorativo no painel (à direita do título). */
export const PLANETA_PAINEL = { x: 500, y: 26, raio: 15 };

/** Planetas decorativos nas laterais do campo. */
export const PLANETAS_CAMPO = [
  { x: 468, y: 170, raio: 22, cor: 'ciano' },
  { x: 74, y: 590, raio: 26, cor: 'roxo' },
  { x: 420, y: 570, raio: 16, cor: 'amarelo' },
] as const;

/** Seta luminosa indicando caminho (x, y, direção). */
export const SETAS = [
  { x: 468, y: 250, direcao: -1 },
  { x: 470, y: 200, direcao: -1 },
  { x: 96, y: 470, direcao: 1 },
  { x: 268, y: 530, direcao: 1 },
] as const;

/** Parafusos decorativos nos cantos das guias. */
export const PARAFUSOS = [
  { x: 36, y: 656 },
  { x: 500, y: 656 },
  { x: 168, y: 720 },
  { x: 368, y: 720 },
  { x: 448, y: 270 },
  { x: 480, y: 270 },
] as const;
