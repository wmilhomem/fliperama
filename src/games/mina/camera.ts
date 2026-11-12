import { ALTURA, LARGURA, MUNDO_ALTURA, MUNDO_LARGURA } from './constantes';
import { clamp } from './semente';
import { Camera } from './tipos';

export function criarCamera(x: number, y: number): Camera {
  return {
    x: clamp(x - LARGURA / 2, 0, MUNDO_LARGURA - LARGURA),
    y: clamp(y - ALTURA / 2, 0, MUNDO_ALTURA - ALTURA),
    tremor: 0,
  };
}

export function atualizarCamera(
  camera: Camera,
  alvoX: number,
  alvoY: number,
  dt: number
): void {
  const destinoX = clamp(alvoX - LARGURA / 2, 0, MUNDO_LARGURA - LARGURA);
  const destinoY = clamp(alvoY - ALTURA * 0.54, 0, MUNDO_ALTURA - ALTURA);
  const suavidade = Math.min(1, dt * 6.5);

  camera.x += (destinoX - camera.x) * suavidade;
  camera.y += (destinoY - camera.y) * suavidade;
  camera.x = clamp(camera.x, 0, MUNDO_LARGURA - LARGURA);
  camera.y = clamp(camera.y, 0, MUNDO_ALTURA - ALTURA);
  camera.tremor = Math.max(0, camera.tremor - dt * 2.4);
}
