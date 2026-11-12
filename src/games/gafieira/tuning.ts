/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * AJUSTES (TUNING) DA MESA "NOITE NA GAFIEIRA"
 * =============================================
 *
 * Todos os números de geometria e de posicionamento da mesa ficam aqui.
 * Para mudar o desenho da mesa, mexe somente neste arquivo.
 *
 * Sistema de coordenadas: origem no canto superior esquerdo do canvas.
 * O painel de placar ocupa a faixa y = 0..96; o campo de jogo y = 96..800.
 */

/* ------------------------------------------------------------------ */
/* RESOLUÇÃO E PAINEL                                                  */
/* ------------------------------------------------------------------ */

/** Resolução lógica do gabinete (proporção 576:800). */
export const LARGURA = 576;
export const ALTURA = 800;

/** Altura do painel de placar (vidro traseiro). */
export const PAINEL_ALTURA = 96;

/* ------------------------------------------------------------------ */
/* MEDIDAS DO CAMPO (definidas pelo enunciado da mesa)                 */
/* ------------------------------------------------------------------ */

/** Parede externa esquerda. */
export const PAREDE_ESQUERDA = 8;

/** Borda direita do campo principal de jogo. */
export const CAMPO_DIREITA = 528;

/** Parede divisória (8 px de espessura) entre o campo e a pista do plunger. */
export const DIVISORIA = 536;

/** Borda direita da pista do plunger (32 px de pista útil). */
export const PISTA_DIREITA = 568;

/** Centro da pista do plunger (onde a bola fica no lançador). */
export const PISTA_CENTRO = (DIVISORIA + PISTA_DIREITA) / 2;

/* ------------------------------------------------------------------ */
/* ALTURAS PRINCIPAIS                                                  */
/* ------------------------------------------------------------------ */

/** Teto do campo de jogo. */
export const TOPO_CAMPO = 104;

/**
 * Altura do portão de mão única na saída da pista do plunger.
 * A bola lançada passa livremente subindo; se tentar voltar para baixo
 * da pista, é devolvida para o centro do campo.
 */
export const ALTURA_PORTAO = 156;

/** Topo da parede divisória (abaixo do portão, para a bola passar por cima). */
export const TOPO_DIVISORIA = 160;

/** Raio do canto arredondado do alto do campo (esquerda). */
export const CANTO_RAIO = 40;

/** Profundidade da canaleta do lançador. */
export const BASE_LANCADOR_Y = 740;

/** Topo da zona do dreno. */
export const DRENO_Y = 768;

/* ------------------------------------------------------------------ */
/* FLIPPERS                                                            */
/* ------------------------------------------------------------------ */

/** Pivô do flipper esquerdo. */
export const FLIPPER_PIVO_ESQUERDO_X = 168;

/** Pivô do flipper direito. */
export const FLIPPER_PIVO_DIREITO_X = 368;

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
 * Vão entre as pontas dos flippers em repouso (medido de centro a centro).
 * Definido aqui para conferência: ~44 px (2,8 diâmetros de bola).
 */
export const VAO_FLIPPERS = FLIPPER_PIVO_DIREITO_X - FLIPPER_PIVO_ESQUERDO_X - 2 * FLIPPER_COMPRIMENTO * Math.cos(FLIPPER_ANGULO_REPOUSO);

/* ------------------------------------------------------------------ */
/* FUNIL INFERIOR (INLANES E OUTLANES)                                 */
/* ------------------------------------------------------------------ */

/** Largura do canal de outlane (entre a parede externa e a guia do inlane). */
export const LARGURA_OUTLANE = 28;

/** Posição X da guia do outlane esquerdo (8 + 28 = 36). */
export const GUIA_OUTLANE_ESQUERDA = PAREDE_ESQUERDA + LARGURA_OUTLANE;

/** Posição X da guia do outlane direito (528 - 28 = 500). */
export const GUIA_OUTLANE_DIREITA = CAMPO_DIREITA - LARGURA_OUTLANE;

/** Altura do ponto onde o outlane se separa do inlane (formam um "V"). */
export const ALTURA_V_FUNIL = 656;

/** Profundidade da guia do outlane (leva ao dreno). */
export const BASE_GUIA_OUTLANE = 760;

/* ------------------------------------------------------------------ */
/* ELEMENTOS DO CAMPO                                                  */
/* ------------------------------------------------------------------ */

/** Raio dos bumpers de pop (tamborins). */
export const RAIO_BUMPER = 26;

/** Força de impulso dos bumpers (moderada: não manda a bola em disparada). */
export const FORCA_BUMPER = 300;

/** Força de chute das slingshots (moderada, sempre para o centro). */
export const FORCA_SLINGSHOT = 190;

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

/** Slingshots (triângulos de borracha logo acima das guias de inlane). */
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

/** Sensores dos canais (inlane e outlane) na parte de baixo. */
export const INLANE_ESQUERDA = { x: 92, y: 690, largura: 40, altura: 40 };
export const OUTLANE_ESQUERDA = { x: 26, y: 690, largura: 20, altura: 40 };
export const INLANE_DIREITA = { x: 444, y: 690, largura: 40, altura: 40 };
export const OUTLANE_DIREITA = { x: 510, y: 690, largura: 20, altura: 40 };

/** Força máxima do lançador (precisa levar a bola até o arco do topo). */
export const FORCA_LANCADOR = 1180;

/* ------------------------------------------------------------------ */
/* REGIAS DE PONTUAÇÃO                                                  */
/* ------------------------------------------------------------------ */

export const PONTOS_BUMPER = 100;
export const PONTOS_SLINGSHOT = 10;
export const PONTOS_ALVO_FIXO = 500;
export const PONTOS_ALVO_QUEDA = 1000;
export const PONTOS_SPINNER = 100;
export const PONTOS_PALCO = 5000;
export const PONTOS_TRIO = 3000;

/* ------------------------------------------------------------------ */
/* REGIAS DE DRENO (contador do modo debug)                             */
/* ------------------------------------------------------------------ */

/** Região central: a bola saiu entre os flippers (bom jogo). */
export const REGIAO_CENTRO = { x: 190, y: 700, largura: 160, altura: 100 };

/** Outlane esquerda. */
export const REGIAO_OUTLANE_ESQUERDA = { x: 8, y: 700, largura: 40, altura: 100 };

/** Outlane direita. */
export const REGIAO_OUTLANE_DIREITA = { x: 496, y: 700, largura: 40, altura: 100 };

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
