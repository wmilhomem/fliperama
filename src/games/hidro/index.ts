/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { EngineContext, GameInstance, GameModule, InputState } from '../../engine/types';
import {
  ALTURA,
  ALERTA_COMBUSTIVEL,
  AUMENTO_SCROLL_SECAO,
  DURACAO_INVULNERAVEL,
  DURACAO_MORTE,
  DURACAO_TRANSICAO,
  FUEL_MAX,
  INTERVALO_VIDA_EXTRA,
  LARGURA,
  MAX_TIROS_JOGADOR,
  MULT_ACELERANDO,
  MULT_DESACELERANDO,
  PONTOS_BARREIRA,
  PONTOS_TANQUE,
  RECARGA_TIRO,
  VELOCIDADE_SCROLL_BASE,
  VELOCIDADE_SCROLL_MAXIMA,
  VIDAS_INICIAIS,
  VIDAS_MAXIMAS,
  Y_NAVE,
} from './constantes';
import {
  atualizarBarreira,
  barreiraPodeAtirar,
  criarBarreira,
  retanguloBarreira,
} from './barreira';
import { criarCenario } from './cenario';
import {
  atualizarTanques,
  criarTanque,
  drenarCombustivel,
  transferirCombustivel,
} from './combustivel';
import { atualizarAgenda, criarAgenda } from './eventos';
import {
  atualizarInimigo,
  criarInimigo,
  escolherTipoInimigo,
  inimigoForaDaTela,
} from './inimigos';
import { criarNave, atualizarNave } from './nave';
import { criarObstaculo, atualizarObstaculos } from './obstaculos';
import { atualizarParticulas, criarExplosao, criarRespingo } from './particulas';
import { desenharAviso, desenharAvisoNave, desenharBarreira, desenharCombustivel, desenharDecoracoes, desenharInimigos, desenharNave, desenharObstaculos, desenharParticulas, desenharRio, desenharTanques, desenharTiros, desenharTitulo } from './render';
import { criarSecao, limitarXNaSecao, xNavegavel } from './rio';
import { RNG, criarRng } from './semente';
import { criarTiroInimigo, criarTiroJogador, atualizarTiros } from './tiros';
import {
  Agenda,
  Barreira,
  Decoracao,
  Inimigo,
  Nave,
  Obstaculo,
  Particula,
  SecaoRio,
  Tanque,
  Tiro,
} from './tipos';

type EstadoJogo = 'titulo' | 'jogando' | 'morrendo' | 'transicao' | 'gameover';

export const hidroGameModule: GameModule = {
  id: 'hidro',
  titulo: 'Hidro Rio Abaixo',
  descricao: 'Voe sobre o rio, destrua barreiras e abasteça antes que acabe o combustível.',
  genero: 'Tiro vertical',
  corTema: '#14B8A6',
  largura: 224,
  altura: 256,
  instrucoes: {
    historia:
      'Você pilota um hidroavião pelos rios da floresta. Desvie das margens, das pedras e dos troncos, enfrente lanchas, helicópteros e drones, e destrua a barreira ao fim de cada trecho. Fique de olho no combustível: tanques flutuantes podem salvar a viagem.',
    controles: [
      '◄ ► / A D / D-Pad: desviar entre as margens',
      '▲ / W / D-Pad cima: acelerar (gasta mais combustível)',
      '▼ / S / D-Pad baixo: desacelerar (economiza combustível)',
      'Espaço / Z / Botão A: atirar (até 2 tiros simultâneos)',
      'P: pausar • R: reiniciar • M: som • ESC: voltar ao hub',
    ],
    pontos: [
      { acao: 'Lancha destruída', pontos: 30 },
      { acao: 'Barco-patrulha destruído', pontos: 60 },
      { acao: 'Helicóptero destruído', pontos: 100 },
      { acao: 'Drone destruído', pontos: 120 },
      { acao: 'Garça abatida', pontos: 20 },
      { acao: 'Tanque de combustível destruído', pontos: 80 },
      { acao: 'Barreira destruída', pontos: PONTOS_BARREIRA },
      { acao: 'Vida extra a cada 10.000 pontos', pontos: 1 },
    ],
  },

  criar(ctx: EngineContext): GameInstance {
    let estado: EstadoJogo = 'titulo';
    let tempo = 0;
    let timerEstado = 0;
    let sementePartida = (Math.random() * 0xffffffff) >>> 0;

    let secaoNumero = 1;
    let secaoRio: SecaoRio = criarSecao(secaoNumero, sementePartida);
    let cenario: Decoracao[] = criarCenario(secaoRio, sementePartida);
    let rngSpawn: RNG = criarRng(sementePartida + 1);
    let progresso = 0;
    let combustivel = FUEL_MAX;
    let vidas = VIDAS_INICIAIS;
    let proximaVidaExtra = INTERVALO_VIDA_EXTRA;
    let recorde = ctx.storage.lerRecorde(ctx.id);
    let idEntidade = 1;

    let nave: Nave = criarNave(secaoRio);
    let barreira: Barreira = criarBarreira(secaoRio);
    let agenda: Agenda = criarAgenda();

    let tiros: Tiro[] = [];
    let inimigos: Inimigo[] = [];
    let obstaculos: Obstaculo[] = [];
    let tanques: Tanque[] = [];
    let particulas: Particula[] = [];

    let timerAlerta = 0;
    let timerMotor = 0;
    let timerSomAbastecer = 0;

    function proximoId(): number {
      return idEntidade++;
    }

    function limparEntidades(): void {
      tiros = [];
      inimigos = [];
      obstaculos = [];
      tanques = [];
      particulas = [];
    }

    function pontuar(pontos: number, x?: number, y?: number, cor?: string): void {
      ctx.hud.adicionarPontos(pontos, x, y, cor);
      const total = ctx.hud.obterEstado().pontuacao;

      while (total >= proximaVidaExtra) {
        vidas = ctx.hud.ganharVida();
        proximaVidaExtra += INTERVALO_VIDA_EXTRA;
        ctx.audio.tocar('item');
      }
    }

    function iniciarSecao(numero: number): void {
      secaoNumero = numero;
      secaoRio = criarSecao(numero, sementePartida);
      cenario = criarCenario(secaoRio, sementePartida);
      rngSpawn = criarRng(sementePartida + numero * 104729);
      progresso = 0;
      combustivel = FUEL_MAX;
      barreira = criarBarreira(secaoRio);
      agenda = criarAgenda();
      nave = criarNave(secaoRio);
      limparEntidades();
      timerAlerta = 0;
      timerMotor = 0;
      timerSomAbastecer = 0;
      ctx.hud.definirEstado({ fase: numero });
    }

    function comecarPartida(): void {
      sementePartida = (Math.random() * 0xffffffff) >>> 0;
      vidas = VIDAS_INICIAIS;
      proximaVidaExtra = INTERVALO_VIDA_EXTRA;
      recorde = ctx.storage.lerRecorde(ctx.id);

      ctx.hud.definirEstado({
        pontuacao: 0,
        recorde,
        vidas,
        fase: 1,
        vidasMax: VIDAS_MAXIMAS,
      });

      iniciarSecao(1);
      estado = 'jogando';
      timerEstado = 0;
      timerAlerta = 0;
      timerMotor = 0;
      timerSomAbastecer = 0;
    }

    function destruirNave(motivo: 'colisao' | 'combustivel'): void {
      if (estado !== 'jogando') return;

      estado = 'morrendo';
      timerEstado = DURACAO_MORTE;
      timerMotor = 0;

      criarExplosao(particulas, nave.x, nave.y, '#67E8F9', 34, 175);
      criarExplosao(particulas, nave.x, nave.y, '#FFFFFF', 14, 120);
      criarRespingo(particulas, nave.x, nave.y + 8, '#BAE6FD');

      ctx.audio.tocar(motivo === 'combustivel' ? 'vidaPerdida' : 'explosaoNave');
      vidas = ctx.hud.perderVida();
    }

    function concluirSecao(): void {
      if (estado !== 'jogando') return;

      barreira.hp = 0;
      estado = 'transicao';
      timerEstado = DURACAO_TRANSICAO;
      timerMotor = 0;

      pontuar(PONTOS_BARREIRA, barreira.x, barreira.y, '#FACC15');
      ctx.audio.tocar('vitoria');

      criarExplosao(particulas, barreira.x, barreira.y, '#F59E0B', 40, 170);
      criarExplosao(particulas, barreira.x, barreira.y, '#FEF3C7', 18, 110);
      criarExplosao(particulas, barreira.x - barreira.largura / 3, barreira.y, '#F97316', 20, 140);
      criarExplosao(particulas, barreira.x + barreira.largura / 3, barreira.y, '#F97316', 20, 140);
    }

    function velocidadeScroll(): number {
      let velocidade = Math.min(
        VELOCIDADE_SCROLL_MAXIMA,
        VELOCIDADE_SCROLL_BASE + (secaoNumero - 1) * AUMENTO_SCROLL_SECAO
      );

      if (nave.acelerando) velocidade *= MULT_ACELERANDO;
      else if (nave.desacelerando) velocidade *= MULT_DESACELERANDO;

      return velocidade;
    }

    function atirar(): void {
      if (nave.timerTiro > 0) return;

      const tirosJogador = tiros.reduce(
        (total, tiro) => total + (tiro.origem === 'jogador' ? 1 : 0),
        0
      );

      if (tirosJogador >= MAX_TIROS_JOGADOR) return;

      tiros.push(criarTiroJogador(nave, proximoId()));
      nave.timerTiro = RECARGA_TIRO;
      ctx.audio.tocar('tiro');
    }

    function posicaoSpawn(): number {
      return progresso + Y_NAVE + 46;
    }

    function sortearInimigo(): void {
      if (inimigos.length >= 9) return;

      const d = posicaoSpawn();
      const tipo = escolherTipoInimigo(secaoNumero, rngSpawn);
      let x: number;

      if (tipo === 'garca') {
        x = rngSpawn() < 0.5 ? -10 : LARGURA + 10;
      } else {
        x = xNavegavel(secaoRio, d, rngSpawn, 11);
      }

      inimigos.push(criarInimigo(tipo, x, d, proximoId(), rngSpawn));
    }

    function sortearObstaculo(): void {
      if (obstaculos.length >= 10) return;

      const d = posicaoSpawn();
      const tipo = rngSpawn() < 0.58 ? 'tronco' : 'pedra';
      const x = xNavegavel(secaoRio, d, rngSpawn, 11);

      obstaculos.push(criarObstaculo(tipo, x, d, proximoId()));
    }

    function sortearTanque(): void {
      if (tanques.length >= 2) return;

      const d = posicaoSpawn();
      const x = xNavegavel(secaoRio, d, rngSpawn, 12);

      tanques.push(criarTanque(x, d, proximoId()));
    }

    function atualizarTiroBarreira(dt: number): void {
      if (!barreiraPodeAtirar(barreira)) return;

      barreira.timerTiro -= dt;

      if (barreira.timerTiro > 0) return;

      barreira.timerTiro = Math.max(1.15, 2.6 - secaoNumero * 0.12);

      const portas = [-0.3, 0, 0.3];
      const porta = portas[Math.floor(Math.random() * portas.length)];
      const x = barreira.x + barreira.largura * porta;
      const angulo =
        Math.atan2(nave.y - barreira.y, nave.x - x) + (Math.random() - 0.5) * 0.18;

      tiros.push(
        criarTiroInimigo(
          x,
          barreira.y + 8,
          angulo,
          88 + Math.min(30, secaoNumero * 3),
          proximoId()
        )
      );
      ctx.audio.tocar('tiro');
    }

    function processarColisoes(dt: number): void {
      for (let i = tiros.length - 1; i >= 0; i--) {
        const tiro = tiros[i];
        if (tiro.origem !== 'jogador') continue;

        if (barreira.hp > 0 && ctx.colisao.circuloRetangulo(tiro, retanguloBarreira(barreira))) {
          tiros.splice(i, 1);
          barreira.hp = Math.max(0, barreira.hp - tiro.dano);
          criarExplosao(particulas, tiro.x, tiro.y, '#FDE68A', 6, 55);
          ctx.audio.tocar('batida');

          if (barreira.hp <= 0) {
            concluirSecao();
            return;
          }

          continue;
        }

        let indiceInimigo = -1;

        for (let j = inimigos.length - 1; j >= 0; j--) {
          if (ctx.colisao.circuloCirculo(tiro, inimigos[j])) {
            indiceInimigo = j;
            break;
          }
        }

        if (indiceInimigo >= 0) {
          const inimigo = inimigos[indiceInimigo];
          tiros.splice(i, 1);
          inimigo.hp -= 1;

          if (inimigo.hp <= 0) {
            inimigos.splice(indiceInimigo, 1);
            pontuar(inimigo.pontos, inimigo.x, inimigo.y, '#FDE68A');
            ctx.audio.tocar('explosao');
            criarExplosao(particulas, inimigo.x, inimigo.y, '#FCA5A5', 20, 110);
          } else {
            criarExplosao(particulas, tiro.x, tiro.y, '#FDE68A', 5, 50);
            ctx.audio.tocar('batida');
          }

          continue;
        }

        let indiceObstaculo = -1;

        for (let j = obstaculos.length - 1; j >= 0; j--) {
          if (ctx.colisao.circuloCirculo(tiro, obstaculos[j])) {
            indiceObstaculo = j;
            break;
          }
        }

        if (indiceObstaculo >= 0) {
          tiros.splice(i, 1);
          criarExplosao(particulas, tiro.x, tiro.y, '#CBD5E1', 5, 50);
          ctx.audio.tocar('rochaPequena');
          continue;
        }

        let indiceTanque = -1;

        for (let j = tanques.length - 1; j >= 0; j--) {
          if (ctx.colisao.circuloCirculo(tiro, tanques[j])) {
            indiceTanque = j;
            break;
          }
        }

        if (indiceTanque >= 0) {
          const tanque = tanques[indiceTanque];
          tiros.splice(i, 1);
          tanques.splice(indiceTanque, 1);
          pontuar(PONTOS_TANQUE, tanque.x, tanque.y, '#FDE68A');
          ctx.audio.tocar('explosao');
          criarExplosao(particulas, tanque.x, tanque.y, '#FACC15', 18, 100);
        }
      }

      for (let i = tanques.length - 1; i >= 0; i--) {
        const tanque = tanques[i];

        if (
          !ctx.colisao.circuloCirculo(
            { x: nave.x, y: nave.y, raio: nave.raio + 4 },
            tanque
          )
        ) {
          continue;
        }

        const antes = combustivel;
        combustivel = transferirCombustivel(combustivel, tanque, dt);

        if (combustivel > antes) {
          timerSomAbastecer -= dt;

          if (timerSomAbastecer <= 0) {
            ctx.audio.tocar('abastecer');
            timerSomAbastecer = 0.45;
          }
        }

        if (tanque.restante <= 0) {
          tanques.splice(i, 1);
          criarExplosao(particulas, tanque.x, tanque.y, '#FDE68A', 7, 55);
        }
      }

      if (nave.invulneravel > 0 || estado !== 'jogando') return;

      for (let i = tiros.length - 1; i >= 0; i--) {
        const tiro = tiros[i];
        if (tiro.origem !== 'inimigo') continue;

        if (ctx.colisao.circuloCirculo(nave, tiro)) {
          tiros.splice(i, 1);
          destruirNave('colisao');
          return;
        }
      }

      for (let i = inimigos.length - 1; i >= 0; i--) {
        const inimigo = inimigos[i];

        if (ctx.colisao.circuloCirculo(nave, inimigo)) {
          criarExplosao(particulas, inimigo.x, inimigo.y, '#FCA5A5', 16, 105);
          inimigos.splice(i, 1);
          destruirNave('colisao');
          return;
        }
      }

      for (const obstaculo of obstaculos) {
        if (ctx.colisao.circuloCirculo(nave, obstaculo)) {
          criarExplosao(particulas, obstaculo.x, obstaculo.y, '#CBD5E1', 14, 90);
          destruirNave('colisao');
          return;
        }
      }
    }

    function atualizarJogando(dt: number, input: InputState): void {
      atualizarNave(nave, dt, input, secaoRio, progresso);

      progresso += velocidadeScroll() * dt;
      nave.x = limitarXNaSecao(secaoRio, progresso, nave.x, nave.raio + 1);

      combustivel = drenarCombustivel(
        combustivel,
        dt,
        nave.acelerando,
        nave.desacelerando
      );

      if (combustivel <= 0) {
        combustivel = 0;
        destruirNave('combustivel');
        return;
      }

      if (input.acao) atirar();

      atualizarBarreira(barreira, secaoRio, progresso);

      for (const evento of atualizarAgenda(agenda, dt, secaoNumero)) {
        if (evento === 'inimigo') sortearInimigo();
        else if (evento === 'obstaculo') sortearObstaculo();
        else sortearTanque();
      }

      atualizarTiroBarreira(dt);

      for (const inimigo of inimigos) {
        const disparo = atualizarInimigo(inimigo, dt, progresso, nave, secaoRio);

        if (disparo) {
          tiros.push(
            criarTiroInimigo(
              disparo.x,
              disparo.y,
              disparo.angulo,
              disparo.velocidade,
              proximoId()
            )
          );
        }
      }

      tiros = atualizarTiros(tiros, dt);
      obstaculos = atualizarObstaculos(obstaculos, dt, progresso);
      tanques = atualizarTanques(tanques, progresso);
      particulas = atualizarParticulas(particulas, dt);
      processarColisoes(dt);

      if (estado !== 'jogando') return;

      inimigos = inimigos.filter((inimigo) => !inimigoForaDaTela(inimigo));

      if (combustivel <= ALERTA_COMBUSTIVEL) {
        timerAlerta -= dt;

        if (timerAlerta <= 0) {
          ctx.audio.tocar('alerta');
          timerAlerta = 1.05;
        }
      } else {
        timerAlerta = 0;
      }

      if (nave.acelerando) {
        timerMotor -= dt;

        if (timerMotor <= 0) {
          ctx.audio.tocarTom(
            92 + Math.sin(tempo * 13) * 14,
            'triangle',
            0.075,
            0.12
          );
          timerMotor = 0.17;
        }
      } else {
        timerMotor = 0;
      }
    }

    function renascerNaSecao(): void {
      limparEntidades();
      progresso = 0;
      combustivel = FUEL_MAX;
      barreira = criarBarreira(secaoRio);
      agenda = criarAgenda();
      nave = criarNave(secaoRio);
      timerAlerta = 0;
      timerMotor = 0;
      timerSomAbastecer = 0;
      ctx.hud.definirEstado({ fase: secaoNumero });
    }

    return {
      iniciar() {
        recorde = ctx.storage.lerRecorde(ctx.id);
        vidas = VIDAS_INICIAIS;
        proximaVidaExtra = INTERVALO_VIDA_EXTRA;
        idEntidade = 1;
        estado = 'titulo';
        tempo = 0;
        timerEstado = 0;
        sementePartida = (Math.random() * 0xffffffff) >>> 0;
        secaoNumero = 1;
        secaoRio = criarSecao(secaoNumero, sementePartida);
        cenario = criarCenario(secaoRio, sementePartida);
        rngSpawn = criarRng(sementePartida + 1);
        progresso = 0;
        combustivel = FUEL_MAX;
        barreira = criarBarreira(secaoRio);
        agenda = criarAgenda();
        nave = criarNave(secaoRio);
        limparEntidades();
        timerAlerta = 0;
        timerMotor = 0;
        timerSomAbastecer = 0;

        ctx.hud.definirEstado({
          pontuacao: 0,
          recorde,
          vidas,
          fase: 1,
          vidasMax: VIDAS_MAXIMAS,
        });
      },

      reiniciar() {
        comecarPartida();
      },

      pausar() {
        timerMotor = 0;
      },

      retomar() {
        // O motor retoma o loop automaticamente.
      },

      atualizar(dt: number, input: InputState) {
        tempo += dt;

        if (estado === 'titulo') {
          if (input.acaoPressionada || input.acao2Pressionada) {
            ctx.audio.ativar();
            comecarPartida();
          }
          return;
        }

        if (estado === 'gameover') {
          if (input.acaoPressionada || input.acao2Pressionada) {
            comecarPartida();
          }
          return;
        }

        if (estado === 'transicao') {
          timerEstado -= dt;
          particulas = atualizarParticulas(particulas, dt);

          if (timerEstado <= 0) {
            iniciarSecao(secaoNumero + 1);
            estado = 'jogando';
          }
          return;
        }

        if (estado === 'morrendo') {
          timerEstado -= dt;
          particulas = atualizarParticulas(particulas, dt);

          if (timerEstado <= 0) {
            if (vidas <= 0) {
              estado = 'gameover';
              recorde = Math.max(recorde, ctx.hud.obterEstado().pontuacao);
              ctx.finalizarJogo('gameOver');
            } else {
              renascerNaSecao();
              estado = 'jogando';
            }
          }
          return;
        }

        atualizarJogando(dt, input);
      },

      desenhar(g: CanvasRenderingContext2D) {
        const progressoVisual = estado === 'titulo' ? tempo * 20 : progresso;

        desenharRio(g, secaoRio, progressoVisual, tempo);
        desenharDecoracoes(g, cenario, progressoVisual);

        if (estado === 'titulo') {
          desenharTitulo(g, recorde, tempo);
          return;
        }

        desenharObstaculos(g, obstaculos);
        desenharTanques(g, tanques, tempo);
        desenharInimigos(g, inimigos, tempo);

        if (barreira.hp > 0) {
          desenharBarreira(g, barreira, tempo);
        }

        desenharNave(g, nave, tempo, estado !== 'morrendo');
        desenharTiros(g, tiros);
        desenharParticulas(g, particulas);

        ctx.hud.desenharHUD(g, LARGURA, ALTURA);
        desenharCombustivel(g, combustivel, tempo);

        if (estado === 'jogando' && nave.invulneravel > DURACAO_INVULNERAVEL - 0.75) {
          desenharAvisoNave(g, tempo);
        }

        if (estado === 'transicao') {
          desenharAviso(
            g,
            `TRECHO ${secaoNumero} CONCLUÍDO`,
            'PREPARE-SE PARA O PRÓXIMO TRECHO',
            tempo
          );
        }

        if (estado === 'gameover') {
          ctx.hud.desenharGameOver(g, LARGURA, ALTURA, 'PRESSIONE AÇÃO / TOQUE');
        }
      },

      destruir() {
        limparEntidades();
        estado = 'gameover';
        timerMotor = 0;
      },
    };
  },
};
