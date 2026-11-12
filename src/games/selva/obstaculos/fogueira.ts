/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Explorador, FogueiraObstaculo } from '../tipos';

export function colideFogueira(
  jogador: Explorador,
  fogueira: FogueiraObstaculo
): boolean {
  const esquerda = jogador.x - 5;
  const direita = jogador.x + 5;
  const topo = jogador.y - 17;

  return (
    direita > fogueira.x &&
    esquerda < fogueira.x + fogueira.largura &&
    jogador.y > fogueira.y - 3 &&
    topo < fogueira.y + fogueira.altura
  );
}

export function desenharFogueira(
  g: CanvasRenderingContext2D,
  fogueira: FogueiraObstaculo,
  tempo: number
): void {
  const x = Math.round(fogueira.x);
  const y = fogueira.y;
  const tremor = Math.sin(tempo * 9 + fogueira.fase) * 2;
  const alturaFogo = 10 + Math.round(Math.sin(tempo * 7 + fogueira.fase) * 3);

  g.fillStyle = '#4A2C16';
  g.fillRect(x, y + 8, fogueira.largura, 3);
  g.fillStyle = '#7C4A22';
  g.fillRect(x + 1, y + 7, fogueira.largura - 2, 2);
  g.fillStyle = '#2B1B0E';
  g.fillRect(x + 3, y + 9, 3, 2);
  g.fillRect(x + fogueira.largura - 6, y + 9, 3, 2);

  g.fillStyle = '#B91C1C';
  g.fillRect(x + 3 + tremor, y + 8 - alturaFogo, fogueira.largura - 6, alturaFogo);
  g.fillStyle = '#F97316';
  g.fillRect(x + 5 - tremor, y + 9 - alturaFogo + 2, fogueira.largura - 10, alturaFogo - 2);
  g.fillStyle = '#FDE047';
  g.fillRect(x + 8 + tremor, y + 9 - alturaFogo + 5, 4, Math.max(2, alturaFogo - 5));
  g.fillStyle = '#FFF7C2';
  g.fillRect(x + 9, y + 10 - alturaFogo + 7, 2, 2);

  g.fillStyle = 'rgba(249, 115, 22, 0.22)';
  g.fillRect(x - 5, y - 2, fogueira.largura + 10, 16);
}
