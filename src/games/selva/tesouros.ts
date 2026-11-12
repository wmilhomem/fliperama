/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AudioPreset } from '../../engine/types';
import { Explorador, Tesouro, TipoTesouro } from './tipos';

const CORES: Record<TipoTesouro, string> = {
  bau: '#F59E0B',
  barra: '#FDE047',
  anel: '#FACC15',
  diamante: '#67E8F9',
  pulseira: '#FB923C',
};

const SONS: Record<TipoTesouro, AudioPreset> = {
  bau: 'item',
  barra: 'moeda',
  anel: 'cristal',
  diamante: 'cristal',
  pulseira: 'fruta',
};

export function corTesouro(tipo: TipoTesouro): string {
  return CORES[tipo];
}

export function somTesouro(tipo: TipoTesouro): AudioPreset {
  return SONS[tipo];
}

export function coletaTesouro(jogador: Explorador, tesouro: Tesouro): boolean {
  return (
    jogador.x + 6 > tesouro.x - 8 &&
    jogador.x - 6 < tesouro.x + 8 &&
    jogador.y > tesouro.y - 9 &&
    jogador.y - 18 < tesouro.y + 9
  );
}

export function desenharTesouros(
  g: CanvasRenderingContext2D,
  tesouros: Tesouro[],
  tempo: number
): void {
  for (const tesouro of tesouros) {
    const flutua = Math.round(Math.sin(tempo * 3 + tesouro.tela) * 1.5);
    const x = Math.round(tesouro.x);
    const y = Math.round(tesouro.y) + flutua;
    const brilho = Math.floor(tempo * 7 + tesouro.tela) % 3;

    g.fillStyle = 'rgba(250, 204, 21, 0.16)';
    g.fillRect(x - 9, y - 9, 18, 18);

    desenharTesouro(g, tesouro.tipo, x, y);

    if (brilho === 0) {
      g.fillStyle = '#FFFFFF';
      g.fillRect(x - 8, y - 8, 1, 1);
      g.fillRect(x + 7, y - 5, 1, 1);
    } else if (brilho === 1) {
      g.fillStyle = '#FEF9C3';
      g.fillRect(x + 6, y - 8, 1, 1);
    }
  }
}

export function desenharTesouro(
  g: CanvasRenderingContext2D,
  tipo: TipoTesouro,
  x: number,
  y: number
): void {
  switch (tipo) {
    case 'bau':
      g.fillStyle = '#7C3F1D';
      g.fillRect(x - 6, y - 4, 13, 8);
      g.fillStyle = '#B45309';
      g.fillRect(x - 7, y - 7, 15, 4);
      g.fillStyle = '#FBBF24';
      g.fillRect(x - 7, y - 4, 15, 1);
      g.fillRect(x - 1, y - 3, 2, 5);
      g.fillStyle = '#FDE68A';
      g.fillRect(x, y - 2, 1, 2);
      g.fillStyle = '#FCD34D';
      g.fillRect(x - 9, y - 8, 2, 2);
      g.fillRect(x + 8, y - 2, 2, 2);
      break;

    case 'barra':
      g.fillStyle = '#B45309';
      g.fillRect(x - 7, y + 1, 14, 5);
      g.fillStyle = '#FDE047';
      g.fillRect(x - 6, y - 2, 13, 4);
      g.fillStyle = '#FEF9C3';
      g.fillRect(x - 4, y - 2, 6, 1);
      g.fillStyle = '#A16207';
      g.fillRect(x - 2, y + 1, 6, 1);
      break;

    case 'anel':
      g.fillStyle = '#B45309';
      g.fillRect(x - 4, y - 3, 9, 7);
      g.fillStyle = '#FACC15';
      g.fillRect(x - 3, y - 4, 7, 2);
      g.fillRect(x - 5, y - 2, 2, 4);
      g.fillRect(x + 4, y - 2, 2, 4);
      g.fillRect(x - 2, y + 3, 5, 2);
      g.fillStyle = '#FEF9C3';
      g.fillRect(x - 1, y - 6, 3, 2);
      break;

    case 'diamante':
      g.fillStyle = '#0891B2';
      g.fillRect(x - 4, y - 2, 9, 5);
      g.fillRect(x - 2, y + 3, 5, 2);
      g.fillStyle = '#67E8F9';
      g.fillRect(x - 3, y - 4, 7, 4);
      g.fillRect(x - 5, y - 1, 3, 4);
      g.fillRect(x + 3, y - 1, 3, 4);
      g.fillStyle = '#ECFEFF';
      g.fillRect(x - 2, y - 5, 4, 2);
      g.fillRect(x - 3, y - 3, 3, 2);
      break;

    case 'pulseira':
      g.fillStyle = '#9A3412';
      g.fillRect(x - 5, y - 4, 11, 7);
      g.fillStyle = '#FB923C';
      g.fillRect(x - 6, y - 5, 3, 3);
      g.fillRect(x + 4, y - 5, 3, 3);
      g.fillRect(x - 6, y + 1, 3, 3);
      g.fillRect(x + 4, y + 1, 3, 3);
      g.fillStyle = '#FED7AA';
      g.fillRect(x - 2, y - 6, 4, 2);
      g.fillRect(x - 2, y + 3, 4, 2);
      break;
  }
}
