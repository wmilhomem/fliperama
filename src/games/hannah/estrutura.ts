/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * GERADOR DE ESTRUTURAS DO SALVE A HANNAH
 *
 * Cada fase recebe uma planta diferente, mas o jogo continua sempre
 * resolvível: 7 vigas com inclinação alternada (Hannah no topo, gorila à
 * esquerda, térreo plano embaixo) e escadas garantindo passagem entre
 * todos os andares (ao menos uma escada inteira por vão). Escadas quebradas
 * aparecem como atalhos que não dão passagem completa — os barris, porém,
 * descem por elas normalmente.
 *
 * A planta é determinística por fase (mesma fase = mesma estrutura).
 */

export interface Girder {
  id: number;
  xStart: number;
  yStart: number;
  xEnd: number;
  yEnd: number;
  height: number;
  rollDirection: 1 | -1;
}

export interface Ladder {
  x: number;
  yTop: number;
  yBottom: number;
  broken: boolean;
  brokenGapY?: number;
}

export interface Estrutura {
  girders: Girder[];
  ladders: Ladder[];
}

/** RNG determinístico (mulberry32). */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
const jitter = (rnd: () => number, amp: number) => (rnd() - 0.5) * 2 * amp;

function girderYAt(g: Girder, x: number): number | null {
  const minX = Math.min(g.xStart, g.xEnd);
  const maxX = Math.max(g.xStart, g.xEnd);
  if (x < minX || x > maxX) return null;
  const ratio = (x - g.xStart) / (g.xEnd - g.xStart);
  return g.yStart + (g.yEnd - g.yStart) * ratio;
}

/** Intervalo horizontal comum a duas vigas (onde cabem escadas). */
function overlapSpan(a: Girder, b: Girder): [number, number] {
  const lo = Math.max(Math.min(a.xStart, a.xEnd), Math.min(b.xStart, b.xEnd));
  const hi = Math.min(Math.max(a.xStart, a.xEnd), Math.max(b.xStart, b.xEnd));
  return [lo, hi];
}

export function gerarEstrutura(fase: number): Estrutura {
  const rnd = mulberry32(((fase * 2654435761) >>> 0) ^ 0x9e3779b9);

  // ---- Vigas (sempre 7, inclinação alternada; térreo plano) ----
  const mkt = (
    id: number,
    xStart: number,
    yStart: number,
    xEnd: number,
    yEnd: number,
    dir: 1 | -1,
    height = 12
  ): Girder => {
    const jx1 = jitter(rnd, 22);
    const jx2 = jitter(rnd, 22);
    const jy = jitter(rnd, 8);
    const a = clamp(yStart + jy, 46, 505);
    const b = clamp(yEnd + jy + jitter(rnd, 5), 46, 505);
    return {
      id,
      xStart: clamp(xStart + jx1, 8, 200),
      yStart: a,
      xEnd: clamp(xEnd + jx2, 280, 472),
      yEnd: id === 0 || id === 1 ? a : b, // plataformas do topo planas
      height,
      rollDirection: dir,
    };
  };

  const girders: Girder[] = [
    mkt(0, 180, 75, 300, 75, 1), // Hannah (centro, topo)
    mkt(1, 25, 125, 175, 125, 1), // Grotão (esquerda, topo)
    mkt(2, 65, 175, 445, 152, -1),
    mkt(3, 35, 245, 415, 265, 1),
    mkt(4, 65, 355, 445, 332, -1),
    mkt(5, 35, 425, 415, 442, 1),
    { id: 6, xStart: 15, yStart: 520, xEnd: 465, yEnd: 520, height: 14, rollDirection: -1 },
  ];

  // ---- Escadas ----
  const ladders: Ladder[] = [];
  // [id de cima, id de baixo, quantidade, máx. quebradas]
  const gaps: [number, number, number, number][] = [
    [0, 2, 1, 0],
    [2, 3, 2, 1],
    [3, 4, 2, 1],
    [4, 5, 2, 1],
    [5, 6, 3, 1],
  ];

  for (const [cimaId, baixoId, quantidade, maxQuebradas] of gaps) {
    const cima = girders.find((g) => g.id === cimaId)!;
    const baixo = girders.find((g) => g.id === baixoId)!;
    const [lo, hi] = overlapSpan(cima, baixo);
    const margem = 22;
    const spanMin = lo + margem;
    const spanMax = hi - margem;

    const posicoes: number[] = [];
    let tentativas = 0;
    while (posicoes.length < quantidade && tentativas < 40) {
      tentativas++;
      const x = spanMin + rnd() * Math.max(1, spanMax - spanMin);
      if (posicoes.every((p) => Math.abs(p - x) >= 55)) posicoes.push(x);
    }

    // Garantia: pelo menos uma escada inteira por vão
    let quebradas = 0;
    for (const x of posicoes.sort((a, b) => a - b)) {
      const desejaQuebrar = quebradas < maxQuebradas && rnd() < 0.55;
      const broken = desejaQuebrar && posicoes.indexOf(x) > 0; // 1ª é sempre inteira
      if (broken) quebradas++;

      const yTop = girderYAt(cima, x);
      const yBottom = girderYAt(baixo, x);
      if (yTop === null || yBottom === null) continue;

      const gapY = yTop + (yBottom - yTop) * (0.4 + rnd() * 0.25);
      ladders.push({
        x: Math.round(x),
        yTop: Math.round(yTop),
        yBottom: Math.round(yBottom),
        broken,
        brokenGapY: broken ? Math.round(gapY) : undefined,
      });
    }
  }

  return { girders, ladders };
}
