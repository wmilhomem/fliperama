/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ALTURA, CORES, LARGURA, Y_CHAO } from './constantes';

function desenharBandaAurora(
  g: CanvasRenderingContext2D,
  tempo: number,
  baseY: number,
  amplitude: number,
  espessura: number,
  cor: string,
  velocidade: number,
  deslocamento: number
): void {
  g.save();
  for (let x = -8; x < LARGURA + 8; x += 8) {
    const onda =
      Math.sin((x + deslocamento) * 0.022 + tempo * velocidade) * amplitude +
      Math.sin(x * 0.011 - tempo * 0.37) * 7;
    const y = baseY + onda;
    g.globalAlpha = 0.1;
    g.fillStyle = cor;
    g.fillRect(x, y, 8, espessura);
    g.globalAlpha = 0.055;
    g.fillRect(x, y + espessura, 8, espessura * 0.75);
  }
  g.restore();
}

function desenharMontanhas(
  g: CanvasRenderingContext2D,
  baseY: number,
  cor: string,
  corNeve: string,
  amplitude: number,
  passo: number,
  fase: number
): void {
  g.save();
  g.fillStyle = cor;
  g.beginPath();
  g.moveTo(0, Y_CHAO);

  let picoAnteriorX = 0;
  let picoAnteriorY = Y_CHAO;
  for (let x = 0; x <= LARGURA + passo; x += passo) {
    const y = baseY - Math.abs(Math.sin(x * 0.012 + fase)) * amplitude;
    g.lineTo(x, y);
    if (x > 0 && y < picoAnteriorY) {
      picoAnteriorX = x;
      picoAnteriorY = y;
    }
  }

  g.lineTo(LARGURA, Y_CHAO);
  g.closePath();
  g.fill();

  if (picoAnteriorY < baseY - 6) {
    g.fillStyle = corNeve;
    g.beginPath();
    g.moveTo(picoAnteriorX - 18, picoAnteriorY + 22);
    g.lineTo(picoAnteriorX, picoAnteriorY);
    g.lineTo(picoAnteriorX + 20, picoAnteriorY + 24);
    g.lineTo(picoAnteriorX + 8, picoAnteriorY + 18);
    g.lineTo(picoAnteriorX - 2, picoAnteriorY + 26);
    g.closePath();
    g.fill();
  }

  g.restore();
}

export function desenharCenario(g: CanvasRenderingContext2D, tempo: number): void {
  g.save();

  const faixas = ['#05020f', '#070314', '#0a051d', '#0e0827', '#130c32', '#18113d'];
  for (let i = 0; i < faixas.length; i++) {
    g.fillStyle = faixas[i];
    g.fillRect(0, i * 82, LARGURA, 82);
  }

  for (let i = 0; i < 74; i++) {
    const x = (i * 97 + 31) % LARGURA;
    const y = (i * 53 + 19) % 360;
    const brilho = 0.28 + (Math.sin(tempo * 1.9 + i * 1.7) * 0.5 + 0.5) * 0.72;
    g.globalAlpha = brilho;
    g.fillStyle = i % 9 === 0 ? CORES.auroraAzul : CORES.branco;
    const tamanho = i % 13 === 0 ? 2 : 1;
    g.fillRect(x, y, tamanho, tamanho);
  }

  g.globalAlpha = 0.09;
  g.fillStyle = CORES.lua;
  g.beginPath();
  g.arc(393, 116, 50, 0, Math.PI * 2);
  g.fill();
  g.globalAlpha = 1;
  g.fillStyle = '#e2e8f0';
  g.beginPath();
  g.arc(393, 116, 31, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = '#cbd5e1';
  g.fillRect(382, 103, 8, 8);
  g.fillRect(401, 121, 10, 7);
  g.fillRect(388, 129, 6, 5);

  desenharBandaAurora(g, tempo, 118, 21, 34, CORES.auroraVerde, 0.42, 30);
  desenharBandaAurora(g, tempo, 166, 27, 42, CORES.auroraVioleta, 0.31, 120);
  desenharBandaAurora(g, tempo, 210, 17, 31, CORES.auroraAzul, 0.24, 220);

  g.globalAlpha = 0.16;
  for (let x = 0; x < LARGURA; x += 6) {
    const altura = 26 + Math.sin(x * 0.028 + tempo * 0.6) * 15;
    g.fillStyle = CORES.auroraVerde;
    g.fillRect(x, 138 + Math.sin(x * 0.018 - tempo * 0.3) * 10, 3, altura);
  }
  g.globalAlpha = 1;

  desenharMontanhas(g, Y_CHAO - 8, '#171238', '#312e81', 78, 52, 0.7);
  desenharMontanhas(g, Y_CHAO - 2, CORES.montanha, CORES.montanhaClara, 48, 37, 2.1);

  g.fillStyle = '#0b1020';
  g.fillRect(0, Y_CHAO, LARGURA, ALTURA - Y_CHAO);
  g.fillStyle = '#13233d';
  g.fillRect(0, Y_CHAO, LARGURA, 8);
  g.fillStyle = CORES.geloEscuro;
  g.fillRect(0, Y_CHAO, LARGURA, 2);

  for (let i = 0; i < 19; i++) {
    const x = (i * 61 + 13) % LARGURA;
    const y = Y_CHAO + 15 + (i * 17) % 42;
    g.fillStyle = i % 2 === 0 ? '#18304f' : '#0e1b30';
    g.fillRect(x, y, 14 + (i % 4) * 5, 2);
    g.fillRect(x + 5, y + 2, 2, 5);
  }

  for (let i = 0; i < 9; i++) {
    const x = (i * 83 + 9) % LARGURA;
    const y = Y_CHAO + 8 + (i * 13) % 25;
    g.fillStyle = CORES.gelo;
    g.globalAlpha = 0.18;
    g.fillRect(x, y, 22, 3);
    g.globalAlpha = 1;
  }

  const baseX = LARGURA / 2;
  g.fillStyle = '#111827';
  g.fillRect(baseX - 72, Y_CHAO - 14, 144, 18);
  g.fillStyle = '#334155';
  g.fillRect(baseX - 54, Y_CHAO - 26, 108, 16);
  g.fillStyle = '#1e293b';
  g.fillRect(baseX - 66, Y_CHAO - 8, 132, 14);
  g.fillStyle = CORES.ciano;
  g.globalAlpha = 0.9;
  g.fillRect(baseX - 48, Y_CHAO - 20, 8, 4);
  g.fillRect(baseX + 40, Y_CHAO - 20, 8, 4);
  g.fillRect(baseX - 4, Y_CHAO - 26, 8, 4);
  g.globalAlpha = 1;

  g.fillStyle = CORES.gelo;
  g.fillRect(baseX - 76, Y_CHAO - 12, 152, 2);
  g.fillRect(baseX - 58, Y_CHAO - 24, 116, 2);

  for (let i = 0; i < 58; i++) {
    const velocidade = 12 + (i % 7) * 3;
    const x = (i * 79 + Math.sin(tempo * 0.5 + i) * 14 + tempo * (5 + (i % 4))) % LARGURA;
    const y = (i * 47 + tempo * velocidade) % ALTURA;
    g.globalAlpha = 0.25 + (i % 5) * 0.08;
    g.fillStyle = CORES.branco;
    g.fillRect(Math.floor(x), Math.floor(y), i % 6 === 0 ? 2 : 1, i % 6 === 0 ? 2 : 1);
  }

  g.restore();
}
