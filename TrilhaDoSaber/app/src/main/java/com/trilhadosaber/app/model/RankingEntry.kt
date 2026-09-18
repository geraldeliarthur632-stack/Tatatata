package com.trilhadosaber.app.model

data class RankingEntry(
    val rank: Int,
    val name: String,
    val grade: String,
    val xp: Int,
    val isCurrentUser: Boolean = false
)
