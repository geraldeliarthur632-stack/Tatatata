import React, { useEffect } from 'react';
import { adMobService } from '../services/adMobService';

export type AdPlacementType =
  | 'inicio'
  | 'explicador'
  | 'criador_provas'
  | 'pesquisador'
  | 'tradutor';

export interface FullscreenAdMobModalProps {
  isOpen: boolean;
  placement: AdPlacementType;
  featureTitle?: string;
  onClose: () => void;
  onRewardEarned?: () => void;
  theme?: 'light' | 'dark';
}

/**
 * Controlador de Anúncios em Tela Cheia do Google AdMob (App Open e Interstitial).
 *
 * Em conformidade estrita com as regras do Google AdMob e solicitação do usuário:
 * - NUNCA cria anúncios falsos, simulados ou inventados.
 * - NUNCA renderiza propagandas fictícias ou textos de preenchimento.
 * - Dispara exclusivamente os anúncios reais do SDK oficial do Google Mobile Ads.
 * - No Android, o Google Play Services exibe a tela cheia oficial do AdMob.
 * - Na web, se não houver SDK nativo ativo, avança sem inventar anúncio falso.
 */
export const FullscreenAdMobModal: React.FC<FullscreenAdMobModalProps> = ({
  isOpen,
  placement,
  onClose,
}) => {
  useEffect(() => {
    if (!isOpen) return;

    if (placement === 'inicio') {
      // Início utiliza App Open Ad oficial do AdMob
      adMobService.showAppOpenAd(() => {
        onClose();
      });
    } else {
      // Explicador, Criador de Provas, Pesquisador e Tradutor utilizam Interstitial Ad oficial do AdMob
      adMobService.showInterstitialAd(() => {
        onClose();
      });
    }
  }, [isOpen, placement, onClose]);

  // Se não houver anúncio nativo ou se estiver na web, não inventa anúncios fictícios
  return null;
};
