/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Base compartilhada dos inimigos do "Submarino Abissal".
 */

export type TipoInimigo = 'tubarao' | 'piranha' | 'pirata' | 'aguaviva';

export interface InimigoBase {
  tipo: TipoInimigo;
  x: number;
  y: number;
  largura: number;
  altura: number;
  vx: number;
  vy: number;
  pontos: number;
  vivo: boolean;
  animacao: number;
  /** Tempo desde o último tiro (submarino pirata). */
  tempoTiro: number;
  /** Faixa do mar em que o inimigo circula. */
  faixa: number;
}

export function criarInimigoBase(
  tipo: TipoInimigo,
  x: number,
  y: number,
  largura: number,
  altura: number,
  vx: number,
  faixa: number,
  pontos: number
): InimigoBase {
  return {
    tipo,
    x,
    y,
    largura,
    altura,
    vx,
    vy: 0,
    pontos,
    vivo: true,
    animacao: Math.random() * 4,
    tempoTiro: 1 + Math.random(),
    faixa,
  };
}

/** Retângulo de colisão do inimigo. */
export function caixaInimigo(inimigo: InimigoBase): {
  x: number;
  y: number;
  largura: number;
  altura: number;
} {
  return {
    x: inimigo.x,
    y: inimigo.y,
    largura: inimigo.largura,
    altura: inimigo.altura,
  };
}

/** Faz o inimigo reaparecer do outro lado da tela. */
export function envolverHorizontal(inimigo: InimigoBase, larguraTela: number): void {
  if (inimigo.x > larguraTela) {
    inimigo.x = -inimigo.largura;
  } else if (inimigo.x + inimigo.largura < 0) {
    inimigo.x = larguraTela;
  }
}
