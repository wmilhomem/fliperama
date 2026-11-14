/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Gamepad2, Sparkles } from 'lucide-react';
import { AVATARES, AVATAR_PADRAO } from '../shared/constants';
import { salvarJogador } from '../shared/player';
import { PlayerProfile } from '../shared/types';

interface PlayerModalProps {
  onSalvar: (perfil: PlayerProfile) => void;
}

export const PlayerModal: React.FC<PlayerModalProps> = ({ onSalvar }) => {
  const [nome, setNome] = useState('');
  const [avatar, setAvatar] = useState(AVATAR_PADRAO);
  const [erro, setErro] = useState('');

  const nomeValido = nome.trim().replace(/\s+/g, ' ').length > 0;

  const confirmar = () => {
    if (!nomeValido) {
      setErro('Digite um nome ou apelido para jogar!');
      return;
    }
    const perfil = salvarJogador({ nome, avatar });
    onSalvar(perfil);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 backdrop-blur-sm font-arcade">
      <div className="relative bg-slate-950 border-2 border-red-700 rounded-2xl max-w-md w-full p-6 text-center shadow-[0_0_45px_rgba(239,68,68,0.35)]">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-600/20 border border-red-500/50 text-red-400 text-[8px] mb-3">
          <Sparkles className="w-3 h-3 text-yellow-400" />
          BEM-VINDO AO FLIPERAMA
        </div>

        <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-red-600 flex items-center justify-center border-2 border-red-400 shadow-[0_0_20px_rgba(239,68,68,0.6)]">
          <Gamepad2 className="w-8 h-8 text-white" />
        </div>

        <h2 className="text-sm font-bold text-white tracking-wider mb-1">
          QUAL É O SEU NOME?
        </h2>
        <p className="text-[9px] text-slate-400 leading-relaxed mb-4">
          Suas pontuações no ranking levarão o seu nome. Perguntado só desta vez.
        </p>

        {/* ESCOLHA DO AVATAR */}
        <div className="grid grid-cols-6 gap-2 mb-4">
          {AVATARES.map((a) => (
            <button
              key={a}
              onClick={() => setAvatar(a)}
              className={`h-11 rounded-lg text-xl flex items-center justify-center border transition-all ${
                avatar === a
                  ? 'bg-amber-500/20 border-amber-400 scale-110 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-600'
              }`}
              aria-label={`Avatar ${a}`}
            >
              {a}
            </button>
          ))}
        </div>

        {/* NOME */}
        <input
          autoFocus
          value={nome}
          maxLength={12}
          onChange={(e) => {
            setNome(e.target.value);
            setErro('');
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') confirmar();
          }}
          placeholder="SEU NOME"
          className="w-full px-3 py-3 mb-2 rounded-lg bg-slate-900 border-2 border-slate-800 focus:border-red-500 focus:outline-none text-center text-xs tracking-widest text-yellow-300 placeholder:text-slate-600"
        />
        {erro && <p className="text-[8px] text-red-400 mb-2">{erro}</p>}

        <button
          onClick={confirmar}
          className="w-full py-3 mt-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold tracking-wider border border-red-400 shadow-[0_4px_0_#7f1d1d] active:translate-y-0.5 active:shadow-none transition-all"
        >
          ENTRAR NO FLIPERAMA
        </button>
        <p className="text-[7px] text-slate-600 mt-3">Ou pode trocar depois em AJUSTES · não pedimos nada além disso</p>
      </div>
    </div>
  );
};
