import { CORES, DINAMITE_FUSIVEL, GRAVIDADE, TILE } from './constantes';
import { moverHorizontal, moverVertical } from './fisica';
import { Dinamite, Heroina, MapaMina, Retangulo } from './tipos';

export function criarDinamite(heroina: Heroina): Dinamite {
  return {
    x: heroina.x + heroina.largura / 2 - 4 + heroina.olhando * 8,
    y: heroina.y + 8,
    vx: heroina.olhando * 38,
    vy: -42,
    largura: 8,
    altura: 8,
    noChao: false,
    tempo: 0,
    pisca: 0,
  };
}

export function atualizarDinamite(dinamite: Dinamite, dt: number, mapa: MapaMina): boolean {
  dinamite.tempo += dt;
  dinamite.pisca += dt;

  if (!dinamite.noChao) dinamite.vy += GRAVIDADE * dt;
  dinamite.vx *= Math.pow(0.84, dt * 60);

  const colidiuX = moverHorizontal(mapa, dinamite, dinamite.vx * dt);
  if (colidiuX) dinamite.vx = 0;

  const resultadoY = moverVertical(mapa, dinamite, dinamite.vy * dt);
  dinamite.noChao = resultadoY.noChao;
  if (resultadoY.noChao || resultadoY.noTeto) dinamite.vy = 0;

  return dinamite.tempo >= DINAMITE_FUSIVEL;
}

export function caixaDinamite(dinamite: Dinamite): Retangulo {
  return {
    x: dinamite.x - 2,
    y: dinamite.y - 2,
    largura: dinamite.largura + 4,
    altura: dinamite.altura + 4,
  };
}

export function desenharDinamite(
  g: CanvasRenderingContext2D,
  dinamite: Dinamite,
  ativo: boolean
): void {
  const x = Math.round(dinamite.x);
  const y = Math.round(dinamite.y);
  const piscar = Math.floor(dinamite.pisca * (7 + dinamite.tempo * 2)) % 2 === 0;

  g.fillStyle = CORES.vermelho;
  g.fillRect(x, y, 8, 8);
  g.fillStyle = CORES.rosaClaro;
  g.fillRect(x + 1, y + 1, 6, 2);
  g.fillStyle = CORES.vermelho;
  g.fillRect(x + 1, y + 4, 6, 3);
  g.fillStyle = CORES.ouro;
  g.fillRect(x + 3, y - 2, 2, 3);
  g.fillStyle = piscar ? CORES.ouroClaro : CORES.lava;
  g.fillRect(x + 5, y - 3, 2, 2);

  if (ativo) {
    g.fillStyle = 'rgba(239, 68, 68, 0.18)';
    g.fillRect(x - 8, y - 8, 24, 24);
    g.strokeStyle = 'rgba(251, 191, 36, 0.45)';
    g.strokeRect(
      Math.round(dinamite.x + 4 - 32),
      Math.round(dinamite.y + 4 - 32),
      TILE * 4,
      TILE * 4
    );
  }
}
