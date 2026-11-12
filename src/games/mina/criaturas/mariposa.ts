import { Criatura, CriaturaSpawn, Heroina, MapaMina } from '../tipos';

export function criarMariposa(spawn: CriaturaSpawn): Criatura {
  return {
    id: spawn.id,
    tipo: 'mariposa',
    sala: spawn.sala,
    x: spawn.x - 5,
    y: spawn.y - 4,
    largura: 10,
    altura: 8,
    vx: 0,
    vy: 0,
    baseX: spawn.x,
    baseY: spawn.y,
    direcao: 1,
    tempo: spawn.id * 0.4,
    vivo: true,
    animacao: 0,
  };
}

export function atualizarMariposa(
  c: Criatura,
  dt: number,
  _heroina: Heroina,
  _mapa: MapaMina,
  escura: boolean
): void {
  if (!escura) {
    c.vivo = false;
    return;
  }

  c.tempo += dt;
  c.animacao += dt * 10;
  c.x = c.baseX - c.largura / 2 + Math.sin(c.tempo * 1.7) * 22;
  c.y = c.baseY - c.altura / 2 + Math.cos(c.tempo * 2.4) * 13;
  c.direcao = Math.cos(c.tempo * 1.7) >= 0 ? 1 : -1;
}
