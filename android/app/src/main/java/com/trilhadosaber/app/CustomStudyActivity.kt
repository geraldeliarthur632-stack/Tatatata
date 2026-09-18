package com.trilhadosaber.app

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.ArrayAdapter
import android.widget.EditText
import android.widget.ImageView
import android.widget.Spinner
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import com.google.android.material.button.MaterialButton
import com.trilhadosaber.app.ads.AdManager
import com.trilhadosaber.app.data.PreferencesManager
import com.trilhadosaber.app.data.StudyRepository
import com.trilhadosaber.app.model.StudyTopic
import com.trilhadosaber.app.model.Subject

class CustomStudyActivity : AppCompatActivity() {

    private lateinit var prefs: PreferencesManager
    private lateinit var etStudyQuery: EditText
    private lateinit var spnStudySubject: Spinner
    private lateinit var btnSearchStudy: MaterialButton
    private lateinit var tvTopicTitle: TextView
    private lateinit var tvSectionHeader: TextView
    private lateinit var tvContentBody: TextView

    private lateinit var btnTabSummary: MaterialButton
    private lateinit var btnTabExplanation: MaterialButton
    private lateinit var btnTabExamples: MaterialButton
    private lateinit var btnTabExercises: MaterialButton
    private lateinit var btnCreateExamFromTopic: MaterialButton

    private var currentTopic: StudyTopic? = null
    private var currentTab: Int = 0 // 0: Resumo, 1: Explicação, 2: Exemplos, 3: Exercícios

    // Tópicos cuja explicação já foi desbloqueada via Rewarded Ad nesta sessão
    private val unlockedExplanationTopics = mutableSetOf<String>()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_custom_study)

        prefs = PreferencesManager(this)
        initViews()
        setupSpinner()
        setupListeners()

        // Initial default topic load
        loadTopic(Subject.MATEMATICA, "frações")
    }

    private fun initViews() {
        findViewById<ImageView>(R.id.btnBack).setOnClickListener { finish() }
        etStudyQuery = findViewById(R.id.etStudyQuery)
        spnStudySubject = findViewById(R.id.spnStudySubject)
        btnSearchStudy = findViewById(R.id.btnSearchStudy)
        tvTopicTitle = findViewById(R.id.tvTopicTitle)
        tvSectionHeader = findViewById(R.id.tvSectionHeader)
        tvContentBody = findViewById(R.id.tvContentBody)

        btnTabSummary = findViewById(R.id.btnTabSummary)
        btnTabExplanation = findViewById(R.id.btnTabExplanation)
        btnTabExamples = findViewById(R.id.btnTabExamples)
        btnTabExercises = findViewById(R.id.btnTabExercises)
        btnCreateExamFromTopic = findViewById(R.id.btnCreateExamFromTopic)
    }

    private fun setupSpinner() {
        val subjectsList = Subject.entries.map { it.displayName }
        val adapter = ArrayAdapter(this, android.R.layout.simple_spinner_item, subjectsList)
        adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
        spnStudySubject.adapter = adapter
    }

    private fun setupListeners() {
        btnSearchStudy.setOnClickListener {
            val selectedSubject = Subject.entries[spnStudySubject.selectedItemPosition]
            val query = etStudyQuery.text.toString().trim()
            loadTopic(selectedSubject, query)
        }

        btnTabSummary.setOnClickListener { selectTab(0) }

        // ====================================================================
        // FLUXO DE REWARDED AD: DESBLOQUEAR EXPLICAÇÃO
        // ====================================================================
        btnTabExplanation.setOnClickListener {
            val topic = currentTopic
            if (topic != null && unlockedExplanationTopics.contains(topic.title)) {
                // Já desbloqueada anteriormente
                selectTab(1)
            } else {
                // Solicita ao aluno desbloquear via anúncio premiado oficial
                AdManager.requestExplanationUnlock(
                    activity = this,
                    onUnlocked = {
                        topic?.let { unlockedExplanationTopics.add(it.title) }
                        selectTab(1)
                    }
                )
            }
        }

        btnTabExamples.setOnClickListener { selectTab(2) }
        btnTabExercises.setOnClickListener { selectTab(3) }

        // ====================================================================
        // FLUXO DE REWARDED AD: DESBLOQUEAR CRIAÇÃO DE PROVA
        // ====================================================================
        btnCreateExamFromTopic.setOnClickListener {
            val selectedSubject = Subject.entries[spnStudySubject.selectedItemPosition]
            AdManager.requestExamUnlock(
                activity = this,
                onUnlocked = {
                    // Inicia o Quiz/Simulado com as questões da matéria do tema
                    val intent = Intent(this, QuizActivity::class.java).apply {
                        putExtra(QuizActivity.EXTRA_SUBJECT_ID, selectedSubject.name)
                    }
                    startActivity(intent)
                }
            )
        }
    }

    private fun loadTopic(subject: Subject, query: String) {
        val topic = StudyRepository.searchTopic(subject, query)
        currentTopic = topic
        tvTopicTitle.text = topic.title
        selectTab(0)
    }

    private fun selectTab(index: Int) {
        currentTab = index
        val topic = currentTopic ?: return

        val primaryBg = ContextCompat.getColor(this, R.color.colorPrimary)
        val textOnPrimary = ContextCompat.getColor(this, R.color.textColorOnPrimary)
        val secondaryBg = ContextCompat.getColor(this, R.color.surfaceColor)
        val textSecondary = ContextCompat.getColor(this, R.color.textColorPrimary)

        val buttons = listOf(btnTabSummary, btnTabExplanation, btnTabExamples, btnTabExercises)
        buttons.forEachIndexed { i, btn ->
            if (i == index) {
                btn.setBackgroundColor(primaryBg)
                btn.setTextColor(textOnPrimary)
                btn.strokeWidth = 0
            } else {
                btn.setBackgroundColor(secondaryBg)
                btn.setTextColor(textSecondary)
                btn.strokeColor = ContextCompat.getColorStateList(this, R.color.cardBorder)
                btn.strokeWidth = 2
            }
        }

        when (index) {
            0 -> {
                tvSectionHeader.text = "📝 Resumo do Conteúdo"
                tvContentBody.text = topic.summary
            }
            1 -> {
                tvSectionHeader.text = "💡 Explicação Detalhada"
                tvContentBody.text = topic.explanation
            }
            2 -> {
                tvSectionHeader.text = "🔍 Exemplos Práticos"
                val sb = StringBuilder()
                topic.examples.forEachIndexed { i, ex ->
                    sb.append("${i + 1}. $ex\n\n")
                }
                tvContentBody.text = sb.toString().trim()
            }
            3 -> {
                tvSectionHeader.text = "✍️ Exercícios com Gabarito"
                val sb = StringBuilder()
                topic.exercises.forEachIndexed { i, q ->
                    sb.append("Questão ${i + 1}: ${q.statement}\n")
                    q.options.forEachIndexed { optIndex, opt ->
                        val letter = ('A' + optIndex)
                        val isAnswer = (optIndex == q.correctIndex)
                        sb.append("   ($letter) $opt ${if (isAnswer) "✓ [Correta]" else ""}\n")
                    }
                    sb.append("   ➜ Explicação: ${q.explanation}\n\n")
                }
                tvContentBody.text = sb.toString().trim()
            }
        }
    }
}
