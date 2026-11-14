/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CentralRadar } from './tipos';

/**
 * CENTRAL DE RADAR — chefe do setor.
 * Grande estrutura no chão no final do setor, com 3 torres de defesa que atiram em leque.
 * Precisa de 4 bombas (ou mix de tiro + bomba) para cair.
 */

export function criarCentralRadar(x: number, y: number, setor: number): CentralRadar {
  return {
    ativo: false,
    x,
    y,
    hp: 4,
    maxHp: 4,
    torres: [
      { x: x - 80, y: y + 20, timer: 0.8 },
      { x, y: y + 34, timer: 1.4 },
      { x: x + 80, y: y + 20, timer: 2.0 },
    ],
    giro: 0,
  };
}

/** Atualiza a antena giratória e o timer das torres. */
export function atualizarCentralRadar(radar: CentralRadar, dt: number): void {
  radar.giro += dt * 1.6;
  for (const torre of radar.torres) {
    torre.timer = Math.max(0, torre.timer - dt);
  }
}

/** Desenha a central de radar e suas Torres de defesa. */
export function desenharCentralRadar(
  g: CanvasRenderingContext2D,
  radar: CentralRadar,
  tempo: number
): void {
  if (!radar.ativo) return;
  const { x, y } = radar;

  // Base de concreto
  g.fillStyle = '#57534E';
  g.fillRect(x - 110, y + 30, 220, 18);
  g.fillStyle = '#44403C';
  g.fillRect(x - 110, y + 42, 220, 6);

  // Torre principal
  g.fillStyle = '#78716C';
  g.fillRect(x - 34, y - 30, 68, 64);
  g.fillStyle = '#57534E';
  g.fillRect(x - 34, y + 14, 68, 20);

  // Estrutura da antena giratória
  g.save();
  g.translate(x, y - 12);
  g.rotate(radar.giro);
  g.fillStyle = '#A8A29E';
  g.fillRect(-4, -42, 8, 36);
  // Prato do radar (elipse)
  g.rotate(-radar.giro); // desenha o prato sempre horizontal
  g.fillStyle = '#D6D3D1';
  g.beginPath();
  g.ellipse(0, -40, 30, 12, 0, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = '#F5F5F4';
  g.beginPath();
  g.ellipse(0, -40, 30, 6, 0, 0, Math.PI * 2);
  g.fill();
  // Luz vermelha piscante
  const brilho = Math.floor(tempo * 4) % 2 === 0;
  g.fillStyle = brilho ? '#EF4444' : '#7F1D1D';
  g.beginPath();
  g.arc(0, -44, 5, 0, Math.PI * 2);
  g.fill();
  g.restore();

  // 3 Torres de defesa (leque)
  for (const torre of radar.torres) {
    g.save();
    g.translate(torre.x, torre.y);
    g.fillStyle = '#78716C';
    g.fillRect(-10, -14, 20, 18);
    g.fillStyle = '#44403C';
    g.fillRect(-10, -6, 20, 8);
    g.fillStyle = '#292524';
    g.fillRect(-3, -20, 6, 8);
    // Canhão apontado para cima
    g.beginPath();
    g.arc(0, -20, 7, Math.PI, 0);
    g.fill();
    g.restore();
  }

  // Barra de vida da central
  const largura = 160;
  const preenchidos = Math.max(0, radar.hp / radar.maxHp);
  g.fillStyle = 'rgba(0,0,0,0.6)';
  g.fillRect(x - largura / 2, y - 60, largura, 8);
  g.fillStyle = '#EF4444';
  g.fillRect(x - largura / 2 + 1, y - 59, (largura - 2) * preenchidos, 6);
}
