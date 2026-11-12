import {
  ALTURA,
  CORES,
  LARGURA,
  MUNDO_LARGURA,
  SALA_ALTURA,
  TILE,
  TILE_AGUA,
  TILE_FRAGIL,
  TILE_LAVA,
  TILE_LAVA_PAREDE,
  TILE_MADEIRA,
  TILE_ROCHA,
  TILE_VAZIO,
  TOPO_CEU,
} from './constantes';
import { tileEm } from './mapa';
import { Camera, MapaMina } from './tipos';

function hashTile(tx: number, ty: number): number {
  let n = Math.imul(tx + 31, 374761393) ^ Math.imul(ty + 17, 668265263);
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return (n ^ (n >>> 16)) >>> 0;
}

export function desenharFundo(
  g: CanvasRenderingContext2D,
  camera: Camera,
  tempo: number
): void {
  const gradiente = g.createLinearGradient(0, 0, 0, ALTURA);
  gradiente.addColorStop(0, '#0b0712');
  gradiente.addColorStop(0.45, '#17101f');
  gradiente.addColorStop(1, '#09060d');
  g.fillStyle = gradiente;
  g.fillRect(0, 0, LARGURA, ALTURA);

  const deslocamento = (camera.y * 0.28) % 72;
  g.globalAlpha = 0.2;
  for (let i = -1; i < 10; i++) {
    const y = i * 72 - deslocamento;
    g.fillStyle = i % 2 === 0 ? '#2a171a' : '#1f1419';
    g.beginPath();
    g.moveTo(0, y);
    for (let x = 0; x <= LARGURA; x += 40) {
      const onda = Math.sin((x + camera.x * 0.15 + i * 17) * 0.02) * 9;
      g.lineTo(x, y + onda);
    }
    g.lineTo(LARGURA, y + 24);
    g.lineTo(0, y + 24);
    g.closePath();
    g.fill();
  }
  g.globalAlpha = 1;

  g.save();
  g.translate(-Math.round(camera.x), -Math.round(camera.y));
  const ceu = g.createLinearGradient(0, 0, 0, TOPO_CEU * TILE);
  ceu.addColorStop(0, '#111827');
  ceu.addColorStop(0.4, '#312e81');
  ceu.addColorStop(0.78, '#9a3412');
  ceu.addColorStop(1, '#451a03');
  g.fillStyle = ceu;
  g.fillRect(0, 0, MUNDO_LARGURA, TOPO_CEU * TILE);

  for (let i = 0; i < 34; i++) {
    const x = (i * 97 + 43) % MUNDO_LARGURA;
    const y = 12 + ((i * 37) % 72);
    const brilho = 0.35 + Math.sin(tempo * 2 + i) * 0.18;
    g.globalAlpha = brilho;
    g.fillStyle = i % 5 === 0 ? CORES.ouroClaro : CORES.branco;
    g.fillRect(x, y, i % 7 === 0 ? 2 : 1, i % 7 === 0 ? 2 : 1);
  }
  g.globalAlpha = 1;

  g.fillStyle = '#fbbf24';
  g.globalAlpha = 0.6;
  g.beginPath();
  g.arc(620, 74, 26, 0, Math.PI * 2);
  g.fill();
  g.globalAlpha = 1;
  g.fillStyle = '#fdba74';
  g.beginPath();
  g.arc(620, 74, 19, 0, Math.PI * 2);
  g.fill();

  for (let i = 0; i < 9; i++) {
    const x = (i * 130 + camera.x * 0.1) % (MUNDO_LARGURA + 180) - 90;
    const y = 60 + (i % 3) * 18;
    g.fillStyle = 'rgba(226, 232, 240, 0.12)';
    g.fillRect(x, y, 48, 5);
    g.fillRect(x + 10, y - 5, 30, 5);
    g.fillRect(x + 20, y + 5, 22, 4);
  }

  g.fillStyle = '#1c1917';
  g.beginPath();
  g.moveTo(0, TOPO_CEU * TILE);
  for (let x = 0; x <= MUNDO_LARGURA; x += 32) {
    g.lineTo(x, TOPO_CEU * TILE - 20 - Math.sin(x * 0.025) * 18);
  }
  g.lineTo(MUNDO_LARGURA, TOPO_CEU * TILE);
  g.closePath();
  g.fill();

  g.fillStyle = '#292524';
  g.beginPath();
  g.moveTo(0, TOPO_CEU * TILE);
  for (let x = 0; x <= MUNDO_LARGURA; x += 26) {
    g.lineTo(x, TOPO_CEU * TILE - 8 - Math.cos(x * 0.04) * 7);
  }
  g.lineTo(MUNDO_LARGURA, TOPO_CEU * TILE);
  g.closePath();
  g.fill();
  g.restore();
}

function desenharRocha(
  g: CanvasRenderingContext2D,
  tx: number,
  ty: number,
  acimaVazio: boolean
): void {
  const x = tx * TILE;
  const y = ty * TILE;
  const variacao = hashTile(tx, ty) % 5;

  g.fillStyle = variacao === 0 ? '#3f2923' : CORES.rochaEscura;
  g.fillRect(x, y, TILE, TILE);
  g.fillStyle = CORES.rocha;
  g.fillRect(x, y, TILE - 1, TILE - 1);
  g.fillStyle = variacao % 2 === 0 ? CORES.rochaClara : '#59372a';
  g.fillRect(x + 2, y + 2, TILE - 5, 2);

  if (acimaVazio) {
    g.fillStyle = '#8b5a3c';
    g.fillRect(x, y, TILE, 2);
    g.fillStyle = '#a16207';
    g.fillRect(x + 2, y + 2, TILE - 6, 1);
  }

  if (variacao === 0) {
    g.fillStyle = '#2a1815';
    g.fillRect(x + 4, y + 7, 3, 2);
    g.fillRect(x + 9, y + 11, 2, 1);
  } else if (variacao === 2) {
    g.fillStyle = '#3b241e';
    g.fillRect(x + 10, y + 4, 3, 5);
    g.fillRect(x + 3, y + 12, 4, 2);
  } else if (variacao === 4) {
    g.fillStyle = '#7c4a2d';
    g.fillRect(x + 2, y + 9, 2, 4);
    g.fillRect(x + 6, y + 13, 5, 1);
  }
  g.fillStyle = '#180f0c';
  g.fillRect(x, y + TILE - 1, TILE, 1);
  g.fillRect(x + TILE - 1, y, 1, TILE);
}

function desenharFragil(
  g: CanvasRenderingContext2D,
  tx: number,
  ty: number,
  hp: number,
  acimaVazio: boolean
): void {
  const x = tx * TILE;
  const y = ty * TILE;
  desenharRocha(g, tx, ty, acimaVazio);
  g.fillStyle = CORES.fragil;
  g.fillRect(x + 1, y + 1, TILE - 2, TILE - 2);
  g.fillStyle = CORES.fragilClara;
  g.fillRect(x + 2, y + 2, TILE - 5, 2);
  g.fillStyle = '#5b351c';
  g.fillRect(x + 4, y + 4, 2, 4);
  g.fillRect(x + 5, y + 7, 4, 2);
  g.fillRect(x + 2, y + 10, 3, 2);
  g.fillRect(x + 10, y + 5, 2, 5);
  g.fillRect(x + 8, y + 11, 5, 2);
  if (hp <= 2) {
    g.fillStyle = '#2b1a18';
    g.fillRect(x + 8, y + 1, 1, 5);
    g.fillRect(x + 7, y + 6, 3, 1);
    g.fillRect(x + 3, y + 13, 1, 2);
  }
  if (hp <= 1) {
    g.fillRect(x + 11, y + 9, 1, 5);
    g.fillRect(x + 6, y + 12, 4, 1);
    g.fillRect(x + 2, y + 6, 4, 1);
  }
  g.fillStyle = '#c08445';
  g.fillRect(x, y, TILE, 1);
}

function desenharLinhaLava(g: CanvasRenderingContext2D, tx: number, ty: number): void {
  const x = tx * TILE;
  const y = ty * TILE;
  g.fillStyle = CORES.lava;
  g.fillRect(x, y, TILE, TILE);
  g.fillStyle = '#b91c1c';
  g.fillRect(x, y + 4, TILE, TILE - 4);
  g.fillStyle = CORES.lavaClara;
  g.fillRect(x, y, TILE, 2);
  g.fillRect(x + 2, y + 5, 4, 2);
  g.fillRect(x + 9, y + 10, 5, 2);
  g.fillStyle = '#7f1d1d';
  g.fillRect(x + 1, y + 8, 2, 2);
  g.fillRect(x + 12, y + 4, 2, 3);
}

export function desenharTiles(
  g: CanvasRenderingContext2D,
  mapa: MapaMina,
  camera: Camera,
  tempo: number
): void {
  const x0 = Math.max(0, Math.floor(camera.x / TILE) - 1);
  const y0 = Math.max(0, Math.floor(camera.y / TILE) - 1);
  const x1 = Math.min(mapa.largura - 1, Math.ceil((camera.x + LARGURA) / TILE) + 1);
  const y1 = Math.min(mapa.altura - 1, Math.ceil((camera.y + ALTURA) / TILE) + 1);

  for (let ty = y0; ty <= y1; ty++) {
    for (let tx = x0; tx <= x1; tx++) {
      const tile = tileEm(mapa, tx, ty);
      if (tile === TILE_VAZIO) continue;
      const indice = ty * mapa.largura + tx;
      const acimaVazio =
        tileEm(mapa, tx, ty - 1) === TILE_VAZIO ||
        tileEm(mapa, tx, ty - 1) === TILE_AGUA ||
        tileEm(mapa, tx, ty - 1) === TILE_LAVA;

      if (tile === TILE_ROCHA) {
        desenharRocha(g, tx, ty, acimaVazio);
      } else if (tile === TILE_FRAGIL) {
        desenharFragil(g, tx, ty, mapa.fragilHp.get(indice) ?? 3, acimaVazio);
      } else if (tile === TILE_LAVA_PAREDE) {
        const apagada = (mapa.lavaApagada.get(indice) ?? 0) > 0;
        if (apagada) {
          desenharRocha(g, tx, ty, acimaVazio);
          g.fillStyle = '#3f3f46';
          g.fillRect(tx * TILE + 2, ty * TILE + 2, TILE - 4, TILE - 4);
          g.fillStyle = '#71717a';
          g.fillRect(tx * TILE + 4, ty * TILE + 4, 3, 2);
          g.fillStyle = 'rgba(148, 163, 184, 0.28)';
          g.fillRect(tx * TILE + 7, ty * TILE + 1, 2, 5);
        } else {
          desenharLinhaLava(g, tx, ty);
        }
      } else if (tile === TILE_LAVA) {
        desenharLinhaLava(g, tx, ty);
        const brilho = 0.08 + Math.sin(tempo * 5 + tx) * 0.04;
        g.fillStyle = `rgba(251, 191, 36, ${brilho})`;
        g.fillRect(tx * TILE - 2, ty * TILE - 3, TILE + 4, TILE + 5);
      } else if (tile === TILE_AGUA) {
        g.fillStyle = CORES.aguaEscura;
        g.fillRect(tx * TILE, ty * TILE, TILE, TILE);
        g.fillStyle = CORES.agua;
        g.fillRect(tx * TILE, ty * TILE + 2, TILE, TILE - 3);
        g.fillStyle = CORES.aguaClara;
        g.fillRect(tx * TILE, ty * TILE + 2 + (Math.floor(tempo * 5 + tx) % 3), TILE, 1);
        g.fillStyle = 'rgba(224, 242, 254, 0.38)';
        g.fillRect(tx * TILE + 3, ty * TILE + 7, 6, 1);
      } else if (tile === TILE_MADEIRA) {
        g.fillStyle = CORES.madeiraEscura;
        g.fillRect(tx * TILE, ty * TILE, TILE, TILE);
        g.fillStyle = CORES.madeira;
        g.fillRect(tx * TILE, ty * TILE, TILE, TILE - 2);
        g.fillStyle = CORES.madeiraClara;
        g.fillRect(tx * TILE, ty * TILE + 1, TILE, 2);
        g.fillStyle = '#6b3f20';
        g.fillRect(tx * TILE + 3, ty * TILE + 6, 6, 1);
        g.fillRect(tx * TILE + 9, ty * TILE + 11, 4, 1);
        g.fillStyle = '#e7b168';
        g.fillRect(tx * TILE + 2, ty * TILE + 4, 2, 2);
        g.fillRect(tx * TILE + 12, ty * TILE + 8, 2, 2);
      }
    }
  }
}

export function desenharDecoracaoSalas(
  g: CanvasRenderingContext2D,
  mapa: MapaMina,
  tempo: number
): void {
  for (const sala of mapa.salas) {
    const x0 = sala.x * TILE;
    const y0 = sala.y * TILE;
    const largura = sala.largura * TILE;
    const altura = sala.altura * TILE;

    g.fillStyle = 'rgba(42, 25, 18, 0.82)';
    g.fillRect(x0 + 12, y0 + 48, 5, altura - 48);
    g.fillRect(x0 + largura - 17, y0 + 48, 5, altura - 48);
    g.fillStyle = 'rgba(120, 72, 34, 0.55)';
    g.fillRect(x0 + 13, y0 + 48, 2, altura - 50);
    g.fillRect(x0 + largura - 16, y0 + 48, 2, altura - 50);

    g.fillStyle = 'rgba(60, 36, 22, 0.8)';
    g.fillRect(x0 + 10, y0 + 40, largura - 20, 5);
    g.fillStyle = 'rgba(160, 96, 44, 0.42)';
    g.fillRect(x0 + 12, y0 + 41, largura - 24, 1);

    g.strokeStyle = 'rgba(148, 163, 184, 0.18)';
    g.lineWidth = 1;
    for (let i = 0; i < 4; i++) {
      const cx = x0 + 28 + i * 52;
      g.beginPath();
      g.moveTo(cx, y0 + 48);
      g.lineTo(cx, y0 + 62 + Math.sin(tempo + i) * 2);
      g.stroke();
    }

    g.fillStyle = 'rgba(251, 191, 36, 0.18)';
    g.fillRect(x0 + 20, y0 + 58, 3, 3);
    g.fillRect(x0 + largura - 24, y0 + 58, 3, 3);

    if (sala.indice % 4 === 2) {
      const cx = x0 + largura - 48;
      const cy = y0 + altura - 26;
      g.fillStyle = '#3f3f46';
      g.fillRect(cx, cy, 26, 12);
      g.fillRect(cx + 3, cy - 4, 20, 4);
      g.fillStyle = '#52525b';
      g.fillRect(cx + 2, cy + 2, 22, 3);
      g.fillStyle = '#18181b';
      g.fillRect(cx + 4, cy + 11, 5, 4);
      g.fillRect(cx + 17, cy + 11, 5, 4);
      g.fillStyle = CORES.ouro;
      g.fillRect(cx + 8, cy + 6, 3, 3);
      g.fillRect(cx + 15, cy + 6, 3, 3);
    }
  }
}

export function desenharTrilhos(
  g: CanvasRenderingContext2D,
  mapa: MapaMina
): void {
  for (const sala of mapa.salas) {
    const y = (sala.y + 2) * TILE;
    const x0 = (sala.x + 1) * TILE;
    const x1 = (sala.x + sala.largura - 2) * TILE;
    g.fillStyle = 'rgba(30, 20, 12, 0.7)';
    g.fillRect(x0, y - 2, x1 - x0, 2);
    g.fillStyle = 'rgba(146, 94, 55, 0.45)';
    for (let x = x0 + 4; x < x1; x += 12) {
      g.fillRect(x, y, 5, 1);
    }
  }
}
