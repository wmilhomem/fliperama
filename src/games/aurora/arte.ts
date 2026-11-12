/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SpriteUtils } from '../../engine/types';
import { Ave, Canhao, Chefe, Orbe, TiroJogador, TipoAve } from './tipos';

const PALETA_CANHAO = {
  G: '#1e293b',
  S: '#94a3b8',
  C: '#22d3ee',
  W: '#f8fafc',
  V: '#a78bfa',
};

const PALETA_CANHAO_APAGADO = {
  G: '#111827',
  S: '#334155',
  C: '#1e3a5f',
  W: '#475569',
  V: '#3730a3',
};

const MATRIZ_CANHAO = [
  '....GGGG....',
  '...GSSSSG...',
  '...GSSSSG...',
  '..GGSSSSGG..',
  '.GSSSSSSSSG.',
  'GSSCCCCCCSSG',
  'GGGGGGGGGGGG',
  '.GGGGGGGGGG.',
];

const MATRIZ_MINI_CANHAO = [
  '...GG...',
  '..GSSG..',
  '..GSSG..',
  '.GSSSSG.',
  'GSSCCSSG',
  'GGGGGGGG',
  '.GGGGGG.',
  '........',
];

const PALETA_AVE = {
  B: '#4c1d95',
  L: '#a78bfa',
  E: '#22d3ee',
  K: '#0f172a',
  W: '#f8fafc',
};

const PALETA_AVE_MERGULHO = {
  B: '#7f1d1d',
  L: '#fca5a5',
  E: '#fde047',
  K: '#450a0a',
  W: '#fff7ed',
};

const PALETA_AVE_ESCUDO = {
  B: '#0e7490',
  L: '#67e8f9',
  E: '#fde047',
  K: '#083344',
  W: '#ecfeff',
};

const PALETA_AVE_FLASH = {
  B: '#ffffff',
  L: '#f8fafc',
  E: '#fde047',
  K: '#e2e8f0',
  W: '#ffffff',
};

const PALETA_CHEFE = {
  B: '#3b0764',
  L: '#8b5cf6',
  E: '#fde047',
  K: '#0f172a',
  W: '#f8fafc',
};

const PALETA_CHEFE_FLASH = {
  B: '#ffffff',
  L: '#ede9fe',
  E: '#fde047',
  K: '#cbd5e1',
  W: '#ffffff',
};

const MATRIZ_AVE_GRANDE_A = [
  '...BB......BB...',
  '..BLLB....BLLB..',
  '..BLLLBBBBLLLB..',
  '.BLLLLLLLLLLLLB.',
  'BLLLBBLLLLBBLLLB',
  'BLLBEELLLLEEBLLB',
  'BLLBEEKLLKEEBLLB',
  'BLLLLLLLLLLLLLLB',
  '.BBLLLLLLLLLLBB.',
  '...BBLLLLLLBB...',
  '.....BBBBBB.....',
  '......B..B......',
];

const MATRIZ_AVE_GRANDE_B = [
  '..B..........B..',
  '.BLLB......BLLB.',
  '.BLLLBBBBBBLLLB.',
  'BLLLLLLLLLLLLLLB',
  'BLLLBBLLLLBBLLLB',
  'BLLBEELLLLEEBLLB',
  'BLLBEEKLLKEEBLLB',
  'BLLLLLLLLLLLLLLB',
  '.BBLLLLLLLLLLBB.',
  '...BBLLLLLLBB...',
  '.....BBBBBB.....',
  '......B..B......',
];

const MATRIZ_AVE_PEQUENA_A = [
  '..B..B..',
  '.BLLBLLB',
  'BLLBBLLB',
  'BLEBBELB',
  'BLLBBLLB',
  '.BLLLLB.',
  '..BBBB..',
  '...BB...',
];

const MATRIZ_AVE_PEQUENA_B = [
  '.B....B.',
  'BLLBBLLB',
  'BLLBBLLB',
  'BLEBBELB',
  'BLLBBLLB',
  '.BLLLLB.',
  '..BBBB..',
  '...BB...',
];

const MATRIZ_CHEFE = [
  '.....BB..........BB.....',
  '....BLLB........BLLB....',
  '....BLLLBBBBBBBBLLLB....',
  '..BLLLLLLLLLLLLLLLLLLB..',
  '.BLLLLLLLLLLLLLLLLLLLLB.',
  'BLLLBBBBLLLLLLLLBBBBLLLB',
  'BLLBEEEEBLLLLLLBEEEEBLLB',
  'BLLBEEKEEBLLLLBEEKEEBLLB',
  'BLLBEEEEBLLLLLLBEEEEBLLB',
  'BLLLBBBBLLLLLLLLBBBBLLLB',
  '.BLLLLLLLLLLLLLLLLLLLLB.',
  '..BBLLLLLLLLLLLLLLLLBB..',
  '....BBLLLBBBBBBLLLBB....',
  '......BBBBBBBBBBBB......',
  '........BB....BB........',
  '.......BB......BB.......',
];

const MATRIZ_TIRO = [
  '.CC.',
  '.WW.',
  '.WW.',
  '.CC.',
  '.CC.',
  '.WW.',
  '.CC.',
  '.CC.',
];

const MATRIZ_ORBE = [
  '.CC.',
  'CWWC',
  'CWWC',
  '.CC.',
];

function paletaAve(tipo: TipoAve, flash: number): Record<string, string> {
  if (flash > 0) return PALETA_AVE_FLASH;
  if (tipo === 'mergulho') return PALETA_AVE_MERGULHO;
  if (tipo === 'escudo') return PALETA_AVE_ESCUDO;
  return PALETA_AVE;
}

export function desenharCanhao(
  g: CanvasRenderingContext2D,
  sprites: SpriteUtils,
  canhao: Canhao,
  tempo: number,
  invulneravel: number
): void {
  g.save();
  if (invulneravel > 0) {
    g.globalAlpha = Math.floor(tempo * 14) % 2 === 0 ? 0.35 : 1;
  }

  const y = canhao.y + canhao.recuo * 3;
  sprites.desenharMatriz(
    g,
    MATRIZ_CANHAO,
    PALETA_CANHAO,
    Math.floor(canhao.x - 24),
    Math.floor(y),
    4
  );

  if (canhao.recuo > 0.55) {
    g.fillStyle = '#a78bfa';
    g.globalAlpha *= 0.8;
    g.fillRect(Math.floor(canhao.x - 7), Math.floor(y - 10), 14, 8);
    g.fillStyle = '#f8fafc';
    g.fillRect(Math.floor(canhao.x - 3), Math.floor(y - 8), 6, 5);
  }

  if (canhao.travado > 0) {
    const faisca = Math.sin(tempo * 30) > 0 ? '#f87171' : '#fde047';
    g.fillStyle = faisca;
    g.fillRect(Math.floor(canhao.x - 16), Math.floor(canhao.y + 6), 4, 4);
    g.fillRect(Math.floor(canhao.x + 12), Math.floor(canhao.y + 2), 4, 4);
    g.fillRect(Math.floor(canhao.x - 4), Math.floor(canhao.y - 12), 4, 4);
  }

  g.restore();
}

export function desenharMiniCanhao(
  g: CanvasRenderingContext2D,
  sprites: SpriteUtils,
  x: number,
  y: number,
  ativo: boolean
): void {
  sprites.desenharMatriz(
    g,
    MATRIZ_MINI_CANHAO,
    ativo ? PALETA_CANHAO : PALETA_CANHAO_APAGADO,
    Math.floor(x),
    Math.floor(y),
    2
  );
}

export function desenharAve(
  g: CanvasRenderingContext2D,
  sprites: SpriteUtils,
  ave: Ave,
  tempo: number
): void {
  const quadro = Math.floor(tempo * 7 + ave.fase) % 2;
  const paleta = paletaAve(ave.tipo, ave.flash);

  if (ave.tipo === 'pequena') {
    sprites.desenharMatriz(
      g,
      quadro === 0 ? MATRIZ_AVE_PEQUENA_A : MATRIZ_AVE_PEQUENA_B,
      paleta,
      Math.floor(ave.x - 16),
      Math.floor(ave.y - 16),
      4
    );
    return;
  }

  sprites.desenharMatriz(
    g,
    quadro === 0 ? MATRIZ_AVE_GRANDE_A : MATRIZ_AVE_GRANDE_B,
    paleta,
    Math.floor(ave.x - 32),
    Math.floor(ave.y - 24),
    4
  );

  if (ave.tipo === 'escudo' && ave.hp > 1) {
    g.save();
    g.globalAlpha = 0.55 + Math.sin(tempo * 5 + ave.fase) * 0.15;
    g.strokeStyle = '#67e8f9';
    g.lineWidth = 2;
    g.strokeRect(
      Math.floor(ave.x - 35),
      Math.floor(ave.y - 27),
      70,
      54
    );
    g.fillStyle = '#a5f3fc';
    g.fillRect(Math.floor(ave.x - 37), Math.floor(ave.y - 3), 4, 6);
    g.fillRect(Math.floor(ave.x + 33), Math.floor(ave.y - 3), 4, 6);
    g.restore();
  }

  if (ave.mergulhando) {
    g.save();
    g.globalAlpha = 0.55;
    g.fillStyle = '#f87171';
    g.fillRect(Math.floor(ave.x - 18), Math.floor(ave.y + 24), 5, 8);
    g.fillRect(Math.floor(ave.x + 13), Math.floor(ave.y + 24), 5, 8);
    g.restore();
  }
}

export function desenharChefe(
  g: CanvasRenderingContext2D,
  sprites: SpriteUtils,
  chefe: Chefe,
  tempo: number
): void {
  const flutuacao = Math.sin(tempo * 2.4 + chefe.fase) * 3;
  const paleta = chefe.flash > 0 ? PALETA_CHEFE_FLASH : PALETA_CHEFE;

  g.save();
  g.globalAlpha = 0.18 + Math.sin(tempo * 4) * 0.05;
  g.fillStyle = '#8b5cf6';
  g.beginPath();
  g.ellipse(chefe.x, chefe.y + 2, 58, 38, 0, 0, Math.PI * 2);
  g.fill();
  g.restore();

  sprites.desenharMatriz(
    g,
    MATRIZ_CHEFE,
    paleta,
    Math.floor(chefe.x - 48),
    Math.floor(chefe.y - 32 + flutuacao),
    4
  );

  g.save();
  g.globalAlpha = 0.7;
  g.fillStyle = '#fde047';
  g.fillRect(Math.floor(chefe.x - 30), Math.floor(chefe.y - 11 + flutuacao), 6, 6);
  g.fillRect(Math.floor(chefe.x + 24), Math.floor(chefe.y - 11 + flutuacao), 6, 6);
  g.restore();
}

export function desenharTiro(
  g: CanvasRenderingContext2D,
  sprites: SpriteUtils,
  tiro: TiroJogador
): void {
  g.save();
  g.globalAlpha = 0.24;
  g.fillStyle = '#22d3ee';
  g.fillRect(Math.floor(tiro.x - 10), Math.floor(tiro.y - 18), 20, 36);
  g.restore();

  sprites.desenharMatriz(
    g,
    MATRIZ_TIRO,
    { C: '#22d3ee', W: '#f8fafc' },
    Math.floor(tiro.x - 8),
    Math.floor(tiro.y - 16),
    4
  );
}

export function desenharOrbe(
  g: CanvasRenderingContext2D,
  sprites: SpriteUtils,
  orbe: Orbe
): void {
  g.save();
  g.globalAlpha = 0.22;
  g.fillStyle = orbe.cor;
  g.beginPath();
  g.arc(orbe.x, orbe.y, 11, 0, Math.PI * 2);
  g.fill();
  g.restore();

  sprites.desenharMatriz(
    g,
    MATRIZ_ORBE,
    { C: orbe.cor, W: '#f8fafc' },
    Math.floor(orbe.x - 8),
    Math.floor(orbe.y - 8),
    4
  );
}
