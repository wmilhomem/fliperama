import { colideMapa } from '../fisica';
import { Criatura, CriaturaSpawn, Heroina, MapaMina } from '../tipos';

export function criarCobra(spawn: CriaturaSpawn, fase: number): Criatura {
  return {
    id: spawn.id,
    tipo: 'cobra',
    sala: spawn.sala,
    x: spawn.x - 7,
    y: spawn.y,
    largura: 14,
    altura: 10,
    vx: (fase % 2 === 0 ? 1 : -1) * (26 + fase * 2),
    vy: 0,
    baseX: spawn.x,
    baseY: spawn.y,
    direcao: fase % 2 === 0 ? 1 : -1,
    tempo: spawn.id * 0.9,
    vivo: true,
    animacao: 0,
  };
}

export function atualizarCobra(
  c: Criatura,
  dt: number,
  _heroina: Heroina,
  mapa: MapaMina
): void {
  c.tempo += dt;
  c.animacao += dt * 8;

  const velocidade = Math.abs(c.vx) || 32;
  const proximoX = c.x + c.direcao * velocidade * dt;
  const caixa = {
    x: proximoX,
    y: c.y,
    largura: c.largura,
    altura: c.altura,
  };

  const longeDaBase = Math.abs(proximoX + c.largura / 2 - c.baseX) > 54;
  if (colideMapa(mapa, caixa) || longeDaBase) {
    c.direcao *= -1;
  } else {
    c.x = proximoX;
  }
}
