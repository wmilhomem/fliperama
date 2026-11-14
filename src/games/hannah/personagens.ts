/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * PERSONAGENS E ITENS — ARTE 100% ORIGINAL
 *
 * Zeca (pedreiro de capacete amarelo e macacão azul-petróleo), Hannah
 * (ruiva de cabelo cacheado com fita verde e vestido turquesa) e Grotão
 * (gorila cinza-grafite de colete rasgado e capacete amassado).
 * Todos desenhados com retângulos em pixel art sobre a grade 16x16.
 */

export interface CorpoFrame {
  frame: number;
  dir: 1 | -1;
}

const Z = {
  capacete: '#FACC15',
  capaceteEscuro: '#CA8A04',
  cabelo: '#292524',
  pele: '#EDB98A',
  colete: '#F97316',
  coleteRefletivo: '#FDE68A',
  macacao: '#155E75',
  macacaoEscuro: '#0E4A5C',
  bota: '#3F3F46',
};

const H = {
  cabelo: '#C2410C',
  cabeloEscuro: '#9A3412',
  fita: '#22C55E',
  vestido: '#14B8A6',
  avental: '#F5F5F4',
  pele: '#F6C89F',
  olho: '#1C1917',
};

const G = {
  pelagem: '#3F4654',
  pelagemClara: '#4B5563',
  rosto: '#B08968',
  peito: '#B08968',
  colete: '#B91C1C',
  coleteFaixa: '#F8FAFC',
  capacete: '#F59E0B',
  cimento: '#9CA3AF',
  olho: '#FDE68A',
};

function retangulo(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, cor: string) {
  g.fillStyle = cor;
  g.fillRect(Math.floor(x), Math.floor(y), Math.floor(w), Math.floor(h));
}

/** Zeca — pedreiro (x, y = pés no chão/viga). */
export function desenharZeca(
  g: CanvasRenderingContext2D,
  x: number,
  y: number,
  dir: 1 | -1,
  frame: number,
  martelo: boolean
) {
  g.save();
  g.translate(x, y);
  g.scale(dir, 1);

  const passo = frame % 2 === 0;

  // Pernas (macacão azul-petróleo)
  retangulo(g, -6, -12, 5, passo ? 9 : 7, Z.macacao);
  retangulo(g, 1, -12, 5, passo ? 7 : 9, Z.macacao);
  // Botas
  retangulo(g, -7, -3, 6, 3, Z.bota);
  retangulo(g, 1, -3, 6, 3, Z.bota);

  // Tronco (macacão)
  retangulo(g, -6, -22, 12, 11, Z.macacao);
  retangulo(g, -6, -22, 2, 11, Z.macacaoEscuro);
  // Colete refletivo por cima
  retangulo(g, -7, -21, 14, 7, Z.colete);
  retangulo(g, -7, -17, 14, 2, Z.coleteRefletivo);

  // Cabeça
  retangulo(g, -4, -29, 8, 8, Z.pele);
  // Cabelo escuro embaixo do capacete
  retangulo(g, -5, -27, 2, 3, Z.cabelo);
  retangulo(g, 3, -27, 2, 3, Z.cabelo);
  // Capacete amarelo
  retangulo(g, -6, -32, 12, 4, Z.capacete);
  retangulo(g, -4, -34, 8, 2, Z.capacete);
  retangulo(g, -7, -29, 14, 1, Z.capaceteEscuro);
  // Olho único frontal
  retangulo(g, 1, -26, 2, 2, '#1C1917');

  // Braços
  retangulo(g, -9, -20, 3, 7, martelo ? Z.colete : Z.macacao);
  retangulo(g, 6, -20, 3, 7, martelo ? Z.colete : Z.macacao);
  // Mãos
  retangulo(g, -9, -13, 3, 2, Z.pele);
  retangulo(g, 6, -13, 3, 2, Z.pele);

  g.restore();
}

/** Hannah — arquiteta ruiva (x, y = pés). */
export function desenharHannah(
  g: CanvasRenderingContext2D,
  x: number,
  y: number,
  frame: number,
  agitacao: boolean
) {
  g.save();
  g.translate(x, y);

  const balanco = Math.sin(frame * 0.6) * 1.2;

  // Saia turquesa
  retangulo(g, -6, -10, 12, 7, H.vestido);
  retangulo(g, -7, -4, 14, 2, '#0F766E');

  // Avental de arquiteta (creme) por cima
  retangulo(g, -4, -13, 8, 8, H.avental);
  retangulo(g, -2, -12, 4, 2, '#D6D3D1');

  // Tronco/vestido
  retangulo(g, -6, -20, 12, 9, H.vestido);

  // Cabelo ruivo cacheado (cacheado = bolhas) com fita verde
  retangulo(g, -5, -29, 10, 7, H.cabelo);
  retangulo(g, -7, -27, 3, 6, H.cabelo);
  retangulo(g, 4, -27, 3, 6, H.cabelo);
  retangulo(g, -4, -31, 8, 2, H.cabeloEscuro);
  // Fita verde prendendo o cacheado
  retangulo(g, -6, -29, 12, 2, H.fita);
  retangulo(g, 4, -31, 3, 3, H.fita);

  // Rosto
  retangulo(g, -3, -23, 6, 5, H.pele);
  retangulo(g, -2, -22, 1, 1, H.olho);
  retangulo(g, 1, -22, 1, 1, H.olho);

  // Braços; um deles segura a prancheta
  if (agitacao) {
    retangulo(g, -9, -18 + balanco, 3, 6, H.vestido); // braço acenando
    retangulo(g, 6, -18, 3, 6, H.vestido);
  } else {
    retangulo(g, -9, -18, 3, 6, H.vestido);
    retangulo(g, 6, -18, 3, 6, H.vestido);
  }
  // Prancheta pequena
  retangulo(g, 7, -15, 4, 5, '#A8A29E');
  retangulo(g, 8, -14, 2, 3, '#F5F5F4');

  g.restore();
}

/** Grotão — gorila gigante (x, y = pés). */
export function desenharGrotao(
  g: CanvasRenderingContext2D,
  x: number,
  y: number,
  dir: 1 | -1,
  frame: number,
  agachado: boolean
) {
  g.save();
  g.translate(x, y);
  g.scale(dir, 1);

  const respiracao = Math.sin(frame * 0.25) * 1.5;
  const compressao = agachado ? 5 : 0;

  // Pernas grossas
  retangulo(g, -12, -12 - compressao, 9, 10 - compressao, G.pelagem);
  retangulo(g, 3, -12 - compressao, 9, 10 - compressao, G.pelagem);
  retangulo(g, -12, -3, 9, 3, G.pelagemClara);
  retangulo(g, 3, -3, 9, 3, G.pelagemClara);

  // Tronco largo
  retangulo(g, -13, -26 - compressao, 26, 17 - compressao, G.pelagem);

  // Peito marrom-claro
  retangulo(g, -8, -24 - compressao + respiracao * 0.3, 16, 10 - compressao, G.peito);

  // Colete de segurança rasgado (listrado)
  retangulo(g, -13, -22, 26, 5, G.colete);
  // Rasgos (buracos no colete)
  retangulo(g, -8, -22, 3, 5, G.pelagem);
  retangulo(g, 6, -22, 2, 5, G.pelagem);
  // Faixas refletivas
  retangulo(g, -13, -18, 7, 2, G.coleteFaixa);
  retangulo(g, 7, -18, 7, 2, G.coleteFaixa);

  // Cabeça (rosto marrom-claro, testa com marca de cimento)
  retangulo(g, -7, -34 - compressao, 14, 9 - compressao, G.rosto);
  // Marca de cimento na testa
  retangulo(g, -3, -33 - compressao, 6, 2, G.cimento);
  // Capacete pequeno e amassado
  retangulo(g, -8, -36 - compressao, 16, 3, G.capacete);
  retangulo(g, -5, -38 - compressao, 7, 2, G.capacete);
  retangulo(g, -8, -34 - compressao, 16, 1, '#B45309');
  // Olhos amarelos
  retangulo(g, -4, -29 - compressao, 3, 2, G.olho);
  retangulo(g, 2, -29 - compressao, 3, 2, G.olho);

  // Braços longos de gorila
  retangulo(g, -17, -25 - compressao, 5, 15, G.pelagem);
  retangulo(g, 12, -25 - compressao, 5, 15, G.pelagem);
  retangulo(g, -17, -12 - compressao, 5, 4, G.pelagemClara);
  retangulo(g, 12, -12 - compressao, 5, 4, G.pelagemClara);

  g.restore();
}

/** Barril de óleo com listras verdes e a etiqueta OBRA. */
export function desenharBarril(
  g: CanvasRenderingContext2D,
  x: number,
  y: number,
  rotacao: number,
  azul: boolean
) {
  g.save();
  g.translate(x, y);
  g.rotate(rotacao);

  const corpo = azul ? '#1D4ED8' : '#5C3A21';
  const listra = azul ? '#93C5FD' : '#166534';
  const faixa = azul ? '#DBEAFE' : '#F5F5F4';

  retangulo(g, -8, -9, 16, 18, corpo);
  retangulo(g, -9, -6, 2, 12, listra);
  retangulo(g, 7, -6, 2, 12, listra);
  retangulo(g, -8, -1, 16, 3, faixa);
  // Etiqueta OBRA
  retangulo(g, -6, -7, 12, 4, '#E7E5E4');
  g.fillStyle = '#1C1917';
  g.font = 'bold 5px monospace';
  g.textAlign = 'center';
  g.fillText('OBRA', 0, -4);

  g.restore();
}

/** Martelo de borracha amarelo. */
export function desenharMartelo(g: CanvasRenderingContext2D, x: number, y: number, frame: number) {
  const balanco = Math.sin(frame * 0.4) * 2;
  g.save();
  g.translate(x, y + balanco);
  // Cabo de madeira
  retangulo(g, -2, -2, 4, 12, '#A16207');
  // Cabeça de borracha amarela
  retangulo(g, -6, -9, 12, 7, '#FACC15');
  retangulo(g, -6, -9, 12, 2, '#FDE047');
  g.restore();
}

/** Chapéu de abas largas. */
export function desenharChapeu(g: CanvasRenderingContext2D, x: number, y: number, frame: number) {
  const pulso = 1 + Math.sin(frame * 0.3) * 0.06;
  g.save();
  g.translate(x, y);
  g.scale(pulso, pulso);
  retangulo(g, -8, -2, 16, 3, '#A16207');
  retangulo(g, -5, -7, 10, 5, '#CA8A04');
  retangulo(g, -5, -7, 10, 1, '#FDE68A');
  g.restore();
}

/** Bolsa de ombro caramelo. */
export function desenharBolsa(g: CanvasRenderingContext2D, x: number, y: number, frame: number) {
  const pulso = 1 + Math.sin(frame * 0.3 + 1) * 0.06;
  g.save();
  g.translate(x, y);
  g.scale(pulso, pulso);
  retangulo(g, -7, -4, 14, 9, '#B45309');
  retangulo(g, -7, -4, 14, 2, '#D97706');
  retangulo(g, -2, -7, 4, 3, '#B45309');
  retangulo(g, -2, -7, 4, 1, '#FDE68A');
  g.restore();
}

/** Guarda-chuva de arquiteta (turquesa). */
export function desenharGuardaChuva(g: CanvasRenderingContext2D, x: number, y: number, frame: number) {
  const pulso = 1 + Math.sin(frame * 0.3 + 2) * 0.06;
  g.save();
  g.translate(x, y);
  g.scale(pulso, pulso);
  retangulo(g, -8, -3, 16, 3, '#0F766E');
  retangulo(g, -6, -6, 12, 3, '#14B8A6');
  retangulo(g, -3, -9, 6, 3, '#14B8A6');
  retangulo(g, -1, -12, 2, 3, '#0F766E');
  retangulo(g, -1, 0, 2, 6, '#134E4A');
  g.restore();
}

/** Mola quica-quica de Grotão. */
export function desenharMola(g: CanvasRenderingContext2D, x: number, y: number, frame: number) {
  const compressao = Math.sin(frame * 0.5) > 0 ? 1 : 3;
  g.save();
  g.translate(x, y);
  retangulo(g, -6, -2, 12, 3, '#DC2626');
  retangulo(g, -4, -5 - compressao, 8, 2, '#F87171');
  retangulo(g, -4, -9 - compressao, 8, 2, '#F87171');
  retangulo(g, -6, -12 - compressao, 12, 3, '#DC2626');
  g.restore();
}

/** Bandeja de massa de cimento. */
export function desenharCaixaMassa(g: CanvasRenderingContext2D, x: number, y: number) {
  retangulo(g, -11, -4, 22, 8, '#78716C');
  retangulo(g, -11, -5, 22, 2, '#A8A29E');
  retangulo(g, -8, -7, 16, 2, '#D6D3D1');
}

/** Trava de segurança (pino). */
export function desenharTrava(g: CanvasRenderingContext2D, x: number, y: number) {
  retangulo(g, -3, -7, 6, 14, '#EF4444');
  retangulo(g, -5, -7, 10, 3, '#B91C1C');
  retangulo(g, -5, 4, 10, 3, '#B91C1C');
  retangulo(g, -1, -9, 2, 2, '#FCA5A5');
}

/** Bola de fogo. */
export function desenharBolaFogo(g: CanvasRenderingContext2D, x: number, y: number, frame: number) {
  const pulso = 1 + Math.sin(frame * 0.8) * 0.15;
  g.save();
  g.translate(x, y);
  g.scale(pulso, pulso);
  retangulo(g, -5, -5, 10, 10, '#F97316');
  retangulo(g, -3, -3, 6, 6, '#FBBF24');
  retangulo(g, -1, -8, 2, 4, '#FDE68A');
  retangulo(g, -6, 2, 12, 2, '#EA580C');
  g.restore();
}
