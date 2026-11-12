/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * JOGO: "Noite na Gafieira" (mesa de pinball da biblioteca compartilhada)
 *
 * Uma noite de samba em uma gafieira carioca dos anos 70: sala de baile,
 * bola de espelhos, tamborins, letras de SAMBA e um pandeiro que gira.
 */

import { EngineContext, GameInstance, GameModule } from '../../engine/types';
import { criarJogoPinball } from '../../shared/pinball';
import { ALTURA, LARGURA } from './constantes';
import { criarMesaGafieira } from './mesa';
import { criarMusicaSamba } from './musica';

export const gafieiraGameModule: GameModule = {
  id: 'gafieira',
  titulo: 'Noite na Gafieira',
  descricao:
    'Uma noite de samba em uma gafieira carioca: acenda as letras e faça o salão vibrar.',
  genero: 'Pinball',
  corTema: '#EC4899',
  largura: LARGURA,
  altura: ALTURA,
  instrucoes: {
    historia:
      'O clube está lotado e o pandeiro não para. Use a mochila e os flips para derrubar as letras de SAMBA, completar o trio de instrumentos e resgatar a noite da gafieira.',
    controles: [
      'Setas esquerda/direita (ou Z e /): flippers',
      'Espaço (ou botão A): segurar para carregar o lançador, soltar para lançar',
      'X (ou botão B): empurrão (3 empurrões seguidos dão tilt)',
      'Toque na metade esquerda/direita da tela: flippers',
      'P: pausar · R: reiniciar · M: som · ESC: voltar ao hub',
    ],
    pontos: [
      { acao: 'Bumper (tamborim)', pontos: 100 },
      { acao: 'Alvo de queda (letra de SAMBA)', pontos: 1000 },
      { acao: 'Alvo fixo (cavaquinho, surdo, tamborim)', pontos: 500 },
      { acao: 'Spinner (pandeiro)', pontos: 100 },
      { acao: 'Slingshot', pontos: 10 },
      { acao: 'Pistas do topo (PALCO)', pontos: 5000 },
      { acao: 'Trio de instrumentos completo', pontos: 3000 },
    ],
  },
  teclasExtras: {
    KeyZ: 'esquerda',
    Slash: 'direita',
  },
  toqueTela: {
    esquerda: 'esquerda',
    direita: 'direita',
  },
  criar(ctx: EngineContext): GameInstance {
    const musica = criarMusicaSamba(ctx.audio);
    const tabela = criarMesaGafieira();

    tabela.aoAtualizar = (dt, contexto) => {
      musica.atualizar(dt, contexto.estado.fase === 'jogando');
    };
    tabela.aoPausar = () => {
      // A trilha para junto com o laço do motor (pausa do jogo).
    };
    tabela.aoDestruir = () => {
      musica.desligar();
    };

    return criarJogoPinball(ctx, tabela, {
      mensagem: 'MESA DE PINBALL • 3 BOLAS',
    });
  },
};
