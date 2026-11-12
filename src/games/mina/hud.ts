import { HUDService } from '../../engine/types';
import { CORES, HUD_ALTURA, LARGURA } from './constantes';
import { desenharHeroina, desenharIconeDinamite, desenharMinerador } from './arte';
import { criarHeroina } from './heroina';
import { EstadoHUD } from './tipos';

function barraSegmentada(
  g: CanvasRenderingContext2D,
  x: number,
  y: number,
  largura: number,
  altura: number,
  proporcao: number,
  cor: string
): void {
  const segmentos = 10;
  const vao = 1;
  const larguraSegmento = (largura - vao * (segmentos - 1)) / segmentos;
  const preenchidos = Math.ceil(Math.max(0, Math.min(1, proporcao)) * segmentos);

  for (let i = 0; i < segmentos; i++) {
    g.fillStyle = i < preenchidos ? cor : '#1f2937';
    g.fillRect(
      Math.round(x + i * (larguraSegmento + vao)),
      y,
      Math.ceil(larguraSegmento),
      altura
    );
    if (i < preenchidos) {
      g.fillStyle = 'rgba(255,255,255,0.32)';
      g.fillRect(Math.round(x + i * (larguraSegmento + vao)), y, Math.ceil(larguraSegmento), 1);
    }
  }
}

export function desenharHUDJogo(
  g: CanvasRenderingContext2D,
  hud: HUDService,
  estado: EstadoHUD,
  tempo: number
): void {
  g.save();
  g.fillStyle = 'rgba(4, 3, 10, 0.95)';
  g.fillRect(0, 0, LARGURA, HUD_ALTURA);

  hud.desenharHUD(g, LARGURA, HUD_ALTURA);

  g.fillStyle = 'rgba(4, 3, 10, 0.98)';
  g.fillRect(296, 0, LARGURA - 296, 37);
  g.strokeStyle = 'rgba(251, 191, 36, 0.22)';
  g.beginPath();
  g.moveTo(296, 0);
  g.lineTo(296, 37);
  g.stroke();

  const energia = estado.energia;
  const corEnergia = energia <= 0.2 ? CORES.vermelho : energia <= 0.5 ? CORES.amarelo : CORES.verdeClaro;
  g.font = '6px "Press Start 2P", monospace';
  g.textAlign = 'left';
  g.fillStyle = CORES.ouroClaro;
  g.fillText('ENERGIA', 302, 6);
  barraSegmentada(g, 354, 2, 118, 5, energia, corEnergia);

  g.fillStyle = CORES.laranja;
  g.fillText('DINAMITE', 302, 18);
  for (let i = 0; i < 6; i++) {
    desenharIconeDinamite(g, 356 + i * 10, 13, i < estado.dinamites);
  }

  g.fillStyle = CORES.aguaClara;
  g.fillText('CALOR', 302, 30);
  const corCalor = estado.travado ? CORES.vermelho : estado.calor > 0.75 ? CORES.laranja : CORES.agua;
  barraSegmentada(g, 354, 26, 118, 5, estado.calor, corCalor);

  if (estado.travado) {
    g.textAlign = 'right';
    g.font = '5px "Press Start 2P", monospace';
    g.fillStyle = Math.floor(tempo * 10) % 2 === 0 ? CORES.branco : CORES.vermelho;
    g.fillText('TRAVADO', 472, 35);
  }

  g.textAlign = 'left';
  g.font = '6px "Press Start 2P", monospace';
  g.fillStyle = CORES.ouroClaro;
  g.fillText(`CRISTAIS ${estado.cristais}/${estado.totalCristais}`, 92, 47);
  g.fillStyle = estado.resgatado ? CORES.verdeClaro : CORES.rosaClaro;
  g.textAlign = 'right';
  g.fillText(`SALA ${Math.min(estado.sala + 1, estado.totalSalas)}/${estado.totalSalas}`, 372, 47);

  g.fillStyle = CORES.ouro;
  g.fillRect(0, HUD_ALTURA - 2, LARGURA, 2);
  g.fillStyle = 'rgba(253, 230, 138, 0.45)';
  g.fillRect(0, HUD_ALTURA - 3, LARGURA, 1);
  g.restore();
}

export function desenharTitulo(
  g: CanvasRenderingContext2D,
  recorde: number,
  tempo: number
): void {
  g.save();
  g.fillStyle = 'rgba(3, 2, 9, 0.84)';
  g.fillRect(0, 0, LARGURA, 560);

  g.fillStyle = 'rgba(8, 5, 16, 0.72)';
  g.fillRect(42, 52, LARGURA - 84, 468);
  g.strokeStyle = 'rgba(251, 191, 36, 0.32)';
  g.lineWidth = 1;
  g.strokeRect(42, 52, LARGURA - 84, 468);

  g.fillStyle = CORES.madeiraEscura;
  g.fillRect(54, 62, LARGURA - 108, 6);
  g.fillStyle = CORES.madeira;
  g.fillRect(54, 62, LARGURA - 108, 3);
  for (let i = 0; i < 6; i++) {
    g.fillStyle = i % 2 === 0 ? CORES.ouroClaro : CORES.ouro;
    g.fillRect(78 + i * 62, 68, 6, 3);
  }

  g.textAlign = 'center';
  g.textBaseline = 'top';
  g.font = '30px "Press Start 2P", monospace';
  g.fillStyle = CORES.ouro;
  g.fillText('RESGATE', LARGURA / 2, 92);
  g.font = '20px "Press Start 2P", monospace';
  g.fillStyle = CORES.laranja;
  g.fillText('SUBTERRÂNEO', LARGURA / 2, 132);

  g.font = '7px "Press Start 2P", monospace';
  g.fillStyle = CORES.aguaClara;
  g.fillText('RÔ E O MINEIRO PRESO', LARGURA / 2, 172);

  g.fillStyle = CORES.ouro;
  g.fillRect(70, 194, 340, 2);
  g.fillStyle = 'rgba(253, 230, 138, 0.45)';
  g.fillRect(70, 199, 340, 1);

  g.font = '7px "Press Start 2P", monospace';
  g.fillStyle = '#e2e8f0';
  g.fillText('VOE PELA MINA COM SUA MOCHILA TURBO,', LARGURA / 2, 216);
  g.fillText('EXPLODA PAREDES E RESGATE O MINEIRO.', LARGURA / 2, 232);

  const heroi = criarHeroina({ x: 104, y: 274 });
  heroi.noChao = true;
  heroi.energia = 100;
  desenharHeroina(g, heroi, tempo);
  desenharMinerador(g, 376, 304, tempo);

  g.font = '6px "Press Start 2P", monospace';
  g.fillStyle = CORES.ouroClaro;
  g.fillText('SETAS / WASD: MOVER E VOAR', LARGURA / 2, 326);
  g.fillText('A / ESPAÇO: LASER DE CALOR', LARGURA / 2, 340);
  g.fillText('B / X: PLANTAR DINAMITE', LARGURA / 2, 354);
  g.fillStyle = CORES.cinza;
  g.fillText('P PAUSA  R RESET  M SOM  ESC HUB', LARGURA / 2, 372);

  g.font = '7px "Press Start 2P", monospace';
  g.fillStyle = CORES.ouro;
  g.fillText(`RECORDE: ${Math.floor(recorde).toString().padStart(6, '0')}`, LARGURA / 2, 400);

  g.globalAlpha = 0.62 + Math.sin(tempo * 3.2) * 0.34;
  g.font = '9px "Press Start 2P", monospace';
  g.fillStyle = CORES.branco;
  g.fillText('PRESSIONE AÇÃO / TOQUE', LARGURA / 2, 448);
  g.globalAlpha = 1;

  g.fillStyle = CORES.vermelho;
  g.fillRect(90, 480, 300, 1);
  g.font = '6px "Press Start 2P", monospace';
  g.fillStyle = CORES.rosaClaro;
  g.fillText('ENERGIA ZERO CUSTA UMA VIDA. VOLTE VIVO!', LARGURA / 2, 494);
  g.fillStyle = CORES.cinza;
  g.fillText('A LUZ DO CAPACETE É SUA MELHOR AMIGA', LARGURA / 2, 508);
  g.restore();
}

export function desenharResgate(
  g: CanvasRenderingContext2D,
  fase: number,
  bonus: number,
  bonusEnergia: number,
  bonusDinamites: number,
  bonusExploracao: number,
  restante: number,
  tempo: number
): void {
  g.save();
  g.fillStyle = 'rgba(3, 2, 9, 0.82)';
  g.fillRect(0, 0, LARGURA, 560);

  g.textAlign = 'center';
  g.textBaseline = 'top';
  g.font = '24px "Press Start 2P", monospace';
  g.fillStyle = CORES.ouro;
  g.fillText('RESGATE!', LARGURA / 2, 116);
  g.font = '9px "Press Start 2P", monospace';
  g.fillStyle = CORES.verdeClaro;
  g.fillText('O MINEIRO ESTÁ A SALVO', LARGURA / 2, 154);
  g.font = '7px "Press Start 2P", monospace';
  g.fillStyle = CORES.aguaClara;
  g.fillText(`FASE ${fase} VENCIDA`, LARGURA / 2, 176);

  g.fillStyle = 'rgba(20, 12, 8, 0.92)';
  g.fillRect(62, 208, 356, 202);
  g.strokeStyle = CORES.ouro;
  g.lineWidth = 2;
  g.strokeRect(62, 208, 356, 202);

  g.font = '7px "Press Start 2P", monospace';
  g.fillStyle = CORES.branco;
  g.fillText('BÔNUS DE RESGATE', LARGURA / 2, 224);
  g.fillStyle = CORES.ouroClaro;
  g.fillText('+1000', LARGURA / 2, 244);

  g.textAlign = 'left';
  g.fillStyle = '#e2e8f0';
  g.fillText('ENERGIA RESTANTE', 84, 270);
  g.textAlign = 'right';
  g.fillStyle = CORES.verdeClaro;
  g.fillText(`+${bonusEnergia}`, 396, 270);

  g.textAlign = 'left';
  g.fillStyle = '#e2e8f0';
  g.fillText('DINAMITES NÃO USADAS', 84, 288);
  g.textAlign = 'right';
  g.fillStyle = CORES.laranja;
  g.fillText(`+${bonusDinamites}`, 396, 288);

  g.textAlign = 'left';
  g.fillStyle = '#e2e8f0';
  g.fillText('EXPLORAÇÃO', 84, 306);
  g.textAlign = 'right';
  g.fillStyle = CORES.aguaClara;
  g.fillText(`+${bonusExploracao}`, 396, 306);

  g.fillStyle = CORES.ouro;
  g.fillRect(84, 326, 312, 1);
  g.textAlign = 'left';
  g.font = '8px "Press Start 2P", monospace';
  g.fillStyle = CORES.ouroClaro;
  g.fillText('TOTAL', 84, 340);
  g.textAlign = 'right';
  g.fillText(`+${bonus}`, 396, 340);

  g.textAlign = 'center';
  g.font = '7px "Press Start 2P", monospace';
  g.fillStyle = CORES.rosaClaro;
  g.fillText(`PRÓXIMA MINA EM ${Math.max(0, Math.ceil(restante))}`, LARGURA / 2, 374);
  g.globalAlpha = 0.6 + Math.sin(tempo * 5) * 0.3;
  g.fillStyle = CORES.branco;
  g.fillText('AÇÃO / TOQUE PARA AVANÇAR', LARGURA / 2, 392);
  g.globalAlpha = 1;

  g.fillStyle = CORES.verde;
  g.fillRect(92, 434, 296, 1);
  g.font = '6px "Press Start 2P", monospace';
  g.fillStyle = CORES.cinza;
  g.fillText('CADA MINA É MAIS FUNDA E MAIS PERIGOSA', LARGURA / 2, 448);
  g.restore();
}
