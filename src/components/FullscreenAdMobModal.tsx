import React, { useEffect } from 'react';
import { adMobService } from '../services/adMobService';

export type AdPlacementType = 'inicio' | 'explicador' | 'criador_provas' | 'pesquisador' | 'tradutor';

interface FullscreenAdMobModalProps {
  isOpen: boolean;
  placement: AdPlacementType;
  featureTitle?: string;
  onClose: () => void;
  onRewardEarned?: () => void;
  theme?: 'light' | 'dark';
}

const placementToPoint = {
  explicador: 'explainer',
  criador_provas: 'photo_exam',
  pesquisador: 'researcher',
  tradutor: 'translator',
} as const;

/** Uses the real production Rewarded unit for the four permitted tools.
 * The home placement is intentionally a no-op: no ad is shown on Home. */
export const FullscreenAdMobModal: React.FC<FullscreenAdMobModalProps> = ({ isOpen, placement, onClose, onRewardEarned }) => {
  useEffect(() => {
    if (!isOpen) return;
    if (placement === 'inicio') {
      onClose();
      return;
    }

    const point = placementToPoint[placement];
    adMobService.requestRewardedAdForPoint(point, {
      onRewardEarned: () => {
        onRewardEarned?.();
        onClose();
      },
      onDismissedWithoutReward: onClose,
      onAdNotAvailable: onClose,
    });
  }, [isOpen, placement, onClose, onRewardEarned]);

  return null;
};
