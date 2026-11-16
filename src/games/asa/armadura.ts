/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/** Armadura do helicóptero — 6 pontos (3 ícones com meios). */

import {
  ARMADURA_MAX,
  INVULNERAVEL_SEG,
  DANO_BALA_INIMIGA,
  DANO_MISSIL_INIMIGO,
  DANO_SOLIDO,
} from './config';

export interface EstadoArmadura {
  pontos: number;
  /** Segundos restantes de invulnerabilidade após tomar dano. */
  invulneravel: number;
}

export function criarArmadura(): EstadoArmadura {
  return { pontos: ARMADURA_MAX, invulneravel: 0 };
}

/** Aplica dano. Retorna true se o helicóptero foi destruído. */
export function aplicarDano(
  armadura: EstadoArmadura,
  dano: number
): { destruido: boolean; invulneravel: boolean } {
  if (armadura.invulneravel > 0) {
    return { destruido: false, invulneravel: true };
  }
  armadura.pontos = Math.max(0, armadura.pontos - dano);
  armadura.invulneravel = INVULNERAVEL_SEG;
  return { destruido: armadura.pontos <= 0, invulneravel: true };
}

export const danoBalaInimiga = (): number => DANO_BALA_INIMIGA;
export const danoMissilInimigo = (): number => DANO_MISSIL_INIMIGO;
export const danoObstaculo = (): number => DANO_SOLIDO;

export function tickArmadura(armadura: EstadoArmadura, dt: number): void {
  armadura.invulneravel = Math.max(0, armadura.invulneravel - dt);
}

/** Repõe a armadura completamente (no pouso). */
export function repararArmadura(armadura: EstadoArmadura): void {
  armadura.pontos = ARMADURA_MAX;
  armadura.invulneravel = 0;
}

/** Desenha os ícones de armadura no HUD — 3 ícones com metades. */
export function desenharArmaduraHUD(
  g: CanvasRenderingContext2D,
  x: number,
  y: number,
  pontos: number
): void {
  const halves = Math.round((pontos / ARMADURA_MAX) * 6); // 0..6 meios
  for (let i = 0; i < 3; i++) {
    const cheio = halves >= (i + 1) * 2;
    const meio = !cheio && halves === i * 2 + 1;
    const bx = x + i * 26;

    // Contorno do escudo
    g.fillStyle = '#1F2937';
    g.fillRect(bx, y, 20, 12);
    g.fillStyle = cheio ? '#34D399' : meio ? '#FBBF24' : '#374151';
    g.fillRect(bx + 1, y + 1, 18, 10);
    if (meio) {
      // Metade vazia (metade direita)
      g.fillStyle = '#1F2937';
      g.fillRect(bx + 10, y + 1, 9, 10);
    }
    // Brilho
    g.fillStyle = cheio ? '#A7F3D0' : meio ? '#FDE68A' : '#4B5563';
    g.fillRect(bx + 2, y + 2, 6, 1);
  }
}
