package com.trilhadosaber.app.ads

import android.app.Activity
import android.content.Context
import android.util.Log
import com.google.android.gms.ads.AdError
import com.google.android.gms.ads.AdRequest
import com.google.android.gms.ads.FullScreenContentCallback
import com.google.android.gms.ads.LoadAdError
import com.google.android.gms.ads.rewarded.RewardedAd
import com.google.android.gms.ads.rewarded.RewardedAdLoadCallback

/**
 * Gerenciador central do Anúncio Recompensado (Rewarded Ad).
 *
 * Utiliza um único Ad Unit ID para DUAS funções distintas:
 * A) GERAR EXPLICAÇÃO (REWARD_ACTION_EXPLANATION)
 * B) CRIAR PROVA (REWARD_ACTION_EXAM)
 *
 * Garante:
 * - Pré-carregamento contínuo para resposta imediata ao aluno;
 * - Validação estrita do callback oficial de recompensa (onUserEarnedReward);
 * - Limpeza e invalidação de estado imediata para impedir duplo uso;
 * - Tratamento seguro sem internet ou falha de carregamento sem travar o app;
 * - Respeito às diretrizes do Google AdMob contra fraudes ou cliques artificiais.
 */
object RewardedAdManager {

    private const val TAG = "RewardedAdManager"

    private var rewardedAd: RewardedAd? = null
    private var isLoading = false
    private var currentPendingAction: RewardAction = RewardAction.NONE

    /**
     * Verifica se existe um anúncio premiado pronto para exibição.
     */
    fun isAdReady(): Boolean = rewardedAd != null

    /**
     * Pré-carrega o anúncio premiado em segundo plano.
     */
    fun loadAd(context: Context, onLoaded: (() -> Unit)? = null) {
        if (rewardedAd != null) {
            Log.d(TAG, "Anúncio Rewarded já carregado e pronto para uso.")
            onLoaded?.invoke()
            return
        }

        if (isLoading) {
            Log.d(TAG, "Carregamento de Rewarded já em andamento...")
            return
        }

        isLoading = true
        val adUnitId = AdConfig.getActiveRewardedAdUnitId()
        val adRequest = AdRequest.Builder().build()

        Log.d(TAG, "Iniciando carregamento do Rewarded Ad [ID: $adUnitId] | TestMode: ${AdConfig.ADMOB_TEST_MODE}")

        RewardedAd.load(
            context.applicationContext,
            adUnitId,
            adRequest,
            object : RewardedAdLoadCallback() {
                override fun onAdLoaded(ad: RewardedAd) {
                    isLoading = false
                    rewardedAd = ad
                    Log.d(TAG, "Rewarded Ad carregado com sucesso.")
                    onLoaded?.invoke()
                }

                override fun onAdFailedToLoad(loadAdError: LoadAdError) {
                    isLoading = false
                    rewardedAd = null
                    Log.w(TAG, "Falha ao carregar Rewarded Ad: ${loadAdError.message} (Código: ${loadAdError.code})")
                }
            }
        )
    }

    /**
     * Apresenta o anúncio premiado para uma ação educacional específica.
     *
     * @param activity A Activity atual em primeiro plano.
     * @param action A ação desejada (REWARD_ACTION_EXPLANATION ou REWARD_ACTION_EXAM).
     * @param onRewardEarned Executado SOMENTE quando o SDK oficial confirma a recompensa.
     * @param onDismissedWithoutReward Executado se o aluno fechar o anúncio antes da recompensa.
     * @param onAdNotAvailable Executado caso o anúncio não esteja carregado ou ocorra erro.
     */
    fun showRewardedAd(
        activity: Activity,
        action: RewardAction,
        onRewardEarned: (action: RewardAction) -> Unit,
        onDismissedWithoutReward: () -> Unit,
        onAdNotAvailable: (message: String) -> Unit
    ) {
        if (activity.isFinishing || activity.isDestroyed) {
            Log.w(TAG, "Activity inválida para exibição do anúncio.")
            return
        }

        val ad = rewardedAd
        if (ad == null) {
            Log.w(TAG, "Nenhum Rewarded Ad disponível no momento. Tentando carregar para a próxima tentativa.")
            loadAd(activity)
            onAdNotAvailable("O anúncio não está disponível no momento. Verifique sua conexão e tente novamente.")
            return
        }

        // Define a ação pedagógica que aguarda este anúncio
        currentPendingAction = action
        var userEarnedReward = false

        ad.fullScreenContentCallback = object : FullScreenContentCallback() {
            override fun onAdShowedFullScreenContent() {
                Log.d(TAG, "Rewarded Ad aberto em tela cheia para ação: $action")
            }

            override fun onAdFailedToShowFullScreenContent(adError: AdError) {
                Log.e(TAG, "Erro ao exibir Rewarded Ad: ${adError.message}")
                currentPendingAction = RewardAction.NONE
                rewardedAd = null
                // Pré-carrega um novo para a próxima vez
                loadAd(activity)
                onAdNotAvailable("Não foi possível reproduzir o anúncio agora. Tente novamente mais tarde.")
            }

            override fun onAdDismissedFullScreenContent() {
                Log.d(TAG, "Rewarded Ad fechado pelo usuário. Recompensa conquistada: $userEarnedReward")
                val actionToReward = currentPendingAction

                // LIMPEZA OBRIGATÓRIA DE ESTADO: Garante que uma recompensa nunca seja usada duas vezes
                currentPendingAction = RewardAction.NONE
                rewardedAd = null

                // Pré-carrega imediatamente o próximo anúncio para a próxima vez
                loadAd(activity)

                if (userEarnedReward && actionToReward != RewardAction.NONE) {
                    onRewardEarned(actionToReward)
                } else {
                    onDismissedWithoutReward()
                }
            }
        }

        // Exibe o anúncio e aguarda a confirmação de recompensa do SDK
        ad.show(activity) { rewardItem ->
            Log.d(TAG, "Recompensa confirmada pelo AdMob SDK: ${rewardItem.amount} ${rewardItem.type}")
            userEarnedReward = true
        }
    }
}
