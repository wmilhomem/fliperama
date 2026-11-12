import { CORES } from './constantes';
import { Particula, TextoFlutuante } from './tipos';

export function criarFaisca(
  particulas: Particula[],
  x: number,
  y: number,
  cor: string,
  quantidade = 6,
  velocidade = 80,
  gravidade = 180
): void {
  for (let i = 0; i < quantidade; i++) {
    const angulo = Math.random() * Math.PI * 2;
    const forca = velocidade * (0.35 + Math.random() * 0.75);
    particulas.push({
      x,
      y,
      vx: Math.cos(angulo) * forca,
      vy: Math.sin(angulo) * forca - 25,
      vida: 0.35 + Math.random() * 0.55,
      maxVida: 0.9,
      tamanho: Math.random() < 0.3 ? 2 : 1,
      cor,
      gravidade,
      brilho: true,
    });
  }
}

export function criarExplosao(particulas: Particula[], x: number, y: number): void {
  const cores = [CORES.lavaClara, CORES.laranja, CORES.lava, '#57534e', CORES.ouro];
  for (let i = 0; i < 42; i++) {
    const angulo = Math.random() * Math.PI * 2;
    const forca = 45 + Math.random() * 210;
    const vida = 0.45 + Math.random() * 0.75;
    particulas.push({
      x,
      y,
      vx: Math.cos(angulo) * forca,
      vy: Math.sin(angulo) * forca,
      vida,
      maxVida: vida,
      tamanho: 1 + Math.floor(Math.random() * 3),
      cor: cores[Math.floor(Math.random() * cores.length)],
      gravidade: 220,
      brilho: Math.random() < 0.45,
    });
  }
}

export function criarFumaca(particulas: Particula[], x: number, y: number): void {
  for (let i = 0; i < 12; i++) {
    particulas.push({
      x: x + (Math.random() - 0.5) * 16,
      y: y + (Math.random() - 0.5) * 12,
      vx: (Math.random() - 0.5) * 24,
      vy: -20 - Math.random() * 30,
      vida: 0.5 + Math.random() * 0.5,
      maxVida: 1,
      tamanho: 2 + Math.floor(Math.random() * 3),
      cor: Math.random() < 0.5 ? '#57534e' : '#78716c',
      gravidade: -10,
      brilho: false,
    });
  }
}

export function criarTexto(
  textos: TextoFlutuante[],
  x: number,
  y: number,
  texto: string,
  cor: string,
  vida = 1.3
): void {
  textos.push({ x, y, texto, cor, vida, maxVida: vida });
}

export function atualizarEfeitos(
  particulas: Particula[],
  textos: TextoFlutuante[],
  dt: number
): void {
  for (let i = particulas.length - 1; i >= 0; i--) {
    const p = particulas[i];
    p.vida -= dt;
    p.vy += p.gravidade * dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    if (p.vida <= 0) particulas.splice(i, 1);
  }

  for (let i = textos.length - 1; i >= 0; i--) {
    const t = textos[i];
    t.vida -= dt;
    t.y -= 20 * dt;
    if (t.vida <= 0) textos.splice(i, 1);
  }
}

export function desenharParticulas(
  g: CanvasRenderingContext2D,
  particulas: Particula[]
): void {
  for (const p of particulas) {
    const alpha = Math.max(0, Math.min(1, p.vida / p.maxVida));
    g.globalAlpha = alpha;
    g.fillStyle = p.cor;
    const tamanho = p.tamanho;
    g.fillRect(Math.round(p.x), Math.round(p.y), tamanho, tamanho);
  }
  g.globalAlpha = 1;
}

export function desenharTextos(
  g: CanvasRenderingContext2D,
  textos: TextoFlutuante[]
): void {
  g.save();
  g.textAlign = 'center';
  g.font = '7px "Press Start 2P", monospace';
  for (const t of textos) {
    const alpha = Math.max(0, Math.min(1, t.vida / t.maxVida));
    g.globalAlpha = alpha;
    g.fillStyle = CORES.preto;
    g.fillText(t.texto, Math.round(t.x) + 1, Math.round(t.y) + 1);
    g.fillStyle = t.cor;
    g.fillText(t.texto, Math.round(t.x), Math.round(t.y));
  }
  g.restore();
}
