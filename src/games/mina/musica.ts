import { AudioService } from '../../engine/types';

export interface Musica {
  tempo: number;
  passo: number;
  proximaNota: number;
}

const ESCALA = [110, 130.81, 146.83, 164.81, 196, 220, 261.63, 293.66];
const ESCALA_ESCURA = [82.41, 98, 110, 123.47, 146.83, 164.81, 196, 220];
const BAIXO = [55, 65.41, 73.42, 82.41];

export function criarMusica(): Musica {
  return { tempo: 0, passo: 0, proximaNota: 0.2 };
}

export function resetarMusica(musica: Musica): void {
  musica.tempo = 0;
  musica.passo = 0;
  musica.proximaNota = 0.3;
}

export function atualizarMusica(
  musica: Musica,
  audio: AudioService,
  dt: number,
  ativa: boolean,
  escura: boolean,
  fase: number
): void {
  if (!ativa) return;

  musica.tempo += dt;
  musica.proximaNota -= dt;
  if (musica.proximaNota > 0) return;

  const escala = escura ? ESCALA_ESCURA : ESCALA;
  const indice = (musica.passo * 3 + Math.floor(fase / 2)) % escala.length;
  const frequencia = escala[indice];

  audio.tocarTom(frequencia, 'triangle', 0.16, escura ? 0.055 : 0.075);
  if (musica.passo % 4 === 0) {
    audio.tocarTom(BAIXO[(musica.passo / 4) % BAIXO.length | 0], 'square', 0.22, 0.05);
  }
  if (musica.passo % 8 === 6) {
    audio.tocarTom(frequencia * 2, 'sine', 0.09, 0.035);
  }

  musica.passo += 1;
  musica.proximaNota = escura ? 0.48 : 0.34;
}
