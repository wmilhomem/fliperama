/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * HUD do jogo "Submarino Abissal".
 *
 * Complementa o HUD padrão do motor (pontuação, recorde, vidas e fase)
 * com a barra de oxigênio e os ícones de náufragos a bordo.
 */

import { LIMITE_ALARME, MAX_MERGULHADORES, OXIGENIO_MAXIMO } from './constantes';

export interface EstadoHudAbissal {
  oxigenio: number;
  aBordo: number;
  tempo: number;
}

/** Desenha a barra de oxigênio e o contador de náufragos. */
export function desenharHudAbissal(
  g: CanvasRenderingContext2D,
  estado: EstadoHudAbissal
): void {
  g.save();
  g.font = '8px "Press Start 2P", monospace';
  g.textBaseline = 'middle';

  // --- Náufragos a bordo (ícones + contador) ---
  for (let i = 0; i < MAX_MERGULHADORES; i++) {
    const x = 68 + i * 14;
    const cheio = i < estado.aBordo;
    g.fillStyle = cheio ? '#E2E8F0' : 'rgba(148, 163, 184, 0.28)';
    g.fillRect(x, 36, 8, 11);
    g.fillStyle = cheio ? '#38BDF8' : 'rgba(56, 189, 248, 0.25)';
    g.fillRect(x + 1, 38, 6, 4);
  }

  g.textAlign = 'left';
  g.fillStyle = '#7DD3FC';
  g.fillText(`${estado.aBordo}/${MAX_MERGULHADORES}`, 156, 42);

  // --- Barra de oxigênio ---
  const barraX = 246;
  const barraY = 37;
  const barraL = 140;
  const barraA = 10;

  g.fillStyle = '#0B1220';
  g.fillRect(barraX - 2, barraY - 2, barraL + 4, barraA + 4);
  g.fillStyle = '#1E293B';
  g.fillRect(barraX, barraY, barraL, barraA);

  const proporcao = Math.max(0, Math.min(1, estado.oxigenio / OXIGENIO_MAXIMO));
  const baixo = estado.oxigenio <= LIMITE_ALARME && estado.oxigenio > 0;
  const pisca = baixo && Math.floor(estado.tempo * 6) % 2 === 0;

  if (proporcao > 0) {
    g.fillStyle = baixo ? (pisca ? '#EF4444' : '#7F1D1D') : '#22D3EE';
    g.fillRect(barraX, barraY, Math.round(barraL * proporcao), barraA);
    g.fillStyle = 'rgba(255,255,255,0.35)';
    g.fillRect(barraX, barraY, Math.round(barraL * proporcao), 3);
  }

  g.strokeStyle = 'rgba(148, 163, 184, 0.6)';
  g.lineWidth = 1;
  g.strokeRect(barraX - 0.5, barraY - 0.5, barraL + 1, barraA + 1);

  g.textAlign = 'right';
  g.fillStyle = baixo ? '#FCA5A5' : '#7DD3FC';
  g.fillText('O2', barraX - 6, barraY + barraA / 2);

  g.textAlign = 'left';
  g.fillText(`${Math.ceil(estado.oxigenio)}%`, barraX + barraL + 6, barraY + barraA / 2);

  g.restore();
}
