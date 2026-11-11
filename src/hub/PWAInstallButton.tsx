/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Download, Smartphone } from 'lucide-react';
import { usePWAInstall } from './usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-[10px] font-bold shadow-md shadow-red-950/60 transition-transform active:scale-95 border border-red-400"
      >
        <Download className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">INSTALAR APP</span>
        <span className="sm:hidden">INSTALAR</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] border border-slate-700"
        >
          <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">INSTALAR NO IPHONE</span>
          <span className="sm:hidden">INSTALAR</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm font-arcade">
            <div className="w-full max-w-sm rounded-xl bg-slate-900 border border-red-800/80 p-5 shadow-2xl text-center">
              <h3 className="text-sm font-bold text-red-400">INSTALAR NO IPHONE / IPAD</h3>
              <p className="mt-3 text-[10px] text-slate-300 leading-relaxed text-left">
                1. Toque no botão de <strong>Compartilhar</strong> (ícone com seta para cima) na barra do Safari.<br /><br />
                2. Role para baixo e selecione <strong>Adicionar à Tela de Início</strong>.<br /><br />
                3. Pronto! O Fliperama rodará em tela cheia sem barras de navegador.
              </p>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-lg bg-red-600 py-2 text-xs font-bold text-white hover:bg-red-500 shadow"
              >
                ENTENDI
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
