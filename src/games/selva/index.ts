/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { EngineContext, GameInstance, GameModule, InputState } from '../../engine/types';
import {
  ALTURA,
  DURACAO_ATORDOAMENTO,
  DURACAO_BRILHO,
  DURACAO_INVULNERAVEL,
  DURACAO_JOGO,
  DURACAO_MORTE,
  LARGURA,
  PENALIDADE,
  PONTOS_INICIAIS,
  SUBSOLO_CHAO,
  SUBSOLO_TOPO,
  TOTAL_TELAS,
  TOTAL_TESOUROS,
  TRILHA_Y,
  VELOCIDADE_ESCADA,
  VIDAS_INICIAIS,
} from './constantes';
import { desenharCenario } from './cenario';
import {
  atualizarMovimento,
  criarExplorador,
  definirDerrotado,
  desenharExplorador,
} from './explorador';
import { gerarMundo } from './gerador';
import { desenharHUD, desenharResultado, desenharTituloSelva } from './hud';
import {
  atualizarObstaculos,
  colidirSubsolo,
  colidirSuperficie,
  desenharObstaculosSubsolo,
  desenharObstaculosSuperficie,
  obterSuporteSuperficie,
} from './obstaculos';
import { pertoDoCipo, pontoCipo } from './obstaculos/cipo';
import { bloqueiaParede } from './obstaculos/parede';
import {
  atualizarParticulas,
  criarColeta,
  criarExplosao,
  criarImpacto,
  desenharParticulas,
} from './particulas';
import { clamp } from './semente';
import { desenharSubsolo, escadaPerto } from './subsolo';
import {
  coletaTesouro,
  corTesouro,
  desenharTesouros,
  somTesouro,
} from './tesouros';
import {
  Camada,
  CipoObstaculo,
  EstadoJogo,
  MundoSelva,
  Particula,
  TelaSelva,
} from './tipos';

interface ResultadoPartida {
  vitoria: boolean;
  pontuacao: number;
  recorde: number;
  tesouros: number;
  tempo: number;
  bonus: number;
}

export const selvaGameModule: GameModule = {
  id: 'selva',
  titulo: 'Selva do Ouro Perdido',
  descricao:
    'Cruze a selva, pule cipós e jacarés e encontre todos os tesouros em 20 minutos.',
  genero: 'Aventura de exploração',
  corTema: '#22C55E',
  largura: LARGURA,
  altura: ALTURA,
  instrucoes: {
    historia:
      'Dudu encontrou um mapa antigo apontando para 32 tesouros escondidos na floresta. Ele tem 20 minutos para atravessar 120 telas da selva, descendo aos túneis quando necessário, sem cair nas armadilhas do caminho.',
    controles: [
      '◄ ► / A D: andar',
      '▲ ▼ / W S: subir e descer escadas',
      'Espaço / Z / Botão A: pular e soltar o cipó',
      'P: pausar • R: reiniciar • M: som • ESC: voltar ao hub',
    ],
    pontos: [
      { acao: 'Anel', pontos: 2000 },
      { acao: 'Barra de ouro', pontos: 3000 },
      { acao: 'Baú', pontos: 4000 },
      { acao: 'Pulseira', pontos: 4000 },
      { acao: 'Diamante', pontos: 5000 },
      { acao: 'Tronco ou fogueira', pontos: -PENALIDADE },
      { acao: 'Jacaré, areia, cobra ou queda', pontos: -PENALIDADE },
      { acao: 'Bônus final por tempo restante', pontos: 10 },
    ],
  },

  criar(ctx: EngineContext): GameInstance {
    let mundo: MundoSelva = gerarMundo();
    let estado: EstadoJogo = 'titulo';
    let tempo = 0;
    let tempoEstado = 0;
    let tempoJogo = DURACAO_JOGO;
    let telaAtual = 0;
    let camada: Camada = 'superficie';
    let vidas = VIDAS_INICIAIS;
    let recorde = ctx.storage.lerRecorde(ctx.id);
    let jogador = criarExplorador(28, TRILHA_Y);
    let particulas: Particula[] = [];
    const coletados = new Set<string>();
    let cipoAtual: CipoObstaculo | null = null;
    let escadaAtual: number | null = null;
    let cooldownCipo = 0;
    let timerEscada = 0;
    let musicaTimer = 0;
    let musicaPasso = 0;
    let flashTela = 0;
    let flashCor = '#FACC15';
    let resultado: ResultadoPartida | null = null;

    function tela(): TelaSelva {
      return mundo.telas[telaAtual];
    }

    function acharCipo(telaCorrente: TelaSelva): CipoObstaculo | null {
      return (
        telaCorrente.obstaculos.find(
          (obstaculo): obstaculo is CipoObstaculo => obstaculo.tipo === 'cipo'
        ) ?? null
      );
    }

    function definirPontuacao(valor: number): void {
      ctx.hud.definirEstado({ pontuacao: Math.max(0, Math.floor(valor)) });
    }

    function iniciarTitulo(): void {
      mundo = gerarMundo();
      estado = 'titulo';
      tempo = 0;
      tempoEstado = 0;
      tempoJogo = DURACAO_JOGO;
      telaAtual = 0;
      camada = 'superficie';
      vidas = VIDAS_INICIAIS;
      recorde = ctx.storage.lerRecorde(ctx.id);
      jogador = criarExplorador(28, TRILHA_Y);
      particulas = [];
      coletados.clear();
      cipoAtual = null;
      escadaAtual = null;
      cooldownCipo = 0;
      timerEscada = 0;
      musicaTimer = 0;
      musicaPasso = 0;
      flashTela = 0;
      resultado = null;

      ctx.hud.definirEstado({
        pontuacao: PONTOS_INICIAIS,
        recorde,
        vidas,
        fase: 1,
        vidasMax: VIDAS_INICIAIS,
        bonus: 0,
      });
    }

    function iniciarJogo(): void {
      mundo = gerarMundo();
      estado = 'jogando';
      tempo = 0;
      tempoEstado = 0;
      tempoJogo = DURACAO_JOGO;
      telaAtual = 0;
      camada = 'superficie';
      vidas = VIDAS_INICIAIS;
      recorde = ctx.storage.lerRecorde(ctx.id);
      jogador = criarExplorador(28, TRILHA_Y);
      particulas = [];
      coletados.clear();
      cipoAtual = null;
      escadaAtual = null;
      cooldownCipo = 0;
      timerEscada = 0;
      musicaTimer = 0;
      musicaPasso = 0;
      flashTela = 0;
      resultado = null;

      ctx.hud.definirEstado({
        pontuacao: PONTOS_INICIAIS,
        recorde,
        vidas,
        fase: 1,
        vidasMax: VIDAS_INICIAIS,
        bonus: 0,
      });

      ctx.audio.ativar();
    }

    function terminarPartida(vitoria: boolean): void {
      if (estado === 'resultado') return;

      let bonus = 0;

      if (vitoria) {
        bonus = Math.max(0, Math.floor(tempoJogo)) * 10;
        ctx.hud.adicionarPontos(bonus);
      }

      const hud = ctx.hud.obterEstado();
      ctx.finalizarJogo(vitoria ? 'vitoria' : 'gameOver');
      const final = ctx.hud.obterEstado();

      recorde = final.recorde;
      resultado = {
        vitoria,
        pontuacao: Math.floor(final.pontuacao),
        recorde: Math.floor(recorde),
        tesouros: coletados.size,
        tempo: Math.max(0, Math.floor(tempoJogo)),
        bonus,
      };

      estado = 'resultado';
      tempoEstado = 0;
      cipoAtual = null;
      escadaAtual = null;
      jogador.emCipo = false;
      jogador.emEscada = false;
      ctx.hud.definirEstado({ vidas, recorde });
    }

    function morrer(): void {
      if (estado !== 'jogando') return;

      estado = 'morrendo';
      tempoEstado = DURACAO_MORTE;
      cipoAtual = null;
      escadaAtual = null;
      cooldownCipo = 0;
      vidas = ctx.hud.perderVida();
      const atual = ctx.hud.obterEstado().pontuacao;
      definirPontuacao(atual - PENALIDADE);
      ctx.hud.definirEstado({ vidas });
      definirDerrotado(jogador);

      criarExplosao(particulas, jogador.x, jogador.y - 8, '#FDE68A', 17, 115);
      criarExplosao(particulas, jogador.x, jogador.y - 8, '#FACC15', 9, 75);
      ctx.audio.tocar('vidaPerdida');
    }

    function bater(): void {
      if (estado !== 'jogando' || jogador.invulneravel > 0) return;

      jogador.atordoado = DURACAO_ATORDOAMENTO;
      jogador.invulneravel = DURACAO_INVULNERAVEL;
      const atual = ctx.hud.obterEstado().pontuacao;
      definirPontuacao(atual - PENALIDADE);
      criarImpacto(particulas, jogador.x, jogador.y - 6);
      ctx.audio.tocar('marreta');
    }

    function renascer(): void {
      const noSubsolo = camada === 'subsolo';
      jogador = criarExplorador(noSubsolo ? 30 : 28, noSubsolo ? SUBSOLO_CHAO : TRILHA_Y);
      camada = noSubsolo ? 'subsolo' : 'superficie';
      cipoAtual = null;
      escadaAtual = null;
      cooldownCipo = 0;
      timerEscada = 0;
      estado = 'jogando';
      tempoEstado = 0;
    }

    function tentarTransicao(direcao: -1 | 1): boolean {
      const passo = camada === 'subsolo' ? 3 : 1;
      const alvo = telaAtual + direcao * passo;

      if (alvo < 0 || alvo >= TOTAL_TELAS) return false;

      telaAtual = alvo;
      jogador = criarExplorador(
        direcao > 0 ? 10 : LARGURA - 10,
        camada === 'subsolo' ? SUBSOLO_CHAO : TRILHA_Y
      );
      cipoAtual = null;
      escadaAtual = null;
      cooldownCipo = 0;
      particulas = [];
      ctx.audio.tocar('passo');

      return true;
    }

    function aplicarSuporte(suporte: number | null): void {
      if (jogador.noChao) {
        if (suporte === null) {
          jogador.noChao = false;
          jogador.vy = 0;
        } else {
          jogador.y = suporte;
        }
        return;
      }

      if (jogador.vy >= 0 && suporte !== null && jogador.y >= suporte) {
        jogador.y = suporte;
        jogador.vy = 0;
        jogador.noChao = true;
      }
    }

    function entrarEscada(x: number): void {
      jogador.emEscada = true;
      jogador.emCipo = false;
      jogador.noChao = false;
      jogador.vy = 0;
      jogador.x = x;
      jogador.y = clamp(jogador.y, TRILHA_Y, SUBSOLO_CHAO);
      escadaAtual = x;
      timerEscada = 0;
    }

    function atualizarEscada(dt: number, input: InputState): void {
      jogador.tempoAnim += dt;
      jogador.atordoado = Math.max(0, jogador.atordoado - dt);
      jogador.invulneravel = Math.max(0, jogador.invulneravel - dt);
      jogador.danoCooldown = Math.max(0, jogador.danoCooldown - dt);

      const escada = escadaAtual;

      if (escada === null) {
        jogador.emEscada = false;
        jogador.noChao = false;
        return;
      }

      jogador.x = escada;
      let direcao = 0;

      if (input.cima) direcao -= 1;
      if (input.baixo) direcao += 1;

      jogador.y = clamp(jogador.y + direcao * VELOCIDADE_ESCADA * dt, TRILHA_Y, SUBSOLO_CHAO);

      if (direcao !== 0) {
        timerEscada -= dt;
        if (timerEscada <= 0) {
          ctx.audio.tocarTom(150 + (direcao < 0 ? 35 : 0), 'triangle', 0.055, 0.1);
          timerEscada = 0.24;
        }
      }

      if (input.acaoPressionada) {
        jogador.emEscada = false;
        jogador.noChao = false;
        jogador.vy = -105;
        ctx.audio.tocar('pulo');
        return;
      }

      if (jogador.y <= TRILHA_Y && input.cima) {
        jogador.y = TRILHA_Y;
        jogador.emEscada = false;
        jogador.noChao = true;
        jogador.vy = 0;
        escadaAtual = null;
      } else if (jogador.y >= SUBSOLO_CHAO && input.baixo) {
        jogador.y = SUBSOLO_CHAO;
        jogador.emEscada = false;
        jogador.noChao = true;
        jogador.vy = 0;
        escadaAtual = null;
      }
    }

    function atualizarCipo(dt: number, input: InputState): void {
      jogador.tempoAnim += dt;
      jogador.atordoado = Math.max(0, jogador.atordoado - dt);
      jogador.invulneravel = Math.max(0, jogador.invulneravel - dt);
      jogador.danoCooldown = Math.max(0, jogador.danoCooldown - dt);

      if (!cipoAtual) {
        jogador.emCipo = false;
        jogador.noChao = false;
        return;
      }

      const ponto = pontoCipo(cipoAtual, tempo);
      const anteriorX = jogador.x;
      jogador.x = ponto.x;
      jogador.y = ponto.y + 12;
      jogador.virado = ponto.x >= anteriorX ? 1 : -1;
      jogador.noChao = false;
      jogador.emEscada = false;
      jogador.estado = 'cipo';

      if (input.acaoPressionada) {
        jogador.emCipo = false;
        jogador.vy = -45;
        jogador.noChao = false;
        cipoAtual = null;
        cooldownCipo = 0.5;
        ctx.audio.tocar('pulo');
      }
    }

    function atualizarCamada(): void {
      if (jogador.emCipo) {
        camada = 'superficie';
        return;
      }

      camada = jogador.y > SUBSOLO_TOPO ? 'subsolo' : 'superficie';
    }

    function coletarTesouros(): void {
      for (const tesouro of mundo.tesouros) {
        if (
          tesouro.tela !== telaAtual ||
          tesouro.camada !== camada ||
          coletados.has(tesouro.id)
        ) {
          continue;
        }

        if (!coletaTesouro(jogador, tesouro)) continue;

        coletados.add(tesouro.id);
        ctx.hud.adicionarPontos(tesouro.valor);
        ctx.audio.tocar(somTesouro(tesouro.tipo));
        criarColeta(particulas, tesouro);
        flashTela = DURACAO_BRILHO;
        flashCor = corTesouro(tesouro.tipo);
      }
    }

    function atualizarMusica(dt: number): void {
      musicaTimer -= dt;
      if (musicaTimer > 0) return;

      const notas =
        camada === 'subsolo'
          ? [196, 220, 247, 220, 196, 247, 262, 247]
          : [392, 440, 523, 587, 523, 440, 392, 330];
      const nota = notas[musicaPasso % notas.length];

      ctx.audio.tocarTom(
        nota,
        camada === 'subsolo' ? 'triangle' : 'square',
        0.075,
        camada === 'subsolo' ? 0.045 : 0.06
      );

      if (musicaPasso % 4 === 0) {
        ctx.audio.tocarTom(camada === 'subsolo' ? 98 : 196, 'triangle', 0.12, 0.055);
      }

      musicaPasso += 1;
      musicaTimer = camada === 'subsolo' ? 0.52 : 0.31;
    }

    function atualizarJogando(dt: number, input: InputState): void {
      const telaCorrente = tela();
      atualizarObstaculos(telaCorrente, dt);
      atualizarMusica(dt);
      cooldownCipo = Math.max(0, cooldownCipo - dt);

      if (jogador.emCipo) {
        atualizarCipo(dt, input);
      } else if (jogador.emEscada) {
        atualizarEscada(dt, input);
      } else {
        const antesX = jogador.x;
        const movimento = atualizarMovimento(jogador, dt, input);

        if (movimento.pulou) ctx.audio.tocar('pulo');
        if (movimento.passo) ctx.audio.tocar('passo');

        if (jogador.x < 6 && input.esquerda) {
          if (tentarTransicao(-1)) return;
          jogador.x = 6;
        } else if (jogador.x > LARGURA - 6 && input.direita) {
          if (tentarTransicao(1)) return;
          jogador.x = LARGURA - 6;
        } else {
          jogador.x = clamp(jogador.x, 6, LARGURA - 6);
        }

        if (camada === 'subsolo' && telaCorrente.parede) {
          if (bloqueiaParede(telaCorrente.parede, jogador.x, 5)) {
            if (antesX + 5 <= telaCorrente.parede.x) {
              jogador.x = telaCorrente.parede.x - 5;
            } else {
              jogador.x = telaCorrente.parede.x + telaCorrente.parede.largura + 5;
            }
          }
        }

        if (camada === 'superficie') {
          const escada = escadaPerto(telaCorrente, jogador.x);

          if (escada !== null && jogador.noChao && input.baixo) {
            entrarEscada(escada);
          } else {
            const suporte = obterSuporteSuperficie(telaCorrente, jogador.x, tempo);
            aplicarSuporte(suporte);

            const cipo = acharCipo(telaCorrente);

            if (
              cipo &&
              cooldownCipo <= 0 &&
              !jogador.noChao &&
              pertoDoCipo(jogador, cipo, tempo)
            ) {
              cipoAtual = cipo;
              jogador.emCipo = true;
              jogador.emEscada = false;
              jogador.noChao = false;
              jogador.vy = 0;
              jogador.atordoado = 0;
              const ponto = pontoCipo(cipo, tempo);
              jogador.x = ponto.x;
              jogador.y = ponto.y + 12;
              jogador.estado = 'cipo';
              ctx.audio.tocar('salto');
              return;
            }

            const colisao = colidirSuperficie(jogador, telaCorrente, tempo);

            if (colisao === 'fatal') {
              morrer();
              return;
            }

            if (colisao === 'bump') {
              bater();
            }

            if (jogador.y > SUBSOLO_TOPO) {
              morrer();
              return;
            }
          }
        } else {
          const escada = escadaPerto(telaCorrente, jogador.x);

          if (escada !== null && jogador.noChao && input.cima) {
            entrarEscada(escada);
          } else {
            aplicarSuporte(SUBSOLO_CHAO);

            if (colidirSubsolo(jogador, telaCorrente)) {
              morrer();
              return;
            }
          }
        }
      }

      atualizarCamada();
      coletarTesouros();
      particulas = atualizarParticulas(particulas, dt);

      if (coletados.size >= TOTAL_TESOUROS) {
        terminarPartida(true);
        return;
      }

      if (tempoJogo <= 0) {
        terminarPartida(false);
      }
    }

    return {
      iniciar() {
        iniciarTitulo();
      },

      reiniciar() {
        iniciarJogo();
      },

      pausar() {
        timerEscada = 0;
      },

      retomar() {
        musicaTimer = 0;
      },

      atualizar(dt: number, input: InputState) {
        tempo += dt;
        flashTela = Math.max(0, flashTela - dt);

        if (estado === 'titulo') {
          if (input.acaoPressionada || input.acao2Pressionada) {
            iniciarJogo();
          }
          return;
        }

        if (estado === 'resultado') {
          if (input.acaoPressionada || input.acao2Pressionada) {
            iniciarJogo();
          }
          return;
        }

        tempoJogo = Math.max(0, tempoJogo - dt);

        if (estado === 'morrendo') {
          tempoEstado -= dt;
          particulas = atualizarParticulas(particulas, dt);

          if (tempoEstado <= 0) {
            if (vidas <= 0 || tempoJogo <= 0) {
              terminarPartida(false);
            } else {
              renascer();
            }
          }
          return;
        }

        atualizarJogando(dt, input);
      },

      desenhar(g: CanvasRenderingContext2D) {
        const telaCorrente = tela();

        desenharCenario(g, telaCorrente, tempo);
        desenharObstaculosSuperficie(g, telaCorrente, tempo);
        desenharSubsolo(g, telaCorrente, tempo);

        const tesourosVisiveis = mundo.tesouros.filter(
          (tesouro) => tesouro.tela === telaAtual && !coletados.has(tesouro.id)
        );

        desenharTesouros(g, tesourosVisiveis, tempo);
        desenharObstaculosSubsolo(g, telaCorrente, tempo);
        desenharParticulas(g, particulas);

        if (estado !== 'titulo') {
          desenharExplorador(g, ctx.sprites, jogador, tempo);
        }

        if (flashTela > 0) {
          g.save();
          g.globalAlpha = (flashTela / DURACAO_BRILHO) * 0.28;
          g.fillStyle = flashCor;
          g.fillRect(0, 0, LARGURA, ALTURA);
          g.restore();
        }

        if (estado === 'jogando' || estado === 'morrendo') {
          const hud = ctx.hud.obterEstado();
          desenharHUD(g, {
            pontuacao: hud.pontuacao,
            recorde: hud.recorde,
            vidas: hud.vidas,
            tempo: tempoJogo,
            tesouros: coletados.size,
            tela: telaAtual,
            camada,
          });
        }

        if (estado === 'titulo') {
          desenharTituloSelva(g, recorde, tempo);
        } else if (estado === 'resultado' && resultado) {
          desenharResultado(g, resultado, tempo);
        }
      },

      destruir() {
        particulas = [];
        coletados.clear();
        cipoAtual = null;
        escadaAtual = null;
        estado = 'resultado';
        tempoEstado = 0;
      },
    };
  },
};
