/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Particula, TextoFlutuante } from './tipos';

function sortear(minimo: number, maximo: number): number {
  return minimo + Math.random() * (maximo - minimo);
}

export function criarRespingo(
  particulas: Particula[],
  x: number,
  y: number,
  cor: string,
  quantidade = 18,
  forca = 150
): void {
  for (let i = 0; i < quantidade; i++) {
    const angulo = sortear(-Math.PI * 0.9, -Math.PI * 0.1);
    const velocidade = sortear(forca * 0.35, forca);
    particulas.push({
      x,
      y,
      vx: Math.cos(angulo) * velocidade,
      vy: Math.sin(angulo) * velocidade,
      vida: sortear(0.25, 0.6),
      vidaMax: 0.6,
      tamanho: sortear(2, 5),
      cor,
      gravidade: 260,
      tipo: 'quadrado',
    });
  }
}

export function criarFaisca(
  particulas: Particula[],
  x: number,
  y: number,
  cor: string,
  quantidade = 8
): void {
  for (let i = 0; i < quantidade; i++) {
    const angulo = Math.random() * Math.PI * 2;
    const velocidade = sortear(30, 95);
    particulas.push({
      x,
      y,
      vx: Math.cos(angulo) * velocidade,
      vy: Math.sin(angulo) * velocidade,
      vida: sortear(0.3, 0.7),
      vidaMax: 0.7,
      tamanho: sortear(1, 3),
      cor,
      gravidade: -20,
      tipo: 'circulo',
    });
  }
}

export function criarTexto(
  textos: TextoFlutuante[],
  x: number,
  y: number,
  texto: string,
  cor: string
): void {
  textos.push({
    x,
    y,
    texto,
    cor,
    vida: 1,
  });
}

export function atualizarEfeitos(
  particulas: Particula[],
  textos: TextoFlutuante[],
  dt: number
): void {
  for (let i = particulas.length - 1; i >= 0; i--) {
    const p = particulas[i];
    p.vy += p.gravidade * dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vida -= dt;
    if (p.vida <= 0) {
      particulas.splice(i, 1);
    }
  }

  for (let i = textos.length - 1; i >= 0; i--) {
    const t = textos[i];
    t.y -= 24 * dt;
    t.vida -= dt * 1.15;
    if (t.vida <= 0) {
      textos.splice(i, 1);
    }
  }
}

export function desenharParticulas(
  g: CanvasRenderingContext2D,
  particulas: Particula[]
): void {
  for (const p of particulas) {
    const alpha = Math.max(0, Math.min(1, p.vida / p.vidaMax));
    g.save();
    g.globalAlpha = alpha;
    g.fillStyle = p.cor;
    if (p.tipo === 'circulo') {
      g.beginPath();
      g.arc(Math.floor(p.x), Math.floor(p.y), p.tamanho, 0, Math.PI * 2);
      g.fill();
    } else {
      g.fillRect(
        Math.floor(p.x - p.tamanho / 2),
        Math.floor(p.y - p.tamanho / 2),
        Math.ceil(p.tamanho),
        Math.ceil(p.tamanho)
      );
    }
    g.restore();
  }
}

export function desenharTextos(
  g: CanvasRenderingContext2D,
  textos: TextoFlutuante[]
): void {
  g.save();
  g.textAlign = 'center';
  g.font = '7px "Press Start 2P", monospace';
  for (const t of textos) {
    g.globalAlpha = Math.max(0, Math.min(1, t.vida));
    g.fillStyle = t.cor;
    g.fillText(t.texto, Math.floor(t.x), Math.floor(t.y));
  }
  g.restore();
}
