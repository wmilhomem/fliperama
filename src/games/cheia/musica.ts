/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AudioService } from '../../engine/types';

export interface EstadoMusica {
  tempo: number;
  passo: number;
}

const MELODIA = [
  261.63, 329.63, 392.0, 329.63,
  440.0, 392.0, 329.63, 293.66,
  261.63, 329.63, 440.0, 523.25,
  440.0, 392.0, 329.63, 261.63,
];

const BAIXO = [130.81, 130.81, 174.61, 196.0];

export function criarMusica(): EstadoMusica {
  return { tempo: 0, passo: 0 };
}

export function resetarMusica(musica: EstadoMusica): void {
  musica.tempo = 0;
  musica.passo = 0;
}

export function atualizarMusica(
  musica: EstadoMusica,
  audio: AudioService,
  dt: number,
  ativa: boolean
): void {
  if (!ativa) {
    musica.tempo = 0;
    return;
  }

  musica.tempo += dt;
  const intervalo = 0.52;

  while (musica.tempo >= intervalo) {
    musica.tempo -= intervalo;
    const nota = MELODIA[musica.passo % MELODIA.length];
    audio.tocarTom(nota, 'triangle', 0.36, 0.16);

    if (musica.passo % 4 === 0) {
      const baixo = BAIXO[Math.floor(musica.passo / 4) % BAIXO.length];
      audio.tocarTom(baixo, 'sine', 0.55, 0.12);
    }

    if (musica.passo % 8 === 3) {
      audio.tocarTom(nota * 1.5, 'sine', 0.22, 0.07);
    }

    musica.passo += 1;
  }
}
