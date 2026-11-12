/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * JOGO: "Expedição Astro" (mesa de pinball da biblioteca compartilhada)
 *
 * Explore o sistema solar, acenda as constelações e complete a missão.
 */

import { EngineContext, GameInstance, GameModule } from '../../engine/types';
import { criarJogoPinball } from '../../shared/pinball';
import { ALTURA, LARGURA } from './tuning';
import { criarMesaAstro } from './mesa';
import { criarTrilhaAstro } from './musica';

export const astroGameModule: GameModule = {
  id: 'astro',
  titulo: 'Expedição Astro',
  descricao: 'Explore o sistema solar, acenda as constelações e complete a missão.',
  genero: 'Pinball',
  corTema: '#38BDF8',
  largura: LARGURA,
  altura: ALTURA,
  instrucoes: {
    historia:
      'A nave perdeu o rumo no sistema solar. Acione as 5 estações da rota, derrube as letras de ASTRO e percorra o arco em órbita para ativar o modo foguete.',
    controles: [
      'Setas esquerda/direita (ou Z e /): flippers',
      'Espaço (ou botão A): segurar para carregar o lançador, soltar para lançar',
      'X (ou botão B): empurrão (3 empurrões seguidos dão tilt)',
      'Toque na metade esquerda/direita da tela: flippers',
      'D: modo debug (mostra as colisões e os drenos por região)',
      'P: pausar · R: reiniciar · M: som · ESC: voltar ao hub',
    ],
    pontos: [
      { acao: 'Cometa (bumper)', pontos: 100 },
      { acao: 'Estação acesa', pontos: 2000 },
      { acao: 'Alvo de queda (letra de ASTRO)', pontos: 1000 },
      { acao: 'Alvo fixo (planeta)', pontos: 500 },
      { acao: 'Órbita (arco)', pontos: 1500 },
      { acao: 'Antena (spinner)', pontos: 100 },
      { acao: 'Slingshot', pontos: 10 },
    ],
  },
  teclasExtras: {
    KeyZ: 'esquerda',
    Slash: 'direita',
    // D liga/desliga o modo debug (a ação "cima" não é usada pelo pinball)
    KeyD: 'cima',
  },
  toqueTela: {
    esquerda: 'esquerda',
    direita: 'direita',
  },
  criar(ctx: EngineContext): GameInstance {
    const trilha = criarTrilhaAstro(ctx.audio);
    const tabela = criarMesaAstro();

    tabela.aoAtualizar = (dt, contexto) => {
      trilha.atualizar(dt, contexto.estado.fase === 'jogando');
    };
    tabela.aoDestruir = () => {
      trilha.desligar();
    };

    return criarJogoPinball(ctx, tabela, {
      mensagem: 'MESA DE PINBALL • 3 BOLAS',
      debug: true,
    });
  },
};
