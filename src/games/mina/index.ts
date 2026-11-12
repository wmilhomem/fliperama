import { EngineContext, GameInstance, GameModule, InputState } from '../../engine/types';
import { desenharCristal, desenharHeroina, desenharLampada, desenharMinerador } from './arte';
import { atualizarCamera, criarCamera } from './camera';
import { desenharFundo, desenharDecoracaoSalas, desenharTiles, desenharTrilhos } from './cenario';
import {
  ALTURA,
  CORES,
  DINAMITE_RAIO,
  ENERGY_MAX,
  LASER_CALOR_MAX,
  LASER_DANO_INTERVALO,
  LASER_TRAVA,
  LARGURA,
  MORTE_TEMPO,
  PONTOS,
  PONTOS_VIDA_EXTRA,
  RESGATE_TEMPO,
  SALA_ALTURA,
  TILE,
  TILE_FRAGIL,
  TILE_LAVA_PAREDE,
  TILE_VAZIO,
  VIDAS_INICIAIS,
  VIDAS_MAX,
} from './constantes';
import {
  atualizarCriaturas,
  caixaCriatura,
  criarCriaturasDaSala,
  criarCriaturasDoMapa,
  desenharCriaturas,
} from './criaturas';
import { atualizarDinamite, criarDinamite, desenharDinamite } from './dinamite';
import { caixasSobrepostas } from './fisica';
import {
  atualizarHeroina,
  caixaHeroina,
  centroHeroina,
  criarHeroina,
  reiniciarHeroina,
} from './heroina';
import { desenharHUDJogo, desenharResgate, desenharTitulo } from './hud';
import { desenharEscuridao } from './iluminacao';
import { caixaLaser, calcularLaser, criarLaser, desenharLaser } from './laser';
import {
  apagarLava,
  atualizarLavaApagada,
  atualizarLavaMoveis,
  criarMapa,
  eLava,
  rectColideSolido,
  rectEmLava,
  salaEm,
} from './mapa';
import { atualizarMusica, criarMusica, resetarMusica } from './musica';
import {
  atualizarEfeitos,
  criarExplosao,
  criarFaisca,
  criarFumaca,
  criarTexto,
  desenharParticulas,
  desenharTextos,
} from './particulas';
import {
  Camera,
  Criatura,
  Dinamite,
  EstadoHUD,
  EstadoJogo,
  FonteLuz,
  GotaLava,
  Heroina,
  Laser,
  MapaMina,
  Particula,
  TextoFlutuante,
  TipoCriatura,
} from './tipos';

const PONTOS_CRIATURA: Record<TipoCriatura, number> = {
  morcego: PONTOS.morcego,
  aranha: PONTOS.aranha,
  cobra: PONTOS.cobra,
  mariposa: PONTOS.mariposa,
  piranha: 0,
};

const NOME_CRIATURA: Record<TipoCriatura, string> = {
  morcego: 'MORCEGO',
  aranha: 'ARANHA',
  cobra: 'COBRA',
  mariposa: 'MARIPOSA',
  piranha: 'PIRANHA',
};

export const minaGameModule: GameModule = {
  id: 'mina',
  titulo: 'Resgate Subterrâneo',
  descricao:
    'Voe pela mina com sua mochila turbo, exploda paredes e resgate o mineiro preso.',
  genero: 'Aventura de resgate',
  corTema: '#FBBF24',
  largura: LARGURA,
  altura: ALTURA,
  instrucoes: {
    historia:
      'Rô é uma bombeira de resgate com uma mochila turbo. Um mineiro ficou preso nas galerias mais profundas, entre lava, água e criaturas. Use o laser de calor para abrir caminho, plante dinamite nas paredes frágeis e ilumine as salas escuras antes que a energia acabe.',
    controles: [
      'Setas / WASD / D-Pad: andar, mergulhar e voar com a mochila turbo',
      'A / Espaço / Botão A: laser de calor (cuidado com o superaquecimento)',
      'B / X / Botão B: plantar dinamite (máximo de uma por vez)',
      'P: pausar • R: reiniciar • M: som • ESC: voltar ao hub',
    ],
    pontos: [
      { acao: 'Morcego', pontos: PONTOS.morcego },
      { acao: 'Aranha', pontos: PONTOS.aranha },
      { acao: 'Cobra', pontos: PONTOS.cobra },
      { acao: 'Mariposa', pontos: PONTOS.mariposa },
      { acao: 'Sala explorada', pontos: PONTOS.sala },
      { acao: 'Cristal', pontos: 500 },
      { acao: 'Resgate do mineiro', pontos: 1000 },
    ],
  },

  criar(ctx: EngineContext): GameInstance {
    let estado: EstadoJogo = 'titulo';
    let tempo = 0;
    let tempoEstado = 0;
    let fase = 1;
    let vidas = VIDAS_INICIAIS;
    let proximaVidaExtra = PONTOS_VIDA_EXTRA;
    let mapa: MapaMina = criarMapa(1);
    let heroina: Heroina = criarHeroina(mapa.inicio);
    let camera: Camera = criarCamera(heroina.x, heroina.y);
    let laser: Laser = criarLaser();
    let criaturas: Criatura[] = criarCriaturasDoMapa(mapa, 1);
    let dinamite: Dinamite | null = null;
    let dinamites = 6;
    let particulas: Particula[] = [];
    let textos: TextoFlutuante[] = [];
    let gotas: GotaLava[] = [];
    let musica = criarMusica();
    let salaAtual = 0;
    let salaAnterior = -1;
    let salasVisitadas = new Set<number>();
    let cristaisColetados = 0;
    let flash = 0;
    let resgateBonus = 0;
    let bonusEnergia = 0;
    let bonusDinamites = 0;
    let bonusExploracao = 0;
    let timerGota = 1.5;
    let timerPropulsor = 0;
    let timerLaserSom = 0;
    let origemMorte: TipoCriatura | 'lava' | 'energia' | 'explosao' | 'queda' = 'lava';

    function configurarPartida(): void {
      estado = 'titulo';
      tempo = 0;
      tempoEstado = 0;
      fase = 1;
      vidas = VIDAS_INICIAIS;
      proximaVidaExtra = PONTOS_VIDA_EXTRA;
      mapa = criarMapa(1);
      heroina = criarHeroina(mapa.inicio);
      camera = criarCamera(heroina.x, heroina.y);
      laser = criarLaser();
      criaturas = criarCriaturasDoMapa(mapa, 1);
      dinamite = null;
      dinamites = 6;
      particulas = [];
      textos = [];
      gotas = [];
      musica = criarMusica();
      salaAtual = mapa.salaInicial;
      salaAnterior = -1;
      salasVisitadas = new Set<number>();
      cristaisColetados = 0;
      flash = 0;
      resgateBonus = 0;
      bonusEnergia = 0;
      bonusDinamites = 0;
      bonusExploracao = 0;
      timerGota = 1.5;
      timerPropulsor = 0;
      timerLaserSom = 0;

      ctx.hud.definirEstado({
        pontuacao: 0,
        recorde: ctx.storage.lerRecorde(ctx.id),
        vidas,
        fase,
        vidasMax: VIDAS_MAX,
        bonus: 0,
      });
    }

    function totalDinamitesFase(): number {
      return Math.max(2, 6 - Math.floor(fase / 2));
    }

    function iniciarFase(): void {
      mapa = criarMapa(fase);
      heroina = criarHeroina(mapa.inicio);
      camera = criarCamera(heroina.x, heroina.y);
      laser = criarLaser();
      criaturas = criarCriaturasDaSala(mapa, mapa.salaInicial, fase);
      dinamite = null;
      dinamites = totalDinamitesFase();
      particulas = [];
      textos = [];
      gotas = [];
      salaAtual = mapa.salaInicial;
      salaAnterior = -1;
      salasVisitadas = new Set<number>();
      cristaisColetados = 0;
      flash = 0;
      resgateBonus = 0;
      bonusEnergia = 0;
      bonusDinamites = 0;
      bonusExploracao = 0;
      timerGota = 1.5;
      timerPropulsor = 0;
      timerLaserSom = 0;
      resetarMusica(musica);

      ctx.hud.definirEstado({
        vidas,
        fase,
        vidasMax: VIDAS_MAX,
        bonus: 0,
      });
      estado = 'jogando';
      tempoEstado = 0;
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
      cor: string = CORES.ouro
    ): void {
      const pontos = Math.floor(valor);
      if (pontos <= 0) return;
      ctx.hud.adicionarPontos(pontos);
      if (x !== undefined && y !== undefined) criarTexto(textos, x, y, `+${pontos}`, cor);

      const pontuacao = ctx.hud.obterEstado().pontuacao;
      while (pontuacao >= proximaVidaExtra) {
        proximaVidaExtra += PONTOS_VIDA_EXTRA;
        if (vidas < VIDAS_MAX) {
          vidas += 1;
          ctx.hud.definirEstado({ vidas, vidasMax: VIDAS_MAX });
          ctx.audio.tocar('item');
          criarTexto(textos, heroina.x, heroina.y - 18, '+1 VIDA', CORES.verdeClaro);
        }
      }
    }

    function perderVida(motivo: typeof origemMorte): void {
      if (estado !== 'jogando') return;
      origemMorte = motivo;
      laser.ativo = false;
      vidas = ctx.hud.perderVida();
      ctx.audio.tocar('vidaPerdida');
      flash = 0.7;
      camera.tremor = 0.9;
      const c = centroHeroina(heroina);
      criarExplosao(particulas, c.x, c.y);
      criarTexto(
        textos,
        c.x,
        c.y - 24,
        motivo === 'energia' ? 'ENERGIA ZERO!' : 'CUIDADO!',
        CORES.vermelho
      );

      if (vidas <= 0) {
        estado = 'gameover';
        tempoEstado = 0;
        ctx.hud.definirEstado({ vidas: 0, fase, vidasMax: VIDAS_MAX, bonus: 0 });
        ctx.finalizarJogo('gameOver');
        return;
      }

      estado = 'morrendo';
      tempoEstado = MORTE_TEMPO;
      ctx.hud.definirEstado({ vidas, fase, vidasMax: VIDAS_MAX, bonus: 0 });
    }

    function renascer(): void {
      reiniciarHeroina(heroina, mapa.inicio);
      camera = criarCamera(heroina.x, heroina.y);
      laser = criarLaser();
      dinamite = null;
      dinamites = Math.max(1, totalDinamitesFase());
      criaturas = criarCriaturasDoMapa(mapa, fase);
      gotas = [];
      salaAtual = mapa.salaInicial;
      salaAnterior = -1;
      estado = 'jogando';
      tempoEstado = 0;
      ctx.audio.tocar('abastecer');
      criarTexto(textos, heroina.x, heroina.y - 20, 'MOCHILA RECARREGADA', CORES.verdeClaro);
    }

    function concluirResgate(): void {
      if (estado !== 'jogando') return;

      bonusEnergia = Math.floor(heroina.energia) * 100;
      bonusDinamites = dinamites * 50;
      bonusExploracao = cristaisColetados * PONTOS.exploracao;
      resgateBonus = PONTOS.resgateBase + bonusEnergia + bonusDinamites + bonusExploracao;

      concederPontos(
        resgateBonus,
        mapa.minerador.x,
        mapa.minerador.y - 28,
        CORES.ouroClaro
      );
      ctx.storage.salvarRecorde(ctx.id, ctx.hud.obterEstado().pontuacao);
      ctx.audio.tocar('vitoria');
      ctx.audio.tocar('abastecer');
      flash = 0.45;
      camera.tremor = 0.4;
      for (let i = 0; i < 34; i++) {
        criarFaisca(
          particulas,
          mapa.minerador.x + (Math.random() - 0.5) * 90,
          mapa.minerador.y - 20 + Math.random() * 34,
          i % 2 === 0 ? CORES.ouro : CORES.verdeClaro,
          2,
          160,
          140
        );
      }

      estado = 'resgate';
      tempoEstado = RESGATE_TEMPO;
      laser.ativo = false;
      ctx.hud.definirEstado({ vidas, fase, vidasMax: VIDAS_MAX, bonus: 0 });
    }

    function avancarFase(): void {
      fase += 1;
      ctx.hud.definirFase(fase);
      ctx.audio.tocar('item');
      iniciarFase();
    }

    function quebrarParedeFragil(tx: number, ty: number): boolean {
      if (mapa.tiles[ty * mapa.largura + tx] !== TILE_FRAGIL) return false;
      const indice = ty * mapa.largura + tx;
      const hp = (mapa.fragilHp.get(indice) ?? 3) - 1;
      if (hp <= 0) {
        mapa.fragilHp.delete(indice);
        mapa.tiles[indice] = TILE_VAZIO;
        return true;
      }
      mapa.fragilHp.set(indice, hp);
      return false;
    }

    function acenderLampadasNoRaio(): void {
      if (!laser.ativo) return;
      const caixaL = caixaLaser(laser);
      for (const lampada of mapa.lampadas) {
        if (lampada.acesa) continue;
        if (
          caixasSobrepostas(caixaL, {
            x: lampada.x - 5,
            y: lampada.y - 9,
            largura: 14,
            altura: 22,
          })
        ) {
          lampada.acesa = true;
          lampada.brilho = 1;
          ctx.audio.tocar('cristal');
          criarFaisca(particulas, lampada.x + 2, lampada.y + 4, CORES.ouroClaro, 16, 120, 40);
          criarTexto(textos, lampada.x + 8, lampada.y - 8, 'LUZ!', CORES.ouroClaro);
        }
      }
    }

    function atualizarLaser(dt: number, input: InputState): void {
      laser.tempoDano = Math.max(0, laser.tempoDano - dt);
      laser.tempoSom = Math.max(0, laser.tempoSom - dt);

      if (heroina.travado) {
        heroina.tempoTrava = Math.max(0, heroina.tempoTrava - dt);
        laser.calor = Math.max(0, laser.calor - dt * 0.9);
        if (heroina.tempoTrava <= 0) heroina.travado = false;
      }

      const querAtirar = input.acao && !heroina.travado && heroina.energia > 0;

      if (querAtirar) {
        laser.ativo = true;
        calcularLaser(laser, heroina, mapa);
        heroina.energia = Math.max(0, heroina.energia - 1.5 * dt);
        heroina.calor = Math.min(LASER_CALOR_MAX, heroina.calor + dt);
        laser.calor = heroina.calor / LASER_CALOR_MAX;

        if (heroina.calor >= LASER_CALOR_MAX && !heroina.travado) {
          heroina.travado = true;
          heroina.tempoTrava = LASER_TRAVA;
          laser.calor = 1;
          ctx.audio.tocar('alerta');
          criarTexto(textos, heroina.x, heroina.y - 14, 'SUPERAQUECEU!', CORES.vermelho);
        }

        if (laser.tempoSom <= 0) {
          ctx.audio.tocarTom(940 + Math.sin(tempo * 30) * 70, 'sawtooth', 0.075, 0.045);
          laser.tempoSom = 0.11;
        }

        acenderLampadasNoRaio();
        const caixaL = caixaLaser(laser);

        for (const criatura of criaturas) {
          if (!criatura.vivo) continue;
          if (caixasSobrepostas(caixaL, caixaCriatura(criatura))) {
            criatura.vivo = false;
            const pts = PONTOS_CRIATURA[criatura.tipo];
            criarExplosao(particulas, criatura.x + criatura.largura / 2, criatura.y + criatura.altura / 2);
            ctx.audio.tocar('rochaPequena');
            if (pts > 0) {
              concederPontos(pts, criatura.x, criatura.y - 8, CORES.amarelo);
              criarTexto(textos, criatura.x, criatura.y - 20, NOME_CRIATURA[criatura.tipo], CORES.ouroClaro);
            }
          }
        }

        if (laser.tempoDano <= 0) {
          const tx = Math.floor((laser.x2 + heroina.olhando * 2) / TILE);
          const ty = Math.floor(laser.y1 / TILE);
          if (mapa.tiles[ty * mapa.largura + tx] === TILE_FRAGIL) {
            const destruida = quebrarParedeFragil(tx, ty);
            laser.tempoDano = LASER_DANO_INTERVALO;
            ctx.audio.tocar(destruida ? 'rochaMedia' : 'rochaPequena');
            criarFaisca(particulas, laser.x2, laser.y1, CORES.fragilClara, destruida ? 14 : 6, 90, 130);
            if (destruida) {
              criarFumaca(particulas, tx * TILE + 8, ty * TILE + 8);
            }
          }
        }
      } else {
        laser.ativo = false;
        heroina.calor = Math.max(0, heroina.calor - dt * 1.25);
        laser.calor = heroina.calor / LASER_CALOR_MAX;
      }

      if (heroina.energia <= 0) {
        perderVida('energia');
      }
    }

    function explodirDinamite(explosao: Dinamite): void {
      const cx = explosao.x + explosao.largura / 2;
      const cy = explosao.y + explosao.altura / 2;
      criarExplosao(particulas, cx, cy);
      criarFumaca(particulas, cx, cy);
      ctx.audio.tocar('explosao');
      flash = 0.5;
      camera.tremor = 1.1;

      const raioTiles = Math.ceil((DINAMITE_RAIO + 10) / TILE);
      const txCentro = Math.floor(cx / TILE);
      const tyCentro = Math.floor(cy / TILE);

      for (let ty = tyCentro - raioTiles; ty <= tyCentro + raioTiles; ty++) {
        for (let tx = txCentro - raioTiles; tx <= txCentro + raioTiles; tx++) {
          if (tx < 0 || ty < 0 || tx >= mapa.largura || ty >= mapa.altura) continue;
          const dx = tx * TILE + TILE / 2 - cx;
          const dy = ty * TILE + TILE / 2 - cy;
          if (Math.hypot(dx, dy) > DINAMITE_RAIO + 9) continue;
          const indice = ty * mapa.largura + tx;
          const tile = mapa.tiles[indice];
          if (tile === TILE_FRAGIL) {
            mapa.fragilHp.delete(indice);
            mapa.tiles[indice] = TILE_VAZIO;
          } else if (tile === TILE_LAVA_PAREDE) {
            apagarLava(mapa, tx, ty);
            criarFumaca(particulas, tx * TILE + 8, ty * TILE + 8);
          }
        }
      }

      for (const criatura of criaturas) {
        if (!criatura.vivo) continue;
        const dx = criatura.x + criatura.largura / 2 - cx;
        const dy = criatura.y + criatura.altura / 2 - cy;
        if (Math.hypot(dx, dy) <= DINAMITE_RAIO + 10) {
          criatura.vivo = false;
          const pts = PONTOS_CRIATURA[criatura.tipo];
          if (pts > 0) {
            concederPontos(pts, criatura.x, criatura.y - 8, CORES.laranja);
          }
        }
      }

      const dxHero = heroina.x + heroina.largura / 2 - cx;
      const dyHero = heroina.y + heroina.altura / 2 - cy;
      if (Math.hypot(dxHero, dyHero) < DINAMITE_RAIO + 8) {
        perderVida('explosao');
      }
    }

    function atualizarDinamites(dt: number, input: InputState): void {
      if (input.acao2Pressionada && !dinamite && dinamites > 0 && estado === 'jogando') {
        dinamite = criarDinamite(heroina);
        dinamites -= 1;
        ctx.audio.tocar('item');
        criarTexto(textos, heroina.x, heroina.y - 12, 'DINAMITE!', CORES.laranja);
      }

      if (!dinamite) return;
      const explodiu = atualizarDinamite(dinamite, dt, mapa);
      if (explodiu) {
        const explosao = dinamite;
        dinamite = null;
        explodirDinamite(explosao);
      }
    }

    function atualizarGotas(dt: number): void {
      const sala = mapa.salas[salaAtual];
      if (sala && sala.temLava && sala.indice > 0) {
        timerGota -= dt;
        if (timerGota <= 0 && gotas.length < 5) {
          gotas.push({
            x: (sala.x + 2 + Math.random() * (sala.largura - 4)) * TILE,
            y: (sala.y + 1) * TILE,
            vy: 20,
            ativa: true,
            tempo: 0,
          });
          timerGota = 1.1 + Math.random() * 1.6;
        }
      }

      for (const gota of gotas) {
        if (!gota.ativa) continue;
        gota.tempo += dt;
        gota.vy = Math.min(260, gota.vy + 420 * dt);
        gota.y += gota.vy * dt;
        const caixa = { x: gota.x - 3, y: gota.y - 4, largura: 6, altura: 9 };

        if (eLava(mapa, Math.floor(gota.x / TILE), Math.floor(gota.y / TILE))) {
          gota.ativa = false;
          criarFaisca(particulas, gota.x, gota.y, CORES.lavaClara, 5, 55, 140);
          continue;
        }
        if (rectColideSolido(mapa, caixa)) {
          gota.ativa = false;
          criarFaisca(particulas, gota.x, gota.y, CORES.laranja, 4, 45, 160);
          continue;
        }
        if (caixasSobrepostas(caixa, caixaHeroina(heroina))) {
          gota.ativa = false;
          perderVida('lava');
          return;
        }
        if (gota.y > (sala.y + SALA_ALTURA) * TILE + 40) gota.ativa = false;
      }

      gotas = gotas.filter((gota) => gota.ativa);
    }

    function verificarPerigos(): void {
      if (rectEmLava(mapa, caixaHeroina(heroina))) {
        perderVida('lava');
        return;
      }

      for (const lava of mapa.lavaMoveis) {
        if (
          caixasSobrepostas(caixaHeroina(heroina), {
            x: lava.x,
            y: lava.y,
            largura: lava.largura,
            altura: lava.altura,
          })
        ) {
          perderVida('lava');
          return;
        }
      }

      for (const criatura of criaturas) {
        if (!criatura.vivo) continue;
        if (caixasSobrepostas(caixaHeroina(heroina), caixaCriatura(criatura))) {
          perderVida(criatura.tipo);
          return;
        }
      }
    }

    function coletarCristais(): void {
      for (const cristal of mapa.cristais) {
        if (cristal.coletado) continue;
        cristal.tempo += 0.016;
        if (
          caixasSobrepostas(caixaHeroina(heroina), {
            x: cristal.x - 7,
            y: cristal.y - 7,
            largura: 14,
            altura: 14,
          })
        ) {
          cristal.coletado = true;
          cristaisColetados += 1;
          ctx.audio.tocar('cristal');
          criarFaisca(particulas, cristal.x, cristal.y, cristal.cor, 14, 110, 40);
          concederPontos(cristal.pontos, cristal.x, cristal.y - 8, cristal.cor);
        }
      }
    }

    function atualizarSala(): void {
      const c = centroHeroina(heroina);
      const encontrada = salaEm(mapa, c.x, c.y);
      if (encontrada < 0 || encontrada === salaAnterior) return;

      salaAtual = encontrada;
      salaAnterior = encontrada;
      criaturas = criarCriaturasDaSala(mapa, encontrada, fase);
      if (encontrada !== mapa.salaInicial && !salasVisitadas.has(encontrada)) {
        salasVisitadas.add(encontrada);
        concederPontos(PONTOS.sala, c.x, c.y - 18, CORES.ouroClaro);
      }
      gotas = gotas.filter((gota) => gota.ativa);
    }

    function atualizarJogo(dt: number, input: InputState): void {
      flash = Math.max(0, flash - dt * 1.8);
      const sala = mapa.salas[salaAtual];
      atualizarLavaApagada(mapa, dt);
      atualizarLavaMoveis(mapa, dt);
      atualizarMusica(musica, ctx.audio, dt, true, sala?.escura ?? false, fase);
      atualizarSala();

      const resultado = atualizarHeroina(heroina, input, dt, mapa);
      if (resultado.semEnergia) {
        perderVida('energia');
        return;
      }

      if (resultado.propulsor) {
        timerPropulsor -= dt;
        if (timerPropulsor <= 0) {
          ctx.audio.tocar('propulsor');
          timerPropulsor = 0.15;
          const c = centroHeroina(heroina);
          criarFaisca(particulas, c.x - heroina.olhando * 4, heroina.y + 26, CORES.lavaClara, 1, 25, -60);
        }
      }

      atualizarLaser(dt, input);
      if (estado !== 'jogando') return;

      atualizarDinamites(dt, input);
      if (estado !== 'jogando') return;

      atualizarCriaturas(criaturas, dt, heroina, mapa, sala?.escura ?? false, fase);
      atualizarGotas(dt);
      if (estado !== 'jogando') return;

      coletarCristais();
      verificarPerigos();
      if (estado !== 'jogando') return;

      if (
        caixasSobrepostas(caixaHeroina(heroina), {
          x: mapa.minerador.x - 11,
          y: mapa.minerador.y - 27,
          largura: 22,
          altura: 27,
        })
      ) {
        concluirResgate();
        return;
      }

      for (const lampada of mapa.lampadas) {
        lampada.brilho = Math.max(0, lampada.brilho - dt * 0.3);
      }

      const centroJogador = centroHeroina(heroina);
      atualizarCamera(camera, centroJogador.x + heroina.olhando * 18, centroJogador.y, dt);
      atualizarEfeitos(particulas, textos, dt);
    }

    function atualizarMorrendo(dt: number): void {
      atualizarMusica(musica, ctx.audio, dt, false, false, fase);
      flash = Math.max(0, flash - dt * 1.8);
      atualizarEfeitos(particulas, textos, dt);
      tempoEstado -= dt;
      if (tempoEstado <= 0) renascer();
    }

    function atualizarResgate(dt: number, input: InputState): void {
      atualizarMusica(musica, ctx.audio, dt, false, false, fase);
      atualizarEfeitos(particulas, textos, dt);
      tempoEstado -= dt;
      if (tempoEstado <= 0 || input.acaoPressionada || input.acao2Pressionada) {
        avancarFase();
      }
    }

    function construirFontesLuz(): FonteLuz[] {
      const fontes: FonteLuz[] = [
        {
          x: heroina.x + heroina.largura / 2,
          y: heroina.y + 12,
          raio: 74,
          forca: 1,
          cor: CORES.ouroClaro,
        },
      ];
      for (const lampada of mapa.lampadas) {
        if (lampada.acesa) {
          fontes.push({
            x: lampada.x + 2,
            y: lampada.y + 4,
            raio: 94,
            forca: 0.9,
            cor: CORES.ouroClaro,
          });
        }
      }
      return fontes;
    }

    function desenharMundo(g: CanvasRenderingContext2D): void {
      const tremorX = Math.sin(tempo * 91) * camera.tremor * 4;
      const tremorY = Math.cos(tempo * 73) * camera.tremor * 3;
      desenharFundo(g, camera, tempo);

      g.save();
      g.translate(-Math.round(camera.x) + tremorX, -Math.round(camera.y) + tremorY);
      desenharDecoracaoSalas(g, mapa, tempo);
      desenharTiles(g, mapa, camera, tempo);
      desenharTrilhos(g, mapa);

      for (const lava of mapa.lavaMoveis) {
        g.save();
        const gradiente = g.createLinearGradient(lava.x, 0, lava.x + lava.largura, 0);
        gradiente.addColorStop(0, 'rgba(239, 68, 68, 0.25)');
        gradiente.addColorStop(0.5, CORES.lavaClara);
        gradiente.addColorStop(1, 'rgba(239, 68, 68, 0.25)');
        g.fillStyle = gradiente;
        g.fillRect(lava.x, lava.y, lava.largura, lava.altura);
        g.fillStyle = CORES.lava;
        g.fillRect(lava.x + 1, lava.y, 2, lava.altura);
        g.fillStyle = CORES.ouroClaro;
        g.fillRect(lava.x + 3, lava.y + (tempo * 30) % lava.altura, 2, 5);
        g.restore();
      }

      for (const cristal of mapa.cristais) desenharCristal(g, cristal, tempo);
      for (const lampada of mapa.lampadas) desenharLampada(g, lampada, tempo);

      const salaFinal = mapa.salas[mapa.salaFinal];
      if (salaFinal) {
        desenharMinerador(g, mapa.minerador.x, mapa.minerador.y, tempo);
      }

      for (const gota of gotas) {
        if (!gota.ativa) continue;
        g.fillStyle = CORES.lava;
        g.fillRect(Math.round(gota.x) - 1, Math.round(gota.y) - 4, 3, 8);
        g.fillStyle = CORES.lavaClara;
        g.fillRect(Math.round(gota.x), Math.round(gota.y) - 3, 1, 4);
      }

      desenharCriaturas(g, criaturas, tempo);
      if (dinamite) desenharDinamite(g, dinamite, true);
      if (estado !== 'morrendo') desenharHeroina(g, heroina, tempo);
      desenharParticulas(g, particulas);
      desenharTextos(g, textos);
      g.restore();

      const sala = mapa.salas[salaAtual];
      desenharEscuridao(g, camera, construirFontesLuz(), sala?.escura ?? false);

      g.save();
      g.translate(-Math.round(camera.x) + tremorX, -Math.round(camera.y) + tremorY);
      desenharLaser(g, laser, tempo);
      g.restore();

      if (flash > 0) {
        g.fillStyle = `rgba(239, 68, 68, ${flash * 0.35})`;
        g.fillRect(0, 0, LARGURA, ALTURA);
      }
    }

    function estadoHud(): EstadoHUD {
      return {
        energia: heroina.energia / ENERGY_MAX,
        dinamites,
        calor: heroina.calor / LASER_CALOR_MAX,
        travado: heroina.travado,
        fase,
        vidas,
        cristais: cristaisColetados,
        totalCristais: mapa.totalCristais,
        sala: salaAtual,
        totalSalas: mapa.salas.length,
        resgatado: estado === 'resgate',
      };
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
          atualizarMusica(musica, ctx.audio, dt, false, false, fase);
          if (input.acaoPressionada || input.acao2Pressionada) comecarPartida();
          return;
        }

        if (estado === 'gameover') {
          atualizarEfeitos(particulas, textos, dt);
          if (input.acaoPressionada || input.acao2Pressionada) comecarPartida();
          return;
        }

        if (estado === 'morrendo') {
          atualizarMorrendo(dt);
          return;
        }

        if (estado === 'resgate') {
          atualizarResgate(dt, input);
          return;
        }

        atualizarJogo(dt, input);
      },

      desenhar(g: CanvasRenderingContext2D) {
        g.imageSmoothingEnabled = false;
        desenharMundo(g);
        desenharHUDJogo(g, ctx.hud, estadoHud(), tempo);

        if (estado === 'titulo') {
          desenharTitulo(g, ctx.hud.obterEstado().recorde, tempo);
        } else if (estado === 'resgate') {
          desenharResgate(
            g,
            fase,
            resgateBonus,
            bonusEnergia,
            bonusDinamites,
            bonusExploracao,
            tempoEstado,
            tempo
          );
        } else if (estado === 'gameover') {
          ctx.hud.desenharGameOver(g, LARGURA, ALTURA, 'PRESSIONE AÇÃO / TOQUE');
        } else if (estado === 'morrendo') {
          g.save();
          g.textAlign = 'center';
          g.font = '13px "Press Start 2P", monospace';
          g.fillStyle = CORES.vermelho;
          g.fillText('VIDA PERDIDA', LARGURA / 2, ALTURA / 2 - 24);
          g.font = '7px "Press Start 2P", monospace';
          g.fillStyle = CORES.branco;
          g.fillText(
            origemMorte === 'energia' ? 'A MOCHILA FICOU SEM ENERGIA' : 'VOLTANDO PARA A ENTRADA...',
            LARGURA / 2,
            ALTURA / 2 + 2
          );
          g.restore();
        }
      },

      destruir() {
        mapa = criarMapa(1);
        criaturas = [];
        particulas = [];
        textos = [];
        gotas = [];
        dinamite = null;
        resetarMusica(musica);
      },
    };
  },
};
