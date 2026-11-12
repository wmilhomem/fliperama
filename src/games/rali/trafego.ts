/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ALTURA,
  FAIXAS_X,
  JOGADOR_Z,
  LARGURA,
  SEGMENTO_COMPRIMENTO,
} from './constantes';
import { interpolar } from './semente';
import { ProjecaoEstrada, Segmento, Trafego } from './tipos';

export function criarTrafego(
  zRelativo: number,
  faixa: number,
  velocidade: number,
  cor: string
): Trafego {
  return {
    zRelativo,
    faixa,
    velocidade,
    cor,
    ultrapassado: false,
  };
}

export function atualizarTrafego(
  carro: Trafego,
  dt: number,
  velocidadeJogador: number
): void {
  carro.zRelativo -= (velocidadeJogador - carro.velocidade) * dt;
}

export function desenharTrafegoSegmento(
  g: CanvasRenderingContext2D,
  segmento: Segmento,
  projecao: ProjecaoEstrada,
  n: number,
  trafego: Trafego[],
  tempo: number,
  noite: number
): void {
  const p1 = segmento.p1;
  const p2 = segmento.p2;

  for (const carro of trafego) {
    const posicao = (JOGADOR_Z + carro.zRelativo) / SEGMENTO_COMPRIMENTO + projecao.basePercentual;
    const nCarro = Math.floor(posicao);

    if (nCarro !== n || carro.zRelativo < -180) continue;

    const fracao = posicao - nCarro;
    const larguraPista = interpolar(p1.largura, p2.largura, fracao);
    const x = interpolar(p1.x, p2.x, fracao) + larguraPista * FAIXAS_X[carro.faixa];
    const y = interpolar(p1.y, p2.y, fracao);
    const largura = larguraPista * 0.23;
    const altura = largura * 0.62;

    if (largura < 2.2 || y < -40 || y > ALTURA + 50 || x < -120 || x > LARGURA + 120) {
      continue;
    }

    const metade = largura / 2;
    const brilho = 0.62 + Math.sin(tempo * 7 + carro.faixa) * 0.18;

    g.fillStyle = 'rgba(2,6,23,0.42)';
    g.fillRect(x - metade * 0.65, y - altura * 0.08, largura * 1.3, altura * 0.16);

    g.fillStyle = '#0F172A';
    g.fillRect(x - metade, y - altura * 0.48, largura * 0.2, altura * 0.42);
    g.fillRect(x + metade - largura * 0.2, y - altura * 0.48, largura * 0.2, altura * 0.42);

    g.fillStyle = carro.cor;
    g.fillRect(x - metade, y - altura * 0.72, largura, altura * 0.6);

    g.fillStyle = 'rgba(15,23,42,0.9)';
    g.fillRect(x - metade * 0.7, y - altura * 0.98, largura * 0.7, altura * 0.3);
    g.fillStyle = 'rgba(186,230,253,0.8)';
    g.fillRect(x - metade * 0.55, y - altura * 0.92, largura * 0.4, altura * 0.18);

    g.globalAlpha = brilho;
    g.fillStyle = '#DC2626';
    g.fillRect(x - metade * 0.8, y - altura * 0.48, largura * 0.22, altura * 0.16);
    g.fillRect(x + metade * 0.58, y - altura * 0.48, largura * 0.22, altura * 0.16);
    g.globalAlpha = 1;

    if (noite > 0.34) {
      g.globalAlpha = Math.min(0.42, noite * 0.55);
      g.fillStyle = '#F87171';
      g.fillRect(x - metade * 0.92, y - altura * 0.54, largura * 0.42, altura * 0.24);
      g.fillRect(x + metade * 0.5, y - altura * 0.54, largura * 0.42, altura * 0.24);
      g.globalAlpha = 1;
    }
  }
}
