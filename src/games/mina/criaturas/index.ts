import { CORES } from '../constantes';
import { Criatura, CriaturaSpawn, Heroina, MapaMina, Retangulo } from '../tipos';
import { atualizarAranha, criarAranha } from './aranha';
import { atualizarCobra, criarCobra } from './cobra';
import { atualizarMariposa, criarMariposa } from './mariposa';
import { atualizarMorcego, criarMorcego } from './morcego';
import { atualizarPiranhaPoco, criarPiranhaPoco } from './piranhaPoco';

export function criarCriatura(spawn: CriaturaSpawn, fase: number): Criatura {
  switch (spawn.tipo) {
    case 'morcego':
      return criarMorcego(spawn, fase);
    case 'aranha':
      return criarAranha(spawn);
    case 'cobra':
      return criarCobra(spawn, fase);
    case 'mariposa':
      return criarMariposa(spawn);
    case 'piranha':
      return criarPiranhaPoco(spawn);
  }
}

export function criarCriaturasDoMapa(mapa: MapaMina, fase: number): Criatura[] {
  return mapa.spawns.map((spawn) => criarCriatura(spawn, fase));
}

export function criarCriaturasDaSala(
  mapa: MapaMina,
  sala: number,
  fase: number
): Criatura[] {
  return mapa.spawns
    .filter((spawn) => spawn.sala === sala)
    .map((spawn) => criarCriatura(spawn, fase));
}

export function atualizarCriaturas(
  criaturas: Criatura[],
  dt: number,
  heroina: Heroina,
  mapa: MapaMina,
  escura: boolean,
  fase: number
): void {
  for (const c of criaturas) {
    if (!c.vivo) continue;
    switch (c.tipo) {
      case 'morcego':
        atualizarMorcego(c, dt, heroina, mapa, fase);
        break;
      case 'aranha':
        atualizarAranha(c, dt, heroina, mapa);
        break;
      case 'cobra':
        atualizarCobra(c, dt, heroina, mapa);
        break;
      case 'mariposa':
        atualizarMariposa(c, dt, heroina, mapa, escura);
        break;
      case 'piranha':
        atualizarPiranhaPoco(c, dt, heroina, mapa);
        break;
    }
  }
}

export function caixaCriatura(c: Criatura): Retangulo {
  return { x: c.x, y: c.y, largura: c.largura, altura: c.altura };
}

export function desenharCriaturas(
  g: CanvasRenderingContext2D,
  criaturas: Criatura[],
  tempo: number
): void {
  for (const c of criaturas) {
    if (!c.vivo) continue;
    switch (c.tipo) {
      case 'morcego':
        desenharMorcego(g, c, tempo);
        break;
      case 'aranha':
        desenharAranha(g, c);
        break;
      case 'cobra':
        desenharCobra(g, c, tempo);
        break;
      case 'mariposa':
        desenharMariposa(g, c);
        break;
      case 'piranha':
        desenharPiranha(g, c, tempo);
        break;
    }
  }
}

function desenharMorcego(g: CanvasRenderingContext2D, c: Criatura, tempo: number): void {
  const x = Math.round(c.x);
  const y = Math.round(c.y);
  const flap = Math.sin(c.animacao) > 0;
  const dir = c.direcao;

  g.fillStyle = CORES.roxo;
  if (flap) {
    g.fillRect(x - 4, y + 1, 5, 3);
    g.fillRect(x + 11, y + 1, 5, 3);
    g.fillRect(x - 5, y + 2, 3, 2);
    g.fillRect(x + 14, y + 2, 3, 2);
  } else {
    g.fillRect(x - 2, y - 1, 4, 5);
    g.fillRect(x + 10, y - 1, 4, 5);
  }
  g.fillStyle = '#4c1d95';
  g.fillRect(x + 2, y + 2, 8, 6);
  g.fillStyle = '#7c3aed';
  g.fillRect(x + 3, y + 1, 3, 3);
  g.fillRect(x + 7, y + 1, 3, 3);
  g.fillStyle = CORES.ouroClaro;
  g.fillRect(dir > 0 ? x + 8 : x + 3, y + 3, 1, 1);
  g.fillStyle = CORES.branco;
  g.fillRect(dir > 0 ? x + 9 : x + 2, y + 5, 1, 2);
  if (Math.sin(tempo * 6 + c.id) > 0.8) {
    g.fillStyle = CORES.vermelho;
    g.fillRect(x + 5, y + 4, 2, 1);
  }
}

function desenharAranha(g: CanvasRenderingContext2D, c: Criatura): void {
  const x = Math.round(c.x);
  const y = Math.round(c.y);
  const topo = Math.round(c.baseY - 8);

  g.strokeStyle = 'rgba(226, 232, 240, 0.4)';
  g.lineWidth = 1;
  g.beginPath();
  g.moveTo(Math.round(c.baseX), topo);
  g.lineTo(Math.round(c.baseX), y + 2);
  g.stroke();

  g.fillStyle = '#1f2937';
  for (let i = 0; i < 4; i++) {
    const legY = y + 2 + i * 2;
    const paraBaixo = Math.sin(c.animacao + i) > 0 ? 1 : 0;
    g.fillRect(x - 3, legY + paraBaixo, 4, 1);
    g.fillRect(x + c.largura - 1, legY + paraBaixo, 4, 1);
  }
  g.fillStyle = '#111827';
  g.fillRect(x + 3, y + 2, 6, 6);
  g.fillStyle = '#7f1d1d';
  g.fillRect(x + 4, y + 3, 4, 3);
  g.fillStyle = CORES.vermelho;
  g.fillRect(x + 3, y + 1, 1, 1);
  g.fillRect(x + 8, y + 1, 1, 1);
}

function desenharCobra(g: CanvasRenderingContext2D, c: Criatura, tempo: number): void {
  const x = Math.round(c.x);
  const y = Math.round(c.y);
  const dir = c.direcao;
  const onda = Math.sin(tempo * 7 + c.id) > 0 ? 0 : 1;

  g.fillStyle = '#166534';
  for (let i = 0; i < 4; i++) {
    g.fillRect(x + i * 3, y + 4 + (i % 2) * onda, 3, 4);
  }
  g.fillStyle = '#22c55e';
  for (let i = 0; i < 4; i++) {
    g.fillRect(x + i * 3, y + 3 + (i % 2) * onda, 2, 2);
  }
  const headX = dir > 0 ? x + c.largura - 6 : x;
  g.fillStyle = '#15803d';
  g.fillRect(headX, y + 1, 6, 7);
  g.fillStyle = '#4ade80';
  g.fillRect(headX + 1, y + 2, 4, 2);
  g.fillStyle = CORES.amarelo;
  g.fillRect(dir > 0 ? headX + 4 : headX + 1, y + 2, 1, 2);
  g.fillStyle = CORES.vermelho;
  g.fillRect(dir > 0 ? headX + 4 : headX + 1, y + 5, 2, 1);
}

function desenharMariposa(g: CanvasRenderingContext2D, c: Criatura): void {
  const x = Math.round(c.x);
  const y = Math.round(c.y);
  const abre = Math.sin(c.animacao) > 0;
  const cor = '#c084fc';

  g.fillStyle = cor;
  if (abre) {
    g.fillRect(x - 3, y + 1, 5, 6);
    g.fillRect(x + 8, y + 1, 5, 6);
    g.fillStyle = '#f0abfc';
    g.fillRect(x - 2, y + 2, 2, 3);
    g.fillRect(x + 10, y + 2, 2, 3);
  } else {
    g.fillRect(x + 1, y, 4, 8);
    g.fillRect(x + 6, y, 4, 8);
  }
  g.fillStyle = '#4c1d95';
  g.fillRect(x + 4, y + 2, 2, 5);
  g.fillStyle = CORES.ouroClaro;
  g.fillRect(x + 3, y + 1, 1, 1);
  g.fillRect(x + 6, y + 1, 1, 1);
}

function desenharPiranha(g: CanvasRenderingContext2D, c: Criatura, tempo: number): void {
  const x = Math.round(c.x);
  const y = Math.round(c.y);
  const dir = c.direcao;
  const onda = Math.sin(tempo * 8 + c.id) > 0 ? 1 : 0;

  g.fillStyle = '#9a3412';
  g.fillRect(x + (dir > 0 ? 0 : 4), y + 3, 4, 4);
  g.fillStyle = CORES.laranja;
  g.fillRect(x + 3, y + 2, 7, 5);
  g.fillStyle = CORES.ouroClaro;
  g.fillRect(x + 4, y + 3, 4, 2);
  g.fillStyle = CORES.branco;
  g.fillRect(x + 5, y + 6, 1, 1);
  g.fillRect(x + 7, y + 6, 1, 1);
  g.fillRect(x + 9, y + 6, 1, 1);
  g.fillStyle = CORES.preto;
  g.fillRect(dir > 0 ? x + 8 : x + 4, y + 3, 1, 1);
  g.fillStyle = CORES.vermelho;
  g.fillRect(x + 3, y + 1 + onda, 6, 1);
}
