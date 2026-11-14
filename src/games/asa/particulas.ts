/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Particula, TextoFlutuante } from './tipos';

/** Sistema simples de partículas + textos flutuantes do Asa Rasante. */

export function criarExplosao(part: Particula[], x: number, y: number, cor: string, qtd = 18): void {
  for (let i = 0; i < qtd; i++) {
    const angulo = Math.random() * Math.PI * 2;
    const vel = 40 + Math.random() * 140;
    part.push({
      x,
      y,
      vx: Math.cos(angulo) * vel,
      vy: Math.sin(angulo) * vel,
      vida: 0.5 + Math.random() * 0.55,
      cor,
      tamanho: 2 + Math.random() * 3.5,
    });
  }
}

export function criarFaísca(
  part: Particula[],
  x: number,
  y: number,
  cor: string,
  qtd = 10,
  vel = 90
): void {
  for (let i = 0; i < qtd; i++) {
    const angulo = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI;
    const v = vel * (0.5 + Math.random() * 0.9);
    part.push({
      x,
      y,
      vx: Math.cos(angulo) * v,
      vy: Math.sin(angulo) * v,
      vida: 0.35 + Math.random() * 0.4,
      cor,
      tamanho: 1.5 + Math.random() * 2,
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
  textos.push({ x, y, texto, cor, vida: 1.1 });
}

export function atualizarParticulas(part: Particula[], dt: number): void {
  for (let i = part.length - 1; i >= 0; i--) {
    const p = part[i];
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += 160 * dt; // gravidade leve
    p.vida -= dt;
    if (p.vida <= 0) part.splice(i, 1);
  }
}

export function atualizarTextos(textos: TextoFlutuante[], dt: number): void {
  for (let i = textos.length - 1; i >= 0; i--) {
    const t = textos[i];
    t.y -= 26 * dt;
    t.vida -= dt * 0.9;
    if (t.vida <= 0) textos.splice(i, 1);
  }
}

export function desenharParticulas(g: CanvasRenderingContext2D, part: Particula[]): void {
  for (const p of part) {
    g.globalAlpha = Math.max(0, Math.min(1, p.vida * 1.6));
    g.fillStyle = p.cor;
    const t = p.tamanho * (0.5 + p.vida);
    g.fillRect(p.x - t / 2, p.y - t / 2, t, t);
  }
  g.globalAlpha = 1;
}

export function desenharTextos(g: CanvasRenderingContext2D, textos: TextoFlutuante[]): void {
  g.save();
  g.textAlign = 'center';
  g.font = '7px "Press Start 2P", monospace';
  for (const t of textos) {
    g.globalAlpha = Math.max(0, Math.min(1, t.vida));
    g.fillStyle = t.cor;
    g.fillText(t.texto, t.x, t.y);
  }
  g.restore();
  g.globalAlpha = 1;
}
