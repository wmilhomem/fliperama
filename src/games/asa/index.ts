/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { EngineContext, GameInstance, GameModule, InputState } from '../../engine/types';
import {
  ALTURA,
  BOMBAS_POR_SETOR,
  BIOMAS,
  TipoBioma,
  COR_LARANJA,
  COR_LARANJA_NEON,
  DIFICULDADE_SETOR,
  HUD_ALTURA,
  JOGADOR_LARGURA,
  LARGURA,
  LINHA_JOGADOR,
  PALETA_BIOMAS,
  PONTOS_BUNKER,
  PONTOS_CACA,
  PONTOS_CACA_MERGULHO,
  PONTOS_CAMINHAO,
  PONTOS_CENTRAL_BASE,
  PONTOS_CENTRAL_POR_SETOR,
  PONTOS_DRONE,
  PONTOS_HELICOPTERO,
  PONTOS_LANCHA,
  PONTOS_PASSARO,
  PONTOS_RASANTE_POR_SEGUNDO,
  PONTOS_RECARGA,
  PONTOS_TORRE,
  PONTOS_TANKER_BONUS,
  PONTOS_VIDA_EXTRA,
  TAMANHO_SETOR,
  VELOCIDADE_ROLAGEM_MAX,
  VELOCIDADE_ROLAGEM_MIN,
  VELOCIDADE_ROLAGEM_PADRAO,
  VIDAS_INICIAIS,
  VIDAS_MAX,
} from './constantes';
import { criarAviao, desenharAviao } from './aviao';
import {
  atualizarParticulas,
  atualizarTextos,
  criarExplosao,
  criarTexto,
  desenharParticulas,
  desenharTextos,
} from './particulas';
import {
  atualizarCombustivel,
  atualizarTanque,
  criarEstadoCombustivel,
  criarTanque,
  desenharIndicadorTanque,
  desenharTanque,
} from './combustivel';
import { atualizarVento, criarEstadoVento, desenharParticulasVento, empuxoVento } from './vento';
import {
  atualizarCaca,
  criarCaca,
  desenharCaca,
} from './inimigos/caca';
import {
  atualizarCacaMergulho,
  criarCacaMergulho,
  desenharCacaMergulho,
} from './inimigos/mergulho';
import {
  atualizarHelicoptero,
  criarHelicoptero,
  desenharHelicoptero,
} from './inimigos/helicoptero';
import { atualizarDrone, criarDrone, desenharDrone } from './inimigos/drone';
import {
  atualizarPassaro,
  criarPassaro,
  desenharPassaro,
  Passaro,
} from './inimigos/passaro';
import {
  atualizarAlvoSolo,
  criarBunker,
  criarCaminhao,
  criarLancha,
  criarTorre,
  desenharAlvoSolo,
} from './solo';
import {
  atualizarCentralRadar,
  criarCentralRadar,
  desenharCentralRadar,
} from './central';
import { desenharHUDJogo, desenharTitulo } from './hud_asa';
import {
  BombaJogador,
  InimigoAereo,
  TextoFlutuante,
  TiroJogador,
  AlvoSolo,
  Particula,
  ProjetilInimigo,
} from './tipos';
import { criarAleatorio, inteiro, retangulosColocam } from './util';

export const asaGameModule: GameModule = {
  id: 'asa',
  titulo: 'Asa Rasante',
  genero: 'Tiro vertical',
  descricao: 'Cruze o Brasil em voo rasante, bombardeie bases, reabasteça em pleno ar e desvie dos ventos.',
  corTema: COR_LARANJA_NEON,
  largura: LARGURA,
  altura: ALTURA,
  instrucoes: {
    historia:
      'A piloto Lia "Asa" Duarte comanda um caça leve de hélice-turbo em uma missão de longo alcance: destruir as centrais de radar que bloqueiam o corredor aéreo, do litoral à floresta. Não há pista de pouso no caminho. O combustível só vem de aviões-tanque em pleno voo.',
    controles: [
      'Setas Esquerda/Direita ou A/D: manobrar o avião',
      'Cima: acelera (mundo desce mais rápido) · Baixo: freia',
      'Espaço / Botão A: canhão',
      'X / Botão B: bomba (máx. 1 no ar, 10 por setor)',
      'P: pausa · R: reiniciar · M: som · ESC: hub',
    ],
    pontos: [
      { acao: 'Caça leve', pontos: PONTOS_CACA },
      { acao: 'Caça em mergulho', pontos: PONTOS_CACA_MERGULHO },
      { acao: 'Helicóptero', pontos: PONTOS_HELICOPTERO },
      { acao: 'Drone de patrulha', pontos: PONTOS_DRONE },
      { acao: 'Torre antiaérea', pontos: PONTOS_TORRE },
      { acao: 'Caminhão de munição', pontos: PONTOS_CAMINHAO },
      { acao: 'Bunker', pontos: PONTOS_BUNKER },
      { acao: 'Lancha', pontos: PONTOS_LANCHA },
      { acao: 'Pássaro', pontos: PONTOS_PASSARO },
      { acao: 'Reabastecimento concluído', pontos: PONTOS_RECARGA },
      { acao: 'Central de radar', pontos: PONTOS_CENTRAL_BASE },
    ],
  },

  criar(ctx: EngineContext): GameInstance {
    let estado: 'titulo' | 'jogando' | 'gameOver' = 'titulo';
    let tempo = 0;
    let tempoEstado = 0;
    let setor = 1;
    let vidas = VIDAS_INICIAIS;
    let proximaVidaExtra = PONTOS_VIDA_EXTRA;
    let recorde = ctx.storage.lerRecorde(ctx.id);

    // Mundo
    let cameraY = 0; // distância já percorrida no setor
    let scrollSeed = 1;
    let velocidadeRolagem = VELOCIDADE_ROLAGEM_PADRAO;
    let bioma: TipoBioma = 'litoral';

    // Jogador e entidades
    let aviao = criarAviao(LARGURA / 2, LINHA_JOGADOR);
    let tirosJogador: TiroJogador[] = [];
    let bombasJogador: BombaJogador[] = [];
    let projetisInimigos: ProjetilInimigo[] = [];
    let inimigosAereos: InimigoAereo[] = [];
    let alvosSolo: AlvoSolo[] = [];
    let passaros: Passaro[] = [];
    let particulas: Particula[] = [];
    let textos: TextoFlutuante[] = [];

    // Sistemas do jogo
    let estadoCombustivel = criarEstadoCombustivel();
    let tanque = criarTanque(10);
    let vento = criarEstadoVento('litoral');
    let avisoRadar = false;
    let radarAtivo = false;

    // Chefão: central de radar (só existe no fim do setor)
    let central: ReturnType<typeof criarCentralRadar> | null = null;

    // Timers de spawn
    let timerAves = 0;
    let timerAlvos = 0;
    let timerPassaros = 0;
    let timerRasante = 0;

    // Seed de geração para o setor atual
    function novoSetor(numero: number) {
      const rng = criarAleatorio(`asa-setor-${numero}`);
      setor = numero;
      bioma = BIOMAS[(setor - 1) % BIOMAS.length];
      cameraY = 0;
      scrollSeed = Math.floor(rng() * 100000);
      velocidadeRolagem = VELOCIDADE_ROLAGEM_PADRAO + (setor - 1) * 4;
      aviao = criarAviao(LARGURA / 2, LINHA_JOGADOR);
      aviao.invulneravel = 2;
      tirosJogador = [];
      bombasJogador = [];
      projetisInimigos = [];
      inimigosAereos = [];
      alvosSolo = [];
      passaros = [];
      particulas = [];
      textos = [];
      estadoCombustivel = criarEstadoCombustivel();
      tanque = criarTanque(4 + rng() * 5);
      vento = criarEstadoVento(bioma);
      timerAves = 0.6 + rng();
      timerAlvos = 1.2 + rng();
      timerPassaros = 4 + rng() * 4;
      timerRasante = 0;
      avisoRadar = false;
      radarAtivo = false;
      central = null;

      // Alvos de solo pré-posicionados no setor
      const quantidade = 4 + Math.min(4, Math.floor(setor / 2));
      for (let i = 0; i < quantidade; i++) {
        const tipo = rng();
        const x = 60 + rng() * (LARGURA - 120);
        const y = 90 + rng() * 260;
        if (tipo < 0.3) {
          alvosSolo.push(criarTorre(x, y));
        } else if (tipo < 0.5) {
          alvosSolo.push(criarBunker(x, y));
        } else if (tipo < 0.72) {
          alvosSolo.push(criarCaminhao(x, y, rng() < 0.5 ? 40 : -40));
        } else if (tipo < 0.86 && bioma === 'litoral') {
          alvosSolo.push(criarLancha(x, y, rng() < 0.5 ? 55 : -55));
        } else {
          alvosSolo.push(criarTorre(x, y));
        }
      }
    }

    function configurarPartida() {
      estado = 'titulo';
      tempo = 0;
      tempoEstado = 0;
      vidas = VIDAS_INICIAIS;
      proximaVidaExtra = PONTOS_VIDA_EXTRA;
      recorde = ctx.storage.lerRecorde(ctx.id);
      novoSetor(1);
      ctx.hud.definirEstado({
        pontuacao: 0,
        recorde,
        vidas,
        fase: 1,
        vidasMax: VIDAS_MAX,
        bonus: 0,
      });
    }

    function comecarPartida() {
      estado = 'jogando';
      ctx.audio.ativar();
      ctx.audio.tocar('alerta');
    }

    function concederPontos(valor: number, x?: number, y?: number, cor = '#FDE047') {
      const pontos = Math.floor(valor);
      if (pontos <= 0) return;
      ctx.hud.adicionarPontos(pontos, x, y, cor);
      const pontuacao = ctx.hud.obterEstado().pontuacao;
      if (pontuacao >= proximaVidaExtra && vidas < VIDAS_MAX) {
        proximaVidaExtra += PONTOS_VIDA_EXTRA;
        vidas += 1;
        ctx.hud.definirEstado({ vidas, vidasMax: VIDAS_MAX });
        ctx.audio.tocar('bolaExtra');
        if (x !== undefined && y !== undefined) {
          criarTexto(textos, x, y - 24, '+1 VIDA', '#4ADE80');
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
      // Volta ao início do setor com combustível e bombas cheias
      const setorAtual = setor;
      novoSetor(setorAtual);
      ctx.hud.definirEstado({ vidas, fase: setor });
    }

    function spawnInimigoAereo() {
      const dif = DIFICULDADE_SETOR(setor);
      const rng = Math.random;
      // Mais inimigos e mais rápidos conforme o setor avança
      const roll = rng();
      const x = 40 + rng() * (LARGURA - 80);

      if (roll < 0.34) {
        const dir = rng() < 0.5 ? 1 : -1;
        inimigosAereos.push(criarCaca(dir === 1 ? -40 : LARGURA + 40, 80 + rng() * 90, dir, 130 + dif * 60));
      } else if (roll < 0.56) {
        inimigosAereos.push(criarCacaMergulho(x, 60 + rng() * 40));
      } else if (roll < 0.76) {
        const dir = rng() < 0.5 ? 1 : -1;
        inimigosAereos.push(criarHelicoptero(dir === 1 ? -50 : LARGURA + 50, 120 + rng() * 60, dir));
      } else {
        inimigosAereos.push(criarDrone(x, 80 + rng() * 60));
      }
    }

    function spawnAlvoSolo() {
      const rng = Math.random;
      const x = 60 + rng() * (LARGURA - 120);
      const y = 90 + rng() * 140;
      const roll = rng();
      if (roll < 0.35) {
        alvosSolo.push(criarTorre(x, y));
      } else if (roll < 0.55) {
        alvosSolo.push(criarBunker(x, y));
      } else if (roll < 0.78) {
        alvosSolo.push(criarCaminhao(x, y, rng() < 0.5 ? 45 : -45));
      } else if (bioma === 'litoral') {
        alvosSolo.push(criarLancha(x, y, rng() < 0.5 ? 60 : -60));
      } else {
        alvosSolo.push(criarTorre(x, y));
      }
    }

    function spawnPassaro() {
      const dir = Math.random() < 0.5 ? 1 : -1;
      passaros.push(criarPassaro(dir === 1 ? -20 : LARGURA + 20, 110 + Math.random() * 140, dir));
    }

    function dispararBomba() {
      if (estadoCombustivel.bombas <= 0) return;
      if (bombasJogador.length >= 1) return; // máx 1 no ar
      bombasJogador.push({
        x: aviao.x,
        y: aviao.y - 10,
        vy: 60,
        tempo: 0,
      });
      estadoCombustivel.bombas -= 1;
      ctx.audio.tocar('torpedo');
    }

    function atualizarJogador(dt: number, input: InputState) {
      // Movimento lateral
      let move = 0;
      if (input.esquerda) move -= 1;
      if (input.direita) move += 1;

      // Empurrão do vento
      const ventoForça = empuxoVento(vento);
      aviao.velocidadeX = move * 250 + ventoForça;
      aviao.x += aviao.velocidadeX * dt;
      aviao.x = Math.max(20, Math.min(LARGURA - 20, aviao.x));

      // Inclinação visual ao virar
      aviao.inclinacao += ((move * 0.5) - aviao.inclinacao) * Math.min(1, dt * 10);

      // Hélice
      aviao.helice = (aviao.helice + dt * 18) % 2;

      // Cooldowns
      aviao.cooldown = Math.max(0, aviao.cooldown - dt);
      aviao.cooldownBomba = Math.max(0, aviao.cooldownBomba - dt);
      aviao.invulneravel = Math.max(0, aviao.invulneravel - dt);

      // Acelerar/desacelerar a rolagem
      if (input.cima) {
        velocidadeRolagem = Math.min(VELOCIDADE_ROLAGEM_MAX, velocidadeRolagem + 140 * dt);
      } else if (input.baixo) {
        velocidadeRolagem = Math.max(VELOCIDADE_ROLAGEM_MIN, velocidadeRolagem - 160 * dt);
      } else {
        // Volta suavemente para o padrão
        velocidadeRolagem += (VELOCIDADE_ROLAGEM_PADRAO - velocidadeRolagem) * Math.min(1, dt * 1.4);
      }

      // Disparo contínuo (segurar)
      if (input.acao && aviao.cooldown <= 0 && tirosJogador.length < 3) {
        tirosJogador.push({ x: aviao.x, y: aviao.y - 20, vy: -520 });
        aviao.cooldown = 0.18;
        ctx.audio.tocar('tiro');
      }

      // Bomba (um disparo por toque)
      if (input.acao2Pressionada && aviao.cooldownBomba <= 0) {
        dispararBomba();
        aviao.cooldownBomba = 0.3;
      }

      // Vento atualizado no loop principal
    }

    function atualizarMundo(dt: number) {
      // Rolagem do mundo (o mapa desce); limita ao fim do setor
      cameraY = Math.min(cameraY + velocidadeRolagem * dt, TAMANHO_SETOR - ALTURA + 40);

      // Spawner de inimigos aéreos
      timerAves -= dt;
      if (timerAves <= 0 && !radarAtivo) {
        spawnInimigoAereo();
        const dif = DIFICULDADE_SETOR(setor);
        timerAves = Math.max(0.55, 1.5 - dif * 0.8) * (0.7 + Math.random() * 0.8);
      }

      // Spawner de alvos de solo
      timerAlvos -= dt;
      if (timerAlvos <= 0 && !radarAtivo) {
        spawnAlvoSolo();
        timerAlvos = Math.max(1.3, 3.6 - setor * 0.18) * (0.75 + Math.random() * 0.7);
      }

      // Pássaros
      timerPassaros -= dt;
      if (timerPassaros <= 0 && !radarAtivo) {
        spawnPassaro();
        timerPassaros = 6 + Math.random() * 8;
      }

      // Atualiza inimigos aéreos
      for (let i = inimigosAereos.length - 1; i >= 0; i--) {
        const inv = inimigosAereos[i];
        if (inv.tipo === 'caca') {
          atualizarCaca(inv, dt);
        } else if (inv.tipo === 'mergulho') {
          atualizarCacaMergulho(inv, aviao.x, aviao.y, dt, 165 + DIFICULDADE_SETOR(setor) * 70);
        } else if (inv.tipo === 'helicoptero') {
          atualizarHelicoptero(inv, dt, LARGURA);
          // Atira uma vez quando está na frente do jogador e na mesma altura
          if (!inv.atirou && Math.abs(inv.y - aviao.y) < 30 && Math.abs(inv.x - aviao.x) < 90) {
            inv.atirou = true;
            projetisInimigos.push({ x: inv.x, y: inv.y + 10, vx: 0, vy: 210 });
            ctx.audio.tocar('tiro');
          }
        } else if (inv.tipo === 'drone') {
          atualizarDrone(inv, dt);
        }

        // Remove se saiu da tela
        if (inv.x < -80 || inv.x > LARGURA + 80 || inv.y < -80 || inv.y > ALTURA + 80) {
          inimigosAereos.splice(i, 1);
        }
      }

      // Pássaros
      for (let i = passaros.length - 1; i >= 0; i--) {
        atualizarPassaro(passaros[i], dt);
        if (passaros[i].x < -40 || passaros[i].x > LARGURA + 40) {
          passaros.splice(i, 1);
        }
      }

      // Alvos de solo
      for (const alvo of alvosSolo) {
        atualizarAlvoSolo(alvo, dt, LARGURA);
      }

      // Central de radar
      if (radarAtivo && central) {
        atualizarCentralRadar(central, dt);
        // Torres atiram em leque
        for (const torre of central.torres) {
          if (torre.timer <= 0) {
            torre.timer = 1.6 - Math.min(0.8, setor * 0.08) + Math.random() * 0.6;
            const dx = aviao.x - torre.x;
            const dy = aviao.y - torre.y;
            const dist = Math.hypot(dx, dy) || 1;
            const velocidade = 150 + setor * 10;
            projetisInimigos.push({
              x: torre.x,
              y: torre.y - 20,
              vx: (dx / dist) * velocidade * 0.35,
              vy: (dy / dist) * velocidade,
            });
            ctx.audio.tocar('tiro');
          }
        }
      }

      // Projéteis inimigos
      for (let i = projetisInimigos.length - 1; i >= 0; i--) {
        const p = projetisInimigos[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (p.y > ALTURA + 20 || p.x < -20 || p.x > LARGURA + 20) {
          projetisInimigos.splice(i, 1);
        }
      }

      // Tiros do jogador
      for (let i = tirosJogador.length - 1; i >= 0; i--) {
        const tiro = tirosJogador[i];
        tiro.y += tiro.vy * dt;
        if (tiro.y < HUD_ALTURA) {
          tirosJogador.splice(i, 1);
        }
      }

      // Bombas do jogador
      for (let i = bombasJogador.length - 1; i >= 0; i--) {
        const bomba = bombasJogador[i];
        bomba.vy += 900 * dt; // gravidade
        bomba.y += bomba.vy * dt;
        bomba.tempo += dt;
        // Explode no impacto com o chão ou após o tempo de queda
        if (bomba.tempo >= 0.55 || bomba.y >= ALTURA - 40) {
          explodirBomba(bomba.x, bomba.y);
          bombasJogador.splice(i, 1);
        }
      }
    }

    function explodirBomba(x: number, y: number) {
      criarExplosao(particulas, x, y, '#FB923C', 22);
      criarExplosao(particulas, x, y, '#FDE047', 10);
      ctx.audio.tocar('explosao');

      // Destruir alvos de solo próximos
      for (let i = alvosSolo.length - 1; i >= 0; i--) {
        const alvo = alvosSolo[i];
        const dx = alvo.x - x;
        const dy = alvo.y - y;
        if (Math.hypot(dx, dy) < 34) {
          const pontos =
            alvo.tipo === 'torre'
              ? PONTOS_TORRE
              : alvo.tipo === 'caminhao'
                ? PONTOS_CAMINHAO
                : alvo.tipo === 'bunker'
                  ? PONTOS_BUNKER
                  : PONTOS_LANCHA;
          concederPontos(pontos, alvo.x, alvo.y - 14, '#FDE047');
          criarTexto(textos, alvo.x, alvo.y - 10, `+${pontos}`, '#FB923C');
          if (alvo.tipo === 'caminhao') {
            // Caminhão de munição solta bombas extras
            estadoCombustivel.bombas = Math.min(BOMBAS_POR_SETOR, estadoCombustivel.bombas + 2);
          }
          alvosSolo.splice(i, 1);
        }
      }

      // Dano à central de radar
      if (central && central.ativo) {
        const dx = central.x - x;
        const dy = central.y - y;
        if (Math.hypot(dx, dy) < 90) {
          central.hp -= 1;
          criarExplosao(particulas, x, y, '#FB923C', 26);
          if (central.hp <= 0) {
            destruirCentral();
          }
        }
      }
    }

    function destruirCentral() {
      if (!central) return;
      const bonus = PONTOS_CENTRAL_BASE + PONTOS_CENTRAL_POR_SETOR * setor;
      concederPontos(bonus, central.x, central.y, '#FB923C');
      criarTexto(textos, central.x, central.y - 20, `+${bonus}`, '#FDE047');
      criarExplosao(particulas, central.x, central.y, '#F97316', 46);
      criarExplosao(particulas, central.x, central.y, '#FDE047', 26);
      ctx.audio.tocar('especial');

      // Avança para o próximo setor
      setor += 1;
      ctx.hud.definirFase(setor);
      novoSetor(setor);
      // O aviso sonoro é disparado dentro de novoSetor através do tanque
    }

    function verificarColisoes() {
      // Invulnerabilidade temporária
      if (aviao.invulneravel > 0) return;

      const caixaAviao = {
        x: aviao.x - 11,
        y: aviao.y - 12,
        largura: 22,
        altura: 24,
      };

      // Tiro do jogador × inimigo aéreo
      for (let i = tirosJogador.length - 1; i >= 0; i--) {
        const tiro = tirosJogador[i];
        let acertou = false;

        for (const inv of inimigosAereos) {
          if (inv.tipo === 'drone') {
            if (Math.abs(tiro.x - inv.x) < 10 && Math.abs(tiro.y - inv.y) < 10) {
              inimigosAereos.splice(inimigosAereos.indexOf(inv), 1);
              acertou = true;
              concederPontos(PONTOS_DRONE, inv.x, inv.y, '#22D3EE');
              criarExplosao(particulas, inv.x, inv.y, '#22D3EE', 14);
              ctx.audio.tocar('explosao');
              break;
            }
          } else {
            if (Math.abs(tiro.x - inv.x) < 16 && Math.abs(tiro.y - inv.y) < 12) {
              inimigosAereos.splice(inimigosAereos.indexOf(inv), 1);
              acertou = true;
              const pontos =
                inv.tipo === 'caca'
                  ? PONTOS_CACA
                  : inv.tipo === 'mergulho'
                    ? PONTOS_CACA_MERGULHO
                    : PONTOS_HELICOPTERO;
              concederPontos(pontos, inv.x, inv.y, '#FBBF24');
              criarExplosao(particulas, inv.x, inv.y, '#F97316', 14);
              ctx.audio.tocar('explosao');
              break;
            }
          }
        }

        // Tiro do jogador × pássaro
        if (!acertou) {
          for (let j = passaros.length - 1; j >= 0; j--) {
            const p = passaros[j];
            if (Math.abs(tiro.x - p.x) < 6 && Math.abs(tiro.y - p.y) < 5) {
              passaros.splice(j, 1);
              acertou = true;
              concederPontos(PONTOS_PASSARO, p.x, p.y, '#F8FAFC');
              criarExplosao(particulas, p.x, p.y, '#F8FAFC', 6);
              break;
            }
          }
        }

        // Tiro do jogador × alvo de solo (bunker/caminhão/lancha)
        if (!acertou) {
          for (let j = alvosSolo.length - 1; j >= 0; j--) {
            const alvo = alvosSolo[j];
            if (Math.abs(tiro.x - alvo.x) < 18 && Math.abs(tiro.y - alvo.y) < 12) {
              acertou = true;
              if (alvo.tipo === 'torre') {
                // Torre resiste a tiros; só bomba destrói
                criarExplosao(particulas, tiro.x, tiro.y, '#E7E5E4', 4);
              } else if (alvo.tipo === 'bunker') {
                alvo.acertos += 1;
                criarExplosao(particulas, tiro.x, tiro.y, '#A8A29E', 6);
                if (alvo.acertos >= 3) {
                  concederPontos(PONTOS_BUNKER, alvo.x, alvo.y - 14, '#FBBF24');
                  criarTexto(textos, alvo.x, alvo.y - 10, `+${PONTOS_BUNKER}`, '#FB923C');
                  alvosSolo.splice(j, 1);
                }
              } else {
                const pontos = alvo.tipo === 'caminhao' ? PONTOS_CAMINHAO : PONTOS_LANCHA;
                concederPontos(pontos, alvo.x, alvo.y - 14, '#FBBF24');
                criarTexto(textos, alvo.x, alvo.y - 10, `+${pontos}`, '#FB923C');
                if (alvo.tipo === 'caminhao') {
                  estadoCombustivel.bombas = Math.min(BOMBAS_POR_SETOR, estadoCombustivel.bombas + 2);
                }
                criarExplosao(particulas, alvo.x, alvo.y, '#F97316', 12);
                alvosSolo.splice(j, 1);
              }
              break;
            }
          }
        }

        // Tiro do jogador × central de radar (turres: acerto de metralhadora)
        if (!acertou && central && central.ativo) {
          const dx = tiro.x - central.x;
          const dy = tiro.y - central.y;
          if (Math.abs(dx) < 100 && Math.abs(dy) < 70) {
            acertou = true;
            central.hp -= 0.25;
            criarExplosao(particulas, tiro.x, tiro.y, '#FDE047', 4);
            if (central.hp <= 0) {
              destruirCentral();
            }
          }
        }

        if (acertou) tirosJogador.splice(i, 1);
      }

      // Bomba do jogador × tanque (penalidade)
      for (let i = bombasJogador.length - 1; i >= 0; i--) {
        const bomba = bombasJogador[i];
        if (tanque.ativo) {
          const dx = bomba.x - (tanque.x + 24);
          const dy = bomba.y - (tanque.y + 20);
          if (Math.hypot(dx, dy) < 40) {
            tanque.ativo = false;
            concederPontos(PONTOS_TANKER_BONUS);
            criarTexto(textos, tanque.x + 24, tanque.y, '-500', '#EF4444');
            criarExplosao(particulas, tanque.x + 24, tanque.y + 20, '#F97316', 26);
            ctx.audio.tocar('explosao');
            bombasJogador.splice(i, 1);
            continue;
          }
        }
      }

      // Projétil inimigo × jogador
      for (let i = projetisInimigos.length - 1; i >= 0; i--) {
        const p = projetisInimigos[i];
        if (
          p.x > caixaAviao.x &&
          p.x < caixaAviao.x + caixaAviao.largura &&
          p.y > caixaAviao.y &&
          p.y < caixaAviao.y + caixaAviao.altura
        ) {
          projetisInimigos.splice(i, 1);
          criarExplosao(particulas, aviao.x, aviao.y, '#FBBF24', 20);
          perderVida();
          return;
        }
      }

      // Inimigo aéreo × jogador
      for (const inv of inimigosAereos) {
        const caixaInv = { x: inv.x - 14, y: inv.y - 12, largura: 28, altura: 24 };
        if (retangulosColocam(caixaAviao, caixaInv)) {
          criarExplosao(particulas, aviao.x, aviao.y, '#FBBF24', 20);
          perderVida();
          return;
        }
      }

      // Pássaro × jogador (apenas atrapalha)
      for (const p of passaros) {
        if (Math.abs(p.x - aviao.x) < 12 && Math.abs(p.y - aviao.y) < 12) {
          criarExplosao(particulas, aviao.x, aviao.y, '#F8FAFC', 12);
          perderVida();
          return;
        }
      }

      // Alvo de solo × jogador
      for (const alvo of alvosSolo) {
        const caixaAlvo = {
          x: alvo.x - 14,
          y: alvo.y - 10,
          largura: 28,
          altura: 20,
        };
        if (retangulosColocam(caixaAviao, caixaAlvo)) {
          criarExplosao(particulas, aviao.x, aviao.y, '#FBBF24', 20);
          perderVida();
          return;
        }
      }

      // Tanque × jogador (bater no tanque: dano + some o tanque)
      if (tanque.ativo) {
        const caixaTanque = { x: tanque.x, y: tanque.y - 10, largura: 48, altura: 44 };
        if (retangulosColocam(caixaAviao, caixaTanque)) {
          tanque.ativo = false;
          criarExplosao(particulas, tanque.x + 24, tanque.y + 20, '#F97316', 26);
          ctx.audio.tocar('explosao');
          perderVida();
          return;
        }
      }
    }

    function atualizarJogar(dt: number, input: InputState) {
      tempo += dt;
      // Velocidade de rolagem ajustada no atualizarJogador
      atualizarJogador(dt, input);
      atualizarMundo(dt);

      atualizarVento(vento, dt, bioma);
      const combustivelVazio = atualizarCombustivel(estadoCombustivel, dt, input);

      // Tanque de reabastecimento
      const recarga = atualizarTanque(
        tanque,
        estadoCombustivel,
        {
          x: aviao.x,
          y: aviao.y,
          largura: JOGADOR_LARGURA,
          altura: 32,
        },
        dt,
        Math.random,
        () => ctx.audio.tocar('tanquero'),
        () => ctx.audio.tocar('recarga')
      );

      if (recarga === 'recarregou') {
        concederPontos(PONTOS_RECARGA, aviao.x, aviao.y - 24, '#4ADE80');
        criarTexto(textos, aviao.x, aviao.y - 24, `+${PONTOS_RECARGA}`, '#4ADE80');
      }

      // Combustível zerou: motor falha, perde uma vida
      if (combustivelVazio) {
        criarExplosao(particulas, aviao.x, aviao.y, '#F97316', 30);
        ctx.audio.tocar('alarme');
        perderVida();
        return;
      }

      // Aviso sonoro de combustível baixo
      if (estadoCombustivel.combustivel <= 25 && Math.floor(tempo * 2) !== Math.floor((tempo - dt) * 2)) {
        if (estadoCombustivel.combustivel > 0) {
          ctx.audio.tocar('alarme');
        }
      }

      // Ativar o radar quando o fim do setor se aproxima
      if (!radarAtivo && cameraY > TAMANHO_SETOR - 420) {
        if (!avisoRadar) {
          avisoRadar = true;
          ctx.audio.tocar('alarme');
        }
        if (cameraY >= TAMANHO_SETOR - ALTURA + 40) {
          radarAtivo = true;
          central = criarCentralRadar(LARGURA / 2, 150, setor);
        }
      }

      // Se a central está no mundo, mantém na tela pelo deslocamento do mundo
      // (ela é renderizada em coordenadas de tela abaixo)

      verificarColisoes();
      atualizarParticulas(particulas, dt);
      atualizarTextos(textos, dt);

      // Bônus rasante na serra: perto das paredes de rocha
      if (bioma === 'serra') {
        timerRasante += dt;
        if (aviao.x < 56 || aviao.x > LARGURA - 56) {
          if (timerRasante >= 1) {
            timerRasante = 0;
            concederPontos(PONTOS_RASANTE_POR_SEGUNDO);
          }
        } else {
          timerRasante = 0;
        }
      }
    }

    function atualizarGameOver(dt: number, input: InputState) {
      tempoEstado += dt;
      atualizarParticulas(particulas, dt);
      atualizarTextos(textos, dt);
      if (input.acaoPressionada || input.acao2Pressionada) {
        configurarPartida();
        comecarPartida();
      }
    }

    function desenharFundo(g: CanvasRenderingContext2D) {
      const [ceuTopo, ceuBase, chaoPrincipal] = PALETA_BIOMAS[bioma];
      const grad = g.createLinearGradient(0, 0, 0, ALTURA);
      grad.addColorStop(0, ceuTopo);
      grad.addColorStop(0.55, ceuBase);
      grad.addColorStop(1, chaoPrincipal);
      g.fillStyle = grad;
      g.fillRect(0, 0, LARGURA, ALTURA);

      // Sol
      g.fillStyle = '#FEF9C3';
      g.beginPath();
      g.arc(LARGURA - 70, 70, 24, 0, Math.PI * 2);
      g.fill();

      // Chão do bioma
      g.fillStyle = PALETA_BIOMAS[bioma][2];
      g.fillRect(0, ALTURA * 0.72, LARGURA, ALTURA * 0.28);

      // Faixa escura no fundo
      g.fillStyle = PALETA_BIOMAS[bioma][3];
      g.fillRect(0, ALTURA - 30, LARGURA, 30);

      // Ondas do litoral
      if (bioma === 'litoral') {
        g.strokeStyle = 'rgba(255,255,255,0.55)';
        g.lineWidth = 2;
        for (let i = 0; i < 4; i++) {
          const y = ALTURA * 0.5 + i * 36 + (tempo * 22) % 36;
          g.beginPath();
          for (let x = 0; x <= LARGURA; x += 20) {
            const yy = y + Math.sin(x * 0.05 + tempo * 2 + i) * 3;
            if (x === 0) g.moveTo(x, yy);
            else g.lineTo(x, yy);
          }
          g.stroke();
        }
      }
    }

    function desenharEntidades(g: CanvasRenderingContext2D) {
      // Alvos de solo
      for (const alvo of alvosSolo) {
        desenharAlvoSolo(g, alvo, tempo);
      }

      // Central de radar (fixa na tela ao final do setor)
      if (central && radarAtivo) {
        desenharCentralRadar(g, central, tempo);
      }

      // Inimigos aéreos
      for (const inv of inimigosAereos) {
        if (inv.tipo === 'caca') {
          desenharCaca(g, inv);
        } else if (inv.tipo === 'mergulho') {
          desenharCacaMergulho(g, inv);
        } else if (inv.tipo === 'helicoptero') {
          desenharHelicoptero(g, inv, tempo);
        } else if (inv.tipo === 'drone') {
          desenharDrone(g, inv, tempo);
        }
      }

      // Pássaros
      for (const p of passaros) {
        desenharPassaro(g, p);
      }

      // Avião-tanque
      desenharTanque(g, tanque, tempo);
      desenharIndicadorTanque(g, tanque, tempo);

      // Tiros do jogador
      g.fillStyle = '#FDE047';
      for (const tiro of tirosJogador) {
        g.fillRect(Math.floor(tiro.x - 1.5), Math.floor(tiro.y - 6), 3, 10);
      }

      // Bombas do jogador
      for (const bomba of bombasJogador) {
        g.fillStyle = '#334155';
        g.beginPath();
        g.ellipse(bomba.x, bomba.y, 3.5, 5.5, 0, 0, Math.PI * 2);
        g.fill();
        g.fillStyle = '#FB923C';
        g.fillRect(bomba.x - 1, bomba.y - 6, 2, 2);
      }

      // Projéteis inimigos
      for (const p of projetisInimigos) {
        g.fillStyle = '#F87171';
        g.beginPath();
        g.arc(Math.floor(p.x), Math.floor(p.y), 3.2, 0, Math.PI * 2);
        g.fill();
      }

      // Partículas
      desenharParticulas(g, particulas);

      // Canhão do jogador
      desenharAviao(g, aviao, tempo);

      // Textos flutuantes
      desenharTextos(g, textos);
    }

    function desenharCenaInteira(g: CanvasRenderingContext2D) {
      desenharFundo(g);
      desenharEntidades(g);
      desenharParticulasVento(g, vento, tempo);

      // HUD do jogo (combustível, bombas, vento)
      desenharHUDJogo(
        g,
        ctx.hud,
        estadoCombustivel,
        vento,
        setor,
        bioma,
        tempo
      );

      if (estado === 'titulo') {
        desenharTitulo(g, recorde, tempo);
      } else if (estado === 'gameOver') {
        ctx.hud.desenharGameOver(g, LARGURA, ALTURA, 'PRESSIONE AÇÃO / TOQUE');
      }
    }

    return {
      iniciar() {
        configurarPartida();
      },

      reiniciar() {
        configurarPartida();
        comecarPartida();
      },

      pausar() {},

      retomar() {},

      destruir() {
        tirosJogador = [];
        bombasJogador = [];
        projetisInimigos = [];
        inimigosAereos = [];
        alvosSolo = [];
        passaros = [];
        particulas = [];
        textos = [];
      },

      atualizar(dt: number, input: InputState) {
        const dtSeguro = Math.min(dt, 0.05);

        if (estado === 'titulo') {
          tempo += dtSeguro;
          if (input.acaoPressionada || input.acao2Pressionada) {
            comecarPartida();
          }
          return;
        }

        if (estado === 'gameOver') {
          atualizarGameOver(dtSeguro, input);
          return;
        }

        atualizarJogar(dtSeguro, input);
      },

      desenhar(g: CanvasRenderingContext2D) {
        desenharCenaInteira(g);
      },
    };
  },
};
