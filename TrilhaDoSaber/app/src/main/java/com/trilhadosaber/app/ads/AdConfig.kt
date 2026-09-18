package com.trilhadosaber.app.ads

/**
 * ============================================================================
 * GERENCIADOR CENTRAL DE CONFIGURAÇÃO DO GOOGLE ADMOB - "TRILHA DO SABER"
 * ============================================================================
 *
 * ⚠️ REGRAS CRÍTICAS DE CONFORMIDADE E SEGURANÇA:
 * 1. NUNCA clique nos seus próprios anúncios ou execute cliques automatizados/artificiais.
 *    O Google AdMob monitora padrões de tráfego e suspende sumariamente contas com
 *    impressões ou cliques inválidos.
 * 2. Durante todo o desenvolvimento e testes locais, mantenha ADMOB_TEST_MODE = true.
 *    Quando estiver true, o aplicativo carrega exclusivamente os blocos de teste oficiais do Google.
 * 3. Quando for publicar a versão final para produção no Google Play:
 *    - Alterne ADMOB_TEST_MODE = false
 *    - Substitua o ADMOB_APP_ID ("ADMOB_APP_ID_AQUI") pelo seu App ID oficial.
 *    - Os IDs reais de App Open e Rewarded já estão perfeitamente configurados abaixo.
 */
object AdConfig {

    /**
     * 🚩 MODO DE TESTE DO ADMOB:
     * - true: Utiliza os blocos de teste oficiais do Google AdMob.
     * - false: Utiliza os blocos reais de produção cadastrados abaixo.
     */
    const val ADMOB_TEST_MODE: Boolean = false

    // ========================================================================
    // 📍 1. IDENTIFICADORES REAIS DO ADMOB (PRODUÇÃO)
    // ========================================================================

    /**
     * 📍 APP ID PRINCIPAL DO ADMOB:
     * ID oficial fornecido pelo usuário: ca-app-pub-8922902046490534~6406875608
     */
    const val ADMOB_APP_ID: String = "ca-app-pub-8922902046490534~6406875608"

    /**
     * 📍 ID REAL DO ANÚNCIO DE ABERTURA (APP OPEN):
     * ca-app-pub-8922902046490534/5270245723
     */
    const val ADMOB_APP_OPEN_ID: String = "ca-app-pub-8922902046490534/5270245723"

    /**
     * 📍 ID REAL DO ANÚNCIO RECOMPENSADO (REWARDED):
     * Utilizado exclusivamente para DUAS funções:
     * A) Gerar Explicação
     * B) Criar Prova
     * ca-app-pub-8922902046490534/2345533630
     */
    const val ADMOB_REWARDED_ID: String = "ca-app-pub-8922902046490534/2345533630"

    /**
     * 📍 ID REAL DO BANNER PRINCIPAL:
     * Bloco existente de rodapé do aplicativo
     */
    const val ADMOB_BANNER_ID: String = "ca-app-pub-8922902046490534/7288943940"

    // ========================================================================
    // 🛡️ 2. IDENTIFICADORES OFICIAIS DE TESTE DO GOOGLE ADMOB
    // Fonte: https://developers.google.com/admob/android/test-ads
    // ========================================================================
    private const val TEST_APP_ID: String = "ca-app-pub-3940256099942544~3347511713"
    private const val TEST_APP_OPEN_ID: String = "ca-app-pub-3940256099942544/9257395921"
    private const val TEST_REWARDED_ID: String = "ca-app-pub-3940256099942544/5224354917"
    private const val TEST_BANNER_ID: String = "ca-app-pub-3940256099942544/6300978111"
    private const val TEST_INTERSTITIAL_ID: String = "ca-app-pub-3940256099942544/1033173712"

    // ========================================================================
    // ⚙️ HELPERS PARA RESOLUÇÃO SEGURA DOS IDENTIFICADORES
    // ========================================================================

    /**
     * Retorna o App ID ativo. Caso o App ID real ainda não tenha sido inserido,
     * retorna o App ID oficial de teste do Google para evitar exceções do SDK no Android Studio.
     */
    fun getActiveAppId(): String {
        return if (ADMOB_TEST_MODE || ADMOB_APP_ID == "ADMOB_APP_ID_AQUI" || ADMOB_APP_ID.isBlank()) {
            TEST_APP_ID
        } else {
            ADMOB_APP_ID.trim()
        }
    }

    /**
     * Retorna o Ad Unit ID ativo para o App Open (Abertura).
     */
    fun getActiveAppOpenAdUnitId(): String {
        return if (ADMOB_TEST_MODE) {
            TEST_APP_OPEN_ID
        } else {
            ADMOB_APP_OPEN_ID.trim()
        }
    }

    /**
     * Retorna o Ad Unit ID ativo para o Rewarded (Recompensado).
     */
    fun getActiveRewardedAdUnitId(): String {
        return if (ADMOB_TEST_MODE) {
            TEST_REWARDED_ID
        } else {
            ADMOB_REWARDED_ID.trim()
        }
    }

    /**
     * Retorna o Ad Unit ID ativo para o Banner principal.
     */
    fun getActiveBannerAdUnitId(): String {
        return if (ADMOB_TEST_MODE) {
            TEST_BANNER_ID
        } else {
            ADMOB_BANNER_ID.trim()
        }
    }

    /**
     * Retorna o Ad Unit ID ativo para Intersticial (fim de tarefas).
     */
    fun getActiveInterstitialAdUnitId(): String {
        return TEST_INTERSTITIAL_ID
    }
}
