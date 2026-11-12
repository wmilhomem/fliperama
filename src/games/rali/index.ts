/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { EngineContext, GameInstance, GameModule, InputState } from '../../engine/types';
import {
  ACELERACAO,
  ALTURA,
  ARRASTO,
  BONUS_CARRO_EXTRA,
  BONUS_DIA_BASE,
  BONUS_DIA_INCREMENTO,
  BONUS_VELOCIDADE_DIVISOR,
  CORES_TRAFEGO,
  DISTANCIA_COLISAO,
  DISTANCIA_LATERAL_COLISAO,
  DURACAO_DIA,
  DURACAO_SEM_COLISAO,
  DURACAO_TRANSICAO,
  FAIXAS,
  FAIXAS_X,
  FREIO,
  INTERVALO_SPAWN_MAX,
  INTERVALO_SPAWN_MIN,
  LARGURA,
  MAX_TRAFEGO,
  MAX_TRAFEGO_EXTRA,
  MULT_OFFROAD,
  OFFROAD_LIMITE,
  PENALIDADE_CARROS,
  PONTOS_ULTRAPASSAGEM,
  SPAWN_MAX,
  SPAWN_MIN,
  SPAWN_REMOCAO,
  VELOCIDADE_MAX,
  VELOCIDADE_MAX_KMH,
  VELOCIDADE_TRAFEGO_MAX,
  VELOCIDADE_TRAFEGO_MIN,
} from './constantes';
import { alvoDoDia, fatorNoite } from './ciclo';
import { atualizarJogador, criarJogador, desenharFarois, desenharJogador } from './carro';
import { criarCenario, desenharFundo } from './cenario';
import {
  atualizarClima,
  climaDoDia,
  criarSistemaClima,
  desenharClima,
} from './clima';
import { criarEstrada, desenharPista, projetarEstrada } from './estrada';
import {
  desenharHUD,
  desenharResultadoFinal,
  desenharTituloRali,
  desenharTransicaoDia,
} from './hud';
import {
  atualizarParticulas,
  criarExplosao,
  criarPoeira,
  desenharParticulas,
} from './particulas';
import { clamp, criarRng } from './semente';
import { atualizarTrafego, criarTrafego } from './trafego';
import {
  CenarioFundo,
  EstadoJogo,
  Estrada,
  Jogador,
  Particula,
  ResultadoPartida,
  SistemaClima,
  Trafego,
} from './tipos';

const NENHUM_TRAFEGO: Trafego[] = [];

export const raliGameModule: GameModule = {
  id: 'rali',
  titulo: 'Rali Estrada Sem Fim',
  descricao:
    'Ultrapasse os carros, enfrente chuva, neblina e noite, e cumpra a meta de cada dia.',
  genero: 'Corrida',
  corTema: '#F97316',
  largura: LARGURA,
  altura: ALTURA,
  instrucoes: {
    historia:
      'Você pilota um carro de rali em uma estrada interminável. Cada dia tem 90 segundos e uma meta de ultrapassagens. Sobreviva ao tráfego, ao mau tempo e à escuridão para chegar o mais longe possível.',
    controles: [
      '◄ ► / A D / D-Pad: desviar',
      '▲ / W / Espaço / Botão A: acelerar',
      '▼ / S / D-Pad baixo: frear',
      'P: pausar • R: reiniciar • M: som • ESC: voltar ao hub',
    ],
    pontos: [
      { acao: 'Ultrapassagem (bônus extra por velocidade)', pontos: 10 },
      { acao: 'Carro extra depois de bater a meta', pontos: 50 },
      { acao: 'Bônus de fim de dia (aumenta a cada dia)', pontos: 1000 },
    ],
  },

  criar(ctx: EngineContext): GameInstance {
    let estado: EstadoJogo = 'titulo';
    let tempo = 0;
    let tempoEstado = 0;
    let sementePartida = (Math.random() * 0xffffffff) >>> 0;
    let estrada: Estrada = criarEstrada(sementePartida);
    let cenario: CenarioFundo = criarCenario(sementePartida);
    let clima: SistemaClima = criarSistemaClima(1, sementePartida);
    let jogador: Jogador = criarJogador();
    let trafego: Trafego[] = [];
    let particulas: Particula[] = [];
    let rng = criarRng(sementePartida);
    let posicao = 0;
    let velocidade = 0;
    let dia = 1;
    let meta = alvoDoDia(1);
    let tempoDia = DURACAO_DIA;
    let carrosPassados = 0;
    let pontuacao = 0;
    let recorde = ctx.storage.lerRecorde(ctx.id);
    let timerSpawn = 0;
    let timerMotor = 0;
    let timerAviso = 0;
    let tempoSemColisao = 0;
    let tremor = 0;
    let flash = 0;
    let bonusDia = 0;
    let noite = fatorNoite(1, DURACAO_DIA);
    let resultado: ResultadoPartida | null = null;

    function velocidadeEmKmh(): number {
      return (velocidade / VELOCIDADE_MAX) * VELOCIDADE_MAX_KMH;
    }

    function visibilidadeAtual(): number {
      return clima.visibilidade * (1 - noite * 0.14);
    }

    function maxTrafego(): number {
      return MAX_TRAFEGO + Math.min(MAX_TRAFEGO_EXTRA, Math.max(0, dia - 1) * 5);
    }

    function intervaloAtual(): number {
      const reducao = Math.min(0.08, Math.max(0, dia - 1) * 0.02);
      return Math.max(
        0.2,
        INTERVALO_SPAWN_MIN - reducao + rng() * (INTERVALO_SPAWN_MAX - INTERVALO_SPAWN_MIN)
      );
    }

    function concederPontos(pontos: number): void {
      const valor = Math.floor(pontos);
      pontuacao += valor;
      if (pontuacao > recorde) recorde = pontuacao;
      ctx.hud.adicionarPontos(valor);
    }

    function configurarPartida(semente: number): void {
      sementePartida = semente >>> 0;
      const sementeDia = (sementePartida + 0x9e3779b9) >>> 0;

      estado = 'titulo';
      tempo = 0;
      tempoEstado = 0;
      dia = 1;
      meta = alvoDoDia(1);
      tempoDia = DURACAO_DIA;
      carrosPassados = 0;
      pontuacao = 0;
      recorde = ctx.storage.lerRecorde(ctx.id);
      posicao = 0;
      velocidade = 0;
      jogador = criarJogador();
      trafego = [];
      particulas = [];
      rng = criarRng(sementeDia);
      estrada = criarEstrada(sementeDia);
      cenario = criarCenario(sementeDia);
      clima = criarSistemaClima(1, sementeDia);
      timerSpawn = 0.25;
      timerMotor = 0;
      timerAviso = 0;
      tempoSemColisao = 0;
      tremor = 0;
      flash = 0;
      bonusDia = 0;
      noite = fatorNoite(1, DURACAO_DIA);
      resultado = null;

      ctx.hud.definirEstado({
        pontuacao: 0,
        recorde,
        vidas: 3,
        fase: 1,
        vidasMax: 3,
        bonus: 0,
      });
    }

    function comecarPartida(): void {
      configurarPartida((Math.random() * 0xffffffff) >>> 0);
      estado = 'jogando';
      velocidade = VELOCIDADE_MAX * 0.36;
      ctx.audio.ativar();
    }

    function iniciarDia(novoDia: number): void {
      dia = novoDia;
      meta = alvoDoDia(novoDia);
      tempoDia = DURACAO_DIA;
      carrosPassados = 0;
      posicao = 0;
      velocidade = VELOCIDADE_MAX * 0.36;
      jogador = criarJogador();
      trafego = [];
      particulas = [];
      const sementeDia = (sementePartida + novoDia * 0x9e3779b9) >>> 0;
      rng = criarRng(sementeDia);
      estrada = criarEstrada(sementeDia);
      cenario = criarCenario(sementeDia);
      clima = criarSistemaClima(novoDia, sementeDia);
      timerSpawn = 0.2;
      timerMotor = 0;
      timerAviso = 0;
      tempoSemColisao = 0;
      tremor = 0;
      flash = 0;
      bonusDia = 0;
      tempoEstado = 0;
      noite = fatorNoite(novoDia, DURACAO_DIA);
      estado = 'jogando';
      ctx.hud.definirEstado({ fase: novoDia });
    }

    function finalizarPartida(): void {
      if (estado === 'resultado') return;

      estado = 'resultado';
      tempoEstado = 0;
      resultado = {
        dia,
        pontuacao,
        recorde,
        carros: carrosPassados,
        meta,
      };
      ctx.finalizarJogo('gameOver');
    }

    function encerrarDia(): void {
      if (estado !== 'jogando') return;

      if (carrosPassados >= meta) {
        bonusDia = BONUS_DIA_BASE + BONUS_DIA_INCREMENTO * (dia - 1);
        concederPontos(bonusDia);
        velocidade = 0;
        timerMotor = 0;
        estado = 'transicao';
        tempoEstado = DURACAO_TRANSICAO;
        ctx.audio.tocar('vitoria');
      } else {
        finalizarPartida();
      }
    }

    function registrarUltrapassagem(): void {
      carrosPassados += 1;
      const bonusVelocidade = Math.floor(velocidadeEmKmh() / BONUS_VELOCIDADE_DIVISOR);
      concederPontos(PONTOS_ULTRAPASSAGEM + bonusVelocidade);

      if (carrosPassados > meta) {
        concederPontos(BONUS_CARRO_EXTRA);
      }

      if (carrosPassados === meta) {
        ctx.audio.tocar('vitoria');
      } else {
        ctx.audio.tocar(carrosPassados % 6 === 0 ? 'item' : 'moeda');
      }
    }

    function sortearTrafego(): void {
      if (trafego.length >= maxTrafego()) return;

      let faixa = Math.floor(rng() * FAIXAS);
      let z = SPAWN_MIN + rng() * (SPAWN_MAX - SPAWN_MIN);

      for (let tentativa = 0; tentativa < 5; tentativa++) {
        let conflito = false;

        for (const carro of trafego) {
          if (carro.faixa === faixa && Math.abs(carro.zRelativo - z) < 2300) {
            conflito = true;
            break;
          }
        }

        if (!conflito) break;
        faixa = (faixa + 1) % FAIXAS;
        z += 3200;
      }

      if (Math.abs(FAIXAS_X[faixa] - jogador.x) < 0.26 && z < 24000) {
        z += 5200;
      }

      const cor = CORES_TRAFEGO[Math.floor(rng() * CORES_TRAFEGO.length)];
      const velocidadeCarro =
        VELOCIDADE_TRAFEGO_MIN + rng() * (VELOCIDADE_TRAFEGO_MAX - VELOCIDADE_TRAFEGO_MIN);

      trafego.push(criarTrafego(z, faixa, velocidadeCarro, cor));
    }

    function detectarColisao(): void {
      if (tempoSemColisao > 0) return;

      for (let i = trafego.length - 1; i >= 0; i--) {
        const carro = trafego[i];

        if (carro.ultrapassado) continue;
        if (Math.abs(carro.zRelativo) > DISTANCIA_COLISAO) continue;
        if (Math.abs(jogador.x - FAIXAS_X[carro.faixa]) > DISTANCIA_LATERAL_COLISAO) continue;

        trafego.splice(i, 1);
        velocidade *= 0.52;
        jogador.velocidadeLateral *= -0.35;
        carrosPassados = Math.max(0, carrosPassados - PENALIDADE_CARROS);
        tempoSemColisao = DURACAO_SEM_COLISAO;
        tremor = 0.55;
        flash = 0.3;

        const xColisao = LARGURA / 2 + (FAIXAS_X[carro.faixa] - jogador.x) * 120;
        criarExplosao(particulas, xColisao, ALTURA - 120, carro.cor, 18, 170);
        criarExplosao(particulas, xColisao, ALTURA - 120, '#FDE68A', 8, 120);
        ctx.audio.tocar('batida');
        break;
      }
    }

    function atualizarJogo(dt: number, input: InputState): void {
      noite = fatorNoite(dia, tempoDia);
      tempoDia = Math.max(0, tempoDia - dt);

      const offroadAntes = Math.abs(jogador.x) > OFFROAD_LIMITE;
      atualizarJogador(
        jogador,
        dt,
        input,
        clima.aderencia,
        velocidade / VELOCIDADE_MAX,
        offroadAntes
      );
      const offroad = Math.abs(jogador.x) > OFFROAD_LIMITE;

      let limite = VELOCIDADE_MAX;
      if (clima.tipo === 'chuva') limite *= 0.94;
      else if (clima.tipo === 'neblina') limite *= 0.86;
      else if (clima.tipo === 'gelo') limite *= 0.9;
      if (offroad) limite *= MULT_OFFROAD;

      const acelerando = input.cima || input.acao;
      if (acelerando) {
        velocidade +=
          ACELERACAO * (0.42 + 0.58 * (1 - Math.min(1, velocidade / limite))) * dt;
      } else if (input.baixo) {
        velocidade -= FREIO * dt;
      } else {
        velocidade -= ARRASTO * dt;
      }

      if (velocidade > limite) {
        velocidade = Math.max(limite, velocidade - FREIO * 0.8 * dt);
      }

      velocidade = clamp(velocidade, 0, VELOCIDADE_MAX);
      posicao += velocidade * dt;

      atualizarClima(clima, dt, velocidade);

      timerSpawn -= dt;
      if (timerSpawn <= 0) {
        sortearTrafego();
        timerSpawn = intervaloAtual();
      }

      for (const carro of trafego) {
        atualizarTrafego(carro, dt, velocidade);
      }

      detectarColisao();

      for (let i = trafego.length - 1; i >= 0; i--) {
        const carro = trafego[i];

        if (!carro.ultrapassado && carro.zRelativo < -220) {
          carro.ultrapassado = true;
          registrarUltrapassagem();
        }

        if (carro.zRelativo < -320 || carro.zRelativo > SPAWN_REMOCAO) {
          trafego.splice(i, 1);
        }
      }

      atualizarParticulas(particulas, dt);

      if (offroad && velocidade > 500) {
        timerAviso -= dt;

        if (timerAviso <= 0) {
          ctx.audio.tocar('alerta');
          timerAviso = 1.15;
          criarPoeira(
            particulas,
            LARGURA / 2 + jogador.x * 26,
            ALTURA - 58,
            clima.tipo === 'gelo' ? '#E2E8F0' : '#A16207'
          );
        }
      } else {
        timerAviso = 0;
      }

      timerMotor -= dt;
      if (timerMotor <= 0 && velocidade > 500) {
        const normalizada = velocidade / VELOCIDADE_MAX;
        ctx.audio.tocarTom(58 + normalizada * 42, 'sawtooth', 0.06, 0.035);
        timerMotor = 0.19;
      }

      tempoSemColisao = Math.max(0, tempoSemColisao - dt);
      tremor = Math.max(0, tremor - dt * 2.4);
      flash = Math.max(0, flash - dt * 1.8);

      if (tempoDia <= 0) {
        encerrarDia();
      }
    }

    return {
      iniciar() {
        configurarPartida((Math.random() * 0xffffffff) >>> 0);
        estado = 'titulo';
      },

      reiniciar() {
        comecarPartida();
      },

      pausar() {
        timerMotor = 0;
      },

      retomar() {
        timerMotor = 0;
      },

      atualizar(dt: number, input: InputState) {
        tempo += dt;

        if (estado === 'titulo') {
          if (input.acaoPressionada || input.acao2Pressionada || input.cimaPressionada) {
            comecarPartida();
          }
          return;
        }

        if (estado === 'resultado') {
          if (input.acaoPressionada || input.acao2Pressionada || input.cimaPressionada) {
            comecarPartida();
          }
          return;
        }

        if (estado === 'transicao') {
          tempoEstado -= dt;

          if (tempoEstado <= 0) {
            iniciarDia(dia + 1);
          }
          return;
        }

        atualizarJogo(dt, input);
      },

      desenhar(g: CanvasRenderingContext2D) {
        const noiteVisual = estado === 'titulo' ? fatorNoite(1, DURACAO_DIA) : noite;
        const posicaoVisual = estado === 'titulo' ? tempo * 620 : posicao;
        const jogadorVisual = estado === 'titulo' ? 0 : jogador.x;
        const visibilidade = estado === 'titulo' ? 1 : visibilidadeAtual();
        const projecao = projetarEstrada(estrada, posicaoVisual, jogadorVisual, visibilidade);
        const trafegoVisual = estado === 'titulo' ? NENHUM_TRAFEGO : trafego;

        g.save();

        if (tremor > 0.01) {
          const forca = tremor * 5;
          g.translate(Math.sin(tempo * 91) * forca, Math.cos(tempo * 73) * forca);
        }

        desenharFundo(
          g,
          cenario,
          posicaoVisual,
          jogadorVisual,
          tempo,
          noiteVisual,
          clima.tipo
        );
        desenharPista(
          g,
          estrada,
          projecao,
          trafegoVisual,
          tempo,
          noiteVisual,
          clima.tipo
        );

        if (noiteVisual > 0.2) {
          desenharFarois(g, noiteVisual);
        }

        desenharJogador(g, jogador, tempo, noiteVisual);
        desenharParticulas(g, particulas);

        if (noiteVisual > 0.02) {
          g.fillStyle = `rgba(2,6,23,${noiteVisual * 0.42})`;
          g.fillRect(0, 0, LARGURA, ALTURA);
        }

        desenharClima(g, clima, noiteVisual);

        if (flash > 0) {
          g.fillStyle = `rgba(239,68,68,${flash * 0.5})`;
          g.fillRect(0, 0, LARGURA, ALTURA);
        }

        g.restore();

        if (estado === 'titulo') {
          desenharTituloRali(g, recorde, tempo);
          return;
        }

        desenharHUD(g, {
          pontuacao,
          recorde,
          dia,
          meta,
          carros: carrosPassados,
          tempoDia,
          velocidadeKmh: velocidadeEmKmh(),
          clima: clima.tipo,
          noite,
        });

        if (estado === 'transicao') {
          desenharTransicaoDia(
            g,
            dia,
            carrosPassados,
            meta,
            bonusDia,
            climaDoDia(dia + 1),
            tempoEstado,
            tempo
          );
          return;
        }

        if (estado === 'resultado' && resultado) {
          desenharResultadoFinal(g, resultado, tempo);
        }
      },

      destruir() {
        trafego = [];
        particulas = [];
      },
    };
  },
};
