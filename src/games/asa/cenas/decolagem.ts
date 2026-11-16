/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/** Cena de decolagem — heliponto da base, rotor acelera, o helicóptero sobe. */

import { LARGURA, ALTURA } from '../config';
import { desenharHelicoptero, criarHelicoptero } from '../helicoptero';

export interface CenaDecolagem {
  progresso: number;
  atualizar: (dt: number) => boolean;
  desenhar: (g: CanvasRenderingContext2D, tempo: number) => void;
}

export function criarCenaDecolagem(tempoTotal = 4.5): CenaDecolagem {
  let tempo = 0;
  const heli = criarHelicoptero(LARGURA / 2, ALTURA - 80);
  heli.rotor = 0;

  return {
    progresso: 0,

    atualizar(dt: number): boolean {
      tempo += dt;
      // O rotor acelera progressivamente
      heli.rotor = (heli.rotor + dt * (2 + tempo * 6)) % 2;
      // Depois de ~2s o helicóptero sobe
      const subida = Math.max(0, Math.min(1, (tempo - 2) / (tempoTotal - 2)));
      heli.y = ALTURA - 80 - subida * 250;
      heli.inclinacao = Math.sin(tempo * 2) * 0.03;
      this.progresso = Math.min(1, tempo / tempoTotal);
      return this.progresso >= 1 || tempo >= tempoTotal;
    },

    desenhar(g: CanvasRenderingContext2D, tempo: number): void {
      // Céu de manhã
      const grad = g.createLinearGradient(0, 0, 0, ALTURA);
      grad.addColorStop(0, '#7DD3FC');
      grad.addColorStop(1, '#E0F2FE');
      g.fillStyle = grad;
      g.fillRect(0, 0, LARGURA, ALTURA);

      // Sol
      g.fillStyle = '#FEF9C3';
      g.beginPath();
      g.arc(LARGURA - 72, 60, 22, 0, Math.PI * 2);
      g.fill();

      // Mar na lateral direita (base costeira)
      g.fillStyle = '#38BDF8';
      g.fillRect(LARGURA - 70, 0, 70, ALTURA);
      g.strokeStyle = 'rgba(255,255,255,0.8)';
      for (let i = 0; i < 6; i++) {
        const y = ((i * 80 + tempo * 30) % (ALTURA + 80)) - 40;
        g.beginPath();
        for (let x = LARGURA - 70; x <= LARGURA; x += 8) {
          const yy = y + Math.sin(x * 0.3 + tempo * 3) * 2;
          if (x === LARGURA - 70) g.moveTo(x, yy);
          else g.lineTo(x, yy);
        }
        g.stroke();
      }

      // Areia da base
      g.fillStyle = '#FDE68A';
      g.fillRect(0, 0, LARGURA - 70, ALTURA);

      // Torre de controle (esquerda)
      g.fillStyle = '#57534E';
      g.fillRect(40, 120, 34, 190);
      g.fillStyle = '#78716C';
      g.fillRect(34, 110, 46, 16);
      g.fillStyle = '#7DD3FC';
      g.fillRect(46, 130, 22, 14);
      g.fillStyle = '#38BDF8';
      g.fillRect(46, 134, 22, 4);

      // Hangar (centro-esquerda)
      g.fillStyle = '#1F2937';
      g.fillRect(20, 330, 120, 90);
      g.fillStyle = '#111827';
      for (let x = 24; x < 136; x += 22) {
        g.fillRect(x, 340, 10, 70);
      }
      g.fillStyle = '#374151';
      g.fillRect(20, 330, 120, 8);

      // Heliponto (centro-direita): círculo pintado + letra H
      const hx = LARGURA / 2 + 60;
      const hy = ALTURA - 80;
      g.strokeStyle = '#FFFFFF';
      g.lineWidth = 5;
      g.beginPath();
      g.arc(hx, hy, 44, 0, Math.PI * 2);
      g.stroke();
      // Letra H
      g.fillStyle = '#FFFFFF';
      g.fillRect(hx - 14, hy - 20, 6, 40);
      g.fillRect(hx + 8, hy - 20, 6, 40);
      g.fillRect(hx - 14, hy - 2, 28, 6);

      // Partículas de poeira em volta do rotor (quando o rotor acelera)
      const poeira = Math.min(1, tempo / 2);
      if (poeira > 0.25) {
        g.globalAlpha = poeira * 0.7;
        g.fillStyle = '#E7C873';
        for (let i = 0; i < 10; i++) {
          const ang = (i / 10) * Math.PI * 2 + tempo * 2;
          const r = 20 + ((tempo * 60 + i * 11) % 34);
          g.fillRect(hx + Math.cos(ang) * r, hy + Math.sin(ang) * r, 3, 3);
        }
        g.globalAlpha = 1;
      }

      // Sombra/baixo do helicóptero que se afasta à medida que sobe
      const altura = Math.max(0, Math.min(1, (tempo - 2) / (tempoTotal - 2)));
      const sombraW = 46 * (1 - altura * 0.6);
      g.fillStyle = `rgba(0,0,0,${0.32 - altura * 0.2})`;
      g.fillRect(hx - sombraW / 2, hy - 8, sombraW, 5);

      // Helicóptero
      desenharHelicoptero(g, heli, false);

      // Texto
      g.textAlign = 'center';
      g.font = '9px "Press Start 2P", monospace';
      if (tempo < 1.4) {
        g.fillStyle = '#0F172A';
        g.fillText('TORRES, ROTOR...', LARGURA / 2, 44);
      } else if (tempo < 2.6) {
        g.fillStyle = '#0F172A';
        g.fillText('ACELERANDO O ROTOR...', LARGURA / 2, 44);
      } else {
        g.fillStyle = '#0F172A';
        g.fillText('DECOLANDO!', LARGURA / 2, 44);
      }

      g.font = '6px "Press Start 2P", monospace';
      g.globalAlpha = 0.65 + Math.sin(tempo * 4) * 0.3;
      g.fillStyle = '#1F2937';
      g.fillText('PRESSIONE A��O / TOQUE PARA PULAR', LARGURA / 2, ALTURA - 20);
      g.globalAlpha = 1;
    },
  };
}
