package com.trilhadosaber.app.data

import com.trilhadosaber.app.model.Question
import com.trilhadosaber.app.model.StudyTopic
import com.trilhadosaber.app.model.Subject

object StudyRepository {

    private val topics = listOf(
        StudyTopic(
            id = "mat_fracoes",
            subject = Subject.MATEMATICA,
            title = "Frações e Operações Básicas",
            gradeLevel = "6º ano",
            summary = "Frações representam partes de um todo dividido em partes iguais. O numerador indica as partes tomadas e o denominador o total de divisões.",
            explanation = "Para somar ou subtrair frações com mesmo denominador, operamos apenas os numeradores. Para denominadores diferentes, calcula-se o MMC para encontrar um denominador comum equivalente. Na multiplicação, multiplica-se numerador por numerador e denominador por denominador. Na divisão, multiplica-se a primeira fração pelo inverso da segunda.",
            examples = listOf(
                "Soma com mesmo denominador: 2/5 + 1/5 = 3/5",
                "Soma com denominadores diferentes: 1/2 + 1/3 = 3/6 + 2/6 = 5/6",
                "Multiplicação: 2/3 * 4/5 = 8/15",
                "Divisão: (3/4) ÷ (2/5) = 3/4 * 5/2 = 15/8"
            ),
            exercises = listOf(
                Question(
                    id = 1001,
                    subject = Subject.MATEMATICA,
                    gradeLevel = "6º ano",
                    difficulty = "Fácil",
                    statement = "Resolva a operação: 2/7 + 3/7",
                    options = listOf("5/7", "5/14", "6/7", "1/7"),
                    correctIndex = 0,
                    explanation = "Mesmo denominador 7: 2 + 3 = 5. Resultado: 5/7."
                ),
                Question(
                    id = 1002,
                    subject = Subject.MATEMATICA,
                    gradeLevel = "6º ano",
                    difficulty = "Médio",
                    statement = "Quanto é 1/2 multiplicado por 4/5?",
                    options = listOf("5/10", "4/10 (ou 2/5)", "2/7", "1/5"),
                    correctIndex = 1,
                    explanation = "1*4 = 4 e 2*5 = 10. Simplificando 4/10 por 2 obtemos 2/5."
                )
            )
        ),
        StudyTopic(
            id = "port_concordancia",
            subject = Subject.PORTUGUES,
            title = "Concordância Verbal e Nominal",
            gradeLevel = "7º ano",
            summary = "A concordância é o princípio sintático que harmoniza o verbo com seu sujeito em número e pessoa, e adjetivos com substantivos em gênero e número.",
            explanation = "Regra geral verbal: o verbo concorda com o núcleo do sujeito em número e pessoa (ex: 'Os alunos estudaram'). Com sujeitos compostos antepostos ao verbo, a concordância é no plural. Com a partícula apassivadora 'se', o verbo concorda com o sujeito paciente (ex: 'Vendem-se casas').",
            examples = listOf(
                "Sujeito simples: O livro chegou hoje.",
                "Sujeito composto: O professor e os alunos organizaram a feira.",
                "Voz passiva sintética: Alugam-se quartos para estudantes.",
                "Concordância nominal: As alunas estavam meio cansadas (meio = advérbio invariável)."
            ),
            exercises = listOf(
                Question(
                    id = 2001,
                    subject = Subject.PORTUGUES,
                    gradeLevel = "7º ano",
                    difficulty = "Médio",
                    statement = "Qual frase está de acordo com a norma-padrão de concordância?",
                    options = listOf(
                        "Fazem três anos que não o vejo.",
                        "Faz três anos que não o vejo.",
                        "Haviam muitas pessoas na sala.",
                        "Vende-se apartamentos novos."
                    ),
                    correctIndex = 1,
                    explanation = "O verbo fazer indicando tempo decorrido é impessoal, devendo permanecer na 3ª pessoa do singular: 'Faz três anos'."
                )
            )
        ),
        StudyTopic(
            id = "cien_fotossintese",
            subject = Subject.CIENCIAS,
            title = "Fotossíntese e Energia Celular",
            gradeLevel = "8º ano",
            summary = "Processo bioquímico pelo qual plantas, algas e certas bactérias convertem energia solar, água e gás carbônico em glicose e oxigênio.",
            explanation = "Ocorre nos cloroplastos, organelas que contêm clorofila, pigmento que absorve a luz solar. A equação básica é: 6 CO2 + 6 H2O + Luz -> C6H12O6 + 6 O2. Além de sustentar a base das cadeias alimentares, o processo renova o oxigênio da atmosfera.",
            examples = listOf(
                "Reagentes: Gás Carbônico (CO2) + Água (H2O) + Energia Luminosa",
                "Produtos: Glicose (energia para o vegetal) + Oxigênio (liberado para o ar)",
                "Local: Células vegetais providas de cloroplastos"
            ),
            exercises = listOf(
                Question(
                    id = 3001,
                    subject = Subject.CIENCIAS,
                    gradeLevel = "8º ano",
                    difficulty = "Fácil",
                    statement = "Qual gás é liberado pelas plantas na atmosfera durante a fotossíntese?",
                    options = listOf("Gás Oxigênio", "Gás Carbônico", "Gás Metano", "Gás Nitrogênio"),
                    correctIndex = 0,
                    explanation = "A quebra da molécula de água durante a etapa fotoquímica libera gás oxigênio (O2) para o meio ambiente."
                )
            )
        ),
        StudyTopic(
            id = "hist_rev_francesa",
            subject = Subject.HISTORIA,
            title = "Revolução Francesa (1789)",
            gradeLevel = "8º ano",
            summary = "Movimento revolucionário que pôs fim ao Antigo Regime na França absolutista, estabelecendo os princípios da cidadania moderna.",
            explanation = "A sociedade francesa era dividida em três estados: 1º (Clero), 2º (Nobreza) e 3º (Burguesia, camponeses e trabalhadores urbanos que sustentavam os impostos). A crise econômica e a difusão das ideias iluministas levaram à tomada da Bastilha em 14 de julho de 1789 e à Declaração dos Direitos do Homem e do Cidadão.",
            examples = listOf(
                "Causa principal: Desigualdade tributária e falência fiscal do Estado francês",
                "Marco inicial: Queda da Bastilha em 14 de julho de 1789",
                "Lema revolucionário: Liberdade, Igualdade e Fraternidade (Liberté, Égalité, Fraternité)"
            ),
            exercises = listOf(
                Question(
                    id = 4001,
                    subject = Subject.HISTORIA,
                    gradeLevel = "8º ano",
                    difficulty = "Médio",
                    statement = "Qual documento histórico de 1789 proclamou que 'os homens nascem e permanecem livres e iguais em direitos'?",
                    options = listOf(
                        "Declaração dos Direitos do Homem e do Cidadão",
                        "Tratado de Versalhes",
                        "Carta Magna",
                        "Código de Hamurabi"
                    ),
                    correctIndex = 0,
                    explanation = "Aprovada em agosto de 1789 pela Assembleia Nacional Constituinte da França, a declaração é um marco universal dos direitos humanos."
                )
            )
        ),
        StudyTopic(
            id = "geo_placas",
            subject = Subject.GEOGRAFIA,
            title = "Tectônica de Placas e Relevo",
            gradeLevel = "7º ano",
            summary = "A litosfera terrestre é fragmentada em blocos rígidos chamados placas tectônicas, que se movem lentamente sobre a astenosfera.",
            explanation = "A movimentação das placas decorre das correntes de convecção de magma no manto terrestre. Os contatos entre placas podem ser convergentes (choque, gerando cordilheiras e fossas), divergentes (afastamento, formando dorsais oceânicas) ou transformantes (deslizamento lateral, como a Falha de San Andreas).",
            examples = listOf(
                "Limite Convergente: Formação da Cordilheira dos Andes (Placa de Nazca com Placa Sul-Americana)",
                "Limite Divergente: Dorsal Mesoatlântica no fundo do Oceano Atlântico",
                "Limite Transformante: Falha de San Andreas na Califórnia (EUA)"
            ),
            exercises = listOf(
                Question(
                    id = 5001,
                    subject = Subject.GEOGRAFIA,
                    gradeLevel = "7º ano",
                    difficulty = "Médio",
                    statement = "Por que o território brasileiro apresenta baixa incidência de terremotos de grande magnitude?",
                    options = listOf(
                        "Porque está situado no centro da Placa Tectônica Sul-Americana",
                        "Porque o Brasil não possui solo rochoso",
                        "Porque o clima tropical impede abalos sísmicos",
                        "Porque as florestas absorvem a energia sísmica"
                    ),
                    correctIndex = 0,
                    explanation = "O Brasil localiza-se na porção central e estável da Placa Sul-Americana, distante das bordas ativas onde ocorrem os grandes atritos sísmicos."
                )
            )
        ),
        StudyTopic(
            id = "ing_simple_past",
            subject = Subject.INGLES,
            title = "Simple Past e Verbos Regulares",
            gradeLevel = "7º ano",
            summary = "O Simple Past é usado para relatar ações completas e acabadas que aconteceram em um momento determinado no passado.",
            explanation = "Em verbos regulares, acrescenta-se '-ed' ao infinitivo (play -> played, watch -> watched). Verbos terminados em 'e' recebem apenas '-d' (live -> lived). Verbos terminados em consoante + 'y' trocam o 'y' por 'ied' (study -> studied). Na forma interrogativa e negativa utiliza-se o auxiliar 'did' / 'didn't', mantendo o verbo principal no infinitivo.",
            examples = listOf(
                "Afirmativa regular: I studied English yesterday afternoon.",
                "Negativa com auxiliar: She didn't watch that movie last night.",
                "Interrogativa: Did they play soccer on Sunday?"
            ),
            exercises = listOf(
                Question(
                    id = 6001,
                    subject = Subject.INGLES,
                    gradeLevel = "7º ano",
                    difficulty = "Fácil",
                    statement = "Qual é a forma correta do verbo 'study' no Simple Past?",
                    options = listOf("studied", "studyed", "studying", "studies"),
                    correctIndex = 0,
                    explanation = "'Study' termina em consoante ('d') + 'y', logo substitui-se o 'y' por 'ied': studied."
                )
            )
        )
    )

    fun searchTopic(subject: Subject, query: String): StudyTopic {
        val normalized = query.trim().lowercase()
        // Try to match query within the selected subject
        val subjectTopics = topics.filter { it.subject == subject }
        val found = subjectTopics.find {
            it.title.lowercase().contains(normalized) || it.summary.lowercase().contains(normalized)
        }
        if (found != null) return found

        // If not found by query, return the first topic of this subject
        if (subjectTopics.isNotEmpty()) {
            return subjectTopics.first()
        }

        // Fallback: return default topic
        return topics.first()
    }

    fun getAllTopicsForSubject(subject: Subject): List<StudyTopic> {
        return topics.filter { it.subject == subject }
    }
}
