/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/** Black Hawk visto de cima — criação, atualização e desenho. */

import {
  HELI_ALTURA,
  HELI_LARGURA,
  HELI_VEL_X,
  HELI_LINHA_Y,
  LARGURA,
} from './config';
import { HelicopteroJogador, Particula } from './tipos';

export function criarHelicoptero(x = LARGURA / 2, y = HELI_LINHA_Y): HelicopteroJogador {
  return {
    x,
    y,
    inclinacao: 0,
    rotor: 0,
    cooldown: 0,
    cooldownMissil: 0,
    invulneravel: 0,
  };
}

/** Atualiza inclinação visual e giro do rotor. */
export function atualizarHelicoptero(h: HelicopteroJogador, movendo: number, dt: number): void {
  const alvo = movendo === 0 ? 0 : movendo > 0 ? 0.32 : -0.32;
  h.inclinacao += (alvo - h.inclinacao) * Math.min(1, dt * 8);
  h.rotor = (h.rotor + dt * 16) % 2;
}

function retangulo(
  g: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  cor: string
): void {
  g.fillStyle = cor;
  g.fillRect(Math.floor(x), Math.floor(y), Math.floor(w), Math.floor(h));
}

/** Desenha a sombra projetada no chão — se afasta com a aceleração. */
export function desenharSombra(g: CanvasRenderingContext2D, x: number, yAltura: number, largura = 52): void {
  const espalhamento = Math.max(0.35, Math.min(1, (560 - yAltura) / 430));
  const w = largura * espalhamento;
  const h = Math.max(4, 9 * espalhamento);
  // Sombra circular (em vez de retângulo) para imitar a feição real
  g.fillStyle = 'rgba(0,0,0,0.28)';
  g.beginPath();
  g.ellipse(x, 548, w / 2, h / 2, 0, 0, Math.PI * 2);
  g.fill();
}

/**
 * Desenha o Black Hawk visto de cima (nariz apontado para cima).
 * Inclui: fuselagem verde-oliva militar, stubs laterias com mísseis e
 * metralhadoras, boom cônico na cauda e rotor principal animado.
 */
export function desenharHelicoptero(
  g: CanvasRenderingContext2D,
  h: HelicopteroJogador,
  piscar: boolean
): void {
  if (piscar && Math.floor(performance.now() / 120) % 2 === 0) return;

  const x = h.x;
  const y = h.y;
  const dir = h.inclinacao >= 0 ? 1 : -1;

  g.save();
  g.translate(x, y);
  g.scale(dir * 1.45, 1.45);
  g.rotate(h.inclinacao * 0.32);

  // ===== CAUDA (boom cônico afunilado + rotor de cauda) =====
  // Boom principal: seção estreita que afunila para a cauda
  retangulo(g, -2, 5, 4, 8, '#1F2937');
  retangulo(g, -3, 5, 6, 1, '#374151'); // célula de reforço
  // Anel de cauda
  retangulo(g, -2, 12, 4, 3, '#111827');
  // Rotor de cauda (passa a ponta 4 vezes por segundo)
  const faseCauda = Math.floor(h.rotor * 4) % 2 === 0;
  if (faseCauda) {
    retangulo(g, -7, 14, 14, 2, '#0F172A'); // horizontal (frame 1)
    retangulo(g, -1, 10, 2, 10, '#0F172A'); // vertical
  } else {
    retangulo(g, -4, 14, 8, 1, '#1F2937');
    retangulo(g, -1, 11, 1, 7, '#1F2937');
  }

  // ===== SEÇÃO POSTERIOR DA FUSELAGEM =====
  // Faca estreitando para a cauda
  retangulo(g, -5, 2, 10, 4, '#374151');

  // ===== FUSELAGEM PRINCIPAL =====
  // Seção intermediária (a mais larga, onde ficam os stubs)
  retangulo(g, -7, -8, 14, 10, '#3F6212');
  // Linha de painéis (segmentação visual)
  retangulo(g, -7, -3, 14, 1, '#1F2937');
  // Seção do nariz (cockpit)
  retangulo(g, -5, -13, 10, 6, '#1F2937');
  // Vidro do cockpit (azulado)
  retangulo(g, -4, -12, 8, 4, '#0C4A6E');
  retangulo(g, -4, -12, 8, 1, '#38BDF8');
  retangulo(g, -2, -10, 4, 1, '#0EA5E9');

  // ===== STUBS DAS ASAS LATERAIS COM LANÇADORES =====
  // Barra horizontal das asas (seção larga)
  retangulo(g, -19, -4, 38, 3, '#365314');
  // Painéis esq/dir mais claros (detalhes de superfície)
  retangulo(g, -19, -4, 3, 3, '#4D7C0F');
  retangulo(g, 16, -4, 3, 3, '#4D7C0F');
  // Lançadores de mísseis (ponteiras das asas — 3 pods de cada lado)
  retangulo(g, -24, -6, 5, 7, '#0F172A'); // ponteira esq
  retangulo(g, 19, -6, 5, 7, '#0F172A'); // ponteira dir
  // Ponteiras com cones de míssil
  retangulo(g, -24, -6, 5, 1, '#374151');
  retangulo(g, 19, -6, 5, 1, '#374151');
  retangulo(g, -22, -7, 1, 1, '#FDE047');
  retangulo(g, 21, -7, 1, 1, '#FDE047');
  // Bocas das metralhadoras (sob as asas)
  retangulo(g, -24, 2, 3, 1, '#0F172A'); // cano da metralhadora esq
  retangulo(g, 21, 2, 3, 1, '#0F172A');  // cano da metralhadora dir

  // ===== DETALHES DO CORPO =====
  // Inlets de ar nas laterais do nariz
  retangulo(g, -8, -10, 2, 2, '#0F172A');
  retangulo(g, 6, -10, 2, 2, '#0F172A');
  // Linhas de cockpit e painéis
  retangulo(g, -6, -8, 12, 1, '#1F2937');
  // Faixa militar (alta contraste)
  retangulo(g, -7, -6, 14, 1, '#F97316');
  // Número de cauda (pequeno "41")
  retangulo(g, -2, 2, 4, 1, '#FDE047');

  // ===== ROTOR PRINCIPAL (blades giram alternando quadros) =====
  const fase = Math.floor(h.rotor) % 2 === 0;
  if (fase) {
    // Hélice horizontal longa (frame 1 — blades "cheias")
    retangulo(g, -22, -2, 44, 2, '#111827');
    // Mastro central
    retangulo(g, -3, -6, 6, 9, '#1F2937');
    retangulo(g, -2, -7, 4, 2, '#374151'); // copo do mastro
  } else {
    // Hélice vertical curta + pontas laranja (frame 2 — sensação de giro)
    retangulo(g, -9, -3, 18, 2, '#1F2937');
    // Mastro
    retangulo(g, -3, -6, 6, 8, '#1F2937');
    retangulo(g, -2, -7, 4, 2, '#374151');
    // Pontas das pás (demarca o giro)
    retangulo(g, -23, -4, 3, 2, '#F97316');
    retangulo(g, 20, -4, 3, 2, '#F97316');
  }

  g.restore();
}
