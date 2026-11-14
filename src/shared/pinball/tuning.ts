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
/* IMPULSO ANTI-TRAVAMENTO                                              */
/* ------------------------------------------------------------------ */

/** Tempo parado (sem movimento) até o empurrão anti-travamento. */
export const TEMPO_PARADO_LIMITE = 4;

/** Velocidade mínima para considerar a bola "parada". */
export const VELOCIDADE_PARADA = 14;

/** Impulso aplicado quando a bola fica parada por muito tempo. */
export const IMPULSO_ANTI_TRAVA = 80;

/* ------------------------------------------------------------------ */
/* MEDIDAS COMPARTILHADAS DO CAMPO (todas as mesas usam estas)         */
/* ------------------------------------------------------------------ */

/** Resolução lógica padrão do gabinete de pinball (proporção 576:800). */
export const LARGURA = 576;

/** Altura lógica do gabinete. */
export const ALTURA = 800;

/** Altura do painel de placar (vidro traseiro). */
export const PAINEL_ALTURA = 96;

/** Parede externa esquerda do campo. */
export const PAREDE_ESQUERDA = 8;

/** Borda direita do campo principal de jogo. */
export const CAMPO_DIREITA = 528;

/** Parede divisória entre o campo e a pista do plunger. */
export const DIVISORIA = 536;

/** Borda direita da pista do plunger (32 px de pista útil). */
export const PISTA_DIREITA = 568;

/** Centro da pista do plunger (onde a bola fica no lançador). */
export const PISTA_CENTRO = (DIVISORIA + PISTA_DIREITA) / 2;

/** Teto do campo de jogo. */
export const TOPO_CAMPO = 104;

/** Raio do canto arredondado do alto do campo (esquerda). */
export const CANTO_RAIO = 40;

/** Altura do portão de mão única na saída da pista do plunger. */
export const ALTURA_PORTAO = 156;

/** Topo da parede divisória (abaixo do portão). */
export const TOPO_DIVISORIA = 160;

/** Profundidade da canaleta do lançador. */
export const BASE_LANCADOR_Y = 740;

/** Topo da zona do dreno. */
export const DRENO_Y = 768;

/* ------------------------------------------------------------------ */
/* FLIPPERS (geometria padrão, compartilhada por todas as mesas)        */
/* ------------------------------------------------------------------ */

/** Pivô do flipper esquerdo. */
export const FLIPPER_PIVO_ESQUERDO_X = 174;

/** Pivô do flipper direito. */
export const FLIPPER_PIVO_DIREITO_X = 362;

/** Altura dos pivôs. */
export const FLIPPER_PIVO_Y = 720;

/** Comprimento do flipper (pivô até a ponta). */
export const FLIPPER_COMPRIMENTO = 88;

/** Espessura na base do flipper (16 px). */
export const FLIPPER_ESPESSURA_BASE = 16;

/** Espessura na ponta do flipper (8 px). */
export const FLIPPER_ESPESSURA_PONTA = 8;

/** Ângulo de repouso: 28° abaixo da horizontal. */
export const FLIPPER_ANGULO_REPOUSO = (28 * Math.PI) / 180;

/** Ângulo ativo: 28° acima da horizontal. */
export const FLIPPER_ANGULO_ATIVO = (-28 * Math.PI) / 180;

/**
 * Vão entre as pontas dos flippers em repouso (centro a centro).
 * Valor calculado a partir dos pivôs/comprimento/ângulo (~33 px).
 */
export const VAO_FLIPPERS =
  FLIPPER_PIVO_DIREITO_X -
  FLIPPER_PIVO_ESQUERDO_X -
  2 * FLIPPER_COMPRIMENTO * Math.cos(FLIPPER_ANGULO_REPOUSO);

/* ------------------------------------------------------------------ */
/* FUNIL INFERIOR (inlanes e outlanes, compartilhado)                   */
/* ------------------------------------------------------------------ */

/** Largura do canal de outlane (entre a parede externa e a guia do inlane). */
export const LARGURA_OUTLANE = 28;

/** Posição X da guia do outlane esquerdo. */
export const GUIA_OUTLANE_ESQUERDA = PAREDE_ESQUERDA + LARGURA_OUTLANE;

/** Posição X da guia do outlane direito. */
export const GUIA_OUTLANE_DIREITA = CAMPO_DIREITA - LARGURA_OUTLANE;

/** Altura do ponto onde o outlane se separa do inlane (formam um "V"). */
export const ALTURA_V_FUNIL = 656;

/** Profundidade da guia do outlane (leva ao dreno). */
export const BASE_GUIA_OUTLANE = 760;

/** Sensores dos canais (inlane e outlane) na parte de baixo. */
export const INLANE_ESQUERDA = { x: 92, y: 690, largura: 40, altura: 40 };
export const OUTLANE_ESQUERDA = { x: 26, y: 690, largura: 20, altura: 40 };
export const INLANE_DIREITA = { x: 444, y: 690, largura: 40, altura: 40 };
export const OUTLANE_DIREITA = { x: 510, y: 690, largura: 20, altura: 40 };

/**
 * Slingshots padrão: triângulos de borracha apoiados nas guias de inlane,
 * com a face de chute voltada para o centro do campo.
 */
export const SLINGSHOTS = [
  {
    id: 'slingshot_esq',
    vertices: [
      { x: 82, y: 678 },
      { x: 150, y: 610 },
      { x: 148, y: 710 },
    ],
  },
  {
    id: 'slingshot_dir',
    vertices: [
      { x: 454, y: 678 },
      { x: 386, y: 610 },
      { x: 388, y: 710 },
    ],
  },
] as const;

/** Força de chute padrão das slingshots (moderada, sempre para o centro). */
export const FORCA_SLINGSHOT = 190;

/** Pontuação padrão de um slingshot. */
export const PONTOS_SLINGSHOT = 10;

/* ------------------------------------------------------------------ */
/* REGIÕES DE DRENO (contador do modo debug)                            */
/* ------------------------------------------------------------------ */

/** Região central: a bola saiu entre os flippers (bom jogo). */
export const REGIAO_CENTRO = { x: 190, y: 700, largura: 160, altura: 100 };

/** Outlane esquerda. */
export const REGIAO_OUTLANE_ESQUERDA = { x: 8, y: 700, largura: 40, altura: 100 };

/** Outlane direita. */
export const REGIAO_OUTLANE_DIREITA = { x: 496, y: 700, largura: 40, altura: 100 };

/* ------------------------------------------------------------------ */
/* LANÇADOR                                                             */
/* ------------------------------------------------------------------ */

/** Força máxima do lançador (leva a bola até o topo do campo). */
export const FORCA_LANCADOR = 1180;
