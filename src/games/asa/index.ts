/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * ASA RASANTE â€” Campanha de 5 missÃµes pelo Brasil
 * Stage 1: helicÃ³ptero, controles, armadura, balas e mÃ­sseis,
 *          HUD novo, decolagem e MissÃ£o 1 (Litoral) atÃ© o aviÃ£o-tanque.
 * Stage 2: duelo com o CorsÃ¡rio (3 etapas), pouso, recepÃ§Ã£o e resumo.
 *
 * ParÃ¢metros de depuraÃ§Ã£o: ?missao=N, ?cicloAtual=N e ?chefe=1 (abre direto no duelo).
 */

import { EngineContext, GameInstance, GameModule, InputState } from '../../engine/types';
import { lerControles } from '../../shared/controles';
import {
  BALA_INIMIGA_VEL,
  HELI_LINHA_Y,
  HELI_VEL_X,
  LARGURA,
  ALTURA,
  MAX_DRONES_TELA,
  MISSIL_COOLDOWN,
  PONTOS_BATERIA,
  PONTOS_CHEFÃO_VALOR,
  PONTOS_DRONE,
  PONTOS_MISSIL_DERRUBADO,
  PONTOS_RECARGA as PONTOS_TANQUE,
  PONTOS_VIDA_EXTRA,
  CHEFE_VIDA,
  CHEFE_VIDA_POR_CICLO,
  VIDAS_INICIAIS,
  VIDAS_MAX,
  PERCURSO_SEG,
  ROLAGEM_ACELERAR,
  ROLAGEM_FREAR,
  ROLAGEM_MAX,
  ROLAGEM_MIN,
  ROLAGEM_PADRAO,
  ROLAGEM_RETORNO,
} from './config';
import {
  criarHelicoptero,
  desenharHelicoptero,
  desenharSombra,
} from './helicoptero';
import { criarCenaDecolagem } from './cenas/decolagem';
import { criarCenaPouso } from './cenas/pouso';
import {
  criarChefe,
  atualizarChefe,
  decidirDisparoChefe,
  desenharChefe,
  desenharBarraChefe,
  Chefe,
} from './chefao';
import {
  atualizarTanque,
  criarEstadoCombustivel,
  criarTanque,
  desenharIndicadorTanque,
  desenharTanque,
  atualizarCombustivel,
} from './combustivel';
import { criarEstadoArmas, tentarAtirar, tentarLancarMissil, tickArmas } from './armas';
import {
  aplicarDano,
  criarArmadura,
  tickArmadura,
  danoBalaInimiga,
  danoMissilInimigo,
  danoObstaculo,
} from './armadura';
import {
  desenharChaoLitoral,
  desenharChaoSerra,
  desenharChaoSertao,
  desenharChaoCidade,
  desenharChaoFloresta,
  gerarPercurso,
} from './percurso';
import { TipoBioma } from './config';
import {
  criarEstadoClima,
  atualizarClima,
  desenharCeu,
  desenharChuva,
  desenharNeblina,
  desenharTempestadeAreia,
  desenharRaio,
  EstadoClima,
} from './clima';
import { criarDrone, atualizarDrone, desenharDrone } from './inimigos/drone';
import { criarBateria, atualizarBateria, desenharBateria } from './inimigos/bateria';
import { criarEnxame, atualizarEnxame, desenharEnxame, Enxame } from './inimigos/enxame';
import {
  atualizarMissilInimigo,
  criarMissilInimigo,
  desenharMissilInimigo,
} from './inimigos/missilInimigo';
import {
  atualizarParticulas,
  atualizarTextos,
  criarExplosao,
  criarTexto,
  desenharParticulas,
  desenharTextos,
} from './particulas';
import {
  atualizarVento,
  criarEstadoVento,
  empuxoVento,
} from './vento';
import {
  desenharHUDJogo,
  desenharFicha,
  desenharHUDDuelo,
} from './hud';
import {
  EstadoJogo,
  DronePatrulha,
  BateriaAntiaerea,
  Particula,
  TiroJogador,
  MissilJogador,
  TextoFlutuante,
  MissilInimigo,
} from './tipos';
import { obterMissao } from './missoes';
import { criarAleatorio } from './util';

export const asaGameModule: GameModule = {
  id: 'asa',
  titulo: 'Asa Rasante',
  descricao: 'Campanha de missÃµes pelo Brasil pilotando o helicÃ³ptero de Asa.',
  genero: 'Campanha de missÃµes',
  corTema: '#F97316',
  largura: LARGURA,
  altura: ALTURA,
  instrucoes: {
    historia:
      'Lia "Asa" Duarte comanda um helicÃ³ptero de ataque e atravessa o Brasil em missÃµes perigosas: do mar Ã s dunas, das cidades Ã  floresta, sempre com o objetivo de conter as forÃ§as inimigas.',
    controles: [
      'Setas Esquerda/Direita ou A/D: manobrar o helicÃ³ptero',
      'Cima: acelera (mundo desce mais rÃ¡pido) Â· Baixo: freia',
      'EspaÃ§o / BotÃ£o A: metralhadora (6 tiros por segundo)',
      'X / BotÃ£o B: mÃ­ssil (estoque limitado por missÃ£o)',
      'P: pausa Â· R: reiniciar Â· M: som Â· ESC: hub',
    ],
    pontos: [
      { acao: 'Drone de patrulha', pontos: PONTOS_DRONE },
      { acao: 'Bateria antiaÃ©rea', pontos: PONTOS_BATERIA },
      { acao: 'MÃ­ssil inimigo derrubado', pontos: PONTOS_MISSIL_DERRUBADO },
      { acao: 'Reabastecimento concluÃ­do', pontos: PONTOS_TANQUE },
      { acao: 'Chefe derrotado', pontos: PONTOS_CHEFÃO_VALOR },
    ],
  },

  criar(ctx: EngineContext): GameInstance {
    // ===== Parâmetros de depuração via URL =====
    const params = new URLSearchParams(window.location.search);
    const missaoNumero = Math.max(1, Math.min(5, parseInt(params.get('missao') ?? '1', 10) || 1));
    const cicloInicial = Math.max(1, parseInt(params.get('ciclo') ?? '1', 10) || 1);
    const irParaChefe = params.get('chefe') === '1';
    const vidaChefeDebug = Math.max(0, parseInt(params.get('vidaChefe') ?? '0', 10) || 0);

    // ===== Estado mutável da campanha =====
    const biomaPorMissao: Record<number, TipoBioma> = {
      1: 'litoral',
      2: 'serra',
      3: 'sertaao',
      4: 'cidade',
      5: 'floresta',
    };
    let missaoAtual = missaoNumero;
    let cicloAtual = cicloInicial;
    let missao = obterMissao(missaoAtual);
    let bioma: TipoBioma = biomaPorMissao[missaoAtual] ?? 'litoral';
    let hora = missao.hora;
    let climaTipo = missao.climaTipo;
    let comprimento = 96 * PERCURSO_SEG[Math.min(missaoAtual - 1, PERCURSO_SEG.length - 1)];
    let percurso = gerarPercurso(`asa-missao-${missaoAtual}-ciclo-${cicloAtual}`, bioma, comprimento);

    let estado: EstadoJogo = 'ficha';
    let tempo = 0;
    let tempoEstado = 0;
    let vidas = VIDAS_INICIAIS;
    let proximaVidaExtra = PONTOS_VIDA_EXTRA;

    // ===== Mundo =====
    let cameraY = 0;
    let velocidadeRolagem = ROLAGEM_PADRAO;

    // ===== Jogador e sistemas =====
    let heli = criarHelicoptero();
    let armadura = criarArmadura();
    let armas = criarEstadoArmas(missaoAtual, cicloAtual);
    let combustivelEstado = criarEstadoCombustivel(missaoAtual, cicloAtual, armas.misseis);
    let tanque = criarTanque(14);
    let vento = criarEstadoVento(bioma);
    let climaEstado = criarEstadoClima(climaTipo);

    let tirosJogador: TiroJogador[] = [];
    let misseisJogador: MissilJogador[] = [];
    let projetisInimigos: { x: number; y: number; vx: number; vy: number }[] = [];
    let misseisInimigos: MissilInimigo[] = [];
    let drones: DronePatrulha[] = [];
    let enxames: Enxame[] = [];
    let baterias: BateriaAntiaerea[] = [];
    let particulas: Particula[] = [];
    let textos: TextoFlutuante[] = [];

    let timerDrone = 1.6;
    let timerBateria = 3.0;
    let timerMissilInimigo = 4.0;
    let temporizadorAvisoMs = 0;
    let temporizadorAlertaTanque = 0;

    // Cenas e chefÃ£o
    let cenaDecolagem: ReturnType<typeof criarCenaDecolagem> | null = null;
    let cenaPouso: ReturnType<typeof criarCenaPouso> | null = null;
    let chefe: Chefe | null = null;
    /** Vida do chefÃ£o no instante em que a etapa comeÃ§ou (para respawn). */
    let vidaChefeInicioEtapa = 0;

    // EstatÃ­sticas para o resumo
    let alvosDestruidos = 0;
    let misseisDerrubados = 0;
    let tempoMissaoInicio = 0;
    let bonusCalculado = false;
    let bonusResumo = 0;

    function carregarMissao(m: number, c: number) {
      missaoAtual = Math.max(1, Math.min(5, Math.floor(m)));
      cicloAtual = Math.max(1, Math.floor(c));
      missao = obterMissao(missaoAtual);
      bioma = biomaPorMissao[missaoAtual] ?? 'litoral';
      hora = missao.hora;
      climaTipo = missao.climaTipo;
      comprimento = 96 * PERCURSO_SEG[Math.min(missaoAtual - 1, PERCURSO_SEG.length - 1)];
      percurso = gerarPercurso(`asa-missao-${missaoAtual}-ciclo-${cicloAtual}`, bioma, comprimento);
    }

    function novaPartida(m: number = missaoAtual, c: number = cicloAtual) {
      carregarMissao(m, c);
      estado = 'ficha';
      tempo = 0;
      tempoEstado = 0;
      vidas = VIDAS_INICIAIS;
      proximaVidaExtra = PONTOS_VIDA_EXTRA;
      cameraY = 0;
      velocidadeRolagem = ROLAGEM_PADRAO;

      heli = criarHelicoptero();
      heli.invulneravel = 0;
      armadura = criarArmadura();
      armas = criarEstadoArmas(missaoAtual, cicloAtual);
      combustivelEstado = criarEstadoCombustivel(missaoAtual, cicloAtual, armas.misseis);
      tanque = criarTanque(14);
      vento = criarEstadoVento(bioma);
      climaEstado = criarEstadoClima(climaTipo);

      tirosJogador = [];
      misseisJogador = [];
      projetisInimigos = [];
      misseisInimigos = [];
      drones = [];
      enxames = [];
      baterias = [];
      particulas = [];
      textos = [];

      timerDrone = 1.6;
      timerBateria = 3.0;
      timerMissilInimigo = 4.0;
      temporizadorAlertaTanque = 0;
      temporizadorAvisoMs = 0;
      alvosDestruidos = 0;
      misseisDerrubados = 0;
      bonusCalculado = false;
      bonusResumo = 0;

      chefe = null;
      vidaChefeInicioEtapa = 0;

      if (irParaChefe) {
        iniciarDuelo();
        return;
      }

      ctx.hud.definirEstado({
        pontuacao: 0,
        recorde: ctx.storage.lerRecorde(ctx.id),
        vidas,
        fase: missaoAtual,
        vidasMax: VIDAS_MAX,
        bonus: 0,
      });
    }

    function iniciarDuelo() {
      estado = 'duelo';
      tempoEstado = 0;
      cameraY = comprimento;
      velocidadeRolagem = 0;
      heli = criarHelicoptero(LARGURA / 2, HELI_LINHA_Y);
      heli.invulneravel = 0;
      armadura = criarArmadura();
      armas = criarEstadoArmas(missaoAtual, cicloAtual);
      combustivelEstado = criarEstadoCombustivel(missaoAtual, cicloAtual, armas.misseis);
      const vidaChefeBase = CHEFE_VIDA[Math.min(missaoAtual - 1, CHEFE_VIDA.length - 1)] + (cicloAtual - 1) * CHEFE_VIDA_POR_CICLO;
      chefe = criarChefe(missao.chefaoTipo, vidaChefeDebug > 0 ? vidaChefeDebug : vidaChefeBase);
      vidaChefeInicioEtapa = chefe.vida;
      tirosJogador = [];
      misseisJogador = [];
      projetisInimigos = [];
      misseisInimigos = [];
      drones = [];
      enxames = [];
      baterias = [];
      vento = criarEstadoVento('serra'); // mais quieto durante o duelo
      tempoMissaoInicio = tempo;
    }

    function concederPontos(valor: number, x?: number, y?: number, cor = '#FDE047') {
      const pontos = Math.floor(valor);
      if (pontos <= 0) return;
      ctx.hud.adicionarPontos(pontos, x, y, cor);
      const pontuacao = ctx.hud.obterEstado().pontuacao;
      if (pontuacao >= proximaVidaExtra && vidas < VIDAS_MAX) {
        proximaVidaExtra += PONTOS_VIDA_EXTRA;
        vidas = Math.min(VIDAS_MAX, vidas + 1);
        ctx.hud.definirEstado({ vidas, vidasMax: VIDAS_MAX });
        ctx.audio.tocar('bolaExtra');
        if (x !== undefined && y !== undefined) {
          criarTexto(textos, x, y - 20, '+1 VIDA', '#4ADE80');
        }
      }
    }

    function perderVida() {
      vidas = ctx.hud.perderVida();
      ctx.audio.tocar('vidaPerdida');
      if (vidas <= 0) {
        estado = 'gameOver';
        tempoEstado = 0;
        ctx.finalizarJogo('gameOver');
        return;
      }
      if (estado === 'duelo') {
        // Volta no inÃ­cio da etapa, com o chefe no valor do comeÃ§o da etapa
        heli = criarHelicoptero(LARGURA / 2, HELI_LINHA_Y);
        heli.invulneravel = 2;
        armadura = criarArmadura();
        if (chefe) {
          chefe.vida = vidaChefeInicioEtapa;
        }
        tirosJogador = [];
        misseisJogador = [];
        projeteisInimigosReset();
        return;
      }
      // Respawn no inÃ­cio do percurso
      cameraY = 0;
      heli = criarHelicoptero();
      heli.invulneravel = 2;
      armadura = criarArmadura();
      armas = criarEstadoArmas(missaoAtual, cicloAtual);
      combustivelEstado = criarEstadoCombustivel(missaoAtual, cicloAtual, armas.misseis);
      tirosJogador = [];
      misseisJogador = [];
      projeteisInimigosReset();
      temporizadorAlertaTanque = 0;
      ctx.hud.definirEstado({ vidas, fase: missaoAtual });
    }

    function projeteisInimigosReset() {
      projetisInimigos = [];
      misseisInimigos = [];
      drones = [];
      enxames = [];
      baterias = [];
    }

    function danoAoHelicoptero(dano: number) {
      const resultado = aplicarDano(armadura, dano);
      if (!resultado.destruido) {
        if (!resultado.invulneravel) {
          ctx.audio.tocar('batida');
        }
        return;
      }
      criarExplosao(particulas, heli.x, heli.y, '#FB923C', 30);
      criarExplosao(particulas, heli.x, heli.y, '#FDE047', 16);
      ctx.audio.tocar('explosaoNave');
      perderVida();
    }

    function destruirAlvosEmExplosao(x: number, y: number) {
      for (const e of enxames) {
        for (const m of e.membros) {
          if (m.vida > 0 && Math.hypot(m.x - x, m.y - y) < 26) {
            m.vida = 0;
            concederPontos(80, m.x, m.y, '#A78BFA');
            alvosDestruidos++;
            criarExplosao(particulas, m.x, m.y, '#A78BFA', 10);
          }
        }
      }
      for (let i = drones.length - 1; i >= 0; i--) {
        const d = drones[i];
        if (Math.hypot(d.x - x, d.y - y) < 26) {
          concederPontos(PONTOS_DRONE, d.x, d.y, '#22D3EE');
          alvosDestruidos++;
          criarExplosao(particulas, d.x, d.y, '#22D3EE', 12);
          drones.splice(i, 1);
        }
      }
      for (let i = baterias.length - 1; i >= 0; i--) {
        const b = baterias[i];
        if (Math.hypot(b.x - x, b.y - y) < 26) {
          b.vida -= 8;
          b.flash = 1;
          if (b.vida <= 0) {
            concederPontos(PONTOS_BATERIA, b.x, b.y, '#FB923C');
            alvosDestruidos++;
            criarExplosao(particulas, b.x, b.y, '#FB923C', 22);
            baterias.splice(i, 1);
          }
        }
      }
    }

    function explodirMissilJogador(x: number, y: number) {
      criarExplosao(particulas, x, y, '#FB923C', 18);
      criarExplosao(particulas, x, y, '#FDE047', 9);
      ctx.audio.tocar('explosao');
      destruirAlvosEmExplosao(x, y);
    }

    function spawnDrone(rng: () => number) {
      if (drones.length >= MAX_DRONES_TELA) return;
      const daEsquerda = rng() < 0.5;
      const x = daEsquerda ? -30 : LARGURA + 30;
      const y = 90 + rng() * 220;
      const velocidade = 96 + cicloAtual * 14 + rng() * 40;
      drones.push(criarDrone(x, y, daEsquerda ? 1 : -1, velocidade));
    }

    function spawnEnxame(rng: () => number) {
      if (enxames.length >= (bioma === 'cidade' ? 3 : 2)) return;
      const daEsquerda = rng() < 0.5;
      const x = daEsquerda ? -60 : LARGURA + 60;
      const y = 90 + rng() * 180;
      enxames.push(criarEnxame(x, y, daEsquerda ? 1 : -1));
    }

    function spawnBateria(rng: () => number) {
      const x = 60 + rng() * (LARGURA - 120);
      const y = 150 + rng() * 180;
      baterias.push(criarBateria(x, y));
    }

    function atualizarDisparosInimigos(dt: number) {
      for (const b of baterias) {
        if (b.timer <= 0) {
          b.timer = 2.1 + Math.random() * 1.2;
          for (let k = 0; k < 2; k++) {
            const dx = heli.x - b.x;
            const dy = heli.y - b.y;
            const dist = Math.hypot(dx, dy) || 1;
            projetisInimigos.push({
              x: b.x,
              y: b.y - 12,
              vx: (dx / dist) * BALA_INIMIGA_VEL * 0.55 + (Math.random() - 0.5) * 40,
              vy: (dy / dist) * BALA_INIMIGA_VEL,
            });
          }
          ctx.audio.tocar('tiro');
        }
      }

      for (let i = misseisInimigos.length - 1; i >= 0; i--) {
        const m = misseisInimigos[i];
        atualizarMissilInimigo(m, heli.x, heli.y, dt);
        if (m.vida <= 0 || m.y > ALTURA + 30 || m.y < -40 || m.x < -30 || m.x > LARGURA + 30) {
          criarExplosao(particulas, m.x, m.y, '#94A3B8', 8);
          misseisInimigos.splice(i, 1);
        }
      }
    }

    function spawnMissilInimigo() {
      if (baterias.length === 0) return;
      if (misseisInimigos.length >= 3) return;
      const b = baterias[Math.floor(Math.random() * baterias.length)];
      const dx = heli.x - b.x;
      const dy = heli.y - b.y;
      const dist = Math.hypot(dx, dy) || 1;
      misseisInimigos.push(criarMissilInimigo(b.x + (dx / dist) * 12, b.y - 12, dx, dy));
      ctx.audio.tocar('alarme');
      temporizadorAvisoMs = 1.2;
    }

    novaPartida();

    return {
      iniciar() {
        novaPartida();
      },

      reiniciar() {
        novaPartida();
      },

      pausar() {},
      retomar() {},

      atualizar(dt: number, input: InputState) {
        tempo += dt;
        tempoEstado += dt;

        if (estado === 'ficha') {
          if (input.acaoPressionada || tempo >= 2) {
            cenaDecolagem = criarCenaDecolagem(4.2);
            estado = 'decolagem';
            tempoEstado = 0;
            ctx.audio.tocar('alerta');
          }
          return;
        }

        if (estado === 'decolagem') {
          if (cenaDecolagem && (cenaDecolagem.atualizar(dt) || input.acaoPressionada)) {
            estado = 'percurso';
            tempoEstado = 0;
            cameraY = 0;
            velocidadeRolagem = ROLAGEM_PADRAO;
            tempoMissaoInicio = tempo;
          }
          return;
        }

        if (estado === 'percurso') {
          const dtSeguro = Math.min(dt, 0.05);

          tickArmadura(armadura, dtSeguro);
          heli.invulneravel = Math.max(0, heli.invulneravel - dtSeguro);

          // Movimento horizontal
          const sens = lerControles().sensibilidade;
          let move = 0;
          if (input.arrastando && input.arrasteDX !== 0) {
            const delta = input.arrasteDX * sens;
            const maxDelta = HELI_VEL_X * dtSeguro * 2;
            heli.x += Math.max(-maxDelta, Math.min(maxDelta, delta));
            move = Math.max(-1, Math.min(1, input.arrasteDX * 0.02));
          } else {
            if (input.esquerda) move -= 1;
            if (input.direita) move += 1;
            const ventoEmpurra = empuxoVento(vento);
            heli.x += (move * HELI_VEL_X + ventoEmpurra) * dtSeguro;
          }
          heli.x = Math.max(16, Math.min(LARGURA - 16, heli.x));
          heli.inclinacao += ((move * 0.42) - heli.inclinacao) * Math.min(1, dtSeguro * 8);
          heli.rotor = (heli.rotor + dtSeguro * 16) % 2;

          // Colisão com obstáculos sólidos (serra/cidade: paredões/prédios; sertão: cactos/casebres; floresta: copas)
          if ((bioma === 'serra' || bioma === 'cidade') && armadura.invulneravel <= 0) {
            for (const canyon of percurso.canyons) {
              const yTela = canyon.y - cameraY;
              if (yTela < -30 || yTela > ALTURA + 30) continue;
              const leftWall = canyon.gapX - canyon.gap / 2;
              const rightWall = canyon.gapX + canyon.gap / 2;
              const heliDentroDoBanda = heli.y > yTela - 26 && heli.y < yTela + 26;
              if (heliDentroDoBanda && (heli.x < leftWall || heli.x > rightWall)) {
                danoAoHelicoptero(danoObstaculo());
                heli.x = heli.x < leftWall ? leftWall - 6 : rightWall + 6;
                heli.x = Math.max(16, Math.min(LARGURA - 16, heli.x));
                break;
              }
            }
            // Prédios na cidade (sólidos)
            if (bioma === 'cidade') {
              for (const f of percurso.features) {
                if (f.tipo !== 'predio') continue;
                const yTela = f.y - cameraY;
                if (Math.abs(yTela - heli.y) < 18 && Math.abs(f.x - heli.x) < 13) {
                  danoAoHelicoptero(danoObstaculo());
                  heli.x = f.x < heli.x ? heli.x + 22 : heli.x - 22;
                  heli.x = Math.max(16, Math.min(LARGURA - 16, heli.x));
                  break;
                }
              }
            }
          }
          if (bioma === 'sertaao' && armadura.invulneravel <= 0) {
            for (const f of percurso.features) {
              if (f.tipo !== 'cacto' && f.tipo !== 'casebre') continue;
              const yTela = f.y - cameraY;
              if (Math.abs(yTela - heli.y) < 15 && Math.abs(f.x - heli.x) < 13) {
                danoAoHelicoptero(danoObstaculo());
                heli.x = f.x < heli.x ? heli.x + 22 : heli.x - 22;
                heli.x = Math.max(16, Math.min(LARGURA - 16, heli.x));
                break;
              }
            }
          }
          if (bioma === 'floresta' && armadura.invulneravel <= 0) {
            for (const f of percurso.features) {
              if (f.tipo !== 'copa') continue;
              const yTela = f.y - cameraY;
              if (Math.abs(yTela - heli.y) < 17 && Math.abs(f.x - heli.x) < 13) {
                danoAoHelicoptero(danoObstaculo());
                heli.x = f.x < heli.x ? heli.x + 18 : heli.x - 18;
                heli.x = Math.max(16, Math.min(LARGURA - 16, heli.x));
                break;
              }
            }
          }

          tickArmas(armas, dtSeguro, { valor: heli.cooldown }, { valor: heli.cooldownMissil });
          heli.cooldown = Math.max(0, heli.cooldown - dtSeguro);
          heli.cooldownMissil = Math.max(0, heli.cooldownMissil - dtSeguro);

          if (input.cima) {
            velocidadeRolagem = Math.min(ROLAGEM_MAX, velocidadeRolagem + ROLAGEM_ACELERAR * dtSeguro);
          } else if (input.baixo) {
            velocidadeRolagem = Math.max(ROLAGEM_MIN, velocidadeRolagem - ROLAGEM_FREAR * dtSeguro);
          } else {
            velocidadeRolagem += (ROLAGEM_PADRAO - velocidadeRolagem) * Math.min(1, dtSeguro * 1.4);
          }

          cameraY = Math.min(cameraY + velocidadeRolagem * dtSeguro, comprimento);

          if (input.acao) {
            tentarAtirar(armas, tirosJogador, heli.x, heli.y, tempo, { valor: heli.cooldown });
            heli.cooldown = 0.17;
          }
          if (input.acao2Pressionada) {
            tentarLancarMissil(armas, misseisJogador, heli.x, heli.y, { valor: heli.cooldownMissil });
            heli.cooldownMissil = MISSIL_COOLDOWN;
            ctx.audio.tocar('torpedo');
          }

          for (let i = tirosJogador.length - 1; i >= 0; i--) {
            const b = tirosJogador[i];
            b.y += b.vy * dtSeguro;
            if (b.y < 48) tirosJogador.splice(i, 1);
          }
          for (let i = misseisJogador.length - 1; i >= 0; i--) {
            const m = misseisJogador[i];
            m.y += m.vy * dtSeguro;
            if (m.y < 48) {
              explodirMissilJogador(m.x, m.y);
              misseisJogador.splice(i, 1);
            }
          }

          atualizarVento(vento, dtSeguro, bioma);
          atualizarClima(climaEstado, dtSeguro);

          timerDrone -= dtSeguro;
          if (timerDrone <= 0) {
            spawnDrone(Math.random);
            timerDrone = Math.max(0.9, 2.4 - cicloAtual * 0.25) * (0.8 + Math.random() * 0.6);
          }
          timerBateria -= dtSeguro;
          if (timerBateria <= 0) {
            spawnBateria(Math.random);
            timerBateria = Math.max(1.6, 3.2 - cicloAtual * 0.2) * (0.8 + Math.random() * 0.7);
          }
          // Enxames nas cidades e florestas
          if ((bioma === 'cidade' || bioma === 'floresta') && Math.random() < 0.008 && enxames.length < 3) {
            spawnEnxame(Math.random);
          }
          timerMissilInimigo -= dtSeguro;
          if (timerMissilInimigo <= 0) {
            spawnMissilInimigo();
            timerMissilInimigo = 4.5 - Math.min(2.4, cicloAtual * 0.4) + Math.random() * 1.5;
          }

          for (const d of drones) atualizarDrone(d, dtSeguro);
          for (const b of baterias) atualizarBateria(b, dtSeguro);
          for (const e of enxames) atualizarEnxame(e, dtSeguro);
          atualizarDisparosInimigos(dtSeguro);

          // Remove enxames que saíram da tela
          for (let i = enxames.length - 1; i >= 0; i--) {
            const e = enxames[i];
            if (e.x < -80 || e.x > LARGURA + 80) enxames.splice(i, 1);
          }

          for (let i = drones.length - 1; i >= 0; i--) {
            const d = drones[i];
            if (d.x < -60 || d.x > LARGURA + 60 || d.y > ALTURA + 40) drones.splice(i, 1);
          }
          for (let i = baterias.length - 1; i >= 0; i--) {
            const b = baterias[i];
            if (b.y > ALTURA + 40) baterias.splice(i, 1);
          }

          if (atualizarCombustivel(combustivelEstado, dtSeguro, { cima: input.cima, baixo: input.baixo })) {
            criarExplosao(particulas, heli.x, heli.y, '#FB923C', 26);
            danoAoHelicoptero(99);
            return;
          }

          temporizadorAlertaTanque = Math.max(0, temporizadorAlertaTanque - dtSeguro);
          temporizadorAvisoMs = Math.max(0, temporizadorAvisoMs - dtSeguro);
          const resultadoTanque = atualizarTanque(
            tanque,
            combustivelEstado,
            { x: heli.x, y: heli.y, largura: 22, altura: 20 },
            dtSeguro,
            () => ctx.audio.tocar('alerta'),
            () => ctx.audio.tocar('recarga')
          );
          if (resultadoTanque === 'recarregou') {
            concederPontos(PONTOS_TANQUE, heli.x, heli.y - 20, '#FDE047');
          }

          // Tiros do jogador
          for (let i = tirosJogador.length - 1; i >= 0; i--) {
            const bala = tirosJogador[i];
            let acertouAlgo = false;
            if (!acertouAlgo) {
              // Balas contra drone do enxame
              for (const e of enxames) {
                for (const m of e.membros) {
                  if (m.vida > 0 && Math.abs(bala.x - m.x) < 9 && Math.abs(bala.y - m.y) < 8) {
                    m.vida -= 1;
                    m.flash = 1;
                    if (m.vida <= 0) {
                      concederPontos(80, m.x, m.y, '#A78BFA');
                      alvosDestruidos++;
                      criarExplosao(particulas, m.x, m.y, '#A78BFA', 10);
                    }
                    acertouAlgo = true;
                    break;
                  }
                }
                if (acertouAlgo) break;
              }
            }
            if (!acertouAlgo) {
              for (const d of drones) {
                if (Math.abs(bala.x - d.x) < 12 && Math.abs(bala.y - d.y) < 12) {
                  d.vida -= 1;
                  d.flash = 1;
                  if (d.vida <= 0) {
                    concederPontos(PONTOS_DRONE, d.x, d.y, '#22D3EE');
                    alvosDestruidos++;
                    criarExplosao(particulas, d.x, d.y, '#22D3EE', 12);
                    drones.splice(drones.indexOf(d), 1);
                  }
                  acertouAlgo = true;
                  break;
                }
              }
            }
            if (!acertouAlgo) {
              for (const b of baterias) {
                if (Math.abs(bala.x - b.x) < 12 && Math.abs(bala.y - b.y) < 12) {
                  b.vida -= 1;
                  b.flash = 1;
                  if (b.vida <= 0) {
                    concederPontos(PONTOS_BATERIA, b.x, b.y, '#FB923C');
                    alvosDestruidos++;
                    criarExplosao(particulas, b.x, b.y, '#FB923C', 20);
                    baterias.splice(baterias.indexOf(b), 1);
                  }
                  acertouAlgo = true;
                  break;
                }
              }
            }
            if (!acertouAlgo) {
              for (const m of misseisInimigos) {
                if (Math.hypot(bala.x - m.x, bala.y - m.y) < 10) {
                  concederPontos(PONTOS_MISSIL_DERRUBADO, m.x, m.y, '#FDE047');
                  misseisDerrubados++;
                  criarExplosao(particulas, m.x, m.y, '#FDE047', 12);
                  misseisInimigos.splice(misseisInimigos.indexOf(m), 1);
                  acertouAlgo = true;
                  break;
                }
              }
            }
            if (acertouAlgo) tirosJogador.splice(i, 1);
          }

          // MÃ­ssil do jogador explode no contato
          for (let i = misseisJogador.length - 1; i >= 0; i--) {
            const m = misseisJogador[i];
            let acertou = false;
            for (const d of drones) {
              if (Math.abs(m.x - d.x) < 14 && Math.abs(m.y - d.y) < 12) acertou = true;
            }
            for (const e of enxames) {
              for (const mm of e.membros) {
                if (mm.vida > 0 && Math.abs(m.x - mm.x) < 16 && Math.abs(m.y - mm.y) < 14) {
                  acertou = true;
                  break;
                }
              }
              if (acertou) break;
            }
            for (const b of baterias) {
              if (Math.abs(m.x - b.x) < 14 && Math.abs(m.y - b.y) < 12) acertou = true;
            }
            if (acertou) {
              explodirMissilJogador(m.x, m.y);
              misseisJogador.splice(i, 1);
            }
          }

          // MÃ­sseis inimigos/drones/balas contra o helicÃ³ptero
          const heliBox = { x: heli.x - 10, y: heli.y - 10, largura: 20, altura: 18 };
          for (let i = projetisInimigos.length - 1; i >= 0; i--) {
            const p = projetisInimigos[i];
            if (
              p.x > heliBox.x - 2 &&
              p.x < heliBox.x + heliBox.largura + 2 &&
              p.y > heliBox.y - 2 &&
              p.y < heliBox.y + heliBox.altura + 2
            ) {
              danoAoHelicoptero(danoBalaInimiga());
              projetisInimigos.splice(i, 1);
            } else if (p.y > ALTURA + 10 || p.x < -20 || p.x > LARGURA + 20) {
              projetisInimigos.splice(i, 1);
            }
          }
          for (let i = misseisInimigos.length - 1; i >= 0; i--) {
            const m = misseisInimigos[i];
            if (Math.hypot(m.x - heli.x, m.y - heli.y) < 16) {
              danoAoHelicoptero(danoMissilInimigo());
              criarExplosao(particulas, m.x, m.y, '#DC2626', 16);
              misseisInimigos.splice(i, 1);
            }
          }
          for (let i = drones.length - 1; i >= 0; i--) {
            const d = drones[i];
            if (Math.abs(d.x - heli.x) < 18 && Math.abs(d.y - heli.y) < 15) {
              danoAoHelicoptero(danoBalaInimiga());
              criarExplosao(particulas, d.x, d.y, '#22D3EE', 14);
              drones.splice(i, 1);
            }
          }
          for (const e of enxames) {
            for (const m of e.membros) {
              if (m.vida <= 0) continue;
              if (Math.abs(m.x - heli.x) < 12 && Math.abs(m.y - heli.y) < 10) {
                danoAoHelicoptero(danoBalaInimiga());
                criarExplosao(particulas, m.x, m.y, '#A78BFA', 10);
                m.vida = 0;
              }
            }
          }

          atualizarParticulas(particulas, dtSeguro);
          atualizarTextos(textos, dtSeguro);

          // Fim do trecho do percurso
          if (cameraY >= comprimento) {
            estado = 'preChefe';
            tempoEstado = 0;
            for (const d of drones) criarExplosao(particulas, d.x, d.y, '#22D3EE', 10);
            for (const b of baterias) criarExplosao(particulas, b.x, b.y, '#FB923C', 10);
            drones = [];
      enxames = [];
            baterias = [];
            misseisInimigos = [];
            projetisInimigos = [];
          }

          return;
        }

        if (estado === 'preChefe') {
          atualizarParticulas(particulas, dt);
          atualizarTextos(textos, dt);
          if (tempoEstado >= 2.2) {
            iniciarDuelo();
          }
          return;
        }

        if (estado === 'duelo') {
          const dtSeguro = Math.min(dt, 0.05);

          tickArmadura(armadura, dtSeguro);
          heli.invulneravel = Math.max(0, heli.invulneravel - dtSeguro);

          // Movimento: o helicÃ³ptero fica na metade de baixo
          const sens = lerControles().sensibilidade;
          let moveX = 0;
          let moveY = 0;
          if (input.arrastando) {
            const deltaX = input.arrasteDX * sens;
            const deltaY = input.arrasteDY * sens;
            const maxDelta = HELI_VEL_X * dtSeguro * 2;
            heli.x += Math.max(-maxDelta, Math.min(maxDelta, deltaX));
            heli.y += Math.max(-maxDelta, Math.min(maxDelta, deltaY));
            moveX = Math.max(-1, Math.min(1, deltaX * 0.02));
            moveY = Math.max(-1, Math.min(1, deltaY * 0.02));
          } else {
            if (input.esquerda) moveX -= 1;
            if (input.direita) moveX += 1;
            if (input.cima) moveY -= 1;
            if (input.baixo) moveY += 1;
            heli.x += moveX * HELI_VEL_X * dtSeguro;
            heli.y += moveY * HELI_VEL_X * 0.75 * dtSeguro;
          }
          heli.x = Math.max(16, Math.min(LARGURA - 16, heli.x));
          heli.y = Math.max(250, Math.min(ALTURA - 18, heli.y));
          heli.inclinacao += ((moveX * 0.42) - heli.inclinacao) * Math.min(1, dtSeguro * 8);
          heli.rotor = (heli.rotor + dtSeguro * 16) % 2;

          // Timers
          tickArmas(armas, dtSeguro, { valor: heli.cooldown }, { valor: heli.cooldownMissil });
          heli.cooldown = Math.max(0, heli.cooldown - dtSeguro);
          heli.cooldownMissil = Math.max(0, heli.cooldownMissil - dtSeguro);

          // Balas
          if (input.acao) {
            tentarAtirar(armas, tirosJogador, heli.x, heli.y, tempo, { valor: heli.cooldown });
            heli.cooldown = 0.17;
          }
          if (input.acao2Pressionada) {
            tentarLancarMissil(armas, misseisJogador, heli.x, heli.y, { valor: heli.cooldownMissil });
            heli.cooldownMissil = MISSIL_COOLDOWN;
            ctx.audio.tocar('torpedo');
          }

          for (let i = tirosJogador.length - 1; i >= 0; i--) {
            const b = tirosJogador[i];
            b.y += b.vy * dtSeguro;
            if (b.y < 48) tirosJogador.splice(i, 1);
          }
          for (let i = misseisJogador.length - 1; i >= 0; i--) {
            const m = misseisJogador[i];
            m.y += m.vy * dtSeguro;
            if (m.y < 48) {
              // Explode no teto, sem efeito em inimigos
              criarExplosao(particulas, m.x, m.y, '#FB923C', 8);
              misseisJogador.splice(i, 1);
            }
          }

          // ChefÃ£o
          if (chefe) {
            const mudou = atualizarChefe(chefe, heli.x, heli.y, dtSeguro);
            if (mudou === 'mudouEtapa') {
              ctx.audio.tocar('alarme');
              criarTexto(textos, LARGURA / 2, 120, chefe.etapa === 2 ? 'ETAPA 2' : 'ETAPA 3', '#EF4444');
              vidaChefeInicioEtapa = chefe.vida;
              // Chefes com vento fase: condor etapa 3 solta rajadas
              if (chefe.tipo === 'condor' && chefe.etapa === 3) {
                vento.ativo = true;
                vento.tempo = 1.4;
                vento.direcao = Math.random() < 0.5 ? 1 : -1;
                vento.forca = 150 + Math.random() * 40;
              }
            }
            // Condor etapa 3: rajadas aleatÃ³rias de vento
            if (chefe.tipo === 'condor' && chefe.etapa === 3 && Math.random() < 0.004) {
              vento.ativo = true;
              vento.tempo = 1.0;
              vento.direcao = Math.random() < 0.5 ? 1 : -1;
              vento.forca = 140 + Math.random() * 50;
            }
            const disparo = decidirDisparoChefe(chefe, heli.x, heli.y);
            if (disparo) {
              for (const b of disparo.balas) {
                projetisInimigos.push({ x: b.x, y: b.y, vx: b.vx, vy: b.vy });
              }
              for (const m of disparo.misseis) {
                misseisInimigos.push(criarMissilInimigo(m.x, m.y, m.vx, m.vy));
              }
              if (disparo.avisoTexto) {
                criarTexto(textos, LARGURA / 2, 96, disparo.avisoTexto, '#F472B6');
              }
              if (disparo.balas.length > 0 || disparo.misseis.length > 0) {
                ctx.audio.tocar('tiro');
              }
            }
          }

          // Tiros do jogador contra o chefÃ£o
          if (chefe) {
            for (let i = tirosJogador.length - 1; i >= 0; i--) {
              const bala = tirosJogador[i];
              if (Math.hypot(bala.x - chefe.x, bala.y - chefe.y) < 30) {
                chefe.vida -= 1;
                chefe.flash = 1;
                tirosJogador.splice(i, 1);
                if (chefe.vida <= 0) {
                  estado = 'explosaoChefe';
                  tempoEstado = 0;
                  concederPontos(PONTOS_CHEFÃO_VALOR, chefe.x, chefe.y, '#FDE047');
                  for (let k = 0; k < 3; k++) {
                    criarExplosao(particulas, chefe.x + (Math.random() - 0.5) * 60, chefe.y + (Math.random() - 0.5) * 40, '#F97316', 26);
                  }
                  ctx.audio.tocar('explosaoNave');
                }
              }
            }
            // MÃ­sseis do jogador contra o chefÃ£o
            for (let i = misseisJogador.length - 1; i >= 0; i--) {
              const m = misseisJogador[i];
              if (Math.hypot(m.x - chefe.x, m.y - chefe.y) < 32) {
                chefe.vida -= 8;
                chefe.flash = 1;
                criarExplosao(particulas, m.x, m.y, '#FB923C', 18);
                misseisJogador.splice(i, 1);
                ctx.audio.tocar('explosao');
                if (chefe.vida <= 0) {
                  estado = 'explosaoChefe';
                  tempoEstado = 0;
                  concederPontos(PONTOS_CHEFÃO_VALOR, chefe.x, chefe.y, '#FDE047');
                  for (let k = 0; k < 4; k++) {
                    criarExplosao(particulas, chefe.x + (Math.random() - 0.5) * 80, chefe.y + (Math.random() - 0.5) * 50, k % 2 === 0 ? '#F97316' : '#FDE047', 30);
                  }
                  ctx.audio.tocar('explosaoNave');
                }
              }
            }
          }

          // ProjÃ©teis do chefÃ£o
          const heliBox = { x: heli.x - 10, y: heli.y - 10, largura: 20, altura: 18 };
          for (let i = projetisInimigos.length - 1; i >= 0; i--) {
            const p = projetisInimigos[i];
            p.x += p.vx * dtSeguro;
            p.y += p.vy * dtSeguro;
            if (
              p.x > heliBox.x - 2 &&
              p.x < heliBox.x + heliBox.largura + 2 &&
              p.y > heliBox.y - 2 &&
              p.y < heliBox.y + heliBox.altura + 2
            ) {
              danoAoHelicoptero(danoBalaInimiga());
              projetisInimigos.splice(i, 1);
            } else if (p.y > ALTURA + 10 || p.x < -20 || p.x > LARGURA + 20 || p.y < 40) {
              projetisInimigos.splice(i, 1);
            }
          }
          for (let i = misseisInimigos.length - 1; i >= 0; i--) {
            const m = misseisInimigos[i];
            atualizarMissilInimigo(m, heli.x, heli.y, dtSeguro);
            if (Math.hypot(m.x - heli.x, m.y - heli.y) < 16) {
              danoAoHelicoptero(danoMissilInimigo());
              criarExplosao(particulas, m.x, m.y, '#DC2626', 16);
              misseisInimigos.splice(i, 1);
            } else if (m.vida <= 0) {
              misseisInimigos.splice(i, 1);
            }
          }

          atualizarParticulas(particulas, dtSeguro);
          atualizarTextos(textos, dtSeguro);
          return;
        }

        if (estado === 'explosaoChefe') {
          atualizarParticulas(particulas, dt);
          atualizarTextos(textos, dt);
          // Mais explosÃµes espalhadas
          if (Math.random() < 0.35 && chefe) {
            criarExplosao(
              particulas,
              chefe.x + (Math.random() - 0.5) * 110,
              chefe.y + (Math.random() - 0.5) * 60,
              Math.random() < 0.5 ? '#F97316' : '#FDE047',
              14
            );
          }
          if (tempoEstado >= 3) {
            estado = 'pouso';
            tempoEstado = 0;
            cenaPouso = criarCenaPouso(8);
          }
          return;
        }

        if (estado === 'pouso') {
          atualizarParticulas(particulas, dt);
          if (cenaPouso && (cenaPouso.atualizar(dt) || input.acaoPressionada)) {
            // Calcula bÃ´nus de resumo
            if (!bonusCalculado) {
              bonusCalculado = true;
              const bonusCombustivel = Math.floor(combustivelEstado.combustivel * 10);
              const bonusArmadura = armadura.pontos * 150;
              const bonusMisseis = armas.misseis * 60;
              bonusResumo = bonusCombustivel + bonusArmadura + bonusMisseis;
              if (bonusResumo > 0) {
                ctx.hud.adicionarPontos(bonusResumo);
              }
            }
            estado = 'resumo';
            tempoEstado = 0;
          }
          return;
        }

        if (estado === 'resumo') {
          atualizarParticulas(particulas, dt);
          atualizarTextos(textos, dt);
          if (input.acaoPressionada || tempoEstado >= 6) {
            if (missaoAtual >= 5) {
              estado = 'final';
              tempoEstado = 0;
              ctx.audio.tocar('especial');
            } else {
              // Avança para a próxima missão
              novaPartida(missaoAtual + 1, cicloAtual);
            }
          }
          return;
        }

        if (estado === 'final') {
          atualizarParticulas(particulas, dt);
          atualizarTextos(textos, dt);
          if (input.acaoPressionada || tempoEstado >= 9) {
            // Novo ciclo: missão 1, dificuldade aumentada
            novaPartida(1, cicloAtual + 1);
          }
          return;
        }
      },

      desenhar(g: CanvasRenderingContext2D) {
        if (estado === 'ficha') {
          desenharFicha(g, missaoAtual, missao.nome, missao.regiao, missao.hora, missao.clima, missao.descricao, tempo);
          return;
        }

        if (estado === 'decolagem' && cenaDecolagem) {
          cenaDecolagem.desenhar(g, tempo);
          return;
        }

        if (estado === 'pouso' && cenaPouso) {
          cenaPouso.desenhar(g, tempo);
          return;
        }

        // ===== Mundo =====
        if (estado === 'percurso') {
          desenharCeu(g, tempo, hora);
          if (bioma === 'serra') desenharChaoSerra(g, cameraY, percurso);
          else if (bioma === 'sertaao') desenharChaoSertao(g, cameraY, percurso);
          else if (bioma === 'cidade') desenharChaoCidade(g, cameraY, percurso);
          else if (bioma === 'floresta') desenharChaoFloresta(g, cameraY, percurso);
          else desenharChaoLitoral(g, cameraY, percurso.features);
          // Efeitos climáticos
          if (climaTipo === 'chuva') desenharChuva(g, tempo, bioma === 'cidade' ? 0.95 : 0.55);
          else if (climaTipo === 'neblina') desenharNeblina(g, heli.y, tempo);
          else if (climaTipo === 'tempestadeAreia') desenharTempestadeAreia(g, tempo);
          else if (climaTipo === 'tempestade') desenharRaio(g, climaEstado);
          // Overlay de noite (halo em torno do helicóptero)
          if (hora === 'noite' || hora === 'madrugada') {
            // Escurece o resto da tela e mantém um halo junto do helicóptero
            g.save();
            g.fillStyle = hora === 'noite' ? 'rgba(2, 6, 23, 0.25)' : 'rgba(0, 0, 20, 0.35)';
            g.fillRect(0, 0, LARGURA, ALTURA);
            // Halo em volta do helicóptero
            const grad = g.createRadialGradient(heli.x, heli.y, 20, heli.x, heli.y, 90);
            grad.addColorStop(0, 'rgba(254, 240, 138, 0.32)');
            grad.addColorStop(1, 'rgba(254, 240, 138, 0)');
            g.fillStyle = grad;
            g.fillRect(heli.x - 100, heli.y - 100, 200, 200);
            g.restore();
          }
        } else if (estado === 'preChefe' || estado === 'duelo' || estado === 'explosaoChefe' || estado === 'resumo' || estado === 'final') {
          // Arena estática: céu + chão congelado no fim do percurso
          desenharCeu(g, tempo, hora);
          if (bioma === 'serra') desenharChaoSerra(g, comprimento, percurso);
          else if (bioma === 'sertaao') desenharChaoSertao(g, comprimento, percurso);
          else if (bioma === 'cidade') desenharChaoCidade(g, comprimento, percurso);
          else if (bioma === 'floresta') desenharChaoFloresta(g, comprimento, percurso);
          else desenharChaoLitoral(g, comprimento, percurso.features);
          // Noite/madrugada também na arena
          if (hora === 'noite' || hora === 'madrugada') {
            g.fillStyle = 'rgba(2, 6, 23, 0.25)';
            g.fillRect(0, 0, LARGURA, ALTURA);
          }
        }

        // Sombra + helicÃ³ptero
        if (estado !== 'preChefe') {
          desenharSombra(g, heli.x, heli.y);
          desenharHelicoptero(g, heli, armadura.invulneravel > 0);
        }

        // Drones, enxames e baterias
        for (const d of drones) desenharDrone(g, d, tempo);
        for (const e of enxames) desenharEnxame(g, e, tempo);
        for (const b of baterias) desenharBateria(g, b, tempo);

        // MÃ­sseis inimigos
        for (const m of misseisInimigos) desenharMissilInimigo(g, m);

        // ProjÃ©teis inimigos
        g.fillStyle = '#FBBF24';
        for (const p of projetisInimigos) {
          g.fillRect(p.x - 2, p.y - 4, 4, 8);
        }

        // Tiros do jogador
        g.fillStyle = '#FDE047';
        for (const b of tirosJogador) {
          g.fillRect(b.x - 1.5, b.y - 8, 3, 9);
        }

        // MÃ­sseis do jogador
        for (const m of misseisJogador) {
          g.save();
          g.translate(m.x, m.y);
          g.fillStyle = '#991B1B';
          g.fillRect(-3, -10, 6, 12);
          g.fillStyle = '#FDE047';
          g.beginPath();
          g.moveTo(0, -14);
          g.lineTo(-3, -9);
          g.lineTo(3, -9);
          g.closePath();
          g.fill();
          g.restore();
        }

        // ChefÃ£o
        if (chefe && (estado === 'duelo' || estado === 'explosaoChefe')) {
          desenharChefe(g, chefe, tempo);
        }

        // Tanque (sÃ³ no percurso)
        if (estado === 'percurso') {
          desenharTanque(g, tanque, tempo);
          desenharIndicadorTanque(g, tanque, tempo);
        }

        // Marcador de mÃ­ssil inimigo chegando
        if (temporizadorAvisoMs > 0 && misseisInimigos.length > 0) {
          const m = misseisInimigos[0];
          const cx = Math.max(14, Math.min(LARGURA - 14, m.x));
          const cy = Math.max(60, Math.min(ALTURA - 14, m.y));
          const pisca = Math.floor(tempo * 8) % 2 === 0;
          if (pisca) {
            g.fillStyle = '#EF4444';
            g.beginPath();
            g.moveTo(cx, cy - 10);
            g.lineTo(cx - 9, cy + 10);
            g.lineTo(cx + 9, cy + 10);
            g.closePath();
            g.fill();
            g.fillStyle = '#FDE047';
            g.font = '7px "Press Start 2P", monospace';
            g.textAlign = 'center';
            g.fillText('!', cx, cy + 8);
          }
        }

        desenharParticulas(g, particulas);
        desenharTextos(g, textos);

        // Textos e banners por estado
        if (estado === 'preChefe') {
          g.fillStyle = 'rgba(3,7,18,0.55)';
          g.fillRect(0, 0, LARGURA, ALTURA);
          g.textAlign = 'center';
          g.font = '12px "Press Start 2P", monospace';
          g.fillStyle = '#EF4444';
          g.fillText('ÃREA DO CHEFE', LARGURA / 2, ALTURA / 2 - 20);
          g.font = '6px "Press Start 2P", monospace';
          g.fillStyle = '#FCA5A5';
          g.fillText(nomeChefe(missao.chefaoTipo), LARGURA / 2, ALTURA / 2 + 8);
        }

        if (estado === 'duelo' && chefe) {
          // Barra do chefÃ£o (logo abaixo do HUD do motor)
          desenharBarraChefe(g, chefe, nomeChefe(chefe.tipo), tempo);
          desenharHUDDuelo(g, ctx.hud, {
            misseis: armas.misseis,
            semMisseis: armas.misseis <= 0,
            armadura: armadura.pontos,
            tempo,
          });
        } else if (estado === 'final') {
          // ===== CENA FINAL =====
          // Fundo: céu da manhã com o sol nascendo
          const grad = g.createLinearGradient(0, 0, 0, ALTURA);
          grad.addColorStop(0, '#7DD3FC');
          grad.addColorStop(0.35, '#FB923C');
          grad.addColorStop(0.7, '#FDBA74');
          grad.addColorStop(1, '#FEF3C7');
          g.fillStyle = grad;
          g.fillRect(0, 0, LARGURA, ALTURA);

          // Sol nascente
          g.fillStyle = '#FEF9C3';
          g.beginPath();
          g.arc(LARGURA / 2, ALTURA * 0.48, 38, 0, Math.PI * 2);
          g.fill();
          g.globalAlpha = 0.3;
          g.beginPath();
          g.arc(LARGURA / 2, ALTURA * 0.48, 66, 0, Math.PI * 2);
          g.fill();
          g.globalAlpha = 1;

          // Explosões espalhadas (final triunfal)
          if (Math.random() < 0.4) {
            criarExplosao(
              particulas,
              Math.random() * LARGURA,
              ALTURA * 0.35 + Math.random() * 80,
              Math.random() < 0.5 ? '#FB923C' : '#FDE047',
              18
            );
          }
          desenharParticulas(g, particulas);

          // Texto principal
          g.textAlign = 'center';
          g.font = '26px "Press Start 2P", monospace';
          g.fillStyle = '#FDE047';
          g.fillText('VITÓRIA!', LARGURA / 2, 130);

          g.font = '8px "Press Start 2P", monospace';
          g.fillStyle = '#FB923C';
          g.fillText('O BRASIL ESTÁ SEGURO', LARGURA / 2, 172);

          // Créditos curtos
          g.font = '6px "Press Start 2P", monospace';
          g.fillStyle = '#1F2937';
          g.fillText('PILOTO: LIA "ASA" DUARTE', LARGURA / 2, 220);
          g.fillText('MOTOR GRÁFICO: FLIPERAMA ENGINE', LARGURA / 2, 236);
          g.fillText('MÚSICA E SFX: FLIPERAMA AUDIO', LARGURA / 2, 252);
          g.fillText('PRODUZIDO POR: FLIPERAMA ARCADE RETRÔ', LARGURA / 2, 272);

          // Ciclo atual
          g.font = '9px "Press Start 2P", monospace';
          g.fillStyle = '#F97316';
          g.fillText(`CICLO ${cicloAtual} CONCLUÍDO`, LARGURA / 2, 320);

          g.font = '7px "Press Start 2P", monospace';
          g.fillStyle = '#E2E8F0';
          g.globalAlpha = 0.55 + Math.sin(tempo * 4) * 0.3;
          g.fillText('NOVO CICLO — PRESSIONE AÇÃO / TOQUE', LARGURA / 2, ALTURA - 44);
          g.globalAlpha = 1;
          return;
        } else if (estado === 'resumo') {
          // Painel de resumo
          g.fillStyle = 'rgba(3,7,18,0.78)';
          g.fillRect(0, 0, LARGURA, ALTURA);
          g.textAlign = 'center';
          g.font = '13px "Press Start 2P", monospace';
          g.fillStyle = '#FDE047';
          g.fillText('MISSÃƒO CUMPRIDA', LARGURA / 2, 74);
          g.font = '8px "Press Start 2P", monospace';
          g.fillStyle = '#FDBA74';
          g.fillText(missao.nome, LARGURA / 2, 104);

          // EstatÃ­sticas
          const pontuacaoFinal = ctx.hud.obterEstado().pontuacao;
          const horaInicio = tempoMissaoInicio;
          const duracao = Math.max(0, tempo - horaInicio);
          const min = Math.floor(duracao / 60);
          const seg = Math.floor(duracao % 60);

          g.textAlign = 'left';
          g.font = '7px "Press Start 2P", monospace';
          const linhas: [string, string][] = [
            ['PONTOS', String(Math.floor(pontuacaoFinal))],
            ['ALVOS DESTRUÃDOS', String(alvosDestruidos)],
            ['MÃSSEIS DERRUBADOS', String(misseisDerrubados)],
            ['ARMADURA RESTANTE', `${armadura.pontos}/6`],
            ['MÃSSEIS NÃƒO USADOS', String(armas.misseis)],
            ['TEMPO', `${min}:${seg.toString().padStart(2, '0')}`],
            ['BÃ”NUS', `+${bonusResumo}`],
          ];
          let y = 140;
          for (const [rotulo, valor] of linhas) {
            g.fillStyle = '#FB923C';
            g.fillText(rotulo, 70, y);
            g.fillStyle = '#E2E8F0';
            g.textAlign = 'right';
            g.fillText(valor, LARGURA - 70, y);
            g.textAlign = 'left';
            y += 24;
          }

          // Nota final
          const nota = notaDoResumo(pontuacaoFinal, bonusResumo);
          g.textAlign = 'center';
          g.font = '32px "Press Start 2P", monospace';
          g.fillStyle = { S: '#FDE047', A: '#4ADE80', B: '#22D3EE', C: '#FB923C', D: '#EF4444' }[nota] ?? '#E2E8F0';
          g.fillText(nota, LARGURA / 2, y + 34);
          g.font = '6px "Press Start 2P", monospace';
          g.fillStyle = '#94A3B8';
          g.fillText('PRESSIONE AÃ‡ÃƒO / TOQUE PARA CONTINUAR', LARGURA / 2, ALTURA - 36);
        } else {
          // HUD padrÃ£o do percurso
          const progresso = comprimento > 0 ? cameraY / comprimento : 0;
          desenharHUDJogo(g, ctx.hud, {
            combustivel: combustivelEstado.combustivel,
            misseis: armas.misseis,
            semMisseis: armas.misseis <= 0,
            armadura: armadura.pontos,
            progresso,
            recarregando: combustivelEstado.recarregando,
            reabastecendo: combustivelEstado.recarregando,
            vento,
            missao: missaoAtual,
            ciclo: cicloAtual,
            tempo,
          });
        }
      },

      destruir() {
        cenaDecolagem = null;
        cenaPouso = null;
        chefe = null;
      },
    };
  },
};

function notaDoResumo(pontuacao: number, bonus: number): 'S' | 'A' | 'B' | 'C' | 'D' {
  const total = Math.floor(pontuacao);
  if (total >= 6000) return 'S';
  if (total >= 4000) return 'A';
  if (total >= 2500) return 'B';
  if (total >= 1500) return 'C';
  return 'D';
}

function nomeChefe(tipo: 'corsario' | 'condor' | 'escorpiao' | 'colmeia' | 'tempestade'): string {
  switch (tipo) {
    case 'condor': return 'CONDOR DE AÇO';
    case 'escorpiao': return 'ESCORPIÃO DO DESERTO';
    case 'colmeia': return 'COLMEIA';
    case 'tempestade': return 'SENHOR DA TEMPESTADE';
    default: return 'CORSÁRIO';
  }
}

