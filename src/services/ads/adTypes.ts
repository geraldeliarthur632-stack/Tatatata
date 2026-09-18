export type AdType = 'banner' | 'interstitial' | 'rewarded';

export interface AdReward {
  type: string;
  amount: number;
}

export interface AdState {
  isBannerVisible: boolean;
  isInterstitialReady: boolean;
  isRewardedReady: boolean;
  lastAdTimestamp: number;
  totalAdsShown: number;
}

export interface AdConsentStatus {
  hasConsent: boolean;
  isChildDirected: boolean;
  nonPersonalizedOnly: boolean;
}
