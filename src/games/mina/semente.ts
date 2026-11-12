export type RNG = () => number;

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

export function misturarSemente(base: number, valor: number, sal = 0): number {
  let h = (base ^ Math.imul(valor + 1, 0x9e3779b1) ^ Math.imul(sal + 1, 0x85ebca6b)) >>> 0;
  h ^= h >>> 16;
  h = Math.imul(h, 0x7feb352d) >>> 0;
  h ^= h >>> 15;
  h = Math.imul(h, 0x846ca68b) >>> 0;
  h ^= h >>> 16;
  return h >>> 0;
}

export function aleatorio(rng: RNG, min: number, max: number): number {
  return min + rng() * (max - min);
}

export function inteiro(rng: RNG, min: number, max: number): number {
  return Math.floor(aleatorio(rng, min, max + 1));
}

export function chance(rng: RNG, probabilidade: number): boolean {
  return rng() < probabilidade;
}

export function escolher<T>(rng: RNG, itens: readonly T[]): T {
  return itens[Math.floor(rng() * itens.length)];
}

export function clamp(valor: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, valor));
}
