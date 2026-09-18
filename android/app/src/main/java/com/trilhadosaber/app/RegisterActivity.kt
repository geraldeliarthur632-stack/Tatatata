package com.trilhadosaber.app

import android.content.Intent
import android.os.Bundle
import android.widget.ArrayAdapter
import android.widget.Spinner
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.google.android.material.button.MaterialButton
import com.google.android.material.textfield.TextInputEditText
import com.trilhadosaber.app.data.PreferencesManager

class RegisterActivity : AppCompatActivity() {

    private lateinit var prefs: PreferencesManager
    private lateinit var etStudentName: TextInputEditText
    private lateinit var spnGrade: Spinner
    private lateinit var btnContinue: MaterialButton

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_register)

        prefs = PreferencesManager(this)
        etStudentName = findViewById(R.id.etStudentName)
        spnGrade = findViewById(R.id.spnGrade)
        btnContinue = findViewById(R.id.btnContinue)

        // Setup grade spinner
        val gradesAdapter = ArrayAdapter.createFromResource(
            this,
            R.array.school_grades,
            android.R.layout.simple_spinner_item
        )
        gradesAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
        spnGrade.adapter = gradesAdapter

        btnContinue.setOnClickListener {
            val name = etStudentName.text?.toString()?.trim().orEmpty()
            if (name.isEmpty()) {
                Toast.makeText(this, "Por favor, digite seu nome", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            val grade = spnGrade.selectedItem.toString()
            prefs.saveStudent(name, grade)

            startActivity(Intent(this, HomeActivity::class.java))
            finish()
        }
    }
}
