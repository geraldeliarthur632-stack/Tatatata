package com.trilhadosaber.app.model

data class CompetitionPlayer(
    val id: Int,
    val name: String,
    val grade: String,
    var score: Int = 0,
    var xpEarned: Int = 0,
    var isWinner: Boolean = false
)
