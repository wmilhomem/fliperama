import { colideMapa } from '../fisica';
import { Criatura, CriaturaSpawn, Heroina, MapaMina } from '../tipos';

export function criarMorcego(spawn: CriaturaSpawn, fase: number): Criatura {
  return {
    id: spawn.id,
    tipo: 'morcego',
    sala: spawn.sala,
    x: spawn.x - 6,
    y: spawn.y - 4,
    largura: 12,
    altura: 8,
    vx: 0,
    vy: 0,
    baseX: spawn.x,
    baseY: spawn.y,
    direcao: 1,
    tempo: spawn.id * 0.7,
    vivo: true,
    animacao: 0,
  };
}

export function atualizarMorcego(
  c: Criatura,
  dt: number,
  heroina: Heroina,
  mapa: MapaMina,
  fase: number
): void {
  c.tempo += dt;
  c.animacao += dt * (5 + fase * 0.2);

  const alvoX = heroina.x + heroina.largura / 2;
  const alvoY = heroina.y + heroina.altura / 2;
  const dx = alvoX - (c.x + c.largura / 2);
  const dy = alvoY - (c.y + c.altura / 2);
  const distancia = Math.hypot(dx, dy);

  let destinoX: number;
  let destinoY: number;

  if (distancia < 132) {
    const forca = 34 + fase * 4;
    destinoX = c.x + (dx / Math.max(1, distancia)) * forca * dt;
    destinoY = c.y + (dy / Math.max(1, distancia)) * forca * 0.7 * dt;
    c.direcao = dx >= 0 ? 1 : -1;
  } else {
    destinoX = c.baseX - c.largura / 2 + Math.sin(c.tempo * 1.4) * 24;
    destinoY = c.baseY - c.altura / 2 + Math.sin(c.tempo * 2.7) * 7;
  }

  const caixa = {
    x: destinoX,
    y: destinoY,
    largura: c.largura,
    altura: c.altura,
  };
  if (!colideMapa(mapa, caixa)) {
    c.x = destinoX;
    c.y = destinoY;
  } else {
    c.x = c.baseX - c.largura / 2;
    c.y = c.baseY - c.altura / 2;
  }
}
