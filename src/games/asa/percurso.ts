/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * GERADOR DE PERCURSO POR SEMENTE — ASA RASANTE
 * O cenário é montado em camadas (chão, vegetação/construções, nuvens e sombras).
 * Sempre existe um corredor navegável — nunca há um obstáculo bloqueando a passagem.
 */

import { LARGURA, ALTURA, TipoBioma } from './config';
import { criarAleatorio } from './util';

export interface Feature {
  x: number;
  y: number;
  tipo: string;
  escala: number;
}

export interface CanyonPassagem {
  /** Posição Y da passagem ao longo do percurso. */
  y: number;
  /** Centro X da passagem (mínimo 96 px de largura livre). */
  gapX: number;
  /** Largura da passagem em pixels (>= 96). */
  gap: number;
}

export interface Percurso {
  features: Feature[];
  canyons: CanyonPassagem[];
  semente: string;
  bioma: TipoBioma;
  comprimento: number;
}

/** Gera o percurso conforme o bioma e a semente. */
export function gerarPercurso(
  semente: string,
  bioma: TipoBioma,
  comprimentoPx: number
): Percurso {
  if (bioma === 'serra') {
    return gerarSerra(semente, comprimentoPx);
  } else if (bioma === 'sertaao') {
    return gerarSertao(semente, comprimentoPx);
  } else if (bioma === 'cidade') {
    return gerarCidade(semente, comprimentoPx);
  } else if (bioma === 'floresta') {
    return gerarFloresta(semente, comprimentoPx);
  }
  return gerarLitoral(semente, comprimentoPx);
}

function gerarLitoral(semente: string, comprimentoPx: number): Percurso {
  const rng = criarAleatorio(semente);
  const features: Feature[] = [];
  const tipos = ['coqueiro', 'pedra', 'ilha', 'barco', 'capim'];
  const densidade = 0.28;

  for (let y = 0; y < comprimentoPx; y += 14) {
    const r = rng();
    if (r > densidade) continue;
    const tipo = tipos[Math.floor(rng() * tipos.length)];
    const x = rng() * (LARGURA - 24) + 12;
    features.push({ x, y, tipo, escala: 0.75 + rng() * 0.7 });
  }

  return { features, canyons: [], semente, bioma: 'litoral', comprimento: comprimentoPx };
}

function gerarSerra(semente: string, comprimentoPx: number): Percurso {
  const rng = criarAleatorio(semente);
  const features: Feature[] = [];
  // Decoração (pedra e pinho) que não bloqueia o corredor
  for (let y = 0; y < comprimentoPx; y += 22) {
    if (rng() > 0.34) continue;
    const tipo = rng() < 0.5 ? 'pedra' : 'pinho';
    const x = rng() * (LARGURA - 24) + 12;
    features.push({ x, y, tipo, escala: 0.7 + rng() * 0.6 });
  }

  // Canyons: pares de paredões a cada ~230 px, com passagem mínima de 110 px
  const canyons: CanyonPassagem[] = [];
  let gapX = LARGURA / 2;
  for (let y = 300; y < comprimentoPx - 100; y += 230) {
    // Wander suave
    gapX += (rng() - 0.5) * 140;
    gapX = Math.max(80, Math.min(LARGURA - 80, gapX));
    const gap = 108 + rng() * 24; // 108..132 px, sempre acima do mínimo
    canyons.push({ y, gapX, gap });
  }

  return { features, canyons, semente, bioma: 'serra', comprimento: comprimentoPx };
}

function gerarCidade(semente: string, comprimentoPx: number): Percurso {
  const rng = criarAleatorio(semente);
  const features: Feature[] = [];

  // Avenidas garantem passagem de min 110 px com corredores retilíneos
  const avenidas: CanyonPassagem[] = [];
  let corredorX = LARGURA / 2;
  for (let y = 200; y < comprimentoPx - 120; y += 260) {
    corredorX += (rng() - 0.5) * 170;
    corredorX = Math.max(92, Math.min(LARGURA - 92, corredorX));
    avenidas.push({ y, gapX: corredorX, gap: 112 + rng() * 22 });
  }

  // Prédios nas laterais (sólidos)
  for (let y = 0; y < comprimentoPx; y += 42) {
    if (rng() > 0.72) continue;
    const esquerda = rng() < 0.5;
    const x = esquerda ? 18 + rng() * 40 : LARGURA - 18 - rng() * 40;
    features.push({ x, y, tipo: 'predio', escala: 0.9 + rng() * 0.8 });
  }
  // Letreiros/neon sobre a avenida (não bloqueiam)
  for (let y = 80; y < comprimentoPx; y += 96) {
    if (rng() > 0.45) continue;
    const xBase = avenidas.length > 0 ? avenidas[Math.floor((y / comprimentoPx) * avenidas.length)] : { gapX: LARGURA / 2 };
    features.push({
      x: avenidas.length > 0 ? Math.max(60, Math.min(LARGURA - 60, xBase.gapX + (rng() < 0.5 ? -1 : 1) * (74 + rng() * 40))) : LARGURA / 2,
      y,
      tipo: 'neon',
      escala: 0.8 + rng() * 0.4,
    });
  }

  return { features, canyons: avenidas, semente, bioma: 'cidade', comprimento: comprimentoPx };
}

function gerarFloresta(semente: string, comprimentoPx: number): Percurso {
  const rng = criarAleatorio(semente);
  const features: Feature[] = [];

  // Rio sinuoso: lista de pontos x ao longo do percurso
  let rioX = LARGURA / 2;
  for (let y = 0; y < comprimentoPx; y += 30) {
    rioX += (rng() - 0.5) * 26;
    rioX = Math.max(70, Math.min(LARGURA - 70, rioX));
    features.push({ x: rioX, y, tipo: 'rio', escala: 1 });
  }

  // Copas densas de árvores (sólidas, fora do rio e das clareiras)
  for (let y = 0; y < comprimentoPx; y += 16) {
    if (rng() > 0.5) continue;
    const x = rng() * LARGURA;
    // Não bloqueia o corredor (faixa média do rio)
    const rioProx = features.find(
      (f) => f.tipo === 'rio' && Math.abs(f.y - y) < 30 && Math.abs(f.x - x) < 36
    );
    if (rioProx) continue;
    features.push({ x, y, tipo: 'copa', escala: 0.9 + rng() * 0.6 });
  }

  // Clareiras ocasionais (abertura com grama)
  for (let y = 150; y < comprimentoPx; y += 220) {
    if (rng() > 0.5) continue;
    features.push({
      x: rng() * LARGURA,
      y,
      tipo: 'clareira',
      escala: 0.9 + rng() * 0.4,
    });
  }

  return { features, canyons: [], semente, bioma: 'floresta', comprimento: comprimentoPx };
}

function gerarSertao(semente: string, comprimentoPx: number): Percurso {
  const rng = criarAleatorio(semente);
  const features: Feature[] = [];
  // Corredor médio para não gerar obstáculo sólido na passagem
  const corredorCentro = LARGURA / 2 + (rng() - 0.5) * 140;
  const tipos = ['cacto', 'casebre', 'pedra', 'rio'];

  for (let y = 0; y < comprimentoPx; y += 18) {
    if (rng() > 0.36) continue;
    const tipo = tipos[Math.floor(rng() * tipos.length)];
    // Se está sólido e perto do corredor, reposiciona para fora dele
    let x = rng() * (LARGURA - 24) + 12;
    if ((tipo === 'cacto' || tipo === 'casebre') && Math.abs(x - corredorCentro) < 64) {
      x = x < corredorCentro ? corredorCentro - 78 : corredorCentro + 78;
      x = Math.max(12, Math.min(LARGURA - 12, x));
    }
    features.push({ x, y, tipo, escala: 0.8 + rng() * 0.5 });
  }

  return { features, canyons: [], semente, bioma: 'sertaao', comprimento: comprimentoPx };
}

// ===== Desenho =====

function retangulo(
  g: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  cor: string
): void {
  g.fillStyle = cor;
  g.fillRect(Math.floor(x), Math.floor(y), Math.floor(w), Math.floor(h));
}

export function desenharChaoLitoral(
  g: CanvasRenderingContext2D,
  camOffsetY: number,
  features: Feature[]
): void {
  g.fillStyle = '#FDE68A';
  g.fillRect(0, 0, LARGURA, ALTURA);

  // Mar nas laterais
  g.fillStyle = '#38BDF8';
  g.fillRect(0, 0, 56, ALTURA);
  g.fillRect(LARGURA - 56, 0, 56, ALTURA);
  g.strokeStyle = 'rgba(255,255,255,0.8)';
  g.lineWidth = 2;
  for (let i = 0; i < 8; i++) {
    const y = ((i * 78 + camOffsetY) % (ALTURA + 96)) - 40;
    g.beginPath();
    for (let x = 0; x <= 56; x += 10) {
      const yy = y + Math.sin(x * 0.18 + camOffsetY * 0.03 + i) * 2;
      if (x === 0) g.moveTo(x, yy);
      else g.lineTo(x, yy);
    }
    g.stroke();
    g.beginPath();
    for (let x = LARGURA - 56; x <= LARGURA; x += 10) {
      const yy = y + Math.cos(x * 0.18 + camOffsetY * 0.03 + i * 2) * 2;
      if (x === LARGURA - 56) g.moveTo(x, yy);
      else g.lineTo(x, yy);
    }
    g.stroke();
  }

  // Cinturão de sombra inferior
  g.fillStyle = 'rgba(120, 53, 15, 0.12)';
  g.fillRect(0, ALTURA - 92, LARGURA, 92);
  g.fillStyle = 'rgba(255,255,255,0.18)';
  g.fillRect(0, ALTURA - 96, LARGURA, 3);

  for (const f of features) {
    const y = f.y - camOffsetY;
    if (y < -50 || y > ALTURA + 50) continue;
    desenharFeature(g, f, y);
  }
}

export function desenharChaoSerra(
  g: CanvasRenderingContext2D,
  camOffsetY: number,
  percurso: Percurso
): void {
  // Fundo rochoso escuro
  g.fillStyle = '#57534E';
  g.fillRect(0, 0, LARGURA, ALTURA);
  g.fillStyle = '#44403C';
  for (let y = -(camOffsetY % 140); y < ALTURA; y += 140) {
    for (let x = 0; x < LARGURA; x += 70) {
      g.fillRect(x, y, 34, 22);
    }
  }
  // Sorriso claro nas laderas
  g.fillStyle = '#78716C';
  g.fillRect(0, ALTURA - 84, LARGURA, 84);

  // Canyons: paredões rochosos com passagem central
  for (const canyon of percurso.canyons) {
    const y = canyon.y - camOffsetY;
    if (y < -80 || y > ALTURA + 80) continue;

    const leftX2 = canyon.gapX - canyon.gap / 2;
    const rightX = canyon.gapX + canyon.gap / 2;

    // Paredão esquerdo
    g.fillStyle = '#292524';
    g.fillRect(0, y - 26, leftX2, 52);
    g.fillStyle = '#3F3F46';
    g.fillRect(0, y - 26, leftX2, 8);
    // Paredão direito
    g.fillRect(rightX, y - 26, LARGURA - rightX, 52);
    g.fillStyle = '#3F3F46';
    g.fillRect(rightX, y - 26, LARGURA - rightX, 8);
    // Picos sobre os paredões
    for (let px = 0; px < leftX2; px += 26) {
      g.fillStyle = '#292524';
      g.beginPath();
      g.moveTo(px, y - 26);
      g.lineTo(px + 13, y - 44);
      g.lineTo(px + 26, y - 26);
      g.fill();
    }
    for (let px = rightX; px < LARGURA; px += 26) {
      g.fillStyle = '#292524';
      g.beginPath();
      g.moveTo(px, y - 26);
      g.lineTo(px + 13, y - 44);
      g.lineTo(px + 26, y - 26);
      g.fill();
    }
  }

  for (const f of percurso.features) {
    const y = f.y - camOffsetY;
    if (y < -50 || y > ALTURA + 50) continue;
    desenharFeature(g, f, y);
  }
}

export function desenharChaoSertao(
  g: CanvasRenderingContext2D,
  camOffsetY: number,
  percurso: Percurso
): void {
  // Terra seca
  g.fillStyle = '#E7C873';
  g.fillRect(0, 0, LARGURA, ALTURA);
  // Sombras de dunas ondulantes
  g.fillStyle = 'rgba(194, 120, 3, 0.22)';
  for (let y = -(camOffsetY % 90); y < ALTURA; y += 90) {
    g.beginPath();
    g.moveTo(0, y);
    for (let x = 0; x <= LARGURA; x += 24) {
      g.lineTo(x, y + Math.sin((x + camOffsetY) * 0.03 + y * 0.07) * 9);
    }
    g.lineTo(LARGURA, ALTURA);
    g.lineTo(0, ALTURA);
    g.fill();
  }

  for (const f of percurso.features) {
    const y = f.y - camOffsetY;
    if (y < -50 || y > ALTURA + 50) continue;
    desenharFeature(g, f, y);
  }
}

export function desenharChaoCidade(
  g: CanvasRenderingContext2D,
  camOffsetY: number,
  percurso: Percurso
): void {
  // Avenida escura com faixas de néon
  g.fillStyle = '#1F2430';
  g.fillRect(0, 0, LARGURA, ALTURA);

  // Avenidas: corredores com moldura néon
  for (const avenida of percurso.canyons) {
    const y = avenida.y - camOffsetY;
    if (y < -80 || y > ALTURA + 80) continue;
    const leftX2 = avenida.gapX - avenida.gap / 2;
    const rightX = avenida.gapX + avenida.gap / 2;

    // Asfalto mais claro no corredor
    g.fillStyle = '#2A3040';
    g.fillRect(leftX2, y - 30, rightX - leftX2, 60);
    // Zebra das faixas
    g.fillStyle = '#3B4152';
    for (let py = y - 30; py < y + 30; py += 8) {
      for (let px = leftX2; px < rightX; px += 16) {
        g.fillRect(px, py, 8, 3);
      }
    }
    // Molduras néon rosa/ciano no corredor
    g.fillStyle = '#F472B6';
    g.fillRect(leftX2 - 2, y - 30, 2, 60);
    g.fillStyle = '#22D3EE';
    g.fillRect(rightX, y - 30, 2, 60);
  }

  // Prédios nas laterais
  for (const f of percurso.features) {
    if (f.tipo !== 'predio') continue;
    const y = f.y - camOffsetY;
    if (y < -60 || y > ALTURA + 60) continue;
    const s = f.escala;
    // Corpo escuro
    g.fillStyle = '#111827';
    g.fillRect(f.x - 13 * s, y - 22 * s, 26 * s, 22 * s);
    // Janelas acesas/apagadas aleatórias
    for (let wy = y - 20 * s; wy < y - 2 * s; wy += 6) {
      for (let wx = f.x - 10 * s; wx < f.x + 10 * s; wx += 6) {
        const hash = Math.sin(wx * 12.9898 + wy * 78.233 + percurso.semente.length) * 43758.5453;
        const acesa = (hash - Math.floor(hash)) < 0.55;
        g.fillStyle = acesa ? '#FDE047' : '#1F2937';
        g.fillRect(wx, wy, 3, 3);
      }
    }
    // Antena
    g.fillStyle = '#DC2626';
    g.fillRect(f.x - 1 * s, y - 28 * s, 2 * s, 6 * s);
    g.fillStyle = '#EF4444';
    g.fillRect(f.x - 1 * s, y - 32 * s, 2 * s, 3 * s);
  }

  // Letreiros neon
  for (const f of percurso.features) {
    if (f.tipo !== 'neon') continue;
    const y = f.y - camOffsetY;
    if (y < -40 || y > ALTURA + 40) continue;
    const cor = Math.floor(performance.now() / 600 + f.x) % 2 === 0 ? '#F472B6' : '#22D3EE';
    g.fillStyle = '#0B0F19';
    g.fillRect(f.x - 14 * f.escala, y - 6 * f.escala, 28 * f.escala, 12 * f.escala);
    g.fillStyle = cor;
    g.fillRect(f.x - 12 * f.escala, y - 4 * f.escala, 24 * f.escala, 8 * f.escala);
  }

  for (const f of percurso.features) {
    if (f.tipo === 'predio' || f.tipo === 'neon') continue;
    const y = f.y - camOffsetY;
    if (y < -50 || y > ALTURA + 50) continue;
    desenharFeature(g, f, y);
  }
}

export function desenharChaoFloresta(
  g: CanvasRenderingContext2D,
  camOffsetY: number,
  percurso: Percurso
): void {
  // Frieza densa (azulada)
  g.fillStyle = '#0F3B2E';
  g.fillRect(0, 0, LARGURA, ALTURA);

  // Rio sinuoso por baixo da vegetação
  for (const f of percurso.features) {
    if (f.tipo !== 'rio') continue;
    const y = f.y - camOffsetY;
    if (y < -30 || y > ALTURA + 30) continue;
    g.fillStyle = '#0E7490';
    g.beginPath();
    g.ellipse(f.x, y, 26, 6, 0, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = '#155E75';
    g.beginPath();
    g.ellipse(f.x, y + 1, 20, 3, 0, 0, Math.PI * 2);
    g.fill();
  }

  // Clareiras (abertura com grama) por baixo das copas
  for (const f of percurso.features) {
    if (f.tipo !== 'clareira') continue;
    const y = f.y - camOffsetY;
    if (y < -60 || y > ALTURA + 60) continue;
    g.fillStyle = '#16A34A';
    g.beginPath();
    g.ellipse(f.x, y, 34 * f.escala, 16 * f.escala, 0, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = '#22C55E';
    g.beginPath();
    g.ellipse(f.x, y - 2, 26 * f.escala, 10 * f.escala, 0, 0, Math.PI * 2);
    g.fill();
  }

  // Copas densas das árvores
  for (const f of percurso.features) {
    if (f.tipo !== 'copa') continue;
    const y = f.y - camOffsetY;
    if (y < -70 || y > ALTURA + 70) continue;
    const s = f.escala;
    // Tronco parcial
    g.fillStyle = '#3F2A14';
    g.fillRect(f.x - 3 * s, y - 8 * s, 6 * s, 14 * s);
    // Copa grande (camadas)
    g.fillStyle = '#14532D';
    g.beginPath();
    g.ellipse(f.x, y - 14 * s, 22 * s, 14 * s, 0, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = '#166534';
    g.beginPath();
    g.ellipse(f.x, y - 18 * s, 16 * s, 10 * s, 0, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = '#15803D';
    g.beginPath();
    g.ellipse(f.x, y - 22 * s, 10 * s, 6 * s, 0, 0, Math.PI * 2);
    g.fill();
  }

  // Vinhas/manchas de sombra
  g.globalAlpha = 0.3;
  g.fillStyle = '#052E16';
  for (let y = -(camOffsetY % 60); y < ALTURA; y += 60) {
    g.fillRect(0, y, LARGURA, 3);
  }
  g.globalAlpha = 1;
}

function desenharFeature(g: CanvasRenderingContext2D, f: Feature, y: number): void {
  const x = f.x;
  const s = f.escala;

  switch (f.tipo) {
    case 'coqueiro': {
      retangulo(g, x - 2 * s, y - 18 * s, 4 * s, 18 * s, '#92400E');
      retangulo(g, x - 3 * s, y - 18 * s, 6 * s, 2 * s, '#B45309');
      g.fillStyle = '#16A34A';
      g.beginPath();
      g.ellipse(x, y - 18 * s, 12 * s, 5 * s, 0, 0, Math.PI * 2);
      g.fill();
      g.beginPath();
      g.ellipse(x, y - 21 * s, 8 * s, 4 * s, -0.5, 0, Math.PI * 2);
      g.fill();
      g.beginPath();
      g.ellipse(x, y - 21 * s, 8 * s, 4 * s, 0.5, 0, Math.PI * 2);
      g.fill();
      break;
    }
    case 'ilha': {
      g.fillStyle = '#38BDF8';
      g.beginPath();
      g.ellipse(x, y, 34 * s, 10 * s, 0, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = '#FDE68A';
      g.beginPath();
      g.ellipse(x, y - 2, 26 * s, 7 * s, 0, 0, Math.PI * 2);
      g.fill();
      break;
    }
    case 'barco': {
      retangulo(g, x - 12 * s, y - 3 * s, 24 * s, 5 * s, '#92400E');
      retangulo(g, x - 6 * s, y - 3 * s, 12 * s, 2 * s, '#B45309');
      retangulo(g, x - 1 * s, y - 13 * s, 2 * s, 10 * s, '#1F2937');
      g.fillStyle = '#FEF9C3';
      g.beginPath();
      g.moveTo(x + 1 * s, y - 12 * s);
      g.lineTo(x + 12 * s, y - 6 * s);
      g.lineTo(x + 1 * s, y - 6 * s);
      g.closePath();
      g.fill();
      break;
    }
    case 'pedra': {
      g.fillStyle = '#78716C';
      g.beginPath();
      g.ellipse(x, y - 4 * s, 10 * s, 6 * s, 0, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = '#A8A29E';
      g.beginPath();
      g.ellipse(x - 3 * s, y - 6 * s, 5 * s, 3 * s, 0, 0, Math.PI * 2);
      g.fill();
      break;
    }
    case 'pinho': {
      retangulo(g, x - 2 * s, y - 12 * s, 4 * s, 12 * s, '#4A2C0F');
      g.fillStyle = '#14532D';
      g.beginPath();
      g.moveTo(x, y - 30 * s);
      g.lineTo(x - 10 * s, y - 10 * s);
      g.lineTo(x + 10 * s, y - 10 * s);
      g.fill();
      g.fillStyle = '#166534';
      g.beginPath();
      g.moveTo(x, y - 22 * s);
      g.lineTo(x - 12 * s, y - 4 * s);
      g.lineTo(x + 12 * s, y - 4 * s);
      g.fill();
      break;
    }
    case 'cacto': {
      retangulo(g, x - 4 * s, y - 20 * s, 8 * s, 20 * s, '#16A34A');
      retangulo(g, x - 10 * s, y - 12 * s, 5 * s, 8 * s, '#15803D');
      retangulo(g, x + 5 * s, y - 14 * s, 5 * s, 6 * s, '#15803D');
      // Espinhos
      g.fillStyle = '#BBF7D0';
      g.fillRect(x - 2 * s, y - 16 * s, 1 * s, 1 * s);
      g.fillRect(x + 2 * s, y - 10 * s, 1 * s, 1 * s);
      g.fillRect(x, y - 6 * s, 1 * s, 1 * s);
      break;
    }
    case 'casebre': {
      retangulo(g, x - 11 * s, y - 10 * s, 22 * s, 10 * s, '#92400E');
      retangulo(g, x - 11 * s, y - 10 * s, 22 * s, 2 * s, '#713F12');
      g.fillStyle = '#A16207';
      g.beginPath();
      g.moveTo(x - 12 * s, y - 10 * s);
      g.lineTo(x, y - 18 * s);
      g.lineTo(x + 12 * s, y - 10 * s);
      g.fill();
      break;
    }
    case 'rio': {
      g.fillStyle = '#38BDF8';
      g.beginPath();
      g.ellipse(x, y, 26 * s, 5 * s, 0, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = '#7DD3FC';
      for (let i = -2; i <= 2; i++) {
        g.fillRect(x + i * 9 * s, y - 1 * s, 4 * s, 2 * s);
      }
      break;
    }
    default: { // capim
      g.fillStyle = '#65A30D';
      for (let i = -2; i <= 2; i++) {
        retangulo(g, x + i * 3 * s, y - 6 * s - (Math.abs(i) % 2) * 2 * s, 2 * s, 6 * s + (Math.abs(i) % 2) * 2 * s, '#4D7C0F');
      }
    }
  }
}
