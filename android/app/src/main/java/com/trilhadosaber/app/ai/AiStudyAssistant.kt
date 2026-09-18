package com.trilhadosaber.app.ai

import com.trilhadosaber.app.model.StudyTopic
import com.trilhadosaber.app.model.Subject

/**
 * Interface preparada para futura integração com serviços de IA externa (ex: Gemini API via backend proxy).
 * Mantém conformidade de segurança: nenhuma chave secreta ou token embutido no aplicativo nativo.
 */
interface AiStudyAssistant {
    fun isAvailable(): Boolean
    fun generateTopic(subject: Subject, query: String, grade: String, callback: (Result<StudyTopic>) -> Unit)
}

class OfflineStudyAssistant : AiStudyAssistant {
    override fun isAvailable(): Boolean = false // Modo offline padrão seguro

    override fun generateTopic(
        subject: Subject,
        query: String,
        grade: String,
        callback: (Result<StudyTopic>) -> Unit
    ) {
        // Fallback offline gerenciado pelo StudyRepository
        callback(Result.failure(UnsupportedOperationException("Modo offline ativado")))
    }
}
