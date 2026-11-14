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
 *
 * O labirinto é original e simétrico na horizontal: a metade da esquerda é
 * espelhada para gerar a metade da direita (a toca central e as fileiras 10-14
 * e 27 são definidas por linhas completas, também palíndromos). Ao final, um
 * aparador simétrico remove sementes nos corredores mais cheios até restar
 * cerca de 240 itens para coletar.
 */

export const TILE_SIZE = 16;
export const MAZE_COLS = 28;
export const MAZE_ROWS = 31;
export const MAZE_OFFSET_X = 16;
export const MAZE_OFFSET_Y = 48;

// Metade esquerda de cada fileira (14 caracteres). A metade da direita é o espelho.
const HALF_MAZE_TEMPLATE: (string | null)[] = [
  '11111111111111', // 0
  '13222222222222', // 1 - pimentas nos cantos superiores
  '12121121121121', // 2
  '12121121121121', // 3
  '12222222222222', // 4 - corredor aberto
  '12112112112112', // 5
  '12222212212222', // 6
  '10112112112110', // 7 - centro aberto (liga as metades)
  '12222222222222', // 8 - corredor aberto
  '12222122212222', // 9 - corredor acima da porta
  null, //           10 - TOCA: parede superior com o portão
  null, //           11 - TOCA: interior
  null, //           12 - TOCA: interior
  null, //           13 - TOCA: interior
  null, //           14 - TÚNEL + parede inferior da toca
  '12222122212222', // 15 - alinhado ao túnel
  '12222222222222', // 16 - corredor aberto
  '11121112121111', // 17
  '12222222222222', // 18 - corredor aberto
  '10012102121002', // 19
  '12222222222222', // 20 - corredor aberto (fruta abaixo da toca)
  '11112112111111', // 21
  '12222222222222', // 22 - corredor aberto (spawn)
  '10111010110111', // 23
  '13222222222222', // 24 - pimentas nos cantos inferiores
  '10112122211121', // 25 - liga os bolsos inferiores
  '12222122122222', // 26
  null, //           27 - ponte entre as metades
  '12222222222222', // 28 - corredor aberto
  '10222222222221', // 29 - centro fechado
  '11111111111111', // 30
];

/** Linha simétrica: esquerda (9 tiles) + meio (10 tiles) + esquerda espelhada. */
function linhaSimetrica(esq9: number[], meio10: number[]): number[] {
  return [...esq9, ...meio10, ...[...esq9].reverse()];
}

const ESQ_TOCA = [1, 2, 2, 2, 1, 2, 2, 2, 1]; // paredes no corredor às laterais da toca

const FILEIRAS_ESPECIAIS: Record<number, number[]> = {
  10: linhaSimetrica(ESQ_TOCA, [1, 1, 1, 1, 4, 4, 1, 1, 1, 1]), // porta com tile 4
  11: linhaSimetrica(ESQ_TOCA, [1, 5, 5, 5, 5, 5, 5, 5, 5, 1]),
  12: linhaSimetrica(ESQ_TOCA, [1, 5, 5, 5, 5, 5, 5, 5, 5, 1]),
  13: linhaSimetrica(ESQ_TOCA, [1, 5, 5, 5, 5, 5, 5, 5, 5, 1]),
  14: linhaSimetrica([6, 6, 2, 2, 1, 2, 2, 2, 1], [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]), // túnel + base da toca
  27: linhaSimetrica([1, 1, 1, 1, 2, 1, 1, 1, 1], [2, 1, 1, 1, 2, 2, 1, 1, 1, 2]), // ponte
};

/** Total de sementes + pimentas ainda presentes na matriz. */
function contarItens(grid: number[][]): number {
  let total = 0;
  for (const linha of grid) {
    for (const tile of linha) {
      if (tile === 2 || tile === 3) total++;
    }
  }
  return total;
}

export function criarMatrizLabirinto(): number[][] {
  const matriz: number[][] = HALF_MAZE_TEMPLATE.map((half, r) => {
    const especial = FILEIRAS_ESPECIAIS[r];
    if (especial) return especial.slice();

    const linha: number[] = [];
    for (let c = 0; c < 14; c++) linha.push(parseInt(half![c], 10));
    for (let c = 13; c >= 0; c--) linha.push(parseInt(half![c], 10));
    return linha;
  });

  // Apara sementes simetricamente nos corredores mais cheios até restarem ~240 itens
  const linhasPorDensidade = matriz
    .map((linha, r) => ({ r, sementes: linha.filter((t) => t === 2).length }))
    .sort((a, b) => b.sementes - a.sementes);

  while (contarItens(matriz) > 240) {
    for (const { r } of linhasPorDensidade) {
      if (contarItens(matriz) <= 240) break;
      for (let c = 0; c < 14; c++) {
        if (matriz[r][c] === 2 && matriz[r][MAZE_COLS - 1 - c] === 2) {
          matriz[r][c] = 0;
          matriz[r][MAZE_COLS - 1 - c] = 0;
          break;
        }
      }
    }
  }

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
    return ehOlhos; // Só olhos ou a própria sombra saindo cruzam o portão
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
