/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Trilha da "Expedição Astro": percussão eletrônica aguda e leve
 * (sintetizada com o áudio do motor). Pode ser desligada.
 */

import { AudioService } from '../../engine/types';

export interface TrilhaAstro {
  atualizar(dt: number, ativa: boolean): void;
  desligar(): void;
  ligar(): void;
  estaLigada(): boolean;
}

const BPM = 112;
const PASSO = 60 / BPM / 2; // colcheia
const PASSOS_POR_COMPASSO = 16;

/** Timbres por passo: [frequência, tipo, duração, volume]. */
const TIMBRES: Array<[number, OscillatorType, number, number]> = [
  [1760, 'square', 0.035, 0.12],
  [2637, 'triangle', 0.03, 0.08],
];

export function criarTrilhaAstro(audio: AudioService): TrilhaAstro {
  let tempo = 0;
  let passo = 0;
  let ligada = true;

  function tocarPasso(indice: number): void {
    const dentro = indice % PASSOS_POR_COMPASSO;

    // Pulso de "transmissão" em toda colcheia
    const timbre = TIMBRES[dentro % TIMBRES.length];
    audio.tocarTom(timbre[0], timbre[1], timbre[2], timbre[3]);

    // Baixo sintetizado (onda quadrada grave) em 1 e 3
    if (dentro === 0 || dentro === 8) {
      audio.tocarTom(110, 'square', 0.12, 0.16);
    }

    // Bipe agudo de confirmação nos tempos 3 e 7
    if (dentro === 6 || dentro === 14) {
      audio.tocarTom(3136, 'square', 0.045, 0.1);
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
