import React, { useState } from 'react';
import { KeyRound, Sparkles, Film, X, CheckCircle2, AlertCircle, ShieldAlert } from 'lucide-react';
import { adMobService } from '../../services/adMobService';
import { REWARD_ACTIONS } from '../../config/adMobConfig';
import { keysService } from '../../services/keysService';
import { soundEffects } from '../../services/soundEffects';

interface KeysModalProps {
  isOpen: boolean;
  onClose: () => void;
  keys: number;
  modeContext?: 'journey' | 'languages' | 'chess' | 'general';
  onKeyEarned?: () => void;
  theme?: 'light' | 'dark';
}

export const KeysModal: React.FC<KeysModalProps> = ({
  isOpen,
  onClose,
  keys,
  modeContext = 'general',
  onKeyEarned,
  theme = 'light',
}) => {
  const [isWatchingAd, setIsWatchingAd] = useState(false);
  const [earnedNotice, setEarnedNotice] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const isLight = theme === 'light';

  const getContextTitle = () => {
    if (keys === 0) {
      if (modeContext === 'journey') return 'Acabaram suas chaves na Jornada!';
      if (modeContext === 'languages') return 'Acabaram suas chaves em Idiomas!';
      if (modeContext === 'chess') return 'Acabaram suas chaves no Xadrez!';
      return 'Acabaram as suas chaves!';
    }
    return 'Chaves de Acesso 🔑';
  };

  const handleWatchAd = () => {
    soundEffects.playClick();
    setIsWatchingAd(true);
    setErrorMessage(null);

    adMobService.showRewardedAd(REWARD_ACTIONS.KEYS, {
      onRewardEarned: () => {
        setIsWatchingAd(false);
        const newCount = keysService.addKey(1);
        soundEffects.playLevelUp();
        setEarnedNotice(true);
        if (onKeyEarned) {
          onKeyEarned();
        }
        setTimeout(() => {
          setEarnedNotice(false);
        }, 4000);
      },
      onDismissedWithoutReward: () => {
        setIsWatchingAd(false);
        soundEffects.playError();
        setErrorMessage('O anúncio foi fechado antes do término. Assista até o final para ganhar +1 chave.');
      },
      onAdNotAvailable: (msg) => {
        setIsWatchingAd(false);
        // Fallback cortês para não bloquear o estudante se a rede falhar
        soundEffects.playLevelUp();
        keysService.addKey(1);
        setEarnedNotice(true);
        if (onKeyEarned) {
          onKeyEarned();
        }
        setTimeout(() => {
          setEarnedNotice(false);
        }, 3500);
      },
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`w-full max-w-md rounded-3xl p-5 sm:p-6 shadow-2xl border relative overflow-hidden transition-colors ${
          isLight
            ? 'bg-white border-amber-200 text-slate-900'
            : 'bg-slate-900 border-amber-500/30 text-slate-100'
        }`}
      >
        {/* Glow dourado de fundo */}
        <div className="absolute -top-16 -right-16 w-40 h-40 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-yellow-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Botão Fechar */}
        <button
          onClick={() => {
            soundEffects.playClick();
            onClose();
          }}
          className={`absolute top-4 right-4 p-2 rounded-full transition cursor-pointer ${
            isLight
              ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header com Ícone de Chave */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 p-0.5 shadow-lg shadow-amber-500/25 flex items-center justify-center">
              <div
                className={`w-full h-full rounded-2xl flex items-center justify-center ${
                  isLight ? 'bg-amber-50' : 'bg-slate-900'
                }`}
              >
                <KeyRound className="w-8 h-8 text-amber-500 animate-bounce" />
              </div>
            </div>
            <span className="absolute -top-1 -right-2 px-2 py-0.5 rounded-full bg-amber-500 text-white text-[11px] font-black shadow-xs">
              x{keys}
            </span>
          </div>

          <div>
            <h3 className="text-lg sm:text-xl font-black tracking-tight">{getContextTitle()}</h3>
            <p className={`text-xs mt-1 leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
              {keys === 0 ? (
                <span>
                  Suas chaves acabaram! As chaves são usadas para continuar na{' '}
                  <strong className="text-amber-500 font-bold">Jornada</strong>,{' '}
                  <strong className="text-amber-500 font-bold">Idiomas</strong> e{' '}
                  <strong className="text-amber-500 font-bold">Xadrez</strong>.
                </span>
              ) : (
                <span>
                  Você tem <strong className="text-amber-500 font-bold">{keys} {keys === 1 ? 'chave' : 'chaves'}</strong> disponível.
                  Cada anúncio assistido garante <strong className="text-amber-500 font-bold">+1 chave</strong>!
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Notificação de Sucesso ao Ganhar Chave */}
        {earnedNotice && (
          <div className="mt-4 p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center gap-2.5 text-xs font-bold animate-in fade-in slide-in-from-top-1">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
            <span>🎉 Parabéns! Você ganhou +1 Chave! Saldo atual: {keys}</span>
          </div>
        )}

        {/* Erro ao fechar anúncio */}
        {errorMessage && (
          <div className="mt-4 p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-400 flex items-center gap-2 text-xs font-medium animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Explicação Didática */}
        <div
          className={`mt-4 p-3 rounded-2xl border text-xs leading-relaxed space-y-1.5 ${
            isLight ? 'bg-amber-50/70 border-amber-200/80 text-amber-950' : 'bg-slate-800/80 border-slate-700 text-amber-200'
          }`}
        >
          <div className="flex items-center gap-1.5 font-bold">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Como funcionam as Chaves:</span>
          </div>
          <p className="text-[11px] opacity-90">
            • <strong>1 Chave</strong> é utilizada para iniciar e continuar fases da <strong>Jornada</strong>, lições de <strong>Idiomas</strong> e partidas de <strong>Xadrez</strong>.
          </p>
          <p className="text-[11px] opacity-90">
            • A cada anúncio que você assistir, você ganha <strong>1 Chave</strong> imediatamente.
          </p>
        </div>

        {/* Botão de Assistir Anúncio */}
        <div className="mt-5 space-y-2">
          <button
            onClick={handleWatchAd}
            disabled={isWatchingAd}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2 transition active:scale-98 disabled:opacity-50 cursor-pointer"
          >
            <Film className="w-4 h-4 text-slate-950" />
            <span>{isWatchingAd ? 'Carregando Anúncio...' : 'Assistir Anúncio (+1 Chave 🔑)'}</span>
          </button>

          {keys > 0 && (
            <button
              onClick={() => {
                soundEffects.playClick();
                onClose();
              }}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition text-center cursor-pointer ${
                isLight ? 'text-slate-500 hover:text-slate-800' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Continuar com {keys} {keys === 1 ? 'chave' : 'chaves'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
