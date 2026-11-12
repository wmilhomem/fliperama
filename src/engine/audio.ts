/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AudioPreset, AudioService } from './types';

/**
 * Sintetizador de áudio retrô compartilhado via Web Audio API.
 * Gera todos os efeitos sonoros proceduralmente sem depender de arquivos externos.
 */
export class RetroAudioEngine implements AudioService {
  private ctx: AudioContext | null = null;
  private volume: number = 0.7;
  private mudo: boolean = false;
  private desbloqueado: boolean = false;

  constructor(volumeInicial = 0.7, mudoInicial = false) {
    this.volume = Math.max(0, Math.min(1, volumeInicial));
    this.mudo = mudoInicial;
  }

  private obterContexto(): AudioContext | null {
    if (typeof window === 'undefined') return null;

    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    return this.ctx;
  }

  private tocarRuido(
    duracao: number,
    frequenciaInicial: number,
    frequenciaFinal: number,
    volumeMult = 1
  ): void {
    const ctx = this.obterContexto();
    if (!ctx) return;

    try {
      const bufferSize = Math.max(1, Math.floor(ctx.sampleRate * duracao));
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(frequenciaInicial, ctx.currentTime);
      filter.frequency.linearRampToValueAtTime(frequenciaFinal, ctx.currentTime + duracao);

      const gain = ctx.createGain();
      const pico = this.volume * volumeMult * 0.32;
      gain.gain.setValueAtTime(pico, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duracao);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start();
      noise.stop(ctx.currentTime + duracao);
    } catch {
      // Falha silenciosa em navegadores com bloqueio estrito de áudio
    }
  }

  ativar(): void {
    const ctx = this.obterContexto();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().then(() => {
        this.desbloqueado = true;
      }).catch(() => {});
    } else if (ctx) {
      this.desbloqueado = true;
    }
  }

  estaMudo(): boolean {
    return this.mudo;
  }

  definirMudo(mudo: boolean): void {
    this.mudo = mudo;
  }

  obterVolume(): number {
    return this.volume;
  }

  definirVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  tocarTom(frequencia: number, tipo: OscillatorType = 'square', duracao: number = 0.1, volumeMult = 1.0): void {
    if (this.mudo || this.volume <= 0) return;
    const ctx = this.obterContexto();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = tipo;
      osc.frequency.setValueAtTime(frequencia, ctx.currentTime);

      const targetVol = this.volume * volumeMult * 0.25;
      gain.gain.setValueAtTime(targetVol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duracao);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duracao);
    } catch {
      // Falha silenciosa em navegadores com bloqueio estrito de áudio
    }
  }

  tocar(preset: AudioPreset): void {
    if (this.mudo || this.volume <= 0) return;
    const ctx = this.obterContexto();
    if (!ctx) return;

    const t = ctx.currentTime;
    const masterGain = this.volume * 0.3;

    try {
      switch (preset) {
        case 'pulo': {
          // Tom ascendente retrô
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(150, t);
          osc.frequency.exponentialRampToValueAtTime(580, t + 0.15);

          gain.gain.setValueAtTime(masterGain, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(t);
          osc.stop(t + 0.16);
          break;
        }

        case 'moeda':
        case 'item': {
          // Bip clássico de arcade de dois tons
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(987, t); // B5
          osc.frequency.setValueAtTime(1318, t + 0.08); // E6

          gain.gain.setValueAtTime(masterGain, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.26);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(t);
          osc.stop(t + 0.28);
          break;
        }

        case 'marreta': {
          // Pancada metálica arcade
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(180, t);
          osc.frequency.exponentialRampToValueAtTime(45, t + 0.18);

          gain.gain.setValueAtTime(masterGain * 1.3, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(t);
          osc.stop(t + 0.21);
          break;
        }

        case 'barril':
        case 'passo': {
          // Ruído rápido de passo / rolamento
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(110, t);
          osc.frequency.exponentialRampToValueAtTime(40, t + 0.06);

          gain.gain.setValueAtTime(masterGain * 0.45, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(t);
          osc.stop(t + 0.07);
          break;
        }

        case 'vidaPerdida': {
          // Arpeggio descendente trágico
          const notes = [440, 392, 349, 311, 261, 220, 164];
          notes.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(freq, t + idx * 0.07);

            gain.gain.setValueAtTime(masterGain, t + idx * 0.07);
            gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.07 + 0.08);

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(t + idx * 0.07);
            osc.stop(t + idx * 0.07 + 0.09);
          });
          break;
        }

        case 'explosao': {
          // Ruído branco simulado
          const bufferSize = ctx.sampleRate * 0.35;
          const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
          const data = buffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
          }

          const noise = ctx.createBufferSource();
          noise.buffer = buffer;

          const filter = ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(800, t);
          filter.frequency.linearRampToValueAtTime(50, t + 0.35);

          const gain = ctx.createGain();
          gain.gain.setValueAtTime(masterGain * 1.2, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

          noise.connect(filter);
          filter.connect(gain);
          gain.connect(ctx.destination);

          noise.start(t);
          noise.stop(t + 0.36);
          break;
        }

        case 'tiro': {
          // Laser de arcade clássico
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(880, t);
          osc.frequency.exponentialRampToValueAtTime(110, t + 0.12);

          gain.gain.setValueAtTime(masterGain, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(t);
          osc.stop(t + 0.13);
          break;
        }

        case 'vitoria': {
          // Fanfarra triunfante dos anos 80
          const melody = [
            { f: 523.25, d: 0.1 }, // C5
            { f: 659.25, d: 0.1 }, // E5
            { f: 783.99, d: 0.1 }, // G5
            { f: 1046.5, d: 0.28 }, // C6
          ];
          let offset = 0;
          melody.forEach((note) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'square';
            osc.frequency.setValueAtTime(note.f, t + offset);

            gain.gain.setValueAtTime(masterGain, t + offset);
            gain.gain.exponentialRampToValueAtTime(0.001, t + offset + note.d);

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(t + offset);
            osc.stop(t + offset + note.d);
            offset += note.d + 0.02;
          });
          break;
        }

        case 'gameOver': {
          const melody = [
            { f: 293.66, d: 0.2 },
            { f: 261.63, d: 0.2 },
            { f: 246.94, d: 0.2 },
            { f: 220.0, d: 0.4 },
          ];
          let offset = 0;
          melody.forEach((note) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(note.f, t + offset);

            gain.gain.setValueAtTime(masterGain * 0.9, t + offset);
            gain.gain.exponentialRampToValueAtTime(0.001, t + offset + note.d);

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(t + offset);
            osc.stop(t + offset + note.d);
            offset += note.d + 0.04;
          });
          break;
        }

        case 'alerta': {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(800, t);
          osc.frequency.setValueAtTime(1200, t + 0.08);

          gain.gain.setValueAtTime(masterGain * 0.7, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(t);
          osc.stop(t + 0.17);
          break;
        }

        case 'semente': {
          // Bip curto e estalado alternado para comer sementes
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(450, t);
          osc.frequency.exponentialRampToValueAtTime(250, t + 0.04);

          gain.gain.setValueAtTime(masterGain * 0.5, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(t);
          osc.stop(t + 0.045);
          break;
        }

        case 'fruta': {
          // Melodiazinha alegre de bônus de fruta
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(587.33, t); // D5
          osc.frequency.setValueAtTime(880, t + 0.08); // A5

          gain.gain.setValueAtTime(masterGain * 0.8, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(t);
          osc.stop(t + 0.23);
          break;
        }

        case 'propulsor': {
          // Ruído curto de propulsão, repetido enquanto acelera
          this.tocarRuido(0.09, 420, 160, 0.55);
          break;
        }

        case 'rochaGrande':
        case 'rochaMedia':
        case 'rochaPequena': {
          const config =
            preset === 'rochaGrande'
              ? { duracao: 0.38, inicio: 650, fim: 45, volume: 1.3 }
              : preset === 'rochaMedia'
                ? { duracao: 0.24, inicio: 900, fim: 90, volume: 1.0 }
                : { duracao: 0.14, inicio: 1300, fim: 160, volume: 0.8 };

          this.tocarRuido(config.duracao, config.inicio, config.fim, config.volume);

          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(preset === 'rochaGrande' ? 110 : 190, t);
          osc.frequency.exponentialRampToValueAtTime(38, t + config.duracao);

          gain.gain.setValueAtTime(masterGain * config.volume * 0.8, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + config.duracao);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(t);
          osc.stop(t + config.duracao + 0.01);
          break;
        }

        case 'explosaoNave': {
          // Explosão grande com queda grave
          this.tocarRuido(0.55, 1600, 35, 1.6);

          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(240, t);
          osc.frequency.exponentialRampToValueAtTime(30, t + 0.5);

          gain.gain.setValueAtTime(masterGain * 1.4, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(t);
          osc.stop(t + 0.52);
          break;
        }

        case 'salto': {
          // Varredura ascendente de hiperespaço
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(220, t);
          osc.frequency.exponentialRampToValueAtTime(1650, t + 0.26);

          gain.gain.setValueAtTime(masterGain, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(t);
          osc.stop(t + 0.29);

          this.tocarRuido(0.18, 300, 2400, 0.5);
          break;
        }

        case 'cristal': {
          // Brilho cristalino de dois tons
          const notas = [1318.5, 1760];
          notas.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, t + idx * 0.055);

            gain.gain.setValueAtTime(masterGain * 0.85, t + idx * 0.055);
            gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.055 + 0.16);

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(t + idx * 0.055);
            osc.stop(t + idx * 0.055 + 0.17);
          });
          break;
        }

        case 'batida': {
          // Batida grave de fundo
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(125, t);
          osc.frequency.exponentialRampToValueAtTime(40, t + 0.13);

          gain.gain.setValueAtTime(masterGain * 1.1, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(t);
          osc.stop(t + 0.15);
          break;
        }

        case 'abastecer': {
          // Gorgolejo ascendente de combustível enchendo o tanque
          const notas = [392, 494, 587.33];
          notas.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, t + idx * 0.045);

            gain.gain.setValueAtTime(masterGain * 0.45, t + idx * 0.045);
            gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.045 + 0.11);

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(t + idx * 0.045);
            osc.stop(t + idx * 0.045 + 0.12);
          });
          break;
        }

        case 'plunger': {
          // Mola do lançador: corda metálica esticando e soltando
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(180, t);
          osc.frequency.exponentialRampToValueAtTime(720, t + 0.12);
          gain.gain.setValueAtTime(masterGain * 0.8, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(t);
          osc.stop(t + 0.2);
          this.tocarRuido(0.08, 1800, 400, 0.35);
          break;
        }

        case 'flipper': {
          // Estalo grave do flipper (borracha batendo na placa)
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(320, t);
          osc.frequency.exponentialRampToValueAtTime(90, t + 0.07);
          gain.gain.setValueAtTime(masterGain * 0.75, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(t);
          osc.stop(t + 0.1);
          break;
        }

        case 'bumper': {
          // Tamborim: madeira aguda do topo do samba
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(760, t);
          osc.frequency.exponentialRampToValueAtTime(430, t + 0.07);
          gain.gain.setValueAtTime(masterGain * 0.85, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(t);
          osc.stop(t + 0.11);
          this.tocarRuido(0.05, 2600, 900, 0.3);
          break;
        }

        case 'slingshot': {
          // Chute de borracha: estalo curto e seco
          this.tocarRuido(0.07, 2200, 260, 0.7);
          break;
        }

        case 'alvo': {
          // Alvo fixo: sino brilhante
          const notas = [1046.5, 1568];
          notas.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, t + idx * 0.05);
            gain.gain.setValueAtTime(masterGain * 0.7, t + idx * 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.05 + 0.16);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(t + idx * 0.05);
            osc.stop(t + idx * 0.05 + 0.17);
          });
          break;
        }

        case 'alvoQueda': {
          // Alvo de queda: queda de bloco + nota descendente
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(520, t);
          osc.frequency.exponentialRampToValueAtTime(180, t + 0.12);
          gain.gain.setValueAtTime(masterGain * 0.8, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(t);
          osc.stop(t + 0.15);
          this.tocarRuido(0.06, 900, 200, 0.35);
          break;
        }

        case 'spinner': {
          // Spinner: clique de catraca
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(1500, t);
          osc.frequency.exponentialRampToValueAtTime(700, t + 0.04);
          gain.gain.setValueAtTime(masterGain * 0.45, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(t);
          osc.stop(t + 0.06);
          break;
        }

        case 'drenar': {
          // Dreno: a bola se foi
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(420, t);
          osc.frequency.exponentialRampToValueAtTime(70, t + 0.4);
          gain.gain.setValueAtTime(masterGain * 0.7, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.42);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(t);
          osc.stop(t + 0.44);
          break;
        }

        case 'tilt': {
          // Tilt: buzina de aviso
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(150, t);
          osc.frequency.linearRampToValueAtTime(90, t + 0.35);
          gain.gain.setValueAtTime(masterGain * 0.9, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.38);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(t);
          osc.stop(t + 0.4);
          break;
        }

        case 'bolaExtra': {
          // Bola extra: fanfarra curta
          const notas = [523.25, 659.25, 783.99, 1046.5];
          notas.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'square';
            osc.frequency.setValueAtTime(freq, t + idx * 0.09);
            gain.gain.setValueAtTime(masterGain * 0.8, t + idx * 0.09);
            gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.09 + 0.2);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(t + idx * 0.09);
            osc.stop(t + idx * 0.09 + 0.22);
          });
          break;
        }

        case 'especial': {
          // Especial: brilho de cristal
          const notas = [1318.5, 1760, 2093];
          notas.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, t + idx * 0.06);
            gain.gain.setValueAtTime(masterGain * 0.6, t + idx * 0.06);
            gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.06 + 0.22);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(t + idx * 0.06);
            osc.stop(t + idx * 0.06 + 0.24);
          });
          break;
        }
      }
    } catch {
      // Ignora falhas de playback
    }
  }
}
