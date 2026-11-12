import { Criatura, CriaturaSpawn, Heroina, MapaMina } from '../tipos';

export function criarPiranhaPoco(spawn: CriaturaSpawn): Criatura {
  return {
    id: spawn.id,
    tipo: 'piranha',
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
    tempo: spawn.id * 0.65,
    vivo: true,
    animacao: 0,
  };
}

export function atualizarPiranhaPoco(
  c: Criatura,
  dt: number,
  heroina: Heroina,
  _mapa: MapaMina
): void {
  c.tempo += dt;
  c.animacao += dt * 9;

  const heroX = heroina.x + heroina.largura / 2;
  const heroY = heroina.y + heroina.altura / 2;
  const distancia = Math.hypot(heroX - c.baseX, heroY - c.baseY);

  if (c.y < c.baseY - c.altura / 2) {
    c.vy += 300 * dt;
    c.y += c.vy * dt;
    if (c.y >= c.baseY - c.altura / 2) {
      c.y = c.baseY - c.altura / 2;
      c.vy = 0;
    }
  } else if (distancia < 85 && heroY < c.baseY && c.vy === 0) {
    c.vy = -128;
    c.y += c.vy * dt;
  }

  c.x = c.baseX - c.largura / 2 + Math.sin(c.tempo * 1.8) * 17;
  c.direcao = Math.cos(c.tempo * 1.8) >= 0 ? 1 : -1;
}
