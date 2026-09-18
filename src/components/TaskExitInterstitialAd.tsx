import React, { useEffect } from 'react';
import { adMobService } from '../services/adMobService';

export interface TaskExitInterstitialAdProps {
  isOpen: boolean;
  taskTitle?: string;
  earnedXp?: number;
  isEntryAd?: boolean;
  isStartingFunction?: boolean;
  actionButtonText?: string;
  onClose: () => void;
  theme?: 'light' | 'dark';
}

/**
 * Interstitial oficial do Google AdMob disparado na saída/conclusão de tarefas.
 *
 * Em conformidade estrita com as regras do Google AdMob e solicitação do usuário:
 * - NUNCA cria anúncios falsos, simulados ou inventados.
 * - NUNCA renderiza propagandas fictícias.
 * - Dispara exclusivamente o anúncio oficial do SDK do Google Mobile Ads.
 * - No Android, o AdMob oficial do Google Play Services exibe o anúncio.
 * - Na web, se não houver SDK nativo ativo, avança sem inventar anúncios falsos.
 */
export const TaskExitInterstitialAd: React.FC<TaskExitInterstitialAdProps> = ({
  isOpen,
  onClose,
}) => {
  useEffect(() => {
    if (!isOpen) return;

    adMobService.showInterstitialAd(() => {
      onClose();
    });
  }, [isOpen, onClose]);

  // Nunca inventa anúncio para preencher tela
  return null;
};
