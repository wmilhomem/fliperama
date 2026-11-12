/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ALTURA, LARGURA, Y_NAVE } from './constantes';
import { RNG, TAU } from './semente';
import { limitarXNaSecao, telaY } from './rio';
import { DisparoInimigo, Inimigo, Nave, SecaoRio, TipoInimigo } from './tipos';

interface ConfigInimigo {
  hp: number;
  pontos: number;
  raio: number;
  vd: number;
  intervaloTiro: number;
}

export const CONFIG_INIMIGOS: Record<TipoInimigo, ConfigInimigo> = {
  lancha: { hp: 1, pontos: 30, raio: 8, vd: 22, intervaloTiro: 0 },
  patrulha: { hp: 2, pontos: 60, raio: 9, vd: 12, intervaloTiro: 2.3 },
  helicoptero: { hp: 2, pontos: 100, raio: 9, vd: 18, intervaloTiro: 2.1 },
  drone: { hp: 1, pontos: 120, raio: 7, vd: 30, intervaloTiro: 0 },
  garca: { hp: 1, pontos: 20, raio: 7, vd: 7, intervaloTiro: 0 },
};

export function criarInimigo(
  tipo: TipoInimigo,
  x: number,
  d: number,
  id: number,
  rng: RNG
): Inimigo {
  const config = CONFIG_INIMIGOS[tipo];
  const fase = rng() * TAU;

  let vx = 0;

  if (tipo === 'garca') {
    vx = x < LARGURA / 2 ? 62 + rng() * 24 : -(62 + rng() * 24);
  }

  return {
    id,
    tipo,
    x,
    d,
    y: telaY(d, 0),
    raio: config.raio,
    hp: config.hp,
    pontos: config.pontos,
    vd: config.vd,
    vx,
    baseX: x,
    amplitude: tipo === 'helicoptero' ? 34 : tipo === 'patrulha' ? 14 : 0,
    fase,
    timerTiro: config.intervaloTiro * (0.55 + rng() * 0.55),
    intervaloTiro: config.intervaloTiro,
  };
}

export function atualizarInimigo(
  inimigo: Inimigo,
  dt: number,
  progresso: number,
  nave: Nave,
  secao: SecaoRio
): DisparoInimigo | null {
  inimigo.fase += dt;
  inimigo.d -= inimigo.vd * dt;

  switch (inimigo.tipo) {
    case 'lancha':
      inimigo.x += Math.sin(inimigo.fase * 1.8) * 4 * dt;
      inimigo.x = limitarXNaSecao(secao, inimigo.d, inimigo.x, inimigo.raio + 1);
      break;

    case 'patrulha':
      inimigo.x = inimigo.baseX + Math.sin(inimigo.fase * 1.15) * inimigo.amplitude;
      inimigo.x = limitarXNaSecao(secao, inimigo.d, inimigo.x, inimigo.raio + 1);
      break;

    case 'helicoptero':
      inimigo.x = inimigo.baseX + Math.sin(inimigo.fase * 0.85) * inimigo.amplitude;
      break;

    case 'drone': {
      const diferenca = nave.x - inimigo.x;
      const direcao = Math.sign(diferenca);
      inimigo.x += direcao * Math.min(Math.abs(diferenca), 54 * dt);
      break;
    }

    case 'garca':
      inimigo.x += inimigo.vx * dt;
      break;
  }

  inimigo.y = telaY(inimigo.d, progresso);

  if (inimigo.intervaloTiro <= 0) return null;

  inimigo.timerTiro -= dt;

  if (
    inimigo.timerTiro > 0 ||
    inimigo.y < 4 ||
    inimigo.y > Y_NAVE - 46 ||
    inimigo.x < -12 ||
    inimigo.x > LARGURA + 12
  ) {
    return null;
  }

  inimigo.timerTiro = inimigo.intervaloTiro * (0.8 + Math.random() * 0.45);

  const angulo = Math.atan2(nave.y - inimigo.y, nave.x - inimigo.x);

  return {
    x: inimigo.x,
    y: inimigo.y + 5,
    angulo,
    velocidade: 96 + Math.min(44, inimigo.timerTiro * 5),
  };
}

export function inimigoForaDaTela(inimigo: Inimigo): boolean {
  return (
    inimigo.y > ALTURA + 55 ||
    inimigo.x < -42 ||
    inimigo.x > LARGURA + 42 ||
    inimigo.d < -260
  );
}

export function escolherTipoInimigo(secao: number, rng: RNG): TipoInimigo {
  const opcoes: Array<{ tipo: TipoInimigo; peso: number }> = [
    { tipo: 'lancha', peso: 4 },
    { tipo: 'garca', peso: 3 },
  ];

  if (secao >= 2) opcoes.push({ tipo: 'patrulha', peso: 3 });
  if (secao >= 3) opcoes.push({ tipo: 'helicoptero', peso: 2.5 });
  if (secao >= 4) opcoes.push({ tipo: 'drone', peso: 2 });

  const total = opcoes.reduce((soma, opcao) => soma + opcao.peso, 0);
  let sorteio = rng() * total;

  for (const opcao of opcoes) {
    if (sorteio <= opcao.peso) return opcao.tipo;
    sorteio -= opcao.peso;
  }

  return 'lancha';
}

export function intervaloInimigo(secao: number): number {
  const base = Math.max(0.62, 1.85 - secao * 0.1);
  return base * (0.72 + Math.random() * 0.58);
}
