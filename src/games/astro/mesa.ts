/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Definição por dados da mesa "Expedição Astro".
 *
 * A parte de baixo do campo vem da biblioteca compartilhada
 * (`criarFundoPadrao`). Aqui ficam a metade de cima, os elementos do meio
 * e as regras da missão.
 */

import {
  ContextoRegra,
  DefinicaoMesa,
  ElementoMesa,
  Parede,
} from '../../shared/pinball';
import { criarFundoPadrao } from '../../shared/pinball/fundo';
import {
  desenharBolaAstro,
  desenharCamadaEstatica,
  desenharCenarioAnimado,
  desenharElementoAstro,
  desenharPainelAstro,
} from './arte';
import * as T from './tuning';

/** Paredes próprias da mesa: a rampa em órbita e o canal da antena. */
const GEOMETRIA_PROPRIA: Parede[] = [
  // Rampa em órbita (canal com dois trilhos): a bola desce para o centro
  {
    tipo: 'segmento',
    x1: T.ORBITA_TRILHO_SUPERIOR.x1,
    y1: T.ORBITA_TRILHO_SUPERIOR.y1,
    x2: T.ORBITA_TRILHO_SUPERIOR.x2,
    y2: T.ORBITA_TRILHO_SUPERIOR.y2,
    restituicao: 0.3,
  },
  {
    tipo: 'segmento',
    x1: T.ORBITA_TRILHO_INFERIOR.x1,
    y1: T.ORBITA_TRILHO_INFERIOR.y1,
    x2: T.ORBITA_TRILHO_INFERIOR.x2,
    y2: T.ORBITA_TRILHO_INFERIOR.y2,
    restituicao: 0.3,
  },
  // Guias do canal da antena parabólica (spinner)
  {
    tipo: 'segmento',
    x1: T.SPINNER_GUIA_X[0],
    y1: T.SPINNER_GUIA_TOPO,
    x2: T.SPINNER_GUIA_X[0],
    y2: T.SPINNER_GUIA_BASE,
  },
  {
    tipo: 'segmento',
    x1: T.SPINNER_GUIA_X[1],
    y1: T.SPINNER_GUIA_TOPO,
    x2: T.SPINNER_GUIA_X[1],
    y2: T.SPINNER_GUIA_BASE,
  },
];

/** Elementos próprios da mesa (metade de cima e meio do campo). */
const ELEMENTOS_PROPRIOS: ElementoMesa[] = [
  // Cometas (bumpers de pop) em arco
  ...T.COMETAS.map((cometa, indice) => ({
    id: `cometa${indice + 1}`,
    tipo: 'bumper' as const,
    x: cometa.x,
    y: cometa.y,
    raio: T.RAIO_COMETA,
    forca: T.FORCA_COMETA,
    pontos: T.PONTOS_COMETA,
  })),

  // Banco de alvos de queda A-S-T-R-O
  ...T.ASTRO_LETRAS.map((letra) => ({
    id: letra.id,
    tipo: 'alvoQueda' as const,
    x: letra.x,
    y: letra.y,
    largura: T.ALVO_QUEDA_LARGURA,
    altura: T.ALVO_QUEDA_ALTURA,
    rotulo: letra.letra,
    grupo: 'astro',
    pontos: T.PONTOS_ALVO_QUEDA,
  })),

  // Pista central com 5 estações
  ...T.ESTACOES.map((estacao) => ({
    id: estacao.id,
    tipo: 'rollover' as const,
    x: estacao.x,
    y: estacao.y,
    largura: T.ESTACAO_LARGURA,
    altura: T.ESTACAO_ALTURA,
    rotulo: estacao.rotulo,
  })),

  // Dois alvos fixos de planeta
  ...T.PLANETAS.map((planeta) => ({
    id: planeta.id,
    tipo: 'alvoFixo' as const,
    x: planeta.x,
    y: planeta.y,
    largura: T.ALVO_FIXO_LARGURA,
    altura: T.ALVO_FIXO_ALTURA,
    rotulo: planeta.rotulo,
    grupo: 'planetas',
    pontos: T.PONTOS_ALVO_FIXO,
  })),

  // Spinner (antena parabólica) no canal à direita
  {
    id: 'antena',
    tipo: 'spinner',
    x: T.SPINNER_X,
    y: T.SPINNER_Y,
    largura: T.SPINNER_LARGURA,
    altura: T.SPINNER_ALTURA,
    pontos: T.PONTOS_SPINNER,
  },

  // Sensor do arco em órbita (conta as passagens)
  {
    id: 'orbita',
    tipo: 'trilho',
    x: T.ORBITA_SENSOR.x,
    y: T.ORBITA_SENSOR.y,
    largura: T.ORBITA_SENSOR.largura,
    altura: T.ORBITA_SENSOR.altura,
    pontos: T.PONTOS_ORBITA,
  },
];

export function criarMesaAstro(): DefinicaoMesa {
  const fundo = criarFundoPadrao();

  // Estado do "modo foguete" (3 voltas na órbita)
  let voltasOrbita = 0;
  let tempoFoguete = 0;

  const idsEstacoes = T.ESTACOES.map((estacao) => estacao.id);

  return {
    id: 'astro',
    titulo: 'Expedição Astro',
    corTema: '#38BDF8',
    largura: T.LARGURA,
    altura: T.ALTURA,
    painelAltura: T.PAINEL_ALTURA,
    gravidade: 425,
    bolasPorPartida: 3,
    multiplicadorMaximo: 5,
    ballSave: { segundos: 10, mensagem: 'BOLA SALVA' },
    regioesDreno: fundo.regioesDreno,
    geometria: [...fundo.geometria, ...GEOMETRIA_PROPRIA],
    elementos: [...ELEMENTOS_PROPRIOS, ...fundo.elementos],
    flippers: fundo.flippers,
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
      aoBumper(_elemento, ctx: ContextoRegra) {
        // No modo foguete os cometas valem o triplo (100 + 200 extras).
        if (tempoFoguete > 0) {
          ctx.pontuar(T.PONTOS_COMETA * (T.MULTIPLICADOR_MODO_FOGUETE - 1));
        }
      },
      aoRollover(_elemento, ctx: ContextoRegra) {
        const todasAcesas = idsEstacoes.every((id) => ctx.elementoAceso(id));
        if (!todasAcesas) return;
        // Todas as 5 estações acesas: bônus e multiplicador.
        ctx.pontuar(T.PONTOS_ESTACOES_COMPLETAS);
        ctx.aumentarMultiplicador();
        for (const id of idsEstacoes) ctx.apagarElemento(id);
        ctx.audio('especial');
      },
      aoBancoCompleto(grupo: string, ctx: ContextoRegra) {
        if (grupo !== 'astro') return;
        // A-S-T-R-O completo: acende o ESPECIAL (bola extra).
        ctx.acenderLuz('especial', true);
        ctx.audio('especial');
      },
      aoTrilho(_elemento, ctx: ContextoRegra) {
        voltasOrbita += 1;
        ctx.audio('spinner');
        if (voltasOrbita < T.ORBITAS_PARA_MODO_FOGUETE) return;
        // Modo foguete: cometas valem o triplo por 20 segundos.
        voltasOrbita = 0;
        tempoFoguete = T.DURACAO_MODO_FOGUETE;
        ctx.acenderLuz('especial', true);
        ctx.audio('vitoria');
      },
      aoSpinner(_elemento, ctx: ContextoRegra) {
        ctx.audio('spinner');
      },
      aoDreno(_ctx: ContextoRegra) {
        /* a biblioteca cuida do fim de bola e do bônus */
      },
    },
    desenharPainel: desenharPainelAstro,
    desenharCamadaEstatica: desenharCamadaEstatica,
    desenharCenario: desenharCenarioAnimado,
    desenharElemento: desenharElementoAstro,
    desenharBola: desenharBolaAstro,
    aoAtualizar(dt: number) {
      if (tempoFoguete > 0) tempoFoguete = Math.max(0, tempoFoguete - dt);
    },
  };
}
