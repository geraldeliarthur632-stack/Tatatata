package com.trilhadosaber.app.engine

object GameEngine {
    const val XP_CORRECT_ANSWER = 10
    const val XP_COMPLETED_ACTIVITY = 20
    const val XP_COMPETITION_WIN = 30

    const val COINS_CORRECT_ANSWER = 2
    const val COINS_COMPLETED_ACTIVITY = 5
    const val COINS_COMPETITION_WIN = 10

    data class LevelInfo(
        val level: Int,
        val title: String,
        val minXp: Int,
        val maxXp: Int
    )

    private val levels = listOf(
        LevelInfo(1, "Aprendiz", 0, 100),
        LevelInfo(2, "Explorador", 100, 250),
        LevelInfo(3, "Pesquisador", 250, 500),
        LevelInfo(4, "Estudioso", 500, 1000),
        LevelInfo(5, "Mestre do Saber", 1000, 2500)
    )

    fun getLevelInfo(xp: Int): LevelInfo {
        for (lvl in levels) {
            if (xp in lvl.minXp until lvl.maxXp) {
                return lvl
            }
        }
        val max = levels.last()
        return if (xp >= max.maxXp) {
            LevelInfo(max.level + ((xp - max.maxXp) / 1000) + 1, "Grão-Mestre", max.maxXp, max.maxXp + 1000)
        } else {
            levels.first()
        }
    }

    fun getProgressPercent(xp: Int): Int {
        val info = getLevelInfo(xp)
        val range = info.maxXp - info.minXp
        if (range <= 0) return 100
        val current = xp - info.minXp
        return ((current.toDouble() / range.toDouble()) * 100).toInt().coerceIn(0, 100)
    }
}
