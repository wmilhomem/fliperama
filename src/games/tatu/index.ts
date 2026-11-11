/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { EngineContext, GameInstance, GameModule, InputState } from '../../engine/types';
import {
  FrutaBonus,
  atualizarFruta,
  criarFrutaBonus,
  obterFrutaDaFase,
  spawnarFruta,
} from './frutas';
import {
  contarItensIniciais,
  criarMatrizLabirinto,
  MAZE_OFFSET_X,
  MAZE_OFFSET_Y,
  TILE_SIZE,
} from './mapa';
import {
  PALETA_TATU,
  renderizarFruta,
  renderizarLabirinto,
  renderizarMensagemCentro,
  renderizarSombras,
  renderizarTatu,
} from './render';
import {
  assustarSombras,
  atualizarSombras,
  criarGerenciadorSombras,
  GerenciadorSombras,
  resetarSombras,
} from './sombras';
import {
  atualizarTatu,
  criarTatu,
  Direcao,
  resetarPosicaoTatu,
  TatuHero,
} from './tatu';

export const tatuGameModule: GameModule = {
  id: 'tatu',
  titulo: 'Tatu no Labirinto',
  descricao: 'Colete todas as sementes sem ser pego pelas sombras.',
  genero: 'Labirinto',
  corTema: '#84CC16', // Verde-limão neon
  largura: 480,
  altura: 560,
  instrucoes: {
    historia:
      'Um esperto tatu-bola explora um labirinto de pedras à noite, coletando sementes enquanto quatro sombras ancestrais o perseguem. Ao saborear uma pimenta vermelha, ele se enrola em uma bola blindada invencível capaz de dispersar as sombras!',
    controles: [
      'Setas / WASD / D-Pad: Mover o Tatu nas 4 direções',
      'Buffer de curva automático para curvas perfeitas em esquinas',
      'Tecla P: Pausar / Continuar',
      'Tecla R: Reiniciar partida',
    ],
    pontos: [
      { acao: 'Semente pequena', pontos: 10 },
      { acao: 'Pimenta grande', pontos: 50 },
      { acao: 'Sombras derrubadas (combo)', pontos: 200 },
      { acao: 'Frutas brasileiras de bônus', pontos: 100 },
      { acao: 'Vida extra aos 10.000 pontos', pontos: 10000 },
    ],
  },
  criar(ctx: EngineContext): GameInstance {
    // -------------------------------------------------------------
    // ESTADO DA INSTÂNCIA DO JOGO
    // -------------------------------------------------------------
    let grid: number[][] = criarMatrizLabirinto();
    let totalSementesIniciais = contarItensIniciais(grid).sementes;
    let sementesRestantes = totalSementesIniciais;
    let sementesComidasTotal = 0;

    let fase = 1;
    let vidas = 3;
    let vidaExtraConcedida = false;

    type EstadoFase = 'PRONTO' | 'JOGANDO' | 'PERDENDO_VIDA' | 'FASE_COMPLETA' | 'GAMEOVER';
    let estado: EstadoFase = 'PRONTO';
    let timerEstado = 2.0; // 2 segundos para o "PRONTO!"

    let tatu: TatuHero = criarTatu();
    let sombrasGen: GerenciadorSombras = criarGerenciadorSombras();
    let fruta: FrutaBonus = criarFrutaBonus(fase);

    // Sirene de fundo
    let timerSirene = 0;
    let tomSireneAlto = false;

    // Sons de sementes alternados (tique duplo)
    let altSomSemente = false;

    function iniciarFase(novaFase: number, preservarPontos = false) {
      fase = novaFase;
      grid = criarMatrizLabirinto();
      const contagem = contarItensIniciais(grid);
      totalSementesIniciais = contagem.sementes;
      sementesRestantes = totalSementesIniciais;
      sementesComidasTotal = 0;

      if (!preservarPontos) {
        vidas = 3;
        vidaExtraConcedida = false;
        ctx.hud.definirEstado({
          pontuacao: 0,
          recorde: ctx.storage.lerRecorde(ctx.id),
          vidas: 3,
          fase: novaFase,
        });
      } else {
        ctx.hud.definirEstado({
          vidas,
          fase: novaFase,
        });
      }

      resetarPosicaoTatu(tatu);
      resetarSombras(sombrasGen, novaFase);
      fruta = criarFrutaBonus(novaFase);

      estado = 'PRONTO';
      timerEstado = 2.0;
    }

    function renascerAposMorte() {
      resetarPosicaoTatu(tatu);
      resetarSombras(sombrasGen, fase);
      estado = 'PRONTO';
      timerEstado = 1.6;
    }

    return {
      iniciar() {
        ctx.hud.definirEstado({
          pontuacao: 0,
          recorde: ctx.storage.lerRecorde(ctx.id),
          vidas: 3,
          fase: 1,
        });
        iniciarFase(1, false);
      },

      reiniciar() {
        iniciarFase(1, false);
      },

      pausar() {
        // Pausado
      },

      retomar() {
        // Retomado
      },

      atualizar(dt: number, input: InputState) {
        // 1. Tela de Game Over
        if (estado === 'GAMEOVER') {
          if (input.acaoPressionada) {
            this.reiniciar();
          }
          return;
        }

        // 2. Tela de "PRONTO!" antes de começar a rodada
        if (estado === 'PRONTO') {
          timerEstado -= dt;
          if (timerEstado <= 0) {
            estado = 'JOGANDO';
          }
          return;
        }

        // 3. Fase Concluída (Piscando o labirinto antes da próxima fase)
        if (estado === 'FASE_COMPLETA') {
          timerEstado -= dt;
          if (timerEstado <= 0) {
            iniciarFase(fase + 1, true);
          }
          return;
        }

        // 4. Perda de Vida (Animação de desmaio do Tatu)
        if (estado === 'PERDENDO_VIDA') {
          atualizarTatu(tatu, dt, 'parado', grid);
          timerEstado -= dt;
          if (timerEstado <= 0) {
            if (vidas <= 0) {
              estado = 'GAMEOVER';
              ctx.finalizarJogo('gameOver');
            } else {
              renascerAposMorte();
            }
          }
          return;
        }

        // -----------------------------------------------------------
        // MODO JOGANDO NORMAL
        // -----------------------------------------------------------

        // Mapear entrada em 4 direções
        let inputDir: Direcao = 'parado';
        if (input.cima) inputDir = 'cima';
        else if (input.baixo) inputDir = 'baixo';
        else if (input.esquerda) inputDir = 'esquerda';
        else if (input.direita) inputDir = 'direita';

        // Atualizar Tatu
        atualizarTatu(tatu, dt, inputDir, grid);

        // Atualizar Sombras
        atualizarSombras(sombrasGen, dt, tatu, grid, fase);

        // Atualizar Fruta Bônus
        atualizarFruta(fruta, dt);

        // Som de Sirene de fundo (acelera conforme restam menos sementes)
        const proporcaoRestante = sementesRestantes / Math.max(1, totalSementesIniciais);
        const intervaloSirene = 0.25 + proporcaoRestante * 0.35; // 0.6s até 0.25s
        timerSirene += dt;
        if (timerSirene > intervaloSirene) {
          timerSirene = 0;
          tomSireneAlto = !tomSireneAlto;
          const freq = tomSireneAlto ? 180 : 130;
          ctx.audio.tocarTom(freq, 'sawtooth', 0.08, 0.2);
        }

        // -----------------------------------------------------------
        // COLETA DE ITENS NO LABIRINTO (SEMENTES E PIMENTAS)
        // -----------------------------------------------------------
        const colTatu = tatu.col;
        const rowTatu = tatu.row;

        if (rowTatu >= 0 && rowTatu < grid.length && colTatu >= 0 && colTatu < grid[0].length) {
          const tile = grid[rowTatu][colTatu];

          // 1. Semente pequena
          if (tile === 2) {
            grid[rowTatu][colTatu] = 0;
            sementesRestantes--;
            sementesComidasTotal++;

            ctx.hud.adicionarPontos(10);
            ctx.audio.tocar('semente');

            // Spawn de frutas brasileiras (duas vezes por fase)
            if (sementesComidasTotal === 70 || sementesComidasTotal === 170) {
              spawnarFruta(fruta, fase);
            }

            // Verifica vitória da fase ao zerar as sementes
            if (sementesRestantes <= 0) {
              estado = 'FASE_COMPLETA';
              timerEstado = 1.8;
              ctx.audio.tocar('vitoria');
              ctx.hud.adicionarPontos(500, ctx.largura / 2, 160, '#84CC16');
              return;
            }
          }

          // 2. Pimenta grande (Modo Bola)
          else if (tile === 3) {
            grid[rowTatu][colTatu] = 0;
            ctx.hud.adicionarPontos(50, tatu.x, tatu.y - 10, '#EF4444');
            ctx.audio.tocar('alerta');

            tatu.modoBola = true;
            // Duração da pimenta encurta em fases mais avançadas
            const duracaoPimenta = Math.max(3.5, 7.5 - (fase - 1) * 0.6);
            tatu.tempoModoBola = duracaoPimenta;

            assustarSombras(sombrasGen, duracaoPimenta);
          }
        }

        // 3. Coleta da Fruta Bônus
        if (fruta.ativa) {
          const distFruta = Math.hypot(tatu.x - fruta.x, tatu.y - fruta.y);
          if (distFruta < 15) {
            fruta.ativa = false;
            ctx.audio.tocar('fruta');
            ctx.hud.adicionarPontos(fruta.pontos, fruta.x, fruta.y - 12, '#FACC15');
          }
        }

        // Vida extra aos 10.000 pontos
        const pontuacaoAtual = ctx.hud.obterEstado().pontuacao;
        if (!vidaExtraConcedida && pontuacaoAtual >= 10000) {
          vidaExtraConcedida = true;
          vidas = ctx.hud.ganharVida();
          ctx.audio.tocar('item');
        }

        // -----------------------------------------------------------
        // COLISÃO ENTRE O TATU E AS SOMBRAS
        // -----------------------------------------------------------
        for (const s of sombrasGen.sombras) {
          if (s.modo === 'olhos' || s.modo === 'naToca') continue;

          const dist = Math.hypot(tatu.x - s.x, tatu.y - s.y);
          if (dist < 13) {
            // Se a sombra estiver assustada, o Tatu a derrota!
            if (s.modo === 'assustada') {
              s.modo = 'olhos';
              sombrasGen.comboDerrotas++;

              // Pontos exponenciais: 200, 400, 800, 1600
              const pontosCombo = 200 * Math.pow(2, Math.min(3, sombrasGen.comboDerrotas - 1));
              ctx.hud.adicionarPontos(pontosCombo, s.x, s.y - 12, '#38BDF8');
              ctx.audio.tocar('explosao');
            } else if (!tatu.morrendo && tatu.vivo) {
              // Colisão fatal com sombra normal
              tatu.vivo = false;
              tatu.morrendo = true;
              tatu.timerMorte = 0;
              estado = 'PERDENDO_VIDA';
              timerEstado = 1.8;

              ctx.audio.tocar('vidaPerdida');
              vidas = ctx.hud.perderVida();
              break;
            }
          }
        }
      },

      desenhar(g: CanvasRenderingContext2D) {
        // Fundo preto
        g.fillStyle = '#030712';
        g.fillRect(0, 0, ctx.largura, ctx.altura);

        // Labirinto com sementes e pimentas
        const piscar = estado === 'FASE_COMPLETA';
        renderizarLabirinto(g, grid, piscar);

        // Fruta bônus
        renderizarFruta(g, fruta);

        // Tatu herói
        renderizarTatu(g, tatu);

        // As 4 sombras
        if (estado !== 'PERDENDO_VIDA' && estado !== 'FASE_COMPLETA') {
          renderizarSombras(g, sombrasGen.sombras, sombrasGen.timerAssustado);
        }

        // HUD padrão compartilhado no topo
        ctx.hud.desenharHUD(g, ctx.largura, ctx.altura);

        // Frutas coletáveis no rodapé como troféus da fase
        const dadosFruta = obterFrutaDaFase(fase);
        g.save();
        g.font = '8px "Press Start 2P", monospace';
        g.fillStyle = '#94A3B8';
        g.textAlign = 'right';
        g.fillText(dadosFruta.nome.toUpperCase(), ctx.largura - 16, ctx.altura - 10);
        g.restore();

        // Mensagens de estado
        if (estado === 'PRONTO') {
          renderizarMensagemCentro(g, 'PRONTO!', '#FACC15', ctx.largura);
        } else if (estado === 'GAMEOVER') {
          ctx.hud.desenharGameOver(g, ctx.largura, ctx.altura, 'PRESSIONE AÇÃO / TOQUE');
          renderizarMensagemCentro(g, 'FIM DE JOGO', '#EF4444', ctx.largura);
        }
      },

      destruir() {
        grid = [];
        sombrasGen.sombras = [];
      },
    };
  },
};
