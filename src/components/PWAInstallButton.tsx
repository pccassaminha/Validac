import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone } from 'lucide-react';

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
        className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white shadow-lg hover:bg-indigo-700 transition"
      >
        <Download size={16} />
        Instalar App
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-2 rounded-xl bg-slate-800 border border-slate-700 px-4 py-2 text-sm font-bold text-slate-200 hover:bg-slate-700 transition"
        >
          <Smartphone size={16} />
          Instalar no iOS
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
              <h3 className="text-xl font-bold text-slate-900 mb-2">Instalar no iPhone / iPad</h3>
              <p className="mt-2 text-sm text-slate-600 mb-6 leading-relaxed">
                1. Toque no botão de <strong>Partilha (Share)</strong> na barra do Safari.<br /><br />
                2. Deslize para baixo e toque em <strong>"Adicionar ao Ecrã Principal" (Add to Home Screen)</strong>.
              </p>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full rounded-xl bg-slate-100 py-3 text-sm font-bold text-slate-800 hover:bg-slate-200 transition"
              >
                Entendi, Fechar
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
