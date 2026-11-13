/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * O submarino de resgate "Abissal".
 *
 * Move-se livremente nas 4 direções, vira conforme a direção horizontal e
 * dispara um torpedo por vez.
 */

import { AGUA_Y, ALTURA, FUNDO_Y, LARGURA, PALETA } from './constantes';

export type EstadoSubmarino =
  | 'parado'
  | 'navegando'
  | 'atirando'
  | 'atingido'
  | 'subindo';

export interface Submarino {
  x: number;
  y: number;
  vx: number;
  vy: number;
  largura: number;
  altura: number;
  direcao: -1 | 1;
  estado: EstadoSubmarino;
  animacao: number;
  tempoEstado: number;
  /** Pro torpedo na tela (apenas 1 por vez). */
  torpedo: Torpedo | null;
  /** Mergulhadores recolhidos a bordo. */
  aBordo: number;
  /** Tempo desde o último disparo (animação do torpedo). */
  tempoDisparo: number;
  /** Tempo em que já mergulhou nesta fase. */
  mergulhou: boolean;
}

export interface Torpedo {
  x: number;
  y: number;
  vx: number;
  vy: number;
  vida: number;
}

export const SUBMARINO_LARGURA = 48;
export const SUBMARINO_ALTURA = 32;
export const TORPEDO_LARGURA = 16;
export const TORPEDO_ALTURA = 16;

/** Aceleração máxima (px/s²). */
export const ACELERACAO = 430;
/** Frenagem (atrito) por segundo. */
export const ATRITO = 620;
/** Velocidade máxima do submarino. */
export const VELOCIDADE_MAXIMA = 165;
/** Velocidade do torpedo. */
export const VELOCIDADE_TORPEDO = 430;
/** Tempo de recarga do torpedo (s). */
export const RECARGA_TORPEDO = 0.6;

export function criarSubmarino(x: number, y: number): Submarino {
  return {
    x,
    y,
    vx: 0,
    vy: 0,
    largura: SUBMARINO_LARGURA,
    altura: SUBMARINO_ALTURA,
    direcao: 1,
    estado: 'parado',
    animacao: 0,
    tempoEstado: 0,
    torpedo: null,
    aBordo: 0,
    tempoDisparo: 0,
    mergulhou: false,
  };
}

/** Atualiza o movimento do submarino conforme o InputState. */
export function atualizarSubmarino(
  sub: Submarino,
  input: { esquerda: boolean; direita: boolean; cima: boolean; baixo: boolean },
  dt: number
): void {
  sub.tempoEstado += dt;
  sub.tempoDisparo = Math.max(0, sub.tempoDisparo - dt);

  if (sub.estado === 'atingido') {
    sub.vx *= 0.86;
    sub.vy *= 0.86;
    sub.x += sub.vx * dt;
    sub.y += sub.vy * dt;
    return;
  }

  let mx = 0;
  let my = 0;
  if (input.esquerda) mx -= 1;
  if (input.direita) mx += 1;
  if (input.cima) my -= 1;
  if (input.baixo) my += 1;

  if (mx !== 0) {
    sub.vx += mx * ACELERACAO * dt;
    sub.direcao = mx > 0 ? 1 : -1;
  }
  if (my !== 0) {
    sub.vy += my * ACELERACAO * dt;
  }

  // Frenagem suave
  if (mx === 0) {
    const perda = Math.min(Math.abs(sub.vx), ATRITO * dt);
    sub.vx -= Math.sign(sub.vx) * perda;
  }
  if (my === 0) {
    const perda = Math.min(Math.abs(sub.vy), ATRITO * dt);
    sub.vy -= Math.sign(sub.vy) * perda;
  }

  // Limita a velocidade
  const vel = Math.hypot(sub.vx, sub.vy);
  if (vel > VELOCIDADE_MAXIMA) {
    const escala = VELOCIDADE_MAXIMA / vel;
    sub.vx *= escala;
    sub.vy *= escala;
  }

  sub.x += sub.vx * dt;
  sub.y += sub.vy * dt;

  // Limites do campo (permite subir até a superfície)
  sub.x = Math.max(0, Math.min(LARGURA - sub.largura, sub.x));
  sub.y = Math.max(AGUA_Y - sub.altura, Math.min(FUNDO_Y - sub.altura, sub.y));

  if (sub.y > AGUA_Y) sub.mergulhou = true;

  const movendo = Math.abs(sub.vx) + Math.abs(sub.vy) > 12;
  sub.estado = movendo ? 'navegando' : 'parado';
  sub.animacao += dt * (movendo ? 8 : 2);
}

/** Dispara um torpedo na direção horizontal atual. */
export function dispararTorpedo(sub: Submarino): boolean {
  if (sub.torpedo || sub.tempoDisparo > 0) return false;
  if (sub.estado === 'atingido') return false;
  sub.torpedo = {
    x: sub.direcao > 0 ? sub.x + sub.largura : sub.x - TORPEDO_LARGURA,
    y: sub.y + sub.altura / 2 - TORPEDO_ALTURA / 2,
    vx: sub.direcao * VELOCIDADE_TORPEDO,
    vy: 0,
    vida: 3,
  };
  sub.tempoDisparo = RECARGA_TORPEDO;
  sub.estado = 'atirando';
  return true;
}

/** Atualiza o torpedo em voo. */
export function atualizarTorpedo(sub: Submarino, dt: number): void {
  const t = sub.torpedo;
  if (!t) return;
  t.x += t.vx * dt;
  t.vida -= dt;
  if (t.vida <= 0 || t.x < -32 || t.x > LARGURA + 32) {
    sub.torpedo = null;
  }
}

/** Retângulo de colisão do submarino. */
export function caixaSubmarino(sub: Submarino): {
  x: number;
  y: number;
  largura: number;
  altura: number;
} {
  return { x: sub.x, y: sub.y, largura: sub.largura, altura: sub.altura };
}

/** Desenha o submarino em pixel art (48x32). */
export function desenharSubmarino(
  g: CanvasRenderingContext2D,
  sub: Submarino,
  tempo: number
): void {
  g.save();

  if (sub.estado === 'atingido') {
    // Explosão: peças do casco voando
    g.fillStyle = PALETA.vermelho;
    for (let i = 0; i < 6; i++) {
      const ang = (i / 6) * Math.PI * 2 + tempo * 4;
      const d = 6 + (1 - sub.tempoEstado) * 18;
      g.fillRect(
        Math.round(sub.x + sub.largura / 2 + Math.cos(ang) * d),
        Math.round(sub.y + sub.altura / 2 + Math.sin(ang) * d),
        8,
        8
      );
    }
    g.restore();
    return;
  }

  g.translate(Math.round(sub.x), Math.round(sub.y));
  if (sub.direcao < 0) {
    g.translate(sub.largura, 0);
    g.scale(-1, 1);
  }

  // Sombra do casco
  g.fillStyle = 'rgba(0,0,0,0.25)';
  g.fillRect(4, sub.altura - 4, sub.largura - 8, 4);

  // Casco
  g.fillStyle = PALETA.subCascoEscuro;
  g.fillRect(0, 8, sub.largura, 16);
  g.fillStyle = PALETA.subCasco;
  g.fillRect(2, 8, sub.largura - 4, 12);
  g.fillRect(8, 4, sub.largura - 16, 4);
  g.fillStyle = 'rgba(255,255,255,0.35)';
  g.fillRect(6, 10, sub.largura - 12, 2);

  // Rebites
  g.fillStyle = PALETA.metalEscuro;
  for (let i = 0; i < 4; i++) {
    g.fillRect(8 + i * 10, 18, 2, 2);
  }

  // Domo de vidro
  g.fillStyle = PALETA.cupula;
  g.fillRect(14, 0, 20, 8);
  g.fillStyle = 'rgba(255,255,255,0.55)';
  g.fillRect(16, 1, 6, 4);
  g.fillStyle = PALETA.metalEscuro;
  g.fillRect(14, 6, 20, 2);

  // Lanterna na proa
  g.fillStyle = PALETA.metal;
  g.fillRect(sub.largura - 10, 12, 8, 8);
  const brilho = 0.55 + 0.45 * Math.sin(tempo * 6);
  g.fillStyle = `rgba(254, 249, 195, ${brilho})`;
  g.fillRect(sub.largura - 8, 14, 6, 4);

  // Hélice animada
  const giro = Math.floor(tempo * (sub.estado === 'navegando' ? 18 : 6)) % 4;
  g.fillStyle = PALETA.metalEscuro;
  g.fillRect(-4, 10, 4, 12);
  g.fillStyle = PALETA.metal;
  if (giro % 2 === 0) {
    g.fillRect(-6, 8, 6, 4);
    g.fillRect(-6, 20, 6, 4);
  } else {
    g.fillRect(-6, 12, 6, 4);
    g.fillRect(-2, 10, 4, 12);
  }

  // Mergulhadores a bordo (indicados na torre)
  if (sub.aBordo > 0) {
    g.fillStyle = PALETA.Mergulhador;
    g.fillRect(22, -8, 4, 8);
  }

  g.restore();
}

/** Desenha o torpedo em voo. */
export function desenharTorpedo(
  g: CanvasRenderingContext2D,
  sub: Submarino
): void {
  const t = sub.torpedo;
  if (!t) return;
  g.save();
  g.fillStyle = '#0EA5E9';
  g.fillRect(Math.round(t.x), Math.round(t.y), TORPEDO_LARGURA, 6);
  g.fillStyle = '#BAE6FD';
  g.fillRect(Math.round(t.x), Math.round(t.y) + 6, TORPEDO_LARGURA, 2);
  g.fillStyle = 'rgba(186, 230, 253, 0.6)';
  g.fillRect(Math.round(t.x) - 4, Math.round(t.y) + 2, 4, 2);
  g.restore();
}
