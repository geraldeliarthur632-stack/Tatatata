package com.trilhadosaber.app

import android.content.Intent
import android.os.Bundle
import android.widget.ProgressBar
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import com.google.android.material.card.MaterialCardView
import com.trilhadosaber.app.data.PreferencesManager
import com.trilhadosaber.app.engine.GameEngine

class HomeActivity : AppCompatActivity() {

    private lateinit var prefs: PreferencesManager
    private lateinit var tvGreeting: TextView
    private lateinit var tvUserGrade: TextView
    private lateinit var tvTotalXp: TextView
    private lateinit var tvTotalCoins: TextView
    private lateinit var tvLevelTitle: TextView
    private lateinit var tvProgressPercent: TextView
    private lateinit var pbLevelProgress: ProgressBar
    private lateinit var tvLevelSub: TextView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_home)

        prefs = PreferencesManager(this)

        initViews()
        setupListeners()
    }

    override fun onResume() {
        super.onResume()
        loadUserData()
    }

    private fun initViews() {
        tvGreeting = findViewById(R.id.tvGreeting)
        tvUserGrade = findViewById(R.id.tvUserGrade)
        tvTotalXp = findViewById(R.id.tvTotalXp)
        tvTotalCoins = findViewById(R.id.tvTotalCoins)
        tvLevelTitle = findViewById(R.id.tvLevelTitle)
        tvProgressPercent = findViewById(R.id.tvProgressPercent)
        pbLevelProgress = findViewById(R.id.pbLevelProgress)
        tvLevelSub = findViewById(R.id.tvLevelSub)
    }

    private fun loadUserData() {
        val student = prefs.getStudent()
        val displayName = if (student.name.isNotBlank()) student.name else "Estudante"
        tvGreeting.text = "Olá, $displayName!"
        tvUserGrade.text = student.grade
        tvTotalXp.text = "${student.xp} XP"
        tvTotalCoins.text = student.coins.toString()

        val levelInfo = GameEngine.getLevelInfo(student.xp)
        val percent = GameEngine.getProgressPercent(student.xp)

        tvLevelTitle.text = "Nível ${levelInfo.level} - ${levelInfo.title}"
        tvProgressPercent.text = "$percent%"
        pbLevelProgress.progress = percent
        tvLevelSub.text = "${student.xp} / ${levelInfo.maxXp} XP para o próximo nível"
    }

    private fun setupListeners() {
        findViewById<MaterialCardView>(R.id.btnHeaderProfile).setOnClickListener {
            startActivity(Intent(this, ProfileActivity::class.java))
        }
        findViewById<MaterialCardView>(R.id.cardJourney).setOnClickListener {
            startActivity(Intent(this, JourneyActivity::class.java))
        }
        findViewById<MaterialCardView>(R.id.cardCustomStudy).setOnClickListener {
            startActivity(Intent(this, CustomStudyActivity::class.java))
        }
        findViewById<MaterialCardView>(R.id.cardCompetition).setOnClickListener {
            startActivity(Intent(this, CompetitionActivity::class.java))
        }
        findViewById<MaterialCardView>(R.id.cardProfile).setOnClickListener {
            startActivity(Intent(this, ProfileActivity::class.java))
        }
        findViewById<MaterialCardView>(R.id.cardRanking).setOnClickListener {
            startActivity(Intent(this, RankingActivity::class.java))
        }
    }
}
