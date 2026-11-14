/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ehCaminhoSombra, MAZE_COLS, MAZE_OFFSET_X, MAZE_OFFSET_Y, MAZE_ROWS, TILE_SIZE } from './mapa';
import { Direcao, TatuHero } from './tatu';

export type SombraId = 'vermelha' | 'roxa' | 'azul' | 'laranja';
export type SombraModo = 'naToca' | 'saindo' | 'perseguindo' | 'dispersando' | 'assustada' | 'olhos';

export interface Sombra {
  id: SombraId;
  nome: string;
  cor: string;
  x: number;
  y: number;
  col: number;
  row: number;
  dir: Direcao;
  modo: SombraModo;
  velocidade: number;
  cantoDispersao: { col: number; row: number };
  alvoX: number;
  alvoY: number;
  timerSaidaToca: number;
  animFrame: number;
  animTimer: number;
}

export interface GerenciadorSombras {
  sombras: Sombra[];
  modoGlobal: 'dispersando' | 'perseguindo';
  timerOnda: number;
  indiceOnda: number;
  timerAssustado: number;
  comboDerrotas: number;
}

// Configurações das 4 sombras originais
const CONFIG_SOMBRAS: Record<
  SombraId,
  {
    nome: string;
    cor: string;
    cantoDispersao: { col: number; row: number };
    posInicialToca: { col: number; row: number };
    delaySaida: number;
  }
> = {
  vermelha: {
    nome: 'Fúria',
    cor: '#EF4444', // Vermelho Neon
    cantoDispersao: { col: 25, row: 0 },
    posInicialToca: { col: 13.5, row: 9 }, // Já inicia fora da toca, no corredor acima do portão
    delaySaida: 0,
  },
  roxa: {
    nome: 'Espreita',
    cor: '#A855F7', // Roxo Neon
    cantoDispersao: { col: 2, row: 0 },
    posInicialToca: { col: 13.5, row: 12 },
    delaySaida: 2.0,
  },
  azul: {
    nome: 'Vigilante',
    cor: '#06B6D4', // Ciano Neon
    cantoDispersao: { col: 27, row: 30 },
    posInicialToca: { col: 11.5, row: 12 },
    delaySaida: 5.0,
  },
  laranja: {
    nome: 'Tímida',
    cor: '#F97316', // Laranja Neon
    cantoDispersao: { col: 0, row: 30 },
    posInicialToca: { col: 15.5, row: 12 },
    delaySaida: 8.5,
  },
};

export function criarGerenciadorSombras(): GerenciadorSombras {
  const ids: SombraId[] = ['vermelha', 'roxa', 'azul', 'laranja'];

  const sombras: Sombra[] = ids.map((id) => {
    const cfg = CONFIG_SOMBRAS[id];
    const x = MAZE_OFFSET_X + cfg.posInicialToca.col * TILE_SIZE;
    const y = MAZE_OFFSET_Y + cfg.posInicialToca.row * TILE_SIZE + TILE_SIZE / 2;

    return {
      id,
      nome: cfg.nome,
      cor: cfg.cor,
      x,
      y,
      col: Math.floor(cfg.posInicialToca.col),
      row: cfg.posInicialToca.row,
      dir: id === 'vermelha' ? 'esquerda' : 'cima',
      modo: id === 'vermelha' ? 'dispersando' : 'naToca',
      velocidade: 130,
      cantoDispersao: cfg.cantoDispersao,
      alvoX: cfg.cantoDispersao.col,
      alvoY: cfg.cantoDispersao.row,
      timerSaidaToca: cfg.delaySaida,
      animFrame: 0,
      animTimer: 0,
    };
  });

  return {
    sombras,
    modoGlobal: 'dispersando',
    timerOnda: 7.0, // Inicia em dispersão por 7 segundos
    indiceOnda: 0,
    timerAssustado: 0,
    comboDerrotas: 0,
  };
}

export function resetarSombras(gerenciador: GerenciadorSombras, fase = 1): void {
  const ids: SombraId[] = ['vermelha', 'roxa', 'azul', 'laranja'];

  gerenciador.sombras.forEach((s) => {
    const cfg = CONFIG_SOMBRAS[s.id];
    s.x = MAZE_OFFSET_X + cfg.posInicialToca.col * TILE_SIZE;
    s.y = MAZE_OFFSET_Y + cfg.posInicialToca.row * TILE_SIZE + TILE_SIZE / 2;
    s.col = Math.floor(cfg.posInicialToca.col);
    s.row = cfg.posInicialToca.row;
    s.dir = s.id === 'vermelha' ? 'esquerda' : 'cima';
    s.modo = s.id === 'vermelha' ? 'dispersando' : 'naToca';
    s.velocidade = 130 + Math.min(45, (fase - 1) * 6);
    s.timerSaidaToca = Math.max(0.5, cfg.delaySaida - (fase - 1) * 0.8);
    s.animFrame = 0;
    s.animTimer = 0;
  });

  gerenciador.modoGlobal = 'dispersando';
  gerenciador.timerOnda = Math.max(3.0, 7.0 - (fase - 1) * 0.5);
  gerenciador.indiceOnda = 0;
  gerenciador.timerAssustado = 0;
  gerenciador.comboDerrotas = 0;
}

export function assustarSombras(gerenciador: GerenciadorSombras, duracao = 7.0): void {
  gerenciador.timerAssustado = duracao;
  gerenciador.comboDerrotas = 0;

  gerenciador.sombras.forEach((s) => {
    if (s.modo === 'perseguindo' || s.modo === 'dispersando') {
      s.modo = 'assustada';
      // Inverte a direção ao ficar assustada
      s.dir = inverterDirecao(s.dir);
    }
  });
}

function inverterDirecao(dir: Direcao): Direcao {
  if (dir === 'cima') return 'baixo';
  if (dir === 'baixo') return 'cima';
  if (dir === 'esquerda') return 'direita';
  if (dir === 'direita') return 'esquerda';
  return 'parado';
}

/**
 * Atualiza todas as sombras e a IA de navegação.
 */
export function atualizarSombras(
  gerenciador: GerenciadorSombras,
  dt: number,
  tatu: TatuHero,
  grid: number[][],
  fase = 1
): void {
  // 1. Gerenciamento do temporizador de susto
  if (gerenciador.timerAssustado > 0) {
    gerenciador.timerAssustado -= dt;
    if (gerenciador.timerAssustado <= 0) {
      gerenciador.timerAssustado = 0;
      gerenciador.sombras.forEach((s) => {
        if (s.modo === 'assustada') {
          s.modo = gerenciador.modoGlobal;
        }
      });
    }
  } else {
    // 2. Alternância de ondas Dispersão / Perseguição
    gerenciador.timerOnda -= dt;
    if (gerenciador.timerOnda <= 0) {
      gerenciador.indiceOnda++;
      if (gerenciador.modoGlobal === 'dispersando') {
        gerenciador.modoGlobal = 'perseguindo';
        gerenciador.timerOnda = 20.0;
      } else {
        gerenciador.modoGlobal = 'dispersando';
        gerenciador.timerOnda = Math.max(3.0, 6.0 - gerenciador.indiceOnda * 0.5);
      }

      // Ao alternar modos de onda, sombras ativas invertem a direção
      gerenciador.sombras.forEach((s) => {
        if (s.modo === 'perseguindo' || s.modo === 'dispersando') {
          s.modo = gerenciador.modoGlobal;
          s.dir = inverterDirecao(s.dir);
        }
      });
    }
  }

  // 3. Atualização individual de cada sombra
  const sombraVermelha = gerenciador.sombras.find((s) => s.id === 'vermelha');

  for (const s of gerenciador.sombras) {
    // Animação de ondulação
    s.animTimer += dt;
    if (s.animTimer > 0.1) {
      s.animTimer = 0;
      s.animFrame = (s.animFrame + 1) % 4;
    }

    // Comportamento dentro da toca
    if (s.modo === 'naToca') {
      s.timerSaidaToca -= dt;
      // Quique suave dentro da toca (linha central do interior, linha 12)
      const yTocaBase = MAZE_OFFSET_Y + 12 * TILE_SIZE + TILE_SIZE / 2;
      s.y = yTocaBase + Math.sin(performance.now() / 200) * 3;

      if (s.timerSaidaToca <= 0) {
        s.modo = 'saindo';
      }
      continue;
    }

    // Saindo da toca pelo portão
    if (s.modo === 'saindo') {
      const centroX = MAZE_OFFSET_X + 13.5 * TILE_SIZE;
      const saidaY = MAZE_OFFSET_Y + 9 * TILE_SIZE + TILE_SIZE / 2;

      // Centraliza horizontalmente e sobe até sair pelo portão
      if (Math.abs(s.x - centroX) > 2.5) {
        s.x += s.x < centroX ? 75 * dt : -75 * dt;
      } else {
        s.x = centroX;
        s.y -= 75 * dt;
        if (s.y <= saidaY) {
          s.y = saidaY;
          s.modo = gerenciador.timerAssustado > 0 ? 'assustada' : gerenciador.modoGlobal;
          s.dir = Math.random() > 0.5 ? 'esquerda' : 'direita';
        }
      }
      continue;
    }

    // Modo olhos voltando para a toca para renascer
    if (s.modo === 'olhos') {
      const portaCol = 13.5;
      const portaRow = 10;
      const portaX = MAZE_OFFSET_X + portaCol * TILE_SIZE;
      const portaY = MAZE_OFFSET_Y + portaRow * TILE_SIZE + TILE_SIZE / 2;

      // Se alcançou a porta da toca, desce e renasce
      if (Math.hypot(s.x - portaX, s.y - portaY) < 12) {
        s.x = portaX;
        s.y = MAZE_OFFSET_Y + 12 * TILE_SIZE + TILE_SIZE / 2;
        s.modo = 'saindo';
        s.velocidade = 130 + Math.min(45, (fase - 1) * 6);
        continue;
      }

      s.alvoX = portaCol;
      s.alvoY = portaRow;
      s.velocidade = 240; // Olhos voltam voando bem rápido
    } else if (s.modo === 'assustada') {
      s.velocidade = 85; // Mais lentas quando assustadas
    } else {
      // Velocidade normal
      s.velocidade = 130 + Math.min(45, (fase - 1) * 6);

      // Definição do alvo de perseguição de cada sombra com IA própria
      if (s.modo === 'dispersando') {
        s.alvoX = s.cantoDispersao.col;
        s.alvoY = s.cantoDispersao.row;
      } else {
        // Modo 'perseguindo'
        switch (s.id) {
          case 'vermelha':
            // Mira diretamente nas coordenadas atuais do Tatu
            s.alvoX = tatu.col;
            s.alvoY = tatu.row;
            break;

          case 'roxa': {
            // Tenta emboscar mirando 4 tiles à frente do Tatu
            let frenteX = tatu.col;
            let frenteY = tatu.row;
            if (tatu.dir === 'cima') frenteY -= 4;
            if (tatu.dir === 'baixo') frenteY += 4;
            if (tatu.dir === 'esquerda') frenteX -= 4;
            if (tatu.dir === 'direita') frenteX += 4;
            s.alvoX = frenteX;
            s.alvoY = frenteY;
            break;
          }

          case 'azul': {
            // Patrulha baseada no vetor entre a Vermelha e 2 tiles à frente do Tatu
            let pontoX = tatu.col;
            let pontoY = tatu.row;
            if (tatu.dir === 'cima') pontoY -= 2;
            if (tatu.dir === 'baixo') pontoY += 2;
            if (tatu.dir === 'esquerda') pontoX -= 2;
            if (tatu.dir === 'direita') pontoX += 2;

            if (sombraVermelha) {
              const dx = pontoX - sombraVermelha.col;
              const dy = pontoY - sombraVermelha.row;
              s.alvoX = pontoX + dx;
              s.alvoY = pontoY + dy;
            } else {
              s.alvoX = pontoX;
              s.alvoY = pontoY;
            }
            break;
          }

          case 'laranja': {
            // Se estiver a mais de 8 tiles, persegue; se estiver muito perto, foge para seu canto!
            const distAoTatu = Math.hypot(s.col - tatu.col, s.row - tatu.row);
            if (distAoTatu > 8) {
              s.alvoX = tatu.col;
              s.alvoY = tatu.row;
            } else {
              s.alvoX = s.cantoDispersao.col;
              s.alvoY = s.cantoDispersao.row;
            }
            break;
          }
        }
      }
    }

    // Navegação de labirinto por tiles
    moverSombraNoLabirinto(s, dt, grid);
  }
}

/**
 * Movimentação e tomada de decisão da sombra nas encruzilhadas do labirinto.
 */
function moverSombraNoLabirinto(s: Sombra, dt: number, grid: number[][]): void {
  const relX = s.x - MAZE_OFFSET_X;
  const relY = s.y - MAZE_OFFSET_Y;

  const colAtual = Math.floor(relX / TILE_SIZE);
  const rowAtual = Math.floor(relY / TILE_SIZE);
  s.col = colAtual;
  s.row = rowAtual;

  const centroTileX = colAtual * TILE_SIZE + TILE_SIZE / 2;
  const centroTileY = rowAtual * TILE_SIZE + TILE_SIZE / 2;

  const distCentroX = Math.abs(relX - centroTileX);
  const distCentroY = Math.abs(relY - centroTileY);
  const proximoDoCentro = distCentroX <= 4.5 && distCentroY <= 4.5;

  // Ao atingir o centro do tile, toma a decisão de rumo
  if (proximoDoCentro) {
    const direcoesPossiveis: Direcao[] = [];
    const ehOlhos = s.modo === 'olhos';

    // Checa quais direções vizinhas são transitáveis sem fazer meia-volta
    if (s.dir !== 'baixo' && ehCaminhoSombra(grid, colAtual, rowAtual - 1, ehOlhos)) {
      direcoesPossiveis.push('cima');
    }
    if (s.dir !== 'cima' && ehCaminhoSombra(grid, colAtual, rowAtual + 1, ehOlhos)) {
      direcoesPossiveis.push('baixo');
    }
    if (s.dir !== 'direita' && ehCaminhoSombra(grid, colAtual - 1, rowAtual, ehOlhos)) {
      direcoesPossiveis.push('esquerda');
    }
    if (s.dir !== 'esquerda' && ehCaminhoSombra(grid, colAtual + 1, rowAtual, ehOlhos)) {
      direcoesPossiveis.push('direita');
    }

    if (direcoesPossiveis.length > 0) {
      if (s.modo === 'assustada') {
        // Movimento aleatório em cruzamentos quando assustada
        const escolha = Math.floor(Math.random() * direcoesPossiveis.length);
        s.dir = direcoesPossiveis[escolha];
      } else {
        // Escolhe a direção cuja coordenada vizinha minimiza a distância ao alvo
        let melhorDist = Infinity;
        let melhorDir = direcoesPossiveis[0];

        for (const dir of direcoesPossiveis) {
          let vizCol = colAtual;
          let vizRow = rowAtual;
          if (dir === 'cima') vizRow--;
          if (dir === 'baixo') vizRow++;
          if (dir === 'esquerda') vizCol--;
          if (dir === 'direita') vizCol++;

          const dist = Math.hypot(vizCol - s.alvoX, vizRow - s.alvoY);
          if (dist < melhorDist) {
            melhorDist = dist;
            melhorDir = dir;
          }
        }

        s.dir = melhorDir;
      }

      // Alinha perfeitamente ao eixo do corredor
      if (s.dir === 'cima' || s.dir === 'baixo') {
        s.x = MAZE_OFFSET_X + centroTileX;
      } else {
        s.y = MAZE_OFFSET_Y + centroTileY;
      }
    }
  }

  // Avança na direção decidida
  const passo = s.velocidade * dt;
  if (s.dir === 'cima') s.y -= passo;
  if (s.dir === 'baixo') s.y += passo;
  if (s.dir === 'esquerda') s.x -= passo;
  if (s.dir === 'direita') s.x += passo;

  // Túnel lateral
  const limiteEsquerda = -TILE_SIZE;
  const limiteDireita = MAZE_COLS * TILE_SIZE + TILE_SIZE;

  if (s.x < limiteEsquerda) {
    s.x = limiteDireita - 2;
  } else if (s.x > limiteDireita) {
    s.x = limiteEsquerda + 2;
  }
}
