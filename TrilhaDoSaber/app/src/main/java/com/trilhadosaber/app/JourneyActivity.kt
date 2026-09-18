package com.trilhadosaber.app

import android.content.Intent
import android.os.Bundle
import android.widget.ImageView
import androidx.appcompat.app.AppCompatActivity
import com.google.android.material.card.MaterialCardView
import com.trilhadosaber.app.model.Subject

class JourneyActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_journey)

        findViewById<ImageView>(R.id.btnBack).setOnClickListener {
            finish()
        }

        findViewById<MaterialCardView>(R.id.cardMath).setOnClickListener {
            startQuiz(Subject.MATEMATICA)
        }
        findViewById<MaterialCardView>(R.id.cardPortuguese).setOnClickListener {
            startQuiz(Subject.PORTUGUES)
        }
        findViewById<MaterialCardView>(R.id.cardScience).setOnClickListener {
            startQuiz(Subject.CIENCIAS)
        }
        findViewById<MaterialCardView>(R.id.cardHistory).setOnClickListener {
            startQuiz(Subject.HISTORIA)
        }
        findViewById<MaterialCardView>(R.id.cardGeography).setOnClickListener {
            startQuiz(Subject.GEOGRAFIA)
        }
        findViewById<MaterialCardView>(R.id.cardEnglish).setOnClickListener {
            startQuiz(Subject.INGLES)
        }
    }

    private fun startQuiz(subject: Subject) {
        val intent = Intent(this, QuizActivity::class.java).apply {
            putExtra(QuizActivity.EXTRA_SUBJECT_ID, subject.id)
        }
        startActivity(intent)
    }
}
