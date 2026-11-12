import { Criatura, CriaturaSpawn, Heroina, MapaMina } from '../tipos';

export function criarAranha(spawn: CriaturaSpawn): Criatura {
  return {
    id: spawn.id,
    tipo: 'aranha',
    sala: spawn.sala,
    x: spawn.x - 6,
    y: spawn.y - 5,
    largura: 12,
    altura: 10,
    vx: 0,
    vy: 0,
    baseX: spawn.x,
    baseY: spawn.y,
    direcao: 1,
    tempo: spawn.id * 0.5,
    vivo: true,
    animacao: 0,
  };
}

export function atualizarAranha(
  c: Criatura,
  dt: number,
  heroina: Heroina,
  _mapa: MapaMina
): void {
  c.tempo += dt;
  c.animacao += dt * 7;

  const heroX = heroina.x + heroina.largura / 2;
  const heroY = heroina.y + heroina.altura / 2;
  const distancia = Math.hypot(heroX - c.baseX, heroY - c.baseY);
  const descida = distancia < 112 ? Math.min(52, distancia * 0.45) : 0;

  c.x = c.baseX - c.largura / 2 + Math.sin(c.tempo * 1.25) * 15;
  c.y += (c.baseY - c.altura / 2 + descida - c.y) * Math.min(1, dt * 3.2);
  c.direcao = Math.cos(c.tempo * 1.25) >= 0 ? 1 : -1;
}
