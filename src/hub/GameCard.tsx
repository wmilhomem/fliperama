/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Play, Trophy, Sparkles } from 'lucide-react';
import { GameModule } from '../engine/types';
import { previaDoJogo } from '../assets/previews';

interface PlayableCardProps {
  jogo: GameModule;
  recorde: number;
  onJogar: (id: string) => void;
}

export const GameCard: React.FC<PlayableCardProps> = ({ jogo, recorde, onJogar }) => {
  const previa = previaDoJogo(jogo.id);

  return (
    <div
      className="relative group rounded-xl p-4 bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_25px_rgba(239,68,68,0.3)] flex flex-col justify-between font-arcade"
      style={{
        borderColor: `${jogo.corTema}aa`,
      }}
    >
      {/* GLOW DE FUNDO */}
      <div
        className="absolute inset-0 opacity-10 group-hover:opacity-20 pointer-events-none rounded-xl transition-opacity blur-xl"
        style={{ backgroundColor: jogo.corTema }}
      />

      {/* CABEÇALHO DO CARD */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[8px] uppercase tracking-wider text-slate-400 px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700">
            {jogo.genero}
          </span>

          {/* RECORDE PESSOAL DO JOGO */}
          <div className="flex items-center gap-1.5 text-amber-400 text-[10px]">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span className="tabular-nums font-bold">{Math.floor(recorde)}</span>
          </div>
        </div>

        <h3
          className="text-base font-bold tracking-wide mb-2 transition-colors group-hover:drop-shadow-[0_0_8px_currentColor]"
          style={{ color: jogo.corTema }}
        >
          {jogo.titulo}
        </h3>

        <p className="text-[10px] text-slate-300 leading-relaxed mb-3 line-clamp-2">
          {jogo.descricao}
        </p>
      </div>

      {/* MINIATURA: FOTO DA TELA DO JOGO (ou ícone genérico) */}
      <div className="relative h-28 w-full bg-slate-950 rounded-lg border border-slate-800 overflow-hidden mb-4 flex items-center justify-center group-hover:border-red-500/50 transition-colors">
        {previa ? (
          <>
            <img
              src={previa}
              alt={`Tela do jogo ${jogo.titulo}`}
              className="absolute inset-0 h-full w-full object-cover pixelated"
              loading="lazy"
              draggable={false}
            />
            {/* Vidro da vitrine + resolução */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/25" />
            <span className="absolute bottom-1 right-2 text-[7px] text-slate-300 font-mono tracking-wider bg-black/60 px-1.5 py-0.5 rounded">
              {jogo.largura}x{jogo.altura} RES
            </span>
          </>
        ) : (
          <>
            <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:12px_12px] opacity-40" />

            {/* ÍCONE CENTRAL ESTILIZADO */}
            <div className="relative flex flex-col items-center">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center border shadow-lg group-hover:scale-110 transition-transform"
                style={{
                  backgroundColor: `${jogo.corTema}22`,
                  borderColor: jogo.corTema,
                  boxShadow: `0 0 15px ${jogo.corTema}66`,
                }}
              >
                <Sparkles className="w-6 h-6" style={{ color: jogo.corTema }} />
              </div>
              <span className="text-[8px] text-slate-400 mt-2 font-mono tracking-wider">
                {jogo.largura}x{jogo.altura} RES
              </span>
            </div>
          </>
        )}
      </div>

      {/* BOTÃO JOGAR */}
      <button
        onClick={() => onJogar(jogo.id)}
        className="w-full py-2.5 rounded-lg text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 group-hover:brightness-110 border"
        style={{
          backgroundColor: jogo.corTema,
          borderColor: '#ffffff55',
          boxShadow: `0 4px 15px ${jogo.corTema}66`,
        }}
      >
        <Play className="w-4 h-4 fill-current" />
        JOGAR AGORA
      </button>
    </div>
  );
};
