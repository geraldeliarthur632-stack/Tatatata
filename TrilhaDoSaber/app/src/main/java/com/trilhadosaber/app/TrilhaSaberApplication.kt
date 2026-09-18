package com.trilhadosaber.app

import android.app.Activity
import android.app.Application
import android.os.Bundle
import android.util.Log
import androidx.lifecycle.DefaultLifecycleObserver
import androidx.lifecycle.LifecycleOwner
import androidx.lifecycle.ProcessLifecycleOwner
import com.trilhadosaber.app.ads.AdManager
import com.trilhadosaber.app.ads.AppOpenAdManager

/**
 * Classe Application principal do Trilha do Saber.
 *
 * Responsável por:
 * 1. Inicialização segura do AdManager;
 * 2. Monitoramento do ciclo de vida global do processo (ProcessLifecycleOwner)
 *    para apresentação adequada do App Open Ad no momento da abertura do app,
 *    evitando exibições indevidas durante trocas de telas internas.
 */
class TrilhaSaberApplication : Application(), Application.ActivityLifecycleCallbacks, DefaultLifecycleObserver {

    companion object {
        private const val TAG = "TrilhaSaberApp"
        private var currentActivity: Activity? = null
    }

    override fun onCreate() {
        super.onCreate()
        Log.d(TAG, "Inicializando TrilhaSaberApplication...")

        registerActivityLifecycleCallbacks(this)
        ProcessLifecycleOwner.get().lifecycle.addObserver(this)

        // Inicializa o AdMob de maneira resiliente
        AdManager.initialize(this)
    }

    // ========================================================================
    // DefaultLifecycleObserver (Ciclo de vida do PROCESSO / APP COMO UM TODO)
    // ========================================================================

    override fun onStart(owner: LifecycleOwner) {
        super.onStart(owner)
        Log.d(TAG, "App entrou em primeiro plano (onStart do processo).")

        // Exibe o App Open Ad apenas se houver uma activity ativa e válida
        currentActivity?.let { activity ->
            // Não exibe sobre telas transitórias como Splash caso ela já esteja finalizando
            if (!activity.isFinishing && !activity.isDestroyed) {
                AppOpenAdManager.showAdIfAvailable(activity)
            }
        }
    }

    // ========================================================================
    // ActivityLifecycleCallbacks
    // ========================================================================

    override fun onActivityCreated(activity: Activity, savedInstanceState: Bundle?) {}

    override fun onActivityStarted(activity: Activity) {
        // Atualiza a activity atual quando ela se torna visível
        if (!AppOpenAdManager.isShowingAd) {
            currentActivity = activity
        }
    }

    override fun onActivityResumed(activity: Activity) {
        currentActivity = activity
    }

    override fun onActivityPaused(activity: Activity) {}

    override fun onActivityStopped(activity: Activity) {}

    override fun onActivitySaveInstanceState(activity: Activity, outState: Bundle) {}

    override fun onActivityDestroyed(activity: Activity) {
        if (currentActivity == activity) {
            currentActivity = null
        }
    }
}
