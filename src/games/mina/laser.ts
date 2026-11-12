import { CORES, LASER_ALCANCE } from './constantes';
import { eSolido } from './mapa';
import { Heroina, Laser, MapaMina, Retangulo } from './tipos';

export function criarLaser(): Laser {
  return {
    ativo: false,
    x1: 0,
    y1: 0,
    x2: 0,
    y2: 0,
    calor: 0,
    travado: false,
    tempoTrava: 0,
    tempoDano: 0,
    tempoSom: 0,
  };
}

export function calcularLaser(laser: Laser, heroina: Heroina, mapa: MapaMina): void {
  const origemX =
    heroina.olhando > 0 ? heroina.x + heroina.largura : heroina.x;
  const origemY = heroina.y + 9;
  const direcao = heroina.olhando;
  const passo = 2;
  let fimX = origemX;

  for (let distancia = 0; distancia <= LASER_ALCANCE; distancia += passo) {
    const x = origemX + direcao * distancia;
    const tx = Math.floor(x / 16);
    const ty = Math.floor(origemY / 16);
    if (eSolido(mapa, tx, ty)) break;
    fimX = x;
  }

  laser.x1 = origemX;
  laser.y1 = origemY;
  laser.x2 = fimX;
  laser.y2 = origemY;
}

export function caixaLaser(laser: Laser): Retangulo {
  const x = Math.min(laser.x1, laser.x2);
  return {
    x,
    y: laser.y1 - 3,
    largura: Math.max(1, Math.abs(laser.x2 - laser.x1)),
    altura: 6,
  };
}

export function desenharLaser(g: CanvasRenderingContext2D, laser: Laser, tempo: number): void {
  if (!laser.ativo) return;

  const pulso = 0.75 + Math.sin(tempo * 28) * 0.25;
  g.globalAlpha = 0.28 * pulso;
  g.fillStyle = CORES.lava;
  g.fillRect(
    Math.min(laser.x1, laser.x2) - 1,
    laser.y1 - 4,
    Math.abs(laser.x2 - laser.x1) + 2,
    8
  );

  g.globalAlpha = 0.75 * pulso;
  g.fillStyle = CORES.lavaClara;
  g.fillRect(
    Math.min(laser.x1, laser.x2),
    laser.y1 - 2,
    Math.abs(laser.x2 - laser.x1),
    4
  );

  g.globalAlpha = 1;
  g.fillStyle = CORES.branco;
  g.fillRect(
    Math.min(laser.x1, laser.x2),
    laser.y1 - 1,
    Math.abs(laser.x2 - laser.x1),
    2
  );

  const faisca = Math.floor(tempo * 30) % 3;
  g.fillStyle = CORES.ouroClaro;
  g.fillRect(laser.x2 - faisca, laser.y1 - 2, 3, 3);
}
