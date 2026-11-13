/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Invasores de "Invasores Cósmicos 84".
 *
 * Três tipos 100% originais (nenhum lembra sprites de clássicos conhecidos):
 * - Larva-metal: corpo arredondado com 3 pernas (fileiras de baixo).
 * - Libélula-sonda: asas finas e cabeça pontuda (fileiras do meio).
 * - Cristal-vigia: losango com um olho no centro (fileira do topo).
 */

import { PALETA } from './constantes';

export type TipoInvasor = 'larva' | 'libelula' | 'cristal';

export interface Invasor {
  tipo: TipoInvasor;
  x: number;
  y: number;
  largura: number;
  altura: number;
  pontos: number;
  vivo: boolean;
  /** Quadro da animação (0 ou 1). */
  quadro: number;
  /** Tempo desde o último disparo de bomba. */
  tempoTiro: number;
}

export const PONTOS_LARVA = 10;
export const PONTOS_LIBELULA = 20;
export const PONTOS_CRISTAL = 30;

/** Pontuação de cada tipo. */
export function pontosDoTipo(tipo: TipoInvasor): number {
  if (tipo === 'larva') return PONTOS_LARVA;
  if (tipo === 'libelula') return PONTOS_LIBELULA;
  return PONTOS_CRISTAL;
}

/** Tipo de invasor conforme a fileira (0 = topo da formação). */
export function tipoDaFileira(fileira: number): TipoInvasor {
  if (fileira === 0) return 'cristal';
  if (fileira <= 2) return 'libelula';
  return 'larva';
}

/** Desenha um invasor (32x32) no estilo fósforo verde. */
export function desenharInvasor(
  g: CanvasRenderingContext2D,
  invasor: Invasor,
  tempo: number
): void {
  const x = Math.round(invasor.x);
  const y = Math.round(invasor.y);
  const quadro = invasor.quadro;

  g.save();
  g.translate(x, y);

  switch (invasor.tipo) {
    case 'larva': {
      // Corpo arredondado com 3 pernas
      g.fillStyle = PALETA.fosforo;
      g.fillRect(6, 8, 20, 12);
      g.fillRect(10, 4, 12, 4);
      g.fillRect(4, 12, 24, 8);
      g.fillStyle = PALETA.fosforoEscuro;
      g.fillRect(8, 10, 16, 2);

      // Pernas (animadas)
      const deslocamento = quadro === 0 ? 0 : 2;
      g.fillStyle = PALETA.fosforoClaro;
      g.fillRect(4, 20 + deslocamento, 4, 8 - deslocamento);
      g.fillRect(14, 20 + (deslocamento === 0 ? 2 : 0), 4, 6 + deslocamento);
      g.fillRect(24, 20 + deslocamento, 4, 8 - deslocamento);

      // Olhos
      g.fillStyle = PALETA.fosforoEscuro;
      g.fillRect(10, 12, 4, 4);
      g.fillRect(18, 12, 4, 4);
      break;
    }

    case 'libelula': {
      // Asas finas e cabeça pontuda
      g.fillStyle = PALETA.fosforo;
      g.fillRect(12, 6, 8, 16);
      g.fillRect(14, 22, 4, 6);

      const asa = quadro === 0 ? 0 : 3;
      g.fillStyle = PALETA.fosforoClaro;
      g.fillRect(2, 10 + asa, 10, 3);
      g.fillRect(20, 10 + asa, 10, 3);
      g.fillRect(0, 16 - asa, 8, 3);
      g.fillRect(24, 16 - asa, 8, 3);

      g.fillStyle = PALETA.fosforoEscuro;
      g.fillRect(14, 10, 4, 4);
      break;
    }

    default: {
      // Cristal-vigia: losango com um olho no centro
      g.fillStyle = PALETA.fosforo;
      for (let i = 0; i < 12; i++) {
        g.fillRect(16 - i, 4 + i, i * 2, 2);
      }
      for (let i = 11; i >= 0; i--) {
        g.fillRect(16 - i, 16 + (11 - i), i * 2, 2);
      }

      g.fillStyle = PALETA.fosforoEscuro;
      const pulso = Math.floor(tempo * 4) % 2 === 0 ? 4 : 6;
      g.fillRect(16 - pulso / 2, 12, pulso, pulso);
      g.fillStyle = PALETA.fosforoClaro;
      g.fillRect(15, 13, 2, 2);
      break;
    }
  }

  g.restore();
}
