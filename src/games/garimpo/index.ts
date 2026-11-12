/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { EngineContext, GameInstance, GameModule, InputState } from '../../engine/types';
import { Cristal, Estrela, Nave, Particula, Pirata, Rocha, Tiro } from './tipos';
import {
  atualizarNave,
  criarNave,
  DURACAO_INVULNERAVEL,
  RECARGA_SALTO,
  reposicionarNave,
} from './nave';
import {
  CONFIG_ROCHAS,
  atualizarRochas,
  criarRochasFase,
  dividirRocha,
} from './rochas';
import { MAX_TIROS_JOGADOR, atualizarTiros, criarTiroJogador, criarTiroPirata } from './tiros';
import { atualizarCristais, criarCristal } from './cristais';
import {
  atualizarPirata,
  chancePirataPequeno,
  criarPirata,
  intervaloPirata,
} from './pirata';
import { atualizarParticulas, criarExplosao, criarFaiscaPropulsor } from './particulas';
import {
  desenharAvisoFase,
  desenharBarraCarga,
  desenharCristais,
  desenharFundo,
  desenharNave,
  desenharParticulas,
  desenharPiratas,
  desenharRochas,
  desenharTiros,
  desenharTitulo,
} from './render';
import { aleatorio, distancia } from './vetor';

type EstadoJogo =
  | 'titulo'
  | 'preparando'
  | 'jogando'
  | 'morrendo'
  | 'faseCompleta'
  | 'gameover';

const VIDAS_INICIAIS = 3;
const VIDAS_MAXIMAS = 9;
const INTERVALO_VIDA_EXTRA = 10000;
const MAX_ROCHAS_FASE = 11;
const MAX_PIRATAS = 3;

function criarEstrelas(largura: number, altura: number): Estrela[] {
  const estrelas: Estrela[] = [];

  for (let i = 0; i < 58; i++) {
    estrelas.push({
      x: aleatorio(0, largura),
      y: aleatorio(0, altura),
      fase: aleatorio(0, Math.PI * 2),
      velocidade: aleatorio(0.6, 2.4),
    });
  }

  return estrelas;
}

export const garimpoGameModule: GameModule = {
  id: 'garimpo',
  titulo: 'Garimpo Estelar',
  descricao: 'Quebre as rochas, colete cristais e sobreviva ao cinturão.',
  genero: 'Tiro espacial',
  corTema: '#22D3EE',
  largura: 320,
  altura: 240,
  instrucoes: {
    historia:
      'Você é um garimpeiro espacial preso em um cinturão de asteroides. Quebre as rochas, colete cristais de energia e enfrente os piratas que cercam a região. Cada fase traz mais pedras — e mais perigo.',
    controles: [
      '◄ ► / A D / D-Pad: girar a nave',
      '▲ / W / D-Pad cima: aceleração com inércia',
      'Espaço / Z / Botão A: atirar (até 4 tiros simultâneos)',
      'Shift / X / Botão B: salto hiperespacial (recarga de 1s)',
      'P: pausar • R: reiniciar • M: som • ESC: voltar ao hub',
    ],
    pontos: [
      { acao: 'Rocha grande destruída', pontos: 20 },
      { acao: 'Rocha média destruída', pontos: 50 },
      { acao: 'Rocha pequena destruída', pontos: 100 },
      { acao: 'Pirata grande destruído', pontos: 200 },
      { acao: 'Pirata pequeno destruído', pontos: 1000 },
      { acao: 'Cristal coletado', pontos: 25 },
      { acao: 'Vida extra a cada 10.000 pontos', pontos: 1 },
    ],
  },

  criar(ctx: EngineContext): GameInstance {
    const largura = ctx.largura;
    const altura = ctx.altura;
    const centroX = largura / 2;
    const centroY = altura / 2;

    let estado: EstadoJogo = 'titulo';
    let tempo = 0;
    let timerEstado = 0;
    let fase = 1;
    let vidas = VIDAS_INICIAIS;
    let proximaVidaExtra = INTERVALO_VIDA_EXTRA;
    let carga = 0;
    let recorde = ctx.storage.lerRecorde(ctx.id);

    const estrelas = criarEstrelas(largura, altura);
    const nave: Nave = criarNave(largura, altura);

    let rochas: Rocha[] = [];
    let tiros: Tiro[] = [];
    let cristais: Cristal[] = [];
    let piratas: Pirata[] = [];
    let particulas: Particula[] = [];

    let timerPirata = 0;
    let timerBatida = 0;
    let timerPropulsorSom = 0;

    function pontuar(pontos: number, x?: number, y?: number, cor?: string): void {
      ctx.hud.adicionarPontos(pontos, x, y, cor);

      const total = ctx.hud.obterEstado().pontuacao;

      while (total >= proximaVidaExtra) {
        vidas = ctx.hud.ganharVida();
        ctx.audio.tocar('item');
        proximaVidaExtra += INTERVALO_VIDA_EXTRA;
      }
    }

    function ganharCarga(valor: number): void {
      if (nave.tempoDuplo > 0) return;

      carga = Math.min(1, carga + valor);

      if (carga >= 1) {
        carga = 0;
        nave.tempoDuplo = 10;
        ctx.audio.tocar('item');
      }
    }

    function centroLivre(): boolean {
      const raioSeguro = nave.raio + 15;

      const livreDeRochas = rochas.every(
        (rocha) => distancia(centroX, centroY, rocha.x, rocha.y) > rocha.raio + raioSeguro
      );

      const livreDePiratas = piratas.every(
        (pirata) => distancia(centroX, centroY, pirata.x, pirata.y) > pirata.raio + raioSeguro
      );

      return livreDeRochas && livreDePiratas;
    }

    function iniciarFase(): void {
      const quantidade = Math.min(MAX_ROCHAS_FASE, 4 + (fase - 1));

      rochas = criarRochasFase(quantidade, largura, altura);
      tiros = [];
      cristais = [];
      piratas = [];
      particulas = [];
      carga = 0;

      timerPirata = intervaloPirata(fase, ctx.hud.obterEstado().pontuacao);
      timerBatida = 0;
      timerPropulsorSom = 0;

      reposicionarNave(nave, largura, altura);
      nave.invulneravel = 0;

      ctx.hud.definirEstado({ fase });
      estado = 'preparando';
      timerEstado = 1.6;
    }

    function comecarPartida(): void {
      fase = 1;
      vidas = VIDAS_INICIAIS;
      proximaVidaExtra = INTERVALO_VIDA_EXTRA;
      recorde = ctx.storage.lerRecorde(ctx.id);

      ctx.hud.definirEstado({
        pontuacao: 0,
        recorde,
        vidas,
        fase,
        vidasMax: VIDAS_MAXIMAS,
      });

      iniciarFase();
    }

    function atirar(): void {
      if (nave.timerTiro > 0) return;

      const tirosJogador = tiros.filter((tiro) => tiro.origem === 'jogador').length;
      const espaco = MAX_TIROS_JOGADOR - tirosJogador;

      if (espaco <= 0) return;

      if (nave.tempoDuplo > 0) {
        tiros.push(criarTiroJogador(nave, -0.055));
        if (espaco > 1) tiros.push(criarTiroJogador(nave, 0.055));
        nave.timerTiro = 0.14;
      } else {
        tiros.push(criarTiroJogador(nave));
        nave.timerTiro = 0.2;
      }

      ctx.audio.tocar('tiro');
    }

    function destruirNave(): void {
      if (estado !== 'jogando') return;

      estado = 'morrendo';
      timerEstado = 1.35;

      criarExplosao(particulas, nave.x, nave.y, '#67E8F9', 26, 180);
      criarExplosao(particulas, nave.x, nave.y, '#FFFFFF', 10, 110);
      ctx.audio.tocar('explosaoNave');

      vidas = ctx.hud.perderVida();
    }

    function saltar(): void {
      if (nave.recargaSalto > 0 || estado !== 'jogando') return;

      nave.recargaSalto = RECARGA_SALTO;
      ctx.audio.tocar('salto');

      criarExplosao(particulas, nave.x, nave.y, '#67E8F9', 12, 90);

      if (Math.random() < 1 / 8) {
        destruirNave();
        return;
      }

      const destino = encontrarDestinoSalto();
      nave.x = destino.x;
      nave.y = destino.y;
      nave.vx = 0;
      nave.vy = 0;
      nave.invulneravel = Math.max(nave.invulneravel, 1.0);

      criarExplosao(particulas, nave.x, nave.y, '#A5F3FC', 12, 90);
    }

    function encontrarDestinoSalto(): { x: number; y: number } {
      for (let tentativa = 0; tentativa < 40; tentativa++) {
        const x = aleatorio(24, largura - 24);
        const y = aleatorio(34, altura - 24);

        const longeDaNave = distancia(x, y, nave.x, nave.y) > 60;
        const longeDasRochas = rochas.every(
          (rocha) => distancia(x, y, rocha.x, rocha.y) > rocha.raio + 22
        );
        const longeDosPiratas = piratas.every(
          (pirata) => distancia(x, y, pirata.x, pirata.y) > pirata.raio + 22
        );

        if (longeDaNave && longeDasRochas && longeDosPiratas) return { x, y };
      }

      return { x: centroX, y: centroY };
    }

    function processarColisoes(): void {
      // Tiros do jogador contra rochas
      for (let i = tiros.length - 1; i >= 0; i--) {
        const tiro = tiros[i];
        if (tiro.origem !== 'jogador') continue;

        let indice = -1;

        for (let j = rochas.length - 1; j >= 0; j--) {
          if (ctx.colisao.circuloCirculo(tiro, rochas[j])) {
            indice = j;
            break;
          }
        }

        if (indice < 0) continue;

        const rocha = rochas[indice];
        const config = CONFIG_ROCHAS[rocha.tamanho];

        tiros.splice(i, 1);
        rochas.splice(indice, 1);

        pontuar(config.pontos, rocha.x, rocha.y, config.cor);
        ctx.audio.tocar(config.som);
        criarExplosao(
          particulas,
          rocha.x,
          rocha.y,
          config.cor,
          config.particulas,
          rocha.tamanho === 'grande' ? 135 : rocha.tamanho === 'media' ? 105 : 80
        );

        rochas.push(...dividirRocha(rocha));
        ganharCarga(0.12);

        if (Math.random() < config.chanceCristal) {
          cristais.push(criarCristal(rocha.x, rocha.y));
        }
      }

      // Tiros do jogador contra piratas
      for (let i = tiros.length - 1; i >= 0; i--) {
        const tiro = tiros[i];
        if (tiro.origem !== 'jogador') continue;

        let indice = -1;

        for (let j = piratas.length - 1; j >= 0; j--) {
          if (ctx.colisao.circuloCirculo(tiro, piratas[j])) {
            indice = j;
            break;
          }
        }

        if (indice < 0) continue;

        const pirata = piratas[indice];
        const pontos = pirata.tipo === 'pequeno' ? 1000 : 200;

        tiros.splice(i, 1);
        piratas.splice(indice, 1);

        pontuar(pontos, pirata.x, pirata.y, '#F472B6');
        ctx.audio.tocar('explosao');
        criarExplosao(particulas, pirata.x, pirata.y, '#F472B6', 22, 140);
        cristais.push(criarCristal(pirata.x, pirata.y));
        ganharCarga(0.18);
      }

      // Tiros do jogador cancelam tiros piratas
      const cancelados = new Set<number>();

      for (let i = 0; i < tiros.length; i++) {
        const tiro = tiros[i];
        if (tiro.origem !== 'jogador' || cancelados.has(tiro.id)) continue;

        for (let j = 0; j < tiros.length; j++) {
          const outro = tiros[j];
          if (j === i || outro.origem !== 'pirata' || cancelados.has(outro.id)) continue;

          if (ctx.colisao.circuloCirculo(tiro, outro)) {
            cancelados.add(tiro.id);
            cancelados.add(outro.id);
            criarExplosao(particulas, tiro.x, tiro.y, '#FDE68A', 5, 60);
            break;
          }
        }
      }

      if (cancelados.size > 0) {
        tiros = tiros.filter((tiro) => !cancelados.has(tiro.id));
      }

      // Coleta de cristais
      for (let i = cristais.length - 1; i >= 0; i--) {
        const cristal = cristais[i];

        if (
          ctx.colisao.circuloCirculo(
            { x: nave.x, y: nave.y, raio: nave.raio + 2 },
            cristal
          )
        ) {
          cristais.splice(i, 1);
          pontuar(25, cristal.x, cristal.y, '#FDE68A');
          ctx.audio.tocar('cristal');
          ganharCarga(0.05);
          criarExplosao(particulas, cristal.x, cristal.y, '#FDE68A', 6, 55);
        }
      }

      if (nave.invulneravel > 0 || estado !== 'jogando') return;

      // Colisão com rochas
      for (const rocha of rochas) {
        if (ctx.colisao.circuloCirculo(nave, rocha)) {
          destruirNave();
          return;
        }
      }

      // Colisão com piratas
      for (const pirata of piratas) {
        if (ctx.colisao.circuloCirculo(nave, pirata)) {
          destruirNave();
          return;
        }
      }

      // Colisão com tiros piratas
      for (let i = tiros.length - 1; i >= 0; i--) {
        const tiro = tiros[i];
        if (tiro.origem !== 'pirata') continue;

        if (ctx.colisao.circuloCirculo(nave, tiro)) {
          tiros.splice(i, 1);
          destruirNave();
          return;
        }
      }
    }

    function atualizarPiratas(dt: number, podeAtirar = true): void {
      for (const pirata of piratas) {
        const disparo = atualizarPirata(pirata, dt, largura, altura, nave, podeAtirar);

        if (disparo) {
          tiros.push(criarTiroPirata(pirata.x, pirata.y, disparo.angulo, disparo.velocidade));
        }
      }
    }

    function sortearPirata(dt: number): void {
      timerPirata -= dt;

      if (timerPirata > 0 || piratas.length >= MAX_PIRATAS) return;

      const pontuacao = ctx.hud.obterEstado().pontuacao;
      const pequeno = Math.random() < chancePirataPequeno(fase, pontuacao);
      piratas.push(criarPirata(pequeno ? 'pequeno' : 'grande', largura, altura));
      ctx.audio.tocar('alerta');
      timerPirata = intervaloPirata(fase, pontuacao);
    }

    function atualizarJogando(dt: number, input: InputState): void {
      atualizarNave(nave, dt, input, largura, altura);

      if (input.acao) atirar();
      if (input.acao2Pressionada) saltar();

      tiros = atualizarTiros(tiros, dt, largura, altura);
      atualizarRochas(rochas, dt, largura, altura);
      cristais = atualizarCristais(cristais, dt, largura, altura);
      atualizarPiratas(dt);
      sortearPirata(dt);
      processarColisoes();

      if (nave.acelerando) {
        nave.timerPropulsor -= dt;
        timerPropulsorSom -= dt;

        if (nave.timerPropulsor <= 0) {
          criarFaiscaPropulsor(particulas, nave);
          nave.timerPropulsor = 0.035;
        }

        if (timerPropulsorSom <= 0) {
          ctx.audio.tocar('propulsor');
          timerPropulsorSom = 0.24;
        }
      } else {
        timerPropulsorSom = 0;
      }

      const restantes = rochas.length;
      const intervaloBatida = Math.max(0.18, Math.min(1.05, 0.16 + restantes * 0.07));
      timerBatida -= dt;

      if (timerBatida <= 0) {
        ctx.audio.tocar('batida');
        timerBatida = intervaloBatida;
      }

      if (estado === 'jogando' && rochas.length === 0 && piratas.length === 0) {
        estado = 'faseCompleta';
        timerEstado = 1.8;
        ctx.audio.tocar('vitoria');
      }
    }

    return {
      iniciar() {
        recorde = ctx.storage.lerRecorde(ctx.id);

        ctx.hud.definirEstado({
          pontuacao: 0,
          recorde,
          vidas: VIDAS_INICIAIS,
          fase: 1,
          vidasMax: VIDAS_MAXIMAS,
        });

        estado = 'titulo';
        tempo = 0;
        timerEstado = 0;
        rochas = [];
        tiros = [];
        cristais = [];
        piratas = [];
        particulas = [];
      },

      reiniciar() {
        comecarPartida();
      },

      pausar() {
        // O motor congela o loop; nada contínuo a silenciar.
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

        if (estado === 'faseCompleta') {
          timerEstado -= dt;
          particulas = atualizarParticulas(particulas, dt);

          if (timerEstado <= 0) {
            fase += 1;
            iniciarFase();
          }
          return;
        }

        if (estado === 'preparando') {
          timerEstado -= dt;
          atualizarRochas(rochas, dt, largura, altura);
          tiros = atualizarTiros(tiros, dt, largura, altura);
          atualizarPiratas(dt, false);
          particulas = atualizarParticulas(particulas, dt);

          if (timerEstado <= 0 && centroLivre()) {
            reposicionarNave(nave, largura, altura);
            nave.invulneravel = DURACAO_INVULNERAVEL;
            estado = 'jogando';
          }
          return;
        }

        if (estado === 'morrendo') {
          timerEstado -= dt;
          atualizarRochas(rochas, dt, largura, altura);
          particulas = atualizarParticulas(particulas, dt);

          if (timerEstado <= 0) {
            if (vidas <= 0) {
              estado = 'gameover';
              recorde = Math.max(recorde, ctx.hud.obterEstado().pontuacao);
              ctx.finalizarJogo('gameOver');
            } else {
              estado = 'preparando';
              timerEstado = 1.0;
            }
          }
          return;
        }

        atualizarJogando(dt, input);
      },

      desenhar(g: CanvasRenderingContext2D) {
        desenharFundo(g, largura, altura, estrelas, tempo);

        if (estado === 'titulo') {
          recorde = ctx.storage.lerRecorde(ctx.id);
          desenharTitulo(g, largura, altura, recorde, tempo);
          return;
        }

        desenharRochas(g, rochas);
        desenharCristais(g, cristais, tempo);
        desenharPiratas(g, piratas);

        const naveVisivel = estado === 'jogando';
        desenharNave(g, nave, tempo, naveVisivel);

        desenharTiros(g, tiros);
        desenharParticulas(g, particulas);

        if (estado === 'preparando') {
          ctx.hud.desenharHUD(g, largura, altura);
          desenharAvisoFase(g, largura, altura, fase);
          return;
        }

        if (estado === 'faseCompleta') {
          ctx.hud.desenharHUD(g, largura, altura);
          desenharAvisoFase(g, largura, altura, fase + 1);
          return;
        }

        if (estado === 'morrendo') {
          ctx.hud.desenharHUD(g, largura, altura);
          return;
        }

        ctx.hud.desenharHUD(g, largura, altura);
        desenharBarraCarga(g, largura, altura, carga, nave.tempoDuplo);

        if (estado === 'gameover') {
          ctx.hud.desenharGameOver(g, largura, altura, 'PRESSIONE AÇÃO / TOQUE');
        }
      },

      destruir() {
        rochas = [];
        tiros = [];
        cristais = [];
        piratas = [];
        particulas = [];
        estado = 'gameover';
      },
    };
  },
};
