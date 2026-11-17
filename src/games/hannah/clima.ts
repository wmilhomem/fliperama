/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * CLIMA E CAOS POR FASE — SALVE A HANNAH
 *
 * Regra de justiça (sempre respeitada):
 *  - nenhum efeito esconde obstáculo a menos de 160 px do Zeca;
 *  - todo perigo tem aviso de pelo menos 0,6 s antes de atingir o jogador.
 */

import { ALTURA, LARGURA } from './config';

export type ClimaTela = 'limpo' | 'garoa' | 'chuva' | 'tempestade' | 'vento';

export interface EstadoClima {
  tipo: ClimaTela;
  /** Fase da animação (gotas, poeira, rajadas). */
  fase: number;
  /** Tempo até o próximo relâmpago (<=0 = agenda outro na tela seguinte). */
  raioTimer: number;
  /** X do relâmpago (definido na marcação, antes do aviso). */
  raioX: number;
  /** 1 enquanto o círculo de aviso pulsa antes da queda. */
  raioAviso: number;
  /** Intensidade do vento (px/s de empurrão). */
  ventoForca: number;
  /** Direção do vento (-1 esquerda, 1 direita). */
  ventoDirecao: 1 | -1;
  /** Flash de tela do relâmpago. */
  flash: number;
}

export function criarClima(tipo: ClimaTela): EstadoClima {
  return {
    tipo,
    fase: 0,
    raioTimer: tipo === 'tempestade' ? 4 + Math.random() * 4 : -1,
    raioX: 0,
    raioAviso: 0,
    ventoForca: 0,
    ventoDirecao: 1,
    flash: 0,
  };
}

/** Clima de cada tela do jogo. */
export const CLIMA_POR_TELA: ClimaTela[] = ['limpo', 'garoa', 'chuva', 'tempestade'];

/** Intervalo entre relâmpagos (segundos). */
const RAIO_INTERVALO_MIN = 4.5;
const RAIO_INTERVALO_MAX = 9.5;
/** Segundos de aviso pulsante antes da queda (regra de justiça: >= 0,6 s). */
const AVISO_RAIO_SEG = 0.9;

/**
 * Atualiza o clima. Retorna true no quadro em que o relâmpago atinge o
 * chão (o caller aplica o dano/pontos). O relâmpago mira onde o Zeca
 * estava quando foi marcado e o círculo de aviso pulsa nos últimos
 * 0,9 s — sempre dá para sair da coluna antes da queda.
 */
export function atualizarClima(clima: EstadoClima, dt: number, alvoX: number): boolean {
  clima.fase += dt;
  clima.flash = Math.max(0, clima.flash - dt * 4);

  let caiuRaio = false;

  if (clima.tipo === 'tempestade') {
    if (clima.raioTimer <= 0) {
      // Marca o próximo relâmpago e mira o alvo; o aviso aparece sozinho
      // nos últimos AVISO_RAIO_SEG segundos.
      clima.raioTimer = RAIO_INTERVALO_MIN + Math.random() * (RAIO_INTERVALO_MAX - RAIO_INTERVALO_MIN);
      clima.raioX = Math.max(24, Math.min(LARGURA - 24, alvoX));
    }
    clima.raioTimer -= dt;
    if (clima.raioTimer <= 0) {
      clima.flash = 1;
      caiuRaio = true;
    }
  }
  clima.raioAviso =
    clima.tipo === 'tempestade' && clima.raioTimer > 0 && clima.raioTimer <= AVISO_RAIO_SEG ? 1 : 0;

  // Rajadas de vento (tempestade empurra de leve; nunca travando o Zeca)
  if (clima.tipo === 'vento' || clima.tipo === 'tempestade') {
    if (Math.random() < 0.02) {
      clima.ventoDirecao = Math.random() < 0.5 ? -1 : 1;
      clima.ventoForca = 26 + Math.random() * 22;
    }
    clima.ventoForca = Math.max(0, clima.ventoForca - 34 * dt);
  } else {
    clima.ventoForca = 0;
  }

  return caiuRaio;
}

/** Empurra o jogador (e os barris) com o vento — suave, para não injustiçar. */
export function empurraoVento(clima: EstadoClima): number {
  return clima.ventoForca * clima.ventoDirecao;
}

/** Desenha a chuva (gotas diagonais) — Telas 2, 3 e 4. */
export function desenharChuva(g: CanvasRenderingContext2D, clima: EstadoClima, intensidade = 1): void {
  const gotas = Math.floor(70 * intensidade);
  g.save();
  g.strokeStyle = 'rgba(186, 222, 255, 0.5)';
  g.lineWidth = 1;
  for (let i = 0; i < gotas; i++) {
    const x = (i * 137 + clima.fase * 220) % (LARGURA + 40) - 20;
    const y = (i * 91 + clima.fase * 430) % (ALTURA + 40) - 20;
    g.beginPath();
    g.moveTo(x, y);
    g.lineTo(x - 4, y + 12);
    g.stroke();
  }
  g.restore();
}

/** Poeira/garoa de cimento — Tela 2. */
export function desenharPoeira(g: CanvasRenderingContext2D, clima: EstadoClima): void {
  g.save();
  g.fillStyle = 'rgba(214, 211, 209, 0.35)';
  for (let i = 0; i < 26; i++) {
    const x = (i * 149 + clima.fase * 16) % LARGURA;
    const y = (i * 71 + clima.fase * 9) % ALTURA;
    g.fillRect(Math.floor(x), Math.floor(y), 2, 2);
  }
  g.restore();
}

/** Rajada de vento visível (Tela 4) — linhas inclinadas. */
export function desenharVento(g: CanvasRenderingContext2D, clima: EstadoClima): void {
  if (clima.ventoForca < 6) return;
  g.save();
  g.strokeStyle = 'rgba(226, 232, 240, 0.28)';
  g.lineWidth = 1;
  const linhas = 6;
  for (let i = 0; i < linhas; i++) {
    const y = ((i * 97 + clima.fase * 190) % (ALTURA + 60)) - 30;
    const x = ((i * 211 + clima.fase * 320 * clima.ventoDirecao) % (LARGURA + 120)) - 60;
    g.beginPath();
    g.moveTo(x, y);
    g.lineTo(x + 26 * clima.ventoDirecao, y + 5);
    g.stroke();
  }
  g.restore();
}

/**
 * Desenha o aviso do relâmpago: círculo no chão com 1 s de aviso.
 * O círculo fica sempre visível (regra de justiça).
 */
export function desenharAvisoRaio(g: CanvasRenderingContext2D, clima: EstadoClima): void {
  if (clima.raioAviso <= 0) return;
  const pulso = 0.5 + 0.5 * Math.sin(clima.fase * 12);
  g.save();
  g.strokeStyle = `rgba(250, 204, 21, ${0.5 + pulso * 0.5})`;
  g.lineWidth = 2;
  g.beginPath();
  g.ellipse(clima.raioX, ALTURA - 26, 22, 9, 0, 0, Math.PI * 2);
  g.stroke();
  g.fillStyle = `rgba(250, 204, 21, ${0.12 + pulso * 0.18})`;
  g.fill();
  g.restore();
}

/** Flash branco da queda do raio. */
export function desenharFlashRaio(g: CanvasRenderingContext2D, clima: EstadoClima): void {
  if (clima.flash <= 0) return;
  g.save();
  g.globalAlpha = clima.flash * 0.5;
  g.fillStyle = '#FEF9C3';
  g.fillRect(0, 0, LARGURA, ALTURA);
  g.restore();
}

/**
 * Raio fraco pendurado no céu durante o aviso — mostra a coluna exata
 * onde vai cair (regra de justiça) sem atrapalhar a leitura do cenário.
 */
export function desenharRaio(g: CanvasRenderingContext2D, clima: EstadoClima): void {
  if (clima.raioAviso <= 0) return;
  const pulso = 0.5 + 0.5 * Math.sin(clima.fase * 12);
  g.save();
  g.strokeStyle = `rgba(253, 224, 71, ${0.18 + pulso * 0.22})`;
  g.lineWidth = 2;
  g.beginPath();
  g.moveTo(clima.raioX, 40);
  g.lineTo(clima.raioX - 10, 200);
  g.lineTo(clima.raioX + 8, 330);
  g.lineTo(clima.raioX - 4, ALTURA - 30);
  g.stroke();
  g.restore();
}
