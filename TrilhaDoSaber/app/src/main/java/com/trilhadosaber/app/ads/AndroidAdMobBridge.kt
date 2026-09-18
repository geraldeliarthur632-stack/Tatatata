package com.trilhadosaber.app.ads

import android.app.Activity
import android.util.Log
import android.webkit.JavascriptInterface
import android.webkit.WebView

/**
 * Ponte Javascript oficial entre o WebView da aplicação e o Google Mobile Ads SDK no Android.
 *
 * Permite que a interface web invoque diretamente os formatos nativos do Google AdMob:
 * - Rewarded Ads (Desbloqueio de Explicações e Provas)
 * - Interstitial Ads (Transição entre telas e tarefas)
 * - App Open Ads (Abertura do aplicativo)
 *
 * O conteúdo dos anúncios é carregado e renderizado EXCLUSIVAMENTE pelo SDK oficial do Google.
 */
class AndroidAdMobBridge(
    private val activity: Activity,
    private val webView: WebView
) {

    companion object {
        private const val TAG = "AndroidAdMobBridge"
    }

    /**
     * Exibe o anúncio recompensado oficial do Google AdMob.
     */
    @JavascriptInterface
    fun showRewardedAd(actionName: String) {
        val action = when (actionName) {
            "REWARD_ACTION_EXPLANATION" -> RewardAction.REWARD_ACTION_EXPLANATION
            "REWARD_ACTION_EXAM" -> RewardAction.REWARD_ACTION_EXAM
            else -> RewardAction.NONE
        }

        activity.runOnUiThread {
            RewardedAdManager.showRewardedAd(
                activity = activity,
                action = action,
                onRewardEarned = { earnedAction ->
                    Log.d(TAG, "Recompensa oficial do AdMob confirmada para: $earnedAction")
                    notifyWebRewardEarned(earnedAction.name)
                },
                onDismissedWithoutReward = {
                    Log.d(TAG, "Anúncio fechado sem recompensa.")
                    notifyWebDismissedWithoutReward()
                },
                onAdNotAvailable = { errMsg ->
                    Log.w(TAG, "Anúncio do AdMob não disponível: $errMsg")
                    notifyWebAdNotAvailable(errMsg)
                }
            )
        }
    }

    /**
     * Exibe o anúncio intersticial oficial do Google AdMob.
     */
    @JavascriptInterface
    fun showInterstitialAd() {
        activity.runOnUiThread {
            InterstitialAdManager.showInterstitial(activity) {
                Log.d(TAG, "Interstitial concluído ou dispensado.")
                webView.evaluateJavascript("if (window.__onAdMobInterstitialDismissed) window.__onAdMobInterstitialDismissed();", null)
            }
        }
    }

    /**
     * Pré-carrega o anúncio premiado do Google AdMob.
     */
    @JavascriptInterface
    fun loadRewardedAd(adUnitId: String?) {
        activity.runOnUiThread {
            RewardedAdManager.loadAd(activity)
        }
    }

    /**
     * Informa se o SDK nativo do Google AdMob está ativo.
     */
    @JavascriptInterface
    fun isAdMobNativeReady(): Boolean {
        return true
    }

    private fun notifyWebRewardEarned(action: String) {
        webView.evaluateJavascript(
            "if (window.__onAdMobRewardEarned) window.__onAdMobRewardEarned('$action');",
            null
        )
    }

    private fun notifyWebDismissedWithoutReward() {
        webView.evaluateJavascript(
            "if (window.__onAdMobDismissedWithoutReward) window.__onAdMobDismissedWithoutReward();",
            null
        )
    }

    private fun notifyWebAdNotAvailable(errMsg: String) {
        val safeMsg = errMsg.replace("'", "\\'")
        webView.evaluateJavascript(
            "if (window.__onAdMobNotAvailable) window.__onAdMobNotAvailable('$safeMsg');",
            null
        )
    }
}
