import { ALTURA, LARGURA } from './constantes';
import { Camera, FonteLuz } from './tipos';

let mascara: HTMLCanvasElement | null = null;

function obterMascara(): HTMLCanvasElement | null {
  if (typeof document === 'undefined') return null;
  if (!mascara) {
    mascara = document.createElement('canvas');
    mascara.width = LARGURA;
    mascara.height = ALTURA;
  }
  return mascara;
}

export function desenharEscuridao(
  g: CanvasRenderingContext2D,
  camera: Camera,
  fontes: FonteLuz[],
  escuro: boolean
): void {
  if (!escuro) return;
  const canvas = obterMascara();
  if (!canvas) return;
  const m = canvas.getContext('2d');
  if (!m) return;

  m.clearRect(0, 0, LARGURA, ALTURA);
  m.globalCompositeOperation = 'source-over';
  m.fillStyle = 'rgba(2, 6, 23, 0.94)';
  m.fillRect(0, 0, LARGURA, ALTURA);
  m.globalCompositeOperation = 'destination-out';

  for (const fonte of fontes) {
    const x = fonte.x - camera.x;
    const y = fonte.y - camera.y;
    if (x < -fonte.raio || x > LARGURA + fonte.raio || y < -fonte.raio || y > ALTURA + fonte.raio) {
      continue;
    }
    const gradiente = m.createRadialGradient(x, y, 0, x, y, fonte.raio);
    gradiente.addColorStop(0, `rgba(255,255,255,${fonte.forca})`);
    gradiente.addColorStop(0.62, `rgba(255,255,255,${fonte.forca * 0.78})`);
    gradiente.addColorStop(1, 'rgba(255,255,255,0)');
    m.fillStyle = gradiente;
    m.fillRect(x - fonte.raio, y - fonte.raio, fonte.raio * 2, fonte.raio * 2);
  }

  m.globalCompositeOperation = 'source-over';
  g.drawImage(canvas, 0, 0);
}
