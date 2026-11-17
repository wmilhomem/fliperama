/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * TRILHA SONORA DE SALVE A HANNAH — uma melodia por tela.
 * Tudo procedural (Web Audio), sem arquivos externos.
 * Telas: 1 vigas/barris · 2 fábrica/cimento · 3 elevadores/molas · 4 travas.
 */

import { AudioService } from '../../engine/types';

export type TemaMusica = 'tela1' | 'tela2' | 'tela3' | 'tela4' | 'cena';

export interface EstadoMusica {
  tempo: number;
  passo: number;
  tema: TemaMusica;
  /** Volume geral da trilha (0..1) — o jogo ajusta por estado. */
  volume: number;
}

export function criarMusica(): EstadoMusica {
  return { tempo: 0, passo: 0, tema: 'tela1', volume: 0.16 };
}

export function resetarMusica(m: EstadoMusica): void {
  m.tempo = 0;
  m.passo = 0;
}

/** Troca de tema (reinicia o compasso). */
export function definirTema(m: EstadoMusica, tema: TemaMusica): void {
  if (m.tema === tema) return;
  m.tema = tema;
  m.tempo = 0;
  m.passo = 0;
}

// ===== Telas =====
// Tela 1 — VIGAS E BARRIS: marcha firme, dó menor
const T1_MELODIA = [
  293.66, 349.23, 440.0, 349.23,
  293.66, 349.23, 392.0, 349.23,
  261.63, 329.63, 392.0, 329.63,
  261.63, 293.66, 349.23, 293.66,
];
const T1_BASSO = [73.42, 87.31, 65.41, 87.31];

// Tela 2 — FÁBRICA DE CIMENTO: percussivo e industrial (lá menor)
const T2_MELODIA = [
  261.63, 311.13, 392.0, 466.16,
  392.0, 349.23, 311.13, 261.63,
  233.08, 293.66, 349.23, 440.0,
  349.23, 293.66, 261.63, 196.0,
];
const T2_BASSO = [65.41, 58.27, 73.42, 58.27];

// Tela 3 — ELEVADORES E MOLAS: tensão ascendente
const T3_MELODIA = [
  329.63, 392.0, 440.0, 523.25,
  493.88, 440.0, 392.0, 329.63,
  349.23, 415.3, 493.88, 587.33,
  523.25, 466.16, 392.0, 349.23,
];
const T3_BASSO = [82.41, 98.0, 73.42, 87.31];

// Tela 4 — TRAVAS: pesado e grave
const T4_MELODIA = [
  196.0, 233.08, 293.66, 392.0,
  349.23, 293.66, 233.08, 196.0,
  174.61, 220.0, 261.63, 349.23,
  293.66, 261.63, 233.08, 196.0,
];
const T4_BASSO = [49.0, 58.27, 43.65, 55.0];

// Cenas (abertura / rapto) — mais sombria
const CENA_MELODIA = [
  261.63, 261.63, 311.13, 349.23,
  311.13, 261.63, 233.08, 261.63,
  220.0, 261.63, 311.13, 392.0,
  349.23, 311.13, 261.63, 233.08,
];
const CENA_BASSO = [65.41, 65.41, 58.27, 58.27];

/**
 * Atualiza a trilha. O `dt` controla o andamento;
 * `ativa` permite silenciar a música (ex.: durante o game over).
 */
export function atualizarMusica(
  m: EstadoMusica,
  audio: AudioService,
  dt: number,
  ativa: boolean
): void {
  if (!ativa) {
    m.tempo = 0;
    return;
  }

  m.tempo += dt;
  const intervalo = m.tema === 'tela2' ? 0.21 : m.tema === 'tela3' ? 0.19 : 0.24;

  let melodia: number[];
  let baixo: number[];
  let onda: OscillatorType;

  switch (m.tema) {
    case 'tela2':
      melodia = T2_MELODIA;
      baixo = T2_BASSO;
      onda = 'square';
      break;
    case 'tela3':
      melodia = T3_MELODIA;
      baixo = T3_BASSO;
      onda = 'sawtooth';
      break;
    case 'tela4':
      melodia = T4_MELODIA;
      baixo = T4_BASSO;
      onda = 'sawtooth';
      break;
    case 'cena':
      melodia = CENA_MELODIA;
      baixo = CENA_BASSO;
      onda = 'triangle';
      break;
    default:
      melodia = T1_MELODIA;
      baixo = T1_BASSO;
      onda = 'square';
      break;
  }

  while (m.tempo >= intervalo) {
    m.tempo -= intervalo;

    const nota = melodia[m.passo % melodia.length];
    audio.tocarTom(nota, onda, 0.24, m.volume);

    if (m.passo % 4 === 0) {
      const b = baixo[Math.floor(m.passo / 4) % baixo.length];
      audio.tocarTom(b, 'triangle', 0.4, m.volume * 1.35);
    }

    // Percussão: clique de obra no contratempo
    if (m.passo % 2 === 1) {
      audio.tocarTom(m.tema === 'tela4' ? 120 : 180, 'square', 0.05, m.volume * 0.4);
    }

    // Contracanto agudo de hora a hora
    if (m.passo % 8 === 6) {
      audio.tocarTom(nota * 1.5, 'sine', 0.16, m.volume * 0.45);
    }

    m.passo += 1;
  }
}
