package com.trilhadosaber.app.model

data class Student(
    val name: String,
    val grade: String,
    val xp: Int = 0,
    val coins: Int = 0,
    val completedActivities: Int = 0,
    val totalCorrectAnswers: Int = 0
)
