import {
  COLUNAS,
  CORES_CRISTAL,
  FRAGIL_VIDA,
  LAVA_APAGADA_TEMPO,
  LINHAS,
  MAPA_ALTURA,
  MAPA_LARGURA,
  MARGEM,
  ORDEM_SALAS,
  PONTOS_CRISTAL,
  SALA_ALTURA,
  SALA_GAP,
  SALA_LARGURA,
  SALAS_MAX,
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
import { chance, criarRng, inteiro, misturarSemente } from './semente';
import {
  Cristal,
  CriaturaSpawn,
  Lampada,
  LavaMovel,
  MapaMina,
  Ponto,
  Retangulo,
  Sala,
  TipoCriatura,
} from './tipos';

const Y_SALA_INICIAL = TOPO_CEU + 3;

function indiceDe(mapa: MapaMina, tx: number, ty: number): number {
  return ty * mapa.largura + tx;
}

export function tileEm(mapa: MapaMina, tx: number, ty: number): number {
  if (tx < 0 || ty < 0 || tx >= mapa.largura || ty >= mapa.altura) return TILE_ROCHA;
  return mapa.tiles[indiceDe(mapa, tx, ty)];
}

function definirTile(mapa: MapaMina, tx: number, ty: number, tile: number): void {
  if (tx < 0 || ty < 0 || tx >= mapa.largura || ty >= mapa.altura) return;
  const indice = indiceDe(mapa, tx, ty);
  mapa.tiles[indice] = tile;
  if (tile !== TILE_FRAGIL) mapa.fragilHp.delete(indice);
  if (tile !== TILE_LAVA_PAREDE) mapa.lavaApagada.delete(indice);
}

function cavar(mapa: MapaMina, x0: number, y0: number, x1: number, y1: number): void {
  for (let ty = y0; ty <= y1; ty++) {
    for (let tx = x0; tx <= x1; tx++) {
      definirTile(mapa, tx, ty, TILE_VAZIO);
    }
  }
}

export function eSolido(mapa: MapaMina, tx: number, ty: number): boolean {
  if (tx < 0 || ty < 0 || tx >= mapa.largura || ty >= mapa.altura) return true;
  const indice = indiceDe(mapa, tx, ty);
  const tile = mapa.tiles[indice];
  if (tile === TILE_FRAGIL) return (mapa.fragilHp.get(indice) ?? FRAGIL_VIDA) > 0;
  if (tile === TILE_LAVA_PAREDE) return (mapa.lavaApagada.get(indice) ?? 0) <= 0;
  return tile === TILE_ROCHA || tile === TILE_MADEIRA;
}

export function eLava(mapa: MapaMina, tx: number, ty: number): boolean {
  if (tx < 0 || ty < 0 || tx >= mapa.largura || ty >= mapa.altura) return false;
  const indice = indiceDe(mapa, tx, ty);
  const tile = mapa.tiles[indice];
  if (tile === TILE_LAVA) return true;
  return tile === TILE_LAVA_PAREDE && (mapa.lavaApagada.get(indice) ?? 0) <= 0;
}

export function eAgua(mapa: MapaMina, tx: number, ty: number): boolean {
  return tileEm(mapa, tx, ty) === TILE_AGUA;
}

export function rectColideSolido(mapa: MapaMina, caixa: Retangulo): boolean {
  const x0 = Math.floor(caixa.x / TILE);
  const x1 = Math.floor((caixa.x + caixa.largura - 0.001) / TILE);
  const y0 = Math.floor(caixa.y / TILE);
  const y1 = Math.floor((caixa.y + caixa.altura - 0.001) / TILE);
  for (let ty = y0; ty <= y1; ty++) {
    for (let tx = x0; tx <= x1; tx++) {
      if (eSolido(mapa, tx, ty)) return true;
    }
  }
  return false;
}

export function rectEmLava(mapa: MapaMina, caixa: Retangulo): boolean {
  const x0 = Math.floor(caixa.x / TILE);
  const x1 = Math.floor((caixa.x + caixa.largura - 0.001) / TILE);
  const y0 = Math.floor(caixa.y / TILE);
  const y1 = Math.floor((caixa.y + caixa.altura - 0.001) / TILE);
  for (let ty = y0; ty <= y1; ty++) {
    for (let tx = x0; tx <= x1; tx++) {
      if (eLava(mapa, tx, ty)) return true;
    }
  }
  return false;
}

export function rectEmAgua(mapa: MapaMina, caixa: Retangulo): boolean {
  const x = Math.floor((caixa.x + caixa.largura / 2) / TILE);
  const y = Math.floor((caixa.y + caixa.altura * 0.7) / TILE);
  return eAgua(mapa, x, y);
}

export function quebrarFragil(mapa: MapaMina, tx: number, ty: number): boolean {
  if (tileEm(mapa, tx, ty) !== TILE_FRAGIL) return false;
  const indice = indiceDe(mapa, tx, ty);
  const hp = (mapa.fragilHp.get(indice) ?? FRAGIL_VIDA) - 1;
  if (hp <= 0) {
    mapa.fragilHp.delete(indice);
    mapa.tiles[indice] = TILE_VAZIO;
    return true;
  }
  mapa.fragilHp.set(indice, hp);
  return false;
}

export function apagarLava(mapa: MapaMina, tx: number, ty: number): boolean {
  if (tileEm(mapa, tx, ty) !== TILE_LAVA_PAREDE) return false;
  mapa.lavaApagada.set(indiceDe(mapa, tx, ty), LAVA_APAGADA_TEMPO);
  return true;
}

export function atualizarLavaApagada(mapa: MapaMina, dt: number): void {
  for (const [indice, restante] of mapa.lavaApagada) {
    const novo = restante - dt;
    if (novo <= 0) mapa.lavaApagada.delete(indice);
    else mapa.lavaApagada.set(indice, novo);
  }
}

export function atualizarLavaMoveis(mapa: MapaMina, dt: number): void {
  for (const lava of mapa.lavaMoveis) {
    lava.tempo += dt;
    lava.x = lava.baseX + Math.sin(lava.tempo * lava.velocidade) * lava.amplitude;
  }
}

export function salaEm(mapa: MapaMina, x: number, y: number): number {
  const tx = Math.floor(x / TILE);
  const ty = Math.floor(y / TILE);
  for (const sala of mapa.salas) {
    if (
      tx >= sala.x &&
      tx < sala.x + sala.largura &&
      ty >= sala.y &&
      ty < sala.y + sala.altura
    ) {
      return sala.indice;
    }
  }
  return -1;
}

function criarSalas(total: number): Sala[] {
  const salas: Sala[] = [];
  for (let i = 0; i < total; i++) {
    const [linha, coluna] = ORDEM_SALAS[i];
    salas.push({
      indice: i,
      coluna,
      linha,
      x: MARGEM + coluna * (SALA_LARGURA + SALA_GAP),
      y: Y_SALA_INICIAL + linha * (SALA_ALTURA + SALA_GAP),
      largura: SALA_LARGURA,
      altura: SALA_ALTURA,
      escura: false,
      temLava: false,
      temAgua: false,
    });
  }
  return salas;
}

function adicionarCristal(mapa: MapaMina, tx: number, ty: number, tipo: number): void {
  const id = mapa.cristais.length + 1;
  mapa.cristais.push({
    id,
    x: tx * TILE + TILE / 2,
    y: ty * TILE + TILE / 2,
    tipo,
    cor: CORES_CRISTAL[tipo],
    pontos: PONTOS_CRISTAL[tipo],
    coletado: false,
    tempo: id * 0.37,
  });
  mapa.totalCristais += 1;
}

function criarAlcove(
  mapa: MapaMina,
  sala: Sala,
  lado: -1 | 1,
  rng: () => number
): Ponto | null {
  if (sala.coluna !== 0 && sala.coluna !== 2) return null;
  if (sala.indice === 0 || !chance(rng, 0.72)) return null;

  const paredeX = lado === -1 ? sala.x - 1 : sala.x + SALA_LARGURA;
  const x0 = lado === -1 ? sala.x - 3 : sala.x + SALA_LARGURA + 1;
  const x1 = lado === -1 ? sala.x - 2 : sala.x + SALA_LARGURA + 2;
  const y0 = sala.y + 4;
  const y1 = sala.y + 6;

  for (let ty = y0; ty <= y1; ty++) {
    definirTile(mapa, paredeX, ty, TILE_FRAGIL);
    mapa.fragilHp.set(indiceDe(mapa, paredeX, ty), FRAGIL_VIDA);
  }
  cavar(mapa, x0, y0, x1, y1);

  return { x: Math.floor((x0 + x1) / 2), y: y0 + 1 };
}

function criarCristais(mapa: MapaMina, rng: () => number): void {
  const minimoInicio = mapa.salas[0];

  for (const sala of mapa.salas) {
    const quantidade = 3 + inteiro(rng, 0, 3);
    let criados = 0;
    for (let tentativa = 0; tentativa < 60 && criados < quantidade; tentativa++) {
      const tx = inteiro(rng, sala.x + 1, sala.x + SALA_LARGURA - 2);
      const ty = inteiro(rng, sala.y + 1, sala.y + SALA_ALTURA - 1);
      const pertoInicio =
        sala.indice === 0 &&
        Math.abs(tx - (minimoInicio.x + 3)) <= 2 &&
        Math.abs(ty - (minimoInicio.y + 1)) <= 2;
      const pertoMinerador =
        sala.indice === mapa.salaFinal &&
        Math.abs(tx - Math.floor(mapa.minerador.x / TILE)) <= 2 &&
        Math.abs(ty - Math.floor(mapa.minerador.y / TILE)) <= 2;
      if (pertoInicio || pertoMinerador) continue;
      if (tileEm(mapa, tx, ty) !== TILE_VAZIO) continue;
      if (eLava(mapa, tx, ty) || eAgua(mapa, tx, ty)) continue;

      let ocupado = false;
      for (const cristal of mapa.cristais) {
        if (
          Math.floor(cristal.x / TILE) === tx &&
          Math.floor(cristal.y / TILE) === ty
        ) {
          ocupado = true;
          break;
        }
      }
      if (ocupado) continue;

      const tipo = inteiro(rng, 0, 3);
      adicionarCristal(mapa, tx, ty, tipo);
      criados += 1;
    }

    const lado = sala.coluna === 0 ? -1 : 1;
    const alcove = criarAlcove(mapa, sala, lado, rng);
    if (alcove) adicionarCristal(mapa, alcove.x, alcove.y, inteiro(rng, 1, 3));
  }
}

function criarPerigos(mapa: MapaMina, rng: () => number): void {
  for (const sala of mapa.salas) {
    if (sala.indice === 0 || sala.indice === mapa.salaFinal) continue;

    if (chance(rng, 0.56)) {
      const lava = chance(rng, 0.52);
      const comprimento = inteiro(rng, 3, 5);
      const inicio = chance(rng, 0.5) ? sala.x + 2 : sala.x + 8;
      for (let i = 0; i < comprimento; i++) {
        const tx = inicio + i;
        if (tx >= sala.x + SALA_LARGURA - 1) break;
        if (tileEm(mapa, tx, sala.y + SALA_ALTURA - 1) === TILE_VAZIO) {
          definirTile(mapa, tx, sala.y + SALA_ALTURA - 1, lava ? TILE_LAVA : TILE_AGUA);
        }
      }
      if (lava) sala.temLava = true;
      else sala.temAgua = true;
    }

    if (chance(rng, 0.34)) {
      const tx = sala.x + (chance(rng, 0.5) ? 10 : 1);
      for (let ty = sala.y + 4; ty <= sala.y + 6; ty++) {
        if (tileEm(mapa, tx, ty) === TILE_VAZIO) {
          definirTile(mapa, tx, ty, TILE_LAVA_PAREDE);
        }
      }
      sala.temLava = true;
    }

    if (chance(rng, 0.4)) {
      sala.escura = true;
    }
  }

  mapa.salas[mapa.salas.length - 1].escura = chance(rng, 0.45);
}

function criarLampadas(mapa: MapaMina): void {
  let id = 1;
  for (const sala of mapa.salas) {
    if (!sala.escura) continue;
    mapa.lampadas.push({
      id: id++,
      sala: sala.indice,
      x: sala.x * TILE + 3,
      y: (sala.y + 4) * TILE + 8,
      acesa: false,
      brilho: 0,
    });
  }
}

function criarSpawns(
  mapa: MapaMina,
  rng: () => number,
  fase: number
): CriaturaSpawn[] {
  const spawns: CriaturaSpawn[] = [];
  let id = 1;

  for (const sala of mapa.salas) {
    if (sala.indice === 0) continue;
    const quantidade = Math.min(
      4,
      1 + Math.floor(fase / 3) + (chance(rng, 0.35) ? 1 : 0)
    );

    for (let i = 0; i < quantidade; i++) {
      const opcoes: TipoCriatura[] = ['morcego', 'aranha', 'cobra'];
      if (sala.escura) opcoes.push('mariposa', 'mariposa');
      if (sala.temAgua) opcoes.push('piranha', 'piranha');
      const tipo = opcoes[inteiro(rng, 0, opcoes.length - 1)];

      if (tipo === 'piranha') {
        const aguas: Ponto[] = [];
        for (let ty = sala.y; ty < sala.y + SALA_ALTURA; ty++) {
          for (let tx = sala.x; tx < sala.x + SALA_LARGURA; tx++) {
            if (tileEm(mapa, tx, ty) === TILE_AGUA) aguas.push({ x: tx, y: ty });
          }
        }
        if (aguas.length === 0) continue;
        const ponto = aguas[inteiro(rng, 0, aguas.length - 1)];
        spawns.push({
          id: id++,
          tipo,
          sala: sala.indice,
          x: ponto.x * TILE + 8,
          y: ponto.y * TILE + 8,
        });
        continue;
      }

      if (tipo === 'cobra') {
        const tx = inteiro(rng, sala.x + 2, sala.x + SALA_LARGURA - 3);
        const ty = sala.y + SALA_ALTURA - 1;
        if (tileEm(mapa, tx, ty) !== TILE_VAZIO) continue;
        spawns.push({
          id: id++,
          tipo,
          sala: sala.indice,
          x: tx * TILE + 8,
          y: (ty + 1) * TILE - 10,
        });
        continue;
      }

      const tx = inteiro(rng, sala.x + 1, sala.x + SALA_LARGURA - 2);
      const ty = inteiro(rng, sala.y + 1, sala.y + 4);
      if (tileEm(mapa, tx, ty) !== TILE_VAZIO) continue;
      spawns.push({
        id: id++,
        tipo,
        sala: sala.indice,
        x: tx * TILE + 8,
        y: ty * TILE + 8,
      });
    }
  }

  return spawns;
}

function criarLavaMoveis(
  mapa: MapaMina,
  rng: () => number,
  fase: number
): LavaMovel[] {
  if (fase < 5) return [];
  const lavaMoveis: LavaMovel[] = [];
  for (const sala of mapa.salas) {
    if (sala.indice < 2 || !sala.temLava || !chance(rng, 0.65)) continue;
    const baseX = (sala.x + 4) * TILE + 8;
    lavaMoveis.push({
      x: baseX,
      y: (sala.y + 3) * TILE,
      baseX,
      largura: 8,
      altura: (SALA_ALTURA - 3) * TILE,
      amplitude: 24 + fase * 2,
      velocidade: 0.7 + fase * 0.06,
      tempo: rng() * Math.PI * 2,
    });
  }
  return lavaMoveis;
}

function mineradorLivre(mapa: MapaMina): void {
  const sala = mapa.salas[mapa.salaFinal];
  for (let ty = sala.y + 5; ty <= sala.y + SALA_ALTURA - 1; ty++) {
    for (let tx = sala.x + 4; tx <= sala.x + 9; tx++) {
      const tile = tileEm(mapa, tx, ty);
      if (tile === TILE_LAVA || tile === TILE_AGUA) {
        definirTile(mapa, tx, ty, TILE_VAZIO);
      }
    }
  }
}

export function caminhoLivre(mapa: MapaMina, inicio: Ponto, fim: Ponto): boolean {
  const largura = mapa.largura;
  const inicioX = Math.floor((inicio.x + 6) / TILE);
  const inicioY = Math.floor((inicio.y + 14) / TILE);
  const fimX = Math.floor(fim.x / TILE);
  const fimY = Math.floor((fim.y - 8) / TILE);
  const visitados = new Uint8Array(largura * mapa.altura);
  const filaX: number[] = [inicioX];
  const filaY: number[] = [inicioY];
  visitados[inicioY * largura + inicioX] = 1;

  for (let cabeca = 0; cabeca < filaX.length; cabeca++) {
    const x = filaX[cabeca];
    const y = filaY[cabeca];
    if (x === fimX && y === fimY) return true;

    const vizinhos: Array<[number, number]> = [
      [x + 1, y],
      [x - 1, y],
      [x, y + 1],
      [x, y - 1],
    ];
    for (const [nx, ny] of vizinhos) {
      if (nx < 0 || ny < 0 || nx >= mapa.largura || ny >= mapa.altura) continue;
      const indice = ny * largura + nx;
      if (visitados[indice]) continue;
      if (eSolido(mapa, nx, ny)) continue;
      visitados[indice] = 1;
      filaX.push(nx);
      filaY.push(ny);
    }
  }

  return false;
}

function garantirCaminho(mapa: MapaMina): void {
  if (caminhoLivre(mapa, mapa.inicio, mapa.minerador)) return;

  const inicio = mapa.salas[0];
  const fim = mapa.salas[mapa.salaFinal];
  const yInicio = inicio.y + 4;
  const yFim = fim.y + 4;
  const xInicio = inicio.x + 6;
  const xFim = fim.x + 6;

  cavar(
    mapa,
    Math.min(xInicio, xFim) - 1,
    yInicio - 1,
    Math.max(xInicio, xFim) + 1,
    yInicio + 1
  );
  cavar(mapa, xFim - 1, Math.min(yInicio, yFim) - 1, xFim + 1, Math.max(yInicio, yFim) + 1);
  cavar(
    mapa,
    Math.min(xInicio, xFim) - 1,
    yFim - 1,
    Math.max(xInicio, xFim) + 1,
    yFim + 1
  );
}

export function criarMapa(fase: number): MapaMina {
  const totalSalas = 6 + Math.min(SALAS_MAX - 6, fase - 1);
  const salas = criarSalas(totalSalas);
  const rng = criarRng(misturarSemente(0x4d494e41, fase, 0x51a));

  const mapa: MapaMina = {
    largura: MAPA_LARGURA,
    altura: MAPA_ALTURA,
    tiles: new Uint8Array(MAPA_LARGURA * MAPA_ALTURA),
    fragilHp: new Map<number, number>(),
    lavaApagada: new Map<number, number>(),
    salas,
    cristais: [],
    lampadas: [],
    spawns: [],
    lavaMoveis: [],
    inicio: { x: 0, y: 0 },
    minerador: { x: 0, y: 0 },
    salaInicial: 0,
    salaFinal: totalSalas - 1,
    totalCristais: 0,
  };

  mapa.tiles.fill(TILE_ROCHA);
  cavar(mapa, 0, 0, MAPA_LARGURA - 1, TOPO_CEU - 1);

  for (const sala of salas) {
    cavar(mapa, sala.x, sala.y, sala.x + SALA_LARGURA - 1, sala.y + SALA_ALTURA - 1);
  }

  for (const sala of salas) {
    const yPlataforma = sala.y + 2;
    for (let tx = sala.x + 1; tx <= sala.x + SALA_LARGURA - 2; tx++) {
      if (tx >= sala.x + 5 && tx <= sala.x + 7) continue;
      definirTile(mapa, tx, yPlataforma, TILE_MADEIRA);
    }
    cavar(mapa, sala.x + 5, sala.y - 4, sala.x + 7, sala.y - 1);
  }

  cavar(mapa, salas[0].x + 5, TOPO_CEU, salas[0].x + 7, salas[0].y - 1);

  for (let i = 0; i < salas.length - 1; i++) {
    const atual = salas[i];
    const proxima = salas[i + 1];
    if (atual.linha === proxima.linha) {
      cavar(
        mapa,
        atual.x + SALA_LARGURA,
        atual.y + 3,
        proxima.x - 1,
        atual.y + 5
      );
    } else {
      const cx = atual.x + 5;
      cavar(mapa, cx, atual.y + SALA_ALTURA, cx + 2, proxima.y - 1);
    }
  }

  mapa.inicio = {
    x: (salas[0].x + 3) * TILE + 2,
    y: (salas[0].y + 2) * TILE - 28,
  };
  const final = salas[salas.length - 1];
  mapa.minerador = {
    x: (final.x + 6) * TILE + 8,
    y: (final.y + SALA_ALTURA) * TILE,
  };

  criarPerigos(mapa, rng);
  mineradorLivre(mapa);
  criarLampadas(mapa);
  criarCristais(mapa, rng);
  mapa.spawns = criarSpawns(mapa, rng, fase);
  mapa.lavaMoveis = criarLavaMoveis(mapa, rng, fase);
  garantirCaminho(mapa);

  return mapa;
}
