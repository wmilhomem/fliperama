/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  AGUA_BASE,
  AGUA_TOPO,
  ALTURA,
  CORES,
  FILEIRAS_Y,
  HUD_ALTURA,
  LARGURA,
  MARGEM_BAIXO,
  TERRA_BASE,
  TERRA_TOPO,
} from './constantes';
import { MedidorCheia } from './tipos';

function hexParaRgb(hex: string): [number, number, number] {
  const valor = hex.replace('#', '');
  return [
    parseInt(valor.slice(0, 2), 16),
    parseInt(valor.slice(2, 4), 16),
    parseInt(valor.slice(4, 6), 16),
  ];
}

function mesclar(a: string, b: string, t: number): string {
  const [r1, g1, b1] = hexParaRgb(a);
  const [r2, g2, b2] = hexParaRgb(b);
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const bl = Math.round(b1 + (b2 - b1) * t);
  return `rgb(${r}, ${g}, ${bl})`;
}

function desenharSol(g: CanvasRenderingContext2D, x: number, y: number): void {
  g.save();
  g.globalAlpha = 0.18;
  g.fillStyle = CORES.sol;
  g.fillRect(x - 28, y - 20, 56, 40);
  g.fillRect(x - 20, y - 28, 40, 56);
  g.globalAlpha = 1;

  g.fillStyle = CORES.solQuente;
  g.fillRect(x - 16, y - 16, 32, 32);
  g.fillRect(x - 20, y - 8, 40, 16);
  g.fillRect(x - 8, y - 20, 16, 40);
  g.fillStyle = CORES.sol;
  g.fillRect(x - 12, y - 12, 24, 24);
  g.fillRect(x - 16, y - 6, 32, 12);
  g.fillStyle = '#FFFBEB';
  g.fillRect(x - 6, y - 8, 12, 8);
  g.restore();
}

function desenharNuvem(
  g: CanvasRenderingContext2D,
  x: number,
  y: number,
  escala: number,
  cor: string
): void {
  g.save();
  g.globalAlpha = 0.5;
  g.fillStyle = cor;
  g.fillRect(x, y, 18 * escala, 6 * escala);
  g.fillRect(x + 6 * escala, y - 5 * escala, 12 * escala, 8 * escala);
  g.fillRect(x + 18 * escala, y + 1 * escala, 16 * escala, 5 * escala);
  g.fillRect(x + 30 * escala, y - 3 * escala, 10 * escala, 6 * escala);
  g.globalAlpha = 0.32;
  g.fillStyle = '#FDBA74';
  g.fillRect(x + 4 * escala, y + 5 * escala, 32 * escala, 2 * escala);
  g.restore();
}

function desenharCeu(
  g: CanvasRenderingContext2D,
  tempo: number,
  progresso: number
): void {
  const topo = mesclar(CORES.ceuQuente, '#7C3AED', progresso);
  const meio = mesclar(CORES.ceu, '#4C1D95', progresso);
  const base = mesclar('#C084FC', CORES.ceuNoite, progresso);
  const bandas = [topo, topo, meio, meio, base, base];

  for (let i = 0; i < bandas.length; i++) {
    g.fillStyle = bandas[i];
    g.fillRect(0, HUD_ALTURA + i * 20, LARGURA, 21);
  }

  const solY = 92 + progresso * 28;
  desenharSol(g, 84, solY);
  desenharNuvem(g, ((tempo * 3) % 540) - 60, 72, 1, CORES.nuvem);
  desenharNuvem(g, 188 + Math.sin(tempo * 0.16) * 20, 62, 0.8, '#FBCFE8');
  desenharNuvem(g, 318 - Math.sin(tempo * 0.12) * 16, 112, 0.7, '#FDE68A');
}

function desenharTerra(g: CanvasRenderingContext2D, tempo: number): void {
  g.fillStyle = CORES.terra;
  g.fillRect(0, TERRA_TOPO, LARGURA, TERRA_BASE - TERRA_TOPO);

  g.fillStyle = CORES.terraClara;
  for (let x = 0; x < LARGURA; x += 16) {
    g.fillRect(x, TERRA_TOPO + 8 + (x % 3) * 4, 10, 3);
  }

  g.fillStyle = CORES.capim;
  g.fillRect(0, TERRA_TOPO, LARGURA, 8);
  g.fillRect(0, TERRA_TOPO + 4, LARGURA, 4);
  g.fillStyle = CORES.capimClaro;
  for (let x = 2; x < LARGURA; x += 9) {
    const h = 3 + ((x * 7) % 5);
    g.fillRect(x, TERRA_TOPO - h, 2, h);
    g.fillRect(x + 4, TERRA_TOPO - 2, 2, 2);
  }

  g.fillStyle = CORES.rosa;
  g.fillRect(26, TERRA_TOPO + 10, 4, 4);
  g.fillRect(110, TERRA_TOPO + 14, 3, 3);
  g.fillRect(280, TERRA_TOPO + 9, 4, 4);
  g.fillStyle = CORES.amarelo;
  g.fillRect(28, TERRA_TOPO + 9, 2, 2);
  g.fillRect(281, TERRA_TOPO + 8, 2, 2);

  g.globalAlpha = 0.15;
  g.fillStyle = '#000000';
  for (let i = 0; i < 8; i++) {
    g.fillRect(0, TERRA_TOPO + 14 + i * 3, LARGURA, 1);
  }
  g.globalAlpha = 1;

  g.fillStyle = CORES.madeiraEscura;
  g.fillRect(8, TERRA_BASE - 18, 26, 3);
  g.fillRect(20, TERRA_BASE - 16, 3, 16);
}

function desenharRio(
  g: CanvasRenderingContext2D,
  tempo: number,
  progresso: number
): void {
  const topo = mesclar(CORES.agua, '#062F2A', progresso);
  const base = mesclar(CORES.aguaEscura, '#031C1A', progresso);

  for (let i = 0; i < 10; i++) {
    g.fillStyle = i % 2 === 0 ? topo : base;
    g.fillRect(0, TERRA_BASE + i * 26, LARGURA, 27);
  }

  for (const y of FILEIRAS_Y) {
    g.globalAlpha = 0.2;
    g.fillStyle = CORES.aguaClara;
    g.fillRect(0, y + 18, LARGURA, 3);
    g.globalAlpha = 1;
  }

  g.strokeStyle = 'rgba(125, 211, 252, 0.22)';
  g.lineWidth = 1;
  for (let linha = 0; linha < 13; linha++) {
    const yBase = TERRA_BASE + 10 + linha * 19;
    const deslocamento = Math.sin(tempo * 0.55 + linha * 0.75) * 10;
    g.beginPath();
    g.moveTo(-12, yBase);
    for (let x = -12; x < LARGURA + 16; x += 16) {
      g.lineTo(x + deslocamento, yBase + Math.sin(tempo * 1.2 + x * 0.05 + linha) * 2);
    }
    g.stroke();
  }

  g.fillStyle = 'rgba(167, 243, 208, 0.3)';
  for (let i = 0; i < 22; i++) {
    const x = (i * 79 + Math.sin(tempo * 0.5 + i) * 7) % LARGURA;
    const y = TERRA_BASE + 20 + ((i * 37) % (AGUA_BASE - TERRA_BASE - 30));
    g.fillRect(Math.floor(x), Math.floor(y), 2, 2);
  }

  g.globalAlpha = 0.24;
  g.fillStyle = CORES.aguaClara;
  g.fillRect(0, AGUA_TOPO, LARGURA, 4);
  g.globalAlpha = 1;
}

function desenharMata(g: CanvasRenderingContext2D, tempo: number): void {
  g.fillStyle = '#052E16';
  g.fillRect(0, MARGEM_BAIXO - 6, LARGURA, ALTURA - MARGEM_BAIXO + 6);

  g.fillStyle = '#166534';
  g.fillRect(0, MARGEM_BAIXO, LARGURA, 10);
  g.fillStyle = '#14532D';
  for (let x = 0; x < LARGURA; x += 24) {
    const h = 18 + ((x * 11) % 22);
    g.fillRect(x, MARGEM_BAIXO - 4, 10, h);
    g.fillStyle = '#166534';
    g.fillRect(x - 4, MARGEM_BAIXO + h - 6, 18, 7);
    g.fillStyle = '#14532D';
  }

  const copas = [
    [18, 446, 34],
    [68, 462, 26],
    [128, 440, 42],
    [198, 458, 30],
    [258, 438, 38],
    [330, 460, 28],
    [392, 442, 46],
    [452, 462, 30],
  ];

  for (let i = 0; i < copas.length; i++) {
    const [x, y, w] = copas[i];
    const h = 28 + (i % 3) * 8;
    g.fillStyle = '#3F2A14';
    g.fillRect(x + w / 2 - 3, y, 6, h);
    g.fillStyle = i % 2 === 0 ? '#14532D' : '#166534';
    g.fillRect(x, y - 10, w, 16);
    g.fillRect(x + 8, y - 22, w - 16, 14);
    g.fillRect(x + 14, y - 30, w - 28, 10);
    g.fillStyle = '#22C55E';
    g.globalAlpha = 0.45;
    g.fillRect(x + 4, y - 8, w - 8, 3);
    g.globalAlpha = 1;
  }

  g.fillStyle = '#4ADE80';
  for (let i = 0; i < 12; i++) {
    const x = 12 + i * 41 + Math.sin(tempo * 0.8 + i) * 3;
    g.fillRect(x, MARGEM_BAIXO - 10, 2, 9);
    g.fillRect(x + 2, MARGEM_BAIXO - 12, 2, 5);
  }

  g.fillStyle = 'rgba(125, 211, 252, 0.5)';
  g.fillRect(0, MARGEM_BAIXO - 3, LARGURA, 2);
}

export function desenharCenario(
  g: CanvasRenderingContext2D,
  tempo: number,
  medidor: MedidorCheia
): void {
  const progresso = Math.max(0, Math.min(1, 1 - medidor.restante / medidor.inicial));

  g.fillStyle = '#031C1A';
  g.fillRect(0, 0, LARGURA, ALTURA);

  desenharCeu(g, tempo, progresso);
  desenharTerra(g, tempo);
  desenharRio(g, tempo, progresso);
  desenharMata(g, tempo);

  g.globalAlpha = 0.08;
  g.fillStyle = CORES.rosa;
  g.fillRect(0, HUD_ALTURA, LARGURA, TERRA_BASE - HUD_ALTURA);
  g.globalAlpha = 1;
}
