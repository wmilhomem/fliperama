/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Arte da mesa "Noite na Gafieira".
 *
 * Salão de baile de clube carioca dos anos 70: cortinas, palco com banda,
 * bola de espelhos, lâmpadas de cor e piso de dancinha. Todos os personagens
 * são fictícios e desenhados do zero (sem pessoas reais).
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
import { CAMPO, PALETA, PAINEL_ALTURA } from './constantes';

type Ctx = CanvasRenderingContext2D;

/** Textura de bolinhas (estilo fliperama dos anos 70). */
function bolinhas(
  g: Ctx,
  x: number,
  y: number,
  largura: number,
  altura: number,
  cor: string,
  espacamento = 8,
  raio = 1.5
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

/** Cortinas do salão. */
function desenharCortina(g: Ctx, x: number, y: number, largura: number, altura: number): void {
  const dobras = Math.max(2, Math.floor(largura / 16));
  for (let i = 0; i < dobras; i++) {
    const larguraDobra = largura / dobras;
    g.fillStyle = i % 2 === 0 ? PALETA.rosa : PALETA.rosaEscuro;
    g.fillRect(x + i * larguraDobra, y, larguraDobra, altura);
    g.fillStyle = 'rgba(0,0,0,0.18)';
    g.fillRect(x + i * larguraDobra + larguraDobra - 3, y, 3, altura);
  }
  g.fillStyle = PALETA.dourado;
  g.fillRect(x, y, largura, 4);
}

/** Sambista fictício: chapéu de plumas, camisa e_tools shorts. */
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

  // Pernas
  g.fillStyle = '#7A4A2B';
  g.fillRect(-3, 0, 3, 8);
  g.fillRect(2, 0, 3, 8);
  g.fillStyle = PALETA.branco;
  g.fillRect(-4, 7, 5, 2);
  g.fillRect(2, 7, 5, 2);

  // Shorts
  g.fillStyle = PALETA.turquesa;
  g.fillRect(-5, -5, 11, 6);

  // Camisa
  g.fillStyle = PALETA.laranja;
  g.fillRect(-5, -14, 11, 10);
  g.fillStyle = PALETA.dourado;
  g.fillRect(-5, -14, 11, 2);

  // Braços
  g.fillStyle = '#7A4A2B';
  g.fillRect(-8, -13, 3, 9);
  g.fillRect(6, -13, 3, 9);

  // Cabeça
  g.fillStyle = '#8A5433';
  g.fillRect(-4, -22, 9, 8);
  g.fillStyle = '#2A1145';
  g.fillRect(-4, -24, 9, 3);
  g.fillRect(-4, -24, 2, 6);
  g.fillRect(3, -24, 2, 6);
  // Olhos
  g.fillStyle = PALETA.branco;
  g.fillRect(-1, -20, 2, 2);

  // Plumagem
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

  // Capa
  g.fillStyle = PALETA.roxo;
  g.beginPath();
  g.moveTo(0, -16);
  g.quadraticCurveTo(-16, -8, -13, 8);
  g.lineTo(0, 4);
  g.closePath();
  g.fill();
  g.fillStyle = PALETA.turquesa;
  g.fillRect(-13, 4, 13, 3);

  // Pernas
  g.fillStyle = '#C98A5B';
  g.fillRect(-4, 0, 3, 9);
  g.fillRect(2, 0, 3, 9);
  g.fillStyle = PALETA.branco;
  g.fillRect(-5, 8, 5, 2);
  g.fillRect(2, 8, 5, 2);

  // Casaco
  g.fillStyle = PALETA.turquesa;
  g.fillRect(-5, -16, 11, 12);
  g.fillStyle = PALETA.dourado;
  g.fillRect(-5, -16, 11, 2);
  g.fillRect(-1, -16, 2, 12);

  // Braços
  g.fillStyle = '#C98A5B';
  g.fillRect(-9, -15, 3, 10);
  g.fillRect(7, -15, 3, 10);

  // Cabeça
  g.fillStyle = '#C98A5B';
  g.fillRect(-4, -24, 9, 8);
  g.fillStyle = PALETA.rosaEscuro;
  g.fillRect(-3, -21, 2, 2);
  g.fillRect(2, -21, 2, 2);

  // Cartola
  g.fillStyle = PALETA.branco;
  g.fillRect(-5, -34, 11, 10);
  g.fillStyle = PALETA.rosa;
  g.fillRect(-5, -27, 11, 2);
  g.fillStyle = PALETA.branco;
  g.fillRect(-6, -36, 13, 3);

  g.restore();
}

/** Bola de espelhos (a bola do jogo). */
function desenharBolaDeEspelhos(g: Ctx, x: number, y: number, raio: number, tempo: number): void {
  g.save();
  g.fillStyle = '#C9D6E4';
  g.beginPath();
  g.arc(x, y, raio, 0, Math.PI * 2);
  g.fill();

  const tamanho = raio * 0.5;
  for (let linha = -1; linha <= 1; linha++) {
    for (let coluna = -1; coluna <= 1; coluna++) {
      const px = x + coluna * tamanho;
      const py = y + linha * tamanho;
      if (Math.hypot(px - x, py - y) > raio - 1) continue;
      const brilho = 0.5 + 0.5 * Math.sin(tempo * 3 + coluna * 1.7 + linha * 2.1);
      g.fillStyle = `rgba(255,255,255,${0.35 + brilho * 0.55})`;
      g.fillRect(px - tamanho / 2, py - tamanho / 2, tamanho, tamanho);
    }
  }

  g.strokeStyle = PALETA.dourado;
  g.lineWidth = 1;
  g.beginPath();
  g.arc(x, y, raio, 0, Math.PI * 2);
  g.stroke();
  g.restore();
}

/** Tamborim do bumper de pop. */
function desenharTamborim(g: Ctx, x: number, y: number, raio: number, brilho: number): void {
  g.save();
  g.translate(x, y);
  const escala = 1 + brilho * 0.18;
  g.scale(escala, escala);

  g.fillStyle = PALETA.roxoEscuro;
  g.beginPath();
  g.arc(0, 0, raio + 4, 0, Math.PI * 2);
  g.fill();

  g.fillStyle = brilho > 0.05 ? PALETA.dourado : PALETA.rosa;
  g.beginPath();
  g.arc(0, 0, raio, 0, Math.PI * 2);
  g.fill();

  g.strokeStyle = PALETA.douradoEscuro;
  g.lineWidth = 2;
  for (let i = 0; i < 6; i++) {
    const ang = (i / 6) * Math.PI * 2;
    g.beginPath();
    g.moveTo(Math.cos(ang) * raio * 0.3, Math.sin(ang) * raio * 0.3);
    g.lineTo(Math.cos(ang) * raio * 0.85, Math.sin(ang) * raio * 0.85);
    g.stroke();
  }

  g.fillStyle = 'rgba(255,255,255,0.75)';
  g.beginPath();
  g.arc(-raio * 0.3, -raio * 0.35, raio * 0.26, 0, Math.PI * 2);
  g.fill();

  if (brilho > 0.05) {
    g.globalAlpha = brilho * 0.5;
    g.strokeStyle = PALETA.creme;
    g.lineWidth = 3;
    g.beginPath();
    g.arc(0, 0, raio + 7, 0, Math.PI * 2);
    g.stroke();
  }
  g.restore();
}

/** Cavaquinho (alvo fixo). */
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
  // Braço e cordas
  g.fillStyle = PALETA.douradoEscuro;
  g.fillRect(largura * 0.2, -largura * 0.5, largura * 0.12, largura * 0.55);
  g.fillStyle = PALETA.creme;
  g.fillRect(largura * 0.22, -largura * 0.45, 1, largura * 0.45);
  g.restore();
}

/** Surdo (alvo fixo). */
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

/** Pandeiro do spinner. */
function desenharPandeiro(g: Ctx, x: number, y: number, angulo: number): void {
  g.save();
  g.translate(x, y);
  g.rotate(angulo);
  // Aro
  g.fillStyle = PALETA.dourado;
  g.beginPath();
  g.ellipse(0, 0, 18, 11, 0, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = PALETA.creme;
  g.beginPath();
  g.ellipse(0, 0, 14, 8, 0, 0, Math.PI * 2);
  g.fill();
  // Platinelas
  g.fillStyle = PALETA.turquesa;
  for (let i = 0; i < 6; i++) {
    const ang = (i / 6) * Math.PI * 2;
    g.beginPath();
    g.arc(Math.cos(ang) * 19, Math.sin(ang) * 12, 2.2, 0, Math.PI * 2);
    g.fill();
  }
  g.restore();
}

/** Vidro traseiro da mesa (painel de placar). */
export function desenharPainelGafieira(g: Ctx, ctx: ContextoDesenho): void {
  const largura = ctx.largura;
  const tempo = ctx.tempo;

  g.save();

  // Fundo do salão
  const fundo = g.createLinearGradient(0, 0, 0, PAINEL_ALTURA);
  fundo.addColorStop(0, '#2A0B45');
  fundo.addColorStop(1, '#120727');
  g.fillStyle = fundo;
  g.fillRect(0, 0, largura, PAINEL_ALTURA);

  // Raios de luz coloridos
  const cores = [PALETA.rosa, PALETA.turquesa, PALETA.laranja, PALETA.dourado];
  g.globalAlpha = 0.16;
  for (let i = 0; i < 4; i++) {
    const ang = -0.9 + i * 0.6 + Math.sin(tempo * 0.8 + i) * 0.08;
    g.save();
    g.translate(240, -20);
    g.rotate(ang);
    g.fillStyle = cores[i];
    g.beginPath();
    g.moveTo(0, 0);
    g.lineTo(-26, 150);
    g.lineTo(26, 150);
    g.closePath();
    g.fill();
    g.restore();
  }
  g.globalAlpha = 1;

  // Cortinas laterais
  desenharCortina(g, 0, 0, 26, PAINEL_ALTURA);
  desenharCortina(g, largura - 26, 0, 26, PAINEL_ALTURA);

  // Bola de espelhos do salão
  desenharBolaDeEspelhos(g, 32, 52, 13, tempo);

  // Título em neon
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = '13px "Press Start 2P", monospace';
  g.fillStyle = 'rgba(255, 209, 102, 0.35)';
  g.fillText('NOITE NA GAFIEIRA', 186, 52);
  g.fillStyle = PALETA.creme;
  g.fillText('NOITE NA GAFIEIRA', 186, 51);

  // Palco
  g.fillStyle = PALETA.roxoEscuro;
  g.fillRect(0, 86, 380, 10);
  g.fillStyle = PALETA.douradoEscuro;
  g.fillRect(0, 84, 380, 3);

  // Banda no palco: cavaquinho, surdo e pandeiro
  desenharCavaquinho(g, 60, 76, 26, false);
  desenharSurdo(g, 96, 74, 22, false);
  desenharPandeiro(g, 132, 72, 0.2);

  // Personagens fictícios
  desenharSambista(g, 306, 84, 0.9, PALETA.turquesa);
  desenharPassista(g, 348, 84, 0.85);

  g.restore();
}

/** Cenário do campo de jogo. */
export function desenharCenarioGafieira(g: Ctx, ctx: ContextoDesenho): void {
  const tempo = ctx.tempo;
  const largura = ctx.largura;

  g.save();

  // Chão do salão
  const chao = g.createLinearGradient(0, CAMPO.teto, 0, ctx.altura);
  chao.addColorStop(0, '#3B0F55');
  chao.addColorStop(0.55, '#1D0733');
  chao.addColorStop(1, '#0D0418');
  g.fillStyle = chao;
  g.fillRect(0, CAMPO.teto, largura, ctx.altura - CAMPO.teto);

  // Piso de dancinha (ladrilhos coloridos)
  g.globalAlpha = 0.1;
  for (let linha = 0; linha < 18; linha++) {
    for (let coluna = 0; coluna < 15; coluna++) {
      const x = 8 + coluna * 32;
      const y = CAMPO.teto + 26 + linha * 32;
      if (y > CAMPO.piso) break;
      const fase = (linha + coluna) % 3;
      g.fillStyle = fase === 0 ? PALETA.rosa : fase === 1 ? PALETA.turquesa : PALETA.laranja;
      g.fillRect(x, y, 28, 28);
    }
  }
  g.globalAlpha = 1;

  // Textura de bolinhas (estilo fliperama dos anos 70)
  bolinhas(
    g,
    0,
    CAMPO.teto + 20,
    largura,
    CAMPO.piso - CAMPO.teto - 20,
    'rgba(255,255,255,0.04)',
    12,
    1.3
  );

  // Palco no alto do campo
  g.fillStyle = PALETA.roxoEscuro;
  g.fillRect(0, CAMPO.teto, largura, 16);
  g.fillStyle = PALETA.douradoEscuro;
  g.fillRect(0, CAMPO.teto, largura, 3);

  // Faixa de lâmpadas
  for (let i = 0; i < 14; i++) {
    const x = 18 + i * 34;
    const cor = coresLampada(i, tempo);
    g.fillStyle = cor;
    g.beginPath();
    g.arc(x, CAMPO.teto + 9, 3.4, 0, Math.PI * 2);
    g.fill();
    g.globalAlpha = 0.18;
    g.beginPath();
    g.arc(x, CAMPO.teto + 9, 8, 0, Math.PI * 2);
    g.fill();
    g.globalAlpha = 1;
  }

  // Canaleta do lançador (metal)
  g.fillStyle = '#241041';
  g.fillRect(CAMPO.canaletaDireita, CAMPO.teto, largura - CAMPO.canaletaDireita, ctx.altura - CAMPO.teto);
  g.fillStyle = 'rgba(255,255,255,0.06)';
  for (let y = CAMPO.teto; y < ctx.altura; y += 8) {
    g.fillRect(CAMPO.canaletaDireita + 2, y, largura - CAMPO.canaletaDireita - 4, 3);
  }

  // Dreno inferior
  const dreno = g.createLinearGradient(0, CAMPO.piso, 0, ctx.altura);
  dreno.addColorStop(0, '#05010C');
  dreno.addColorStop(1, '#1B0630');
  g.fillStyle = dreno;
  g.fillRect(0, CAMPO.piso, largura, ctx.altura - CAMPO.piso);
  g.fillStyle = PALETA.douradoEscuro;
  g.fillRect(0, CAMPO.piso - 3, largura, 3);

  // Saída de bola (texto)
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = '7px "Press Start 2P", monospace';
  g.fillStyle = 'rgba(236, 72, 153, 0.45)';
  g.fillText('SAÍDA DA BOLA', 240, CAMPO.piso + 26);

  g.restore();
}

function coresLampada(indice: number, tempo: number): string {
  const cores = [PALETA.rosa, PALETA.dourado, PALETA.turquesa, PALETA.laranja];
  const base = cores[indice % cores.length];
  const pulso = 0.45 + 0.55 * Math.abs(Math.sin(tempo * 2.2 + indice * 0.7));
  return base;
}

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
      g.save();
      const ativo = estado.tipo === 'slingshot' && estado.animacao > 0;
      g.fillStyle = ativo ? PALETA.creme : PALETA.rosa;
      g.strokeStyle = PALETA.roxoEscuro;
      g.lineWidth = 3;
      g.beginPath();
      g.moveTo(elemento.vertices[0].x, elemento.vertices[0].y);
      g.lineTo(elemento.vertices[1].x, elemento.vertices[1].y);
      g.lineTo(elemento.vertices[2].x, elemento.vertices[2].y);
      g.closePath();
      g.fill();
      g.stroke();
      g.fillStyle = PALETA.turquesa;
      g.beginPath();
      g.arc(
        elemento.vertices[0].x,
        elemento.vertices[0].y,
        3.5,
        0,
        Math.PI * 2
      );
      g.fill();
      g.restore();
      break;
    }
    case 'alvoQueda': {
      const estadoAlvo = estado as EstadoAlvoQueda;
      const caido = estadoAlvo.caido;
      g.save();
      g.fillStyle = caido ? '#1A0730' : PALETA.dourado;
      g.strokeStyle = PALETA.roxoEscuro;
      g.lineWidth = 2;
      g.fillRect(
        elemento.x - elemento.largura / 2,
        elemento.y - elemento.altura / 2,
        elemento.largura,
        elemento.altura
      );
      g.strokeRect(
        elemento.x - elemento.largura / 2,
        elemento.y - elemento.altura / 2,
        elemento.largura,
        elemento.altura
      );
      if (!caido && elemento.rotulo) {
        g.fillStyle = PALETA.roxoEscuro;
        g.font = '10px "Press Start 2P", monospace';
        g.textAlign = 'center';
        g.textBaseline = 'middle';
        g.fillText(elemento.rotulo, elemento.x, elemento.y + 1);
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
        // Tamborim
        desenharTamborim(g, elemento.x, elemento.y, elemento.largura / 2, aceso ? 0.8 : 0);
      }
      g.restore();
      break;
    }
    case 'rollover': {
      const estadoRollover = estado as EstadoRollover;
      const aceso = estadoRollover.aceso;
      g.save();
      const altura = elemento.altura;
      const largura = elemento.largura;
      const topo = elemento.y - altura / 2;

      // Trilho da pista
      g.fillStyle = 'rgba(20, 6, 40, 0.75)';
      g.fillRect(elemento.x - largura / 2, topo, largura, altura);

      // Luz da pista
      const luz = aceso ? 1 : 0.25 + Math.sin(ctx.tempo * 4 + elemento.x) * 0.08;
      g.fillStyle = aceso ? PALETA.dourado : PALETA.turquesa;
      g.globalAlpha = luz;
      g.fillRect(elemento.x - largura / 2 + 4, topo + 6, largura - 8, altura - 12);
      g.globalAlpha = 1;

      // Bordas
      g.strokeStyle = aceso ? PALETA.creme : PALETA.turquesaClaro;
      g.lineWidth = 2;
      g.strokeRect(elemento.x - largura / 2 + 1, topo + 2, largura - 2, altura - 6);

      // Placa "PALCO"
      g.fillStyle = aceso ? PALETA.roxoEscuro : PALETA.turquesaClaro;
      g.font = '6px "Press Start 2P", monospace';
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.fillText(elemento.rotulo ?? '', elemento.x, topo + 12);

      if (aceso) {
        g.globalAlpha = 0.25 + Math.sin(ctx.tempo * 8) * 0.15;
        g.fillStyle = PALETA.dourado;
        g.fillRect(elemento.x - largura / 2 - 2, topo - 2, largura + 4, altura + 4);
        g.globalAlpha = 1;
      }
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
      const estadoCanal = estado as EstadoCanal;
      g.save();
      g.globalAlpha = estadoCanal.aceso ? 0.8 : 0.28;
      g.fillStyle = estadoCanal.aceso ? PALETA.dourado : PALETA.turquesa;
      g.fillRect(
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

/** Arte da bola (bola de espelhos). */
export function desenharBolaGafieira(g: Ctx, bola: Bola, ctx: ContextoDesenho): void {
  desenharBolaDeEspelhos(g, bola.x, bola.y, bola.raio, ctx.tempo);
}
