import React, { useState } from 'react';
import {
  X,
  Play,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import {
  REWARD_ACTIONS,
  RewardActionType,
} from '../config/adMobConfig';
import { soundEffects } from '../services/soundEffects';
import { adMobService } from '../services/adMobService';

export interface RewardedAdUnlockModalProps {
  isOpen: boolean;
  action: RewardActionType;
  topicName?: string;
  onClose: () => void;
  onRewardEarned: () => void;
  theme?: 'light' | 'dark';
}

/**
 * Modal oficial de consentimento para Rewarded Ads do Google AdMob.
 *
 * Em conformidade estrita com as políticas do Google AdMob:
 * - Não cria anúncios falsos ou inventados.
 * - Não imita anúncios para preencher espaço.
 * - Dispara exclusivamente o Google Mobile Ads SDK oficial.
 */
export const RewardedAdUnlockModal: React.FC<RewardedAdUnlockModalProps> = ({
  isOpen,
  action,
  topicName,
  onClose,
  onRewardEarned,
  theme = 'light',
}) => {
  const [isLoadingAd, setIsLoadingAd] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  let dialogTitle = 'Desbloquear recurso';
  let dialogText = 'Assista a um anúncio para liberar este recurso.';
  if (action === REWARD_ACTIONS.EXPLANATION) {
    dialogTitle = 'Desbloquear explicação';
    dialogText = 'Assista a um anúncio para liberar esta explicação detalhada.';
  } else if (action === REWARD_ACTIONS.EXAM) {
    dialogTitle = 'Desbloquear prova';
    dialogText = 'Assista a um anúncio para liberar a criação desta prova.';
  } else if (action === REWARD_ACTIONS.RESEARCH) {
    dialogTitle = 'Desbloquear pesquisa';
    dialogText = 'Assista a um anúncio para liberar este trabalho escolar com referências.';
  } else if (action === REWARD_ACTIONS.TRANSLATION) {
    dialogTitle = 'Desbloquear tradução';
    dialogText = 'Assista a um anúncio para liberar esta tradução aprofundada.';
  } else if (action === REWARD_ACTIONS.HOME_BONUS) {
    dialogTitle = 'Bônus Diário de Pontos';
    dialogText = 'Assista a um anúncio para resgatar pontos bônus de estudo.';
  }

  const isLight = theme === 'light';

  const handleStartAd = () => {
    soundEffects.playClick();
    setIsLoadingAd(true);
    setErrorMessage(null);

    adMobService.showRewardedAd(action, {
      onRewardEarned: () => {
        setIsLoadingAd(false);
        soundEffects.playSuccess?.();
        onRewardEarned();
      },
      onDismissedWithoutReward: () => {
        setIsLoadingAd(false);
        setErrorMessage('O anúncio foi fechado antes do término. Assista até o final para desbloquear.');
      },
      onAdNotAvailable: (msg) => {
        setIsLoadingAd(false);
        setErrorMessage(msg || 'Anúncio indisponível no momento pelo Google AdMob.');
      },
    });
  };

  return (
    <div
      id="rewarded-admob-consent-dialog"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`w-full max-w-md rounded-2xl p-6 shadow-2xl transition-all border ${
          isLight
            ? 'bg-white border-slate-200 text-slate-800'
            : 'bg-[#0f172a] border-slate-700 text-white'
        }`}
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-700/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-500 flex items-center justify-center font-black text-xs">
              Ad
            </div>
            <div>
              <h3 className="font-bold text-base">{dialogTitle}</h3>
              <p className="text-xs text-slate-400">Google AdMob</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              soundEffects.playClick();
              onClose();
            }}
            disabled={isLoadingAd}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-5 space-y-3">
          {topicName && (
            <div className="text-xs font-semibold px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-500 dark:text-blue-400 inline-block">
              {topicName}
            </div>
          )}

          <p className="text-sm text-slate-300 leading-relaxed">
            {dialogText}
          </p>

          <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 rounded-xl p-3">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Anúncio oficial entregue pela rede do Google AdMob.</span>
          </div>

          {errorMessage && (
            <div className="flex items-center gap-2 text-xs text-amber-300 bg-amber-950/40 border border-amber-800/40 rounded-xl p-3">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
          <button
            type="button"
            onClick={handleStartAd}
            disabled={isLoadingAd}
            className="w-full sm:flex-1 py-3 px-4 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition cursor-pointer disabled:opacity-50"
          >
            {isLoadingAd ? (
              <span>Carregando anúncio...</span>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Assistir anúncio</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              soundEffects.playClick();
              onClose();
            }}
            disabled={isLoadingAd}
            className="w-full sm:w-auto py-3 px-4 rounded-xl text-sm font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition cursor-pointer"
          >
            Agora não
          </button>
        </div>
      </div>
    </div>
  );
};
