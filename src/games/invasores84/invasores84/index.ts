/**
 * @license
 * SPDX-license-identifier: Apache-2.0
 */
import { GameModule } from '../../engine/types';
import { InputState } from '../../engine/input';
import { audioPlayer, tocarSom } from '../../engine/audio';
import { HUD } from '../../engine/hud';

export const gameModule: GameModule = {
  id: 'invasores84',
  titulo: 'Invasores Cósmicos 84',
  genero: 'Tiro de defesa',
  descricao: 'Defenda a base orbital: destrua os enxames antes que eles alcancem a estação.',
  corTema: '#00ff00',
  
  // Estados do jogo
  estados: {
    titulo: true,
    jogando: false,
    pausado: false,
    gameOver: false,
  },
  
  // Inicializar jogo
  iniciar() {
    this.estados = {
      titulo: true,
      jogando: false,
      pausado: false,
      gameOver: false,
    };
    this.novoJogo();
  },
  
  novoJogo() {
    this.pontuacao = 0;
    this.vidas = 3;
    this.onda = 1;
    this.formacao = this.gerarFormacao();
    this.bombasNaTela = 0;
    this.tirosNaTela = 0;
    this.invaderVelocidade = 200; // ms entre movimentos
    this.proximoMovimento = 0;
    this.jogador = {
      x: 240 - 16,
      y: 560 - 32,
      largura: 32,
      altura: 16,
    };
    this.disparos = [];
    this.invasoresDisparo = [];
    this.bombas = [];
    this.efeitos = [];
  },
  
  // Loop do jogo
  atualizar(dt: number) {
    if (this.estados.jogando) {
      this.atualizarJogo(dt);
    }
  },
  
  atualizarJogo(dt: number) {
    // Atualiza entrada
    this.atualizarEntrada();
    
    // Atualiza tiros
    this.atualizarTiros(dt);
    
    // Atualiza formação de invasores
    this.atualizarFormacao(dt);
    
    // Atualiza bombas
    this.atualizarBombas(dt);
    
    // Verifica colisões
    this.verificarColisoes();
    
    // Verifica fim de onda
    this.verificarFimOnda();
  },
  
  atualizarEntrada() {
    const input = InputState;
    
    // Movimento do jogador
    if (input.esquerda && this.jogador.x > 0) {
      this.jogador.x -= 100 * dt;
    }
    if (input.direita && this.jogador.x < 480 - this.jogador.largura) {
      this.jogador.x += 100 * dt;
    }
    
    // Atirar
    if (input.acao && this.tirosNaTela < 1) {
      this.disparos.push({
        x: this.jogador.x + this.jogador.largura / 2,
        y: this.jogador.y,
        largura: 8,
        altura: 20,
        velY: -400,
      });
      this.tirosNaTela = 1;
      tocarSom('tiro');
    }
  },
  
  atualizarTiros(dt: number) {
    // Atualiza tiros do jogador
    for (let i = this.disparos.length - 1; i >= 0; i--) {
      const tiro = this.disparos[i];
      tiro.y += tiro.velY * dt;
      
      // Remove tiro se sair da tela
      if (tiro.y < 0) {
        this.disparos.splice(i, 1);
        this.tirosNaTela = 0;
      }
    }
    
    // Atualiza invasor disparos
    for (let i = this.invasoresDisparo.length - 1; i >= 0; i--) {
      const bomba = this.invasoresDisparo[i];
      bomba.y += bomba.velY * dt;
      
      // Remove bomba se sair da tela
      if (bomba.y > 560) {
        this.invasoresDisparo.splice(i, 1);
      }
    }
    
    // Atualiza efeitos
    for (let i = this.efeitos.length - 1; i >= 0; i--) {
      const efeito = this.efeitos[i];
      efeito.tempoVida -= dt;
      if (efeito.tempoVida <= 0) {
        this.efeitos.splice(i, 1);
      }
    }
  },
  
  atualizarFormacao(dt: number) {
    this.proximoMovimento -= dt;
    
    if (this.proximoMovimento <= 0) {
      this.proximoMovimento = this.invaderVelocidade;
      
      // Move a formação
      let moveX = 16;
      let moveY = 0;
      
      // Verifica se precisa inverter direção
      const bordaEsquerda = this.formacao.some(invader => invader.x <= 8);
      const bordaDireita = this.formacao.some(invader => invader.x >= 480 - 8 - 32);
      
      if (bordaEsquerda || bordaDireita) {
        moveY = 16;
        moveX = bordaDireita ? 16 : -16;
        // Inverte direção de todos
        this.formacao.forEach(invader => {
          invader.direcao *= -1;
        });
      }
      
      // Move todos os invasores
      this.formacao.forEach(invader => {
        invader.x += moveX * invader.direcao;
        if (moveY > 0) {
          invader.y += moveY;
        }
      });
      
      // Verifica se invasores chegaram à base
      if (this.formacao.some(invader => invader.y >= 560 - 32)) {
        this.estados.gameOver = true;
      }
    }
  },
  
  gerarFormacao() {
    const formacao = [];
    const tipos = [1, 2, 3]; // 3 tipos de invasores
    
    // 5 fileiras x 10 colunas = 50 invasores
    for (let fileira = 0; fileira < 5; fileira++) {
      for (let coluna = 0; coluna < 10; coluna++) {
        const x = 80 + coluna * 52;
        const y = 40 + fileira * 40;
        const tipo = tipos[Math.min(fileira, 2)];
        
        formacao.push({
          x,
          y,
          largura: 32,
          altura: 32,
          tipo,
          vidas: 1,
        });
      }
    }
    
    return formacao;
  },
  
  verificarColisoes() {
    // Verifica colisões tiros vs invasores
    for (let i = this.disparos.length - 1; i >= 0; i--) {
      const tiro = this.disparos[i];
      
      for (let j = this.formacao.length - 1; j >= 0; j--) {
        const invader = this.formacao[j];
        
        if (tiro.x < invader.x + invader.largura &&
            tiro.x + tiro.largura > invader.x &&
            tiro.y < invader.y + invader.altura &&
            tiro.y + tiro.altura > invader.y) {
          
          // Remove tiro e inimigo
          this.disparos.splice(i, 1);
          this.tirosNaTela = 0;
          this.formacao.splice(j, 1);
          
          // Pontuação
          const pontos = this.calcularPontos(invader.tipo);
          this.pontuacao += pontos;
          
          // Efeito de explosão
          this.efeitos.push({
            x: invader.x,
            y: invader.y,
            tempoVida: 100,
          });
          
          // Tiro pode continuar se houver outro
          break;
        }
      }
    }
    
    // Verifica colisões invasores vs jogador
    for (let i = this.invasoresDisparo.length - 1; i >= 0; i--) {
      const bomba = this.invasoresDisparo[i];
      
      if (bomba.x < this.jogador.x + this.jogador.largura &&
          bomba.x + bomba.largura > this.jogador.x &&
          bomba.y < this.jogador.y + this.jogador.altura &&
          bomba.y + bomba.altura > this.jogador.y) {
        
        this.vidas--;
        this.novoJogo();
        this.estados.gameOver = this.vidas <= 0;
        tocarSom('canhao_atingido');
        break;
      }
    }
    
    // Verifica colisões invasores vs abrigos (se existirem)
    // ... (implementação simplificada)
  },
  
  calcularPontos(tipo: number) {
    switch (tipo) {
      case 1: return 100; // Larva-metal
      case 2: return 200; // Libélula-sonda
      case 3: return 300; // Cristal-vigia
      default: return 100;
    }
  },
  
  verificarFimOnda() {
    if (this.formacao.length === 0) {
      // Próxima onda
      this.onda++;
      this.invaderVelocidade = Math.max(50, this.invaderVelocidade - 20);
      this.formacao = this.gerarFormacao();
      this.formacao = this.deslocarFormacaoAbaixo();
    }
  },
  
  deslocarFormacaoAbaixo() {
    return this.formacao.map(invader => ({
      ...invader,
      y: invader.y + 16,
    }));
  },
  
  // Desenho
  desenhar(ctx: CanvasRenderingContext2D) {
    // Fundo
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, 480, 560);
    
    // Desenha formação
    this.formacao.forEach(invader => this.desenharInvasor(ctx, invader));
    
    // Desenha jogador
    this.desenharJogador(ctx);
    
    // Desenha tiros
    this.disparos.forEach(tiro => this.desenharTiro(ctx, tiro));
    this.invasoresDisparo.forEach(bomba => this.desenharBomba(ctx, bomba));
    
    // Desenha efeitos
    this.efeitos.forEach(efeito => this.desenharEfeito(ctx, efeito));
    
    // HUD
    this.desenharHUD(ctx);
  },
  
  desenharInvasor(ctx: CanvasRenderingContext2D, invader: any) {
    ctx.fillStyle = invader.tipo === 1 ? '#ff0000' : invader.tipo === 2 ? '#00ff00' : '#0000ff';
    ctx.fillRect(invader.x, invader.y, invader.largura, invader.altura);
  },
  
  desenharJogador(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = '#ffff00';
    ctx.fillRect(this.jogador.x, this.jogador.y, this.jogador.largura, this.jogador.altura);
  },
  
  desenharTiro(ctx: CanvasRenderingContext2D, tiro: any) {
    ctx.fillStyle = '#ffff00';
    ctx.fillRect(tiro.x, tiro.y, tiro.largura, tiro.altura);
  },
  
  desenharBomba(ctx: CanvasRenderingContext2D, bomba: any) {
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(bomba.x, bomba.y, bomba.largura, bomba.altura);
  },
  
  desenharEfeito(ctx: CanvasRenderingContext2D, efeito: any) {
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = Math.min(1, efeito.tempoVida / 1000);
    ctx.fillRect(efeito.x, efeito.y, 8, 8);
    ctx.globalAlpha = 1;
  },
  
  desenharHUD(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = '#00ff00';
    ctx.font = '16px monospace';
    ctx.fillText(`Pontos: ${this.pontuacao}`, 8, 20);
    ctx.fillText(`Onda: ${this.onda}`, 8, 40);
    ctx.fillText(`Vidas: ${this.vidas}`, 8, 60);
  },
  
  // Eventos
  onTeclaDown(key: string) {
    // Pode ser usado para teclado físico
  },
  
  onTouch(touch: any) {
    // Controle touch
  },
  
  pausar() {
    this.estados.pausado = true;
  },
  
  resumir() {
    this.estados.pausado = false;
  },
  
  gameOver() {
    this.estados.gameOver = true;
    tocarSom('game_over');
  },
  
  // Pontuação
  pontuacao: number,
  vidas: number,
  onda: number,
};