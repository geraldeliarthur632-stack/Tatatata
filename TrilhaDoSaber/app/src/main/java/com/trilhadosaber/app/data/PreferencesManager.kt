package com.trilhadosaber.app.data

import android.content.Context
import android.content.SharedPreferences
import com.trilhadosaber.app.model.RankingEntry
import com.trilhadosaber.app.model.Student
import org.json.JSONArray
import org.json.JSONObject

class PreferencesManager(context: Context) {
    private val prefs: SharedPreferences = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

    companion object {
        private const val PREFS_NAME = "trilha_do_saber_prefs"
        private const val KEY_FIRST_RUN = "key_first_run"
        private const val KEY_NAME = "key_student_name"
        private const val KEY_GRADE = "key_student_grade"
        private const val KEY_XP = "key_total_xp"
        private const val KEY_COINS = "key_total_coins"
        private const val KEY_COMPLETED_ACTIVITIES = "key_completed_activities"
        private const val KEY_CORRECT_ANSWERS = "key_correct_answers"
        private const val KEY_RANKING_JSON = "key_ranking_json"
    }

    fun isFirstRun(): Boolean = prefs.getBoolean(KEY_FIRST_RUN, true)

    fun setFirstRunCompleted() {
        prefs.edit().putBoolean(KEY_FIRST_RUN, false).apply()
    }

    fun saveStudent(name: String, grade: String) {
        prefs.edit()
            .putString(KEY_NAME, name)
            .putString(KEY_GRADE, grade)
            .putBoolean(KEY_FIRST_RUN, false)
            .apply()
    }

    fun getStudent(): Student {
        val name = prefs.getString(KEY_NAME, "") ?: ""
        val grade = prefs.getString(KEY_GRADE, "6º ano") ?: "6º ano"
        val xp = prefs.getInt(KEY_XP, 0)
        val coins = prefs.getInt(KEY_COINS, 0)
        val completed = prefs.getInt(KEY_COMPLETED_ACTIVITIES, 0)
        val correct = prefs.getInt(KEY_CORRECT_ANSWERS, 0)
        return Student(name, grade, xp, coins, completed, correct)
    }

    fun addXpAndCoins(xpGain: Int, coinsGain: Int) {
        val currentXp = prefs.getInt(KEY_XP, 0)
        val currentCoins = prefs.getInt(KEY_COINS, 0)
        prefs.edit()
            .putInt(KEY_XP, currentXp + xpGain)
            .putInt(KEY_COINS, currentCoins + coinsGain)
            .apply()
    }

    fun recordActivityCompleted(correctCount: Int) {
        val completed = prefs.getInt(KEY_COMPLETED_ACTIVITIES, 0)
        val correct = prefs.getInt(KEY_CORRECT_ANSWERS, 0)
        prefs.edit()
            .putInt(KEY_COMPLETED_ACTIVITIES, completed + 1)
            .putInt(KEY_CORRECT_ANSWERS, correct + correctCount)
            .apply()
    }

    fun getRanking(): List<RankingEntry> {
        val jsonString = prefs.getString(KEY_RANKING_JSON, null)
        val list = mutableListOf<RankingEntry>()

        val student = getStudent()
        val studentName = if (student.name.isBlank()) "Você" else student.name

        if (jsonString.isNullOrBlank()) {
            // Default seed entries for local initial experience
            val defaultSeeds = listOf(
                RankingEntry(1, "Sofia Alencar", "8º ano", 350),
                RankingEntry(2, "Lucas Mendes", "9º ano", 280),
                RankingEntry(3, "Beatriz Rocha", "7º ano", 210),
                RankingEntry(4, "Gabriel Souza", "6º ano", 160),
                RankingEntry(5, "Mariana Lima", "1º ano EM", 120)
            )
            list.addAll(defaultSeeds)
        } else {
            try {
                val array = JSONArray(jsonString)
                for (i in 0 until array.length()) {
                    val obj = array.getJSONObject(i)
                    list.add(
                        RankingEntry(
                            rank = i + 1,
                            name = obj.getString("name"),
                            grade = obj.getString("grade"),
                            xp = obj.getInt("xp"),
                            isCurrentUser = false
                        )
                    )
                }
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }

        // Merge or update current user in the ranking
        val existingUserIndex = list.indexOfFirst { it.name.equals(studentName, ignoreCase = true) }
        if (existingUserIndex >= 0) {
            val old = list[existingUserIndex]
            list[existingUserIndex] = old.copy(xp = maxOf(old.xp, student.xp), isCurrentUser = true)
        } else {
            list.add(RankingEntry(0, studentName, student.grade, student.xp, isCurrentUser = true))
        }

        // Sort descending by XP
        list.sortByDescending { it.xp }

        // Recalculate ranks
        return list.mapIndexed { index, entry ->
            entry.copy(rank = index + 1)
        }
    }

    fun addRankingScore(name: String, grade: String, xpEarned: Int) {
        val currentList = getRanking().toMutableList()
        val index = currentList.indexOfFirst { it.name.equals(name, ignoreCase = true) }
        if (index >= 0) {
            val item = currentList[index]
            currentList[index] = item.copy(xp = item.xp + xpEarned)
        } else {
            currentList.add(RankingEntry(0, name, grade, xpEarned, false))
        }

        currentList.sortByDescending { it.xp }
        val array = JSONArray()
        for (item in currentList.take(20)) {
            val obj = JSONObject()
            obj.put("name", item.name)
            obj.put("grade", item.grade)
            obj.put("xp", item.xp)
            array.put(obj)
        }
        prefs.edit().putString(KEY_RANKING_JSON, array.toString()).apply()
    }
}
