/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Definição por dados da mesa "Noite na Gafieira".
 *
 * Geometria do campo, elementos, luzes e regras. Tudo original.
 */

import {
  ContextoRegra,
  DefinicaoMesa,
  ElementoMesa,
  Parede,
} from '../../shared/pinball';
import {
  desenharBolaGafieira,
  desenharCenarioGafieira,
  desenharElementoGafieira,
  desenharPainelGafieira,
} from './arte';
import { ALTURA, CAMPO, LARGURA, PAINEL_ALTURA } from './constantes';

const MEIO_PI = Math.PI / 2;

/** Paredes do campo (em coordenadas absolutas do canvas). */
const GEOMETRIA: Parede[] = [
  // Teto do salão
  { tipo: 'segmento', x1: 24, y1: 140, x2: 432, y2: 140 },
  // Parede esquerda
  { tipo: 'segmento', x1: 24, y1: 140, x2: 24, y2: 596 },
  // Cotovelo que devolve a bola da canaleta para o campo
  {
    tipo: 'arco',
    cx: 432,
    cy: 180,
    raio: 40,
    anguloInicio: 0,
    anguloFim: -MEIO_PI,
    sentido: -1,
    interno: true,
  },
  // Borda externa da canaleta do lançador
  { tipo: 'segmento', x1: 472, y1: 180, x2: 472, y2: 800 },
  // Parede interna da canaleta
  { tipo: 'segmento', x1: 436, y1: 800, x2: 436, y2: 180 },
  // Guia do outlane esquerdo
  { tipo: 'segmento', x1: 44, y1: 596, x2: 72, y2: 690 },
  // Guia do inlane esquerdo
  { tipo: 'segmento', x1: 96, y1: 584, x2: 132, y2: 656 },
  // Guia do outlane direito
  { tipo: 'segmento', x1: 416, y1: 596, x2: 388, y2: 690 },
  // Guia do inlane direito
  { tipo: 'segmento', x1: 384, y1: 584, x2: 348, y2: 656 },
  // Canal do spinner (pandeiro)
  { tipo: 'segmento', x1: 76, y1: 396, x2: 76, y2: 540 },
  { tipo: 'segmento', x1: 108, y1: 396, x2: 108, y2: 540 },
];

/** Alvos de queda com as letras S-A-M-B-A. */
const LETRAS: Array<{ id: string; letra: string; x: number; y: number }> = [
  { id: 'samba_s', letra: 'S', x: 120, y: 330 },
  { id: 'samba_a1', letra: 'A', x: 180, y: 312 },
  { id: 'samba_m', letra: 'M', x: 240, y: 306 },
  { id: 'samba_b', letra: 'B', x: 300, y: 312 },
  { id: 'samba_a2', letra: 'A', x: 360, y: 330 },
];

/** Elementos da mesa. */
const ELEMENTOS: ElementoMesa[] = [
  // Bumpers de pop (tamborins) em triângulo
  { id: 'tamborim1', tipo: 'bumper', x: 240, y: 200, raio: 24, forca: 340, pontos: 100 },
  { id: 'tamborim2', tipo: 'bumper', x: 172, y: 262, raio: 24, forca: 340, pontos: 100 },
  { id: 'tamborim3', tipo: 'bumper', x: 308, y: 262, raio: 24, forca: 340, pontos: 100 },

  // Banco de alvos de queda S-A-M-B-A
  ...LETRAS.map((letra) => ({
    id: letra.id,
    tipo: 'alvoQueda' as const,
    x: letra.x,
    y: letra.y,
    largura: 30,
    altura: 20,
    rotulo: letra.letra,
    grupo: 'samba',
    pontos: 1000,
  })),

  // Pistas de rolagem do topo (luz PALCO)
  { id: 'palco1', tipo: 'rollover', x: 392, y: 195, largura: 28, altura: 110, rotulo: 'PALCO' },
  { id: 'palco2', tipo: 'rollover', x: 348, y: 195, largura: 28, altura: 110, rotulo: 'PALCO' },

  // Trio de alvos fixos (cavaquinho, surdo e tamborim)
  {
    id: 'cavaquinho',
    tipo: 'alvoFixo',
    x: 160,
    y: 486,
    largura: 36,
    altura: 22,
    rotulo: 'CAVAQUINHO',
    grupo: 'trio',
    pontos: 500,
  },
  {
    id: 'surdo',
    tipo: 'alvoFixo',
    x: 240,
    y: 520,
    largura: 38,
    altura: 24,
    rotulo: 'SURDO',
    grupo: 'trio',
    pontos: 500,
  },
  {
    id: 'tamborim_alvo',
    tipo: 'alvoFixo',
    x: 320,
    y: 486,
    largura: 36,
    altura: 22,
    rotulo: 'TAMBORIM',
    grupo: 'trio',
    pontos: 500,
  },

  // Spinner (pandeiro) no canal lateral
  { id: 'pandeiro', tipo: 'spinner', x: 92, y: 466, largura: 30, altura: 6, pontos: 100 },

  // Slingshots
  {
    id: 'slingshot_esq',
    tipo: 'slingshot',
    vertices: [
      { x: 140, y: 548 },
      { x: 188, y: 596 },
      { x: 140, y: 644 },
    ],
    forca: 210,
    pontos: 10,
  },
  {
    id: 'slingshot_dir',
    tipo: 'slingshot',
    vertices: [
      { x: 340, y: 548 },
      { x: 292, y: 596 },
      { x: 340, y: 644 },
    ],
    forca: 210,
    pontos: 10,
  },

  // Inlanes e outlanes
  { id: 'inlane_esq', tipo: 'inlane', x: 86, y: 630, largura: 30, altura: 40, lado: 'esquerda' },
  { id: 'outlane_esq', tipo: 'outlane', x: 39, y: 630, largura: 16, altura: 40, lado: 'esquerda' },
  { id: 'inlane_dir', tipo: 'inlane', x: 394, y: 630, largura: 30, altura: 40, lado: 'direita' },
  { id: 'outlane_dir', tipo: 'outlane', x: 421, y: 630, largura: 16, altura: 40, lado: 'direita' },

  // Lançador e dreno
  { id: 'plunger', tipo: 'plunger', x: 454, y: 740, comprimento: 44, forcaMax: 1250 },
  { id: 'dreno', tipo: 'dreno', x: 24, y: 736, largura: 412, altura: 64 },
];

export function criarMesaGafieira(): DefinicaoMesa {
  return {
    id: 'gafieira',
    titulo: 'Noite na Gafieira',
    corTema: '#EC4899',
    largura: LARGURA,
    altura: ALTURA,
    painelAltura: PAINEL_ALTURA,
    gravidade: 500,
    bolasPorPartida: 3,
    multiplicadorMaximo: 5,
    geometria: GEOMETRIA,
    elementos: ELEMENTOS,
    flippers: [
      {
        lado: 'esquerda',
        pivoX: CAMPO.pivoEsquerdo.x,
        pivoY: CAMPO.pivoEsquerdo.y,
        comprimento: CAMPO.comprimentoFlipper,
        raio: CAMPO.raioFlipper,
        anguloRepouso: CAMPO.anguloRepousoEsquerdo,
        anguloAtivo: CAMPO.anguloAtivoEsquerdo,
      },
      {
        lado: 'direita',
        pivoX: CAMPO.pivoDireito.x,
        pivoY: CAMPO.pivoDireito.y,
        comprimento: CAMPO.comprimentoFlipper,
        raio: CAMPO.raioFlipper,
        anguloRepouso: CAMPO.anguloRepousoDireito,
        anguloAtivo: CAMPO.anguloAtivoDireito,
      },
    ],
    luzes: [
      { id: 'tilt', rotulo: 'TILT', x: 390, y: 60 },
      { id: 'gameOver', rotulo: 'FIM', x: 418, y: 60 },
      { id: 'recorde', rotulo: 'REC', x: 446, y: 60 },
      { id: 'especial', rotulo: 'ESPEC', x: 390, y: 78 },
      { id: 'atireDeNovo', rotulo: 'NOVA', x: 418, y: 78 },
      { id: 'palco', rotulo: 'PALCO', x: 446, y: 78 },
    ],
    visores: [
      { id: 'jogador1', rotulo: 'JOGADOR 1', coluna: 0, linha: 0 },
      { id: 'recorde', rotulo: 'RECORDE', coluna: 1, linha: 0 },
      { id: 'bonus', rotulo: 'BÔNUS', coluna: 2, linha: 0 },
      { id: 'multiplicador', rotulo: 'MULTIPL.', coluna: 3, linha: 0 },
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
        ctx.pontuar(3000);
        ctx.ativarAtireDeNovo();
        ctx.acenderLuz('atireDeNovo', true);
        ctx.audio('especial');
      },
      aoRollover(_elemento, ctx: ContextoRegra) {
        if (!ctx.elementoAceso('palco1') || !ctx.elementoAceso('palco2')) return;
        ctx.pontuar(5000);
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
    desenharCenario: desenharCenarioGafieira,
    desenharElemento: desenharElementoGafieira,
    desenharBola: desenharBolaGafieira,
  };
}
