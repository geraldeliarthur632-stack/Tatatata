package com.trilhadosaber.app.ads

import android.app.Activity
import android.content.Context
import android.util.Log
import android.widget.Toast
import com.google.android.gms.ads.MobileAds
import com.google.android.gms.ads.RequestConfiguration
import com.google.android.material.dialog.MaterialAlertDialogBuilder

/**
 * Fachada central de controle de anúncios do "Trilha do Saber".
 *
 * Responsável por:
 * 1. Inicializar com segurança o Google Mobile Ads SDK sem travar o app em caso de offline/erros;
 * 2. Aplicar a Política para Famílias do Google Play (COPPA / Classificação G);
 * 3. Orquestrar os gerenciadores de App Open e Rewarded Ads;
 * 4. Apresentar os diálogos padronizados de confirmação antes do anúncio premiado.
 */
object AdManager {

    private const val TAG = "AdManager"
    private var isInitialized = false

    /**
     * Inicializa o Mobile Ads SDK de forma resiliente e segura.
     */
    fun initialize(context: Context) {
        if (isInitialized) return

        try {
            Log.d(TAG, "Configurando Google Mobile Ads SDK com Política para Famílias (COPPA / MAX_G)...")

            // Configuração em estrita conformidade com a Google Play Families Policy
            val requestConfig = RequestConfiguration.Builder()
                .setTagForChildDirectedTreatment(RequestConfiguration.TAG_FOR_CHILD_DIRECTED_TREATMENT_TRUE)
                .setMaxAdContentRating(RequestConfiguration.MAX_AD_CONTENT_RATING_G)
                .build()

            MobileAds.setRequestConfiguration(requestConfig)

            MobileAds.initialize(context) { initializationStatus ->
                isInitialized = true
                Log.d(TAG, "Google Mobile Ads SDK inicializado com sucesso: $initializationStatus")

                // Pré-carrega os anúncios iniciais em background
                RewardedAdManager.loadAd(context)
                AppOpenAdManager.loadAd(context)
                InterstitialAdManager.loadAd(context)
            }
        } catch (e: Exception) {
            Log.w(TAG, "Não foi possível inicializar o AdMob SDK (app continuará funcionando normalmente): ${e.message}")
        }
    }

    /**
     * Exibe o Interstitial Ad oficial do AdMob.
     */
    fun showInterstitial(activity: Activity, onDismissed: () -> Unit = {}) {
        InterstitialAdManager.showInterstitial(activity, onDismissed)
    }

    /**
     * Apresenta o fluxo completo para DESBLOQUEAR EXPLICAÇÃO:
     * 1. Exibe diálogo explicativo ("Desbloquear explicação");
     * 2. Se o usuário clicar em "Assistir anúncio", chama o Rewarded Ad;
     * 3. Somente com a recompensa confirmada pelo SDK, dispara onUnlocked.
     */
    fun requestExplanationUnlock(
        activity: Activity,
        onUnlocked: () -> Unit,
        onCancelled: (() -> Unit)? = null
    ) {
        MaterialAlertDialogBuilder(activity)
            .setTitle("Desbloquear explicação")
            .setMessage("Assista a um anúncio para liberar esta explicação.")
            .setPositiveButton("Assistir anúncio") { dialog, _ ->
                dialog.dismiss()
                RewardedAdManager.showRewardedAd(
                    activity = activity,
                    action = RewardAction.REWARD_ACTION_EXPLANATION,
                    onRewardEarned = {
                        Toast.makeText(activity, "Explicação desbloqueada.", Toast.LENGTH_SHORT).show()
                        onUnlocked()
                    },
                    onDismissedWithoutReward = {
                        Toast.makeText(
                            activity,
                            "Você precisa assistir o anúncio até o final para liberar a explicação.",
                            Toast.LENGTH_LONG
                        ).show()
                        onCancelled?.invoke()
                    },
                    onAdNotAvailable = { message ->
                        Toast.makeText(activity, message, Toast.LENGTH_LONG).show()
                        onCancelled?.invoke()
                    }
                )
            }
            .setNegativeButton("Agora não") { dialog, _ ->
                dialog.dismiss()
                onCancelled?.invoke()
            }
            .setCancelable(true)
            .show()
    }

    /**
     * Apresenta o fluxo completo para DESBLOQUEAR CRIAÇÃO DE PROVA:
     * 1. Exibe diálogo explicativo ("Desbloquear prova");
     * 2. Se o usuário clicar em "Assistir anúncio", chama o Rewarded Ad;
     * 3. Somente com a recompensa confirmada pelo SDK, dispara onUnlocked.
     */
    fun requestExamUnlock(
        activity: Activity,
        onUnlocked: () -> Unit,
        onCancelled: (() -> Unit)? = null
    ) {
        MaterialAlertDialogBuilder(activity)
            .setTitle("Desbloquear prova")
            .setMessage("Assista a um anúncio para liberar a criação desta prova.")
            .setPositiveButton("Assistir anúncio") { dialog, _ ->
                dialog.dismiss()
                RewardedAdManager.showRewardedAd(
                    activity = activity,
                    action = RewardAction.REWARD_ACTION_EXAM,
                    onRewardEarned = {
                        Toast.makeText(activity, "Prova desbloqueada.", Toast.LENGTH_SHORT).show()
                        onUnlocked()
                    },
                    onDismissedWithoutReward = {
                        Toast.makeText(
                            activity,
                            "Você precisa assistir o anúncio até o final para liberar a prova.",
                            Toast.LENGTH_LONG
                        ).show()
                        onCancelled?.invoke()
                    },
                    onAdNotAvailable = { message ->
                        Toast.makeText(activity, message, Toast.LENGTH_LONG).show()
                        onCancelled?.invoke()
                    }
                )
            }
            .setNegativeButton("Agora não") { dialog, _ ->
                dialog.dismiss()
                onCancelled?.invoke()
            }
            .setCancelable(true)
            .show()
    }

    /**
     * Apresenta o fluxo completo para DESBLOQUEAR PESQUISA ESCOLAR (Ponto 4 - Pesquisador):
     */
    fun requestResearchUnlock(
        activity: Activity,
        onUnlocked: () -> Unit,
        onCancelled: (() -> Unit)? = null
    ) {
        MaterialAlertDialogBuilder(activity)
            .setTitle("Desbloquear pesquisa completa")
            .setMessage("Assista a um anúncio para liberar o trabalho escolar detalhado com fontes e normas.")
            .setPositiveButton("Assistir anúncio") { dialog, _ ->
                dialog.dismiss()
                RewardedAdManager.showRewardedAd(
                    activity = activity,
                    action = RewardAction.REWARD_ACTION_RESEARCH,
                    onRewardEarned = {
                        Toast.makeText(activity, "Pesquisa escolar liberada!", Toast.LENGTH_SHORT).show()
                        onUnlocked()
                    },
                    onDismissedWithoutReward = {
                        Toast.makeText(activity, "Você precisa assistir até o final para liberar a pesquisa.", Toast.LENGTH_LONG).show()
                        onCancelled?.invoke()
                    },
                    onAdNotAvailable = { message ->
                        Toast.makeText(activity, message, Toast.LENGTH_LONG).show()
                        onCancelled?.invoke()
                    }
                )
            }
            .setNegativeButton("Agora não") { dialog, _ ->
                dialog.dismiss()
                onCancelled?.invoke()
            }
            .setCancelable(true)
            .show()
    }

    /**
     * Apresenta o fluxo completo para DESBLOQUEAR TRADUÇÃO ESCOLAR (Ponto 5 - Tradutor):
     */
    fun requestTranslationUnlock(
        activity: Activity,
        onUnlocked: () -> Unit,
        onCancelled: (() -> Unit)? = null
    ) {
        MaterialAlertDialogBuilder(activity)
            .setTitle("Desbloquear tradução completa")
            .setMessage("Assista a um anúncio para liberar a tradução aprofundada com fonética e exemplos.")
            .setPositiveButton("Assistir anúncio") { dialog, _ ->
                dialog.dismiss()
                RewardedAdManager.showRewardedAd(
                    activity = activity,
                    action = RewardAction.REWARD_ACTION_TRANSLATION,
                    onRewardEarned = {
                        Toast.makeText(activity, "Tradução detalhada liberada!", Toast.LENGTH_SHORT).show()
                        onUnlocked()
                    },
                    onDismissedWithoutReward = {
                        Toast.makeText(activity, "Você precisa assistir até o final para liberar a tradução.", Toast.LENGTH_LONG).show()
                        onCancelled?.invoke()
                    },
                    onAdNotAvailable = { message ->
                        Toast.makeText(activity, message, Toast.LENGTH_LONG).show()
                        onCancelled?.invoke()
                    }
                )
            }
            .setNegativeButton("Agora não") { dialog, _ ->
                dialog.dismiss()
                onCancelled?.invoke()
            }
            .setCancelable(true)
            .show()
    }

    /**
     * Apresenta o fluxo de BÔNUS DIÁRIO DE PONTOS (Ponto 1 - Início):
     */
    fun requestHomeBonusUnlock(
        activity: Activity,
        onUnlocked: () -> Unit,
        onCancelled: (() -> Unit)? = null
    ) {
        MaterialAlertDialogBuilder(activity)
            .setTitle("Bônus diário de estudo")
            .setMessage("Assista a um anúncio para resgatar seus pontos extras de dedicação hoje.")
            .setPositiveButton("Resgatar bônus") { dialog, _ ->
                dialog.dismiss()
                RewardedAdManager.showRewardedAd(
                    activity = activity,
                    action = RewardAction.REWARD_ACTION_HOME_BONUS,
                    onRewardEarned = {
                        Toast.makeText(activity, "Pontos bônus concedidos!", Toast.LENGTH_SHORT).show()
                        onUnlocked()
                    },
                    onDismissedWithoutReward = {
                        Toast.makeText(activity, "Assista até o fim para receber seus pontos.", Toast.LENGTH_LONG).show()
                        onCancelled?.invoke()
                    },
                    onAdNotAvailable = { message ->
                        Toast.makeText(activity, message, Toast.LENGTH_LONG).show()
                        onCancelled?.invoke()
                    }
                )
            }
            .setNegativeButton("Agora não") { dialog, _ ->
                dialog.dismiss()
                onCancelled?.invoke()
            }
            .setCancelable(true)
            .show()
    }
}
