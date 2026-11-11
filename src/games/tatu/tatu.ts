/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ehCaminhoTatu, MAZE_COLS, MAZE_OFFSET_X, MAZE_OFFSET_Y, TILE_SIZE } from './mapa';

export type Direcao = 'cima' | 'baixo' | 'esquerda' | 'direita' | 'parado';

export interface TatuHero {
  x: number;
  y: number;
  col: number;
  row: number;
  dir: Direcao;
  proximaDir: Direcao;
  velocidade: number;
  modoBola: boolean;
  tempoModoBola: number;
  animFrame: number;
  animTimer: number;
  vivo: boolean;
  morrendo: boolean;
  timerMorte: number;
}

export function criarTatu(): TatuHero {
  // Posição inicial: linha 22, centro horizontal (coluna 13.5)
  const spawnCol = 13.5;
  const spawnRow = 22;

  return {
    x: MAZE_OFFSET_X + spawnCol * TILE_SIZE,
    y: MAZE_OFFSET_Y + spawnRow * TILE_SIZE + TILE_SIZE / 2,
    col: Math.floor(spawnCol),
    row: spawnRow,
    dir: 'parado',
    proximaDir: 'parado',
    velocidade: 140,
    modoBola: false,
    tempoModoBola: 0,
    animFrame: 0,
    animTimer: 0,
    vivo: true,
    morrendo: false,
    timerMorte: 0,
  };
}

export function resetarPosicaoTatu(tatu: TatuHero): void {
  const spawnCol = 13.5;
  const spawnRow = 22;

  tatu.x = MAZE_OFFSET_X + spawnCol * TILE_SIZE;
  tatu.y = MAZE_OFFSET_Y + spawnRow * TILE_SIZE + TILE_SIZE / 2;
  tatu.col = Math.floor(spawnCol);
  tatu.row = spawnRow;
  tatu.dir = 'parado';
  tatu.proximaDir = 'parado';
  tatu.modoBola = false;
  tatu.tempoModoBola = 0;
  tatu.vivo = true;
  tatu.morrendo = false;
  tatu.timerMorte = 0;
  tatu.animFrame = 0;
  tatu.animTimer = 0;
}

export function atualizarTatu(
  tatu: TatuHero,
  dt: number,
  inputDir: Direcao,
  grid: number[][]
): void {
  if (!tatu.vivo || tatu.morrendo) {
    if (tatu.morrendo) {
      tatu.timerMorte += dt;
      tatu.animTimer += dt;
      if (tatu.animTimer > 0.12) {
        tatu.animTimer = 0;
        tatu.animFrame = Math.min(10, tatu.animFrame + 1);
      }
    }
    return;
  }

  // Atualização do modo bola (powerup da pimenta)
  if (tatu.modoBola) {
    tatu.tempoModoBola -= dt;
    if (tatu.tempoModoBola <= 0) {
      tatu.modoBola = false;
      tatu.tempoModoBola = 0;
    }
  }

  // Velocidade ajustada pelo modo bola
  tatu.velocidade = tatu.modoBola ? 168 : 140;

  // Buffer de entrada do jogador
  if (inputDir !== 'parado') {
    tatu.proximaDir = inputDir;

    // Se a entrada for exatamente oposta à direção atual, vira de imediato!
    if (
      (tatu.dir === 'esquerda' && inputDir === 'direita') ||
      (tatu.dir === 'direita' && inputDir === 'esquerda') ||
      (tatu.dir === 'cima' && inputDir === 'baixo') ||
      (tatu.dir === 'baixo' && inputDir === 'cima')
    ) {
      tatu.dir = inputDir;
      tatu.proximaDir = 'parado';
    }
  }

  // Coordenadas relativas ao labirinto
  const relX = tatu.x - MAZE_OFFSET_X;
  const relY = tatu.y - MAZE_OFFSET_Y;

  const colAtual = Math.floor(relX / TILE_SIZE);
  const rowAtual = Math.floor(relY / TILE_SIZE);
  tatu.col = colAtual;
  tatu.row = rowAtual;

  const centroTileX = colAtual * TILE_SIZE + TILE_SIZE / 2;
  const centroTileY = rowAtual * TILE_SIZE + TILE_SIZE / 2;

  // Tolerância para virar em encruzilhadas
  const distCentroX = Math.abs(relX - centroTileX);
  const distCentroY = Math.abs(relY - centroTileY);
  const proximoDoCentro = distCentroX <= 6.5 && distCentroY <= 6.5;

  // Tenta aplicar a direção do buffer se o caminho estiver livre
  if (tatu.proximaDir !== 'parado' && proximoDoCentro) {
    let podeVirar = false;

    if (tatu.proximaDir === 'cima' && ehCaminhoTatu(grid, colAtual, rowAtual - 1)) {
      podeVirar = true;
    } else if (tatu.proximaDir === 'baixo' && ehCaminhoTatu(grid, colAtual, rowAtual + 1)) {
      podeVirar = true;
    } else if (tatu.proximaDir === 'esquerda' && ehCaminhoTatu(grid, colAtual - 1, rowAtual)) {
      podeVirar = true;
    } else if (tatu.proximaDir === 'direita' && ehCaminhoTatu(grid, colAtual + 1, rowAtual)) {
      podeVirar = true;
    }

    if (podeVirar) {
      tatu.dir = tatu.proximaDir;
      tatu.proximaDir = 'parado';
      // Alinha perfeitamente ao centro do corredor
      if (tatu.dir === 'cima' || tatu.dir === 'baixo') {
        tatu.x = MAZE_OFFSET_X + centroTileX;
      } else {
        tatu.y = MAZE_OFFSET_Y + centroTileY;
      }
    }
  }

  // Verifica se o caminho à frente ainda está livre na direção atual
  let podeAvancar = false;
  if (tatu.dir === 'cima') {
    podeAvancar = relY > centroTileY || ehCaminhoTatu(grid, colAtual, rowAtual - 1);
  } else if (tatu.dir === 'baixo') {
    podeAvancar = relY < centroTileY || ehCaminhoTatu(grid, colAtual, rowAtual + 1);
  } else if (tatu.dir === 'esquerda') {
    podeAvancar = relX > centroTileX || ehCaminhoTatu(grid, colAtual - 1, rowAtual);
  } else if (tatu.dir === 'direita') {
    podeAvancar = relX < centroTileX || ehCaminhoTatu(grid, colAtual + 1, rowAtual);
  }

  // Move o tatu se o caminho permitir
  if (podeAvancar && tatu.dir !== 'parado') {
    const passo = tatu.velocidade * dt;
    if (tatu.dir === 'cima') tatu.y -= passo;
    if (tatu.dir === 'baixo') tatu.y += passo;
    if (tatu.dir === 'esquerda') tatu.x -= passo;
    if (tatu.dir === 'direita') tatu.x += passo;

    // Atualiza animação
    tatu.animTimer += dt;
    const taxaAnim = tatu.modoBola ? 0.06 : 0.12;
    if (tatu.animTimer > taxaAnim) {
      tatu.animTimer = 0;
      tatu.animFrame = (tatu.animFrame + 1) % 4;
    }
  } else {
    // Parado contra uma parede: centraliza no tile
    if (tatu.dir === 'cima' || tatu.dir === 'baixo') {
      tatu.y = MAZE_OFFSET_Y + centroTileY;
    } else if (tatu.dir === 'esquerda' || tatu.dir === 'direita') {
      tatu.x = MAZE_OFFSET_X + centroTileX;
    }
    tatu.dir = 'parado';
  }

  // Túnel lateral de teletransporte (linha 14)
  const limiteEsquerda = -TILE_SIZE;
  const limiteDireita = MAZE_COLS * TILE_SIZE + TILE_SIZE;

  if (tatu.x < limiteEsquerda) {
    tatu.x = limiteDireita - 2;
  } else if (tatu.x > limiteDireita) {
    tatu.x = limiteEsquerda + 2;
  }
}
