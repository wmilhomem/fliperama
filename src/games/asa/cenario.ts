/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ALTURA, HUD_ALTURA, LARGURA, PALETA_BIOMAS, TipoBioma } from './constantes';

/**
 * CENÁRIO DE CADA BIOMA
 * Camadas de chão que descem com a rolagem. O céu fica por conta de quem chama.
 * As "features" são sorteadas por posição (hash) para serem estáveis entre frames,
 * mas diferentes a cada setor.
 */

function hash(n: number): number {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

export interface Feature {
  x: number;
  y: number;
  tipo: string;
  escala: number;
}

export interface Setor {
  features: Feature[];
  semente: number;
  bioma: TipoBioma;
  comprimento: number;
}

/** Gera a lista de features (decoração/obstáculos) de um setor. */
export function gerarSetor(semente: number, bioma: TipoBioma, comprimento: number): Setor {
  const features: Feature[] = [];
  const tiposPorBioma: Record<TipoBioma, string[]> = {
    litoral: ['coqueiro', 'pedra', 'lancha', 'ilha', 'capim'],
    serra: ['pedra', 'pinho', 'pico', 'cactus'],
    sertaao: ['cactus', 'casebre', 'pedra', 'tumbleweed', 'capim'],
    floresta: ['arvore', 'rio', 'capim', 'pedra'],
  };
  for (let y = 0; y < comprimento; y += 16) {
    const h = hash(semente + y * 0.618);
    // Densidade de decoração varia por bioma
    const densidade = bioma === 'floresta' ? 0.34 : bioma === 'sertaao' ? 0.24 : 0.28;
    if (h < densidade) {
      const tipos = tiposPorBioma[bioma];
      const tipo = tipos[Math.floor(hash(semente * 1.7 + y) * tipos.length)];
      const x = hash(semente * 2.3 + y * 1.3) * (LARGURA - 32) + 16;
      const escala = 0.7 + hash(semente * 3.1 + y * 0.7) * 0.7;
      features.push({ x, y, tipo, escala });
    }
  }
  return { features, semente, bioma, comprimento };
}

/** Desenha o fundo do céu do bioma (do topo até o meio; o chão cobre o resto). */
export function desenharCeu(g: CanvasRenderingContext2D, bioma: TipoBioma, tempo: number): void {
  const [ceuTopo, ceuBase] = PALETA_BIOMAS[bioma];
  const grad = g.createLinearGradient(0, 0, 0, ALTURA * 0.62);
  grad.addColorStop(0, ceuTopo);
  grad.addColorStop(1, ceuBase);
  g.fillStyle = grad;
  g.fillRect(0, 0, LARGURA, ALTURA * 0.62);

  // Sol ou lua
  g.fillStyle = bioma === 'floresta' ? '#FDE68A' : '#FEF9C3';
  g.beginPath();
  g.arc(LARGURA - 74, 66, 26, 0, Math.PI * 2);
  g.fill();
  g.globalAlpha = 0.35;
  g.beginPath();
  g.arc(LARGURA - 74, 66, 40, 0, Math.PI * 2);
  g.fill();
  g.globalAlpha = 1;

  // Nuvens de fiapos
  g.fillStyle = 'rgba(255,255,255,0.8)';
  for (let i = 0; i < 4; i++) {
    const cx = ((tempo * 12 + i * 137) % (LARGURA + 220)) - 110;
    const cy = 34 + i * 22;
    g.beginPath();
    g.ellipse(cx, cy, 26, 8, 0, 0, Math.PI * 2);
    g.ellipse(cx + 14, cy + 3, 16, 7, 0, 0, Math.PI * 2);
    g.ellipse(cx - 14, cy + 3, 15, 7, 0, 0, Math.PI * 2);
    g.fill();
  }
}

/** Desenha o chão do bioma, rolado pela câmera (camOffsetY em pixels). */
export function desenharChao(
  g: CanvasRenderingContext2D,
  setor: Setor,
  camOffsetY: number
): void {
  const [, , chaoPrincipal, chaoEscuro] = PALETA_BIOMAS[setor.bioma];
  const chaoY = ALTURA * 0.42; // linha onde o chão começa

  g.fillStyle = chaoPrincipal;
  g.fillRect(0, chaoY, LARGURA, ALTURA - chaoY);

  // Cinturão inferior
  g.fillStyle = chaoEscuro;
  g.fillRect(0, ALTURA - 56, LARGURA, 56);

  // Mar do litoral
  if (setor.bioma === 'litoral') {
    g.fillStyle = '#38BDF8';
    g.fillRect(0, 0, LARGURA, chaoY - 6);
    // Ondas (linhas animadas)
    g.strokeStyle = 'rgba(255,255,255,0.75)';
    g.lineWidth = 2;
    for (let i = 0; i < 5; i++) {
      const y = ((i * 24 + (camOffsetY * 0.9) % 24) % (chaoY - 6)) + 4;
      g.beginPath();
      for (let x = 0; x <= LARGURA; x += 16) {
        const yy = y + Math.sin(x * 0.055 + camOffsetY * 0.02 + i) * 3;
        if (x === 0) g.moveTo(x, yy);
        else g.lineTo(x, yy);
      }
      g.stroke();
    }
    // Faixa de areia
    g.fillStyle = '#FDE68A';
    g.fillRect(0, chaoY - 10, LARGURA, 12);
  }

  // Rios da floresta (curvas senoidais)
  if (setor.bioma === 'floresta') {
    g.strokeStyle = '#38BDF8';
    g.lineWidth = 15;
    g.beginPath();
    for (let y = 0; y <= ALTURA; y += 6) {
      const mundoY = y + camOffsetY;
      const x = LARGURA / 2 + Math.sin(mundoY * 0.008 + setor.semente) * 130;
      if (y === 0) g.moveTo(x, y);
      else g.lineTo(x, y);
    }
    g.stroke();
    g.strokeStyle = 'rgba(186, 230, 253, 0.9)';
    g.lineWidth = 4;
    g.stroke();
  }

  // Features (decoração)
  for (const f of setor.features) {
    const y = chaoY + 20 + ((f.y - camOffsetY) % (ALTURA - chaoY + 120));
    if (y < chaoY - 20 || y > ALTURA + 20) continue;
    desenharFeature(g, f, y);
  }
}

function desenharFeature(g: CanvasRenderingContext2D, f: Feature, y: number): void {
  const s = f.escala;
  switch (f.tipo) {
    case 'coqueiro': {
      g.fillStyle = '#92400E';
      g.fillRect(f.x - 2 * s, y - 14 * s, 4 * s, 14 * s);
      g.fillStyle = '#16A34A';
      g.beginPath();
      g.ellipse(f.x, y - 15 * s, 9 * s, 5 * s, 0, 0, Math.PI * 2);
      g.fill();
      g.beginPath();
      g.ellipse(f.x - 7 * s, y - 11 * s, 7 * s, 4 * s, -0.4, 0, Math.PI * 2);
      g.fill();
      g.beginPath();
      g.ellipse(f.x + 7 * s, y - 11 * s, 7 * s, 4 * s, 0.4, 0, Math.PI * 2);
      g.fill();
      break;
    }
    case 'pedra': {
      g.fillStyle = '#78716C';
      g.beginPath();
      g.ellipse(f.x, y - 5 * s, 7 * s, 5 * s, 0, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = '#A8A29E';
      g.beginPath();
      g.ellipse(f.x - 2 * s, y - 6 * s, 3 * s, 2 * s, 0, 0, Math.PI * 2);
      g.fill();
      break;
    }
    case 'lancha': {
      g.fillStyle = '#F8FAFC';
      g.fillRect(f.x - 8 * s, y - 6 * s, 16 * s, 5 * s);
      g.fillStyle = '#EF4444';
      g.fillRect(f.x + 3 * s, y - 9 * s, 3 * s, 4 * s);
      break;
    }
    case 'ilha': {
      g.fillStyle = '#FDE68A';
      g.beginPath();
      g.ellipse(f.x, y - 2 * s, 12 * s, 4 * s, 0, 0, Math.PI * 2);
      g.fill();
      break;
    }
    case 'capim': {
      g.strokeStyle = '#15803D';
      g.lineWidth = 2;
      for (let i = -1; i <= 1; i++) {
        g.beginPath();
        g.moveTo(f.x + i * 3 * s, y);
        g.lineTo(f.x + i * 3 * s + i * 2 * s, y - 8 * s);
        g.stroke();
      }
      break;
    }
    case 'pinho': {
      g.fillStyle = '#14532D';
      g.beginPath();
      g.moveTo(f.x, y - 22 * s);
      g.lineTo(f.x - 9 * s, y - 2 * s);
      g.lineTo(f.x + 9 * s, y - 2 * s);
      g.closePath();
      g.fill();
      g.fillStyle = '#92400E';
      g.fillRect(f.x - 2 * s, y - 4 * s, 4 * s, 5 * s);
      break;
    }
    case 'pico': {
      g.fillStyle = '#57534E';
      g.beginPath();
      g.moveTo(f.x, y - 26 * s);
      g.lineTo(f.x - 12 * s, y);
      g.lineTo(f.x + 12 * s, y);
      g.closePath();
      g.fill();
      g.fillStyle = '#E7E5E4';
      g.beginPath();
      g.moveTo(f.x, y - 26 * s);
      g.lineTo(f.x - 4 * s, y - 16 * s);
      g.lineTo(f.x + 4 * s, y - 16 * s);
      g.closePath();
      g.fill();
      break;
    }
    case 'cactus': {
      g.fillStyle = '#15803D';
      g.fillRect(f.x - 3 * s, y - 16 * s, 6 * s, 16 * s);
      g.fillRect(f.x - 8 * s, y - 11 * s, 5 * s, 5 * s);
      g.fillRect(f.x + 3 * s, y - 8 * s, 5 * s, 5 * s);
      break;
    }
    case 'casebre': {
      g.fillStyle = '#B45309';
      g.fillRect(f.x - 8 * s, y - 9 * s, 16 * s, 9 * s);
      g.fillStyle = '#92400E';
      g.beginPath();
      g.moveTo(f.x - 10 * s, y - 9 * s);
      g.lineTo(f.x, y - 16 * s);
      g.lineTo(f.x + 10 * s, y - 9 * s);
      g.closePath();
      g.fill();
      break;
    }
    case 'tumbleweed': {
      g.strokeStyle = '#A16207';
      g.lineWidth = 1.5;
      g.beginPath();
      g.arc(f.x, y - 4 * s, 5 * s, 0, Math.PI * 2);
      g.stroke();
      g.beginPath();
      g.moveTo(f.x - 4 * s, y - 6 * s);
      g.lineTo(f.x + 4 * s, y - 2 * s);
      g.moveTo(f.x + 4 * s, y - 6 * s);
      g.lineTo(f.x - 4 * s, y - 2 * s);
      g.stroke();
      break;
    }
    case 'arvore': {
      g.fillStyle = '#14532D';
      g.beginPath();
      g.arc(f.x, y - 8 * s, 8 * s, 0, Math.PI * 2);
      g.fill();
      g.beginPath();
      g.arc(f.x - 6 * s, y - 4 * s, 5 * s, 0, Math.PI * 2);
      g.fill();
      g.beginPath();
      g.arc(f.x + 6 * s, y - 4 * s, 5 * s, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = '#92400E';
      g.fillRect(f.x - 2 * s, y - 4 * s, 4 * s, 6 * s);
      break;
    }
    case 'rio': {
      // Já desenhado como rio sinuoso; aqui é um remendo decorativo
      break;
    }
  }
}

/** Desenha nuvens à frente (sobre os inimigos, atrás do avião) para profundidade. */
export function desenharNuvens(g: CanvasRenderingContext2D, tempo: number): void {
  g.fillStyle = 'rgba(255,255,255,0.5)';
  for (let i = 0; i < 2; i++) {
    const cx = ((tempo * 20 + i * 240) % (LARGURA + 200)) - 100;
    const cy = HUD_ALTURA + 40 + i * 130;
    g.beginPath();
    g.ellipse(cx, cy, 34, 10, 0, 0, Math.PI * 2);
    g.ellipse(cx + 20, cy + 4, 22, 8, 0, 0, Math.PI * 2);
    g.fill();
  }
}
