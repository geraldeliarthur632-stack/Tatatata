package com.trilhadosaber.app.ads

/**
 * Controle de Estado para Anúncios Recompensados (Rewarded).
 * Determina com precisão qual recurso educacional está aguardando a recompensa:
 * - REWARD_ACTION_EXPLANATION: Desbloquear explicação especial gerada
 * - REWARD_ACTION_EXAM: Desbloquear criação de prova
 * - NONE: Nenhuma ação pendente
 *
 * Garante que a recompensa recebida para uma ação não seja indevidamente aproveitada por outra
 * e seja imediatamente invalidada/limpa após o consumo.
 */
enum class RewardAction {
    NONE,
    REWARD_ACTION_EXPLANATION,
    REWARD_ACTION_EXAM
}
