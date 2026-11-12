/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CORES, LAND_Y, LARGURA } from './constantes';
import { Jogador, Onca } from './tipos';

export function minimoTabuasOnca(fase: number): number {
  return Math.max(2, 4 - Math.floor((fase - 1) / 2));
}

export function criarOnca(): Onca {
  return {
    x: 430,
    y: LAND_Y,
    velocidade: 26,
    direcao: -1,
    largura: 42,
    altura: 26,
    ativa: false,
    tempo: 0,
    rugiu: false,
  };
}

export function reiniciarOnca(onca: Onca): void {
  onca.x = 430;
  onca.y = LAND_Y;
  onca.direcao = -1;
  onca.ativa = false;
  onca.tempo = 0;
  onca.rugiu = false;
}

export function atualizarOnca(
  onca: Onca,
  jogador: Jogador,
  dt: number,
  ativa: boolean,
  fase: number
): void {
  onca.ativa = ativa;
  if (!ativa) return;

  onca.tempo += dt;
  onca.velocidade = 20 + fase * 2.5;

  if (jogador.fileira === -1) {
    const distancia = jogador.x - onca.x;
    onca.direcao = distancia < 0 ? -1 : 1;
    onca.x += onca.direcao * onca.velocidade * dt;
  } else {
    onca.x += onca.direcao * onca.velocidade * 0.35 * dt;
  }

  if (onca.x < 56) {
    onca.x = 56;
    onca.direcao = 1;
  } else if (onca.x > LARGURA - 56) {
    onca.x = LARGURA - 56;
    onca.direcao = -1;
  }
}

export function desenharOnca(
  g: CanvasRenderingContext2D,
  onca: Onca
): void {
  if (!onca.ativa) return;

  const x = Math.floor(onca.x);
  const y = Math.floor(onca.y);
  const passo = Math.floor(onca.tempo * 8) % 2 === 0;

  g.save();
  g.translate(x, y - 30);
  if (onca.direcao < 0) {
    g.scale(-1, 1);
  }

  g.fillStyle = 'rgba(31, 41, 55, 0.3)';
  g.fillRect(-24, 28, 52, 4);

  g.fillStyle = CORES.oncaEscura;
  g.fillRect(-28, 8, 10, 4);
  g.fillRect(-32, 4, 8, 4);
  g.fillRect(-30, 0, 5, 4);

  g.fillStyle = CORES.onca;
  g.fillRect(-22, 6, 38, 18);
  g.fillRect(-18, 2, 30, 24);
  g.fillStyle = CORES.oncaClara;
  g.fillRect(-16, 8, 24, 10);

  g.fillStyle = CORES.onca;
  g.fillRect(10, 2, 18, 18);
  g.fillRect(14, -4, 12, 8);
  g.fillStyle = CORES.oncaClara;
  g.fillRect(14, 6, 12, 8);

  g.fillStyle = CORES.oncaEscura;
  g.fillRect(10, -6, 5, 6);
  g.fillRect(22, -6, 5, 6);
  g.fillRect(30, 8, 4, 4);
  g.fillStyle = '#1F2937';
  g.fillRect(24, 6, 2, 2);
  g.fillRect(18, 6, 2, 2);
  g.fillStyle = '#FFF7ED';
  g.fillRect(26, 12, 5, 3);
  g.fillStyle = CORES.rosaEscuro;
  g.fillRect(29, 12, 2, 2);

  g.fillStyle = '#78350F';
  g.fillRect(-18, 22, 6, 8);
  g.fillRect(4, 22, 6, 8);
  g.fillRect(-8, 22, 6, 8);
  g.fillRect(12, 22, 6, 8);

  if (passo) {
    g.fillRect(-20, 22, 5, 8);
    g.fillRect(2, 22, 5, 8);
  } else {
    g.fillRect(-14, 22, 5, 8);
    g.fillRect(8, 22, 5, 8);
  }

  g.fillStyle = CORES.oncaEscura;
  g.fillRect(-16, 8, 5, 4);
  g.fillRect(-4, 12, 6, 4);
  g.fillRect(4, 6, 4, 4);
  g.fillRect(-10, 18, 4, 3);
  g.fillRect(0, 4, 4, 3);

  g.restore();
}
