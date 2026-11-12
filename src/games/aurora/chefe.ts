/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AudioService } from '../../engine/types';
import { criarAve } from './aves';
import { BOSS_HP, HUD_ALTURA, LARGURA, MAX_AVES_ATIVAS } from './constantes';
import { criarLeque } from './projeteis';
import { Ave, Chefe, Orbe } from './tipos';

function clamp(valor: number, minimo: number, maximo: number): number {
  return Math.max(minimo, Math.min(maximo, valor));
}

export function criarChefe(onda: number): Chefe {
  return {
    x: LARGURA / 2,
    y: HUD_ALTURA + 78,
    largura: 96,
    altura: 64,
    hp: BOSS_HP,
    hpMax: BOSS_HP,
    tempo: 0,
    fase: onda * 0.7,
    timerTiro: 1.45,
    timerFilhote: 4.2,
    flash: 0,
  };
}

export function atualizarChefe(
  chefe: Chefe,
  dt: number,
  onda: number,
  orbes: Orbe[],
  aves: Ave[],
  alvoX: number,
  alvoY: number,
  audio: AudioService
): void {
  chefe.tempo += dt;
  chefe.flash = Math.max(0, chefe.flash - dt * 6);
  chefe.x = clamp(
    LARGURA / 2 + Math.sin(chefe.tempo * 0.65 + chefe.fase) * 138,
    58,
    LARGURA - 58
  );
  chefe.y = HUD_ALTURA + 78 + Math.sin(chefe.tempo * 2.3) * 6;

  chefe.timerTiro -= dt;
  if (chefe.timerTiro <= 0) {
    const quantidade = onda >= 15 ? 5 : 3;
    criarLeque(
      orbes,
      chefe.x,
      chefe.y + 26,
      alvoX,
      alvoY - 16,
      quantidade,
      0.82,
      Math.min(225, 125 + onda * 4)
    );
    chefe.timerTiro = Math.max(1.2, 2.7 - onda * 0.05);
    audio.tocarTom(112, 'sawtooth', 0.22, 0.38);
  }

  chefe.timerFilhote -= dt;
  if (chefe.timerFilhote <= 0 && aves.length < MAX_AVES_ATIVAS) {
    const filhote = criarAve('pequena', onda, chefe.x + (Math.random() - 0.5) * 96, chefe.y + 26);
    filhote.timerTiro = 99;
    aves.push(filhote);
    chefe.timerFilhote = Math.max(2.8, 4.8 - onda * 0.08);
    audio.tocarTom(620, 'square', 0.08, 0.2);
  }
}
