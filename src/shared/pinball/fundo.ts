/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * FUNDO PADRÃO DE PINBALL (parte compartilhada por todas as mesas)
 *
 * Contém a estrutura que é igual em todas as mesas:
 * - a moldura do campo (teto, canto arredondado, parede esquerda, divisória
 *   e parede externa da pista do plunger);
 * - o funil inferior (outlanes de 28 px, guias de inlane até os pivôs);
 * - os slingshots com a face de chute virada para o centro;
 * - os sensores de inlane/outlane, o lançador, o portão de mão única e o dreno;
 * - os flippers e as regiões de dreno usadas pelo modo debug.
 *
 * Cada mesa usa `criarFundoPadrao()` e acrescenta apenas a sua metade de cima,
 * os elementos do meio e a arte.
 */

import {
  ALTURA,
  ALTURA_PORTAO,
  ALTURA_V_FUNIL,
  BASE_GUIA_OUTLANE,
  BASE_LANCADOR_Y,
  CANTO_RAIO,
  CAMPO_DIREITA,
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
  FORCA_SLINGSHOT,
  GUIA_OUTLANE_DIREITA,
  GUIA_OUTLANE_ESQUERDA,
  INLANE_DIREITA,
  INLANE_ESQUERDA,
  LARGURA_OUTLANE,
  OUTLANE_DIREITA,
  OUTLANE_ESQUERDA,
  PAREDE_ESQUERDA,
  PISTA_CENTRO,
  PISTA_DIREITA,
  PONTOS_SLINGSHOT,
  REGIAO_CENTRO,
  REGIAO_OUTLANE_DIREITA,
  REGIAO_OUTLANE_ESQUERDA,
  SLINGSHOTS,
  TOPO_CAMPO,
  TOPO_DIVISORIA,
} from './tuning';
import {
  DefinicaoFlipper,
  ElementoMesa,
  Parede,
  RegiaoDreno,
} from './tipos';

export interface FundoPadrao {
  /** Paredes da moldura e do funil inferior. */
  geometria: Parede[];
  /** Slingshots, sensores, lançador, portão e dreno. */
  elementos: ElementoMesa[];
  /** Flippers padrão (88 px, pivôs em 168/368, altura 720). */
  flippers: [DefinicaoFlipper, DefinicaoFlipper];
  /** Regiões usadas pelo contador de drenos do modo debug. */
  regioesDreno: RegiaoDreno[];
}

/**
 * Monta o fundo padrão de uma mesa de pinball.
 * @param prefixo prefixo opcional para os ids dos elementos (evita colisão
 *                 quando a mesa junta vários fundos).
 */
export function criarFundoPadrao(prefixo = ''): FundoPadrao {
  const id = (nome: string) => `${prefixo}${nome}`;

  const geometria: Parede[] = [
    // Teto do salão (do canto arredondado até a pista do plunger)
    {
      tipo: 'segmento',
      x1: PAREDE_ESQUERDA + CANTO_RAIO,
      y1: TOPO_CAMPO,
      x2: PISTA_DIREITA,
      y2: TOPO_CAMPO,
    },
    // Canto superior esquerdo arredondado: devolve a bola para o centro
    {
      tipo: 'arco',
      cx: PAREDE_ESQUERDA + CANTO_RAIO,
      cy: TOPO_CAMPO + CANTO_RAIO,
      raio: CANTO_RAIO,
      anguloInicio: Math.PI,
      anguloFim: (3 * Math.PI) / 2,
      sentido: 1,
      interno: true,
    },
    // Parede externa esquerda
    {
      tipo: 'segmento',
      x1: PAREDE_ESQUERDA,
      y1: TOPO_CAMPO + CANTO_RAIO,
      x2: PAREDE_ESQUERDA,
      y2: 790,
    },
    // Parede interna da pista do plunger (face do divisor)
    {
      tipo: 'segmento',
      x1: DIVISORIA,
      y1: TOPO_DIVISORIA,
      x2: DIVISORIA,
      y2: 790,
    },
    // Parede externa da pista do plunger
    { tipo: 'segmento', x1: PISTA_DIREITA, y1: TOPO_CAMPO, x2: PISTA_DIREITA, y2: 790 },
    // Guia do outlane esquerdo (canal de 28 px junto à parede)
    {
      tipo: 'segmento',
      x1: GUIA_OUTLANE_ESQUERDA,
      y1: ALTURA_V_FUNIL,
      x2: GUIA_OUTLANE_ESQUERDA,
      y2: BASE_GUIA_OUTLANE,
    },
    // Guia do inlane esquerdo (funil até o pivô do flipper)
    {
      tipo: 'segmento',
      x1: GUIA_OUTLANE_ESQUERDA,
      y1: ALTURA_V_FUNIL,
      x2: FLIPPER_PIVO_ESQUERDO_X,
      y2: FLIPPER_PIVO_Y,
    },
    // Guia do outlane direito
    {
      tipo: 'segmento',
      x1: GUIA_OUTLANE_DIREITA,
      y1: ALTURA_V_FUNIL,
      x2: GUIA_OUTLANE_DIREITA,
      y2: BASE_GUIA_OUTLANE,
    },
    // Guia do inlane direito
    {
      tipo: 'segmento',
      x1: GUIA_OUTLANE_DIREITA,
      y1: ALTURA_V_FUNIL,
      x2: FLIPPER_PIVO_DIREITO_X,
      y2: FLIPPER_PIVO_Y,
    },
    // Arestas sólidas dos slingshots (o chute é tratado pelo elemento)
    ...SLINGSHOTS.flatMap((slingshot) =>
      slingshot.vertices.map((vertice, indice) => {
        const proximo = slingshot.vertices[(indice + 1) % 3];
        return {
          tipo: 'segmento' as const,
          x1: vertice.x,
          y1: vertice.y,
          x2: proximo.x,
          y2: proximo.y,
          restituicao: 0.42,
        };
      })
    ),
  ];

  const elementos: ElementoMesa[] = [
    // Slingshots (face de chute virada para o centro do campo)
    ...SLINGSHOTS.map((slingshot) => ({
      id: id(slingshot.id),
      tipo: 'slingshot' as const,
      vertices: slingshot.vertices.map((vertice) => ({
        x: vertice.x,
        y: vertice.y,
      })) as [
        { x: number; y: number },
        { x: number; y: number },
        { x: number; y: number },
      ],
      forca: FORCA_SLINGSHOT,
      pontos: PONTOS_SLINGSHOT,
      faceChute: 0,
    })),
    // Inlanes e outlanes
    {
      id: id('inlane_esq'),
      tipo: 'inlane',
      x: INLANE_ESQUERDA.x,
      y: INLANE_ESQUERDA.y,
      largura: INLANE_ESQUERDA.largura,
      altura: INLANE_ESQUERDA.altura,
      lado: 'esquerda',
    },
    {
      id: id('outlane_esq'),
      tipo: 'outlane',
      x: OUTLANE_ESQUERDA.x,
      y: OUTLANE_ESQUERDA.y,
      largura: OUTLANE_ESQUERDA.largura,
      altura: OUTLANE_ESQUERDA.altura,
      lado: 'esquerda',
    },
    {
      id: id('inlane_dir'),
      tipo: 'inlane',
      x: INLANE_DIREITA.x,
      y: INLANE_DIREITA.y,
      largura: INLANE_DIREITA.largura,
      altura: INLANE_DIREITA.altura,
      lado: 'direita',
    },
    {
      id: id('outlane_dir'),
      tipo: 'outlane',
      x: OUTLANE_DIREITA.x,
      y: OUTLANE_DIREITA.y,
      largura: OUTLANE_DIREITA.largura,
      altura: OUTLANE_DIREITA.altura,
      lado: 'direita',
    },
    // Lançador, portão de mão única e dreno
    {
      id: id('plunger'),
      tipo: 'plunger',
      x: PISTA_CENTRO,
      y: BASE_LANCADOR_Y,
      comprimento: 44,
      forcaMax: FORCA_LANCADOR,
    },
    {
      id: id('portao'),
      tipo: 'portao',
      x: DIVISORIA,
      y: ALTURA_PORTAO,
      largura: PISTA_DIREITA - DIVISORIA,
    },
    {
      id: id('dreno'),
      tipo: 'dreno',
      x: PAREDE_ESQUERDA,
      y: DRENO_Y,
      largura: CAMPO_DIREITA - PAREDE_ESQUERDA,
      altura: 800 - DRENO_Y,
    },
  ];

  const flippers: [DefinicaoFlipper, DefinicaoFlipper] = [
    {
      lado: 'esquerda',
      pivoX: FLIPPER_PIVO_ESQUERDO_X,
      pivoY: FLIPPER_PIVO_Y,
      comprimento: FLIPPER_COMPRIMENTO,
      raio: FLIPPER_ESPESSURA_BASE / 2,
      raioPonta: FLIPPER_ESPESSURA_PONTA / 2,
      anguloRepouso: FLIPPER_ANGULO_REPOUSO,
      anguloAtivo: FLIPPER_ANGULO_ATIVO,
    },
    {
      lado: 'direita',
      pivoX: FLIPPER_PIVO_DIREITO_X,
      pivoY: FLIPPER_PIVO_Y,
      comprimento: FLIPPER_COMPRIMENTO,
      raio: FLIPPER_ESPESSURA_BASE / 2,
      raioPonta: FLIPPER_ESPESSURA_PONTA / 2,
      anguloRepouso: Math.PI - FLIPPER_ANGULO_REPOUSO,
      anguloAtivo: Math.PI - FLIPPER_ANGULO_ATIVO,
    },
  ];

  const regioesDreno: RegiaoDreno[] = [
    { id: 'centro', rotulo: 'CENTRO', ...REGIAO_CENTRO },
    { id: 'outlane_esq', rotulo: 'OUTLANE E', ...REGIAO_OUTLANE_ESQUERDA },
    { id: 'outlane_dir', rotulo: 'OUTLANE D', ...REGIAO_OUTLANE_DIREITA },
  ];

  return { geometria, elementos, flippers, regioesDreno };
}
