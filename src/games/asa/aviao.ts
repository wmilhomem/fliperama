/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { JOGADOR_ALTURA, JOGADOR_LARGURA } from './constantes';
import { Aviao } from './tipos';

/**
 * AVIÃO DO JOGADOR — caça leve de asa baixa, hélice animada e faixa laranja.
 * Olhando o desenho de cima, o nariz aponta para cima (o avião avança).
 */

export function criarAviao(x: number, y: number): Aviao {
  return {
    x,
    y,
    velocidadeX: 0,
    inclinacao: 0,
    helice: 0,
    cooldown: 0,
    cooldownBomba: 0,
    invulneravel: 0,
  };
}

export function desenharAviao(
  g: CanvasRenderingContext2D,
  aviao: Aviao,
  tempo: number
): void {
  const incl = aviao.inclinacao;
  const blink = aviao.invulneravel > 0 && Math.floor(tempo * 10) % 2 === 0;
  if (blink) g.globalAlpha = 0.35;

  g.save();
  g.translate(aviao.x, aviao.y);
  g.rotate(incl * 0.35);

  // Sombra projetada no chão
  g.fillStyle = 'rgba(0,0,0,0.28)';
  g.beginPath();
  g.ellipse(4, 46, 22, 7, 0, 0, Math.PI * 2);
  g.fill();

  // ===== Caça Lia "Asa" Duarte — pixel art original =====
  // Corpo principal (fuselagem)
  g.fillStyle = '#E2E8F0';
  g.fillRect(-6, -16, 12, 30);

  // Nariz com hélice
  g.fillStyle = '#F97316';
  g.fillRect(-4, -20, 8, 6);

  // Caixa da hélice / cubo
  g.fillStyle = '#475569';
  g.fillRect(-2, -24, 4, 4);

  // Hélice animada (2 quadros)
  const héliceQuadro = Math.floor(aviao.helice) % 2;
  g.fillStyle = '#1E293B';
  if (héliceQuadro === 0) {
    g.fillRect(-14, -25, 28, 2);
  } else {
    g.fillRect(-2, -30, 4, 12);
  }

  // Cockpit
  g.fillStyle = '#38BDF8';
  g.fillRect(-4, -10, 8, 6);
  g.fillStyle = '#E0F2FE';
  g.fillRect(-4, -10, 8, 2);

  // Asas (asa baixa) com faixas laranjas
  g.fillStyle = '#CBD5F5';
  g.fillRect(-18, -2, 36, 5);
  g.fillStyle = '#F97316';
  g.fillRect(-18, -2, 5, 5);
  g.fillRect(13, -2, 5, 5);

  // Estabilizadores (cauda dupla)
  g.fillStyle = '#CBD5F5';
  g.fillRect(-10, 12, 7, 5);
  g.fillRect(3, 12, 7, 5);
  g.fillStyle = '#F97316';
  g.fillRect(-10, 12, 7, 2);
  g.fillRect(3, 12, 7, 2);

  // Cauda vertical dupla
  g.fillStyle = '#E2E8F0';
  g.fillRect(-8, 14, 4, 4);
  g.fillRect(4, 14, 4, 4);

  // Motor de hélice (faixa)
  g.fillStyle = '#F97316';
  g.fillRect(-7, 2, 14, 3);

  g.restore();
  g.globalAlpha = 1;
}
