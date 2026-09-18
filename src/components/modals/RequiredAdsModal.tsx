import React, { useState } from 'react';
import { adMobService } from '../../services/adMobService';
import { REWARD_ACTIONS, RewardActionType } from '../../config/adMobConfig';
import { soundEffects } from '../../services/soundEffects';
import { Play, X, AlertCircle, ShieldCheck } from 'lucide-react';

interface RequiredAdsModalProps {
  isOpen: boolean;
  featureTitle: string;
  description?: string;
  requiredCount?: number;
  onSuccess: () => void;
  onCancel: () => void;
  theme?: 'light' | 'dark';
}

/**
 * Modal oficial de consentimento para Anúncio Recompensado (Rewarded Ad) do Google AdMob.
 *
 * Em conformidade estrita com as regras do Google AdMob e da solicitação do usuário:
 * - NÃO cria anúncios falsos, simulados ou inventados.
 * - NÃO imita anúncios ou companhias fictícias.
 * - Aciona exclusivamente o Google Mobile Ads SDK oficial.
 * - Se não houver anúncio disponível da rede Google, avisa transparentemente e não inventa anúncio.
 */
export const RequiredAdsModal: React.FC<RequiredAdsModalProps> = ({
  isOpen,
  featureTitle,
  description = 'Assista a um anúncio para liberar este recurso.',
  onSuccess,
  onCancel,
  theme = 'dark',
}) => {
  const [isLoadingAd, setIsLoadingAd] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const isLight = theme === 'light';

  const handleWatchAd = () => {
    soundEffects.playClick();
    setIsLoadingAd(true);
    setErrorMessage(null);

    // Mapeia a ação correspondente para os 5 pontos do Google AdMob
    let action: RewardActionType = REWARD_ACTIONS.EXPLANATION;
    const lower = featureTitle.toLowerCase();
    if (lower.includes('prova') || lower.includes('simulado')) {
      action = REWARD_ACTIONS.EXAM;
    } else if (lower.includes('pesquisa') || lower.includes('trabalho')) {
      action = REWARD_ACTIONS.RESEARCH;
    } else if (lower.includes('tradut') || lower.includes('tradução') || lower.includes('idioma')) {
      action = REWARD_ACTIONS.TRANSLATION;
    } else if (lower.includes('início') || lower.includes('inicio') || lower.includes('bônus') || lower.includes('bonus')) {
      action = REWARD_ACTIONS.HOME_BONUS;
    }

    adMobService.showRewardedAd(action, {
      onRewardEarned: () => {
        setIsLoadingAd(false);
        soundEffects.playSuccess?.();
        onSuccess();
      },
      onDismissedWithoutReward: () => {
        setIsLoadingAd(false);
        setErrorMessage('O anúncio foi fechado antes do término. Assista até o final para desbloquear.');
      },
      onAdNotAvailable: (msg) => {
        setIsLoadingAd(false);
        setErrorMessage(msg || 'Nenhum anúncio disponível no momento pelo Google AdMob.');
      },
    });
  };

  return (
    <div
      id="required-admob-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs transition-opacity"
      role="dialog"
      aria-modal="true"
      aria-labelledby="required-ad-title"
    >
      <div
        id="required-admob-modal-card"
        className={`w-full max-w-md rounded-2xl p-6 shadow-2xl transition-all border bg-white ${
          isLight
            ? 'border-slate-200 text-slate-800'
            : 'border-slate-700 text-slate-900'
        }`}
      >
        {/* Cabeçalho */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-700/60">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-500 flex items-center justify-center font-black text-sm">
              Ad
            </div>
            <div>
              <h3 id="required-ad-title" className="font-bold text-base leading-tight">
                Desbloquear {featureTitle}
              </h3>
              <p className="text-xs text-slate-400">Google AdMob</p>
            </div>
          </div>

          <button
            id="btn-close-required-ad"
            type="button"
            onClick={() => {
              soundEffects.playClick();
              onCancel();
            }}
            disabled={isLoadingAd}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mensagem e Instruções */}
        <div className="py-5 space-y-3">
          <p className="text-sm text-slate-300 leading-relaxed">
            {description}
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

        {/* Ações */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
          <button
            id="btn-confirm-watch-ad"
            type="button"
            onClick={handleWatchAd}
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
            id="btn-cancel-watch-ad"
            type="button"
            onClick={() => {
              soundEffects.playClick();
              onCancel();
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
