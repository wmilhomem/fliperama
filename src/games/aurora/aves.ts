/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AudioService, SpriteUtils } from '../../engine/types';
import { desenharAve } from './arte';
import { ALTURA, HUD_ALTURA, LARGURA, MAX_ORBES } from './constantes';
import {
  intervaloAveTiro,
  velocidadeMergulho,
  velocidadeOrbe,
  velocidadeQueda,
} from './ondas';
import { criarOrbe } from './projeteis';
import { Ave, Orbe, TipoAve } from './tipos';

let proximoId = 1;

function clamp(valor: number, minimo: number, maximo: number): number {
  return Math.max(minimo, Math.min(maximo, valor));
}

export function criarAve(
  tipo: TipoAve,
  onda: number,
  x?: number,
  y?: number
): Ave {
  const grande = tipo !== 'pequena';
  const largura = grande ? 64 : 32;
  const altura = grande ? 48 : 32;
  const baseX = x ?? 64 + Math.random() * (LARGURA - 128);
  const centroY = y ?? HUD_ALTURA + 24 + Math.random() * 26;
  const hpMax = tipo === 'escudo' ? 2 : 1;

  return {
    id: proximoId++,
    tipo,
    x: baseX,
    y: centroY,
    baseX,
    largura,
    altura,
    hp: hpMax,
    hpMax,
    tempo: 0,
    fase: Math.random() * Math.PI * 2,
    amplitude: grande ? 20 + Math.random() * 26 : 14 + Math.random() * 18,
    frequencia: grande ? 0.65 + Math.random() * 0.5 : 0.85 + Math.random() * 0.5,
    velocidadeQueda: velocidadeQueda(onda) * (tipo === 'mergulho' ? 0.82 : 1),
    podeAtirar: onda >= 2 && tipo !== 'pequena' && Math.random() < 0.55,
    timerTiro: Math.random() * 1.5,
    intervaloBaseTiro: intervaloAveTiro(onda),
    timerMergulho: 1.2 + Math.random() * 2.2,
    mergulhando: false,
    vx: 0,
    vy: 0,
    flash: 0,
    remover: false,
  };
}

export function atualizarAves(
  aves: Ave[],
  orbes: Orbe[],
  dt: number,
  onda: number,
  alvoX: number,
  alvoY: number,
  audio: AudioService
): void {
  for (const ave of aves) {
    if (ave.remover) continue;

    ave.tempo += dt;
    ave.flash = Math.max(0, ave.flash - dt * 6);

    if (!ave.mergulhando) {
      ave.y += ave.velocidadeQueda * dt;
      ave.x = clamp(
        ave.baseX + Math.sin(ave.tempo * ave.frequencia + ave.fase) * ave.amplitude,
        ave.largura / 2 + 8,
        LARGURA - ave.largura / 2 - 8
      );

      if (ave.tipo === 'mergulho' && onda >= 3) {
        ave.timerMergulho -= dt;
        if (ave.timerMergulho <= 0 && ave.y < ALTURA * 0.55) {
          const dx = alvoX - ave.x;
          const dy = alvoY - 16 - ave.y;
          const distancia = Math.hypot(dx, dy) || 1;
          const velocidade = velocidadeMergulho(onda);
          ave.vx = (dx / distancia) * velocidade;
          ave.vy = Math.max(80, (dy / distancia) * velocidade);
          ave.mergulhando = true;
          audio.tocarTom(220, 'square', 0.08, 0.22);
        }
      }
    } else {
      ave.x += ave.vx * dt;
      ave.y += ave.vy * dt;
      ave.vx += Math.sign(alvoX - ave.x) * 16 * dt;

      if (ave.x < ave.largura / 2 && ave.vx < 0) ave.vx *= -1;
      if (ave.x > LARGURA - ave.largura / 2 && ave.vx > 0) ave.vx *= -1;
    }

    if (ave.podeAtirar && !ave.mergulhando) {
      ave.timerTiro -= dt;
      if (ave.timerTiro <= 0 && ave.y < ALTURA * 0.62 && orbes.length < MAX_ORBES) {
        criarOrbe(
          orbes,
          ave.x,
          ave.y + ave.altura / 2,
          alvoX + (Math.random() - 0.5) * 34,
          alvoY - 16,
          velocidadeOrbe(onda),
          ave.tipo === 'escudo' ? '#67e8f9' : '#c4b5fd'
        );
        ave.timerTiro = ave.intervaloBaseTiro * (0.65 + Math.random() * 0.7);
        audio.tocarTom(330, 'triangle', 0.05, 0.14);
      }
    }
  }
}

export function dividirAve(ave: Ave, aves: Ave[], onda: number): void {
  if (ave.tipo === 'pequena') return;

  const esquerda = criarAve('pequena', onda, ave.x - 20, ave.y + 8);
  const direita = criarAve('pequena', onda, ave.x + 20, ave.y + 8);
  esquerda.baseX = ave.x - 20;
  direita.baseX = ave.x + 20;
  esquerda.timerTiro = 99;
  direita.timerTiro = 99;
  aves.push(esquerda, direita);
}

export function desenharAves(
  g: CanvasRenderingContext2D,
  sprites: SpriteUtils,
  aves: Ave[],
  tempo: number
): void {
  for (const ave of aves) {
    desenharAve(g, sprites, ave, tempo);
  }
}
