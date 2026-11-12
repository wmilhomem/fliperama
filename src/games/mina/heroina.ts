import { InputState } from '../../engine/types';
import {
  ACELERACAO,
  ACELERACAO_PROPULSOR,
  ALTURA,
  ATRITO,
  CONSUMO_CHAO,
  CONSUMO_PROPULSOR,
  ENERGY_MAX,
  GRAVIDADE,
  GRAVIDADE_AGUA,
  INVULNERAVEL_TEMPO,
  JOGADOR_ALTURA,
  JOGADOR_LARGURA,
  LARGURA,
  MERGULHO_MAX,
  MUNDO_ALTURA,
  MUNDO_LARGURA,
  PROPULSOR_AGUA,
  QUEDA_MAX,
  SUBIDA_AGUA_MAX,
  SUBIDA_MAX,
  TILE,
  TOPO_CEU,
  VELOCIDADE_ANDAR,
} from './constantes';
import { moverHorizontal, moverVertical } from './fisica';
import { MapaMina, Heroina, Ponto, Retangulo } from './tipos';

export interface ResultadoHeroina {
  morreu: boolean;
  semEnergia: boolean;
  propulsor: boolean;
  andando: boolean;
  emAgua: boolean;
}

export function criarHeroina(inicio: Ponto): Heroina {
  return {
    x: inicio.x,
    y: inicio.y,
    largura: JOGADOR_LARGURA,
    altura: JOGADOR_ALTURA,
    vx: 0,
    vy: 0,
    olhando: 1,
    noChao: false,
    energia: ENERGY_MAX,
    calor: 0,
    travado: false,
    tempoTrava: 0,
    invulneravel: 0,
    emAgua: false,
    propulsor: false,
    andando: false,
    animacao: 0,
  };
}

export function caixaHeroina(heroina: Heroina): Retangulo {
  return {
    x: heroina.x,
    y: heroina.y,
    largura: heroina.largura,
    altura: heroina.altura,
  };
}

export function centroHeroina(heroina: Heroina): Ponto {
  return {
    x: heroina.x + heroina.largura / 2,
    y: heroina.y + heroina.altura / 2,
  };
}

export function atualizarHeroina(
  heroina: Heroina,
  input: InputState,
  dt: number,
  mapa: MapaMina
): ResultadoHeroina {
  heroina.invulneravel = Math.max(0, heroina.invulneravel - dt);
  heroina.propulsor = false;
  heroina.andando = false;

  const centro = centroHeroina(heroina);
  heroina.emAgua =
    mapa.tiles[Math.floor(centro.y / 16) * mapa.largura + Math.floor(centro.x / 16)] === 4;

  const aceleracao = heroina.emAgua ? ACELERACAO * 0.62 : ACELERACAO;
  const velocidade = heroina.emAgua ? VELOCIDADE_ANDAR * 0.62 : VELOCIDADE_ANDAR;
  const gravidade = heroina.emAgua ? GRAVIDADE_AGUA : GRAVIDADE;

  let move = 0;
  if (input.esquerda) move -= 1;
  if (input.direita) move += 1;

  if (move !== 0) {
    heroina.olhando = move;
    heroina.vx += move * aceleracao * dt;
    heroina.vx = Math.max(-velocidade, Math.min(velocidade, heroina.vx));
    heroina.andando = true;
    heroina.animacao += dt;
  } else {
    const atrito = ATRITO * dt;
    if (Math.abs(heroina.vx) <= atrito) heroina.vx = 0;
    else heroina.vx -= Math.sign(heroina.vx) * atrito;
  }

  if (!heroina.noChao) {
    heroina.vy += gravidade * dt;
  }

  if (input.cima && heroina.energia > 0) {
    const aceleracaoSubida = heroina.emAgua ? PROPULSOR_AGUA : ACELERACAO_PROPULSOR;
    const limiteSubida = heroina.emAgua ? SUBIDA_AGUA_MAX : SUBIDA_MAX;
    heroina.vy -= aceleracaoSubida * dt;
    heroina.vy = Math.max(-limiteSubida, heroina.vy);
    heroina.energia = Math.max(0, heroina.energia - CONSUMO_PROPULSOR * dt);
    heroina.propulsor = true;
  }

  if (input.baixo) {
    heroina.vy += (heroina.emAgua ? 180 : 380) * dt;
    heroina.vy = Math.min(MERGULHO_MAX, heroina.vy);
  }

  heroina.vy = Math.min(QUEDA_MAX, heroina.vy);
  if (heroina.noChao && !heroina.emAgua) {
    heroina.energia = Math.max(0, heroina.energia - CONSUMO_CHAO * dt);
  }

  const colidiuX = moverHorizontal(mapa, heroina, heroina.vx * dt);
  if (colidiuX) heroina.vx = 0;

  const resultadoY = moverVertical(mapa, heroina, heroina.vy * dt);
  heroina.noChao = resultadoY.noChao;

  if (resultadoY.noChao || resultadoY.noTeto) {
    heroina.vy = 0;
  }

  if (heroina.x < 0) heroina.x = 0;
  if (heroina.x + heroina.largura > MUNDO_LARGURA) heroina.x = MUNDO_LARGURA - heroina.largura;
  const topoJogavel = TOPO_CEU * TILE;
  if (heroina.y < topoJogavel) {
    heroina.y = topoJogavel;
    heroina.vy = Math.max(0, heroina.vy);
  }
  if (heroina.y + heroina.altura > MUNDO_ALTURA) {
    heroina.y = MUNDO_ALTURA - heroina.altura;
    heroina.vy = 0;
    heroina.noChao = true;
  }
  if (heroina.x < 0 || heroina.x > LARGURA * 100) heroina.x = Math.max(0, heroina.x);
  if (heroina.y < 0 || heroina.y > ALTURA * 100) heroina.y = Math.max(0, heroina.y);

  return {
    morreu: false,
    semEnergia: heroina.energia <= 0,
    propulsor: heroina.propulsor,
    andando: heroina.andando,
    emAgua: heroina.emAgua,
  };
}

export function reiniciarHeroina(heroina: Heroina, inicio: Ponto): void {
  heroina.x = inicio.x;
  heroina.y = inicio.y;
  heroina.vx = 0;
  heroina.vy = 0;
  heroina.olhando = 1;
  heroina.noChao = false;
  heroina.energia = ENERGY_MAX;
  heroina.calor = 0;
  heroina.travado = false;
  heroina.tempoTrava = 0;
  heroina.invulneravel = INVULNERAVEL_TEMPO;
  heroina.emAgua = false;
  heroina.propulsor = false;
  heroina.andando = false;
  heroina.animacao = 0;
}
