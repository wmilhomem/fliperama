/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Particula, TextoFlutuante } from './tipos';

function sortear(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

export function criarExplosao(
  particulas: Particula[],
  x: number,
  y: number,
  cor: string,
  quantidade = 18,
  velocidade = 150
): void {
  for (let i = 0; i < quantidade; i++) {
    const angulo = Math.random() * Math.PI * 2;
    const forca = sortear(velocidade * 0.25, velocidade);
    const vida = sortear(0.25, 0.6);
    particulas.push({
      x,
      y,
      vx: Math.cos(angulo) * forca,
      vy: Math.sin(angulo) * forca,
      vida,
      vidaMax: vida,
      tamanho: Math.floor(sortear(2, 5)),
      cor,
      gravidade: sortear(40, 120),
    });
  }
}

export function criarFaisca(
  particulas: Particula[],
  x: number,
  y: number,
  cor: string,
  quantidade = 6
): void {
  for (let i = 0; i < quantidade; i++) {
    const vida = sortear(0.18, 0.38);
    particulas.push({
      x,
      y,
      vx: sortear(-70, 70),
      vy: sortear(-110, -20),
      vida,
      vidaMax: vida,
      tamanho: 2,
      cor,
      gravidade: 180,
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
    vida: 0.9,
    vidaMax: 0.9,
  });
}

export function atualizarEfeitos(
  particulas: Particula[],
  textos: TextoFlutuante[],
  dt: number
): void {
  for (let i = particulas.length - 1; i >= 0; i--) {
    const p = particulas[i];
    p.vida -= dt;
    if (p.vida <= 0) {
      particulas.splice(i, 1);
      continue;
    }
    p.vy += p.gravidade * dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vx *= 0.985;
  }

  for (let i = textos.length - 1; i >= 0; i--) {
    const t = textos[i];
    t.vida -= dt;
    t.y -= 26 * dt;
    if (t.vida <= 0) {
      textos.splice(i, 1);
    }
  }
}

export function desenharParticulas(g: CanvasRenderingContext2D, particulas: Particula[]): void {
  g.save();
  for (const p of particulas) {
    const alpha = Math.max(0, Math.min(1, p.vida / p.vidaMax));
    g.globalAlpha = alpha;
    g.fillStyle = p.cor;
    const tamanho = Math.max(1, Math.floor(p.tamanho * (0.45 + alpha * 0.55)));
    g.fillRect(Math.floor(p.x), Math.floor(p.y), tamanho, tamanho);
  }
  g.restore();
}

export function desenharTextos(g: CanvasRenderingContext2D, textos: TextoFlutuante[]): void {
  g.save();
  g.font = '7px "Press Start 2P", monospace';
  g.textAlign = 'center';
  for (const t of textos) {
    g.globalAlpha = Math.max(0, Math.min(1, t.vida / t.vidaMax));
    g.fillStyle = t.cor;
    g.fillText(t.texto, Math.floor(t.x), Math.floor(t.y));
  }
  g.restore();
}
