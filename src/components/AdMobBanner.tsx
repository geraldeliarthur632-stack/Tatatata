import React, { useEffect, useRef, useState } from 'react';
import { adMobService } from '../services/adMobService';
import { getActiveBannerAdUnitId, getPublisherId, IS_TEST_MODE } from '../config/adMobConfig';

interface AdMobBannerProps {
  currentMode: string;
  theme?: 'light' | 'dark';
  onOpenAgeSettings?: () => void;
  onOpenPrivacy?: () => void;
}

// Ads are deliberately restricted to the four requested tools. Home, login,
// onboarding and all common screens must never reserve or display an ad slot.
const TOOL_MODES = new Set(['explainer', 'photo_exam', 'researcher', 'translator']);

export const AdMobBanner: React.FC<AdMobBannerProps> = ({ currentMode }) => {
  const [hasAdLoaded, setHasAdLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isAllowed = TOOL_MODES.has(currentMode) && adMobService.isAdAllowedForMode(currentMode);
  const bannerUnitId = getActiveBannerAdUnitId();

  useEffect(() => {
    if (!isAllowed) {
      setHasAdLoaded(false);
      return;
    }

    const win = typeof window !== 'undefined' ? (window as any) : null;
    if (win?.AndroidAdMobBridge) return;

    try {
      const slotEl = containerRef.current?.querySelector('.adsbygoogle');
      if (!slotEl || slotEl.getAttribute('data-adsbygoogle-status')) return;
      const adsbygoogle = win?.adsbygoogle || [];
      adsbygoogle.push({});
      const observer = new MutationObserver(() => {
        const status = slotEl.getAttribute('data-ad-status');
        if (status === 'filled') {
          setHasAdLoaded(true);
          adMobService.notifyAdLoaded('banner', bannerUnitId, currentMode);
        } else if (status === 'unfilled') {
          setHasAdLoaded(false);
          adMobService.notifyAdError('banner', 'AdMob Banner no-fill', bannerUnitId, currentMode);
        }
      });
      observer.observe(slotEl, { attributes: true, attributeFilter: ['data-ad-status'] });
      return () => observer.disconnect();
    } catch (error) {
      setHasAdLoaded(false);
      adMobService.notifyAdError('banner', error, bannerUnitId, currentMode);
    }
  }, [isAllowed, currentMode, bannerUnitId]);

  if (!isAllowed) return null;

  return (
    <aside
      id="admob-banner-container"
      ref={containerRef}
      className={`w-full max-w-lg md:max-w-3xl lg:max-w-5xl xl:max-w-6xl mx-auto px-4 my-4 select-none transition-all ${hasAdLoaded ? 'block min-h-[50px]' : 'hidden'}`}
      style={{ marginTop: hasAdLoaded ? 16 : 0, marginBottom: hasAdLoaded ? 16 : 0 }}
      role="complementary"
      aria-label="Espaço oficial Google AdMob"
    >
      <div className="w-full flex justify-center items-center overflow-hidden py-1">
        <ins
          className="adsbygoogle"
          style={{ display: 'inline-block', width: '320px', height: '50px' }}
          data-ad-client={IS_TEST_MODE ? 'ca-pub-3940256099942544' : getPublisherId()}
          data-ad-slot={bannerUnitId}
          data-ad-test={IS_TEST_MODE ? 'on' : undefined}
          data-full-width-responsive="false"
        />
      </div>
    </aside>
  );
};
