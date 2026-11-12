/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { InputState, SpriteUtils } from '../../engine/types';
import {
  ALTURA_PULO,
  CORES,
  DURACAO_AFOGAMENTO,
  DURACAO_PULO,
  LAND_Y,
  VELOCIDADE_ANDAR,
  VELOCIDADE_AR,
} from './constantes';
import { Jogador } from './tipos';

const PALETA = {
  h: CORES.chapéuEscuro,
  H: CORES.chapéu,
  S: CORES.pele,
  s: CORES.peleSombra,
  O: CORES.contorno,
  R: CORES.vermelho,
  r: '#B91C1C',
  B: CORES.azul,
  L: CORES.pele,
  K: CORES.roxoEscuro,
};

const MATRIZ_PARADO = [
  '      hhhh      ',
  '     hhhhhh     ',
  '    hhhhhhhh    ',
  '   HHHHHHHHHH   ',
  '  HHHHHHHHHHHH  ',
  '   hhhhhhhhhh   ',
  '      SSSS      ',
  '     SSSSSS     ',
  '    SSSSSSSS    ',
  '    SOSSSSOS    ',
  '    SSSSSSSS    ',
  '     SSSSSS     ',
  '      SSSS      ',
  '    RRRRRRRR    ',
  '   RRRRRRRRRR   ',
  '  SRRRRRRRRRRS  ',
  '  SRRRRRRRRRRS  ',
  '  SRRRRRRRRRRS  ',
  '   RRRRRRRRRR   ',
  '    RRRRRRRR    ',
  '    BBBBBBBB    ',
  '    BBBBBBBB    ',
  '    BBBBBBBB    ',
  '    BBB  BBB    ',
  '    LLL  LLL    ',
  '    LLL  LLL    ',
  '    LLL  LLL    ',
  '    LLL  LLL    ',
  '    KKK  KKK    ',
  '   KKKK  KKKK   ',
  '                ',
  '                ',
];

const MATRIZ_ANDAR_A = [
  ...MATRIZ_PARADO.slice(0, 26),
  '   LLL    LLL   ',
  '   LLL    LLL   ',
  '   KKK    KKK   ',
  '  KKKK    KKKK  ',
  '                ',
  '                ',
];

const MATRIZ_ANDAR_B = [
  ...MATRIZ_PARADO.slice(0, 26),
  '     LLL  LLL   ',
  '     LLL  LLL   ',
  '     KKK  KKK   ',
  '    KKKK  KKKK  ',
  '                ',
  '                ',
];

const MATRIZ_PULO = [
  '      hhhh      ',
  '     hhhhhh     ',
  '    hhhhhhhh    ',
  '   HHHHHHHHHH   ',
  '  HHHHHHHHHHHH  ',
  '   hhhhhhhhhh   ',
  '      SSSS      ',
  '     SSSSSS     ',
  '    SSSSSSSS    ',
  '    SOSSSSOS    ',
  '    SSSSSSSS    ',
  '     SSSSSS     ',
  '  S   SSSS   S  ',
  '  S  RRRRRR  S  ',
  '  S RRRRRRRR S  ',
  '   SRRRRRRRRS   ',
  '   RRRRRRRRRR   ',
  '   RRRRRRRRRR   ',
  '    RRRRRRRR    ',
  '    BBBBBBBB    ',
  '    BBBBBBBB    ',
  '    BBBBBBBB    ',
  '    BBBBBBBB    ',
  '    LLLLLLLL    ',
  '    LLLLLLLL    ',
  '    KKKKKKKK    ',
  '    KKKKKKKK    ',
  '                ',
  '                ',
  '                ',
  '                ',
  '                ',
];

const MATRIZ_CAINDO = [
  ...MATRIZ_PARADO.slice(0, 12),
  '  S          S  ',
  '  S  RRRRRR  S  ',
  '  S RRRRRRRR S  ',
  '   SRRRRRRRRS   ',
  '   RRRRRRRRRR   ',
  '   RRRRRRRRRR   ',
  '    RRRRRRRR    ',
  '    BBBBBBBB    ',
  '    BBBBBBBB    ',
  '    BBBBBBBB    ',
  '   LLL    LLL   ',
  '   LLL    LLL   ',
  '   KKK    KKK   ',
  '  KKKK    KKKK  ',
  '                ',
  '                ',
  '                ',
  '                ',
];

const MATRIZ_COMEMORANDO = [
  '      hhhh      ',
  '     hhhhhh     ',
  '    hhhhhhhh    ',
  '   HHHHHHHHHH   ',
  '  HHHHHHHHHHHH  ',
  '   hhhhhhhhhh   ',
  '      SSSS      ',
  '     SSSSSS     ',
  '    SSSSSSSS    ',
  '    SOSSSSOS    ',
  '    SSSSSSSS    ',
  '     SSSSSS     ',
  '  S   SSSS   S  ',
  '  S  RRRRRR  S  ',
  '  S RRRRRRRR S  ',
  '   SRRRRRRRRS   ',
  '   RRRRRRRRRR   ',
  '   RRRRRRRRRR   ',
  '    RRRRRRRR    ',
  '    BBBBBBBB    ',
  '    BBBBBBBB    ',
  '    BBBBBBBB    ',
  '    BBB  BBB    ',
  '    LLL  LLL    ',
  '    LLL  LLL    ',
  '    KKK  KKK    ',
  '   KKKK  KKKK   ',
  '                ',
  '                ',
  '                ',
  '                ',
  '                ',
];

export function criarJogador(): Jogador {
  return {
    x: 40,
    y: LAND_Y,
    fileira: -1,
    direcao: 1,
    estado: 'parado',
    tempoAnim: 0,
    plataformaId: null,
    pulo: null,
    invulneravel: 0,
    tempoAfogando: 0,
  };
}

export function reposicionarJogador(jogador: Jogador, x = 40): void {
  jogador.x = x;
  jogador.y = LAND_Y;
  jogador.fileira = -1;
  jogador.direcao = 1;
  jogador.estado = 'parado';
  jogador.tempoAnim = 0;
  jogador.plataformaId = null;
  jogador.pulo = null;
  jogador.tempoAfogando = 0;
}

export function moverJogador(
  jogador: Jogador,
  input: InputState,
  dt: number,
  limiteEsquerda: number,
  limiteDireita: number,
  velocidade = VELOCIDADE_ANDAR
): void {
  let eixo = 0;
  if (input.esquerda) eixo -= 1;
  if (input.direita) eixo += 1;

  if (eixo !== 0) {
    jogador.direcao = eixo > 0 ? 1 : -1;
    jogador.x += eixo * velocidade * dt;
    jogador.tempoAnim += dt;
    if (jogador.estado !== 'pulando') {
      jogador.estado = 'andando';
    }
  } else if (jogador.estado === 'andando') {
    jogador.estado = 'parado';
  }

  jogador.x = Math.max(limiteEsquerda, Math.min(limiteDireita, jogador.x));
}

export function iniciarPulo(jogador: Jogador, destinoFileira: number, destinoY: number): void {
  jogador.pulo = {
    destinoFileira,
    origemY: jogador.y,
    destinoY,
    tempo: 0,
    duracao: DURACAO_PULO,
    altura: ALTURA_PULO,
  };
  jogador.estado = 'pulando';
  jogador.plataformaId = null;
}

export function atualizarPulo(jogador: Jogador, dt: number): boolean {
  const pulo = jogador.pulo;
  if (!pulo) return true;

  pulo.tempo += dt;
  const t = Math.min(1, pulo.tempo / pulo.duracao);
  jogador.y = pulo.origemY + (pulo.destinoY - pulo.origemY) * t - Math.sin(Math.PI * t) * pulo.altura;
  jogador.tempoAnim += dt;

  if (t >= 1) {
    jogador.pulo = null;
    return true;
  }

  return false;
}

export function atualizarAfogamento(jogador: Jogador, dt: number): boolean {
  jogador.tempoAfogando += dt;
  jogador.y += 26 * dt;
  return jogador.tempoAfogando >= DURACAO_AFOGAMENTO;
}

export function atualizarAnimacaoJogador(jogador: Jogador, dt: number): void {
  jogador.tempoAnim += dt;
}

export function desenharJogador(
  g: CanvasRenderingContext2D,
  sprites: SpriteUtils,
  jogador: Jogador,
  tempo: number
): void {
  if (jogador.invulneravel > 0 && Math.floor(tempo * 16) % 2 === 0) {
    return;
  }

  let matriz = MATRIZ_PARADO;
  if (jogador.estado === 'andando') {
    matriz = Math.floor(jogador.tempoAnim * 9) % 2 === 0 ? MATRIZ_ANDAR_A : MATRIZ_ANDAR_B;
  } else if (jogador.estado === 'pulando') {
    matriz = MATRIZ_PULO;
  } else if (jogador.estado === 'afogando') {
    matriz = MATRIZ_CAINDO;
  } else if (jogador.estado === 'comemorando') {
    matriz = MATRIZ_COMEMORANDO;
  }

  g.save();
  if (jogador.estado === 'afogando') {
    g.globalAlpha = Math.max(0.2, 1 - jogador.tempoAfogando / DURACAO_AFOGAMENTO);
    g.fillStyle = 'rgba(125, 211, 252, 0.65)';
    g.fillRect(Math.floor(jogador.x - 12), Math.floor(jogador.y + 1), 24, 3);
    g.fillRect(Math.floor(jogador.x - 18), Math.floor(jogador.y + 5), 36, 2);
  }

  sprites.desenharMatriz(
    g,
    matriz,
    PALETA,
    Math.floor(jogador.x - 8),
    Math.floor(jogador.y - 32),
    1,
    jogador.direcao === -1
  );
  g.restore();
}
