/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * MAPA DO LABIRINTO DO TATU
 * Resolução do labirinto: 28 colunas x 31 linhas de tiles (16x16 pixels cada = 448x496 px).
 * Posicionado a partir de X = 16 px e Y = 48 px (abaixo do HUD do topo).
 *
 * Legenda de tiles:
 * 0 = Espaço vazio (sem semente)
 * 1 = Parede azul-neon (Wall)
 * 2 = Semente pequena (10 pontos)
 * 3 = Pimenta grande piscante (50 pontos - Ativa Modo Bola)
 * 4 = Portão da toca das sombras (Ghost House Door)
 * 5 = Interior da toca das sombras
 * 6 = Túnel lateral (Warp Tunnel)
 */

export const TILE_SIZE = 16;
export const MAZE_COLS = 28;
export const MAZE_ROWS = 31;
export const MAZE_OFFSET_X = 16;
export const MAZE_OFFSET_Y = 48;

// Template simétrico na horizontal (14 colunas espelhadas para criar as 28 colunas)
// Cada string possui 14 caracteres. Metade esquerda: 0..13. Metade direita espelhada: 14..27.
const HALF_MAZE_TEMPLATE: string[] = [
  '11111111111111', // Row 0: Top wall
  '13222212222231', // Row 1: Outer corridor with pepper at col 1
  '12111212111121', // Row 2
  '12111212111121', // Row 3
  '12222222222221', // Row 4
  '12111211121121', // Row 5
  '12221222122221', // Row 6
  '11121112111121', // Row 7
  '00121002000121', // Row 8
  '11121011110121', // Row 9
  '12220015510021', // Row 10
  '12111015510111', // Row 11
  '12221014410000', // Row 12: House Door (tile 4 at top of house)
  '11121015510111', // Row 13
  '66121015510121', // Row 14: Tunnel row! (col 0 and 1 are tunnel)
  '11121011110121', // Row 15
  '00121000000121', // Row 16
  '11121112111121', // Row 17
  '12222212222221', // Row 18
  '12111212111121', // Row 19
  '12221222222121', // Row 20: Fruit spawn row in center!
  '11121211112121', // Row 21
  '12222222122221', // Row 22
  '12111112121111', // Row 23
  '12222222222221', // Row 24
  '13111211111231', // Row 25: Bottom corridor with pepper
  '12221222122221', // Row 26
  '11121112121111', // Row 27
  '12222222222221', // Row 28
  '12111111111121', // Row 29
  '11111111111111', // Row 30: Bottom wall
];

export function criarMatrizLabirinto(): number[][] {
  const matriz: number[][] = [];

  for (let r = 0; r < MAZE_ROWS; r++) {
    const linha: number[] = [];
    const templateRow = HALF_MAZE_TEMPLATE[r];

    // Metade esquerda (0..13)
    for (let c = 0; c < 14; c++) {
      const char = templateRow[c] || '1';
      linha.push(parseInt(char, 10));
    }

    // Metade direita espelhada (14..27)
    for (let c = 13; c >= 0; c--) {
      const char = templateRow[c] || '1';
      linha.push(parseInt(char, 10));
    }

    matriz.push(linha);
  }

  // Ajustes finos específicos na toca e nos túneis
  // Toca central das sombras: colunas 10 a 17, linhas 11 a 14
  matriz[12][13] = 4; // Portão esquerdo
  matriz[12][14] = 4; // Portão direito

  // Túnel lateral de passagem rápida na linha 14:
  matriz[14][0] = 6;
  matriz[14][1] = 6;
  matriz[14][26] = 6;
  matriz[14][27] = 6;

  return matriz;
}

/**
 * Verifica se um tile é transitável pelo Tatu (paredes e portão da toca bloqueiam).
 */
export function ehCaminhoTatu(grid: number[][], col: number, row: number): boolean {
  if (row < 0 || row >= MAZE_ROWS) return false;

  // Túnel lateral permite passar das bordas
  if (row === 14 && (col < 0 || col >= MAZE_COLS)) {
    return true;
  }

  if (col < 0 || col >= MAZE_COLS) return false;

  const tile = grid[row][col];
  // 1 = parede, 4 = portão da toca, 5 = interior da toca
  return tile !== 1 && tile !== 4 && tile !== 5;
}

/**
 * Verifica se um tile é transitável por uma Sombra.
 * Se ela estiver em modo 'olhos' (derrotada), pode cruzar o portão (tile 4 e 5).
 */
export function ehCaminhoSombra(
  grid: number[][],
  col: number,
  row: number,
  ehOlhos = false
): boolean {
  if (row < 0 || row >= MAZE_ROWS) return false;

  // Túnel lateral
  if (row === 14 && (col < 0 || col >= MAZE_COLS)) {
    return true;
  }

  if (col < 0 || col >= MAZE_COLS) return false;

  const tile = grid[row][col];
  if (tile === 1) return false; // Parede sempre bloqueia
  if (tile === 4 || tile === 5) {
    return ehOlhos; // Só olhos ou saída autorizada cruzam o portão
  }
  return true;
}

/**
 * Conta o total de sementes e pimentas presentes no mapa.
 */
export function contarItensIniciais(grid: number[][]): { sementes: number; pimentas: number } {
  let sementes = 0;
  let pimentas = 0;

  for (let r = 0; r < MAZE_ROWS; r++) {
    for (let c = 0; c < MAZE_COLS; c++) {
      if (grid[r][c] === 2) sementes++;
      if (grid[r][c] === 3) pimentas++;
    }
  }

  return { sementes, pimentas };
}
