import { MapaMina, Retangulo } from './tipos';

export function colideMapa(mapa: MapaMina, caixa: Retangulo): boolean {
  const escala = 16;
  const x0 = Math.floor(caixa.x / escala);
  const x1 = Math.floor((caixa.x + caixa.largura - 0.001) / escala);
  const y0 = Math.floor(caixa.y / escala);
  const y1 = Math.floor((caixa.y + caixa.altura - 0.001) / escala);

  for (let ty = y0; ty <= y1; ty++) {
    for (let tx = x0; tx <= x1; tx++) {
      if (tileSolido(mapa, tx, ty)) return true;
    }
  }
  return false;
}

export function tileSolido(mapa: MapaMina, tx: number, ty: number): boolean {
  if (tx < 0 || ty < 0 || tx >= mapa.largura || ty >= mapa.altura) return true;
  const indice = ty * mapa.largura + tx;
  const tile = mapa.tiles[indice];

  if (tile === 2) {
    return (mapa.fragilHp.get(indice) ?? 3) > 0;
  }
  if (tile === 3) {
    return (mapa.lavaApagada.get(indice) ?? 0) <= 0;
  }
  return tile === 1 || tile === 6;
}

export function moverHorizontal(
  mapa: MapaMina,
  corpo: { x: number; y: number; largura: number; altura: number; vx: number },
  deslocamento: number
): boolean {
  const passos = Math.max(1, Math.ceil(Math.abs(deslocamento)));
  const passo = deslocamento / passos;

  for (let i = 0; i < passos; i++) {
    const proximo = corpo.x + passo;
    if (
      colideMapa(mapa, {
        x: proximo,
        y: corpo.y,
        largura: corpo.largura,
        altura: corpo.altura,
      })
    ) {
      corpo.vx = 0;
      return true;
    }
    corpo.x = proximo;
  }
  return false;
}

export function moverVertical(
  mapa: MapaMina,
  corpo: { x: number; y: number; largura: number; altura: number; vy: number },
  deslocamento: number
): { colidiu: boolean; noChao: boolean; noTeto: boolean } {
  const passos = Math.max(1, Math.ceil(Math.abs(deslocamento)));
  const passo = deslocamento / passos;
  let colidiu = false;
  let noChao = false;
  let noTeto = false;

  for (let i = 0; i < passos; i++) {
    const proximo = corpo.y + passo;
    if (
      colideMapa(mapa, {
        x: corpo.x,
        y: proximo,
        largura: corpo.largura,
        altura: corpo.altura,
      })
    ) {
      colidiu = true;
      if (passo > 0) noChao = true;
      else noTeto = true;
      corpo.vy = 0;
      break;
    }
    corpo.y = proximo;
  }

  return { colidiu, noChao, noTeto };
}

export function centro(caixa: Retangulo): { x: number; y: number } {
  return { x: caixa.x + caixa.largura / 2, y: caixa.y + caixa.altura / 2 };
}

export function caixasSobrepostas(a: Retangulo, b: Retangulo): boolean {
  return (
    a.x < b.x + b.largura &&
    a.x + a.largura > b.x &&
    a.y < b.y + b.altura &&
    a.y + a.altura > b.y
  );
}

export function pontoNaCaixa(px: number, py: number, caixa: Retangulo): boolean {
  return (
    px >= caixa.x &&
    px <= caixa.x + caixa.largura &&
    py >= caixa.y &&
    py <= caixa.y + caixa.altura
  );
}
