/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Definição por dados da mesa "Noite na Gafieira".
 *
 * A parte de baixo do campo (moldura, funil, flippers, sensores, lançador,
 * portão e dreno) vem da biblioteca compartilhada (`criarFundoPadrao`).
 * Aqui ficam apenas os elementos do salão e as regras.
 */

import {
  ContextoRegra,
  DefinicaoMesa,
  ElementoMesa,
  Parede,
} from '../../shared/pinball';
import { criarFundoPadrao } from '../../shared/pinball/fundo';
import {
  desenharBolaGafieira,
  desenharCamadaEstatica,
  desenharCenarioAnimado,
  desenharElementoGafieira,
  desenharPainelGafieira,
} from './arte';
import * as T from './tuning';

/** Paredes próprias da mesa (o resto vem do fundo padrão). */
const GEOMETRIA_PROPRIA: Parede[] = [
  // Guias do canal do pandeiro (spinner)
  { tipo: 'segmento', x1: T.SPINNER_GUIA_X[0], y1: T.SPINNER_GUIA_TOPO, x2: T.SPINNER_GUIA_X[0], y2: T.SPINNER_GUIA_BASE },
  { tipo: 'segmento', x1: T.SPINNER_GUIA_X[1], y1: T.SPINNER_GUIA_TOPO, x2: T.SPINNER_GUIA_X[1], y2: T.SPINNER_GUIA_BASE },
];

/** Elementos próprios do salão. */
const ELEMENTOS_PROPRIOS: ElementoMesa[] = [
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
];

export function criarMesaGafieira(): DefinicaoMesa {
  const fundo = criarFundoPadrao();

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
