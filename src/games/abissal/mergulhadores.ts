/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Náufragos (mergulhadores) do "Submarino Abissal".
 *
 * Flutuam devagar em diferentes faixas do mar e são recolhidos quando o
 * submarino encosta neles.
 */

import { AGUA_Y, FAIXA_ALTURA, FUNDO_Y, LARGURA, PALETA } from './constantes';

export interface Mergulhador {
  x: number;
  y: number;
  largura: number;
  altura: number;
  vx: number;
  vy: number;
  /** Faixa do mar em que o náufrago flutua. */
  faixa: number;
  /** Tempo de vida antes de sumir (s). */
  vida: number;
  /** Animação do náufrago (braços ao vento). */
  animacao: number;
  /** Tempo desde o último toque (evita coletar em sequência). */
  tempoToque: number;
}

export const MERGULHADOR_LARGURA = 16;
export const MERGULHADOR_ALTURA = 32;

export function criarMergulhadores(): Mergulhador[] {
  return [];
}

/** Cria um náufrago em uma faixa do mar. */
export function criarMergulhador(faixa: number, x: number, y: number): Mergulhador {
  const direcao = Math.random() > 0.5 ? 1 : -1;
  return {
    x,
    y,
    largura: MERGULHADOR_LARGURA,
    altura: MERGULHADOR_ALTURA,
    vx: direcao * (8 + Math.random() * 10),
    vy: (Math.random() - 0.5) * 6,
    faixa,
    vida: 14 + Math.random() * 8,
    animacao: Math.random() * 6,
    tempoToque: 0,
  };
}

/** Atualiza a flutuação dos náufragos (cada um fica na sua faixa). */
export function atualizarMergulhadores(
  mergulhadores: Mergulhador[],
  dt: number
): void {
  for (let i = mergulhadores.length - 1; i >= 0; i--) {
    const m = mergulhadores[i];
    m.vida -= dt;
    m.animacao += dt;
    m.tempoToque = Math.max(0, m.tempoToque - dt);

    m.x += m.vx * dt;
    m.y += m.vy * dt;

    // Flutuação suave (sobe e desce devagar)
    m.vy += Math.sin(m.animacao * 1.3) * 4 * dt;
    m.vy = Math.max(-10, Math.min(10, m.vy));

    // Não invade a própria faixa (mantém o caminho livre para o submarino)
    const limiteBaixo = AGUA_Y + m.faixa * FAIXA_ALTURA;
    const limiteCima = limiteBaixo + FAIXA_ALTURA - m.altura;
    if (m.y < limiteBaixo) {
      m.y = limiteBaixo;
      m.vy = Math.abs(m.vy);
    }
    if (m.y > limiteCima) {
      m.y = limiteCima;
      m.vy = -Math.abs(m.vy);
    }

    if (m.x < -m.largura) m.x = LARGURA;
    if (m.x > LARGURA) m.x = -m.largura;

    if (m.vida <= 0) {
      mergulhadores.splice(i, 1);
    }
  }
}

/** Retângulo de colisão do náufrago. */
export function caixaMergulhador(m: Mergulhador): {
  x: number;
  y: number;
  largura: number;
  altura: number;
} {
  return { x: m.x, y: m.y, largura: m.largura, altura: m.altura };
}

/** Desenha o náufrago em pixel art (16x32). */
export function desenharMergulhador(
  g: CanvasRenderingContext2D,
  m: Mergulhador,
  tempo: number
): void {
  g.save();
  g.translate(Math.round(m.x), Math.round(m.y));

  // Traje
  g.fillStyle = PALETA.Mergulhador;
  g.fillRect(2, 10, 12, 14);
  g.fillStyle = '#CBD5E1';
  g.fillRect(2, 22, 12, 8);

  // Braços ao vento
  const balanco = Math.sin(m.animacao * 2) * 3;
  g.fillStyle = PALETA.Mergulhador;
  g.fillRect(-4, 12 + balanco, 6, 3);
  g.fillRect(14, 12 - balanco, 6, 3);

  // Capacete e visor
  g.fillStyle = '#E2E8F0';
  g.fillRect(2, 0, 12, 10);
  g.fillStyle = PALETA.MergulhadorVisor;
  g.fillRect(4, 3, 8, 6);
  g.fillStyle = 'rgba(255,255,255,0.5)';
  g.fillRect(5, 4, 3, 2);

  // Tanque de ar nas costas
  g.fillStyle = '#FACC15';
  g.fillRect(-2, 12, 4, 10);
  g.fillStyle = '#CA8A04';
  g.fillRect(-2, 20, 4, 2);

  // Reflexo de luz (brilho do sol na água)
  g.globalAlpha = 0.25;
  g.fillStyle = '#FFFFFF';
  g.fillRect(4, 10, 3, 14);
  g.globalAlpha = 1;

  g.restore();
  void tempo;
}
