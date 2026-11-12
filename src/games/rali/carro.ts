/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { InputState } from '../../engine/types';
import { ALTURA, FAIXAS_X, JOGADOR_X_MAX, LARGURA } from './constantes';
import { clamp } from './semente';
import { Jogador } from './tipos';

export function criarJogador(): Jogador {
  return {
    x: FAIXAS_X[2],
    velocidadeLateral: 0,
    inclinacao: 0,
    derrapagem: 0,
  };
}

export function atualizarJogador(
  jogador: Jogador,
  dt: number,
  input: InputState,
  aderencia: number,
  velocidadeNormalizada: number,
  offroad: boolean
): void {
  const direcao = (input.direita ? 1 : 0) - (input.esquerda ? 1 : 0);
  const resposta = (3.4 + aderencia * 5.4) * (offroad ? 0.62 : 1);
  const forca = (1.15 + velocidadeNormalizada * 1.25) * (0.35 + velocidadeNormalizada * 0.65);
  const alvo = direcao * forca;

  jogador.velocidadeLateral +=
    (alvo - jogador.velocidadeLateral) * Math.min(1, resposta * dt);
  jogador.x += jogador.velocidadeLateral * dt;
  jogador.x = clamp(jogador.x, -JOGADOR_X_MAX, JOGADOR_X_MAX);

  if (Math.abs(jogador.x) >= JOGADOR_X_MAX - 0.005) {
    jogador.velocidadeLateral *= 0.45;
  }

  const inclinacaoAlvo = clamp(jogador.velocidadeLateral * 0.11, -0.17, 0.17);
  jogador.inclinacao += (inclinacaoAlvo - jogador.inclinacao) * Math.min(1, dt * 11);

  const derrapando =
    aderencia < 0.8 && Math.abs(direcao) > 0 && velocidadeNormalizada > 0.42;
  jogador.derrapagem = clamp(
    jogador.derrapagem + (derrapando ? 1.45 : -2.2) * dt,
    0,
    1
  );
}

export function desenharFarois(g: CanvasRenderingContext2D, noite: number): void {
  if (noite < 0.2) return;

  const intensidade = Math.min(1, (noite - 0.12) / 0.55);

  g.save();
  g.globalAlpha = 0.2 * intensidade;
  g.fillStyle = '#FEF3C7';
  g.beginPath();
  g.moveTo(LARGURA / 2 - 22, ALTURA - 34);
  g.lineTo(88, 322);
  g.lineTo(392, 322);
  g.lineTo(LARGURA / 2 + 22, ALTURA - 34);
  g.closePath();
  g.fill();

  g.globalAlpha = 0.1 * intensidade;
  g.beginPath();
  g.moveTo(LARGURA / 2 - 18, ALTURA - 34);
  g.lineTo(166, 368);
  g.lineTo(314, 368);
  g.lineTo(LARGURA / 2 + 18, ALTURA - 34);
  g.closePath();
  g.fill();
  g.restore();
}

export function desenharJogador(
  g: CanvasRenderingContext2D,
  jogador: Jogador,
  tempo: number,
  noite: number
): void {
  g.save();
  g.translate(LARGURA / 2, ALTURA - 36);
  g.rotate(jogador.inclinacao);

  g.fillStyle = 'rgba(2,6,23,0.48)';
  g.beginPath();
  g.ellipse(0, 18, 31, 7, 0, 0, Math.PI * 2);
  g.fill();

  g.fillStyle = '#0F172A';
  g.fillRect(-31, -9, 10, 34);
  g.fillRect(21, -9, 10, 34);
  g.fillStyle = '#334155';
  g.fillRect(-29, -4, 6, 24);
  g.fillRect(23, -4, 6, 24);

  g.fillStyle = '#7C2D12';
  g.fillRect(-26, -47, 52, 56);
  g.fillStyle = '#C2410C';
  g.fillRect(-23, 4, 46, 10);
  g.fillStyle = '#EA580C';
  g.fillRect(-23, -41, 46, 47);
  g.fillStyle = '#F97316';
  g.fillRect(-20, -34, 40, 34);

  g.fillStyle = '#1E293B';
  g.fillRect(-17, -55, 34, 20);
  g.fillStyle = '#0E7490';
  g.fillRect(-14, -52, 28, 13);
  g.fillStyle = '#67E8F9';
  g.fillRect(-11, -50, 9, 9);
  g.fillRect(2, -50, 9, 9);

  g.fillStyle = '#0F172A';
  g.fillRect(-28, -59, 56, 5);
  g.fillRect(-22, -55, 4, 9);
  g.fillRect(18, -55, 4, 9);

  g.fillStyle = '#FEF3C7';
  g.fillRect(-3, -39, 6, 44);
  g.fillStyle = '#0F172A';
  g.fillRect(-5, -8, 10, 12);
  g.fillStyle = '#FFFFFF';
  g.fillRect(-2, -5, 4, 6);

  g.fillStyle = '#EF4444';
  g.fillRect(-20, 4, 12, 7);
  g.fillRect(8, 4, 12, 7);

  if (noite > 0.3) {
    g.globalAlpha = Math.min(0.55, noite * 0.75);
    g.fillStyle = '#F87171';
    g.fillRect(-27, 1, 20, 12);
    g.fillRect(7, 1, 20, 12);
    g.globalAlpha = 1;
  }

  if (jogador.derrapagem > 0.45) {
    g.globalAlpha = jogador.derrapagem * 0.3;
    g.fillStyle = '#E2E8F0';
    g.fillRect(-34 + Math.sin(tempo * 30) * 4, -2, 8, 3);
    g.fillRect(26 + Math.cos(tempo * 27) * 4, -2, 8, 3);
    g.globalAlpha = 1;
  }

  g.restore();
}
