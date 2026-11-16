/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/** Helicóptero do jogador — criação, atualização e desenho. */

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
  const alvo = movendo === 0 ? 0 : movendo > 0 ? 0.42 : -0.42;
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
export function desenharSombra(g: CanvasRenderingContext2D, x: number, yAltura: number, largura = 44): void {
  const espalhamento = Math.max(0.35, Math.min(1, (560 - yAltura) / 430));
  const w = largura * espalhamento;
  const h = Math.max(3, 8 * espalhamento);
  g.fillStyle = 'rgba(0,0,0,0.28)';
  g.fillRect(Math.floor(x - w / 2), 548, Math.floor(w), Math.floor(h));
}

/** Desenha o helicóptero (fuselagem verde-oliva + faixa laranja + cabine azulada). */
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
  g.scale(dir, 1);
  g.rotate(h.inclinacao * 0.4);

  // Sombra é desenhada à parte (antes de tudo) — ver desenharSombra.

  // Patins de pouso
  retangulo(g, -11, 14, 22, 2, '#1F2937');
  retangulo(g, -8, 16, 3, 3, '#1F2937');
  retangulo(g, 5, 16, 3, 3, '#1F2937');

  // Cauda (boom)
  retangulo(g, -19, -3, 16, 5, '#3F6212');
  // Anel do rotor de cauda + pás
  const faseCauda = Math.floor(h.rotor * 4) % 2 === 0;
  if (faseCauda) {
    retangulo(g, -24, -6, 5, 12, '#1F2937');
  } else {
    retangulo(g, -21, -6, 5, 12, '#1F2937');
  }

  // Corpo principal (verde-oliva)
  retangulo(g, -13, -9, 26, 16, '#4D7C0F');
  retangulo(g, -13, -9, 26, 3, '#365314');
  // Faixa laranja
  retangulo(g, -13, -3, 26, 3, '#F97316');
  // Cabine azulada na frente (voltada para dir)
  retangulo(g, 5, -7, 8, 9, '#7DD3FC');
  retangulo(g, 5, -7, 8, 2, '#38BDF8');
  retangulo(g, 11, -5, 2, 5, '#0EA5E9');

  // Mastro + rotor principal (gira alternando quadros)
  retangulo(g, -2, -13, 4, 5, '#1F2937');
  const faseRotor = Math.floor(h.rotor) % 2 === 0;
  if (faseRotor) {
    retangulo(g, -24, -16, 48, 3, '#111827');
    retangulo(g, -2, -17, 4, 5, '#374151');
  } else {
    retangulo(g, -15, -15, 30, 2, '#1F2937');
    retangulo(g, -2, -17, 4, 4, '#374151');
    // Pontas das pás para dar sensação de giro
    retangulo(g, -25, -15, 3, 2, '#F97316');
    retangulo(g, 22, -15, 3, 2, '#F97316');
  }

  g.restore();
}
