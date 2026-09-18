package com.trilhadosaber.app.model

data class StudyTopic(
    val id: String,
    val subject: Subject,
    val title: String,
    val gradeLevel: String,
    val summary: String,
    val explanation: String,
    val examples: List<String>,
    val exercises: List<Question>
)
