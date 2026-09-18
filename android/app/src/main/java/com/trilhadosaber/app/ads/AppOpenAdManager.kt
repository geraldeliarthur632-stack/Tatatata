package com.trilhadosaber.app.ads

import android.app.Activity
import android.content.Context
import android.util.Log
import com.google.android.gms.ads.AdError
import com.google.android.gms.ads.AdRequest
import com.google.android.gms.ads.FullScreenContentCallback
import com.google.android.gms.ads.LoadAdError
import com.google.android.gms.ads.appopen.AppOpenAd
import java.util.Date

/**
 * Gerenciador do Anúncio de Abertura do Aplicativo (App Open Ad).
 *
 * Utiliza o Ad Unit ID oficial: ca-app-pub-8922902046490534/5270245723
 *
 * Características:
 * - Ciclo de vida estrito: Carregamento assíncrono antecipado;
 * - Validade máxima de 4 horas por anúncio em conformidade com as diretrizes do AdMob;
 * - Não bloqueia a abertura nem a experiência do aluno caso não esteja pronto;
 * - Previne exibições repetitivas ao alternar telas internas no aplicativo;
 * - Se não houver internet ou o anúncio falhar, o app abre instantaneamente sem erros.
 */
object AppOpenAdManager {

    private const val TAG = "AppOpenAdManager"
    private const val AD_EXPIRATION_HOURS = 4L
    private const val MIN_INTERVAL_BETWEEN_SHOWS_MS = 60_000L // 60 segundos de intervalo mínimo

    private var appOpenAd: AppOpenAd? = null
    private var isLoading = false
    var isShowingAd = false
        private set

    private var loadTime: Long = 0
    private var lastShowTime: Long = 0

    /**
     * Verifica se o anúncio carregado ainda é válido (não expirou e não está nulo).
     */
    fun isAdAvailable(): Boolean {
        val ad = appOpenAd ?: return false
        val hoursElapsed = (Date().time - loadTime) / (3600 * 1000)
        return hoursElapsed < AD_EXPIRATION_HOURS
    }

    /**
     * Carrega antecipadamente o App Open Ad em segundo plano.
     */
    fun loadAd(context: Context, onLoaded: (() -> Unit)? = null) {
        if (isAdAvailable()) {
            Log.d(TAG, "App Open Ad já disponível em cache e válido.")
            onLoaded?.invoke()
            return
        }

        if (isLoading) {
            Log.d(TAG, "Carregamento de App Open Ad já em execução.")
            return
        }

        isLoading = true
        val adUnitId = AdConfig.getActiveAppOpenAdUnitId()
        val adRequest = AdRequest.Builder().build()

        Log.d(TAG, "Carregando App Open Ad [ID: $adUnitId] | TestMode: ${AdConfig.ADMOB_TEST_MODE}")

        AppOpenAd.load(
            context.applicationContext,
            adUnitId,
            adRequest,
            object : AppOpenAd.AppOpenAdLoadCallback() {
                override fun onAdLoaded(ad: AppOpenAd) {
                    isLoading = false
                    appOpenAd = ad
                    loadTime = Date().time
                    Log.d(TAG, "App Open Ad carregado com sucesso.")
                    onLoaded?.invoke()
                }

                override fun onAdFailedToLoad(loadAdError: LoadAdError) {
                    isLoading = false
                    appOpenAd = null
                    Log.w(TAG, "Falha ao carregar App Open Ad: ${loadAdError.message} (Código: ${loadAdError.code})")
                }
            }
        )
    }

    /**
     * Exibe o App Open Ad caso esteja disponível e no momento adequado do ciclo de vida.
     *
     * @param activity A Activity em primeiro plano.
     * @param onAdDismissed Chamado quando o anúncio fechar ou se não houver anúncio disponível.
     */
    fun showAdIfAvailable(
        activity: Activity,
        onAdDismissed: () -> Unit = {}
    ) {
        if (isShowingAd) {
            Log.d(TAG, "Um anúncio já está sendo exibido na tela.")
            onAdDismissed()
            return
        }

        // Verifica intervalo mínimo para não incomodar o estudante
        val now = System.currentTimeMillis()
        if (now - lastShowTime < MIN_INTERVAL_BETWEEN_SHOWS_MS) {
            Log.d(TAG, "Intervalo mínimo entre App Open Ads ainda não atingido. Prosseguindo.")
            onAdDismissed()
            return
        }

        if (!isAdAvailable()) {
            Log.d(TAG, "App Open Ad indisponível no momento. Continuando para o aplicativo.")
            loadAd(activity)
            onAdDismissed()
            return
        }

        val ad = appOpenAd ?: run {
            onAdDismissed()
            return
        }

        ad.fullScreenContentCallback = object : FullScreenContentCallback() {
            override fun onAdShowedFullScreenContent() {
                isShowingAd = true
                lastShowTime = System.currentTimeMillis()
                Log.d(TAG, "App Open Ad exibido em tela cheia.")
            }

            override fun onAdFailedToShowFullScreenContent(adError: AdError) {
                Log.e(TAG, "Falha ao exibir App Open Ad: ${adError.message}")
                appOpenAd = null
                isShowingAd = false
                loadAd(activity)
                onAdDismissed()
            }

            override fun onAdDismissedFullScreenContent() {
                Log.d(TAG, "App Open Ad fechado. Continuando fluxo do aplicativo.")
                appOpenAd = null
                isShowingAd = false
                // Pré-carrega o próximo para quando o app for reaberto
                loadAd(activity)
                onAdDismissed()
            }
        }

        ad.show(activity)
    }
}
