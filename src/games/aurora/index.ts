/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { EngineContext, GameInstance, GameModule, InputState } from '../../engine/types';
import { desenharCanhao, desenharChefe } from './arte';
import { atualizarAves, criarAve, desenharAves, dividirAve } from './aves';
import { atualizarCanhao, criarCanhao } from './canhao';
import { desenharCenario } from './cenario';
import { atualizarChefe, criarChefe } from './chefe';
import {
  ALTURA,
  BONUS_CANHAO_RESERVA,
  CORES,
  DURACAO_AVISO_CHEFE,
  DURACAO_INVULNERAVEL,
  DURACAO_TRANSICAO,
  HUD_ALTURA,
  LARGURA,
  MAX_AVES_ATIVAS,
  PONTOS_AVE,
  PONTOS_CHEFE,
  PONTOS_VIDA_EXTRA,
  VIDAS_INICIAIS,
  VIDAS_MAX,
} from './constantes';
import {
  desenharAvisoChefe,
  desenharBarraChefe,
  desenharHUDJogo,
  desenharTitulo,
  desenharTransicao,
} from './hud';
import {
  atualizarEfeitos,
  criarExplosao,
  criarFaisca,
  criarTexto,
  desenharParticulas,
  desenharTextos,
} from './particulas';
import {
  atualizarOrbes,
  atualizarTiro,
  criarTiro,
  desenharOrbes,
  desenharTiroJogador,
} from './projeteis';
import {
  ehOndaChefe,
  intervaloSpawn,
  quantidadeAves,
  sortearTipoAve,
} from './ondas';
import {
  Ave,
  Chefe,
  EstadoJogo,
  Orbe,
  Particula,
  TextoFlutuante,
  TiroJogador,
  TipoAve,
} from './tipos';

const CORES_AVE: Record<TipoAve, string> = {
  grande: '#a78bfa',
  pequena: '#c4b5fd',
  escudo: '#67e8f9',
  mergulho: '#fca5a5',
};

export const auroraGameModule: GameModule = {
  id: 'aurora',
  titulo: 'Defesa Aurora',
  descricao:
    'Proteja a base polar de aves fantasmas que se dividem e mergulham.',
  genero: 'Tiro em ondas',
  corTema: '#8B5CF6',
  largura: LARGURA,
  altura: ALTURA,
  instrucoes: {
    historia:
      'A aurora boreal cobre a última base polar habitada. Aves fantasmas descem das montanhas, se dividem em enxames e mergulham contra o canhão. Resista às ondas e derrube a Coruja Gigante a cada cinco ondas.',
    controles: [
      '◄ ► / A D / D-Pad: mover o canhão',
      'Espaço / Botão A: atirar',
      'P: pausar • R: reiniciar • M: som • ESC: voltar ao hub',
    ],
    pontos: [
      { acao: 'Ave grande', pontos: PONTOS_AVE.grande },
      { acao: 'Ave pequena', pontos: PONTOS_AVE.pequena },
      { acao: 'Ave com escudo', pontos: PONTOS_AVE.escudo },
      { acao: 'Ave em mergulho', pontos: PONTOS_AVE.mergulho },
      { acao: 'Coruja Gigante', pontos: PONTOS_CHEFE },
      { acao: 'Bônus de onda por canhão reserva', pontos: BONUS_CANHAO_RESERVA },
    ],
  },

  criar(ctx: EngineContext): GameInstance {
    let estado: EstadoJogo = 'titulo';
    let tempo = 0;
    let tempoEstado = 0;
    let onda = 1;
    let reservas = VIDAS_INICIAIS;
    let proximaVidaExtra = PONTOS_VIDA_EXTRA;
    let canhao = criarCanhao();
    let aves: Ave[] = [];
    let chefe: Chefe | null = null;
    let tiro: TiroJogador | null = null;
    let orbes: Orbe[] = [];
    let particulas: Particula[] = [];
    let textos: TextoFlutuante[] = [];
    let filaSpawn: TipoAve[] = [];
    let timerSpawn = 0;
    let invulneravel = 0;
    let tremor = 0;
    let flash = 0;
    let avisoChefe = 0;
    let bonusOnda = 0;
    let ondaAtiva = false;

    function configurarPartida(): void {
      estado = 'titulo';
      tempo = 0;
      tempoEstado = 0;
      onda = 1;
      reservas = VIDAS_INICIAIS;
      proximaVidaExtra = PONTOS_VIDA_EXTRA;
      canhao = criarCanhao();
      aves = [];
      chefe = null;
      tiro = null;
      orbes = [];
      particulas = [];
      textos = [];
      filaSpawn = [];
      timerSpawn = 0;
      invulneravel = 0;
      tremor = 0;
      flash = 0;
      avisoChefe = 0;
      bonusOnda = 0;
      ondaAtiva = false;

      ctx.hud.definirEstado({
        pontuacao: 0,
        recorde: ctx.storage.lerRecorde(ctx.id),
        vidas: reservas,
        fase: 1,
        vidasMax: VIDAS_MAX,
        bonus: 0,
      });
    }

    function concederPontos(
      valor: number,
      x?: number,
      y?: number,
      cor: string = CORES.amarelo
    ): void {
      const pontos = Math.floor(valor);
      if (pontos <= 0) return;

      ctx.hud.adicionarPontos(pontos);

      if (x !== undefined && y !== undefined) {
        criarTexto(textos, x, y, `+${pontos}`, cor);
      }

      const pontuacao = ctx.hud.obterEstado().pontuacao;
      while (pontuacao >= proximaVidaExtra) {
        proximaVidaExtra += PONTOS_VIDA_EXTRA;
        if (reservas < VIDAS_MAX) {
          reservas += 1;
          ctx.hud.definirEstado({ vidas: reservas, vidasMax: VIDAS_MAX });
          ctx.audio.tocar('item');
          criarTexto(textos, canhao.x, canhao.y - 26, '+1 CANHÃO', CORES.verde);
        }
      }
    }

    function iniciarOnda(): void {
      aves = [];
      chefe = null;
      tiro = null;
      orbes = [];
      filaSpawn = [];
      timerSpawn = 0.85;
      avisoChefe = 0;
      ondaAtiva = true;
      estado = 'jogando';

      ctx.hud.definirEstado({
        fase: onda,
        vidas: reservas,
        vidasMax: VIDAS_MAX,
        bonus: 0,
      });

      if (ehOndaChefe(onda)) {
        chefe = criarChefe(onda);
        avisoChefe = DURACAO_AVISO_CHEFE;
        ctx.audio.tocar('alerta');
        return;
      }

      const total = quantidadeAves(onda);
      for (let i = 0; i < total; i++) {
        filaSpawn.push(sortearTipoAve(onda));
      }
    }

    function comecarPartida(): void {
      configurarPartida();
      onda = 1;
      ctx.audio.ativar();
      ctx.audio.tocar('alerta');
      iniciarOnda();
    }

    function finalizarPartida(): void {
      if (estado === 'gameOver') return;
      estado = 'gameOver';
      tempoEstado = 0;
      ondaAtiva = false;
      tiro = null;
      orbes = [];
      ctx.finalizarJogo('gameOver');
    }

    function reposicionarInimigosRestantes(): void {
      let indice = 0;
      for (const ave of aves) {
        if (ave.remover) continue;
        ave.y = HUD_ALTURA + 34 + (indice % 3) * 18;
        ave.baseX = Math.max(50, Math.min(LARGURA - 50, ave.baseX));
        ave.x = ave.baseX;
        ave.mergulhando = false;
        ave.vx = 0;
        ave.vy = 0;
        ave.timerMergulho = 1.5 + Math.random() * 2;
        ave.timerTiro = 1 + Math.random() * 2;
        indice++;
      }

      if (chefe) {
        chefe.y = HUD_ALTURA + 78;
        chefe.timerTiro = 1.45;
        chefe.timerFilhote = 4.2;
      }
    }

    function sofrerDano(): void {
      if (estado !== 'jogando' || invulneravel > 0) return;

      reservas = Math.max(0, reservas - 1);
      ctx.hud.definirEstado({ vidas: reservas, vidasMax: VIDAS_MAX });
      ctx.audio.tocar('vidaPerdida');
      criarExplosao(particulas, canhao.x, canhao.y + 16, CORES.vermelho, 30, 190);
      criarExplosao(particulas, canhao.x, canhao.y + 16, CORES.amarelo, 12, 110);
      tremor = 0.85;
      flash = 0.55;

      if (reservas <= 0) {
        finalizarPartida();
        return;
      }

      invulneravel = DURACAO_INVULNERAVEL;
      canhao.x = LARGURA / 2;
      canhao.recuo = 0;
      tiro = null;
      orbes = [];
      reposicionarInimigosRestantes();
    }

    function concluirOnda(): void {
      if (!ondaAtiva) return;

      ondaAtiva = false;
      bonusOnda = BONUS_CANHAO_RESERVA * reservas;
      concederPontos(bonusOnda, LARGURA / 2, ALTURA / 2 - 24, CORES.violetaClaro);
      estado = 'transicao';
      tempoEstado = DURACAO_TRANSICAO;
      ctx.audio.tocar('vitoria');
    }

    function verificarFimOnda(): void {
      if (!ondaAtiva) return;
      if (chefe === null && filaSpawn.length === 0 && aves.length === 0) {
        concluirOnda();
      }
    }

    function atualizarSpawn(dt: number): void {
      if (!ondaAtiva || filaSpawn.length === 0) return;

      if (aves.length >= MAX_AVES_ATIVAS) {
        timerSpawn = 0.25;
        return;
      }

      timerSpawn -= dt;
      if (timerSpawn <= 0) {
        const tipo = filaSpawn.shift();
        if (tipo) {
          aves.push(criarAve(tipo, onda));
          timerSpawn = intervaloSpawn(onda);
        }
      }
    }

    function atingirAve(ave: Ave): void {
      if (ave.remover) return;

      ave.hp -= 1;
      ave.flash = 1;

      if (ave.hp > 0) {
        criarFaisca(particulas, ave.x, ave.y, CORES.ciano, 8);
        criarTexto(textos, ave.x, ave.y - 22, 'ESCUDO', CORES.ciano);
        ctx.audio.tocar('batida');
        return;
      }

      ave.remover = true;
      const pontos = PONTOS_AVE[ave.tipo];
      const cor = CORES_AVE[ave.tipo];
      concederPontos(pontos, ave.x, ave.y - 20, cor);
      criarExplosao(
        particulas,
        ave.x,
        ave.y,
        cor,
        ave.tipo === 'pequena' ? 12 : 22,
        ave.tipo === 'pequena' ? 115 : 175
      );
      ctx.audio.tocar(ave.tipo === 'pequena' ? 'rochaPequena' : 'explosao');

      if (ave.tipo !== 'pequena') {
        dividirAve(ave, aves, onda);
        ctx.audio.tocar('cristal');
        criarTexto(textos, ave.x, ave.y - 36, 'DIVIDIU', CORES.violetaClaro);
      }
    }

    function atingirChefe(): void {
      if (!chefe) return;

      chefe.hp -= 1;
      chefe.flash = 1;
      criarFaisca(particulas, chefe.x, chefe.y, '#f0abfc', 10);
      ctx.audio.tocar('batida');

      if (chefe.hp > 0) return;

      const x = chefe.x;
      const y = chefe.y;
      chefe = null;
      concederPontos(PONTOS_CHEFE, x, y - 24, CORES.amarelo);
      criarExplosao(particulas, x, y, '#f0abfc', 52, 250);
      criarExplosao(particulas, x, y, CORES.amarelo, 28, 190);
      criarTexto(textos, x, y - 46, 'CORUJA DERROTADA', CORES.amarelo);
      ctx.audio.tocar('explosaoNave');
      tremor = 1.1;
      flash = 0.7;
    }

    function atualizarTiroEColisoes(dt: number): void {
      if (!tiro) return;

      if (atualizarTiro(tiro, dt)) {
        tiro = null;
        return;
      }

      const caixaTiro = {
        x: tiro.x - 7,
        y: tiro.y - 15,
        largura: 14,
        altura: 30,
      };

      if (chefe) {
        const caixaChefe = {
          x: chefe.x - 40,
          y: chefe.y - 28,
          largura: 80,
          altura: 56,
        };
        if (ctx.colisao.retanguloRetangulo(caixaTiro, caixaChefe)) {
          tiro = null;
          atingirChefe();
          return;
        }
      }

      for (const ave of aves) {
        if (ave.remover) continue;

        const caixaAve = {
          x: ave.x - ave.largura / 2 + 4,
          y: ave.y - ave.altura / 2 + 3,
          largura: ave.largura - 8,
          altura: ave.altura - 6,
        };

        if (ctx.colisao.retanguloRetangulo(caixaTiro, caixaAve)) {
          tiro = null;
          atingirAve(ave);
          return;
        }
      }
    }

    function verificarColisoesJogador(): void {
      if (invulneravel > 0) return;

      const caixaJogador = {
        x: canhao.x - 16,
        y: canhao.y + 8,
        largura: 32,
        altura: 20,
      };

      for (const orbe of orbes) {
        if (orbe.remover) continue;
        const caixaOrbe = {
          x: orbe.x - orbe.raio,
          y: orbe.y - orbe.raio,
          largura: orbe.raio * 2,
          altura: orbe.raio * 2,
        };
        if (ctx.colisao.retanguloRetangulo(caixaJogador, caixaOrbe)) {
          orbe.remover = true;
          sofrerDano();
          return;
        }
      }

      for (const ave of aves) {
        if (ave.remover) continue;
        const caixaAve = {
          x: ave.x - ave.largura / 2 + 8,
          y: ave.y - ave.altura / 2 + 6,
          largura: ave.largura - 16,
          altura: ave.altura - 12,
        };
        if (ctx.colisao.retanguloRetangulo(caixaJogador, caixaAve)) {
          ave.remover = true;
          criarExplosao(particulas, ave.x, ave.y, CORES_AVE[ave.tipo], 18, 160);
          sofrerDano();
          return;
        }
      }
    }

    function verificarEscapes(): void {
      let escapou = false;

      for (const ave of aves) {
        if (ave.remover) continue;
        if (ave.y - ave.altura / 2 > ALTURA - 4) {
          ave.remover = true;
          escapou = true;
          criarExplosao(particulas, ave.x, ALTURA - 10, CORES.vermelho, 16, 130);
          ctx.audio.tocar('alerta');
        }
      }

      if (escapou) {
        sofrerDano();
      }
    }

    function atualizarJogo(dt: number, input: InputState): void {
      invulneravel = Math.max(0, invulneravel - dt);
      tremor = Math.max(0, tremor - dt * 2.2);
      flash = Math.max(0, flash - dt * 1.8);
      avisoChefe = Math.max(0, avisoChefe - dt);

      const resultadoCanhao = atualizarCanhao(
        canhao,
        dt,
        input,
        tiro === null,
        ctx.audio
      );

      if (resultadoCanhao.disparou) {
        tiro = criarTiro(canhao);
      }
      if (resultadoCanhao.superaqueceu) {
        criarFaisca(particulas, canhao.x, canhao.y, CORES.vermelho, 12);
        criarTexto(textos, canhao.x, canhao.y - 30, 'CALOR!', CORES.vermelho);
        tremor = Math.max(tremor, 0.2);
      }

      atualizarSpawn(dt);
      atualizarAves(
        aves,
        orbes,
        dt,
        onda,
        canhao.x,
        canhao.y + 16,
        ctx.audio
      );

      if (chefe) {
        atualizarChefe(
          chefe,
          dt,
          onda,
          orbes,
          aves,
          canhao.x,
          canhao.y + 16,
          ctx.audio
        );
      }

      atualizarOrbes(orbes, dt);
      atualizarTiroEColisoes(dt);
      verificarColisoesJogador();
      verificarEscapes();

      aves = aves.filter((ave) => !ave.remover);
      orbes = orbes.filter((orbe) => !orbe.remover);

      atualizarEfeitos(particulas, textos, dt);
      verificarFimOnda();
    }

    return {
      iniciar() {
        configurarPartida();
      },

      reiniciar() {
        comecarPartida();
      },

      pausar() {},

      retomar() {},

      atualizar(dt: number, input: InputState) {
        tempo += dt;

        if (estado === 'titulo') {
          if (input.acaoPressionada || input.acao2Pressionada) {
            comecarPartida();
          }
          return;
        }

        if (estado === 'gameOver') {
          atualizarEfeitos(particulas, textos, dt);
          if (input.acaoPressionada || input.acao2Pressionada) {
            comecarPartida();
          }
          return;
        }

        if (estado === 'transicao') {
          tempoEstado -= dt;
          atualizarEfeitos(particulas, textos, dt);
          if (tempoEstado <= 0) {
            onda += 1;
            iniciarOnda();
          }
          return;
        }

        atualizarJogo(dt, input);
      },

      desenhar(g: CanvasRenderingContext2D) {
        desenharCenario(g, tempo);

        g.save();
        if (tremor > 0.01) {
          const forca = tremor * 5;
          g.translate(
            Math.sin(tempo * 91) * forca,
            Math.cos(tempo * 73) * forca
          );
        }

        if (estado === 'titulo') {
          desenharCanhao(g, ctx.sprites, canhao, tempo, 0);
          g.restore();
          desenharTitulo(g, ctx.hud.obterEstado().recorde, tempo);
          return;
        }

        if (tiro) desenharTiroJogador(g, ctx.sprites, tiro);
        desenharOrbes(g, ctx.sprites, orbes);
        desenharAves(g, ctx.sprites, aves, tempo);
        if (chefe) desenharChefe(g, ctx.sprites, chefe, tempo);
        desenharParticulas(g, particulas);
        desenharTextos(g, textos);
        desenharCanhao(g, ctx.sprites, canhao, tempo, invulneravel);

        g.restore();

        if (flash > 0) {
          g.fillStyle = `rgba(248,113,113,${flash * 0.45})`;
          g.fillRect(0, 0, LARGURA, ALTURA);
        }

        desenharHUDJogo(
          g,
          ctx.hud,
          ctx.sprites,
          onda,
          reservas,
          canhao.calor,
          canhao.travado
        );

        if (chefe && estado !== 'gameOver') {
          desenharBarraChefe(g, chefe);
        }

        if (avisoChefe > 0 && estado === 'jogando') {
          desenharAvisoChefe(g, onda, tempo);
        }

        if (estado === 'transicao') {
          desenharTransicao(g, onda, bonusOnda, tempoEstado, tempo);
        }

        if (estado === 'gameOver') {
          ctx.hud.desenharGameOver(
            g,
            LARGURA,
            ALTURA,
            'PRESSIONE AÇÃO / TOQUE'
          );
        }
      },

      destruir() {
        aves = [];
        orbes = [];
        particulas = [];
        textos = [];
        filaSpawn = [];
        chefe = null;
        tiro = null;
      },
    };
  },
};
