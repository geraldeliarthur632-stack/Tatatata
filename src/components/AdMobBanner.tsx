import React, { useEffect, useRef, useState } from 'react';
import { adMobService } from '../services/adMobService';
import {
  getActiveBannerAdUnitId,
  getPublisherId,
  IS_TEST_MODE,
} from '../config/adMobConfig';

interface AdMobBannerProps {
  currentMode: string;
  theme?: 'light' | 'dark';
  onOpenAgeSettings?: () => void;
  onOpenPrivacy?: () => void;
}

/**
 * Componente oficial do Banner do Google AdMob.
 *
 * Em conformidade estrita com as diretrizes de design do Google AdMob e Política de Famílias:
 * - Margem mínima mandatória de 16dp (16px) entre o conteúdo do aplicativo e o anúncio para prevenção de cliques acidentais.
 * - Não exibe anúncios falsos, fictícios ou inventados ("Nunca invente anúncios").
 * - Se a rede do Google não tiver anúncio disponível (no-fill), NÃO renderiza nada (0px, invisível, sem espaçamento fantasma).
 * - Integração completa com o listener de eventos do adMobService para logar erros de carregamento e cliques.
 * - No Android, o banner é gerenciado pelo AdView oficial do Google Play Services via bridge nativa.
 * - Na web, integra a tag oficial do Google AdSense/AdMob (adsbygoogle).
 */
export const AdMobBanner: React.FC<AdMobBannerProps> = ({
  currentMode,
}) => {
  const [hasAdLoaded, setHasAdLoaded] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // REGRA DE SEGURANÇA E POLÍTICA DE FAMÍLIAS:
  // Se estiver em modo de estudo, desafio, prova ou simulado, não renderiza nada!
  const isAllowed = adMobService.isAdAllowedForMode(currentMode);
  const bannerUnitId = getActiveBannerAdUnitId();

  useEffect(() => {
    if (!isAllowed) {
      setHasAdLoaded(false);
      return;
    }

    // Se estiver em ambiente nativo Android, a ponte oficial do AdMob gerencia o AdView
    const win = typeof window !== 'undefined' ? (window as any) : null;
    if (win?.AndroidAdMobBridge) {
      // O AdView nativo do Android é injetado diretamente pelo SDK
      return;
    }

    // Tentativa de carregamento oficial do Google AdSense/AdMob para Web
    try {
      if (typeof window !== 'undefined') {
        const adsbygoogle = win.adsbygoogle || [];
        const slotEl = containerRef.current?.querySelector('.adsbygoogle');
        if (slotEl && !slotEl.getAttribute('data-adsbygoogle-status')) {
          adsbygoogle.push({});
          // Observa se o Google realmente preencheu o anúncio ou deu no-fill
          const observer = new MutationObserver(() => {
            const status = slotEl.getAttribute('data-ad-status');
            if (status === 'filled') {
              setHasAdLoaded(true);
              adMobService.notifyAdLoaded('banner', bannerUnitId, currentMode);
            } else if (status === 'unfilled') {
              setHasAdLoaded(false);
              adMobService.notifyAdError(
                'banner',
                'AdMob Banner No-Fill / Unfilled pelo servidor do Google',
                bannerUnitId,
                currentMode
              );
            }
          });
          observer.observe(slotEl, { attributes: true, attributeFilter: ['data-ad-status'] });
          return () => observer.disconnect();
        }
      }
    } catch (err) {
      // Se não houver SDK disponível ou falhar, mantém sem anúncio (não inventa nada)
      setHasAdLoaded(false);
      adMobService.notifyAdError('banner', err, bannerUnitId, currentMode);
    }
  }, [isAllowed, currentMode, bannerUnitId]);

  if (!isAllowed) {
    return null;
  }

  const handleBannerClick = () => {
    adMobService.notifyAdClicked('banner', bannerUnitId, currentMode);
  };

  /**
   * DIRETRIZES DE DESIGN DO ADMOB:
   * A separação mínima de 16dp (16px) entre o conteúdo do app e o anúncio é essencial
   * para evitar cliques acidentais e suspensões de conta.
   * Quando não há anúncio carregado, o container é estritamente ocultado (hidden, 0px)
   * para não deixar buracos vazios na tela.
   */
  return (
    <aside
      id="admob-banner-container"
      ref={containerRef}
      onClick={handleBannerClick}
      className={`w-full max-w-lg md:max-w-3xl lg:max-w-5xl xl:max-w-6xl mx-auto px-4 my-4 select-none transition-all z-20 ${
        hasAdLoaded ? 'block min-h-[50px]' : 'hidden'
      }`}
      style={{
        marginTop: hasAdLoaded ? '16px' : '0px',
        marginBottom: hasAdLoaded ? '16px' : '0px',
      }}
      role="complementary"
      aria-label="Espaço oficial Google AdMob"
    >
      <div className="w-full flex justify-center items-center overflow-hidden py-1">
        {/* Bloco de anúncio oficial do Google (AdSense/AdMob Web) */}
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
