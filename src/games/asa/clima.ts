/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Hora do dia e clima — ASA RASANTE
 * Efeitos visuais sem trapacear as regras de justiça:
 *   - neblina esconde obstáculos só a mais de 160 px;
 *   - todo perigo tem ao menos 0,6 s de aviso;
 *   - escuridão não pode esconder nada a menos de 160 px.
 */

import { LARGURA, ALTURA } from './config';
import { criarAleatorio } from './util';

export type HoraDia = 'manha' | 'entardecer' | 'tarde' | 'noite' | 'madrugada';
export type TipoClima = 'limpo' | 'chuva' | 'neblina' | 'tempestadeAreia' | 'tempestade';

// ===== Céu =====
export function desenharCeu(
  g: CanvasRenderingContext2D,
  tempo: number,
  hora: HoraDia
): void {
  switch (hora) {
    case 'manha': {
      const grad = g.createLinearGradient(0, 0, 0, ALTURA);
      grad.addColorStop(0, '#7DD3FC');
      grad.addColorStop(1, '#E0F2FE');
      g.fillStyle = grad;
      g.fillRect(0, 0, LARGURA, ALTURA);
      // Sol + halo
      g.fillStyle = '#FEF9C3';
      g.beginPath();
      g.arc(LARGURA - 76, 60, 24, 0, Math.PI * 2);
      g.fill();
      g.globalAlpha = 0.3;
      g.beginPath();
      g.arc(LARGURA - 76, 60, 44, 0, Math.PI * 2);
      g.fill();
      g.globalAlpha = 1;
      break;
    }
    case 'entardecer': {
      const grad = g.createLinearGradient(0, 0, 0, ALTURA);
      grad.addColorStop(0, '#FB923C');
      grad.addColorStop(0.55, '#FDBA74');
      grad.addColorStop(1, '#FFEDD5');
      g.fillStyle = grad;
      g.fillRect(0, 0, LARGURA, ALTURA);
      // Sol baixo (maior, laranjado)
      g.fillStyle = '#FDE047';
      g.beginPath();
      g.arc(LARGURA - 90, 118, 34, 0, Math.PI * 2);
      g.fill();
      g.globalAlpha = 0.32;
      g.beginPath();
      g.arc(LARGURA - 90, 118, 66, 0, Math.PI * 2);
      g.fill();
      g.globalAlpha = 1;
      // Nuvens longas
      g.fillStyle = 'rgba(254, 243, 199, 0.85)';
      for (let i = 0; i < 4; i++) {
        const cx = ((tempo * 9 + i * 144) % (LARGURA + 240)) - 120;
        const cy = 70 + i * 34;
        g.beginPath();
        g.ellipse(cx, cy, 44, 7, 0, 0, Math.PI * 2);
        g.fill();
      }
      break;
    }
    case 'tarde': {
      const grad = g.createLinearGradient(0, 0, 0, ALTURA);
      grad.addColorStop(0, '#FDBA74');
      grad.addColorStop(0.55, '#FB923C');
      grad.addColorStop(1, '#FED7AA');
      g.fillStyle = grad;
      g.fillRect(0, 0, LARGURA, ALTURA);
      // Sol a pino (branco-amarelado, alto)
      g.fillStyle = '#FFFBEB';
      g.beginPath();
      g.arc(LARGURA / 2 + 60, 42, 26, 0, Math.PI * 2);
      g.fill();
      g.globalAlpha = 0.4;
      g.beginPath();
      g.arc(LARGURA / 2 + 60, 42, 44, 0, Math.PI * 2);
      g.fill();
      g.globalAlpha = 1;
      break;
    }
    case 'noite': {
      const grad = g.createLinearGradient(0, 0, 0, ALTURA);
      grad.addColorStop(0, '#0F172A');
      grad.addColorStop(1, '#1E293B');
      g.fillStyle = grad;
      g.fillRect(0, 0, LARGURA, ALTURA);
      // Lua
      g.fillStyle = '#F8FAFC';
      g.beginPath();
      g.arc(LARGURA - 70, 60, 22, 0, Math.PI * 2);
      g.fill();
      g.globalAlpha = 0.35;
      g.beginPath();
      g.arc(LARGURA - 70, 60, 42, 0, Math.PI * 2);
      g.fill();
      g.globalAlpha = 1;
      // Estrelas
      g.fillStyle = '#E2E8F0';
      const rng = criarAleatorio('ceu-noite');
      for (let i = 0; i < 60; i++) {
        const x = rng() * LARGURA;
        const y = rng() * (ALTURA * 0.55);
        const s = rng() < 0.8 ? 1 : 2;
        g.fillRect(x, y, s, s);
      }
      break;
    }
    default: { // madrugada
      const grad = g.createLinearGradient(0, 0, 0, ALTURA);
      grad.addColorStop(0, '#1E1B4B');
      grad.addColorStop(0.6, '#312E81');
      grad.addColorStop(1, '#4338CA');
      g.fillStyle = grad;
      g.fillRect(0, 0, LARGURA, ALTURA);
      g.fillStyle = '#E0E7FF';
      g.beginPath();
      g.arc(LARGURA - 70, 70, 16, 0, Math.PI * 2);
      g.fill();
      break;
    }
  }
}

// ===== Clima =====

export interface EstadoClima {
  tipo: TipoClima;
  /** Fase contínua para animação (chuva, partículas de areia, gotas). */
  fase: number;
  /** Timer de raios (0 = nenhum ativo). */
  raioTimer: number;
  /** Posição do raio (x) e seu círculo de aviso no chão. */
  raioX: number;
  avisarRaio: boolean;
}

export function criarEstadoClima(tipo: TipoClima): EstadoClima {
  return { tipo, fase: 0, raioTimer: 0, raioX: 0, avisarRaio: false };
}

export function atualizarClima(c: EstadoClima, dt: number): void {
  c.fase += dt;
  if (c.raioTimer > 0) {
    c.raioTimer -= dt;
    if (c.raioTimer <= 0) c.avisarRaio = false;
  } else if (c.tipo === 'tempestade' && Math.random() < 0.006) {
    // 1 segundo de aviso antes da queda
    c.avisarRaio = true;
    c.raioTimer = 1.0;
    c.raioX = 60 + Math.random() * (LARGURA - 120);
  }
}

/** Desenha a chuva em pixels diagonais (missão 2 — chuva fraca). */
export function desenharChuva(g: CanvasRenderingContext2D, fase: number, densidade = 0.6): void {
  g.save();
  g.strokeStyle = 'rgba(186, 222, 255, 0.55)';
  g.lineWidth = 1;
  const gotas = Math.floor(90 * densidade);
  const rng = criarAleatorio('chuva-' + Math.floor(fase * 2));
  for (let i = 0; i < gotas; i++) {
    const x = (i * 137 + fase * 260) % (LARGURA + 60) - 30;
    const y = (i * 89 + fase * 420) % (ALTURA + 80) - 40;
    g.beginPath();
    g.moveTo(x, y);
    g.lineTo(x - 4, y + 12);
    g.stroke();
  }
  g.restore();
}

/** Neblina suave — esconde só o que está a mais de 160 px. */
export function desenharNeblina(g: CanvasRenderingContext2D, heliY: number, tempo: number): void {
  // Uma faixa horizontal densa na distância (acima do helicóptero, longe dele)
  const y0 = Math.max(0, heliY - 320);
  const y1 = Math.max(0, heliY - 140);
  const grad = g.createLinearGradient(0, y0, 0, y1);
  grad.addColorStop(0, 'rgba(226,232,240,0)');
  grad.addColorStop(0.5, 'rgba(226,232,240,0.5)');
  grad.addColorStop(1, 'rgba(226,232,240,0)');
  g.fillStyle = grad;
  g.fillRect(0, y0, LARGURA, y1 - y0);

  // Cortina mais baixa com leve movimento
  g.globalAlpha = 0.25 + 0.1 * Math.sin(tempo * 0.7);
  g.fillStyle = '#E2E8F0';
  g.fillRect(0, y1, LARGURA, ALTURA - y1);
  g.globalAlpha = 1;
}

/** Tempestade de areia — partículas e contraste reduzido (missão 3). */
export function desenharTempestadeAreia(g: CanvasRenderingContext2D, fase: number): void {
  g.save();
  // Camada de tons terrosos
  g.fillStyle = 'rgba(194, 120, 3, 0.28)';
  g.fillRect(0, 0, LARGURA, ALTURA);
  // Partículas de areia diagonais
  g.fillStyle = 'rgba(231, 200, 115, 0.75)';
  const rng = criarAleatorio('areia-' + Math.floor(fase * 2));
  for (let i = 0; i < 70; i++) {
    const x = (i * 97 + fase * 340) % (LARGURA + 80) - 40;
    const y = (i * 71 + fase * 300) % (ALTURA + 80) - 40;
    g.fillRect(x, y, 3, 2);
  }
  // Rajadas horizontais ocasionais
  g.globalAlpha = 0.35 + 0.25 * Math.sin(fase * 1.8);
  g.fillStyle = '#E7C873';
  g.fillRect(0, ALTURA * 0.35 + Math.sin(fase) * 30, LARGURA, 22);
  g.globalAlpha = 1;
  g.restore();
}

/** Flash de raio + círculo de aviso no chão. */
export function desenharRaio(g: CanvasRenderingContext2D, c: EstadoClima): void {
  if (!c.avisarRaio) return;
  // Círculo de aviso no chão (1 s antes)
  g.save();
  g.strokeStyle = 'rgba(253, 224, 71, 0.9)';
  g.lineWidth = 2;
  const raio = 26 + Math.sin(c.raioTimer * 12) * 4;
  g.beginPath();
  g.arc(c.raioX, ALTURA - 30, raio, 0, Math.PI * 2);
  g.stroke();
  g.fillStyle = 'rgba(253, 224, 71, 0.22)';
  g.beginPath();
  g.arc(c.raioX, ALTURA - 30, raio, 0, Math.PI * 2);
  g.fill();
  // Flash breve na queda (quando timer cruza 0.15)
  if (c.raioTimer < 0.15) {
    g.globalAlpha = 0.55 * (0.15 - c.raioTimer) / 0.15 + 0.25;
    g.fillStyle = '#FEF9C3';
    g.fillRect(0, 0, LARGURA, ALTURA);
  }
  g.restore();
}
