package com.trilhadosaber.app

import android.content.Intent
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.google.android.material.button.MaterialButton
import com.trilhadosaber.app.data.PreferencesManager

class SplashActivity : AppCompatActivity() {

    private lateinit var prefs: PreferencesManager

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_splash)

        prefs = PreferencesManager(this)

        val btnStart = findViewById<MaterialButton>(R.id.btnStart)
        btnStart.setOnClickListener {
            if (prefs.isFirstRun()) {
                startActivity(Intent(this, RegisterActivity::class.java))
            } else {
                startActivity(Intent(this, HomeActivity::class.java))
            }
            finish()
        }
    }
}
