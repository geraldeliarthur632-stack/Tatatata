package com.trilhadosaber.app

import android.app.AlertDialog
import android.os.Bundle
import android.widget.ArrayAdapter
import android.widget.EditText
import android.widget.ImageView
import android.widget.Spinner
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.google.android.material.button.MaterialButton
import com.trilhadosaber.app.data.PreferencesManager
import com.trilhadosaber.app.engine.GameEngine

class ProfileActivity : AppCompatActivity() {

    private lateinit var prefs: PreferencesManager

    private lateinit var tvProfileName: TextView
    private lateinit var tvProfileGrade: TextView
    private lateinit var tvProfileLevelBadge: TextView
    private lateinit var tvProfileXp: TextView
    private lateinit var tvProfileCoins: TextView
    private lateinit var tvProfileActivities: TextView
    private lateinit var tvProfileCorrect: TextView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_profile)

        prefs = PreferencesManager(this)

        initViews()
        loadData()
    }

    private fun initViews() {
        findViewById<ImageView>(R.id.btnBack).setOnClickListener { finish() }

        tvProfileName = findViewById(R.id.tvProfileName)
        tvProfileGrade = findViewById(R.id.tvProfileGrade)
        tvProfileLevelBadge = findViewById(R.id.tvProfileLevelBadge)
        tvProfileXp = findViewById(R.id.tvProfileXp)
        tvProfileCoins = findViewById(R.id.tvProfileCoins)
        tvProfileActivities = findViewById(R.id.tvProfileActivities)
        tvProfileCorrect = findViewById(R.id.tvProfileCorrect)

        val editClickListener = { showEditDialog() }
        findViewById<ImageView>(R.id.btnEditProfile).setOnClickListener { editClickListener() }
        findViewById<MaterialButton>(R.id.btnEditProfileBottom).setOnClickListener { editClickListener() }
    }

    private fun loadData() {
        val student = prefs.getStudent()
        tvProfileName.text = if (student.name.isNotBlank()) student.name else "Estudante"
        tvProfileGrade.text = student.grade

        val levelInfo = GameEngine.getLevelInfo(student.xp)
        tvProfileLevelBadge.text = "Nível ${levelInfo.level} - ${levelInfo.title}"

        tvProfileXp.text = "${student.xp} XP"
        tvProfileCoins.text = student.coins.toString()
        tvProfileActivities.text = student.completedActivities.toString()
        tvProfileCorrect.text = student.totalCorrectAnswers.toString()
    }

    private fun showEditDialog() {
        val student = prefs.getStudent()
        val dialogView = layoutInflater.inflate(R.layout.dialog_edit_profile, null)
        val etName = dialogView.findViewById<EditText>(R.id.dialogEtName)
        val spnGrade = dialogView.findViewById<Spinner>(R.id.dialogSpnGrade)

        etName.setText(student.name)

        val gradesAdapter = ArrayAdapter.createFromResource(
            this,
            R.array.school_grades,
            android.R.layout.simple_spinner_item
        )
        gradesAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
        spnGrade.adapter = gradesAdapter

        val gradesArray = resources.getStringArray(R.array.school_grades)
        val currentIndex = gradesArray.indexOf(student.grade).coerceAtLeast(0)
        spnGrade.setSelection(currentIndex)

        AlertDialog.Builder(this)
            .setView(dialogView)
            .setPositiveButton("Salvar") { _, _ ->
                val newName = etName.text.toString().trim()
                if (newName.isEmpty()) {
                    Toast.makeText(this, "Nome não pode ficar vazio", Toast.LENGTH_SHORT).show()
                    return@setPositiveButton
                }
                val newGrade = spnGrade.selectedItem.toString()
                prefs.saveStudent(newName, newGrade)
                loadData()
                Toast.makeText(this, "Perfil atualizado!", Toast.LENGTH_SHORT).show()
            }
            .setNegativeButton("Cancelar", null)
            .show()
    }
}
