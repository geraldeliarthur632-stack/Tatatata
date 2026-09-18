package com.trilhadosaber.app.model

import com.trilhadosaber.app.R

enum class Subject(
    val id: String,
    val displayName: String,
    val iconRes: Int,
    val colorRes: Int
) {
    MATEMATICA("matematica", "Matemática", R.drawable.ic_book, R.color.subject_matematica),
    PORTUGUES("portugues", "Português", R.drawable.ic_study, R.color.subject_portugues),
    CIENCIAS("ciencias", "Ciências", R.drawable.ic_bulb, R.color.subject_ciencias),
    HISTORIA("historia", "História", R.drawable.ic_school, R.color.subject_historia),
    GEOGRAFIA("geografia", "Geografia", R.drawable.ic_trophy, R.color.subject_geografia),
    INGLES("ingles", "Inglês", R.drawable.ic_star, R.color.subject_ingles);

    companion object {
        fun fromId(id: String): Subject {
            return entries.find { it.id.equals(id, ignoreCase = true) } ?: MATEMATICA
        }
    }
}
