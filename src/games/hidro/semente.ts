/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type RNG = () => number;

export const TAU = Math.PI * 2;

/** Gerador determinístico mulberry32. */
export function criarRng(semente: number): RNG {
  let a = semente >>> 0;

  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function aleatorio(rng: RNG, min: number, max: number): number {
  return min + rng() * (max - min);
}

export function inteiro(rng: RNG, min: number, max: number): number {
  return Math.floor(aleatorio(rng, min, max + 1));
}

export function escolher<T>(rng: RNG, itens: T[]): T {
  return itens[Math.min(itens.length - 1, Math.floor(rng() * itens.length))];
}

export function clamp(valor: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, valor));
}

export function interpolar(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}
