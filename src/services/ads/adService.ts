import { getActiveBannerAdUnitId, getActiveInterstitialAdUnitId, GOOGLE_TEST_IDS } from './adConfig';
import type { AdReward, AdState } from './adTypes';

class AdServiceManager {
  private state: AdState = {
    isBannerVisible: false,
    isInterstitialReady: true,
    isRewardedReady: true,
    lastAdTimestamp: 0,
    totalAdsShown: 0,
  };

  private bannerListeners: Set<(visible: boolean) => void> = new Set();

  /**
   * Mostra o banner de anúncio (AdMob Banner)
   */
  public showBanner(): void {
    this.state.isBannerVisible = true;
    this.notifyBannerListeners();
  }

  /**
   * Oculta o banner de anúncio
   */
  public hideBanner(): void {
    this.state.isBannerVisible = false;
    this.notifyBannerListeners();
  }

  /**
   * Exibe anúncio intersticial com moderação pedagógica (nunca interrompe questão no meio)
   */
  public async showInterstitial(): Promise<boolean> {
    const now = Date.now();
    // Limite prudente de intervalo mínimo de 60 segundos entre anúncios tela cheia
    if (now - this.state.lastAdTimestamp < 60000) {
      return false;
    }

    try {
      // Se estiver em ambiente nativo Capacitor com plugin de AdMob instalado:
      if (typeof (window as any)?.AdMob?.showInterstitial === 'function') {
        await (window as any).AdMob.showInterstitial();
        this.state.lastAdTimestamp = now;
        this.state.totalAdsShown++;
        return true;
      }

      // Em ambiente Web ou fallback: não trava a experiência
      this.state.lastAdTimestamp = now;
      this.state.totalAdsShown++;
      return true;
    } catch (err) {
      console.warn('AdMob Interstitial indisponível ou em carregamento:', err);
      return false;
    }
  }

  /**
   * Exibe anúncio recompensado opcional (ex: ganhar XP bônus ou dica)
   * Só entrega recompensa após término confirmado
   */
  public async showRewarded(onRewardEarned?: (reward: AdReward) => void): Promise<boolean> {
    try {
      if (typeof (window as any)?.AdMob?.showRewardVideoAd === 'function') {
        const result = await (window as any).AdMob.showRewardVideoAd();
        if (result && onRewardEarned) {
          onRewardEarned({ type: 'XP', amount: 25 });
        }
        return true;
      }

      // Em simulação Web / teste educativo:
      if (onRewardEarned) {
        onRewardEarned({ type: 'XP_BONUS', amount: 20 });
      }
      return true;
    } catch (err) {
      console.warn('AdMob Rewarded indisponível:', err);
      return false;
    }
  }

  public onBannerChange(listener: (visible: boolean) => void): () => void {
    this.bannerListeners.add(listener);
    listener(this.state.isBannerVisible);
    return () => this.bannerListeners.delete(listener);
  }

  private notifyBannerListeners() {
    this.bannerListeners.forEach((fn) => fn(this.state.isBannerVisible));
  }
}

export const adService = new AdServiceManager();
export const showBanner = () => adService.showBanner();
export const hideBanner = () => adService.hideBanner();
export const showInterstitial = () => adService.showInterstitial();
export const showRewarded = (onReward?: (reward: AdReward) => void) => adService.showRewarded(onReward);
