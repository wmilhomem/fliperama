/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Definição por dados da mesa "Noite na Gafieira".
 *
 * Geometria do campo, elementos, luzes e regras. Tudo original.
 * Os números vêm de `tuning.ts`.
 */

import {
  ContextoRegra,
  DefinicaoMesa,
  ElementoMesa,
  Parede,
} from '../../shared/pinball';
import {
  desenharBolaGafieira,
  desenharCamadaEstatica,
  desenharCenarioAnimado,
  desenharElementoGafieira,
  desenharPainelGafieira,
} from './arte';
import * as T from './tuning';

/** Paredes do campo (em coordenadas absolutas do canvas). */
const GEOMETRIA: Parede[] = [
  // Teto do salão (do canto arredondado até a pista do plunger)
  {
    tipo: 'segmento',
    x1: T.PAREDE_ESQUERDA + T.CANTO_RAIO,
    y1: T.TOPO_CAMPO,
    x2: T.PISTA_DIREITA,
    y2: T.TOPO_CAMPO,
  },
  // Canto superior esquerdo arredondado: devolve a bola para o centro
  {
    tipo: 'arco',
    cx: T.PAREDE_ESQUERDA + T.CANTO_RAIO,
    cy: T.TOPO_CAMPO + T.CANTO_RAIO,
    raio: T.CANTO_RAIO,
    anguloInicio: Math.PI,
    anguloFim: (3 * Math.PI) / 2,
    sentido: 1,
    interno: true,
  },
  // Parede externa esquerda
  {
    tipo: 'segmento',
    x1: T.PAREDE_ESQUERDA,
    y1: T.TOPO_CAMPO + T.CANTO_RAIO,
    x2: T.PAREDE_ESQUERDA,
    y2: 790,
  },
  // Parede interna da pista do plunger (face do divisor)
  {
    tipo: 'segmento',
    x1: T.DIVISORIA,
    y1: T.TOPO_DIVISORIA,
    x2: T.DIVISORIA,
    y2: 790,
  },
  // Parede externa da pista do plunger
  { tipo: 'segmento', x1: T.PISTA_DIREITA, y1: T.TOPO_CAMPO, x2: T.PISTA_DIREITA, y2: 790 },
  // Guia do outlane esquerdo (canal de 28 px junto à parede)
  {
    tipo: 'segmento',
    x1: T.GUIA_OUTLANE_ESQUERDA,
    y1: T.ALTURA_V_FUNIL,
    x2: T.GUIA_OUTLANE_ESQUERDA,
    y2: T.BASE_GUIA_OUTLANE,
  },
  // Guia do inlane esquerdo (funil até o pivô do flipper)
  {
    tipo: 'segmento',
    x1: T.GUIA_OUTLANE_ESQUERDA,
    y1: T.ALTURA_V_FUNIL,
    x2: T.FLIPPER_PIVO_ESQUERDO_X,
    y2: T.FLIPPER_PIVO_Y,
  },
  // Guia do outlane direito
  {
    tipo: 'segmento',
    x1: T.GUIA_OUTLANE_DIREITA,
    y1: T.ALTURA_V_FUNIL,
    x2: T.GUIA_OUTLANE_DIREITA,
    y2: T.BASE_GUIA_OUTLANE,
  },
  // Guia do inlane direito
  {
    tipo: 'segmento',
    x1: T.GUIA_OUTLANE_DIREITA,
    y1: T.ALTURA_V_FUNIL,
    x2: T.FLIPPER_PIVO_DIREITO_X,
    y2: T.FLIPPER_PIVO_Y,
  },
  // Guias do canal do pandeiro (spinner)
  { tipo: 'segmento', x1: T.SPINNER_GUIA_X[0], y1: T.SPINNER_GUIA_TOPO, x2: T.SPINNER_GUIA_X[0], y2: T.SPINNER_GUIA_BASE },
  { tipo: 'segmento', x1: T.SPINNER_GUIA_X[1], y1: T.SPINNER_GUIA_TOPO, x2: T.SPINNER_GUIA_X[1], y2: T.SPINNER_GUIA_BASE },
  // Arestas sólidas dos slingshots (o chute é tratado pelo elemento)
  ...T.SLINGSHOTS.flatMap((slingshot) =>
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

/** Elementos da mesa. */
const ELEMENTOS: ElementoMesa[] = [
  // Bumpers de pop (tamborins) em triângulo
  ...T.BUMPERS.map((bumper, indice) => ({
    id: `tamborim${indice + 1}`,
    tipo: 'bumper' as const,
    x: bumper.x,
    y: bumper.y,
    raio: T.RAIO_BUMPER,
    forca: T.FORCA_BUMPER,
    pontos: T.PONTOS_BUMPER,
  })),

  // Banco de alvos de queda S-A-M-B-A
  ...T.LETRAS.map((letra) => ({
    id: letra.id,
    tipo: 'alvoQueda' as const,
    x: letra.x,
    y: letra.y,
    largura: T.ALVO_QUEDA_LARGURA,
    altura: T.ALVO_QUEDA_ALTURA,
    rotulo: letra.letra,
    grupo: 'samba',
    pontos: T.PONTOS_ALVO_QUEDA,
  })),

  // Pistas de rolagem do topo (luz PALCO)
  ...T.PALCO_X.map((x, indice) => ({
    id: `palco${indice + 1}`,
    tipo: 'rollover' as const,
    x,
    y: T.PALCO_Y,
    largura: T.PALCO_LARGURA,
    altura: T.PALCO_ALTURA,
    rotulo: 'PALCO',
  })),

  // Trio de alvos fixos (cavaquinho, surdo e tamborim)
  ...T.TRIO.map((alvo) => ({
    id: alvo.id,
    tipo: 'alvoFixo' as const,
    x: alvo.x,
    y: alvo.y,
    largura: T.ALVO_FIXO_LARGURA,
    altura: T.ALVO_FIXO_ALTURA,
    rotulo: alvo.rotulo,
    grupo: 'trio',
    pontos: T.PONTOS_ALVO_FIXO,
  })),

  // Spinner (pandeiro) no canal lateral
  {
    id: 'pandeiro',
    tipo: 'spinner',
    x: T.SPINNER_X,
    y: T.SPINNER_Y,
    largura: T.SPINNER_LARGURA,
    altura: T.SPINNER_ALTURA,
    pontos: T.PONTOS_SPINNER,
  },

  // Slingshots (face de chute virada para o centro do campo)
  ...T.SLINGSHOTS.map((slingshot) => ({
    id: slingshot.id,
    tipo: 'slingshot' as const,
    vertices: slingshot.vertices.map((vertice) => ({ x: vertice.x, y: vertice.y })) as [
      { x: number; y: number },
      { x: number; y: number },
      { x: number; y: number },
    ],
    forca: T.FORCA_SLINGSHOT,
    pontos: T.PONTOS_SLINGSHOT,
    faceChute: 0,
  })),

  // Inlanes e outlanes
  {
    id: 'inlane_esq',
    tipo: 'inlane',
    x: T.INLANE_ESQUERDA.x,
    y: T.INLANE_ESQUERDA.y,
    largura: T.INLANE_ESQUERDA.largura,
    altura: T.INLANE_ESQUERDA.altura,
    lado: 'esquerda',
  },
  {
    id: 'outlane_esq',
    tipo: 'outlane',
    x: T.OUTLANE_ESQUERDA.x,
    y: T.OUTLANE_ESQUERDA.y,
    largura: T.OUTLANE_ESQUERDA.largura,
    altura: T.OUTLANE_ESQUERDA.altura,
    lado: 'esquerda',
  },
  {
    id: 'inlane_dir',
    tipo: 'inlane',
    x: T.INLANE_DIREITA.x,
    y: T.INLANE_DIREITA.y,
    largura: T.INLANE_DIREITA.largura,
    altura: T.INLANE_DIREITA.altura,
    lado: 'direita',
  },
  {
    id: 'outlane_dir',
    tipo: 'outlane',
    x: T.OUTLANE_DIREITA.x,
    y: T.OUTLANE_DIREITA.y,
    largura: T.OUTLANE_DIREITA.largura,
    altura: T.OUTLANE_DIREITA.altura,
    lado: 'direita',
  },

  // Lançador, portão de mão única e dreno
  {
    id: 'plunger',
    tipo: 'plunger',
    x: T.PISTA_CENTRO,
    y: T.BASE_LANCADOR_Y,
    comprimento: 44,
    forcaMax: T.FORCA_LANCADOR,
  },
  {
    id: 'portao',
    tipo: 'portao',
    x: T.DIVISORIA,
    y: T.ALTURA_PORTAO,
    largura: T.PISTA_DIREITA - T.DIVISORIA,
  },
  {
    id: 'dreno',
    tipo: 'dreno',
    x: T.PAREDE_ESQUERDA,
    y: T.DRENO_Y,
    largura: T.CAMPO_DIREITA - T.PAREDE_ESQUERDA,
    altura: T.ALTURA - T.DRENO_Y,
  },
];

export function criarMesaGafieira(): DefinicaoMesa {
  return {
    id: 'gafieira',
    titulo: 'Noite na Gafieira',
    corTema: '#EC4899',
    largura: T.LARGURA,
    altura: T.ALTURA,
    painelAltura: T.PAINEL_ALTURA,
    gravidade: 425,
    bolasPorPartida: 3,
    multiplicadorMaximo: 5,
    ballSave: { segundos: 10, mensagem: 'BOLA SALVA' },
    regioesDreno: [
      { id: 'centro', rotulo: 'CENTRO', ...T.REGIAO_CENTRO },
      { id: 'outlane_esq', rotulo: 'OUTLANE E', ...T.REGIAO_OUTLANE_ESQUERDA },
      { id: 'outlane_dir', rotulo: 'OUTLANE D', ...T.REGIAO_OUTLANE_DIREITA },
    ],
    geometria: GEOMETRIA,
    elementos: ELEMENTOS,
    flippers: [
      {
        lado: 'esquerda',
        pivoX: T.FLIPPER_PIVO_ESQUERDO_X,
        pivoY: T.FLIPPER_PIVO_Y,
        comprimento: T.FLIPPER_COMPRIMENTO,
        raio: T.FLIPPER_ESPESSURA_BASE / 2,
        raioPonta: T.FLIPPER_ESPESSURA_PONTA / 2,
        anguloRepouso: T.FLIPPER_ANGULO_REPOUSO,
        anguloAtivo: T.FLIPPER_ANGULO_ATIVO,
      },
      {
        lado: 'direita',
        pivoX: T.FLIPPER_PIVO_DIREITO_X,
        pivoY: T.FLIPPER_PIVO_Y,
        comprimento: T.FLIPPER_COMPRIMENTO,
        raio: T.FLIPPER_ESPESSURA_BASE / 2,
        raioPonta: T.FLIPPER_ESPESSURA_PONTA / 2,
        anguloRepouso: Math.PI - T.FLIPPER_ANGULO_REPOUSO,
        anguloAtivo: Math.PI - T.FLIPPER_ANGULO_ATIVO,
      },
    ],
    luzes: [
      { id: 'tilt', rotulo: 'TILT', x: 402, y: 52 },
      { id: 'gameOver', rotulo: 'FIM', x: 452, y: 52 },
      { id: 'bolaSalva', rotulo: 'SALVA', x: 512, y: 52 },
    ],
    visores: [
      { id: 'jogador1', rotulo: 'JOGADOR 1', coluna: 0, linha: 0 },
      { id: 'recorde', rotulo: 'RECORDE', coluna: 1, linha: 0 },
    ],
    regras: {
      aoBancoCompleto(grupo: string, ctx: ContextoRegra) {
        if (grupo !== 'samba') return;
        // Todas as letras SAMBA caíram: especial + multiplicador
        ctx.aumentarMultiplicador();
        ctx.acenderLuz('especial', true);
        ctx.acenderLuz('palco', true);
        ctx.audio('especial');
      },
      aoGrupoCompleto(grupo: string, ctx: ContextoRegra) {
        if (grupo !== 'trio') return;
        // Trio de instrumentos completo: atire de novo
        ctx.pontuar(T.PONTOS_TRIO);
        ctx.ativarAtireDeNovo();
        ctx.acenderLuz('atireDeNovo', true);
        ctx.audio('especial');
      },
      aoRollover(_elemento, ctx: ContextoRegra) {
        if (!ctx.elementoAceso('palco1') || !ctx.elementoAceso('palco2')) return;
        ctx.pontuar(T.PONTOS_PALCO);
        ctx.aumentarMultiplicador();
        ctx.apagarElemento('palco1');
        ctx.apagarElemento('palco2');
        ctx.audio('especial');
      },
      aoSpinner(_elemento, ctx: ContextoRegra) {
        ctx.audio('spinner');
      },
      aoDreno(_ctx: ContextoRegra) {
        /* a biblioteca cuida do fim de bola e do bônus */
      },
    },
    desenharPainel: desenharPainelGafieira,
    desenharCamadaEstatica: desenharCamadaEstatica,
    desenharCenario: desenharCenarioAnimado,
    desenharElemento: desenharElementoGafieira,
    desenharBola: desenharBolaGafieira,
  };
}
