package com.trilhadosaber.app.ads

import android.app.Activity
import android.content.Context
import android.util.Log
import com.google.android.gms.ads.AdError
import com.google.android.gms.ads.AdRequest
import com.google.android.gms.ads.FullScreenContentCallback
import com.google.android.gms.ads.LoadAdError
import com.google.android.gms.ads.interstitial.InterstitialAd
import com.google.android.gms.ads.interstitial.InterstitialAdLoadCallback

/**
 * Gerenciador oficial do Anúncio Intersticial (Interstitial Ad) do Google AdMob.
 *
 * Utiliza o SDK oficial do Google Mobile Ads (com.google.android.gms.ads.interstitial.InterstitialAd).
 *
 * Regras:
 * - Não simula anúncios inventados.
 * - Carrega anúncios diretamente dos servidores do Google AdMob.
 * - Em desenvolvimento, usa o ID oficial de teste: ca-app-pub-3940256099942544/1033173712
 * - Se nenhum anúncio estiver pronto, NÃO inventa ou substitui por anúncio fictício.
 */
object InterstitialAdManager {

    private const val TAG = "InterstitialAdManager"

    private var interstitialAd: InterstitialAd? = null
    private var isLoading = false

    /**
     * Verifica se existe um anúncio intersticial pronto para exibição.
     */
    fun isAdReady(): Boolean = interstitialAd != null

    /**
     * Pré-carrega o anúncio intersticial em segundo plano.
     */
    fun loadAd(context: Context, onLoaded: (() -> Unit)? = null) {
        if (interstitialAd != null) {
            Log.d(TAG, "Anúncio Interstitial já carregado e pronto para exibição.")
            onLoaded?.invoke()
            return
        }

        if (isLoading) {
            Log.d(TAG, "Carregamento de Interstitial já em andamento...")
            return
        }

        isLoading = true
        val adUnitId = AdConfig.getActiveInterstitialAdUnitId()
        val adRequest = AdRequest.Builder().build()

        Log.d(TAG, "Iniciando carregamento do Interstitial Ad oficial [ID: $adUnitId] | TestMode: ${AdConfig.ADMOB_TEST_MODE}")

        InterstitialAd.load(
            context.applicationContext,
            adUnitId,
            adRequest,
            object : InterstitialAdLoadCallback() {
                override fun onAdLoaded(ad: InterstitialAd) {
                    isLoading = false
                    interstitialAd = ad
                    Log.d(TAG, "Interstitial Ad oficial do Google carregado com sucesso.")
                    onLoaded?.invoke()
                }

                override fun onAdFailedToLoad(loadAdError: LoadAdError) {
                    isLoading = false
                    interstitialAd = null
                    Log.w(TAG, "Falha ao carregar Interstitial Ad do AdMob: ${loadAdError.message} (Código: ${loadAdError.code})")
                }
            }
        )
    }

    /**
     * Exibe o anúncio intersticial na Activity especificada.
     *
     * @param activity Activity em primeiro plano.
     * @param onDismissed Callback invocado quando o usuário fechar o anúncio ou se não houver anúncio.
     */
    fun showInterstitial(
        activity: Activity,
        onDismissed: () -> Unit
    ) {
        if (activity.isFinishing || activity.isDestroyed) {
            Log.w(TAG, "Activity inválida para exibição do Interstitial.")
            onDismissed()
            return
        }

        val ad = interstitialAd
        if (ad == null) {
            Log.d(TAG, "Nenhum Interstitial Ad disponível no momento. Prosseguindo sem anúncio.")
            // Recarrega para a próxima oportunidade
            loadAd(activity)
            onDismissed()
            return
        }

        ad.fullScreenContentCallback = object : FullScreenContentCallback() {
            override fun onAdDismissedFullScreenContent() {
                Log.d(TAG, "Interstitial Ad fechado pelo usuário.")
                interstitialAd = null
                // Pré-carrega o próximo anúncio
                loadAd(activity)
                onDismissed()
            }

            override fun onAdFailedToShowFullScreenContent(adError: AdError) {
                Log.w(TAG, "Falha ao exibir Interstitial Ad: ${adError.message}")
                interstitialAd = null
                loadAd(activity)
                onDismissed()
            }

            override fun onAdShowedFullScreenContent() {
                Log.d(TAG, "Interstitial Ad exibido na tela com sucesso.")
            }
        }

        ad.show(activity)
    }
}
