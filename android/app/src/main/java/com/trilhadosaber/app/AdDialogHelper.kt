package com.trilhadosaber.app

import android.app.Activity
import android.os.Handler
import android.os.Looper
import android.view.LayoutInflater
import android.widget.TextView
import androidx.appcompat.app.AlertDialog
import com.google.android.material.button.MaterialButton
import com.google.android.material.dialog.MaterialAlertDialogBuilder

/**
 * Helper para exibição de Anúncio Intersticial Educacional ao finalizar ou sair de tarefas.
 * Cumpre a exigência do usuário: "aparecer anúncios na hora de sair de alguma tarefa ou que terminou,
 * não ficar o tempo todo na tela".
 * Em total conformidade com a Google Play Families Policy e COPPA.
 */
object AdDialogHelper {

    private val sponsors = listOf(
        Pair(
            "Olimpíada do Saber & Matemática Divertida",
            "Desenvolva seu raciocínio lógico com desafios e simulados gratuitos para todas as séries."
        ),
        Pair(
            "Biblioteca Digital & Acervo Escolar",
            "Mais de 10.000 livros, contos infantojuvenis e enciclopédias ilustradas com acesso livre."
        ),
        Pair(
            "Iniciação Científica & Robótica Escolar",
            "Aprenda lógica de programação, circuitos simples e experimentos práticos de ciências."
        ),
        Pair(
            "Clube de Redação & Vocabulário Nota 10",
            "Dicas de escrita, pontuação e conectivos para mandar bem em todas as avaliações."
        )
    )

    fun showTaskCompletionAd(
        activity: Activity,
        taskName: String,
        earnedXp: Int = 0,
        onDismiss: () -> Unit
    ) {
        if (activity.isFinishing || activity.isDestroyed) {
            onDismiss()
            return
        }

        val sponsor = sponsors.random()
        var countdown = 3
        var canDismiss = false

        val builder = MaterialAlertDialogBuilder(activity)
        builder.setCancelable(false)

        val dialogView = LayoutInflater.from(activity).inflate(R.layout.dialog_task_exit_ad, null)
        val tvTaskTitle = dialogView.findViewById<TextView>(R.id.tvAdTaskTitle)
        val tvXpGain = dialogView.findViewById<TextView>(R.id.tvAdXpGain)
        val tvSponsorTitle = dialogView.findViewById<TextView>(R.id.tvAdSponsorTitle)
        val tvSponsorDesc = dialogView.findViewById<TextView>(R.id.tvAdSponsorDesc)
        val btnContinue = dialogView.findViewById<MaterialButton>(R.id.btnAdContinue)

        tvTaskTitle.text = taskName
        if (earnedXp > 0) {
            tvXpGain.text = "+$earnedXp XP"
            tvXpGain.visibility = android.view.View.VISIBLE
        } else {
            tvXpGain.visibility = android.view.View.GONE
        }

        tvSponsorTitle.text = sponsor.first
        tvSponsorDesc.text = sponsor.second
        btnContinue.text = "Aguarde (${countdown}s)..."
        btnContinue.isEnabled = false

        builder.setView(dialogView)
        val dialog: AlertDialog = builder.create()
        dialog.window?.setBackgroundDrawableResource(android.R.color.transparent)
        dialog.show()

        val handler = Handler(Looper.getMainLooper())
        val runnable = object : Runnable {
            override fun run() {
                countdown--
                if (countdown > 0) {
                    btnContinue.text = "Aguarde (${countdown}s)..."
                    handler.postDelayed(this, 1000)
                } else {
                    canDismiss = true
                    btnContinue.isEnabled = true
                    btnContinue.text = "Continuar para o Início ➔"
                }
            }
        }
        handler.postDelayed(runnable, 1000)

        btnContinue.setOnClickListener {
            if (canDismiss || countdown <= 0) {
                handler.removeCallbacks(runnable)
                dialog.dismiss()
                onDismiss()
            }
        }
    }
}
