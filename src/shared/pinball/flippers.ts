/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Flippers (cápsulas rotativas) do pinball.
 *
 * Cada flipper é uma cápsula que gira em torno de um pivô. A bola recebe a
 * velocidade do ponto de contato: acertar perto da ponta lança muito mais
 * forte do que acertar perto do pivô.
 */

import {
  IMPULSO_FLIPPER,
  RESTITUICAO_FLIPPER,
  VELOCIDADE_ANGULAR_DESCIDA,
  VELOCIDADE_ANGULAR_FLIPPER,
} from './constantes';
import { Bola, pontoMaisProximo } from './fisica';
import { DefinicaoFlipper, Ponto } from './tipos';

export interface Flipper {
  definicao: DefinicaoFlipper;
  /** Ângulo atual em radianos. */
  angulo: number;
  /** Velocidade angular atual (rad/s),signed. */
  velocidadeAngular: number;
  pressionado: boolean;
  /** Animação de impacto (0..1). */
  animacao: number;
}

export function criarFlipper(definicao: DefinicaoFlipper): Flipper {
  return {
    definicao,
    angulo: definicao.anguloRepouso,
    velocidadeAngular: 0,
    pressionado: false,
    animacao: 0,
  };
}

/** Atualiza o ângulo do flipper em direção ao alvo (subida rápida). */
export function atualizarFlipper(flipper: Flipper, pressionado: boolean, dt: number): void {
  flipper.pressionado = pressionado;
  const alvo = pressionado ? flipper.definicao.anguloAtivo : flipper.definicao.anguloRepouso;
  const velocidade = pressionado
    ? VELOCIDADE_ANGULAR_FLIPPER
    : VELOCIDADE_ANGULAR_DESCIDA;
  const delta = alvo - flipper.angulo;
  const passo = velocidade * dt;
  if (Math.abs(delta) <= passo) {
    flipper.angulo = alvo;
    flipper.velocidadeAngular = 0;
  } else {
    flipper.angulo += Math.sign(delta) * passo;
    flipper.velocidadeAngular = Math.sign(delta) * velocidade;
  }
  flipper.animacao = Math.max(0, flipper.animacao - dt * 6);
}

export function pontaFlipper(flipper: Flipper): Ponto {
  return {
    x: flipper.definicao.pivoX + Math.cos(flipper.angulo) * flipper.definicao.comprimento,
    y: flipper.definicao.pivoY + Math.sin(flipper.angulo) * flipper.definicao.comprimento,
  };
}

/** Segmento do eixo do flipper (pivô -> ponta). */
export function eixoFlipper(flipper: Flipper): { a: Ponto; b: Ponto } {
  return {
    a: { x: flipper.definicao.pivoX, y: flipper.definicao.pivoY },
    b: pontaFlipper(flipper),
  };
}

/**
 * Colisão da bola com o flipper.
 * Devolve `true` quando houve contato.
 */
export function colidirFlipper(bola: Bola, flipper: Flipper): boolean {
  const { a, b } = eixoFlipper(flipper);
  const contato = pontoMaisProximo(bola, a, b);
  const dx = bola.x - contato.x;
  const dy = bola.y - contato.y;
  const distancia = Math.hypot(dx, dy);
  const raioTotal = bola.raio + flipper.definicao.raio;

  if (distancia > raioTotal) return false;

  let nx: number;
  let ny: number;
  if (distancia < 1e-6) {
    nx = -Math.sin(flipper.angulo);
    ny = Math.cos(flipper.angulo);
  } else {
    nx = dx / distancia;
    ny = dy / distancia;
  }

  // Velocidade da superfície do flipper no ponto de contato.
  const bracoX = contato.x - flipper.definicao.pivoX;
  const bracoY = contato.y - flipper.definicao.pivoY;
  const velocidadeSuperficieX = -flipper.velocidadeAngular * bracoY;
  const velocidadeSuperficieY = flipper.velocidadeAngular * bracoX;

  const relX = bola.vx - velocidadeSuperficieX;
  const relY = bola.vy - velocidadeSuperficieY;
  const vn = relX * nx + relY * ny;

  if (vn < 0) {
    const impulso = -(1 + RESTITUICAO_FLIPPER) * vn;
    bola.vx += nx * impulso;
    bola.vy += ny * impulso;
  }

  // Transfere o momento do flipper para a bola: o braço de alavanca
  // faz a ponta lançar muito mais forte que a base.
  bola.vx += velocidadeSuperficieX * IMPULSO_FLIPPER;
  bola.vy += velocidadeSuperficieY * IMPULSO_FLIPPER;

  // Saída da penetração
  const penetracao = Math.max(0, raioTotal - distancia);
  bola.x += nx * penetracao;
  bola.y += ny * penetracao;

  flipper.animacao = 1;
  return true;
}

/** Desenha o flipper com visual de borracha grossa estilo 70. */
export function desenharFlipper(
  g: CanvasRenderingContext2D,
  flipper: Flipper,
  corBase: string,
  corBorda: string
): void {
  const { a, b } = eixoFlipper(flipper);
  const largura = flipper.definicao.raio * 2;
  const pulso = flipper.animacao;

  g.save();
  g.lineCap = 'round';
  g.strokeStyle = corBorda;
  g.lineWidth = largura + 3;
  g.beginPath();
  g.moveTo(a.x, a.y);
  g.lineTo(b.x, b.y);
  g.stroke();

  g.strokeStyle = corBase;
  g.lineWidth = largura;
  g.beginPath();
  g.moveTo(a.x, a.y);
  g.lineTo(b.x, b.y);
  g.stroke();

  if (pulso > 0) {
    g.globalAlpha = pulso * 0.6;
    g.strokeStyle = '#FFFFFF';
    g.lineWidth = Math.max(1, largura * 0.35);
    g.beginPath();
    g.moveTo(a.x, a.y);
    g.lineTo(b.x, b.y);
    g.stroke();
  }

  // Pino do pivô
  g.globalAlpha = 1;
  g.fillStyle = corBorda;
  g.beginPath();
  g.arc(a.x, a.y, flipper.definicao.raio * 0.9, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = corBase;
  g.beginPath();
  g.arc(a.x, a.y, flipper.definicao.raio * 0.6, 0, Math.PI * 2);
  g.fill();
  g.restore();
}
