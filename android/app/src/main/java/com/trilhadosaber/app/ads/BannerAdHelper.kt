package com.trilhadosaber.app.ads

import android.content.Context
import android.util.Log
import android.view.View
import android.view.ViewGroup
import com.google.android.gms.ads.AdListener
import com.google.android.gms.ads.AdRequest
import com.google.android.gms.ads.AdSize
import com.google.android.gms.ads.AdView
import com.google.android.gms.ads.LoadAdError

/**
 * Utilitário oficial para carregamento e controle do Banner Ad do Google AdMob.
 *
 * Regras:
 * - Utiliza o SDK oficial do Google Mobile Ads (AdView).
 * - Usa ID de teste oficial durante o desenvolvimento.
 * - Se não houver anúncio (no-fill / erro de rede), oculta o AdView (View.GONE)
 *   e NUNCA exibe anúncios fictícios ou inventados.
 * - Não sobrepõe botões ou controles clicáveis.
 */
object BannerAdHelper {

    private const val TAG = "BannerAdHelper"

    /**
     * Cria e anexa um AdView do Google AdMob a um ViewGroup container.
     */
    fun attachBanner(
        context: Context,
        container: ViewGroup,
        onAdLoaded: (() -> Unit)? = null,
        onAdFailed: ((String) -> Unit)? = null
    ): AdView {
        val adView = AdView(context).apply {
            setAdSize(AdSize.BANNER)
            adUnitId = AdConfig.getActiveBannerAdUnitId()
        }

        // Esconde por padrão até que o Google AdMob confirme o carregamento real
        adView.visibility = View.GONE
        container.removeAllViews()
        container.addView(adView)

        adView.adListener = object : AdListener() {
            override fun onAdLoaded() {
                Log.d(TAG, "Banner oficial do Google AdMob carregado com sucesso.")
                adView.visibility = View.VISIBLE
                onAdLoaded?.invoke()
            }

            override fun onAdFailedToLoad(error: LoadAdError) {
                Log.w(TAG, "Falha ao carregar banner do AdMob: ${error.message} (Código: ${error.code})")
                // Se não houver anúncio disponível, oculta e não mostra nada
                adView.visibility = View.GONE
                onAdFailed?.invoke(error.message)
            }

            override fun onAdOpened() {
                Log.d(TAG, "Banner do AdMob aberto pelo usuário.")
            }

            override fun onAdClosed() {
                Log.d(TAG, "Banner do AdMob fechado.")
            }
        }

        val adRequest = AdRequest.Builder().build()
        adView.loadAd(adRequest)

        return adView
    }
}
