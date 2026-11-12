/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { EngineContext, GameInstance, GameModule, InputState } from '../../engine/types';
import { desenharCasa, desenharIndicadorEntrada, jogadorPodeEntrar } from './casa';
import { desenharCenario } from './cenario';
import {
  AGUA_TOPO,
  ALTURA,
  BONUS_CASA_BASE,
  BONUS_CASA_FASE,
  CASA_PORTA_X,
  CORES,
  DURACAO_INVULNERAVEL,
  DURACAO_TRANSICAO,
  FILEIRAS_Y,
  LAND_Y,
  LARGURA,
  PONTOS_PEIXE,
  PONTOS_TABUA_BASE,
  PONTOS_TABUA_MAX,
  PONTOS_VIDA_EXTRA,
  TOTAL_TABUAS,
  TOTAL_FILEIRAS,
  VIDAS_INICIAIS,
  VIDAS_MAX,
} from './constantes';
import { atualizarGavioes, criarGavioes, desenharGavioes } from './gaviao';
import { desenharHUDJogo, desenharTitulo, desenharTransicao } from './hud';
import {
  atualizarAfogamento,
  atualizarPulo,
  criarJogador,
  desenharJogador,
  iniciarPulo,
  moverJogador,
} from './jogador';
import { atualizarMusica, criarMusica, resetarMusica } from './musica';
import {
  atualizarOnca,
  criarOnca,
  desenharOnca,
  minimoTabuasOnca,
  reiniciarOnca,
} from './onca';
import {
  atualizarEfeitos,
  criarFaisca,
  criarRespingo,
  criarTexto,
  desenharParticulas,
  desenharTextos,
} from './particulas';
import { atualizarPeixes, criarPeixe, desenharPeixes } from './peixes';
import { atualizarPiranhas, criarPiranha, desenharPiranhas } from './piranha';
import {
  atualizarPlataformas,
  criarFileiras,
  desenharPlataformas,
  plataformaPorId,
  plataformaSob,
  resetarFlores,
} from './plataformas';
import { atualizarSiris, criarSiris, desenharSiris } from './siri';
import {
  atualizarMedidor,
  criarMedidor,
  reiniciarMedidor,
} from './tempo';
import {
  EstadoJogo,
  Gaviao,
  Jogador,
  MedidorCheia,
  Onca,
  Particula,
  Peixe,
  Piranha,
  Plataforma,
  Siri,
  TextoFlutuante,
} from './tipos';

type MotivoDano = 'agua' | 'gaviao' | 'piranha' | 'siri' | 'onca' | 'cheia';

export const cheiaGameModule: GameModule = {
  id: 'cheia',
  titulo: 'Casa na Cheia',
  descricao:
    'Pule entre as vitórias-régias, construa sua casa de palafita e entre antes que a cheia suba.',
  genero: 'Plataforma de pulos',
  corTema: '#F472B6',
  largura: LARGURA,
  altura: ALTURA,
  instrucoes: {
    historia:
      'O rio está enchendo e Tiquinho, um menino ribeirinho de chapéu de palha, precisa construir sua casa de palafita pulando entre vitórias-régias gigantes e recolhendo tábuas. A onça e as aves da beira do rio não vão facilitar.',
    controles: [
      'Setas / WASD / D-Pad: andar sobre a margem e as vitórias-régias',
      'Cima / Baixo: pular para a fileira de cima ou de baixo',
      'Espaço / Botão A: iniciar a partida',
      'P: pausar • R: reiniciar • M: som • ESC: voltar ao hub',
    ],
    pontos: [
      { acao: 'Tábua conquistada', pontos: 10 },
      { acao: 'Peixe dourado', pontos: PONTOS_PEIXE },
      { acao: 'Casa concluída', pontos: BONUS_CASA_BASE },
      { acao: 'Bônus por fase concluída', pontos: BONUS_CASA_FASE },
    ],
  },

  criar(ctx: EngineContext): GameInstance {
    let estado: EstadoJogo = 'titulo';
    let tempo = 0;
    let tempoEstado = 0;
    let fase = 1;
    let vidas = VIDAS_INICIAIS;
    let proximaVidaExtra = PONTOS_VIDA_EXTRA;
    let tabuas = 0;
    let casasConcluidas = 0;
    let bonusCasa = 0;
    let motivoQueda: MotivoDano = 'agua';
    let jogador: Jogador = criarJogador();
    let plataformas: Plataforma[] = [];
    let gavioes: Gaviao[] = [];
    let piranhas: Piranha[] = [];
    let siris: Siri[] = [];
    let peixes: Peixe[] = [];
    let onca: Onca = criarOnca();
    let particulas: Particula[] = [];
    let textos: TextoFlutuante[] = [];
    let medidor: MedidorCheia = criarMedidor(1);
    let musica = criarMusica();
    let timerPiranha = 2;
    let timerPeixe = 2.5;
    let flash = 0;
    let tremor = 0;
    let inundacao = 0;

    function configurarPartida(): void {
      estado = 'titulo';
      tempo = 0;
      tempoEstado = 0;
      fase = 1;
      vidas = VIDAS_INICIAIS;
      proximaVidaExtra = PONTOS_VIDA_EXTRA;
      tabuas = 0;
      casasConcluidas = 0;
      bonusCasa = 0;
      motivoQueda = 'agua';
      jogador = criarJogador();
      plataformas = criarFileiras(1);
      gavioes = [];
      piranhas = [];
      siris = [];
      peixes = [criarPeixe()];
      onca = criarOnca();
      particulas = [];
      textos = [];
      medidor = criarMedidor(1);
      musica = criarMusica();
      timerPiranha = 2;
      timerPeixe = 2.5;
      flash = 0;
      tremor = 0;
      inundacao = 0;

      ctx.hud.definirEstado({
        pontuacao: 0,
        recorde: ctx.storage.lerRecorde(ctx.id),
        vidas,
        fase: 1,
        vidasMax: VIDAS_MAX,
        bonus: 0,
      });
    }

    function iniciarFase(): void {
      plataformas = criarFileiras(fase);
      gavioes = criarGavioes(fase);
      piranhas = [];
      siris = criarSiris(fase);
      peixes = [];
      onca = criarOnca();
      particulas = [];
      textos = [];
      jogador = criarJogador();
      medidor = criarMedidor(fase);
      timerPiranha = 1.8;
      timerPeixe = 2.5;
      flash = 0;
      tremor = 0;
      inundacao = 0;
      resetarMusica(musica);
      estado = 'jogando';
      tempoEstado = 0;

      ctx.hud.definirEstado({
        vidas,
        fase,
        vidasMax: VIDAS_MAX,
        bonus: 0,
      });
    }

    function comecarPartida(): void {
      configurarPartida();
      ctx.audio.ativar();
      ctx.audio.tocar('alerta');
      iniciarFase();
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
        if (vidas < VIDAS_MAX) {
          vidas += 1;
          ctx.hud.definirEstado({ vidas, vidasMax: VIDAS_MAX });
          ctx.audio.tocar('item');
          criarTexto(textos, jogador.x, jogador.y - 44, '+1 VIDA', CORES.verdeClaro);
        }
      }
    }

    function conquistarTabua(x: number, y: number): void {
      if (tabuas >= TOTAL_TABUAS) return;

      tabuas += 1;
      const pontos = Math.min(PONTOS_TABUA_MAX, PONTOS_TABUA_BASE * fase);
      concederPontos(pontos, x, y - 18, CORES.rosaClaro);
      ctx.audio.tocar('item');
      ctx.audio.tocarTom(500 + tabuas * 22, 'square', 0.1, 0.2);
      criarFaisca(particulas, x, y - 8, CORES.rosa, 10);
      criarFaisca(particulas, x, y - 8, CORES.amarelo, 6);

      if (tabuas === TOTAL_TABUAS) {
        ctx.audio.tocar('vitoria');
        criarTexto(textos, CASA_PORTA_X, 116, 'CASA PRONTA!', CORES.amarelo);
      }
    }

    function perderVida(motivo: MotivoDano): void {
      if (estado !== 'jogando') return;

      vidas = ctx.hud.perderVida();
      ctx.audio.tocar('vidaPerdida');
      flash = 0.55;
      tremor = 0.9;
      criarRespingo(
        particulas,
        Math.max(20, Math.min(LARGURA - 20, jogador.x)),
        AGUA_TOPO + 16,
        CORES.aguaClara,
        24,
        190
      );

      if (motivo === 'cheia') {
        inundacao = 1;
      }

      if (vidas <= 0) {
        estado = 'gameOver';
        tempoEstado = 0;
        ctx.finalizarJogo('gameOver');
        return;
      }

      jogador = criarJogador();
      jogador.invulneravel = DURACAO_INVULNERAVEL;
      motivoQueda = 'agua';
      resetarFlores(plataformas);
      reiniciarMedidor(medidor, fase);
      gavioes = criarGavioes(fase);
      piranhas = [];
      siris = criarSiris(fase);
      peixes = [];
      reiniciarOnca(onca);
      timerPiranha = 2;
      timerPeixe = 2.5;
      criarTexto(textos, LARGURA / 2, 174, 'A CHEIA LEVOU UMA VIDA', CORES.rosaClaro);
      ctx.hud.definirEstado({ vidas, fase, vidasMax: VIDAS_MAX, bonus: 0 });
    }

    function iniciarQuedaAgua(motivo: MotivoDano): void {
      if (estado !== 'jogando') return;
      if (jogador.estado === 'afogando') return;
      if (jogador.invulneravel > 0) return;

      motivoQueda = motivo;
      jogador.estado = 'afogando';
      jogador.tempoAfogando = 0;
      jogador.pulo = null;
      jogador.plataformaId = null;
      criarRespingo(
        particulas,
        Math.max(20, Math.min(LARGURA - 20, jogador.x)),
        AGUA_TOPO + 18,
        CORES.aguaClara,
        18,
        160
      );
      ctx.audio.tocarTom(190, 'sine', 0.32, 0.22);
    }

    function concluirCasa(): void {
      if (estado !== 'jogando') return;

      const bonus =
        Math.floor(medidor.restante) * 100 + BONUS_CASA_BASE + BONUS_CASA_FASE * fase;
      bonusCasa = bonus;
      casasConcluidas += 1;
      concederPontos(bonus, CASA_PORTA_X, 104, CORES.amarelo);
      ctx.storage.salvarRecorde(ctx.id, ctx.hud.obterEstado().pontuacao);
      ctx.audio.tocar('vitoria');
      ctx.audio.tocar('abastecer');
      flash = 0.4;
      tremor = 0.45;

      for (let i = 0; i < 30; i++) {
        criarFaisca(
          particulas,
          CASA_PORTA_X + (Math.random() - 0.5) * 100,
          108 + Math.random() * 32,
          i % 2 === 0 ? CORES.rosa : CORES.amarelo,
          2
        );
      }

      jogador.estado = 'comemorando';
      jogador.fileira = -1;
      jogador.x = CASA_PORTA_X;
      jogador.y = LAND_Y;
      jogador.plataformaId = null;
      jogador.pulo = null;
      estado = 'transicao';
      tempoEstado = DURACAO_TRANSICAO;
      ctx.hud.definirEstado({ vidas, fase, vidasMax: VIDAS_MAX, bonus: 0 });
    }

    function avancarFase(): void {
      fase += 1;
      ctx.hud.definirFase(fase);
      tabuas = 0;
      bonusCasa = 0;
      iniciarFase();
      ctx.audio.tocar('item');
    }

    function concluirPulo(destino: number): void {
      if (destino === -1) {
        jogador.fileira = -1;
        jogador.y = LAND_Y;
        jogador.estado = 'parado';
        jogador.plataformaId = null;
        resetarFlores(plataformas);
        ctx.audio.tocarTom(520, 'sine', 0.1, 0.14);
        if (jogadorPodeEntrar(jogador, tabuas)) {
          concluirCasa();
        }
        return;
      }

      const plataforma = plataformaSob(plataformas, destino, jogador.x);
      if (!plataforma) {
        iniciarQuedaAgua('agua');
        return;
      }

      jogador.fileira = destino;
      jogador.y = plataforma.y;
      jogador.plataformaId = plataforma.id;
      jogador.estado = 'parado';
      jogador.x = Math.max(plataforma.x - 22, Math.min(plataforma.x + 22, jogador.x));
      ctx.audio.tocarTom(440, 'sine', 0.08, 0.12);

      if (plataforma.tipo === 'lirio' && !plataforma.florida) {
        plataforma.florida = true;
        conquistarTabua(plataforma.x, plataforma.y);
      }
    }

    function atualizarJogador(dt: number, input: InputState): void {
      const plataformaAtual = plataformaPorId(plataformas, jogador.plataformaId);

      if (jogador.estado === 'afogando') {
        if (atualizarAfogamento(jogador, dt)) {
          perderVida(motivoQueda);
        }
        return;
      }

      if (jogador.estado === 'pulando') {
        moverJogador(jogador, input, dt, 10, LARGURA - 10, 168);
        const destino = jogador.pulo?.destinoFileira ?? jogador.fileira;
        if (atualizarPulo(jogador, dt)) {
          concluirPulo(destino);
        }
        return;
      }

      if (jogador.fileira === -1) {
        moverJogador(jogador, input, dt, 14, LARGURA - 14);
      } else {
        if (!plataformaAtual) {
          iniciarQuedaAgua('agua');
          return;
        }
        const min = Math.max(8, plataformaAtual.x - 21);
        const max = Math.min(LARGURA - 8, plataformaAtual.x + 21);
        moverJogador(jogador, input, dt, min, max);
      }

      if (input.cimaPressionada) {
        if (jogador.fileira >= 0) {
          const destino = jogador.fileira - 1;
          iniciarPulo(jogador, destino, destino === -1 ? LAND_Y : FILEIRAS_Y[destino]);
          ctx.audio.tocar('pulo');
          return;
        }
      }

      if (input.baixoPressionada) {
        if (jogador.fileira === -1) {
          iniciarPulo(jogador, 0, FILEIRAS_Y[0]);
          ctx.audio.tocar('pulo');
          return;
        }

        if (jogador.fileira < TOTAL_FILEIRAS - 1) {
          const destino = jogador.fileira + 1;
          iniciarPulo(jogador, destino, FILEIRAS_Y[destino]);
          ctx.audio.tocar('pulo');
          return;
        }

        iniciarQuedaAgua('agua');
        return;
      }

      if (jogadorPodeEntrar(jogador, tabuas)) {
        concluirCasa();
      }
    }

    function atualizarSpawners(dt: number): void {
      timerPiranha -= dt;
      if (
        timerPiranha <= 0 &&
        piranhas.length < Math.min(5, 1 + Math.floor(fase / 2))
      ) {
        piranhas.push(criarPiranha());
        ctx.audio.tocarTom(170, 'sawtooth', 0.12, 0.18);
        timerPiranha = Math.max(1.1, 3.2 - fase * 0.17) + Math.random() * 0.8;
      }

      timerPeixe -= dt;
      if (timerPeixe <= 0 && peixes.length < 3) {
        peixes.push(criarPeixe());
        timerPeixe = 2.8 + Math.random() * 3.2;
      }
    }

    function verificarColisoes(): void {
      const caixaJogador = {
        x: jogador.x - 7,
        y: jogador.y - 28,
        largura: 14,
        altura: 26,
      };

      for (let i = peixes.length - 1; i >= 0; i--) {
        const peixe = peixes[i];
        const caixaPeixe = {
          x: peixe.x - 16,
          y: peixe.y - 8,
          largura: 32,
          altura: 16,
        };
        if (ctx.colisao.retanguloRetangulo(caixaJogador, caixaPeixe)) {
          peixes.splice(i, 1);
          concederPontos(PONTOS_PEIXE, peixe.x, peixe.y - 18, CORES.peixeClaro);
          ctx.audio.tocar('moeda');
          criarFaisca(particulas, peixe.x, peixe.y, CORES.amarelo, 12);
          criarTexto(textos, peixe.x, peixe.y - 28, 'PEIXE DOURADO', CORES.amarelo);
        }
      }

      if (jogador.invulneravel > 0 || jogador.estado === 'afogando') return;

      for (const gaviao of gavioes) {
        const caixa = {
          x: gaviao.x - gaviao.largura / 2,
          y: gaviao.y - gaviao.altura / 2,
          largura: gaviao.largura,
          altura: gaviao.altura,
        };
        if (ctx.colisao.retanguloRetangulo(caixaJogador, caixa)) {
          ctx.audio.tocarTom(820, 'sawtooth', 0.16, 0.2);
          iniciarQuedaAgua('gaviao');
          return;
        }
      }

      for (const piranha of piranhas) {
        if (jogador.estado !== 'pulando') continue;
        const caixa = {
          x: piranha.x - piranha.largura / 2,
          y: piranha.y - piranha.altura / 2,
          largura: piranha.largura,
          altura: piranha.altura,
        };
        if (ctx.colisao.retanguloRetangulo(caixaJogador, caixa)) {
          ctx.audio.tocarTom(240, 'sawtooth', 0.14, 0.22);
          iniciarQuedaAgua('piranha');
          return;
        }
      }

      for (const siri of siris) {
        if (jogador.fileira !== siri.fileira || jogador.estado === 'pulando') continue;
        const caixa = {
          x: siri.x - siri.largura / 2,
          y: siri.y - siri.altura,
          largura: siri.largura,
          altura: siri.altura,
        };
        if (ctx.colisao.retanguloRetangulo(caixaJogador, caixa)) {
          jogador.x += siri.direcao * 10;
          ctx.audio.tocar('batida');
          iniciarQuedaAgua('siri');
          return;
        }
      }

      if (jogador.fileira === -1 && onca.ativa) {
        const caixa = {
          x: onca.x - onca.largura / 2,
          y: onca.y - onca.altura,
          largura: onca.largura,
          altura: onca.altura,
        };
        if (ctx.colisao.retanguloRetangulo(caixaJogador, caixa)) {
          ctx.audio.tocarTom(92, 'sawtooth', 0.5, 0.25);
          perderVida('onca');
          return;
        }
      }
    }

    function atualizarJogo(dt: number, input: InputState): void {
      jogador.invulneravel = Math.max(0, jogador.invulneravel - dt);
      flash = Math.max(0, flash - dt * 1.8);
      tremor = Math.max(0, tremor - dt * 2.2);
      inundacao = Math.max(0, inundacao - dt);

      atualizarMusica(musica, ctx.audio, dt, true);

      const plataformaAtual = plataformaPorId(plataformas, jogador.plataformaId);
      const xAntes = plataformaAtual?.x ?? 0;
      atualizarPlataformas(plataformas, dt);

      if (
        plataformaAtual &&
        jogador.estado !== 'pulando' &&
        jogador.estado !== 'afogando' &&
        jogador.fileira >= 0
      ) {
        if (plataformaAtual.wrapou) {
          iniciarQuedaAgua('agua');
        } else if (
          plataformaAtual.tipo === 'tartaruga' &&
          (plataformaAtual.submergiuAgora || plataformaAtual.estadoTartaruga === 'submersa')
        ) {
          iniciarQuedaAgua('agua');
        } else {
          jogador.x += plataformaAtual.x - xAntes;
          if (jogador.x < -4 || jogador.x > LARGURA + 4) {
            iniciarQuedaAgua('agua');
          }
        }
      }

      atualizarJogador(dt, input);

      if (estado !== 'jogando') return;

      if (atualizarMedidor(medidor, dt, ctx.audio)) {
        perderVida('cheia');
        return;
      }

      atualizarGavioes(gavioes, dt, fase);
      atualizarPiranhas(piranhas, dt);
      atualizarSiris(siris, dt);
      atualizarPeixes(peixes, dt);

      const ativaOnca = tabuas >= minimoTabuasOnca(fase);
      const eraAtiva = onca.ativa;
      atualizarOnca(onca, jogador, dt, ativaOnca, fase);
      if (onca.ativa && !eraAtiva) {
        ctx.audio.tocarTom(84, 'sawtooth', 0.55, 0.24);
        criarTexto(textos, LARGURA / 2, 120, 'A ONÇA APARECEU!', CORES.vermelho);
      }

      atualizarSpawners(dt);
      verificarColisoes();

      if (estado === 'jogando' && jogadorPodeEntrar(jogador, tabuas)) {
        concluirCasa();
      }

      atualizarEfeitos(particulas, textos, dt);
    }

    function atualizarTransicao(dt: number): void {
      atualizarMusica(musica, ctx.audio, dt, false);
      atualizarEfeitos(particulas, textos, dt);
      tempoEstado -= dt;
      if (tempoEstado <= 0) {
        avancarFase();
      }
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
          atualizarMusica(musica, ctx.audio, dt, false);
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
          atualizarTransicao(dt);
          return;
        }

        atualizarJogo(dt, input);
      },

      desenhar(g: CanvasRenderingContext2D) {
        desenharCenario(g, tempo, medidor);

        g.save();
        if (tremor > 0.01 && estado === 'jogando') {
          const forca = tremor * 4;
          g.translate(Math.sin(tempo * 91) * forca, Math.cos(tempo * 73) * forca);
        }

        desenharCasa(g, tabuas, casasConcluidas, tempo);
        desenharPeixes(g, peixes);
        desenharPlataformas(g, ctx.sprites, plataformas, tempo);
        desenharSiris(g, siris);
        desenharGavioes(g, gavioes, tempo);
        desenharPiranhas(g, piranhas);
        desenharOnca(g, onca);
        desenharJogador(g, ctx.sprites, jogador, tempo);
        desenharParticulas(g, particulas);
        desenharTextos(g, textos);
        desenharIndicadorEntrada(g, tabuas, tempo);

        g.restore();

        if (inundacao > 0) {
          g.fillStyle = 'rgba(45, 212, 191, 0.18)';
          g.fillRect(0, ALTURA - ALTURA * 0.42 * Math.min(1, inundacao), LARGURA, ALTURA);
        }

        if (flash > 0) {
          g.fillStyle = `rgba(251, 113, 133, ${flash * 0.38})`;
          g.fillRect(0, 0, LARGURA, ALTURA);
        }

        desenharHUDJogo(
          g,
          ctx.hud,
          ctx.sprites,
          fase,
          vidas,
          medidor,
          tabuas,
          casasConcluidas,
          tempo
        );

        if (estado === 'titulo') {
          desenharTitulo(g, ctx.hud.obterEstado().recorde, tempo);
        } else if (estado === 'transicao') {
          desenharTransicao(
            g,
            fase,
            bonusCasa,
            casasConcluidas,
            tempoEstado,
            tempo
          );
        } else if (estado === 'gameOver') {
          ctx.hud.desenharGameOver(
            g,
            LARGURA,
            ALTURA,
            'PRESSIONE AÇÃO / TOQUE'
          );
        }
      },

      destruir() {
        plataformas = [];
        gavioes = [];
        piranhas = [];
        siris = [];
        peixes = [];
        particulas = [];
        textos = [];
        jogador = criarJogador();
        onca = criarOnca();
        resetarMusica(musica);
      },
    };
  },
};
