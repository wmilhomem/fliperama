/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Flippers (cápsulas rotativas cônicas) do pinball.
 *
 * Cada flipper é uma cápsula que gira em torno de um pivô, com espessura
 * maior na base e menor na ponta. A bola recebe a velocidade do ponto de
 * contato: acertar perto da ponta lança muito mais forte do que acertar
 * perto do pivô.
 */

import {
  ATRITO_CAPTURA,
  IMPULSO_FLIPPER,
  RESTITUICAO_FLIPPER,
  VELOCIDADE_ANGULAR_DESCIDA,
  VELOCIDADE_ANGULAR_FLIPPER,
  VELOCIDADE_CAPTURA,
} from './tuning';
import { Bola, pontoMaisProximoComParametro } from './fisica';
import { DefinicaoFlipper, Ponto } from './tipos';

export interface Flipper {
  definicao: DefinicaoFlipper;
  /** Ângulo atual em radianos. */
  angulo: number;
  /** Velocidade angular atual (rad/s), com sinal. */
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

/** Espessura do flipper no ponto paramétrico `t` (0 = base, 1 = ponta). */
export function espessuraFlipper(flipper: Flipper, t: number): number {
  const base = flipper.definicao.raio;
  const ponta = flipper.definicao.raioPonta ?? base;
  return base + (ponta - base) * Math.max(0, Math.min(1, t));
}

/**
 * Colisão da bola com o flipper.
 * Devolve `true` quando houve contato.
 */
export function colidirFlipper(bola: Bola, flipper: Flipper): boolean {
  const { a, b } = eixoFlipper(flipper);
  const { ponto: contato, t } = pontoMaisProximoComParametro(bola, a, b);
  const raioLocal = espessuraFlipper(flipper, t);

  const dx = bola.x - contato.x;
  const dy = bola.y - contato.y;
  const distancia = Math.hypot(dx, dy);
  const raioTotal = bola.raio + raioLocal;

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

  const parado = Math.abs(flipper.velocidadeAngular) < 0.8;
  // "Catch & release" só vale com o flipper levantado e parado: em repouso a
  // bola precisa continuar rolando (senão estaciona na base do flipper sem
  // saída). Um flipper levantado cede baixíssima alavancagem perto do pivô.
  const erguido = flipper.angulo < flipper.definicao.anguloRepouso - 0.06;
  const velocidadeBola = Math.hypot(bola.vx, bola.vy);

  if (erguido && parado && velocidadeBola < VELOCIDADE_CAPTURA) {
    // A bola fica "segurada" no flipper erguido.
    bola.vx = 0;
    bola.vy = 0;
  } else {
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

    if (parado) {
      bola.vx *= 1 - ATRITO_CAPTURA;
      bola.vy *= 1 - ATRITO_CAPTURA;
    }
  }

  // Saída da penetração
  const penetracao = Math.max(0, raioTotal - distancia);
  bola.x += nx * penetracao;
  bola.y += ny * penetracao;

  flipper.animacao = 1;
  return true;
}

/** Desenha o flipper cônico (base larga, ponta fina) estilo fliperama dos anos 70. */
export function desenharFlipper(
  g: CanvasRenderingContext2D,
  flipper: Flipper,
  corBase: string,
  corBorda: string
): void {
  const { a, b } = eixoFlipper(flipper);
  const raioBase = flipper.definicao.raio;
  const raioPonta = flipper.definicao.raioPonta ?? raioBase;
  const pulso = flipper.animacao;

  // Normal perpendicular ao eixo do flipper
  const nx = -Math.sin(flipper.angulo);
  const ny = Math.cos(flipper.angulo);

  const caminho = (folga: number) => {
    g.beginPath();
    g.moveTo(a.x + nx * (raioBase + folga), a.y + ny * (raioBase + folga));
    g.lineTo(b.x + nx * (raioPonta + folga), b.y + ny * (raioPonta + folga));
    g.arc(b.x, b.y, raioPonta + folga, flipper.angulo + Math.PI / 2, flipper.angulo - Math.PI / 2, true);
    g.lineTo(a.x - nx * (raioBase + folga), a.y - ny * (raioBase + folga));
    g.arc(a.x, a.y, raioBase + folga, flipper.angulo - Math.PI / 2, flipper.angulo + Math.PI / 2, true);
    g.closePath();
  };

  g.save();
  // Contorno grosso e escuro
  g.fillStyle = corBorda;
  caminho(3);
  g.fill();

  // Corpo do flipper
  g.fillStyle = corBase;
  caminho(0);
  g.fill();

  // Reflexo superior
  g.globalAlpha = 0.45;
  g.fillStyle = '#FFFFFF';
  g.beginPath();
  g.moveTo(a.x + nx * raioBase * 0.45, a.y + ny * raioBase * 0.45);
  g.lineTo(b.x + nx * raioPonta * 0.45, b.y + ny * raioPonta * 0.45);
  g.lineWidth = 2;
  g.strokeStyle = '#FFFFFF';
  g.stroke();
  g.globalAlpha = 1;

  if (pulso > 0) {
    g.globalAlpha = pulso * 0.6;
    g.strokeStyle = '#FFFFFF';
    g.lineWidth = 3;
    caminho(4);
    g.stroke();
    g.globalAlpha = 1;
  }

  // Pino do pivô
  g.fillStyle = corBorda;
  g.beginPath();
  g.arc(a.x, a.y, raioBase * 0.62, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = '#FFE9A8';
  g.beginPath();
  g.arc(a.x, a.y, raioBase * 0.3, 0, Math.PI * 2);
  g.fill();
  g.restore();
}
