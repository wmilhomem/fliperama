/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Navio-patrulha pirata da superfície do "Submarino Abissal".
 *
 * Aparece quando o jogador fica na superfície por muito tempo (ou depois
 * de 40 s de fase) e deixa cair bombas no mar. Pode ser destruído com
 * vários torpedos (vale muitos pontos).
 */

import { AGUA_Y, LARGURA, PALETA } from './constantes';

export interface Bomba {
  x: number;
  y: number;
  vy: number;
  vida: number;
}

export interface Patrulha {
  x: number;
  y: number;
  largura: number;
  altura: number;
  velocidade: number;
  direcao: -1 | 1;
  vida: number;
  /** Tempo até a próxima bomba. */
  tempoBomba: number;
  /** Invulnerabilidade após aparecer (evita morte instantânea). */
  invulneravel: number;
}

export const PATRULHA_LARGURA = 64;
export const PATRULHA_ALTURA = 32;
export const BOMBA_LARGURA = 8;
export const BOMBA_ALTURA = 8;
export const VELOCIDADE_BOMBA = 120;

/** Vida da patrulha (nº de torpedos para destruir). */
export const VIDA_PATRULHA = 4;

export function criarPatrulha(direcao: -1 | 1): Patrulha {
  return {
    x: direcao > 0 ? -PATRULHA_LARGURA : LARGURA,
    y: AGUA_Y - PATRULHA_ALTURA + 4,
    largura: PATRULHA_LARGURA,
    altura: PATRULHA_ALTURA,
    velocidade: 42,
    direcao,
    vida: VIDA_PATRULHA,
    tempoBomba: 1.4,
    invulneravel: 1.6,
  };
}

/**
 * Atualiza a patrulha.
 * Devolve as bombas lançadas neste quadro.
 */
export function atualizarPatrulha(patrulha: Patrulha, dt: number): Bomba[] {
  patrulha.x += patrulha.velocidade * patrulha.direcao * dt;
  patrulha.invulneravel = Math.max(0, patrulha.invulneravel - dt);
  patrulha.tempoBomba -= dt;

  const bombas: Bomba[] = [];
  if (patrulha.tempoBomba <= 0) {
    patrulha.tempoBomba = 1.5 + Math.random() * 0.8;
    bombas.push({
      x: patrulha.x + patrulha.largura / 2 - BOMBA_LARGURA / 2,
      y: patrulha.y + patrulha.altura - BOMBA_LARGURA,
      vy: VELOCIDADE_BOMBA,
      vida: 6,
    });
  }
  return bombas;
}

/** Atualiza as bombas que caem no mar. */
export function atualizarBombas(bombas: Bomba[], dt: number): void {
  for (let i = bombas.length - 1; i >= 0; i--) {
    const b = bombas[i];
    b.y += b.vy * dt;
    b.vida -= dt;
    if (b.vida <= 0 || b.y > 560) {
      bombas.splice(i, 1);
    }
  }
}

/** Retângulo de colisão da patrulha. */
export function caixaPatrulha(p: Patrulha): {
  x: number;
  y: number;
  largura: number;
  altura: number;
} {
  return { x: p.x, y: p.y, largura: p.largura, altura: p.altura };
}

/** Retângulo de colisão da bomba. */
export function caixaBomba(b: Bomba): {
  x: number;
  y: number;
  largura: number;
  altura: number;
} {
  return { x: b.x, y: b.y, largura: BOMBA_LARGURA, altura: BOMBA_ALTURA };
}

/** Desenha o navio-patrulha pirata. */
export function desenharPatrulha(g: CanvasRenderingContext2D, patrulha: Patrulha, tempo: number): void {
  g.save();
  g.translate(Math.round(patrulha.x), Math.round(patrulha.y));
  if (patrulha.direcao < 0) {
    g.translate(patrulha.largura, 0);
    g.scale(-1, 1);
  }

  // Casco preto e vermelho
  g.fillStyle = '#1F2937';
  g.fillRect(0, 12, 64, 16);
  g.fillStyle = PALETA.vermelho;
  g.fillRect(0, 16, 64, 4);
  g.fillStyle = '#0F172A';
  g.fillRect(8, 20, 48, 8);

  // Cabine
  g.fillStyle = '#334155';
  g.fillRect(14, 2, 26, 12);
  g.fillStyle = '#FCA5A5';
  g.fillRect(18, 5, 6, 6);
  g.fillRect(28, 5, 6, 6);

  // Canhão
  g.fillStyle = '#0F172A';
  g.fillRect(40, 16, 20, 6);

  // Bandeira
  g.fillStyle = '#111827';
  g.fillRect(0, 0, 3, 14);
  g.fillStyle = PALETA.vermelho;
  g.fillRect(3, 1, 12, 8);

  // Faróis (acendem quando vai lançar bomba)
  const carregando = patrulha.tempoBomba < 0.5;
  g.fillStyle = carregando ? '#FDE047' : 'rgba(253, 230, 138, 0.4)';
  g.fillRect(44, 4, 6, 4);
  g.fillRect(52, 4, 6, 4);

  // Escudo de invulnerabilidade
  if (patrulha.invulneravel > 0) {
    g.globalAlpha = 0.35 + 0.25 * Math.sin(tempo * 12);
    g.fillStyle = '#FFFFFF';
    g.fillRect(0, 0, 64, 32);
    g.globalAlpha = 1;
  }

  g.restore();
}

/** Desenha uma bomba caindo. */
export function desenharBomba(g: CanvasRenderingContext2D, bomba: Bomba, tempo: number): void {
  g.save();
  g.fillStyle = '#111827';
  g.fillRect(Math.round(bomba.x), Math.round(bomba.y), BOMBA_LARGURA, BOMBA_ALTURA);
  g.fillStyle = PALETA.vermelho;
  const brilho = 0.5 + 0.5 * Math.sin(tempo * 12);
  g.fillStyle = `rgba(239, 68, 68, ${brilho})`;
  g.fillRect(Math.round(bomba.x) + 2, Math.round(bomba.y) + 2, BOMBA_LARGURA - 4, BOMBA_ALTURA - 4);
  g.restore();
}
