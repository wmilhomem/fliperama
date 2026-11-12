/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Arte da mesa "Noite na Gafieira".
 *
 * Salão de baile de clube carioca dos anos 70: cortinas de veludo, piso de
 * dancinha em xadrez, bola de espelhos, marquise de lâmpadas, instrumentos
 * e personagens fictícios (sambistas e passistas desenhados do zero).
 *
 * O cenário estático é pré-renderizado uma vez (camada fora da tela);
 * por quadro só desenhamos o que se move (luzes, feixes, elementos).
 */

import { Bola } from '../../shared/pinball';
import {
  ContextoDesenho,
  ElementoMesa,
  EstadoAlvoFixo,
  EstadoAlvoQueda,
  EstadoBumper,
  EstadoCanal,
  EstadoElemento,
  EstadoRollover,
  EstadoSpinner,
} from '../../shared/pinball';
import * as T from './tuning';

type Ctx = CanvasRenderingContext2D;

/* ------------------------------------------------------------------ */
/* PALETA                                                              */
/* ------------------------------------------------------------------ */

const PALETA = {
  fundo: '#100422',
  fundoEscuro: '#07030F',
  roxo: '#7C3AED',
  roxoEscuro: '#2A1145',
  rosa: '#EC4899',
  rosaEscuro: '#9D174D',
  rosaClaro: '#F9A8D4',
  turquesa: '#2EC4B6',
  turquesaClaro: '#8AF0E6',
  laranja: '#FB923C',
  laranjaClaro: '#FDBA74',
  dourado: '#FFD166',
  douradoEscuro: '#D9A441',
  creme: '#FDE68A',
  branco: '#FFFFFF',
  prata: '#C7D2FE',
} as const;

/* ------------------------------------------------------------------ */
/* HELPERS DE ARTE                                                     */
/* ------------------------------------------------------------------ */

/** Textura de bolinhas (estilo fliperama dos anos 70). */
function bolinhas(
  g: Ctx,
  x: number,
  y: number,
  largura: number,
  altura: number,
  cor: string,
  espacamento = 12,
  raio = 1.4
): void {
  g.save();
  g.fillStyle = cor;
  for (let py = y + espacamento / 2; py < y + altura; py += espacamento) {
    for (let px = x + espacamento / 2; px < x + largura; px += espacamento) {
      g.beginPath();
      g.arc(px, py, raio, 0, Math.PI * 2);
      g.fill();
    }
  }
  g.restore();
}

/** Contorno grosso e escuro (deixa claro o que é colisão). */
function comContorno(
  g: Ctx,
  desenhar: () => void,
  preenchimento: string,
  corContorno = 'rgba(10, 3, 24, 0.95)',
  espessura = 3
): void {
  g.save();
  g.lineJoin = 'round';
  g.lineWidth = espessura;
  g.strokeStyle = corContorno;
  desenhar();
  g.stroke();
  g.fillStyle = preenchimento;
  desenhar();
  g.fill();
  g.restore();
}

/** Cortina de veludo. */
function desenharCortina(g: Ctx, x: number, y: number, largura: number, altura: number): void {
  const dobras = Math.max(2, Math.floor(largura / 12));
  for (let i = 0; i < dobras; i++) {
    const larguraDobra = largura / dobras;
    g.fillStyle = i % 2 === 0 ? PALETA.rosaEscuro : '#5B1140';
    g.fillRect(x + i * larguraDobra, y, larguraDobra, altura);
    g.fillStyle = 'rgba(0,0,0,0.25)';
    g.fillRect(x + i * larguraDobra + larguraDobra - 2, y, 2, altura);
  }
  g.fillStyle = PALETA.dourado;
  g.fillRect(x, y, largura, 3);
}

/** Samba/passista fictício (traços próprios, sem pessoas reais). */
function desenharSambista(
  g: Ctx,
  x: number,
  y: number,
  escala: number,
  plumagem: string
): void {
  g.save();
  g.translate(x, y);
  g.scale(escala, escala);

  g.fillStyle = '#7A4A2B';
  g.fillRect(-3, 0, 3, 8);
  g.fillRect(2, 0, 3, 8);
  g.fillStyle = PALETA.branco;
  g.fillRect(-4, 7, 5, 2);
  g.fillRect(2, 7, 5, 2);

  g.fillStyle = PALETA.turquesa;
  g.fillRect(-5, -5, 11, 6);

  g.fillStyle = PALETA.laranja;
  g.fillRect(-5, -14, 11, 10);
  g.fillStyle = PALETA.dourado;
  g.fillRect(-5, -14, 11, 2);

  g.fillStyle = '#7A4A2B';
  g.fillRect(-8, -13, 3, 9);
  g.fillRect(6, -13, 3, 9);

  g.fillStyle = '#8A5433';
  g.fillRect(-4, -22, 9, 8);
  g.fillStyle = '#2A1145';
  g.fillRect(-4, -24, 9, 3);
  g.fillRect(-4, -24, 2, 6);
  g.fillRect(3, -24, 2, 6);
  g.fillStyle = PALETA.branco;
  g.fillRect(-1, -20, 2, 2);

  g.fillStyle = plumagem;
  g.fillRect(-6, -32, 3, 9);
  g.fillRect(-1, -35, 3, 11);
  g.fillRect(4, -31, 3, 8);
  g.fillStyle = PALETA.dourado;
  g.fillRect(-5, -25, 11, 2);

  g.restore();
}

/** Passista fictício: capa esvoaçante e cartola. */
function desenharPassista(g: Ctx, x: number, y: number, escala: number): void {
  g.save();
  g.translate(x, y);
  g.scale(escala, escala);

  g.fillStyle = PALETA.roxo;
  g.beginPath();
  g.moveTo(0, -16);
  g.quadraticCurveTo(-16, -8, -13, 8);
  g.lineTo(0, 4);
  g.closePath();
  g.fill();
  g.fillStyle = PALETA.turquesa;
  g.fillRect(-13, 4, 13, 3);

  g.fillStyle = '#C98A5B';
  g.fillRect(-4, 0, 3, 9);
  g.fillRect(2, 0, 3, 9);
  g.fillStyle = PALETA.branco;
  g.fillRect(-5, 8, 5, 2);
  g.fillRect(2, 8, 5, 2);

  g.fillStyle = PALETA.turquesa;
  g.fillRect(-5, -16, 11, 12);
  g.fillStyle = PALETA.dourado;
  g.fillRect(-5, -16, 11, 2);
  g.fillRect(-1, -16, 2, 12);

  g.fillStyle = '#C98A5B';
  g.fillRect(-9, -15, 3, 10);
  g.fillRect(7, -15, 3, 10);

  g.fillStyle = '#C98A5B';
  g.fillRect(-4, -24, 9, 8);
  g.fillStyle = PALETA.rosaEscuro;
  g.fillRect(-3, -21, 2, 2);
  g.fillRect(2, -21, 2, 2);

  g.fillStyle = PALETA.branco;
  g.fillRect(-5, -34, 11, 10);
  g.fillStyle = PALETA.rosa;
  g.fillRect(-5, -27, 11, 2);
  g.fillStyle = PALETA.branco;
  g.fillRect(-6, -36, 13, 3);

  g.restore();
}

/** Bola de espelhos. */
function desenharBolaDeEspelhos(g: Ctx, x: number, y: number, raio: number, tempo: number): void {
  g.save();
  g.fillStyle = '#B9C4DA';
  g.beginPath();
  g.arc(x, y, raio, 0, Math.PI * 2);
  g.fill();

  const tamanho = raio * 0.55;
  for (let linha = -1; linha <= 1; linha++) {
    for (let coluna = -1; coluna <= 1; coluna++) {
      const px = x + coluna * tamanho;
      const py = y + linha * tamanho;
      if (Math.hypot(px - x, py - y) > raio - 1) continue;
      const brilho = 0.45 + 0.55 * Math.sin(tempo * 3 + coluna * 1.7 + linha * 2.1);
      g.fillStyle = `rgba(255,255,255,${0.3 + brilho * 0.6})`;
      g.fillRect(px - tamanho / 2, py - tamanho / 2, tamanho, tamanho);
    }
  }

  g.strokeStyle = PALETA.dourado;
  g.lineWidth = 1.5;
  g.beginPath();
  g.arc(x, y, raio, 0, Math.PI * 2);
  g.stroke();
  g.restore();
}

/** Tamborim (bumper de pop) com aro dourado, pele rosa e sombra. */
function desenharTamborim(g: Ctx, x: number, y: number, raio: number, brilho: number): void {
  g.save();

  // Sombra projetada
  g.globalAlpha = 0.35;
  g.fillStyle = '#000000';
  g.beginPath();
  g.ellipse(x + 4, y + raio * 0.5, raio * 0.95, raio * 0.4, 0, 0, Math.PI * 2);
  g.fill();
  g.globalAlpha = 1;

  // Pulo animado ao ser atingido
  const hop = brilho * 5;
  g.translate(x, y - hop);

  const escala = 1 + brilho * 0.14;
  g.scale(escala, escala);

  // Aro dourado
  comContorno(
    g,
    () => {
      g.beginPath();
      g.arc(0, 0, raio, 0, Math.PI * 2);
    },
    brilho > 0.05 ? PALETA.dourado : PALETA.douradoEscuro,
    'rgba(10, 3, 24, 0.95)',
    4
  );

  // Pele rosa
  g.fillStyle = brilho > 0.05 ? PALETA.rosaClaro : PALETA.rosa;
  g.beginPath();
  g.arc(0, 0, raio - 6, 0, Math.PI * 2);
  g.fill();

  // Craquelado do couro
  g.strokeStyle = 'rgba(90, 20, 70, 0.5)';
  g.lineWidth = 1;
  for (let i = 0; i < 8; i++) {
    const ang = (i / 8) * Math.PI * 2;
    g.beginPath();
    g.moveTo(Math.cos(ang) * 4, Math.sin(ang) * 4);
    g.lineTo(Math.cos(ang) * (raio - 6), Math.sin(ang) * (raio - 6));
    g.stroke();
  }

  g.fillStyle = 'rgba(255,255,255,0.7)';
  g.beginPath();
  g.arc(-raio * 0.3, -raio * 0.35, raio * 0.22, 0, Math.PI * 2);
  g.fill();

  if (brilho > 0.05) {
    g.globalAlpha = brilho * 0.55;
    g.strokeStyle = PALETA.creme;
    g.lineWidth = 4;
    g.beginPath();
    g.arc(0, 0, raio + 8, 0, Math.PI * 2);
    g.stroke();
    g.globalAlpha = 1;
  }

  g.restore();
}

/** Cavaquinho. */
function desenharCavaquinho(g: Ctx, x: number, y: number, largura: number, aceso: boolean): void {
  g.save();
  g.translate(x, y);
  g.fillStyle = PALETA.roxoEscuro;
  g.beginPath();
  g.ellipse(0, 2, largura * 0.42, largura * 0.36, 0, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = aceso ? PALETA.dourado : PALETA.turquesa;
  g.beginPath();
  g.ellipse(0, 2, largura * 0.34, largura * 0.28, 0, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = PALETA.branco;
  g.beginPath();
  g.arc(0, 2, largura * 0.11, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = PALETA.douradoEscuro;
  g.fillRect(largura * 0.2, -largura * 0.5, largura * 0.12, largura * 0.55);
  g.fillStyle = PALETA.creme;
  g.fillRect(largura * 0.22, -largura * 0.45, 1, largura * 0.45);
  g.restore();
}

/** Surdo. */
function desenharSurdo(g: Ctx, x: number, y: number, largura: number, aceso: boolean): void {
  g.save();
  g.translate(x, y);
  g.fillStyle = PALETA.roxoEscuro;
  g.fillRect(-largura / 2 - 2, -largura / 2 - 2, largura + 4, largura + 4);
  g.fillStyle = aceso ? PALETA.dourado : PALETA.rosa;
  g.fillRect(-largura / 2, -largura / 2, largura, largura);
  g.fillStyle = PALETA.creme;
  g.fillRect(-largura / 2, -largura / 2, largura, 4);
  g.fillRect(-largura / 2, largura / 2 - 4, largura, 4);
  g.fillStyle = 'rgba(0,0,0,0.25)';
  for (let i = 0; i < 4; i++) {
    g.fillRect(-largura / 2 + 2, -largura / 2 + 6 + i * 5, largura - 4, 2);
  }
  g.restore();
}

/** Pandeiro (spinner). */
function desenharPandeiro(g: Ctx, x: number, y: number, angulo: number): void {
  g.save();
  g.translate(x, y);
  g.rotate(angulo);
  g.fillStyle = PALETA.dourado;
  g.beginPath();
  g.ellipse(0, 0, 20, 12, 0, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = PALETA.creme;
  g.beginPath();
  g.ellipse(0, 0, 15, 8, 0, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = PALETA.turquesa;
  for (let i = 0; i < 6; i++) {
    const ang = (i / 6) * Math.PI * 2;
    g.beginPath();
    g.arc(Math.cos(ang) * 21, Math.sin(ang) * 13, 2.4, 0, Math.PI * 2);
    g.fill();
  }
  g.restore();
}

/** Seta luminosa indicando o caminho dos canais. */
function desenharSeta(g: Ctx, x: number, y: number, direcao: -1 | 1, cor: string): void {
  g.save();
  g.translate(x, y);
  g.scale(direcao, 1);
  g.fillStyle = cor;
  g.beginPath();
  g.moveTo(-7, -6);
  g.lineTo(7, 0);
  g.lineTo(-7, 6);
  g.lineTo(-3, 0);
  g.closePath();
  g.fill();
  g.restore();
}

/** Parafuso decorativo (nos cantos das guias). */
function desenharParafuso(g: Ctx, x: number, y: number): void {
  g.fillStyle = 'rgba(255, 255, 255, 0.35)';
  g.beginPath();
  g.arc(x, y, 2.4, 0, Math.PI * 2);
  g.fill();
  g.strokeStyle = 'rgba(10, 3, 24, 0.8)';
  g.lineWidth = 1;
  g.stroke();
}

/* ------------------------------------------------------------------ */
/* PAINEL (VIDRO TRASEIRO)                                             */
/* ------------------------------------------------------------------ */

/** Vidro traseiro da mesa (painel de placar). */
export function desenharPainelGafieira(g: Ctx, ctx: ContextoDesenho): void {
  const largura = ctx.largura;
  const tempo = ctx.tempo;

  g.save();

  // Fundo do salão
  const fundo = g.createLinearGradient(0, 0, 0, T.PAINEL_ALTURA);
  fundo.addColorStop(0, '#2E0A4C');
  fundo.addColorStop(1, '#120727');
  g.fillStyle = fundo;
  g.fillRect(0, 0, largura, T.PAINEL_ALTURA);

  // Raios de luz coloridos
  const cores = [PALETA.rosa, PALETA.turquesa, PALETA.laranja, PALETA.dourado];
  g.globalAlpha = 0.14;
  for (let i = 0; i < 4; i++) {
    const ang = -0.9 + i * 0.6 + Math.sin(tempo * 0.8 + i) * 0.08;
    g.save();
    g.translate(largura / 2, -24);
    g.rotate(ang);
    g.fillStyle = cores[i];
    g.beginPath();
    g.moveTo(0, 0);
    g.lineTo(-30, 170);
    g.lineTo(30, 170);
    g.closePath();
    g.fill();
    g.restore();
  }
  g.globalAlpha = 1;

  // Cortinas laterais (só na linha 1, para não cobrir o placar)
  desenharCortina(g, 0, 0, 22, T.PAINEL_ALTURA);
  desenharCortina(g, largura - 22, 0, 22, T.PAINEL_ALTURA);

  // Bola de espelhos do salão (à esquerda do título)
  desenharBolaDeEspelhos(g, T.BOLA_ESPELHOS.x, T.BOLA_ESPELHOS.y, T.BOLA_ESPELHOS.raio, tempo);

  // Personagens decorativos (posições fixas, fora do texto)
  desenharSambista(g, T.SAMBISTA_PAINEL.x, T.SAMBISTA_PAINEL.y, T.SAMBISTA_PAINEL.escala, PALETA.turquesa);
  desenharPassista(g, T.PASSISTA_PAINEL.x, T.PASSISTA_PAINEL.y, T.PASSISTA_PAINEL.escala);

  // Título em neon (linha 1 do painel) — nada cobre o texto
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = '16px "Press Start 2P", monospace';
  g.fillStyle = 'rgba(255, 209, 102, 0.4)';
  g.fillText('NOITE NA GAFIEIRA', largura / 2, 22);
  g.fillStyle = PALETA.creme;
  g.fillText('NOITE NA GAFIEIRA', largura / 2, 21);

  g.restore();
}

/* ------------------------------------------------------------------ */
/* CAMADA ESTÁTICA DO CAMPO                                            */
/* ------------------------------------------------------------------ */

/** Cenário estático do campo (pré-renderizado uma vez). */
export function desenharCamadaEstatica(g: Ctx, ctx: ContextoDesenho): void {
  const largura = ctx.largura;

  g.save();

  // Fundo do salão
  const chao = g.createLinearGradient(0, T.TOPO_CAMPO, 0, ctx.altura);
  chao.addColorStop(0, '#3A0C55');
  chao.addColorStop(0.5, '#1C0632');
  chao.addColorStop(1, '#0C0316');
  g.fillStyle = chao;
  g.fillRect(0, T.TOPO_CAMPO, largura, ctx.altura - T.TOPO_CAMPO);

  // Piso de dancinha em xadrez rosa e roxo, com leve perspectiva
  let y = T.TOPO_CAMPO + 24;
  let alturaLinha = 14;
  let linha = 0;
  while (y < T.DRENO_Y) {
    let x = -12;
    let coluna = 0;
    while (x < largura) {
      const larguraLadrilho = alturaLinha * 1.9;
      g.fillStyle = (linha + coluna) % 2 === 0 ? 'rgba(236, 72, 153, 0.16)' : 'rgba(124, 58, 237, 0.16)';
      g.fillRect(x, y, larguraLadrilho, alturaLinha);
      x += larguraLadrilho;
      coluna++;
    }
    y += alturaLinha;
    alturaLinha *= 1.07;
    linha++;
  }

  // Textura de bolinhas
  bolinhas(
    g,
    0,
    T.TOPO_CAMPO + 16,
    largura,
    T.DRENO_Y - T.TOPO_CAMPO,
    'rgba(255,255,255,0.05)',
    14,
    1.5
  );

  // Divisória entre o campo e a pista do plunger
  const divisor = g.createLinearGradient(T.CAMPO_DIREITA, 0, T.DIVISORIA, 0);
  divisor.addColorStop(0, '#1A0730');
  divisor.addColorStop(0.5, '#3A1160');
  divisor.addColorStop(1, '#1A0730');
  g.fillStyle = divisor;
  g.fillRect(T.CAMPO_DIREITA, T.TOPO_CAMPO, T.DIVISORIA - T.CAMPO_DIREITA, ctx.altura - T.TOPO_CAMPO);
  g.fillStyle = 'rgba(255, 209, 102, 0.35)';
  for (let py = T.TOPO_CAMPO; py < ctx.altura; py += 18) {
    g.fillRect(T.CAMPO_DIREITA + 2, py, T.DIVISORIA - T.CAMPO_DIREITA - 4, 3);
  }

  // Pista do plunger
  g.fillStyle = 'rgba(8, 2, 20, 0.6)';
  g.fillRect(T.DIVISORIA, T.TOPO_CAMPO, T.PISTA_DIREITA - T.DIVISORIA, ctx.altura - T.TOPO_CAMPO);
  g.fillStyle = 'rgba(255,255,255,0.05)';
  for (let py = T.TOPO_CAMPO; py < ctx.altura; py += 10) {
    g.fillRect(T.DIVISORIA + 2, py, T.PISTA_DIREITA - T.DIVISORIA - 4, 4);
  }

  // Cortinas de veludo nos cantos superiores do campo
  desenharCortina(g, 0, T.TOPO_CAMPO, 26, 90);
  desenharCortina(g, largura - 26, T.TOPO_CAMPO, 26, 90);

  // Zona do dreno
  const dreno = g.createLinearGradient(0, T.DRENO_Y, 0, ctx.altura);
  dreno.addColorStop(0, '#04010A');
  dreno.addColorStop(1, '#1B0630');
  g.fillStyle = dreno;
  g.fillRect(0, T.DRENO_Y, largura, ctx.altura - T.DRENO_Y);
  g.fillStyle = PALETA.douradoEscuro;
  g.fillRect(0, T.DRENO_Y - 3, largura, 3);
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = '12px "Press Start 2P", monospace';
  g.fillStyle = 'rgba(236, 72, 153, 0.5)';
  g.fillText('SAÍDA DA BOLA', largura / 2, T.DRENO_Y + 18);

  // Instrumentos decorativos
  for (const item of T.DECORACAO_CAMPO) {
    if (item.tipo === 'cavaquinho') desenharCavaquinho(g, item.x, item.y, 34, false);
    if (item.tipo === 'surdo') desenharSurdo(g, item.x, item.y, 30, false);
    if (item.tipo === 'pandeiro') desenharPandeiro(g, item.x, item.y, 0.3);
  }

  // Personagens ilustrados nas laterais do campo
  desenharPassista(g, T.PASSISTA_CAMPO.x, T.PASSISTA_CAMPO.y, T.PASSISTA_CAMPO.escala);
  desenharSambista(g, T.SAMBISTA_CAMPO.x, T.SAMBISTA_CAMPO.y, T.SAMBISTA_CAMPO.escala, PALETA.rosa);

  // Setas luminosas indicando o caminho dos canais
  desenharSeta(g, 96, 656, 1, 'rgba(46, 196, 182, 0.55)');
  desenharSeta(g, 440, 656, -1, 'rgba(46, 196, 182, 0.55)');
  desenharSeta(g, 120, 606, 1, 'rgba(251, 146, 60, 0.45)');
  desenharSeta(g, 416, 606, -1, 'rgba(251, 146, 60, 0.45)');

  // Parafusos nos cantos das guias
  desenharParafuso(g, T.GUIA_OUTLANE_ESQUERDA, T.ALTURA_V_FUNIL);
  desenharParafuso(g, T.GUIA_OUTLANE_DIREITA, T.ALTURA_V_FUNIL);
  desenharParafuso(g, T.FLIPPER_PIVO_ESQUERDO_X, T.FLIPPER_PIVO_Y);
  desenharParafuso(g, T.FLIPPER_PIVO_DIREITO_X, T.FLIPPER_PIVO_Y);

  // Reflexos de vidro sobre o campo
  g.save();
  g.globalAlpha = 0.05;
  g.fillStyle = PALETA.branco;
  g.beginPath();
  g.moveTo(60, T.TOPO_CAMPO);
  g.lineTo(150, T.TOPO_CAMPO);
  g.lineTo(40, ctx.altura);
  g.lineTo(-40, ctx.altura);
  g.closePath();
  g.fill();
  g.globalAlpha = 0.035;
  g.beginPath();
  g.moveTo(320, T.TOPO_CAMPO);
  g.lineTo(380, T.TOPO_CAMPO);
  g.lineTo(260, ctx.altura);
  g.lineTo(200, ctx.altura);
  g.closePath();
  g.fill();
  g.restore();

  g.restore();
}

/* ------------------------------------------------------------------ */
/* CENÁRIO ANIMADO                                                     */
/* ------------------------------------------------------------------ */

/** Camada animada do campo: marquise, feixes de holofote e reflexos. */
export function desenharCenarioAnimado(g: Ctx, ctx: ContextoDesenho): void {
  const tempo = ctx.tempo;
  const largura = ctx.largura;

  g.save();

  // Faixa de lâmpadas (marquise) piscando em sequência
  const cores = [PALETA.rosa, PALETA.dourado, PALETA.turquesa, PALETA.laranja];
  for (let i = 0; i < 18; i++) {
    const x = 14 + i * 31;
    const fase = Math.sin(tempo * 5 - i * 0.55);
    const aceso = fase > -0.2;
    g.fillStyle = aceso ? cores[i % cores.length] : 'rgba(90, 60, 120, 0.5)';
    g.beginPath();
    g.arc(x, T.TOPO_CAMPO + 9, 4, 0, Math.PI * 2);
    g.fill();
    if (aceso) {
      g.globalAlpha = 0.2;
      g.beginPath();
      g.arc(x, T.TOPO_CAMPO + 9, 10, 0, Math.PI * 2);
      g.fill();
      g.globalAlpha = 1;
    }
  }

  // Feixes de holofote varrendo o campo
  const feixes = [
    { cor: 'rgba(236, 72, 153, 0.10)', angulo: -0.55 },
    { cor: 'rgba(46, 196, 182, 0.09)', angulo: -0.1 },
    { cor: 'rgba(251, 146, 60, 0.08)', angulo: 0.35 },
  ];
  for (let i = 0; i < feixes.length; i++) {
    const feixe = feixes[i];
    const ang = feixe.angulo + Math.sin(tempo * 0.6 + i * 2) * 0.25;
    g.save();
    g.translate(140 + i * 150, T.TOPO_CAMPO + 12);
    g.rotate(ang);
    g.fillStyle = feixe.cor;
    g.beginPath();
    g.moveTo(0, 0);
    g.lineTo(-60, 640);
    g.lineTo(60, 640);
    g.closePath();
    g.fill();
    g.restore();
  }

  // Reflexos da bola de espelhos passeando pelo piso
  g.save();
  g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 6; i++) {
    const fase = tempo * 0.9 + i * 1.1;
    const x = largura / 2 + Math.cos(fase) * 190;
    const y = T.TOPO_CAMPO + 120 + ((i * 97 + tempo * 40) % (T.DRENO_Y - T.TOPO_CAMPO - 160));
    g.globalAlpha = 0.06 + 0.05 * Math.abs(Math.sin(fase));
    g.fillStyle = i % 2 === 0 ? PALETA.turquesaClaro : PALETA.rosaClaro;
    g.beginPath();
    g.ellipse(x, y, 26, 10, fase, 0, Math.PI * 2);
    g.fill();
  }
  g.restore();

  // Brilho pulsante do piso
  g.save();
  g.globalCompositeOperation = 'lighter';
  g.globalAlpha = 0.03 + 0.02 * Math.sin(tempo * 1.6);
  g.fillStyle = PALETA.rosa;
  g.fillRect(0, T.TOPO_CAMPO, largura, T.DRENO_Y - T.TOPO_CAMPO);
  g.restore();

  // Insert luminoso do multiplicador de bônus
  desenharInsertMultiplicador(g, ctx);

  g.restore();
}

/* ------------------------------------------------------------------ */
/* ELEMENTOS                                                           */
/* ------------------------------------------------------------------ */

/** Arte de cada elemento da mesa. */
export function desenharElementoGafieira(
  g: Ctx,
  elemento: ElementoMesa,
  estado: EstadoElemento,
  ctx: ContextoDesenho
): void {
  switch (elemento.tipo) {
    case 'bumper': {
      const brilho = estado.tipo === 'bumper' ? estado.brilho : 0;
      desenharTamborim(g, elemento.x, elemento.y, elemento.raio, brilho);
      break;
    }

    case 'slingshot': {
      const ativo = estado.tipo === 'slingshot' && estado.animacao > 0;
      g.save();
      const [a, b, c] = elemento.vertices;
      comContorno(
        g,
        () => {
          g.beginPath();
          g.moveTo(a.x, a.y);
          g.lineTo(b.x, b.y);
          g.lineTo(c.x, c.y);
          g.closePath();
        },
        ativo ? PALETA.creme : PALETA.rosa,
        'rgba(10, 3, 24, 0.95)',
        4
      );
      // Faixa elástica
      g.strokeStyle = ativo ? '#FFFFFF' : PALETA.turquesaClaro;
      g.lineWidth = 3;
      g.beginPath();
      g.moveTo(a.x, a.y);
      g.lineTo(b.x, b.y);
      g.stroke();
      g.fillStyle = PALETA.dourado;
      g.beginPath();
      g.arc(a.x, a.y, 4, 0, Math.PI * 2);
      g.fill();
      g.restore();
      break;
    }

    case 'alvoQueda': {
      // Insert luminoso com a letra
      const estadoAlvo = estado as EstadoAlvoQueda;
      const caido = estadoAlvo.caido;
      g.save();
      const x = elemento.x - elemento.largura / 2;
      const y = elemento.y - elemento.altura / 2;
      g.fillStyle = caido ? '#1A0730' : 'rgba(20, 8, 40, 0.9)';
      g.fillRect(x, y, elemento.largura, elemento.altura);
      g.strokeStyle = caido ? 'rgba(120, 86, 170, 0.3)' : PALETA.dourado;
      g.lineWidth = 2;
      g.strokeRect(x, y, elemento.largura, elemento.altura);
      if (!caido) {
        g.fillStyle = PALETA.dourado;
        g.font = '12px "Press Start 2P", monospace';
        g.textAlign = 'center';
        g.textBaseline = 'middle';
        g.fillText(elemento.rotulo ?? '', elemento.x, elemento.y + 1);
      }
      g.restore();
      break;
    }

    case 'alvoFixo': {
      const estadoAlvo = estado as EstadoAlvoFixo;
      const aceso = estadoAlvo.aceso;
      g.save();
      if (elemento.rotulo === 'SURDO') {
        desenharSurdo(g, elemento.x, elemento.y, elemento.largura, aceso);
      } else if (elemento.rotulo === 'CAVAQUINHO') {
        desenharCavaquinho(g, elemento.x, elemento.y, elemento.largura, aceso);
      } else {
        desenharTamborim(g, elemento.x, elemento.y, elemento.largura / 2, aceso ? 0.8 : 0);
      }
      // Insert do nome do instrumento
      g.font = '12px "Press Start 2P", monospace';
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.fillStyle = aceso ? PALETA.dourado : 'rgba(200, 180, 220, 0.55)';
      g.fillText(elemento.rotulo ?? '', elemento.x, elemento.y + elemento.altura / 2 + 10);
      g.restore();
      break;
    }

    case 'rollover': {
      // Pista do palco: insert vertical luminoso
      const estadoRollover = estado as EstadoRollover;
      const aceso = estadoRollover.aceso;
      const x = elemento.x - elemento.largura / 2;
      const y = elemento.y - elemento.altura / 2;
      g.save();
      g.fillStyle = 'rgba(16, 5, 34, 0.9)';
      g.fillRect(x, y, elemento.largura, elemento.altura);
      g.strokeStyle = aceso ? PALETA.dourado : PALETA.turquesa;
      g.lineWidth = 2;
      g.strokeRect(x, y, elemento.largura, elemento.altura);

      const luz = aceso ? 1 : 0.22 + 0.12 * Math.abs(Math.sin(ctx.tempo * 4 + elemento.x));
      g.save();
      g.globalCompositeOperation = 'lighter';
      g.globalAlpha = luz;
      g.fillStyle = aceso ? PALETA.dourado : PALETA.turquesa;
      g.fillRect(x + 4, y + 26, elemento.largura - 8, elemento.altura - 52);
      g.restore();

      g.fillStyle = aceso ? PALETA.roxoEscuro : PALETA.turquesaClaro;
      g.font = '12px "Press Start 2P", monospace';
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.fillText(elemento.rotulo ?? '', elemento.x, y + 14);
      g.restore();
      break;
    }

    case 'spinner': {
      const estadoSpinner = estado as EstadoSpinner;
      desenharPandeiro(g, elemento.x, elemento.y, estadoSpinner.angulo);
      break;
    }

    case 'inlane':
    case 'outlane': {
      // Insert do canal
      const estadoCanal = estado as EstadoCanal;
      g.save();
      const aceso = estadoCanal.aceso;
      g.fillStyle = aceso ? 'rgba(255, 209, 102, 0.85)' : 'rgba(46, 196, 182, 0.22)';
      g.fillRect(
        elemento.x - elemento.largura / 2,
        elemento.y - elemento.altura / 2,
        elemento.largura,
        elemento.altura
      );
      g.strokeStyle = aceso ? PALETA.creme : PALETA.turquesa;
      g.lineWidth = 1;
      g.strokeRect(
        elemento.x - elemento.largura / 2,
        elemento.y - elemento.altura / 2,
        elemento.largura,
        elemento.altura
      );
      g.restore();
      break;
    }

    default:
      break;
  }
}

/** Arte da bola (bola de espelhos prateada). */
export function desenharBolaGafieira(g: Ctx, bola: Bola, ctx: ContextoDesenho): void {
  g.save();
  // Sombra
  g.globalAlpha = 0.3;
  g.fillStyle = '#000000';
  g.beginPath();
  g.ellipse(bola.x + 3, bola.y + bola.raio * 0.7, bola.raio * 0.8, bola.raio * 0.35, 0, 0, Math.PI * 2);
  g.fill();
  g.globalAlpha = 1;

  desenharBolaDeEspelhos(g, bola.x, bola.y, bola.raio, ctx.tempo);

  // Brilho claro (a bola sempre se destaca do fundo)
  g.fillStyle = 'rgba(255,255,255,0.85)';
  g.beginPath();
  g.arc(bola.x - 2.5, bola.y - 3, bola.raio * 0.28, 0, Math.PI * 2);
  g.fill();
  g.restore();
}

/** Insert do multiplicador de bônus (desenhado junto ao estado da mesa). */
export function desenharInsertMultiplicador(g: Ctx, ctx: ContextoDesenho): void {
  const multiplicador = ctx.estado.multiplicador;
  if (multiplicador <= 1) return;
  g.save();
  g.fillStyle = 'rgba(16, 5, 34, 0.9)';
  g.fillRect(232, 548, 72, 22);
  g.strokeStyle = PALETA.dourado;
  g.lineWidth = 2;
  g.strokeRect(232, 548, 72, 22);
  g.fillStyle = PALETA.dourado;
  g.font = '12px "Press Start 2P", monospace';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText(`x${multiplicador}`, 268, 560);
  g.restore();
}
