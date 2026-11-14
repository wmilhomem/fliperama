/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AlvoSolo, Lancha, TorreAntiaerea, Caminhao, Bunker } from './tipos';

/**
 * ALVOS DE SOLO — torres antiaéreas, caminhões de munição, bunkers e lanchas.
 */

export function criarTorre(x: number, y: number): TorreAntiaerea {
  return { tipo: 'torre', x, y, timer: 1.5 + Math.random() * 1.5, vida: 1 };
}

export function criarCaminhao(x: number, y: number, vx: number): Caminhao {
  return { tipo: 'caminhao', x, y, vx, vida: 1 };
}

export function criarBunker(x: number, y: number): Bunker {
  return { tipo: 'bunker', x, y, acertos: 0 };
}

export function criarLancha(x: number, y: number, vx: number): Lancha {
  return { tipo: 'lancha', x, y, vx, vida: 1 };
}

export function atualizarAlvoSolo(alvo: AlvoSolo, dt: number, largura: number): void {
  if (alvo.tipo === 'caminhao' || alvo.tipo === 'lancha') {
    alvo.x += alvo.vx * dt;
    // Inverte as bordas para ficar na tela
    if (alvo.x < 10 && alvo.vx < 0) alvo.vx = -alvo.vx;
    if (alvo.x > largura - 10 && alvo.vx > 0) alvo.vx = -alvo.vx;
  }
  if (alvo.tipo === 'torre') {
    alvo.timer -= dt;
    if (alvo.timer <= 0) alvo.timer = 0; // o jogo principal lida com o tiro e reseta
  }
}

export function desenharAlvoSolo(
  g: CanvasRenderingContext2D,
  alvo: AlvoSolo,
  tempo: number
): void {
  switch (alvo.tipo) {
    case 'torre': {
      g.save();
      g.translate(alvo.x, alvo.y);
      // Base
      g.fillStyle = '#57534E';
      g.fillRect(-9, 8, 18, 8);
      g.fillRect(-6, -2, 12, 12);
      // Canhão giratório
      g.fillStyle = '#292524';
      g.fillRect(-2, -10, 4, 10);
      g.fillStyle = '#44403C';
      g.fillRect(-5, -12, 10, 4);
      // Luz vermelha pulsante
      const brilho = 0.5 + 0.5 * Math.sin(tempo * 6);
      g.fillStyle = `rgba(239, 68, 68, ${brilho})`;
      g.beginPath();
      g.arc(0, -12, 2.4, 0, Math.PI * 2);
      g.fill();
      g.restore();
      break;
    }
    case 'caminhao': {
      g.save();
      g.translate(alvo.x, alvo.y);
      const dir = alvo.vx >= 0 ? 1 : -1;
      g.scale(dir, 1);
      // Caçamba
      g.fillStyle = '#166534';
      g.fillRect(-14, -6, 24, 10);
      g.fillStyle = '#14532D';
      g.fillRect(-14, 2, 24, 3);
      // Cabine
      g.fillStyle = '#15803D';
      g.fillRect(10, -8, 8, 12);
      // Rodas
      g.fillStyle = '#1E293B';
      g.fillRect(-12, 4, 6, 5);
      g.fillRect(-2, 4, 6, 5);
      g.fillRect(10, 4, 5, 5);
      // Munição
      g.fillStyle = '#FDE047';
      g.fillRect(-12, -9, 6, 3);
      g.fillRect(-2, -9, 6, 3);
      g.restore();
      break;
    }
    case 'bunker': {
      g.save();
      g.translate(alvo.x, alvo.y);
      // Domo de concreto
      g.fillStyle = '#78716C';
      g.beginPath();
      g.ellipse(0, 2, 20, 12, 0, Math.PI, Math.PI * 2);
      g.fill();
      g.fillRect(-20, 0, 40, 6);
      // Fenda de tiro
      g.fillStyle = '#1C1917';
      g.fillRect(-10, -6, 20, 4);
      g.restore();
      break;
    }
    case 'lancha': {
      g.save();
      g.translate(alvo.x, alvo.y);
      const dir = alvo.vx >= 0 ? 1 : -1;
      g.scale(dir, 1);
      // Casco
      g.fillStyle = '#F8FAFC';
      g.beginPath();
      g.moveTo(-16, 0);
      g.lineTo(14, 0);
      g.lineTo(19, -7);
      g.lineTo(-12, -7);
      g.closePath();
      g.fill();
      g.fillStyle = '#334155';
      g.fillRect(-16, 0, 34, 3);
      // Torreta
      g.fillStyle = '#475569';
      g.fillRect(-4, -11, 8, 5);
      g.restore();
      break;
    }
  }
}
