/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/** Cena de pouso — aproximação, toque no heliponto, equipe de recepção. */

import { LARGURA, ALTURA } from '../config';
import { criarHelicoptero, desenharHelicoptero } from '../helicoptero';

export interface CenaPouso {
  progresso: number;
  atualizar: (dt: number) => boolean;
  desenhar: (g: CanvasRenderingContext2D, tempo: number) => void;
}

export function criarCenaPouso(tempoTotal = 8): CenaPouso {
  let tempo = 0;
  const heli = criarHelicoptero(LARGURA / 2, -60);
  heli.rotor = 6; // rotor já acelerado (girou no percurso)

  return {
    progresso: 0,

    atualizar(dt: number): boolean {
      tempo += dt;
      // Aproximação → descida → toque
      const faseAproac = Math.min(1, tempo / (tempoTotal * 0.38));
      const faseDescida = Math.min(1, Math.max(0, (tempo - tempoTotal * 0.38) / (tempoTotal * 0.3)));
      const faseRepouso = Math.min(1, Math.max(0, (tempo - tempoTotal * 0.68) / (tempoTotal * 0.32)));

      // Helicóptero desce pela tela até o heliponto
      const heliY = -60 + faseAdequacaoY(faseAproac, faseDescida);
      heli.y = heliY;
      heli.x = LARGURA / 2;
      heli.inclinacao = Math.sin(tempo * 1.8) * 0.02;

      // Rotor desacelera depois do toque
      const rotorAlvo = faseRepouso > 0 ? 0.4 : 1.6;
      heli.rotor = (heli.rotor + dt * (16 * (1 - faseRepouso * 0.85) + rotorAlvo * 0.1)) % 2;

      this.progresso = Math.min(1, tempo / tempoTotal);
      return this.progresso >= 1;
    },

    desenhar(g: CanvasRenderingContext2D, tempo: number): void {
      // Céu de manhã claro
      const grad = g.createLinearGradient(0, 0, 0, ALTURA);
      grad.addColorStop(0, '#7DD3FC');
      grad.addColorStop(1, '#E0F2FE');
      g.fillStyle = grad;
      g.fillRect(0, 0, LARGURA, ALTURA);

      // Sol
      g.fillStyle = '#FEF9C3';
      g.beginPath();
      g.arc(LARGURA - 72, 56, 22, 0, Math.PI * 2);
      g.fill();

      // Faixa de areia da base (embaixo)
      g.fillStyle = '#FDE68A';
      g.fillRect(0, ALTURA - 150, LARGURA, 150);

      // Heliponto (centro-direita)
      const hx = LARGURA / 2 + 30;
      const hy = ALTURA - 60;
      g.strokeStyle = '#FFFFFF';
      g.lineWidth = 5;
      g.beginPath();
      g.arc(hx, hy, 42, 0, Math.PI * 2);
      g.stroke();
      g.fillStyle = '#FFFFFF';
      g.fillRect(hx - 12, hy - 17, 5, 34);
      g.fillRect(hx + 7, hy - 17, 5, 34);
      g.fillRect(hx - 12, hy - 2, 24, 5);

      // Hangar (esquerda)
      g.fillStyle = '#1F2937';
      g.fillRect(14, ALTURA - 120, 110, 66);
      g.fillStyle = '#111827';
      for (let x = 18; x < 122; x += 18) {
        g.fillRect(x, ALTURA - 112, 8, 52);
      }

      // Torre de controle (direita)
      g.fillStyle = '#57534E';
      g.fillRect(LARGURA - 56, ALTURA - 190, 30, 140);
      g.fillStyle = '#78716C';
      g.fillRect(LARGURA - 62, ALTURA - 200, 42, 14);
      g.fillStyle = '#7DD3FC';
      g.fillRect(LARGURA - 50, ALTURA - 176, 18, 12);

      // Sombra do helicóptero (fica no heliponto)
      const altura = 1 - Math.max(0, Math.min(1, (heli.y + 60) / (ALTURA - 20)));
      const sombraW = 44 * (0.35 + altura * 0.65);
      g.fillStyle = `rgba(0,0,0,${0.32 - altura * 0.18})`;
      g.fillRect(hx - sombraW / 2, hy - 6, sombraW, 5);

      // Bandeira (à esquerda do heliponto)
      const mastro = ALTURA - 34;
      g.fillStyle = '#1F2937';
      g.fillRect(hx - 130, mastro - 66, 3, 62);
      const ventoBandeira = Math.sin(tempo * 3.5) * 3;
      g.fillStyle = '#22C55E';
      g.fillRect(hx - 127, mastro - 66, 34 + ventoBandeira, 12);
      g.fillStyle = '#FDE047';
      g.fillRect(hx - 127, mastro - 55, 34 + ventoBandeira, 4);

      // Equipe de recepção (3 personagens originais, acenando)
      const rx = hx + 90;
      const ry = ALTURA - 42;
      const aceno = Math.floor(tempo * 3) % 2 === 0;
      desenharMembro(g, rx, ry, '#FBBF24', aceno); // bombeiro
      desenharMembro(g, rx + 28, ry + 4, '#22D3EE', !aceno); // maratonista
      desenharMembro(g, rx + 56, ry, '#F472B6', aceno); // paramédica

      // Faixa "MISSÃO CUMPRIDA"
      if (tempo > tempoTotal * 0.62) {
        const rise = Math.min(1, (tempo - tempoTotal * 0.62) / (tempoTotal * 0.2));
        const y = ALTURA - 34 - rise * 26;
        g.fillStyle = '#FDE047';
        g.fillRect(LARGURA / 2 - 120, y - 16, 240, 24);
        g.fillStyle = '#1F2937';
        g.font = '9px "Press Start 2P", monospace';
        g.textAlign = 'center';
        g.fillText('MISSÃO CUMPRIDA', LARGURA / 2, y + 1);
      }

      // Helicóptero (por cima de tudo)
      desenharHelicoptero(g, heli, false);

      // Texto de progresso
      g.font = '7px "Press Start 2P", monospace';
      g.textAlign = 'center';
      if (tempo < tempoTotal * 0.38) {
        g.fillStyle = '#0F172A';
        g.fillText('APROXIMANDO DA BASE...', LARGURA / 2, 34);
      } else if (tempo < tempoTotal * 0.68) {
        g.fillStyle = '#0F172A';
        g.fillText('DESCENDO PARA O HELIPONTO...', LARGURA / 2, 34);
      } else {
        g.fillStyle = '#0F172A';
        g.fillText('RECEPÇÃO NA BASE!', LARGURA / 2, 34);
      }

      g.globalAlpha = 0.65 + Math.sin(tempo * 4) * 0.3;
      g.fillStyle = '#1F2937';
      g.fillText('PRESSIONE AÇÃO / TOQUE PARA PULAR', LARGURA / 2, ALTURA - 10);
      g.globalAlpha = 1;
    },
  };
}

function faseAdequacaoY(a: number, d: number): number {
  // Combina aproximação horizontal e descida vertical
  const baseY = -60 + (ALTURA - 90 + 60) * a;
  const extra = d * (ALTURA - 80) * 0.35;
  return Math.min(ALTURA - 92, baseY + extra);
}

function desenharMembro(
  g: CanvasRenderingContext2D,
  x: number,
  y: number,
  cor: string,
  aceno: boolean
): void {
  // Pernas
  g.fillStyle = '#1F2937';
  g.fillRect(x - 4, y + 8, 3, 8);
  g.fillRect(x + 1, y + 8, 3, 8);
  // Tronco
  g.fillStyle = cor;
  g.fillRect(x - 5, y - 4, 10, 12);
  // Cabeça
  g.fillStyle = '#F2B07A';
  g.fillRect(x - 3, y - 10, 6, 6);
  // Capacete/boné
  g.fillStyle = cor;
  g.fillRect(x - 4, y - 12, 8, 3);
  // Braços — um acenando
  g.fillStyle = '#F2B07A';
  if (aceno) {
    g.fillRect(x - 8, y - 2, 4, 6);
    g.save();
    g.translate(x + 5, y - 2);
    g.rotate(-0.6 + Math.sin(y * 0.01 + x) * 0.15);
    g.fillRect(0, 0, 4, 7);
    g.restore();
  } else {
    g.fillRect(x - 8, y - 1, 4, 6);
    g.fillRect(x + 4, y - 1, 4, 6);
  }
}
