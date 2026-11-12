/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Trilha curta de percussão de samba (pandeiro + surdo + agogô),
 * sintetizada com o áudio do motor. Pode ser desligada.
 */

import { AudioService } from '../../engine/types';

export interface MusicaSamba {
  atualizar(dt: number, ativa: boolean): void;
  desligar(): void;
  ligar(): void;
  estaLigada(): boolean;
}

const BPM = 98;
const PASSO = 60 / BPM / 2; // colcheia
const PASSOS_POR_COMPASSO = 16;

export function criarMusicaSamba(audio: AudioService): MusicaSamba {
  let tempo = 0;
  let passo = 0;
  let ligada = true;

  function tocarPasso(indice: number): void {
    const dentro = indice % PASSOS_POR_COMPASSO;

    // Pandeiro: chocalho em todas as colcheias, com acento na virada
    const pandeiro = dentro % 2 === 0;
    if (pandeiro) {
      const volume = dentro % 8 === 0 ? 0.3 : 0.17;
      audio.tocarTom(2400 + (dentro % 4) * 260, 'triangle', 0.035, volume);
    }

    // Surdo: grave nas terminações do compasso
    if (dentro === 0 || dentro === 6 || dentro === 8 || dentro === 14) {
      audio.tocarTom(88, 'sine', 0.16, 0.42);
    }

    // Agogô: metal na contratempo
    if (dentro === 2 || dentro === 10) {
      audio.tocarTom(1760, 'square', 0.05, 0.1);
    }
    if (dentro === 6 || dentro === 14) {
      audio.tocarTom(2093, 'square', 0.05, 0.08);
    }
  }

  return {
    atualizar(dt: number, ativa: boolean) {
      if (!ligada || !ativa) {
        tempo = 0;
        passo = 0;
        return;
      }
      tempo += dt;
      while (tempo >= PASSO) {
        tempo -= PASSO;
        passo = (passo + 1) % PASSOS_POR_COMPASSO;
        tocarPasso(passo);
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
