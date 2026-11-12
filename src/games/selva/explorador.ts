/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { InputState, SpriteUtils } from '../../engine/types';
import {
  GRAVIDADE,
  VELOCIDADE_ANDAR,
  VELOCIDADE_PULO,
} from './constantes';
import { Explorador, EstadoVisual } from './tipos';

const PALETA: Record<string, string> = {
  h: '#FACC15',
  H: '#B45309',
  s: '#F2C48D',
  c: '#2F6B3A',
  p: '#5B3A1E',
  P: '#2B1B0E',
  b: '#C2410C',
  e: '#111827',
};

const CORPO = [
  '   hhhhhh   ',
  '  hhhhhhhh  ',
  '  hHHHHHHh  ',
  '   ssssss   ',
  '   ssssss   ',
  '  cccccccc  ',
  ' bccccccccb ',
  ' bccccccccb ',
  ' bccccccccb ',
  '  cccccccc  ',
  '  pppppppp  ',
  '  pppppppp  ',
];

const PERNAS: Record<string, string[]> = {
  parado: [
    '  ppp  ppp  ',
    '  ppp  ppp  ',
    '  ppp  ppp  ',
    '  ppp  ppp  ',
    '  PPP  PPP  ',
    '  PPP  PPP  ',
  ],
  andar1: [
    '  ppp  ppp  ',
    '  ppp  ppp  ',
    ' ppp    ppp ',
    ' ppp    ppp ',
    'PPP      PPP',
    'PPP      PPP',
  ],
  andar2: [
    '  pppppppp  ',
    '   pppppp   ',
    '   pppppp   ',
    '  ppp  ppp  ',
    ' PPP    PPP ',
    ' PPP    PPP ',
  ],
  andar3: [
    '  ppp  ppp  ',
    '  ppp  ppp  ',
    '  ppp  ppp  ',
    ' ppp    ppp ',
    'PPP      PPP',
    'PPP      PPP',
  ],
  pulando: [
    '  pppppppp  ',
    '  ppp  ppp  ',
    '  ppp  ppp  ',
    '  PPP  PPP  ',
    '   PPPPPP   ',
    '   PPPPPP   ',
  ],
  caindo: [
    '  ppp  ppp  ',
    ' ppp    ppp ',
    ' ppp    ppp ',
    'PPP      PPP',
    'PPP      PPP',
    '           ',
  ],
  escada: [
    '  ppp  ppp  ',
    '  ppp  ppp  ',
    '  ppp  ppp  ',
    '  ppp  ppp  ',
    '   PP  PP   ',
    '   PP  PP   ',
  ],
  cipo: [
    '  ppp  ppp  ',
    '  ppp  ppp  ',
    '  ppp  ppp  ',
    '  ppp  ppp  ',
    '   PP  PP   ',
    '   PP  PP   ',
  ],
};

const QUADROS_ANDANDO = ['andar1', 'andar2', 'andar3', 'andar2'];

export function criarExplorador(x: number, y: number): Explorador {
  return {
    x,
    y,
    vx: 0,
    vy: 0,
    virado: 1,
    noChao: true,
    emEscada: false,
    emCipo: false,
    estado: 'parado',
    tempoAnim: 0,
    tempoPasso: 0,
    atordoado: 0,
    invulneravel: 0,
    danoCooldown: 0,
  };
}

export function atualizarMovimento(
  jogador: Explorador,
  dt: number,
  input: InputState
): { pulou: boolean; passo: boolean } {
  jogador.tempoAnim += dt;
  jogador.atordoado = Math.max(0, jogador.atordoado - dt);
  jogador.invulneravel = Math.max(0, jogador.invulneravel - dt);
  jogador.danoCooldown = Math.max(0, jogador.danoCooldown - dt);

  if (jogador.emEscada || jogador.emCipo) {
    return { pulou: false, passo: false };
  }

  const direcao = jogador.atordoado > 0 ? 0 : (input.direita ? 1 : 0) - (input.esquerda ? 1 : 0);
  let pulou = false;

  if (direcao !== 0) {
    jogador.virado = direcao > 0 ? 1 : -1;
    jogador.vx = direcao * VELOCIDADE_ANDAR;
    jogador.x += jogador.vx * dt;
  } else {
    jogador.vx = 0;
  }

  if (jogador.atordoado <= 0 && input.acaoPressionada && jogador.noChao) {
    jogador.vy = VELOCIDADE_PULO;
    jogador.noChao = false;
    pulou = true;
  }

  if (!jogador.noChao) {
    jogador.vy += GRAVIDADE * dt;
    jogador.y += jogador.vy * dt;
  }

  let passo = false;

  if (jogador.noChao && direcao !== 0 && jogador.atordoado <= 0) {
    jogador.tempoPasso += dt;
    if (jogador.tempoPasso >= 0.3) {
      jogador.tempoPasso = 0;
      passo = true;
    }
  } else {
    jogador.tempoPasso = 0;
  }

  atualizarEstadoVisual(jogador, direcao);

  return { pulou, passo };
}

export function atualizarEstadoVisual(jogador: Explorador, direcao: number): void {
  if (jogador.emCipo) {
    jogador.estado = 'cipo';
    return;
  }

  if (jogador.emEscada) {
    jogador.estado = 'escada';
    return;
  }

  if (!jogador.noChao) {
    jogador.estado = jogador.vy < 0 ? 'pulando' : 'caindo';
    return;
  }

  jogador.estado = direcao !== 0 && jogador.atordoado <= 0 ? 'andando' : 'parado';
}

export function definirDerrotado(jogador: Explorador): void {
  jogador.estado = 'derrotado';
  jogador.vx = 0;
  jogador.vy = 0;
  jogador.emCipo = false;
  jogador.emEscada = false;
  jogador.noChao = true;
}

export function desenharExplorador(
  g: CanvasRenderingContext2D,
  sprites: SpriteUtils,
  jogador: Explorador,
  tempo: number
): void {
  if (jogador.invulneravel > 0 && Math.floor(tempo * 14) % 2 === 0) return;

  const x = Math.round(jogador.x);
  const y = Math.round(jogador.y);

  if (jogador.estado === 'derrotado') {
    desenharDerrotado(g, x, y);
    return;
  }

  const quadro = obterQuadro(jogador);
  const matriz = [...CORPO, ...PERNAS[quadro]];
  const esquerda = x - 6;
  const topo = y - 18;

  sprites.desenharMatriz(g, matriz, PALETA, esquerda, topo, 1, jogador.virado < 0);

  desenharDetalhes(g, jogador, esquerda, topo, x, y, tempo);
}

function obterQuadro(jogador: Explorador): string {
  if (jogador.estado === 'pulando') return 'pulando';
  if (jogador.estado === 'caindo') return 'caindo';
  if (jogador.estado === 'escada') return 'escada';
  if (jogador.estado === 'cipo') return 'cipo';

  if (jogador.estado === 'andando') {
    const indice = Math.floor(jogador.tempoAnim * 9) % QUADROS_ANDANDO.length;
    return QUADROS_ANDANDO[indice];
  }

  return 'parado';
}

function desenharDetalhes(
  g: CanvasRenderingContext2D,
  jogador: Explorador,
  esquerda: number,
  topo: number,
  x: number,
  y: number,
  tempo: number
): void {
  const frente = jogador.virado > 0;

  g.fillStyle = PALETA.s;
  if (jogador.estado === 'pulando' || jogador.estado === 'cipo') {
    g.fillRect(esquerda + 1, topo + 3, 2, 5);
    g.fillRect(esquerda + 9, topo + 3, 2, 5);
    g.fillStyle = PALETA.e;
    g.fillRect(esquerda + 3, topo + 3, 1, 1);
    g.fillRect(esquerda + 8, topo + 3, 1, 1);
  } else if (jogador.estado === 'andando') {
    const balanco = Math.floor(tempo * 8) % 2 === 0 ? 1 : -1;
    g.fillRect(esquerda + 1, topo + 7 + balanco, 2, 5);
    g.fillRect(esquerda + 9, topo + 7 - balanco, 2, 5);
    g.fillStyle = PALETA.e;
    g.fillRect(frente ? esquerda + 7 : esquerda + 4, topo + 4, 1, 1);
  } else {
    g.fillRect(esquerda + 1, topo + 7, 2, 5);
    g.fillRect(esquerda + 9, topo + 7, 2, 5);
    g.fillStyle = PALETA.e;
    g.fillRect(frente ? esquerda + 7 : esquerda + 4, topo + 4, 1, 1);
  }

  if (jogador.estado === 'cipo') {
    g.fillStyle = PALETA.s;
    g.fillRect(x - 2, y - 16, 2, 6);
    g.fillRect(x, y - 16, 2, 6);
  }
}

function desenharDerrotado(g: CanvasRenderingContext2D, x: number, y: number): void {
  g.fillStyle = PALETA.h;
  g.fillRect(x - 12, y - 8, 9, 4);
  g.fillRect(x - 10, y - 10, 5, 2);
  g.fillStyle = PALETA.H;
  g.fillRect(x - 11, y - 6, 7, 1);
  g.fillStyle = PALETA.s;
  g.fillRect(x - 4, y - 8, 5, 5);
  g.fillStyle = PALETA.c;
  g.fillRect(x + 1, y - 8, 6, 5);
  g.fillStyle = PALETA.p;
  g.fillRect(x + 6, y - 5, 7, 3);
  g.fillStyle = PALETA.P;
  g.fillRect(x + 11, y - 5, 3, 3);
  g.fillStyle = PALETA.e;
  g.fillRect(x - 3, y - 7, 1, 1);
}
