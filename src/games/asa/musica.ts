/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * ÁUDIO DO ASA RASANTE — trilha de ação, trilha de combate, rotor,
 * motor do chefão e alerta de aproximação de míssil.
 * Tudo procedural (Web Audio), sem arquivos externos.
 */

import { AudioService } from '../../engine/types';

export type Trilha = 'acao' | 'duelo' | 'nenhuma';

export interface EstadoMusica {
  /** Relógio da trilha (segundos). */
  tempo: number;
  /** Passo da sequência de notas. */
  passo: number;
  /** Trilha em execução. */
  trilha: Trilha;
  /** Tempo desde o último "batido" do rotor. */
  rotorTimer: number;
  /** Velocidade do rotor (0..1) — controla o volume e a altura do som. */
  rotorVelocidade: number;
  /** Tempo desde o último pulso do motor do chefão. */
  motorTimer: number;
  /** Tempo desde o último bipe de aproximação de míssil. */
  alertaTimer: number;
}

export function criarMusica(): EstadoMusica {
  return {
    tempo: 0,
    passo: 0,
    trilha: 'nenhuma',
    rotorTimer: 0,
    rotorVelocidade: 0.5,
    motorTimer: 0,
    alertaTimer: 0,
  };
}

export function resetarMusica(m: EstadoMusica): void {
  m.tempo = 0;
  m.passo = 0;
  m.trilha = 'nenhuma';
  m.rotorTimer = 0;
  m.motorTimer = 0;
  m.alertaTimer = 0;
}

export function definirTrilha(m: EstadoMusica, trilha: Trilha): void {
  if (m.trilha === trilha) return;
  m.trilha = trilha;
  m.tempo = 0;
  m.passo = 0;
}

// ===== Trilha de ação (percurso) =====
const ACAO_MELODIA = [
  392.0, 440.0, 523.25, 440.0,
  392.0, 349.23, 329.63, 261.63,
  293.66, 349.23, 440.0, 523.25,
  587.33, 523.25, 440.0, 392.0,
];
const ACAO_BASSO = [65.41, 87.31, 98.0, 98.0];

// ===== Trilha de combate (duelo com o chefão) =====
const DUELO_MELODIA = [
  261.63, 311.13, 349.23, 392.0,
  311.13, 261.63, 233.08, 196.0,
  261.63, 311.13, 349.23, 466.16,
  392.0, 349.23, 311.13, 261.63,
];
const DUELO_BASSO = [55.0, 51.91, 58.27, 49.0];

/** Batida do rotor (uma "batida" de hélice por vez). */
function baterRotor(audio: AudioService, velocidade: number): void {
  // "Whop" grave: frequência e volume sobem com a velocidade do rotor
  const f = 46 + velocidade * 26;
  audio.tocarTom(f, 'sawtooth', 0.09, 0.10 + velocidade * 0.12);
  // Leve sopro metálico por cima
  if (Math.random() < 0.35) {
    audio.tocarTom(320 + velocidade * 220, 'triangle', 0.05, 0.03 + velocidade * 0.03);
  }
}

/** Pulso grave do motor do chefão. */
function pulsarMotorChefe(audio: AudioService, intensidade: number): void {
  audio.tocarTom(38, 'square', 0.36, 0.07 + intensidade * 0.07);
  audio.tocarTom(76, 'sawtooth', 0.22, 0.03 + intensidade * 0.03);
}

/**
 * Atualiza o som do jogo.
 * - `trilha`: qual música toca
 * - `rotorLigado`: o helicóptero do jogador está no ar
 * - `motorChefe`: o motor do chefão está ligado (duelo)
 * - `misseisInimigos`: quantidade de mísseis inimigos voando (para o alerta)
 */
export function atualizarMusica(
  m: EstadoMusica,
  audio: AudioService,
  dt: number,
  opcoes: {
    rotorLigado: boolean;
    motorChefe: boolean;
    misseisInimigos: number;
    intensidadeRotor: number;
  }
): void {
  // ===== Rotor do jogador =====
  if (opcoes.rotorLigado) {
    m.rotorTimer += dt;
    m.rotorVelocidade += (opcoes.intensidadeRotor - m.rotorVelocidade) * Math.min(1, dt * 4);
    const intervalo = 0.075;
    while (m.rotorTimer >= intervalo) {
      m.rotorTimer -= intervalo;
      baterRotor(audio, m.rotorVelocidade);
    }
  } else {
    m.rotorTimer = 0;
    m.rotorVelocidade += (0 - m.rotorVelocidade) * Math.min(1, dt * 3);
  }

  // ===== Motor do chefão =====
  if (opcoes.motorChefe) {
    m.motorTimer += dt;
    while (m.motorTimer >= 0.5) {
      m.motorTimer -= 0.5;
      pulsarMotorChefe(audio, 1);
    }
  } else {
    m.motorTimer = 0;
  }

  // ===== Alerta de aproximação de míssil =====
  if (opcoes.misseisInimigos > 0) {
    m.alertaTimer += dt;
    while (m.alertaTimer >= 0.42) {
      m.alertaTimer -= 0.42;
      // Bipe agudo e urgente, mantendo o marcador triangular na tela
      audio.tocarTom(1180, 'square', 0.07, 0.16);
      audio.tocarTom(880, 'square', 0.07, 0.11);
    }
  } else {
    m.alertaTimer = 0;
  }

  // ===== Trilha musical =====
  if (m.trilha === 'nenhuma') return;

  m.tempo += dt;
  const intervalo = m.trilha === 'acao' ? 0.3 : 0.24;
  const melodia = m.trilha === 'acao' ? ACAO_MELODIA : DUELO_MELODIA;
  const baixo = m.trilha === 'acao' ? ACAO_BASSO : DUELO_BASSO;

  while (m.tempo >= intervalo) {
    m.tempo -= intervalo;

    const nota = melodia[m.passo % melodia.length];
    audio.tocarTom(nota, m.trilha === 'acao' ? 'square' : 'sawtooth', 0.26, 0.11);

    if (m.passo % 4 === 0) {
      const b = baixo[Math.floor(m.passo / 4) % baixo.length];
      audio.tocarTom(b, 'triangle', 0.44, 0.16);
    }

    if (m.passo % 8 === 6) {
      audio.tocarTom(nota / 2, 'sine', 0.2, 0.07);
    }

    // Percussão seca da bateria (clique de ataque)
    if (m.passo % 2 === 0) {
      audio.tocarTom(m.trilha === 'acao' ? 180 : 150, 'square', 0.05, 0.05);
    }

    m.passo += 1;
  }
}
