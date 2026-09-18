package com.trilhadosaber.app

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.widget.EditText
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import com.google.android.material.button.MaterialButton
import com.google.android.material.card.MaterialCardView
import com.trilhadosaber.app.data.PreferencesManager
import com.trilhadosaber.app.data.QuestionsRepository
import com.trilhadosaber.app.engine.GameEngine
import com.trilhadosaber.app.model.CompetitionPlayer
import com.trilhadosaber.app.model.Question

class CompetitionActivity : AppCompatActivity() {

    private lateinit var prefs: PreferencesManager

    // Setup screen views
    private lateinit var layoutSetupPlayers: View
    private lateinit var etNewPlayerName: EditText
    private lateinit var btnAddPlayer: MaterialButton
    private lateinit var tvPlayersCountHeader: TextView
    private lateinit var containerPlayersList: LinearLayout
    private lateinit var btnStartCompetition: MaterialButton

    // Active Quiz views
    private lateinit var layoutActiveCompetition: View
    private lateinit var tvTurnPlayerName: TextView
    private lateinit var tvCompetitionProgress: TextView
    private lateinit var tvCompStatement: TextView
    private lateinit var compOptionCards: List<MaterialCardView>
    private lateinit var compOptionTexts: List<TextView>
    private lateinit var cardCompFeedback: MaterialCardView
    private lateinit var tvCompFeedback: TextView
    private lateinit var btnCompNextTurn: MaterialButton

    // Results Podium views
    private lateinit var layoutResultsPodium: View
    private lateinit var tvWinnerCongrats: TextView
    private lateinit var containerResultsList: LinearLayout
    private lateinit var btnBackHomeFromComp: MaterialButton

    // State
    private val players = mutableListOf<CompetitionPlayer>()
    private var questions: List<Question> = emptyList()
    private var isTieBreaker = false
    private var tieBreakQuestion: Question? = null

    // Game loop indices
    // 5 rounds total; in each round, every player answers 1 question!
    private val totalRounds = 5
    private var currentRound = 1
    private var currentPlayerIndex = 0
    private var answeredCurrentTurn = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_competition)

        prefs = PreferencesManager(this)

        initViews()
        setupDefaultPlayer()
        renderPlayersList()
    }

    private fun initViews() {
        findViewById<ImageView>(R.id.btnBack).setOnClickListener { finish() }

        // Setup
        layoutSetupPlayers = findViewById(R.id.layoutSetupPlayers)
        etNewPlayerName = findViewById(R.id.etNewPlayerName)
        btnAddPlayer = findViewById(R.id.btnAddPlayer)
        tvPlayersCountHeader = findViewById(R.id.tvPlayersCountHeader)
        containerPlayersList = findViewById(R.id.containerPlayersList)
        btnStartCompetition = findViewById(R.id.btnStartCompetition)

        // Active
        layoutActiveCompetition = findViewById(R.id.layoutActiveCompetition)
        tvTurnPlayerName = findViewById(R.id.tvTurnPlayerName)
        tvCompetitionProgress = findViewById(R.id.tvCompetitionProgress)
        tvCompStatement = findViewById(R.id.tvCompStatement)

        compOptionCards = listOf(
            findViewById(R.id.cardCompOpt0),
            findViewById(R.id.cardCompOpt1),
            findViewById(R.id.cardCompOpt2),
            findViewById(R.id.cardCompOpt3)
        )
        compOptionTexts = listOf(
            findViewById(R.id.tvCompOpt0),
            findViewById(R.id.tvCompOpt1),
            findViewById(R.id.tvCompOpt2),
            findViewById(R.id.tvCompOpt3)
        )

        cardCompFeedback = findViewById(R.id.cardCompFeedback)
        tvCompFeedback = findViewById(R.id.tvCompFeedback)
        btnCompNextTurn = findViewById(R.id.btnCompNextTurn)

        // Podium
        layoutResultsPodium = findViewById(R.id.layoutResultsPodium)
        tvWinnerCongrats = findViewById(R.id.tvWinnerCongrats)
        containerResultsList = findViewById(R.id.containerResultsList)
        btnBackHomeFromComp = findViewById(R.id.btnBackHomeFromComp)

        // Listeners
        btnAddPlayer.setOnClickListener { addPlayer() }
        btnStartCompetition.setOnClickListener { startMatch() }

        compOptionCards.forEachIndexed { index, card ->
            card.setOnClickListener {
                if (!answeredCurrentTurn) {
                    handleOptionClick(index)
                }
            }
        }

        btnCompNextTurn.setOnClickListener {
            advanceTurn()
        }

        btnBackHomeFromComp.setOnClickListener {
            AdDialogHelper.showTaskCompletionAd(
                activity = this,
                taskName = "Competição do Saber",
                earnedXp = 50
            ) {
                finish()
            }
        }
    }

    private fun setupDefaultPlayer() {
        val student = prefs.getStudent()
        val name = if (student.name.isNotBlank()) student.name else "Jogador 1"
        players.add(CompetitionPlayer(id = 1, name = name, grade = student.grade))
    }

    private fun addPlayer() {
        if (players.size >= 5) {
            Toast.makeText(this, "Máximo de 5 jogadores atingido", Toast.LENGTH_SHORT).show()
            return
        }
        val name = etNewPlayerName.text.toString().trim()
        if (name.isEmpty()) {
            Toast.makeText(this, "Digite o nome do jogador", Toast.LENGTH_SHORT).show()
            return
        }
        val student = prefs.getStudent()
        val newPlayer = CompetitionPlayer(
            id = players.size + 1,
            name = name,
            grade = student.grade
        )
        players.add(newPlayer)
        etNewPlayerName.text.clear()
        renderPlayersList()
    }

    private fun renderPlayersList() {
        tvPlayersCountHeader.text = "Jogadores Adicionados (${players.size}/5):"
        containerPlayersList.removeAllViews()

        for (player in players) {
            val itemView = layoutInflater.inflate(R.layout.item_player_result, containerPlayersList, false)
            val tvRank = itemView.findViewById<TextView>(R.id.tvResultRank)
            val tvName = itemView.findViewById<TextView>(R.id.tvResultPlayerName)
            val tvScore = itemView.findViewById<TextView>(R.id.tvResultPlayerScore)
            val tvXp = itemView.findViewById<TextView>(R.id.tvResultXpEarned)

            tvRank.text = "${player.id}º"
            tvName.text = player.name
            tvScore.text = "Série: ${player.grade}"
            tvXp.text = "Pronto"

            containerPlayersList.addView(itemView)
        }
    }

    private fun startMatch() {
        val student = prefs.getStudent()
        questions = QuestionsRepository.getQuestionsForCompetition(student.grade, totalRounds)
        currentRound = 1
        currentPlayerIndex = 0
        isTieBreaker = false

        layoutSetupPlayers.visibility = View.GONE
        layoutResultsPodium.visibility = View.GONE
        layoutActiveCompetition.visibility = View.VISIBLE

        loadTurnQuestion()
    }

    private fun loadTurnQuestion() {
        answeredCurrentTurn = false
        val currentPlayer = players[currentPlayerIndex]
        val question = if (isTieBreaker) {
            tieBreakQuestion ?: QuestionsRepository.getTieBreakQuestion()
        } else {
            questions[currentRound - 1]
        }

        tvTurnPlayerName.text = "Vez de: ${currentPlayer.name}!"
        tvCompetitionProgress.text = if (isTieBreaker) "DESEMPATE" else "Rodada $currentRound de $totalRounds"
        tvCompStatement.text = question.statement

        for (i in 0 until 4) {
            val card = compOptionCards[i]
            val tv = compOptionTexts[i]

            if (i < question.options.size) {
                card.visibility = View.VISIBLE
                tv.text = question.options[i]
                card.setBackgroundResource(R.drawable.bg_option_default)
                card.strokeColor = ContextCompat.getColor(this, R.color.cardBorder)
                card.strokeWidth = 2
                tv.setTextColor(ContextCompat.getColor(this, R.color.textColorPrimary))
            } else {
                card.visibility = View.GONE
            }
        }

        cardCompFeedback.visibility = View.GONE
        btnCompNextTurn.isEnabled = false
        btnCompNextTurn.text = "PRÓXIMO JOGADOR"
    }

    private fun handleOptionClick(selectedIndex: Int) {
        answeredCurrentTurn = true
        val question = if (isTieBreaker) {
            tieBreakQuestion ?: QuestionsRepository.getTieBreakQuestion()
        } else {
            questions[currentRound - 1]
        }
        val isCorrect = (selectedIndex == question.correctIndex)
        val currentPlayer = players[currentPlayerIndex]

        if (isCorrect) {
            currentPlayer.score += 1
            currentPlayer.xpEarned += GameEngine.XP_CORRECT_ANSWER

            compOptionCards[selectedIndex].setBackgroundResource(R.drawable.bg_option_correct)
            compOptionCards[selectedIndex].strokeColor = ContextCompat.getColor(this, R.color.colorSuccess)
            compOptionCards[selectedIndex].strokeWidth = 4

            tvCompFeedback.text = "Correto! ${currentPlayer.name} ganhou +10 XP!"
            tvCompFeedback.setTextColor(ContextCompat.getColor(this, R.color.colorSuccess))
        } else {
            compOptionCards[selectedIndex].setBackgroundResource(R.drawable.bg_option_wrong)
            compOptionCards[selectedIndex].strokeColor = ContextCompat.getColor(this, R.color.colorError)
            compOptionCards[selectedIndex].strokeWidth = 4

            compOptionCards[question.correctIndex].setBackgroundResource(R.drawable.bg_option_correct)
            compOptionCards[question.correctIndex].strokeColor = ContextCompat.getColor(this, R.color.colorSuccess)
            compOptionCards[question.correctIndex].strokeWidth = 4

            tvCompFeedback.text = "Incorreto! A resposta correta era a opção ${'A' + question.correctIndex}."
            tvCompFeedback.setTextColor(ContextCompat.getColor(this, R.color.colorError))
        }

        cardCompFeedback.visibility = View.VISIBLE
        btnCompNextTurn.isEnabled = true
    }

    private fun advanceTurn() {
        if (isTieBreaker) {
            // After tie break question, conclude
            finishCompetition()
            return
        }

        currentPlayerIndex++
        if (currentPlayerIndex >= players.size) {
            // Next round
            currentPlayerIndex = 0
            currentRound++
            if (currentRound > totalRounds) {
                checkTieBreakerOrFinish()
                return
            }
        }
        loadTurnQuestion()
    }

    private fun checkTieBreakerOrFinish() {
        if (players.size > 1) {
            val maxScore = players.maxOf { it.score }
            val topPlayers = players.filter { it.score == maxScore }
            if (topPlayers.size > 1 && maxScore > 0) {
                // There is a tie for 1st place! Trigger sudden-death tie breaker!
                isTieBreaker = true
                tieBreakQuestion = QuestionsRepository.getTieBreakQuestion()
                currentPlayerIndex = 0
                Toast.makeText(this, "EMPATE NO 1º LUGAR! Pergunta de desempate!", Toast.LENGTH_LONG).show()
                loadTurnQuestion()
                return
            }
        }
        finishCompetition()
    }

    private fun finishCompetition() {
        layoutActiveCompetition.visibility = View.GONE
        layoutResultsPodium.visibility = View.VISIBLE

        // Sort players by score descending
        val sorted = players.sortedByDescending { it.score }
        val winner = sorted.first()
        winner.isWinner = true
        winner.xpEarned += GameEngine.XP_COMPETITION_WIN

        // If current user participated, save XP to preferences
        val student = prefs.getStudent()
        val userPlayer = players.find { it.name.equals(student.name, ignoreCase = true) }
        if (userPlayer != null && userPlayer.xpEarned > 0) {
            val coinsEarned = if (userPlayer.isWinner) GameEngine.COINS_COMPETITION_WIN else GameEngine.COINS_CORRECT_ANSWER
            prefs.addXpAndCoins(userPlayer.xpEarned, coinsEarned)
            prefs.recordActivityCompleted(userPlayer.score)
        }

        // Save scores to local ranking
        for (p in sorted) {
            prefs.addRankingScore(p.name, p.grade, p.xpEarned)
        }

        tvWinnerCongrats.text = "🏆 Parabéns, ${winner.name}! Campeão do Saber!"

        containerResultsList.removeAllViews()
        sorted.forEachIndexed { index, p ->
            val itemView = layoutInflater.inflate(R.layout.item_player_result, containerResultsList, false)
            val tvRank = itemView.findViewById<TextView>(R.id.tvResultRank)
            val tvName = itemView.findViewById<TextView>(R.id.tvResultPlayerName)
            val tvScore = itemView.findViewById<TextView>(R.id.tvResultPlayerScore)
            val tvXp = itemView.findViewById<TextView>(R.id.tvResultXpEarned)

            val rankNum = index + 1
            when (rankNum) {
                1 -> tvRank.text = "🥇"
                2 -> tvRank.text = "🥈"
                3 -> tvRank.text = "🥉"
                else -> tvRank.text = "${rankNum}º"
            }

            tvName.text = p.name + if (p.isWinner) " 👑 (Vencedor)" else ""
            tvScore.text = "Acertos: ${p.score} de $totalRounds"
            tvXp.text = "+${p.xpEarned} XP"

            containerResultsList.addView(itemView)
        }
    }
}
