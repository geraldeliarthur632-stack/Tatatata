package com.trilhadosaber.app

import android.os.Bundle
import android.view.View
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.ProgressBar
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import com.google.android.material.button.MaterialButton
import com.google.android.material.card.MaterialCardView
import com.trilhadosaber.app.data.PreferencesManager
import com.trilhadosaber.app.data.QuestionsRepository
import com.trilhadosaber.app.engine.GameEngine
import com.trilhadosaber.app.model.Question
import com.trilhadosaber.app.model.Subject

class QuizActivity : AppCompatActivity() {

    companion object {
        const val EXTRA_SUBJECT_ID = "extra_subject_id"
    }

    private lateinit var prefs: PreferencesManager
    private lateinit var currentSubject: Subject
    private var questions: List<Question> = emptyList()
    private var currentIndex = 0
    private var correctCount = 0
    private var earnedXp = 0
    private var earnedCoins = 0
    private var answered = false

    // Views
    private lateinit var tvSubjectTitle: TextView
    private lateinit var tvQuestionCounter: TextView
    private lateinit var pbQuizProgress: ProgressBar
    private lateinit var tvStatement: TextView

    private lateinit var optionCards: List<MaterialCardView>
    private lateinit var optionTexts: List<TextView>

    private lateinit var cardFeedback: MaterialCardView
    private lateinit var ivFeedbackIcon: ImageView
    private lateinit var tvFeedbackTitle: TextView
    private lateinit var tvXpGain: TextView
    private lateinit var tvExplanation: TextView
    private lateinit var btnNextQuestion: MaterialButton

    private lateinit var summaryOverlay: LinearLayout
    private lateinit var tvFinalScore: TextView
    private lateinit var tvEarnedXpSummary: TextView
    private lateinit var btnFinishQuiz: MaterialButton

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_quiz)

        prefs = PreferencesManager(this)

        val subjectId = intent.getStringExtra(EXTRA_SUBJECT_ID) ?: Subject.MATEMATICA.id
        currentSubject = Subject.fromId(subjectId)

        initViews()
        loadQuestions()
        displayQuestion()
    }

    private fun initViews() {
        tvSubjectTitle = findViewById(R.id.tvSubjectTitle)
        tvQuestionCounter = findViewById(R.id.tvQuestionCounter)
        pbQuizProgress = findViewById(R.id.pbQuizProgress)
        tvStatement = findViewById(R.id.tvStatement)

        optionCards = listOf(
            findViewById(R.id.cardOption0),
            findViewById(R.id.cardOption1),
            findViewById(R.id.cardOption2),
            findViewById(R.id.cardOption3)
        )
        optionTexts = listOf(
            findViewById(R.id.tvOption0),
            findViewById(R.id.tvOption1),
            findViewById(R.id.tvOption2),
            findViewById(R.id.tvOption3)
        )

        cardFeedback = findViewById(R.id.cardFeedback)
        ivFeedbackIcon = findViewById(R.id.ivFeedbackIcon)
        tvFeedbackTitle = findViewById(R.id.tvFeedbackTitle)
        tvXpGain = findViewById(R.id.tvXpGain)
        tvExplanation = findViewById(R.id.tvExplanation)
        btnNextQuestion = findViewById(R.id.btnNextQuestion)

        summaryOverlay = findViewById(R.id.summaryOverlay)
        tvFinalScore = findViewById(R.id.tvFinalScore)
        tvEarnedXpSummary = findViewById(R.id.tvEarnedXpSummary)
        btnFinishQuiz = findViewById(R.id.btnFinishQuiz)

        findViewById<ImageView>(R.id.btnBack).setOnClickListener { finish() }

        optionCards.forEachIndexed { index, card ->
            card.setOnClickListener {
                if (!answered) {
                    handleAnswer(index)
                }
            }
        }

        btnNextQuestion.setOnClickListener {
            if (currentIndex < questions.size - 1) {
                currentIndex++
                displayQuestion()
            } else {
                finishQuizSession()
            }
        }

        btnFinishQuiz.setOnClickListener {
            AdDialogHelper.showTaskCompletionAd(
                activity = this,
                taskName = "Quiz de ${currentSubject.displayName}",
                earnedXp = earnedXp
            ) {
                finish()
            }
        }

        tvSubjectTitle.text = currentSubject.displayName
    }

    private fun loadQuestions() {
        val student = prefs.getStudent()
        questions = QuestionsRepository.getQuestions(currentSubject, student.grade, 5)
        pbQuizProgress.max = questions.size
    }

    private fun displayQuestion() {
        answered = false
        val q = questions[currentIndex]

        tvQuestionCounter.text = "${currentIndex + 1} de ${questions.size}"
        pbQuizProgress.progress = currentIndex + 1
        tvStatement.text = q.statement

        for (i in 0 until 4) {
            val card = optionCards[i]
            val tv = optionTexts[i]

            if (i < q.options.size) {
                card.visibility = View.VISIBLE
                tv.text = q.options[i]
                card.setBackgroundResource(R.drawable.bg_option_default)
                card.strokeColor = ContextCompat.getColor(this, R.color.cardBorder)
                card.strokeWidth = 2
                tv.setTextColor(ContextCompat.getColor(this, R.color.textColorPrimary))
            } else {
                card.visibility = View.GONE
            }
        }

        cardFeedback.visibility = View.GONE
        btnNextQuestion.isEnabled = false
        btnNextQuestion.text = if (currentIndex == questions.size - 1) "VER RESULTADO" else "PRÓXIMA PERGUNTA"
    }

    private fun handleAnswer(selectedIndex: Int) {
        answered = true
        val q = questions[currentIndex]
        val isCorrect = (selectedIndex == q.correctIndex)

        if (isCorrect) {
            correctCount++
            earnedXp += GameEngine.XP_CORRECT_ANSWER
            earnedCoins += GameEngine.COINS_CORRECT_ANSWER

            optionCards[selectedIndex].setBackgroundResource(R.drawable.bg_option_correct)
            optionCards[selectedIndex].strokeColor = ContextCompat.getColor(this, R.color.colorSuccess)
            optionCards[selectedIndex].strokeWidth = 4

            tvFeedbackTitle.text = "Resposta correta!"
            tvFeedbackTitle.setTextColor(ContextCompat.getColor(this, R.color.colorSuccess))
            ivFeedbackIcon.setImageResource(R.drawable.ic_check_circle)
            ivFeedbackIcon.setColorFilter(ContextCompat.getColor(this, R.color.colorSuccess))
            tvXpGain.text = "+${GameEngine.XP_CORRECT_ANSWER} XP"
            tvXpGain.visibility = View.VISIBLE
        } else {
            optionCards[selectedIndex].setBackgroundResource(R.drawable.bg_option_wrong)
            optionCards[selectedIndex].strokeColor = ContextCompat.getColor(this, R.color.colorError)
            optionCards[selectedIndex].strokeWidth = 4

            // Also highlight the correct one
            optionCards[q.correctIndex].setBackgroundResource(R.drawable.bg_option_correct)
            optionCards[q.correctIndex].strokeColor = ContextCompat.getColor(this, R.color.colorSuccess)
            optionCards[q.correctIndex].strokeWidth = 4

            tvFeedbackTitle.text = "Resposta incorreta"
            tvFeedbackTitle.setTextColor(ContextCompat.getColor(this, R.color.colorError))
            ivFeedbackIcon.setImageResource(R.drawable.ic_close)
            ivFeedbackIcon.setColorFilter(ContextCompat.getColor(this, R.color.colorError))
            tvXpGain.visibility = View.GONE
        }

        tvExplanation.text = q.explanation
        cardFeedback.visibility = View.VISIBLE
        btnNextQuestion.isEnabled = true
    }

    private fun finishQuizSession() {
        // Bonus for completing activity
        val bonusXp = GameEngine.XP_COMPLETED_ACTIVITY
        val bonusCoins = GameEngine.COINS_COMPLETED_ACTIVITY
        earnedXp += bonusXp
        earnedCoins += bonusCoins

        prefs.addXpAndCoins(earnedXp, earnedCoins)
        prefs.recordActivityCompleted(correctCount)

        tvFinalScore.text = "Você acertou $correctCount de ${questions.size} perguntas!"
        tvEarnedXpSummary.text = "+$earnedXp XP e +$earnedCoins Moedas!"

        summaryOverlay.visibility = View.VISIBLE
    }
}
