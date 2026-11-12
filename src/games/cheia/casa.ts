/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  CASA_ALTURA,
  CASA_LARGURA,
  CASA_PORTA_X,
  CASA_X,
  CASA_Y,
  CORES,
  LAND_Y,
  TOTAL_TABUAS,
} from './constantes';
import { Jogador } from './tipos';

function bloco(
  g: CanvasRenderingContext2D,
  x: number,
  y: number,
  largura: number,
  altura: number,
  cor: string
): void {
  g.fillStyle = cor;
  g.fillRect(Math.floor(x), Math.floor(y), largura, altura);
}

function desenharTelhado(
  g: CanvasRenderingContext2D,
  x: number,
  y: number,
  progresso: number
): void {
  const altura = Math.max(4, Math.floor(30 * progresso));
  const linhas = Math.max(1, Math.ceil(altura / 4));

  for (let i = 0; i < linhas; i++) {
    const inset = Math.floor((CASA_LARGURA - 16) / 2 * (1 - i / linhas));
    const largura = CASA_LARGURA - 16 - inset * 2;
    const cor = i % 2 === 0 ? CORES.palha : CORES.palhaClara;
    bloco(g, x + 8 + inset, y + 38 - (i + 1) * 4, largura, 4, cor);
  }

  bloco(g, x + 12, y + 30, CASA_LARGURA - 24, 4, CORES.palhaEscura);
  bloco(g, x + 20, y + 24, CASA_LARGURA - 40, 3, CORES.palhaClara);
}

function desenharRede(
  g: CanvasRenderingContext2D,
  x: number,
  y: number
): void {
  bloco(g, x - 18, y + 46, 3, 28, CORES.madeiraEscura);
  bloco(g, x - 46, y + 46, 3, 28, CORES.madeiraEscura);
  for (let i = 0; i < 5; i++) {
    bloco(g, x - 44 + i * 8, y + 54 + Math.sin(i * 1.4) * 3, 7, 3, CORES.rosaClaro);
  }
  bloco(g, x - 44, y + 52, 3, 4, CORES.rosa);
  bloco(g, x - 14, y + 56, 3, 4, CORES.rosa);
}

function desenharBandeira(
  g: CanvasRenderingContext2D,
  x: number,
  y: number,
  tempo: number
): void {
  bloco(g, x, y - 16, 2, 40, CORES.madeiraEscura);
  const onda = Math.sin(tempo * 3) * 2;
  bloco(g, x + 2, y - 16, 16 + onda, 10, CORES.rosa);
  bloco(g, x + 2, y - 16, 8 + onda, 3, CORES.rosaClaro);
  bloco(g, x + 2, y - 8, 12 + onda, 2, CORES.rosaEscuro);
}

function desenharCanoa(
  g: CanvasRenderingContext2D,
  x: number,
  y: number
): void {
  bloco(g, x, y + 44, 50, 8, CORES.madeira);
  bloco(g, x + 4, y + 42, 42, 3, CORES.madeiraClara);
  bloco(g, x + 10, y + 52, 30, 4, CORES.madeiraEscura);
  bloco(g, x + 18, y + 38, 2, 10, CORES.madeiraEscura);
  bloco(g, x + 30, y + 38, 2, 10, CORES.madeiraEscura);
}

function desenharLampiao(
  g: CanvasRenderingContext2D,
  x: number,
  y: number
): void {
  bloco(g, x, y, 2, 12, CORES.madeiraEscura);
  bloco(g, x - 3, y + 10, 8, 8, CORES.amarelo);
  bloco(g, x - 1, y + 12, 4, 4, CORES.rosaClaro);
}

export function desenharCasa(
  g: CanvasRenderingContext2D,
  tabuas: number,
  casasConcluidas: number,
  tempo: number
): void {
  const x = CASA_X;
  const y = CASA_Y;

  bloco(g, x + 4, y + CASA_ALTURA - 4, CASA_LARGURA - 8, 6, 'rgba(31, 41, 55, 0.28)');

  if (tabuas <= 0) {
    bloco(g, x + 12, y + CASA_ALTURA - 24, 4, 20, CORES.madeiraEscura);
    bloco(g, x + CASA_LARGURA - 16, y + CASA_ALTURA - 24, 4, 20, CORES.madeiraEscura);
    bloco(g, x + 8, y + CASA_ALTURA - 8, CASA_LARGURA - 16, 3, CORES.madeira);
    bloco(g, x + 44, y + CASA_ALTURA - 34, 40, 10, 'rgba(31, 41, 55, 0.72)');
    g.fillStyle = CORES.palha;
    g.font = '6px "Press Start 2P", monospace';
    g.textAlign = 'center';
    g.fillText('CASA', x + CASA_LARGURA / 2, y + CASA_ALTURA - 27);
    return;
  }

  const progresso = tabuas / TOTAL_TABUAS;
  const paredes = Math.min(1, tabuas / 8);
  const telhado = Math.max(0, (tabuas - 7) / 9);
  const alturaParede = Math.max(8, Math.floor(38 * paredes));
  const baseParede = y + 72;

  bloco(g, x + 18, y + 58, 4, 32, CORES.madeiraEscura);
  bloco(g, x + CASA_LARGURA - 22, y + 58, 4, 32, CORES.madeiraEscura);
  bloco(g, x + 46, y + 66, 4, 24, CORES.madeiraEscura);
  bloco(g, x + CASA_LARGURA - 50, y + 66, 4, 24, CORES.madeiraEscura);

  if (tabuas >= 2) {
    bloco(g, x + 12, y + 68, CASA_LARGURA - 24, 6, CORES.madeiraClara);
    bloco(g, x + 8, y + 72, CASA_LARGURA - 16, 4, CORES.madeira);
    for (let i = 0; i < 6; i++) {
      bloco(g, x + 18 + i * 16, y + 68, 2, 4, CORES.madeiraEscura);
    }
  }

  if (tabuas >= 4) {
    bloco(g, x + 24, y + 70, CASA_LARGURA - 48, 4, CORES.madeiraEscura);
    for (let i = 0; i < 12; i++) {
      const px = x + 28 + (i % 6) * 12;
      const py = y + 52 - Math.floor(i / 6) * 8;
      bloco(g, px, py, 10, 2, CORES.rosaClaro);
    }
  }

  if (paredes > 0) {
    bloco(g, x + 20, baseParede - alturaParede, CASA_LARGURA - 40, alturaParede, CORES.madeira);
    for (let i = 0; i < Math.floor(alturaParede / 8); i++) {
      bloco(g, x + 20, baseParede - alturaParede + i * 8, CASA_LARGURA - 40, 1, CORES.madeiraEscura);
    }
    bloco(g, x + 20, baseParede - alturaParede, 4, alturaParede, CORES.madeiraClara);
    bloco(g, x + CASA_LARGURA - 24, baseParede - alturaParede, 4, alturaParede, CORES.madeiraEscura);
  }

  if (telhado > 0) {
    desenharTelhado(g, x, y, telhado);
    bloco(g, x + 8, y + 38, CASA_LARGURA - 16, 4, CORES.palhaEscura);
  }

  if (tabuas >= 12) {
    bloco(g, x + 46, y + 50, 18, 14, CORES.roxoEscuro);
    bloco(g, x + 49, y + 52, 12, 10, CORES.rosa);
    bloco(g, x + 52, y + 55, 4, 4, CORES.rosaClaro);
  }

  if (tabuas >= 14) {
    bloco(g, x + 78, y + 50, 20, 18, CORES.madeiraEscura);
    bloco(g, x + 81, y + 53, 14, 10, '#67E8F9');
    bloco(g, x + 88, y + 53, 2, 10, CORES.madeiraEscura);
    bloco(g, x + 81, y + 56, 14, 2, CORES.madeiraEscura);
    bloco(g, x + 14, y + 72, 8, 4, CORES.madeiraClara);
    bloco(g, x + CASA_LARGURA - 22, y + 72, 8, 4, CORES.madeiraClara);
  }

  if (tabuas >= TOTAL_TABUAS) {
    bloco(g, x + 54, y + 50, 20, 22, CORES.madeiraEscura);
    bloco(g, x + 57, y + 52, 14, 20, CORES.madeira);
    bloco(g, x + 59, y + 55, 10, 2, CORES.madeiraClara);
    bloco(g, x + 62, y + 62, 3, 3, CORES.amarelo);
    bloco(g, x + 52, y + 72, 24, 2, CORES.madeiraClara);
    bloco(g, x + 54, y + 66, 4, 4, CORES.madeiraClara);
  }

  if (progresso >= 0.5) {
    bloco(g, x + 20, y + 46, 14, 3, CORES.palhaEscura);
    bloco(g, x + CASA_LARGURA - 34, y + 46, 14, 3, CORES.palhaEscura);
  }

  if (casasConcluidas >= 1) {
    desenharRede(g, x + 6, y + 20);
  }
  if (casasConcluidas >= 2) {
    desenharBandeira(g, x + CASA_LARGURA / 2, y + 18, tempo);
  }
  if (casasConcluidas >= 3) {
    desenharCanoa(g, x - 60, y + 76);
  }
  if (casasConcluidas >= 4) {
    desenharLampiao(g, x + CASA_LARGURA - 12, y + 56);
  }
  if (casasConcluidas >= 5) {
    bloco(g, x + 8, y + 74, 14, 4, CORES.verde);
    bloco(g, x + 10, y + 70, 2, 6, CORES.verdeEscuro);
    bloco(g, x + 16, y + 68, 3, 3, CORES.rosa);
  }
}

export function jogadorPodeEntrar(jogador: Jogador, tabuas: number): boolean {
  return (
    tabuas >= TOTAL_TABUAS &&
    jogador.fileira === -1 &&
    Math.abs(jogador.x - CASA_PORTA_X) <= 13 &&
    Math.abs(jogador.y - LAND_Y) < 2
  );
}

export function desenharIndicadorEntrada(
  g: CanvasRenderingContext2D,
  tabuas: number,
  tempo: number
): void {
  if (tabuas < TOTAL_TABUAS) return;

  const pisca = Math.sin(tempo * 5) > -0.2;
  if (!pisca) return;

  const x = CASA_PORTA_X;
  const y = CASA_Y + 18;

  g.fillStyle = CORES.amarelo;
  g.fillRect(x - 2, y, 4, 10);
  g.fillRect(x - 4, y + 10, 8, 3);
  g.fillRect(x - 6, y + 13, 12, 3);
  g.fillRect(x - 8, y + 16, 16, 3);

  g.font = '6px "Press Start 2P", monospace';
  g.textAlign = 'center';
  g.fillStyle = CORES.rosaClaro;
  g.fillText('ENTRE', x, y - 8);
}
