/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Cenário do "Submarino Abissal".
 *
 * Céu de fim de tarde, ondas na linha d'água, navio de apoio "Pérola",
 * degradê do mar com raios de sol e fundo com areia, corais e rochas.
 * Tudo em pixel art (múltiplos de 16) e desenhado de forma estática.
 */

import {
  AGUA_Y,
  ALTURA,
  FAIXA_ALTURA,
  FUNDO_Y,
  LARGURA,
  PALETA,
  SUPERFICIE_TOPO,
  TOTAL_FAIXAS,
  X_NAVIO_APOIO,
  X_RETORNO,
  Y_NAVIO_APOIO,
} from './constantes';

/** Posições fixas das algas do fundo. */
const ALGAS: Array<{ x: number; h: number; cor: string }> = [
  { x: 16, h: 16, cor: PALETA.alga },
  { x: 48, h: 24, cor: '#10B981' },
  { x: 96, h: 16, cor: PALETA.alga },
  { x: 168, h: 32, cor: '#059669' },
  { x: 232, h: 16, cor: PALETA.alga },
  { x: 296, h: 24, cor: '#10B981' },
  { x: 360, h: 16, cor: PALETA.alga },
  { x: 416, h: 32, cor: '#059669' },
  { x: 456, h: 16, cor: PALETA.alga },
];

/** Posições fixas dos corais. */
const CORAIS: Array<{ x: number; h: number; cor: string }> = [
  { x: 32, h: 16, cor: PALETA.coral },
  { x: 128, h: 24, cor: PALETA.coral2 },
  { x: 208, h: 16, cor: PALETA.coral },
  { x: 320, h: 24, cor: PALETA.coral2 },
  { x: 400, h: 16, cor: PALETA.coral },
];

/** Desenha o céu, o mar e o fundo do mar (parte estática do cenário). */
export function desenharCenario(
  g: CanvasRenderingContext2D,
  tempo: number
): void {
  g.save();

  // Céu de fim de tarde
  const ceu = g.createLinearGradient(0, SUPERFICIE_TOPO, 0, AGUA_Y);
  ceu.addColorStop(0, PALETA.ceuAlto);
  ceu.addColorStop(0.6, '#BAE6FD');
  ceu.addColorStop(1, PALETA.ceuBaixo);
  g.fillStyle = ceu;
  g.fillRect(0, SUPERFICIE_TOPO, LARGURA, AGUA_Y - SUPERFICIE_TOPO);

  // Nuvens pixeladas
  const nuvens = [
    { x: 96, y: 60, largura: 48, altura: 16 },
    { x: 320, y: 56, largura: 64, altura: 16 },
    { x: 232, y: 76, largura: 32, altura: 16 },
  ];
  for (const nuvem of nuvens) {
    g.fillStyle = 'rgba(255,255,255,0.85)';
    g.fillRect(nuvem.x, nuvem.y, nuvem.largura, nuvem.altura);
    g.fillRect(nuvem.x + 8, nuvem.y - 8, nuvem.largura - 16, 8);
    g.fillStyle = 'rgba(186,230,253,0.9)';
    g.fillRect(nuvem.x, nuvem.y + nuvem.altura - 4, nuvem.largura, 4);
  }

  // Degradê do mar (mais claro em cima, quase preto embaixo)
  const mar = g.createLinearGradient(0, AGUA_Y, 0, FUNDO_Y);
  mar.addColorStop(0, PALETA.agua1);
  mar.addColorStop(0.22, PALETA.agua2);
  mar.addColorStop(0.48, PALETA.agua3);
  mar.addColorStop(0.72, PALETA.agua4);
  mar.addColorStop(1, PALETA.agua5);
  g.fillStyle = mar;
  g.fillRect(0, AGUA_Y, LARGURA, FUNDO_Y - AGUA_Y);

  // Faixas do mar (leve mudança de tom para leitura das rotas)
  for (let i = 0; i < TOTAL_FAIXAS; i++) {
    g.fillStyle = i % 2 === 0 ? 'rgba(255,255,255,0.035)' : 'rgba(3,10,25,0.12)';
    g.fillRect(0, AGUA_Y + i * FAIXA_ALTURA, LARGURA, FAIXA_ALTURA);
  }

  // Raios de sol atravessando as primeiras faixas
  g.save();
  g.globalAlpha = 0.12;
  g.fillStyle = '#FEF9C3';
  for (let i = 0; i < 5; i++) {
    const x = 40 + i * 96 + Math.sin(tempo * 0.4 + i) * 12;
    g.beginPath();
    g.moveTo(x, AGUA_Y);
    g.lineTo(x + 22, AGUA_Y);
    g.lineTo(x - 30 + Math.sin(tempo * 0.5 + i) * 20, AGUA_Y + 210);
    g.lineTo(x - 58 + Math.sin(tempo * 0.5 + i) * 20, AGUA_Y + 210);
    g.closePath();
    g.fill();
  }
  g.restore();

  // Fundo do mar
  g.fillStyle = PALETA.areiaEscura;
  g.fillRect(0, FUNDO_Y, LARGURA, ALTURA - FUNDO_Y);
  g.fillStyle = PALETA.areia;
  g.fillRect(0, FUNDO_Y, LARGURA, 8);
  g.fillStyle = 'rgba(0,0,0,0.18)';
  for (let x = 0; x < LARGURA; x += 32) {
    g.fillRect(x + 8, FUNDO_Y + 16, 16, 4);
    g.fillRect(x + 20, FUNDO_Y + 28, 8, 4);
  }

  // Rochas do fundo
  g.fillStyle = '#334155';
  g.fillRect(80, FUNDO_Y - 16, 32, 16);
  g.fillRect(88, FUNDO_Y - 24, 16, 8);
  g.fillRect(320, FUNDO_Y - 16, 48, 16);
  g.fillRect(336, FUNDO_Y - 24, 16, 8);
  g.fillRect(224, FUNDO_Y - 8, 24, 8);

  // Algas
  for (const alga of ALGAS) {
    g.fillStyle = alga.cor;
    g.fillRect(alga.x, FUNDO_Y - alga.h, 8, alga.h);
    g.fillRect(alga.x + 8, FUNDO_Y - alga.h + 8, 8, alga.h - 8);
    g.fillStyle = 'rgba(255,255,255,0.18)';
    g.fillRect(alga.x + 2, FUNDO_Y - alga.h + 4, 2, alga.h - 8);
  }

  // Corais
  for (const coral of CORAIS) {
    g.fillStyle = coral.cor;
    g.fillRect(coral.x, FUNDO_Y - coral.h, 8, coral.h);
    g.fillRect(coral.x - 8, FUNDO_Y - coral.h + 4, 8, 8);
    g.fillRect(coral.x + 8, FUNDO_Y - coral.h + 8, 8, 8);
  }

  // Linha d'água com onda animada
  const ondaOffset = Math.sin(tempo * 2) * 2;
  g.fillStyle = '#E0F2FE';
  for (let x = 0; x < LARGURA; x += 16) {
    const y = AGUA_Y + Math.round(Math.sin((x / 16) * 0.9 + tempo * 2.2) * 2 + ondaOffset);
    g.fillRect(x, y, 16, 3);
  }
  g.fillStyle = 'rgba(255,255,255,0.25)';
  g.fillRect(0, AGUA_Y + 4, LARGURA, 2);

  g.restore();
}

/** Desenha o navio de apoio "Pérola" (à esquerda, na superfície). */
export function desenharNavioApoio(g: CanvasRenderingContext2D, tempo: number): void {
  const x = X_NAVIO_APOIO;
  const y = Y_NAVIO_APOIO;
  g.save();

  // Casco
  g.fillStyle = '#1E3A8A';
  g.fillRect(x - 32, y, 64, 8);
  g.fillRect(x - 24, y + 8, 48, 8);
  g.fillStyle = '#1E40AF';
  g.fillRect(x - 32, y + 2, 64, 4);
  g.fillStyle = '#FDE68A';
  g.fillRect(x - 32, y + 14, 64, 2);

  // Cabine e chaminé
  g.fillStyle = '#E2E8F0';
  g.fillRect(x - 16, y - 16, 32, 16);
  g.fillStyle = '#0EA5E9';
  g.fillRect(x - 12, y - 12, 8, 8);
  g.fillRect(x + 4, y - 12, 8, 8);
  g.fillStyle = '#94A3B8';
  g.fillRect(x + 12, y - 28, 8, 12);
  g.fillStyle = '#64748B';
  g.fillRect(x + 10, y - 30, 12, 4);

  // Mastro e bandeira
  g.fillStyle = '#CBD5E1';
  g.fillRect(x - 24, y - 32, 2, 16);
  g.fillStyle = '#FB7185';
  g.fillRect(x - 24, y - 32, 12, 8);

  // Luzes piscando
  const pisca = Math.floor(tempo * 2) % 2 === 0;
  if (pisca) {
    g.fillStyle = '#FDE047';
    g.fillRect(x - 30, y - 6, 4, 4);
    g.fillRect(x + 26, y - 6, 4, 4);
  }

  g.restore();
}

/** Desenha o ponto de retorno do submarino na superfície. */
export function desenharPontoRetorno(g: CanvasRenderingContext2D, tempo: number): void {
  const x = X_RETORNO;
  const y = AGUA_Y - 6;
  g.save();
  g.globalAlpha = 0.5 + 0.3 * Math.sin(tempo * 3);
  g.strokeStyle = '#FDE68A';
  g.lineWidth = 2;
  g.beginPath();
  g.arc(x, y, 14, Math.PI, 0);
  g.stroke();
  g.globalAlpha = 0.9;
  g.fillStyle = '#FDE68A';
  g.fillRect(x - 1, y - 10, 2, 10);
  g.restore();
}
