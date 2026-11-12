/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Física da bola de pinball.
 *
 * A bola é um círculo. A colisão é contínua: a cada subpasso o movimento
 * previsto é varrido contra todas as paredes e o impacto acontece no ponto
 * exato de contato, o que impede que a bola "atravesse" paredes.
 */

import {
  ATRITO_PAREDE,
  RESTITUICAO_PADRAO,
  VELOCIDADE_MAXIMA,
} from './constantes';
import { ArcoParede, Parede, Ponto, SegmentoParede } from './tipos';

const DOIS_PI = Math.PI * 2;

export interface Bola {
  x: number;
  y: number;
  vx: number;
  vy: number;
  raio: number;
  /** Tempo sem movimento significativo (anti-travamento). */
  tempoParada: number;
  /** Verdadeiro enquanto a bola está na canaleta do lançador. */
  naMola: boolean;
}

export interface Impacto {
  /** Fração do movimento em que ocorreu o contato (0..1). */
  t: number;
  /** Normal que aponta DA parede PARA a bola. */
  nx: number;
  ny: number;
}

export function criarBola(x: number, y: number, raio: number): Bola {
  return { x, y, vx: 0, vy: 0, raio, tempoParada: 0, naMola: false };
}

export function normalizarAngulo(angulo: number): number {
  return ((angulo % DOIS_PI) + DOIS_PI) % DOIS_PI;
}

/** Verdadeiro se o ângulo está dentro do intervalo do arco. */
export function anguloDentroDoArco(arco: ArcoParede, angulo: number): boolean {
  if (arco.sentido === 1) {
    const span = normalizarAngulo(arco.anguloFim - arco.anguloInicio);
    return normalizarAngulo(angulo - arco.anguloInicio) <= span + 1e-6;
  }
  const span = normalizarAngulo(arco.anguloInicio - arco.anguloFim);
  return normalizarAngulo(arco.anguloInicio - angulo) <= span + 1e-6;
}

function raizesQuadratica(a: number, b: number, c: number): number[] {
  if (Math.abs(a) < 1e-9) return [];
  const discriminante = b * b - 4 * a * c;
  if (discriminante < 0) return [];
  const raiz = Math.sqrt(discriminante);
  return [(-b - raiz) / (2 * a), (-b + raiz) / (2 * a)];
}

/** Ponto da reta mais próximo de `p`. */
export function pontoMaisProximo(p: Ponto, a: Ponto, b: Ponto): Ponto {
  return pontoMaisProximoComParametro(p, a, b).ponto;
}

/**
 * Ponto da reta mais próximo de `p`, com o parâmetro `t` (0 = ponto A,
 * 1 = ponto B). Usado pelos flippers cônicos, que mudam de espessura.
 */
export function pontoMaisProximoComParametro(
  p: Ponto,
  a: Ponto,
  b: Ponto
): { ponto: Ponto; t: number } {
  const abx = b.x - a.x;
  const aby = b.y - a.y;
  const len2 = abx * abx + aby * aby;
  if (len2 < 1e-9) return { ponto: { x: a.x, y: a.y }, t: 0 };
  let t = ((p.x - a.x) * abx + (p.y - a.y) * aby) / len2;
  t = Math.max(0, Math.min(1, t));
  return { ponto: { x: a.x + abx * t, y: a.y + aby * t }, t };
}

/** Colisão varrida contra um segmento de parede. */
export function impactoSegmento(
  p0: Ponto,
  p1: Ponto,
  raio: number,
  seg: SegmentoParede
): Impacto | null {
  const a: Ponto = { x: seg.x1, y: seg.y1 };
  const b: Ponto = { x: seg.x2, y: seg.y2 };
  const dx = p1.x - p0.x;
  const dy = p1.y - p0.y;
  const sx = b.x - a.x;
  const sy = b.y - a.y;
  const len2 = sx * sx + sy * sy;
  if (len2 < 1e-9) return null;
  const len = Math.sqrt(len2);
  const ux = sx / len;
  const uy = sy / len;
  const nx = uy;
  const ny = -ux;

  let melhor: Impacto | null = null;

  // Trecho reto (quando a projeção do contato cai dentro do segmento)
  const s0 = (p0.x - a.x) * nx + (p0.y - a.y) * ny;
  const ds = dx * nx + dy * ny;
  if (Math.abs(ds) > 1e-9) {
    for (const alvo of [raio, -raio]) {
      const t = (alvo - s0) / ds;
      if (t < 0 || t > 1) continue;
      const px = p0.x + dx * t;
      const py = p0.y + dy * t;
      const u = ((px - a.x) * ux + (py - a.y) * uy) / len;
      if (u < 0 || u > 1) continue;
      const sinal = alvo > 0 ? 1 : -1;
      // A bola precisa estar se aproximando da parede.
      if (ds * sinal >= 0) continue;
      const imp: Impacto = { t, nx: sinal * nx, ny: sinal * ny };
      if (!melhor || imp.t < melhor.t) melhor = imp;
    }
  }

  // Pontas do segmento (cantos)
  for (const canto of [a, b]) {
    const ex = p0.x - canto.x;
    const ey = p0.y - canto.y;
    const a2 = dx * dx + dy * dy;
    const b2 = 2 * (ex * dx + ey * dy);
    const c2 = ex * ex + ey * ey - raio * raio;
    for (const t of raizesQuadratica(a2, b2, c2)) {
      if (t < 0 || t > 1) continue;
      const px = p0.x + dx * t;
      const py = p0.y + dy * t;
      const nx2 = px - canto.x;
      const ny2 = py - canto.y;
      const dist = Math.hypot(nx2, ny2) || 1;
      const nxUnit = nx2 / dist;
      const nyUnit = ny2 / dist;
      if (dx * nxUnit + dy * nyUnit >= 0) continue;
      const imp: Impacto = { t, nx: nxUnit, ny: nyUnit };
      if (!melhor || imp.t < melhor.t) melhor = imp;
    }
  }

  return melhor;
}

/** Colisão varrida contra um arco de parede. */
export function impactoArco(
  p0: Ponto,
  p1: Ponto,
  raio: number,
  arco: ArcoParede
): Impacto | null {
  const dx = p1.x - p0.x;
  const dy = p1.y - p0.y;
  const ex = p0.x - arco.cx;
  const ey = p0.y - arco.cy;
  const a2 = dx * dx + dy * dy;
  if (a2 < 1e-9) return null;
  const b2 = 2 * (ex * dx + ey * dy);

  const distanciaAlvo = arco.interno
    ? Math.max(0, arco.raio - raio)
    : arco.raio + raio;
  const c2 = ex * ex + ey * ey - distanciaAlvo * distanciaAlvo;

  let melhor: Impacto | null = null;
  for (const t of raizesQuadratica(a2, b2, c2)) {
    if (t < 0 || t > 1) continue;
    const px = p0.x + dx * t;
    const py = p0.y + dy * t;
    const ang = Math.atan2(py - arco.cy, px - arco.cx);
    if (!anguloDentroDoArco(arco, ang)) continue;
    const nx = px - arco.cx;
    const ny = py - arco.cy;
    const dist = Math.hypot(nx, ny) || 1;
    const sinal = arco.interno ? -1 : 1;
    const nxUnit = (sinal * nx) / dist;
    const nyUnit = (sinal * ny) / dist;
    if (dx * nxUnit + dy * nyUnit >= 0) continue;
    const imp: Impacto = { t, nx: nxUnit, ny: nyUnit };
    if (!melhor || imp.t < melhor.t) melhor = imp;
  }

  return melhor;
}

/** Impacto da bola contra uma parede (segmento ou arco). */
export function impactoParede(
  p0: Ponto,
  p1: Ponto,
  raio: number,
  parede: Parede
): Impacto | null {
  return parede.tipo === 'segmento'
    ? impactoSegmento(p0, p1, raio, parede)
    : impactoArco(p0, p1, raio, parede);
}

/** Aplica restituição e atrito à bola a partir de uma normal de contato. */
export function resolverColisao(
  bola: Bola,
  nx: number,
  ny: number,
  restituicao: number,
  atrito: number
): void {
  const vn = bola.vx * nx + bola.vy * ny;
  if (vn >= 0) return;
  const tx = bola.vx - vn * nx;
  const ty = bola.vy - vn * ny;
  const novoNormal = -restituicao * vn;
  bola.vx = tx * (1 - atrito) + novoNormal * nx;
  bola.vy = ty * (1 - atrito) + novoNormal * ny;
}

/**
 * Move a bola durante `dt` resolveando colisões de forma contínua.
 * A cada iteração procura o contato mais próximo e avança só até ele.
 */
export function moverBola(
  bola: Bola,
  dt: number,
  paredes: Parede[],
  maxIteracoes = 6
): void {
  let restante = dt;

  for (let iteracao = 0; iteracao < maxIteracoes && restante > 1e-7; iteracao++) {
    const destino: Ponto = { x: bola.x + bola.vx * restante, y: bola.y + bola.vy * restante };

    let paredeImpacto: Parede | null = null;
    let melhorImpacto: Impacto | null = null;

    for (const parede of paredes) {
      const impacto = impactoParede(bola, destino, bola.raio, parede);
      if (!impacto) continue;
      if (!melhorImpacto || impacto.t < melhorImpacto.t) {
        melhorImpacto = impacto;
        paredeImpacto = parede;
      }
    }

    if (!melhorImpacto || !paredeImpacto) {
      bola.x = destino.x;
      bola.y = destino.y;
      restante = 0;
      break;
    }

    bola.x += (destino.x - bola.x) * melhorImpacto.t;
    bola.y += (destino.y - bola.y) * melhorImpacto.t;

    const restituicao = paredeImpacto.restituicao ?? RESTITUICAO_PADRAO;
    const atrito = paredeImpacto.atrito ?? ATRITO_PAREDE;
    resolverColisao(bola, melhorImpacto.nx, melhorImpacto.ny, restituicao, atrito);

    // Correção posicional para a bola não grudar na parede
    bola.x += melhorImpacto.nx * 0.08;
    bola.y += melhorImpacto.ny * 0.08;

    restante *= 1 - melhorImpacto.t;
  }
}

/** Limita a velocidade da bola e aplica a gravidade do campo inclinado. */
export function aplicarGravidade(bola: Bola, gravidade: number, dt: number): void {
  bola.vy += gravidade * dt;
  const velocidade = Math.hypot(bola.vx, bola.vy);
  if (velocidade > VELOCIDADE_MAXIMA) {
    const escala = VELOCIDADE_MAXIMA / velocidade;
    bola.vx *= escala;
    bola.vy *= escala;
  }
}
