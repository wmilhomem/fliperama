import { CORES } from './constantes';
import { Cristal, Heroina, Lampada } from './tipos';

function fill(g: CanvasRenderingContext2D, cor: string, x: number, y: number, w: number, h: number): void {
  g.fillStyle = cor;
  g.fillRect(x, y, w, h);
}

export function desenharHeroina(
  g: CanvasRenderingContext2D,
  heroina: Heroina,
  tempo: number
): void {
  if (heroina.invulneravel > 0 && Math.floor(tempo * 18) % 2 === 0) return;

  const baseX = Math.round(heroina.x) - 2 + 8;
  const baseY = Math.round(heroina.y) - 4;
  const passo = Math.floor(heroina.animacao * 8) % 2;

  g.save();
  g.translate(baseX, baseY);
  g.scale(heroina.olhando, 1);
  g.translate(-8, 0);

  if (heroina.propulsor) {
    fill(g, CORES.lavaClara, 11, 20, 3, 4);
    fill(g, CORES.laranja, 10, 23, 5, 4 + Math.floor(Math.random() * 3));
    fill(g, CORES.aguaClara, 11, 23, 3, 3);
  }

  fill(g, CORES.cinzaEscuro, 11, 10, 4, 11);
  fill(g, CORES.cinza, 12, 11, 2, 8);
  fill(g, CORES.lavaClara, 12, 13, 1, 3);

  fill(g, CORES.capaceteEscuro, 1, 1, 14, 3);
  fill(g, CORES.capacete, 2, 2, 12, 5);
  fill(g, CORES.ouroClaro, 3, 1, 9, 2);
  fill(g, CORES.cinzaEscuro, 4, 5, 9, 3);
  fill(g, CORES.aguaClara, 6, 6, 6, 2);
  fill(g, CORES.capacete, 13, 7, 3, 2);
  fill(g, CORES.capaceteEscuro, 13, 9, 2, 1);

  fill(g, CORES.pele, 3, 8, 9, 5);
  fill(g, CORES.peleEscura, 3, 11, 9, 2);
  fill(g, CORES.preto, 8, 9, 2, 2);
  fill(g, CORES.capacete, 4, 7, 5, 1);

  fill(g, CORES.macacao, 2, 13, 11, 9);
  fill(g, CORES.macacaoEscuro, 2, 19, 11, 3);
  fill(g, CORES.ouro, 3, 15, 9, 1);
  fill(g, CORES.ouro, 9, 15, 1, 5);
  fill(g, CORES.ouro, 11, 15, 1, 5);

  fill(g, CORES.macacao, 0, 14, 3, 7);
  fill(g, CORES.pele, 0, 20, 4, 3);
  fill(g, CORES.lavaClara, 0, 22, 4, 2);

  fill(g, CORES.bota, passo === 0 ? 1 : 2, 24, 4, 4);
  fill(g, CORES.bota, passo === 0 ? 7 : 8, 24, 4, 4);
  fill(g, CORES.cinzaEscuro, 0, 27, 6, 2);
  fill(g, CORES.cinzaEscuro, 7, 27, 6, 2);

  fill(g, CORES.branco, 9, 9, 1, 1);
  fill(g, CORES.rosaClaro, 7, 12, 2, 1);

  g.restore();
}

export function desenharMinerador(
  g: CanvasRenderingContext2D,
  x: number,
  y: number,
  tempo: number
): void {
  const balanca = Math.sin(tempo * 3) > 0 ? 1 : 0;
  const bx = Math.round(x) - 8;
  const by = Math.round(y) - 25;

  fill(g, CORES.cinzaEscuro, bx + 4, by + 18, 4, 7);
  fill(g, CORES.cinzaEscuro, bx + 9, by + 18, 4, 7);
  fill(g, CORES.azul, bx + 3, by + 11, 11, 8);
  fill(g, CORES.aguaEscura, bx + 3, by + 17, 11, 2);
  fill(g, CORES.pele, bx + 5, by + 6, 7, 5);
  fill(g, CORES.branco, bx + 4, by + 10, 9, 4);
  fill(g, CORES.branco, bx + 5, by + 8, 2, 2);
  fill(g, CORES.branco, bx + 10, by + 8, 2, 2);
  fill(g, CORES.preto, bx + 7, by + 8, 1, 1);
  fill(g, CORES.preto, bx + 10, by + 8, 1, 1);
  fill(g, CORES.capacete, bx + 4, by + 1, 10, 4);
  fill(g, CORES.capaceteEscuro, bx + 3, by + 4, 12, 2);
  fill(g, CORES.branco, bx + 8, by + 2, 2, 2);
  fill(g, CORES.pele, bx + 1, by + 12, 3, 5);
  fill(g, CORES.pele, bx + 14, by + 12 + balanca, 3, 5);
  fill(g, CORES.madeira, bx + 16, by + 8 + balanca, 2, 12);
  fill(g, CORES.cinza, bx + 14, by + 6 + balanca, 6, 3);

  if (Math.sin(tempo * 4) > 0.6) {
    fill(g, CORES.ouroClaro, bx + 8, by - 3, 2, 2);
  }
}

export function desenharCristal(
  g: CanvasRenderingContext2D,
  cristal: Cristal,
  tempo: number
): void {
  if (cristal.coletado) return;
  const flutua = Math.sin(tempo * 3 + cristal.tempo) * 2;
  const x = Math.round(cristal.x);
  const y = Math.round(cristal.y + flutua);
  const brilho = 0.24 + Math.sin(tempo * 4 + cristal.tempo) * 0.08;

  g.globalAlpha = brilho;
  fill(g, cristal.cor, x - 7, y - 7, 14, 14);
  g.globalAlpha = 1;

  fill(g, cristal.cor, x - 3, y - 6, 2, 2);
  fill(g, cristal.cor, x - 5, y - 4, 10, 4);
  fill(g, cristal.cor, x - 4, y, 8, 4);
  fill(g, cristal.cor, x - 2, y + 4, 4, 2);
  fill(g, CORES.branco, x - 2, y - 4, 2, 4);
  fill(g, CORES.branco, x + 1, y - 2, 2, 2);
}

export function desenharLampada(
  g: CanvasRenderingContext2D,
  lampada: Lampada,
  tempo: number
): void {
  const x = Math.round(lampada.x);
  const y = Math.round(lampada.y);

  if (lampada.acesa) {
    const pulso = 14 + Math.sin(tempo * 6) * 3;
    g.globalAlpha = 0.12;
    fill(g, CORES.ouroClaro, x - pulso, y - pulso, pulso * 2 + 8, pulso * 2 + 8);
    g.globalAlpha = 1;
  }

  fill(g, CORES.cinzaEscuro, x - 1, y - 7, 2, 6);
  fill(g, CORES.cinza, x - 3, y - 2, 8, 3);
  fill(g, lampada.acesa ? CORES.ouroClaro : CORES.cinzaEscuro, x - 2, y + 1, 6, 6);
  fill(g, lampada.acesa ? CORES.branco : '#475569', x, y + 2, 2, 3);
}

export function desenharIconeDinamite(
  g: CanvasRenderingContext2D,
  x: number,
  y: number,
  ativo: boolean
): void {
  fill(g, ativo ? CORES.vermelho : CORES.cinzaEscuro, x, y, 7, 5);
  fill(g, ativo ? CORES.rosaClaro : CORES.cinza, x + 1, y + 1, 5, 3);
  fill(g, ativo ? CORES.ouro : CORES.cinza, x + 3, y - 2, 1, 2);
  if (ativo) fill(g, CORES.ouroClaro, x + 5, y - 3, 2, 2);
}
