package com.trilhadosaber.app.model

data class Question(
    val id: Int,
    val subject: Subject,
    val gradeLevel: String,
    val difficulty: String,
    val statement: String,
    val options: List<String>,
    val correctIndex: Int,
    val explanation: String
)
