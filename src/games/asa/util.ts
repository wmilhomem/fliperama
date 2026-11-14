/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/** Utilitários de semente (PRNG) e matemática do Asa Rasante. */

function hashString(texto: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < texto.length; i++) {
    h ^= texto.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Gerador determinístico estilo mulberry32. */
export function criarAleatorio(semente: string): () => number {
  let a = hashString(semente) >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function entre(rng: () => number, min: number, max: number): number {
  return min + rng() * (max - min);
}

export function inteiro(rng: () => number, min: number, max: number): number {
  return Math.floor(entre(rng, min, max + 1));
}

export function escolher<T>(rng: () => number, opcoes: T[]): T {
  return opcoes[Math.floor(rng() * opcoes.length)];
}

export const clamp = (v: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, v));

export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

export interface Rect {
  x: number;
  y: number;
  largura: number;
  altura: number;
}

export function retangulosColocam(a: Rect, b: Rect): boolean {
  return (
    a.x < b.x + b.largura &&
    a.x + a.largura > b.x &&
    a.y < b.y + b.altura &&
    a.y + a.altura > b.y
  );
}

export function pontoNoRetangulo(px: number, py: number, r: Rect): boolean {
  return px >= r.x && px <= r.x + r.largura && py >= r.y && py <= r.y + r.altura;
}
