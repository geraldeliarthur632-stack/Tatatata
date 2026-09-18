package com.trilhadosaber.app.ads

/**
 * Controle de Estado para Anúncios Recompensados (Rewarded) nos 5 pontos homologados:
 * - REWARD_ACTION_EXPLANATION: Desbloquear explicação especial gerada (Explicador)
 * - REWARD_ACTION_EXAM: Desbloquear criação de prova (Criador de Provas)
 * - REWARD_ACTION_RESEARCH: Desbloquear pesquisa escolar aprofundada (Pesquisador)
 * - REWARD_ACTION_TRANSLATION: Desbloquear tradução e pronúncia avançada (Tradutor)
 * - REWARD_ACTION_HOME_BONUS: Resgate de bônus diário de pontuação (Início)
 * - NONE: Nenhuma ação pendente
 *
 * Garante que a recompensa recebida para uma ação não seja indevidamente aproveitada por outra
 * e seja imediatamente invalidada/limpa após o consumo.
 */
enum class RewardAction {
    NONE,
    REWARD_ACTION_EXPLANATION,
    REWARD_ACTION_EXAM,
    REWARD_ACTION_RESEARCH,
    REWARD_ACTION_TRANSLATION,
    REWARD_ACTION_HOME_BONUS
}
