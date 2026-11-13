/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Partículas do "Submarino Abissal": bolhas, explosões, respingos e fumaça.
 */

export interface Particula {
  x: number;
  y: number;
  vx: number;
  vy: number;
  vida: number;
  vidaMax: number;
  tamanho: number;
  cor: string;
  tipo: 'bolha' | 'explosao' | 'respingo' | 'faisca';
}

export function criarParticulas(): Particula[] {
  return [];
}

/** Cria uma bolha que sobe até a superfície. */
export function criarBolha(x: number, y: number, tamanho = 4): Particula {
  return {
    x,
    y,
    vx: (Math.random() - 0.5) * 12,
    vy: -18 - Math.random() * 26,
    vida: 2 + Math.random() * 2,
    vidaMax: 4,
    tamanho,
    cor: 'rgba(226, 252, 255, 0.75)',
    tipo: 'bolha',
  };
}

/** Cria uma explosão (anel de partículas). */
export function criarExplosao(x: number, y: number, tamanho = 32): Particula[] {
  const lista: Particula[] = [];
  for (let i = 0; i < 14; i++) {
    const ang = (i / 14) * Math.PI * 2;
    const vel = 40 + Math.random() * 90;
    lista.push({
      x,
      y,
      vx: Math.cos(ang) * vel,
      vy: Math.sin(ang) * vel,
      vida: 0.5 + Math.random() * 0.4,
      vidaMax: 0.9,
      tamanho: tamanho / 4,
      cor: i % 3 === 0 ? '#FDE68A' : i % 3 === 1 ? '#FB923C' : '#EF4444',
      tipo: 'explosao',
    });
  }
  return lista;
}

/** Respingo na superfície da água. */
export function criarRespingo(x: number, y: number): Particula {
  return {
    x,
    y,
    vx: (Math.random() - 0.5) * 60,
    vy: -40 - Math.random() * 40,
    vida: 0.4,
    vidaMax: 0.4,
    tamanho: 3,
    cor: '#BAE6FD',
    tipo: 'respingo',
  };
}

/** Faísca de torpedo. */
export function criarFaisca(x: number, y: number, cor: string): Particula {
  return {
    x,
    y,
    vx: (Math.random() - 0.5) * 30,
    vy: (Math.random() - 0.5) * 30,
    vida: 0.25,
    vidaMax: 0.25,
    tamanho: 2,
    cor,
    tipo: 'faisca',
  };
}

/** Atualiza as partículas (movimento e duração). */
export function atualizarParticulas(particulas: Particula[], dt: number): void {
  for (let i = particulas.length - 1; i >= 0; i--) {
    const p = particulas[i];
    p.vida -= dt;
    if (p.vida <= 0) {
      particulas.splice(i, 1);
      continue;
    }
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    if (p.tipo === 'bolha') {
      p.vy -= 14 * dt;
      p.vx += Math.sin(p.y * 0.12) * 10 * dt;
    } else if (p.tipo === 'explosao') {
      p.vx *= 0.92;
      p.vy *= 0.92;
    } else {
      p.vy += 120 * dt;
    }
  }
}

/** Desenha as partículas. */
export function desenharParticulas(g: CanvasRenderingContext2D, particulas: Particula[]): void {
  for (const p of particulas) {
    const alpha = Math.max(0, Math.min(1, p.vida / p.vidaMax));
    g.save();
    g.globalAlpha = alpha;
    if (p.tipo === 'bolha') {
      g.strokeStyle = p.cor;
      g.lineWidth = 1;
      g.beginPath();
      g.arc(Math.round(p.x), Math.round(p.y), p.tamanho, 0, Math.PI * 2);
      g.stroke();
    } else if (p.tipo === 'explosao') {
      g.fillStyle = p.cor;
      g.fillRect(Math.round(p.x - p.tamanho / 2), Math.round(p.y - p.tamanho / 2), p.tamanho, p.tamanho);
    } else {
      g.fillStyle = p.cor;
      g.fillRect(Math.round(p.x), Math.round(p.y), p.tamanho, p.tamanho);
    }
    g.restore();
  }
}
