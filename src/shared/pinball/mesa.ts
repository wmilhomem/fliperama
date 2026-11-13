/**
 * @license
 * SPDX-license-identifier: Apache-2.0
 */
import { Bola, Ponto } from './tipos';
import { GRAVIDADE, VELOCIDADE_MAXIMA, TAXA_ATUALIZACAO, SUBPASSOS } from './tuning';
import { Flipper, criarFlipper, ativarFlipper, atualizarFlipper, colidirFlipper } from './flippers';
import { BOLA_RAIO } from './constantes';

export interface EstadoJogo {
  bola: Bola;
  flippers: Flipper[];
  pontuacao: number;
  vidas: number;
  fase: number;
  gameOver: boolean;
}

/** Inicia um novo jogo. */
export function iniciarJogo(): EstadoJogo {
  return {
    bola: {
      x: LARGURA / 2,
      y: ALTURA - 50,
      vx: 0,
      vy: 0,
      raio: RAIO_BOLA,
      naMola: false,
    },
    flippers: [
      criarFlipper(MARGEM_COSTAS, (ALTURA - ALTURA_PAINEL) / 2, 40, 80),
      criarFlipper(LARGURA - MARGEM_COSTAS - 40, (ALTURA - ALTURA_PAINEL) / 2, 40, 80),
    ],
    pontuacao: 0,
    vidas: 3,
    fase: 1,
    gameOver: false,
  };
}

/** Atualiza a f��sica da bola. */
export function atualizarFisica(bola: Bola, dt: number, flippers: Flipper[]): Bola {
  // Aplica gravidade
  bola.vy += GRAVIDADE * TAXA_ATUALIZACAO;

  // Limita velocidade m��xima
  const velocidadeAtual = Math.hypot(bola.vx, bola.vy);
  if (velocidadeAtual > VELOCIDADE_MAXIMA) {
    const fator = VELOCIDADE_MAXIMA / velocidadeAtual;
    bola.vx *= fator;
    bola.vy *= fator;
  }

  // Atualiza posi��ǜo
  bola.x += bola.vx * TAXA_ATUALIZACAO;
  bola.y += bola.vy * TAXA_ATUALIZACAO;

  // Colisão com bordas laterais
  if (bola.x - bola.raio < MARGEM_COSTAS) {
    bola.x = MARGEM_COSTAS + bola.raio;
    bola.vx = Math.abs(bola.vx) * 0.8; // Perde energia
  }
  if (bola.x + bola.raio > LARGURA - MARGEM_COSTAS) {
    bola.x = LARGURA - MARGEM_COSTAS - bola.raio;
    bola.vx = -Math.abs(bola.vx) * 0.8;
  }

  // Colisão com flippers
  flippers.forEach(flipper => {
    if (colidirFlipper(bola, flipper)) {
      // Inverte a velocidade Y e adiciona for��a do flipper
      bola.vy = -Math.abs(bola.vy) * 0.9;
      bola.vx += flipper.velocidade * 0.1;
    }
  });

  // Verifica se a bola cai (dreno)
  if (bola.y > ALTURA + bola.raio) {
    // Bola caiu - perde vida
    return reiniciarBola(bola);
  }

  return bola;
}

/** Reinicia a bola após dreno. */
function reiniciarBola(bola: Bola): Bola {
  bola.x = LARGURA / 2;
  bola.y = ALTURA - 50;
  bola.vx = 0;
  bola.vy = 0;
  bola.naMola = true;
  return bola;
}

/** Cria uma instância de jogo de pinball. */
export function criarJogoPinball(ctx: any, tabela: any, options: { mensagem: string; debug?: boolean }): any {
  return {
    ctx,
    tabela,
    options,
    atualizar: () => {},
    desenhar: () => {},
    destruir: () => {},
  };
}