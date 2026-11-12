/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Arte da mesa "Expedição Astro".
 *
 * Exploração espacial original: céu azul-marinho muito escuro, nebulosas
 * em roxo e ciano, planetas com anéis, uma bola de espelhos de Ficção
 * sideral e um astronauta fictício desenhado do zero.
 *
 * O cenário estático é pré-renderizado uma vez (camada fora da tela);
 * por quadro só desenhamos o que se move (estrelas, cometas, inserts).
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
  marinho: '#050B1E',
  marinhoClaro: '#0B1A38',
  roxo: '#8B5CF6',
  roxoEscuro: '#3B1D78',
  ciano: '#22D3EE',
  cianoClaro: '#A5F3FC',
  azul: '#38BDF8',
  azulEscuro: '#1E3A8A',
  amarelo: '#FACC15',
  vermelho: '#EF4444',
  vermelhoClaro: '#FCA5A5',
  prata: '#E2E8F0',
  branco: '#FFFFFF',
} as const;

/* ------------------------------------------------------------------ */
/* HELPERS                                                             */
/* ------------------------------------------------------------------ */

/** Gerador determinístico (as estrelas não "piscam" de forma aleatória). */
function criarRng(semente: number): () => number {
  let estado = semente >>> 0;
  return () => {
    estado = (estado * 1664525 + 1013904223) >>> 0;
    return estado / 4294967296;
  };
}

interface Estrela {
  x: number;
  y: number;
  tamanho: number;
  fase: number;
  camada: number;
}

/** Campo de estrelas com 3 camadas de paralaxe. */
const ESTRELAS: Estrela[] = (() => {
  const rng = criarRng(0x5a3f21);
  const lista: Estrela[] = [];
  for (let camada = 0; camada < 3; camada++) {
    const quantidade = [46, 34, 22][camada];
    for (let i = 0; i < quantidade; i++) {
      lista.push({
        x: rng() * T.LARGURA,
        y: T.PAINEL_ALTURA + rng() * (T.ALTURA - T.PAINEL_ALTURA),
        tamanho: [1, 1.6, 2.4][camada],
        fase: rng() * Math.PI * 2,
        camada,
      });
    }
  }
  return lista;
})();

/** Contorno grosso e escuro (deixa claro o que é colisão). */
function comContorno(
  g: Ctx,
  desenhar: () => void,
  preenchimento: string,
  corContorno = 'rgba(3, 6, 20, 0.95)',
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

/** Astronauta fictício (traços próprios, sem pessoas reais). */
function desenharAstronauta(g: Ctx, x: number, y: number, escala: number): void {
  g.save();
  g.translate(x, y);
  g.scale(escala, escala);

  // Mochila de propulsão
  g.fillStyle = PALETA.azulEscuro;
  g.fillRect(-11, -16, 5, 16);
  g.fillStyle = PALETA.ciano;
  g.fillRect(-10, -2, 3, 4);

  // Pernas
  g.fillStyle = PALETA.prata;
  g.fillRect(-6, -2, 5, 10);
  g.fillRect(2, -2, 5, 10);
  g.fillStyle = PALETA.azulEscuro;
  g.fillRect(-7, 7, 7, 3);
  g.fillRect(1, 7, 7, 3);

  // Corpo
  g.fillStyle = PALETA.prata;
  g.fillRect(-7, -16, 15, 15);
  g.fillStyle = PALETA.azul;
  g.fillRect(-7, -8, 15, 4);
  g.fillStyle = PALETA.branco;
  g.fillRect(-4, -13, 9, 4);

  // Braços
  g.fillStyle = PALETA.prata;
  g.fillRect(-11, -14, 4, 11);
  g.fillRect(8, -14, 4, 11);
  g.fillStyle = PALETA.azulEscuro;
  g.fillRect(-12, -4, 5, 3);
  g.fillRect(8, -4, 5, 3);

  // Capacete
  g.fillStyle = PALETA.prata;
  g.fillRect(-8, -32, 17, 16);
  g.fillStyle = '#0B1A38';
  g.fillRect(-6, -30, 13, 11);
  g.fillStyle = PALETA.cianoClaro;
  g.fillRect(-4, -28, 5, 3);
  g.fillStyle = PALETA.branco;
  g.fillRect(-5, -28, 3, 2);
  g.fillStyle = PALETA.vermelho;
  g.fillRect(6, -26, 3, 3);

  g.restore();
}

/** Planeta em pixel art (com anel e lua opcional). */
function desenharPlaneta(
  g: Ctx,
  x: number,
  y: number,
  raio: number,
  cor: 'ciano' | 'roxo' | 'amarelo' | 'azul'
): void {
  const corpo =
    cor === 'ciano'
      ? PALETA.ciano
      : cor === 'roxo'
        ? PALETA.roxo
        : cor === 'amarelo'
          ? PALETA.amarelo
          : PALETA.azul;

  g.save();
  g.translate(x, y);

  // Anel
  g.strokeStyle = cor === 'amarelo' ? PALETA.vermelhoClaro : PALETA.cianoClaro;
  g.lineWidth = 2;
  g.beginPath();
  g.ellipse(0, 0, raio * 1.7, raio * 0.5, -0.35, 0, Math.PI * 2);
  g.stroke();

  // Corpo
  g.fillStyle = corpo;
  g.beginPath();
  g.arc(0, 0, raio, 0, Math.PI * 2);
  g.fill();

  // Sombreado
  g.fillStyle = 'rgba(3, 6, 20, 0.35)';
  g.beginPath();
  g.arc(raio * 0.3, raio * 0.25, raio * 0.85, 0, Math.PI * 2);
  g.fill();

  // Faixa
  g.fillStyle = 'rgba(3, 6, 20, 0.22)';
  g.fillRect(-raio, -raio * 0.2, raio * 2, raio * 0.28);

  // Lua
  g.fillStyle = PALETA.prata;
  g.beginPath();
  g.arc(-raio * 1.6, -raio * 0.8, 3, 0, Math.PI * 2);
  g.fill();

  g.restore();
}

/** Cometa (bumper de pop) com aro metálico, núcleo e cauda luminosa. */
function desenharCometa(g: Ctx, x: number, y: number, raio: number, brilho: number): void {
  g.save();
  g.translate(x, y);

  // Cauda luminosa
  const cauda = g.createLinearGradient(-raio, -raio * 0.8, -raio * 2.6, -raio * 1.6);
  cauda.addColorStop(0, 'rgba(34, 211, 238, 0.85)');
  cauda.addColorStop(1, 'rgba(34, 211, 238, 0)');
  g.fillStyle = cauda;
  g.beginPath();
  g.moveTo(-raio * 0.6, -raio * 0.6);
  g.lineTo(-raio * 2.8, -raio * 1.8);
  g.lineTo(-raio * 1.2, raio * 0.2);
  g.closePath();
  g.fill();

  const hop = brilho * 5;
  g.translate(0, -hop);
  const escala = 1 + brilho * 0.16;
  g.scale(escala, escala);

  // Aro metálico
  comContorno(
    g,
    () => {
      g.beginPath();
      g.arc(0, 0, raio, 0, Math.PI * 2);
    },
    brilho > 0.05 ? PALETA.amarelo : PALETA.prata,
    'rgba(3, 6, 20, 0.95)',
    4
  );

  // Núcleo luminoso
  g.fillStyle = brilho > 0.05 ? PALETA.branco : PALETA.ciano;
  g.beginPath();
  g.arc(0, 0, raio - 6, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = 'rgba(255,255,255,0.75)';
  g.beginPath();
  g.arc(-raio * 0.28, -raio * 0.3, raio * 0.22, 0, Math.PI * 2);
  g.fill();

  if (brilho > 0.05) {
    g.globalAlpha = brilho * 0.55;
    g.strokeStyle = PALETA.cianoClaro;
    g.lineWidth = 4;
    g.beginPath();
    g.arc(0, 0, raio + 8, 0, Math.PI * 2);
    g.stroke();
    g.globalAlpha = 1;
  }

  g.restore();
}

/** Antena parabólica (spinner). */
function desenharAntena(g: Ctx, x: number, y: number, angulo: number): void {
  g.save();
  g.translate(x, y);
  g.rotate(angulo);
  // Haste
  g.fillStyle = PALETA.prata;
  g.fillRect(-3, -12, 6, 24);
  // dishes
  g.fillStyle = PALETA.azul;
  g.beginPath();
  g.arc(0, 0, 15, Math.PI * 0.15, Math.PI * 0.85, true);
  g.closePath();
  g.fill();
  g.strokeStyle = PALETA.cianoClaro;
  g.lineWidth = 2;
  g.stroke();
  // Focal
  g.fillStyle = PALETA.amarelo;
  g.fillRect(-2, -14, 4, 5);
  g.restore();
}

/** Seta luminosa indicando o caminho. */
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

/** Parafuso decorativo. */
function desenharParafuso(g: Ctx, x: number, y: number): void {
  g.fillStyle = 'rgba(226, 232, 240, 0.35)';
  g.beginPath();
  g.arc(x, y, 2.4, 0, Math.PI * 2);
  g.fill();
  g.strokeStyle = 'rgba(3, 6, 20, 0.8)';
  g.lineWidth = 1;
  g.stroke();
}

/* ------------------------------------------------------------------ */
/* PAINEL (VIDRO TRASEIRO)                                             */
/* ------------------------------------------------------------------ */

/** Vidro traseiro da mesa. */
export function desenharPainelAstro(g: Ctx, ctx: ContextoDesenho): void {
  const largura = ctx.largura;
  const tempo = ctx.tempo;

  g.save();

  const fundo = g.createLinearGradient(0, 0, 0, T.PAINEL_ALTURA);
  fundo.addColorStop(0, '#0A1740');
  fundo.addColorStop(1, '#04091C');
  g.fillStyle = fundo;
  g.fillRect(0, 0, largura, T.PAINEL_ALTURA);

  // Nebulosas do painel
  g.globalAlpha = 0.3;
  const nebulosa = g.createRadialGradient(120, 20, 4, 120, 20, 90);
  nebulosa.addColorStop(0, PALETA.roxo);
  nebulosa.addColorStop(1, 'rgba(139, 92, 246, 0)');
  g.fillStyle = nebulosa;
  g.fillRect(0, 0, 200, T.PAINEL_ALTURA);
  g.globalAlpha = 0.22;
  const nebulosa2 = g.createRadialGradient(470, 30, 4, 470, 30, 80);
  nebulosa2.addColorStop(0, PALETA.ciano);
  nebulosa2.addColorStop(1, 'rgba(34, 211, 238, 0)');
  g.fillStyle = nebulosa2;
  g.fillRect(360, 0, 120, T.PAINEL_ALTURA);
  g.globalAlpha = 1;

  // Astronauta (à esquerda do título)
  desenharAstronauta(g, T.ASTRONAUTA_PAINEL.x, T.ASTRONAUTA_PAINEL.y, T.ASTRONAUTA_PAINEL.escala);

  // Planeta (à direita do título)
  desenharPlaneta(g, T.PLANETA_PAINEL.x, T.PLANETA_PAINEL.y, T.PLANETA_PAINEL.raio, 'ciano');

  // Título em neon (linha 1 do painel) — nada cobre o texto
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = '16px "Press Start 2P", monospace';
  g.fillStyle = 'rgba(34, 211, 238, 0.4)';
  g.fillText('EXPEDIÇÃO ASTRO', largura / 2, 22);
  g.fillStyle = PALETA.cianoClaro;
  g.fillText('EXPEDIÇÃO ASTRO', largura / 2, 21);

  // Brilho de varredura
  g.globalAlpha = 0.08 + 0.04 * Math.sin(tempo * 1.6);
  g.fillStyle = PALETA.cianoClaro;
  g.fillRect(0, 0, largura, 2);
  g.globalAlpha = 1;

  g.restore();
}

/* ------------------------------------------------------------------ */
/* CAMADA ESTÁTICA DO CAMPO                                            */
/* ------------------------------------------------------------------ */

/** Cenário estático do campo (pré-renderizado uma vez). */
export function desenharCamadaEstatica(g: Ctx, ctx: ContextoDesenho): void {
  const largura = ctx.largura;

  g.save();

  // Céu azul-marinho muito escuro
  const ceu = g.createLinearGradient(0, T.PAINEL_ALTURA, 0, ctx.altura);
  ceu.addColorStop(0, '#0A1738');
  ceu.addColorStop(0.45, '#060F28');
  ceu.addColorStop(1, '#030818');
  g.fillStyle = ceu;
  g.fillRect(0, T.PAINEL_ALTURA, largura, ctx.altura - T.PAINEL_ALTURA);

  // Nebulosas em roxo e ciano
  const nebulosas = [
    { x: 120, y: 240, r: 170, cor: PALETA.roxo, alpha: 0.16 },
    { x: 430, y: 330, r: 150, cor: PALETA.ciano, alpha: 0.12 },
    { x: 260, y: 640, r: 190, cor: PALETA.roxo, alpha: 0.1 },
  ];
  for (const nebulosa of nebulosas) {
    const gradiente = g.createRadialGradient(
      nebulosa.x,
      nebulosa.y,
      6,
      nebulosa.x,
      nebulosa.y,
      nebulosa.r
    );
    gradiente.addColorStop(0, nebulosa.cor);
    gradiente.addColorStop(1, 'rgba(0,0,0,0)');
    g.globalAlpha = nebulosa.alpha;
    g.fillStyle = gradiente;
    g.beginPath();
    g.arc(nebulosa.x, nebulosa.y, nebulosa.r, 0, Math.PI * 2);
    g.fill();
  }
  g.globalAlpha = 1;

  // Linhas finas de órbita ligando as 5 estações
  g.strokeStyle = 'rgba(34, 211, 238, 0.22)';
  g.lineWidth = 1;
  g.beginPath();
  g.moveTo(T.ESTACOES[0].x, T.ESTACOES[0].y);
  for (let i = 1; i < T.ESTACOES.length; i++) {
    g.lineTo(T.ESTACOES[i].x, T.ESTACOES[i].y);
  }
  g.stroke();
  g.beginPath();
  g.ellipse(268, 380, 150, 240, 0, 0, Math.PI * 2);
  g.stroke();

  // Planetas decorativos nas laterais
  for (const planeta of T.PLANETAS_CAMPO) {
    desenharPlaneta(
      g,
      planeta.x,
      planeta.y,
      planeta.raio,
      planeta.cor as 'ciano' | 'roxo' | 'amarelo'
    );
  }

  // Setas luminosas indicando rampas e canais
  for (const seta of T.SETAS) {
    desenharSeta(g, seta.x, seta.y, seta.direcao as -1 | 1, 'rgba(34, 211, 238, 0.35)');
  }

  // Parafusos nos cantos das guias
  for (const parafuso of T.PARAFUSOS) {
    desenharParafuso(g, parafuso.x, parafuso.y);
  }

  // Reflexos de vidro sobre o campo
  g.save();
  g.globalAlpha = 0.04;
  g.fillStyle = PALETA.cianoClaro;
  g.beginPath();
  g.moveTo(40, T.PAINEL_ALTURA);
  g.lineTo(130, T.PAINEL_ALTURA);
  g.lineTo(20, ctx.altura);
  g.lineTo(-60, ctx.altura);
  g.closePath();
  g.fill();
  g.globalAlpha = 0.03;
  g.fillStyle = PALETA.branco;
  g.beginPath();
  g.moveTo(330, T.PAINEL_ALTURA);
  g.lineTo(390, T.PAINEL_ALTURA);
  g.lineTo(280, ctx.altura);
  g.lineTo(220, ctx.altura);
  g.closePath();
  g.fill();
  g.restore();

  g.restore();
}

/* ------------------------------------------------------------------ */
/* CENÁRIO ANIMADO                                                     */
/* ------------------------------------------------------------------ */

/** Camada animada: estrelas piscando em 3 camadas de paralaxe. */
export function desenharCenarioAnimado(g: Ctx, ctx: ContextoDesenho): void {
  const tempo = ctx.tempo;

  g.save();

  // Estrelas com deriva (paralaxe sutil)
  for (const estrela of ESTRELAS) {
    const deriva = [6, 11, 18][estrela.camada];
    const y = estrela.y + Math.sin(tempo * 0.35 + estrela.fase) * deriva;
    const x = estrela.x + Math.cos(tempo * 0.22 + estrela.fase) * deriva * 0.6;
    const brilho = 0.35 + 0.65 * Math.abs(Math.sin(tempo * (1.2 + estrela.camada * 0.7) + estrela.fase));
    g.globalAlpha = brilho * [0.5, 0.7, 0.95][estrela.camada];
    g.fillStyle = estrela.camada === 2 ? PALETA.branco : PALETA.cianoClaro;
    g.fillRect(
      Math.round(x),
      Math.round(y),
      estrela.tamanho,
      estrela.tamanho
    );
  }
  g.globalAlpha = 1;

  // Pulso suave do céu
  g.globalCompositeOperation = 'lighter';
  g.globalAlpha = 0.02 + 0.015 * Math.sin(tempo * 1.1);
  g.fillStyle = PALETA.azul;
  g.fillRect(0, T.PAINEL_ALTURA, ctx.largura, ctx.altura - T.PAINEL_ALTURA);
  g.globalCompositeOperation = 'source-over';
  g.globalAlpha = 1;

  g.restore();
}

/* ------------------------------------------------------------------ */
/* ELEMENTOS                                                           */
/* ------------------------------------------------------------------ */

/** Arte de cada elemento da mesa. */
export function desenharElementoAstro(
  g: Ctx,
  elemento: ElementoMesa,
  estado: EstadoElemento,
  ctx: ContextoDesenho
): void {
  switch (elemento.tipo) {
    case 'bumper': {
      const brilho = estado.tipo === 'bumper' ? estado.brilho : 0;
      desenharCometa(g, elemento.x, elemento.y, elemento.raio, brilho);
      break;
    }

    case 'alvoQueda': {
      // Insert luminoso com a letra
      const estadoAlvo = estado as EstadoAlvoQueda;
      const caido = estadoAlvo.caido;
      g.save();
      const x = elemento.x - elemento.largura / 2;
      const y = elemento.y - elemento.altura / 2;
      g.fillStyle = caido ? '#0A1024' : 'rgba(6, 12, 32, 0.92)';
      g.fillRect(x, y, elemento.largura, elemento.altura);
      g.strokeStyle = caido ? 'rgba(56, 189, 248, 0.25)' : PALETA.amarelo;
      g.lineWidth = 2;
      g.strokeRect(x, y, elemento.largura, elemento.altura);
      if (!caido) {
        g.fillStyle = PALETA.amarelo;
        g.font = '12px "Press Start 2P", monospace';
        g.textAlign = 'center';
        g.textBaseline = 'middle';
        g.fillText(elemento.rotulo ?? '', elemento.x, elemento.y + 1);
      }
      g.restore();
      break;
    }

    case 'rollover': {
      // Estação acesa (insert vertical com nome)
      const estadoRollover = estado as EstadoRollover;
      const aceso = estadoRollover.aceso;
      g.save();
      const x = elemento.x - elemento.largura / 2;
      const y = elemento.y - elemento.altura / 2;
      g.fillStyle = 'rgba(6, 12, 32, 0.92)';
      g.fillRect(x, y, elemento.largura, elemento.altura);
      g.strokeStyle = aceso ? PALETA.cianoClaro : PALETA.azulEscuro;
      g.lineWidth = 2;
      g.strokeRect(x, y, elemento.largura, elemento.altura);

      if (aceso) {
        g.save();
        g.globalCompositeOperation = 'lighter';
        g.globalAlpha = 0.35;
        g.fillStyle = PALETA.ciano;
        g.fillRect(x + 2, y + 2, elemento.largura - 4, elemento.altura - 4);
        g.restore();
      }

      g.fillStyle = aceso ? PALETA.branco : PALETA.azul;
      g.font = '12px "Press Start 2P", monospace';
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.fillText(elemento.rotulo ?? '', elemento.x, elemento.y + 1);
      g.restore();
      break;
    }

    case 'alvoFixo': {
      // Planeta (alvo fixo)
      const estadoAlvo = estado as EstadoAlvoFixo;
      const aceso = estadoAlvo.aceso;
      g.save();
      const cor = elemento.rotulo === 'ROXO' ? 'roxo' : 'azul';
      desenharPlaneta(g, elemento.x, elemento.y, elemento.largura / 2, cor);
      if (aceso) {
        g.globalCompositeOperation = 'lighter';
        g.globalAlpha = 0.3;
        g.fillStyle = PALETA.cianoClaro;
        g.beginPath();
        g.arc(elemento.x, elemento.y, elemento.largura * 0.8, 0, Math.PI * 2);
        g.fill();
        g.globalCompositeOperation = 'source-over';
        g.globalAlpha = 1;
      }
      g.font = '12px "Press Start 2P", monospace';
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.fillStyle = aceso ? PALETA.cianoClaro : 'rgba(148, 190, 230, 0.6)';
      g.fillText(elemento.rotulo ?? '', elemento.x, elemento.y + elemento.altura / 2 + 9);
      g.restore();
      break;
    }

    case 'spinner': {
      const estadoSpinner = estado as EstadoSpinner;
      desenharAntena(g, elemento.x, elemento.y, estadoSpinner.angulo);
      break;
    }

    case 'slingshot': {
      // Slingshot metálico com brilho ciano
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
        ativo ? PALETA.branco : PALETA.azulEscuro,
        'rgba(3, 6, 20, 0.95)',
        4
      );
      g.strokeStyle = ativo ? PALETA.branco : PALETA.cianoClaro;
      g.lineWidth = 3;
      g.beginPath();
      g.moveTo(a.x, a.y);
      g.lineTo(b.x, b.y);
      g.stroke();
      g.fillStyle = PALETA.amarelo;
      g.beginPath();
      g.arc(a.x, a.y, 4, 0, Math.PI * 2);
      g.fill();
      g.restore();
      break;
    }

    case 'inlane':
    case 'outlane': {
      const estadoCanal = estado as EstadoCanal;
      g.save();
      const aceso = estadoCanal.aceso;
      g.fillStyle = aceso ? 'rgba(255, 204, 21, 0.8)' : 'rgba(34, 211, 238, 0.2)';
      g.fillRect(
        elemento.x - elemento.largura / 2,
        elemento.y - elemento.altura / 2,
        elemento.largura,
        elemento.altura
      );
      g.strokeStyle = aceso ? PALETA.amarelo : PALETA.ciano;
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

/** Arte da bola (prateada, com brilho claro). */
export function desenharBolaAstro(g: Ctx, bola: Bola, ctx: ContextoDesenho): void {
  g.save();
  g.globalAlpha = 0.3;
  g.fillStyle = '#000000';
  g.beginPath();
  g.ellipse(bola.x + 3, bola.y + bola.raio * 0.7, bola.raio * 0.8, bola.raio * 0.35, 0, 0, Math.PI * 2);
  g.fill();
  g.globalAlpha = 1;

  g.fillStyle = PALETA.prata;
  g.beginPath();
  g.arc(bola.x, bola.y, bola.raio, 0, Math.PI * 2);
  g.fill();

  g.fillStyle = 'rgba(148, 197, 255, 0.55)';
  g.beginPath();
  g.arc(bola.x - 2, bola.y - 2, bola.raio * 0.6, 0, Math.PI * 2);
  g.fill();

  g.fillStyle = PALETA.branco;
  g.beginPath();
  g.arc(bola.x - 2.5, bola.y - 3, bola.raio * 0.28, 0, Math.PI * 2);
  g.fill();

  g.restore();
  void ctx;
}
