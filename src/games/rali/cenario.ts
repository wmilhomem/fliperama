/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ALTURA, LARGURA } from './constantes';
import { aleatorio, criarRng, TAU } from './semente';
import { CenarioFundo, ClimaTipo, PropCenario, Segmento } from './tipos';

const HORIZONTE = 300;

function criarPaleta(clima: ClimaTipo, noite: number): [string, string, string] {
  if (clima === 'neblina') {
    return noite > 0.42
      ? ['#334155', '#475569', '#64748B']
      : ['#64748B', '#94A3B8', '#CBD5E1'];
  }
  if (noite > 0.48) return ['#020617', '#0F172A', '#1E293B'];
  if (noite > 0.2) return ['#1E1B4B', '#4C1D95', '#C2410C'];
  return ['#1D4ED8', '#38BDF8', '#BAE6FD'];
}

function desenharCordilheira(
  g: CanvasRenderingContext2D,
  alturas: number[],
  baseY: number,
  cor: string,
  deslocamento: number,
  amplitude: number
): void {
  const passo = LARGURA / alturas.length;
  const largura = LARGURA;
  const desloc = ((deslocamento % largura) + largura) % largura;

  g.fillStyle = cor;

  for (let copia = 0; copia < 2; copia++) {
    const origem = -desloc + copia * largura;
    g.beginPath();
    g.moveTo(origem, baseY);

    for (let i = 0; i < alturas.length; i++) {
      g.lineTo(origem + i * passo, baseY - alturas[i] * amplitude);
    }

    g.lineTo(origem + largura, baseY);
    g.closePath();
    g.fill();
  }
}

function desenharProp(
  g: CanvasRenderingContext2D,
  prop: PropCenario,
  x: number,
  y: number,
  larguraPista: number,
  noite: number
): void {
  const altura = Math.max(1, larguraPista * (0.42 + prop.variacao * 0.22));
  const largura = Math.max(1, larguraPista * 0.075);
  const escuro = noite > 0.45;

  if (prop.tipo === 'arvore') {
    g.fillStyle = escuro ? '#3F2417' : '#78350F';
    g.fillRect(x - largura * 0.16, y - altura * 0.38, largura * 0.32, altura * 0.38);
    g.fillStyle = escuro ? '#064E3B' : '#15803D';
    g.fillRect(x - largura * 0.52, y - altura * 0.72, largura * 1.04, altura * 0.38);
    g.fillRect(x - largura * 0.38, y - altura, largura * 0.76, altura * 0.34);
    g.fillStyle = escuro ? '#065F46' : '#22C55E';
    g.fillRect(x - largura * 0.22, y - altura * 0.92, largura * 0.28, altura * 0.2);
    return;
  }

  if (prop.tipo === 'poste') {
    g.fillStyle = escuro ? '#334155' : '#64748B';
    g.fillRect(x - largura * 0.08, y - altura, largura * 0.16, altura);
    g.fillStyle = escuro ? '#FBBF24' : '#FDE68A';
    g.fillRect(x - largura * 0.3, y - altura, largura * 0.6, largura * 0.18);

    if (noite > 0.3) {
      g.globalAlpha = Math.min(0.5, noite * 0.7);
      g.fillStyle = '#FEF3C7';
      g.fillRect(x - largura * 0.85, y - altura - largura * 0.25, largura * 1.7, largura * 0.45);
      g.globalAlpha = 1;
    }
    return;
  }

  if (prop.tipo === 'placa') {
    g.fillStyle = escuro ? '#334155' : '#475569';
    g.fillRect(x - largura * 0.06, y - altura * 0.72, largura * 0.12, altura * 0.72);
    g.fillStyle = '#EA580C';
    g.fillRect(x - largura * 0.78, y - altura, largura * 1.56, altura * 0.42);
    g.fillStyle = '#FFF7ED';
    g.fillRect(x - largura * 0.58, y - altura * 0.88, largura * 1.16, altura * 0.07);
    g.fillRect(x - largura * 0.58, y - altura * 0.72, largura * 0.66, altura * 0.06);
    return;
  }

  if (prop.tipo === 'pedra') {
    g.fillStyle = escuro ? '#334155' : '#64748B';
    g.fillRect(x - largura * 0.46, y - altura * 0.26, largura * 0.92, altura * 0.26);
    g.fillStyle = escuro ? '#475569' : '#94A3B8';
    g.fillRect(x - largura * 0.3, y - altura * 0.46, largura * 0.58, altura * 0.24);
    g.fillRect(x - largura * 0.1, y - altura * 0.58, largura * 0.28, altura * 0.18);
    return;
  }

  if (prop.tipo === 'casa') {
    g.fillStyle = escuro ? '#3F2417' : '#92400E';
    g.fillRect(x - largura * 0.8, y - altura * 0.45, largura * 1.6, altura * 0.45);
    g.fillStyle = escuro ? '#7F1D1D' : '#B91C1C';
    g.beginPath();
    g.moveTo(x - largura * 1.05, y - altura * 0.44);
    g.lineTo(x, y - altura * 0.82);
    g.lineTo(x + largura * 1.05, y - altura * 0.44);
    g.closePath();
    g.fill();
    g.fillStyle = '#FDE68A';
    g.fillRect(x - largura * 0.16, y - altura * 0.32, largura * 0.32, largura * 0.32);
    return;
  }

  g.fillStyle = escuro ? '#3F2417' : '#78350F';
  for (let i = -1; i <= 1; i++) {
    g.fillRect(x + i * largura * 0.42 - largura * 0.05, y - altura * 0.45, largura * 0.1, altura * 0.45);
  }
  g.fillRect(x - largura * 0.7, y - altura * 0.34, largura * 1.4, largura * 0.08);
  g.fillRect(x - largura * 0.7, y - altura * 0.16, largura * 1.4, largura * 0.08);
}

export function criarCenario(semente: number): CenarioFundo {
  const rng = criarRng(semente ^ 0x9e3779b9);

  const estrelas = Array.from({ length: 64 }, () => ({
    x: aleatorio(rng, 8, LARGURA - 8),
    y: aleatorio(rng, 12, 225),
    tamanho: rng() < 0.22 ? 2 : 1,
    brilho: aleatorio(rng, 0.35, 1),
  }));

  const nuvens = Array.from({ length: 5 }, () => ({
    x: aleatorio(rng, 0, LARGURA + 180),
    y: aleatorio(rng, 62, 188),
    escala: aleatorio(rng, 0.7, 1.5),
    velocidade: aleatorio(rng, 2, 8),
  }));

  const montanhasLonge = Array.from({ length: 36 }, (_, i) => {
    const u = i / 36;
    return (
      0.44 +
      Math.sin(u * TAU * 2 + 0.8) * 0.23 +
      Math.sin(u * TAU * 5 + 2.1) * 0.14
    );
  });

  const montanhasPerto = Array.from({ length: 28 }, (_, i) => {
    const u = i / 28;
    return (
      0.35 +
      Math.sin(u * TAU * 3 + 1.6) * 0.22 +
      Math.sin(u * TAU * 6 + 0.4) * 0.1
    );
  });

  const arvores = Array.from({ length: 42 }, () => aleatorio(rng, 0.25, 1));

  return { estrelas, nuvens, montanhasLonge, montanhasPerto, arvores };
}

export function desenharFundo(
  g: CanvasRenderingContext2D,
  cenario: CenarioFundo,
  posicao: number,
  jogadorX: number,
  tempo: number,
  noite: number,
  clima: ClimaTipo
): void {
  const [topo, meio, baixo] = criarPaleta(clima, noite);

  g.fillStyle = topo;
  g.fillRect(0, 0, LARGURA, 124);
  g.fillStyle = meio;
  g.fillRect(0, 124, LARGURA, 98);
  g.fillStyle = baixo;
  g.fillRect(0, 222, LARGURA, HORIZONTE - 214);

  if (noite > 0.08) {
    g.fillStyle = '#F8FAFC';
    for (const estrela of cenario.estrelas) {
      g.globalAlpha = Math.min(1, noite * estrela.brilho * 1.4);
      g.fillRect(estrela.x, estrela.y, estrela.tamanho, estrela.tamanho);
    }
    g.globalAlpha = 1;
  }

  const corpoX = 358;
  const corpoY = 92;
  if (noite > 0.42) {
    g.fillStyle = 'rgba(226,232,240,0.1)';
    g.beginPath();
    g.arc(corpoX, corpoY, 40, 0, TAU);
    g.fill();
    g.fillStyle = '#E2E8F0';
    g.beginPath();
    g.arc(corpoX, corpoY, 25, 0, TAU);
    g.fill();
    g.fillStyle = 'rgba(148,163,184,0.55)';
    g.beginPath();
    g.arc(corpoX - 8, corpoY - 3, 5, 0, TAU);
    g.arc(corpoX + 9, corpoY + 7, 4, 0, TAU);
    g.fill();
  } else {
    g.fillStyle = 'rgba(253,224,71,0.14)';
    g.beginPath();
    g.arc(92, corpoY + 8, 42, 0, TAU);
    g.fill();
    g.fillStyle = clima === 'neblina' ? '#FEF3C7' : '#FDE047';
    g.beginPath();
    g.arc(92, corpoY + 8, 24, 0, TAU);
    g.fill();
  }

  const alphaNuvem = clima === 'neblina' ? 0.22 : Math.max(0.12, 0.58 - noite * 0.28);
  g.fillStyle = clima === 'chuva' ? '#CBD5E1' : '#E2E8F0';
  g.globalAlpha = alphaNuvem;

  for (const nuvem of cenario.nuvens) {
    const x =
      ((nuvem.x + tempo * nuvem.velocidade + posicao * 0.000018) % (LARGURA + 180)) - 90;
    const y = nuvem.y;
    const s = nuvem.escala;
    g.beginPath();
    g.ellipse(x, y, 34 * s, 9 * s, 0, 0, TAU);
    g.ellipse(x + 26 * s, y + 2 * s, 24 * s, 7 * s, 0, 0, TAU);
    g.ellipse(x - 24 * s, y + 3 * s, 20 * s, 6 * s, 0, 0, TAU);
    g.fill();
  }
  g.globalAlpha = 1;

  desenharCordilheira(
    g,
    cenario.montanhasLonge,
    HORIZONTE,
    noite > 0.45 ? '#1E293B' : clima === 'neblina' ? '#64748B' : '#475569',
    posicao * 0.000045 + jogadorX * 18,
    112
  );
  desenharCordilheira(
    g,
    cenario.montanhasPerto,
    HORIZONTE + 10,
    noite > 0.45 ? '#052E16' : clima === 'gelo' ? '#475569' : '#14532D',
    posicao * 0.000075 + jogadorX * 30,
    70
  );

  g.fillStyle = noite > 0.45 ? '#022C22' : '#166534';
  for (let copia = 0; copia < 2; copia++) {
    const desloc = ((posicao * 0.00012 + jogadorX * 40) % LARGURA + LARGURA) % LARGURA;
    const origem = -desloc + copia * LARGURA;
    for (let i = 0; i < cenario.arvores.length; i++) {
      const x = origem + (i / cenario.arvores.length) * LARGURA;
      const h = 8 + cenario.arvores[i] * 18;
      g.beginPath();
      g.moveTo(x, HORIZONTE + 8 - h);
      g.lineTo(x + h * 0.3, HORIZONTE + 8);
      g.lineTo(x - h * 0.3, HORIZONTE + 8);
      g.closePath();
      g.fill();
    }
  }
}

export function desenharPropsSegmento(
  g: CanvasRenderingContext2D,
  segmento: Segmento,
  noite: number
): void {
  const p = segmento.p1;
  if (!p.visivel || p.largura < 1.4) return;

  for (const prop of segmento.props) {
    const x = p.x + prop.lado * p.largura * (1.16 + prop.deslocamento);
    if (x < -180 || x > LARGURA + 180) continue;
    desenharProp(g, prop, x, p.y, p.largura, noite);
  }
}
