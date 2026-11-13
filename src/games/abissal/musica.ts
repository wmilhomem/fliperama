/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Trilha de fundo do "Submarino Abissal".
 *
 * Uma melodia grave e calma que fica mais tensa quando o oxigênio está
 * baixo. Pode ser desligada.
 */

import { AudioService } from '../../engine/types';

export interface MusicaAbissal {
  atualizar(dt: number, ativa: boolean, tensa: boolean): void;
  desligar(): void;
  ligar(): void;
  estaLigada(): boolean;
}

/** Notas da melodia calma (Hz). */
const CALMA = [65.41, 87.31, 77.78, 98.0];

/** Notas da melodia tensa (Hz). */
const TENSA = [98.0, 116.54, 87.31, 110.0];

export function criarMusicaAbissal(audio: AudioService): MusicaAbissal {
  let tempo = 0;
  let passo = 0;
  let ligada = true;

  function tocarPasso(tensa: boolean): void {
    const notas = tensa ? TENSA : CALMA;
    const nota = notas[passo % notas.length];
    audio.tocarTom(nota, 'sine', tensa ? 0.5 : 0.9, tensa ? 0.2 : 0.14);
    if (passo % 2 === 0) {
      audio.tocarTom(nota * 2, 'triangle', 0.25, 0.05);
    }
  }

  return {
    atualizar(dt: number, ativa: boolean, tensa: boolean) {
      if (!ligada || !ativa) {
        tempo = 0;
        passo = 0;
        return;
      }
      const duracaoPasso = tensa ? 0.42 : 0.72;
      tempo += dt;
      while (tempo >= duracaoPasso) {
        tempo -= duracaoPasso;
        passo = (passo + 1) % 16;
        tocarPasso(tensa);
      }
    },
    desligar() {
      ligada = false;
    },
    ligar() {
      ligada = true;
    },
    estaLigada() {
      return ligada;
    },
  };
}
