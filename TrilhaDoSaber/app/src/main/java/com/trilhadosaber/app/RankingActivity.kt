package com.trilhadosaber.app

import android.os.Bundle
import android.widget.ImageView
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.trilhadosaber.app.data.PreferencesManager

class RankingActivity : AppCompatActivity() {

    private lateinit var prefs: PreferencesManager
    private lateinit var rvRanking: RecyclerView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_ranking)

        prefs = PreferencesManager(this)

        findViewById<ImageView>(R.id.btnBack).setOnClickListener { finish() }
        rvRanking = findViewById(R.id.rvRanking)
        rvRanking.layoutManager = LinearLayoutManager(this)

        loadRanking()
    }

    private fun loadRanking() {
        val rankingList = prefs.getRanking()
        rvRanking.adapter = RankingAdapter(rankingList)
    }
}
