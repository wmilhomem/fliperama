/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Trophy, Medal, Star, RotateCcw, ArrowLeft, Gamepad2 } from 'lucide-react';
import { GameModule } from '../engine/types';
import { RetroStorageService } from '../engine/storage';
import { STORAGE_KEYS } from '../shared/constants';

interface RankingViewProps {
  jogos: GameModule[];
  onVoltarAoHub: () => void;
  onSelecionarJogo: (id: string) => void;
}

interface ScoreHistoryItem {
  id: string;
  jogoId: string;
  pontuacao: number;
  nome: string;
  data: string;
}

export const RankingView: React.FC<RankingViewProps> = ({
  jogos,
  onVoltarAoHub,
  onSelecionarJogo,
}) => {
  const [recordes, setRecordes] = useState<Record<string, number>>({});
  const [historico, setHistorico] = useState<ScoreHistoryItem[]>([]);

  useEffect(() => {
    const storage = new RetroStorageService();
    setRecordes(storage.listarRanking());

    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SCORES_HISTORY);
      if (raw) {
        setHistorico(JSON.parse(raw));
      }
    } catch {
      // ignore
    }
  }, []);

  return (
    <div className="w-full max-w-4xl flex flex-col gap-6 font-arcade text-white">
      {/* CABEÇALHO DO RANKING */}
      <div className="flex items-center justify-between">
        <button
          onClick={onVoltarAoHub}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs border border-slate-700 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-cyan-400" />
          <span>VOLTAR AO CATÁLOGO</span>
        </button>

        <div className="flex items-center gap-2 text-amber-400">
          <Trophy className="w-5 h-5 text-amber-400 animate-bounce" />
          <h2 className="text-sm md:text-base font-bold tracking-wider">
            HALL DA FAMA LOCAL
          </h2>
        </div>
      </div>

      {/* RECORDES POR JOGO */}
      <section className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <h3 className="text-xs font-bold text-amber-400 tracking-wider mb-4 flex items-center gap-2">
          <Medal className="w-4 h-4" />
          RECORDES ATUAIS POR MÁQUINA
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {jogos.map((jogo, index) => {
            const record = recordes[jogo.id] || 0;
            return (
              <div
                key={jogo.id}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between group hover:border-amber-500/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm shadow-md"
                    style={{
                      backgroundColor: `${jogo.corTema}22`,
                      color: jogo.corTema,
                      border: `1px solid ${jogo.corTema}`,
                    }}
                  >
                    #{index + 1}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{jogo.titulo}</h4>
                    <span className="text-[9px] text-slate-400 uppercase">{jogo.genero}</span>
                  </div>
                </div>

                <div className="flex flex-col items-end">
                  <span className="text-[8px] text-slate-400">MAIOR PONTUAÇÃO</span>
                  <span className="text-base font-bold text-amber-400 tabular-nums">
                    {Math.floor(record)}
                  </span>
                  <button
                    onClick={() => onSelecionarJogo(jogo.id)}
                    className="mt-1 text-[8px] text-cyan-400 hover:underline flex items-center gap-1"
                  >
                    <Gamepad2 className="w-2.5 h-2.5" />
                    BATER RECORDE
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* HISTÓRICO DE PARTIDAS RECENTES */}
      <section className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <h3 className="text-xs font-bold text-cyan-400 tracking-wider mb-4 flex items-center gap-2">
          <Star className="w-4 h-4 text-cyan-400" />
          ÚLTIMAS PARTIDAS REGISTRADAS
        </h3>

        {historico.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            Nenhuma partida concluída ainda. Jogue uma máquina para registrar pontuações!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[9px]">
                  <th className="pb-2">MÁQUINA</th>
                  <th className="pb-2">JOGADOR</th>
                  <th className="pb-2 text-right">PONTUAÇÃO</th>
                  <th className="pb-2 text-right">DATA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-[10px]">
                {historico.slice(0, 15).map((item) => {
                  const jogo = jogos.find((j) => j.id === item.jogoId);
                  return (
                    <tr key={item.id} className="hover:bg-slate-800/30">
                      <td className="py-2.5 font-bold text-white">
                        {jogo?.titulo || item.jogoId}
                      </td>
                      <td className="py-2.5 text-slate-300">{item.nome}</td>
                      <td className="py-2.5 text-right font-bold text-yellow-400 tabular-nums">
                        {Math.floor(item.pontuacao)}
                      </td>
                      <td className="py-2.5 text-right text-slate-400 text-[9px]">
                        {item.data}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};
