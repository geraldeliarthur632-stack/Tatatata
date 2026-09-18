package com.trilhadosaber.app.data

import com.trilhadosaber.app.model.Question
import com.trilhadosaber.app.model.Subject

object QuestionsRepository {

    private val allQuestions = listOf(
        // ==========================================
        // MATEMÁTICA
        // ==========================================
        Question(
            id = 101,
            subject = Subject.MATEMATICA,
            gradeLevel = "6º ano",
            difficulty = "Fácil",
            statement = "Quanto é 3/4 + 2/4?",
            options = listOf("5/4", "5/8", "6/4", "1/4"),
            correctIndex = 0,
            explanation = "Em frações com denominadores iguais, somamos os numeradores (3 + 2 = 5) e mantemos o mesmo denominador (4). Portanto, 5/4."
        ),
        Question(
            id = 102,
            subject = Subject.MATEMATICA,
            gradeLevel = "7º ano",
            difficulty = "Médio",
            statement = "Qual é o valor de x na equação de 1º grau: 2x + 6 = 18?",
            options = listOf("x = 4", "x = 6", "x = 8", "x = 12"),
            correctIndex = 1,
            explanation = "Subtraindo 6 de ambos os lados: 2x = 18 - 6 => 2x = 12. Dividindo por 2: x = 6."
        ),
        Question(
            id = 103,
            subject = Subject.MATEMATICA,
            gradeLevel = "8º ano",
            difficulty = "Médio",
            statement = "Qual é o perímetro de um retângulo com base de 8 cm e altura de 5 cm?",
            options = listOf("40 cm", "26 cm", "13 cm", "20 cm"),
            correctIndex = 1,
            explanation = "O perímetro é a soma de todos os lados: P = 2 * (base + altura) = 2 * (8 + 5) = 2 * 13 = 26 cm."
        ),
        Question(
            id = 104,
            subject = Subject.MATEMATICA,
            gradeLevel = "9º ano",
            difficulty = "Difícil",
            statement = "Em um triângulo retângulo, os catetos medem 6 cm e 8 cm. Qual é a medida da hipotenusa?",
            options = listOf("14 cm", "10 cm", "12 cm", "48 cm"),
            correctIndex = 1,
            explanation = "Pelo Teorema de Pitágoras: a² = b² + c² => a² = 6² + 8² = 36 + 64 = 100 => a = √100 = 10 cm."
        ),
        Question(
            id = 105,
            subject = Subject.MATEMATICA,
            gradeLevel = "1º ano do Ensino Médio",
            difficulty = "Médio",
            statement = "Qual é o vértice da parábola dada pela função f(x) = x² - 4x + 3?",
            options = listOf("V(2, -1)", "V(-2, 1)", "V(4, 3)", "V(1, 3)"),
            correctIndex = 0,
            explanation = "Xv = -b / (2a) = -(-4) / 2 = 2. Yv = f(2) = 2² - 4(2) + 3 = 4 - 8 + 3 = -1. Logo, V(2, -1)."
        ),
        Question(
            id = 106,
            subject = Subject.MATEMATICA,
            gradeLevel = "2º ano do Ensino Médio",
            difficulty = "Difícil",
            statement = "Quantos termos tem a progressão aritmética (PA): (3, 7, 11, ..., 79)?",
            options = listOf("18", "20", "22", "19"),
            correctIndex = 1,
            explanation = "Fórmula do termo geral an = a1 + (n - 1)*r. Aqui an = 79, a1 = 3, r = 4. 79 = 3 + 4(n-1) => 76 = 4(n-1) => 19 = n-1 => n = 20."
        ),
        Question(
            id = 107,
            subject = Subject.MATEMATICA,
            gradeLevel = "3º ano do Ensino Médio",
            difficulty = "Difícil",
            statement = "Qual é a probabilidade de se obter um número par ao lançar um dado comum de 6 faces?",
            options = listOf("1/3", "1/6", "1/2", "2/3"),
            correctIndex = 2,
            explanation = "Os números pares em um dado são {2, 4, 6} (3 possibilidades em 6). 3/6 = 1/2 (50%)."
        ),

        // ==========================================
        // PORTUGUÊS
        // ==========================================
        Question(
            id = 201,
            subject = Subject.PORTUGUES,
            gradeLevel = "6º ano",
            difficulty = "Fácil",
            statement = "Qual das palavras abaixo é proparoxítona?",
            options = listOf("Café", "Lâmpada", "Papel", "Janela"),
            correctIndex = 1,
            explanation = "'Lâm-pa-da' tem a antepenúltima sílaba tônica. Todas as proparoxítonas são acentuadas na língua portuguesa."
        ),
        Question(
            id = 202,
            subject = Subject.PORTUGUES,
            gradeLevel = "7º ano",
            difficulty = "Médio",
            statement = "Na frase 'O sol brilhava no céu límpido', qual é o sujeito da oração?",
            options = listOf("no céu", "límpido", "O sol", "brilhava"),
            correctIndex = 2,
            explanation = "Perguntamos ao verbo: 'Quem brilhava?'. Resposta: 'O sol'. Portanto, 'O sol' é o sujeito simples."
        ),
        Question(
            id = 203,
            subject = Subject.PORTUGUES,
            gradeLevel = "8º ano",
            difficulty = "Médio",
            statement = "Identifique a oração com voz passiva analítica:",
            options = listOf(
                "O menino chutou a bola.",
                "A bola foi chutada pelo menino.",
                "O menino feriu-se.",
                "Vendem-se casas antigas."
            ),
            correctIndex = 1,
            explanation = "'A bola foi chutada pelo menino' possui verbo auxiliar (foi) + particípio (chutada) e o sujeito paciente (A bola)."
        ),
        Question(
            id = 204,
            subject = Subject.PORTUGUES,
            gradeLevel = "9º ano",
            difficulty = "Médio",
            statement = "Qual figura de linguagem está presente em 'Seus olhos são dois faróis brilhando na escuridão'?",
            options = listOf("Metáfora", "Pleonasmo", "Hipérbole", "Eufemismo"),
            correctIndex = 0,
            explanation = "A metáfora consiste em uma comparação implícita, sem o uso de conectivos comparativos diretos como 'como' ou 'tal qual'."
        ),
        Question(
            id = 205,
            subject = Subject.PORTUGUES,
            gradeLevel = "1º ano do Ensino Médio",
            difficulty = "Difícil",
            statement = "Qual movimento literário brasileiro valorizou o índio como herói nacional e a exaltação da natureza?",
            options = listOf("Realismo", "Romantismo", "Barroco", "Modernismo"),
            correctIndex = 1,
            explanation = "A primeira geração do Romantismo no Brasil (indianista e nacionalista) elegeu o indígena como símbolo e herói nacional."
        ),
        Question(
            id = 206,
            subject = Subject.PORTUGUES,
            gradeLevel = "2º ano do Ensino Médio",
            difficulty = "Médio",
            statement = "Assinale a opção com regência verbal correta de acordo com a norma padrão:",
            options = listOf(
                "Nós assistimos o filme ontem.",
                "Nós assistimos ao filme ontem.",
                "Ele aspira o cargo de diretor.",
                "Obedeci o sinal de trânsito."
            ),
            correctIndex = 1,
            explanation = "No sentido de ver/presenciar, o verbo 'assistir' é transitivo indireto e exige a preposição 'a': 'assistir ao filme'."
        ),
        Question(
            id = 207,
            subject = Subject.PORTUGUES,
            gradeLevel = "3º ano do Ensino Médio",
            difficulty = "Difícil",
            statement = "A Semana de Arte Moderna de 1922, marco do Modernismo no Brasil, ocorreu em qual cidade?",
            options = listOf("Rio de Janeiro", "Salvador", "São Paulo", "Belo Horizonte"),
            correctIndex = 2,
            explanation = "A Semana de Arte Moderna ocorreu no Theatro Municipal de São Paulo, entre 13 e 18 de fevereiro de 1922."
        ),

        // ==========================================
        // CIÊNCIAS
        // ==========================================
        Question(
            id = 301,
            subject = Subject.CIENCIAS,
            gradeLevel = "6º ano",
            difficulty = "Fácil",
            statement = "Qual camada interna da Terra é sólida e composta principalmente por ferro e níquel?",
            options = listOf("Manto", "Crosta terrestre", "Núcleo interno", "Litosfera"),
            correctIndex = 2,
            explanation = "O núcleo interno da Terra é composto predominantemente por ferro e níquel, permanecendo sólido devido às altíssimas pressões."
        ),
        Question(
            id = 302,
            subject = Subject.CIENCIAS,
            gradeLevel = "7º ano",
            difficulty = "Médio",
            statement = "Qual organela celular é responsável pela produção de energia (respiração celular)?",
            options = listOf("Ribossomo", "Mitocôndria", "Complexo de Golgi", "Lisossomo"),
            correctIndex = 1,
            explanation = "A mitocôndria é conhecida como a 'usina de energia' da célula eucarionte, realizando a respiração celular e gerando ATP."
        ),
        Question(
            id = 303,
            subject = Subject.CIENCIAS,
            gradeLevel = "8º ano",
            difficulty = "Médio",
            statement = "Qual é o principal gás responsável pelo efeito estufa liberado na queima de combustíveis fósseis?",
            options = listOf("Gás Carbônico (CO2)", "Oxigênio (O2)", "Hélio (He)", "Ozônio (O3)"),
            correctIndex = 0,
            explanation = "O dióxido de carbono (CO2) é o principal gás de efeito estufa associado à queima de carvão, derivados de petróleo e gás natural."
        ),
        Question(
            id = 304,
            subject = Subject.CIENCIAS,
            gradeLevel = "9º ano",
            difficulty = "Difícil",
            statement = "O que estabelece a Primeira Lei de Newton (Lei da Inércia)?",
            options = listOf(
                "A toda ação corresponde uma reação igual e contrária.",
                "A aceleração é proporcional à força resultante.",
                "Um corpo em repouso ou em movimento retilíneo uniforme tende a manter seu estado a menos que uma força resultante atue sobre ele.",
                "Dois corpos se atraem com força proporcional às suas massas."
            ),
            correctIndex = 2,
            explanation = "A Lei da Inércia enuncia que corpos preservam seu estado de repouso ou movimento retilíneo uniforme até que forças externas interfiram."
        ),
        Question(
            id = 305,
            subject = Subject.CIENCIAS,
            gradeLevel = "1º ano do Ensino Médio",
            difficulty = "Médio",
            statement = "Em genética mendeliana, indivíduos que possuem alelos iguais para uma característica (ex: AA ou aa) são chamados de:",
            options = listOf("Heterozigotos", "Homozigotos", "Hemizigotos", "Codominantes"),
            correctIndex = 1,
            explanation = "Indivíduos com alelos idênticos no mesmo lócus (AA ou aa) são homozigotos (puros)."
        ),
        Question(
            id = 306,
            subject = Subject.CIENCIAS,
            gradeLevel = "2º ano do Ensino Médio",
            difficulty = "Difícil",
            statement = "Qual é o processo em que uma substância passa diretamente do estado sólido para o gasoso?",
            options = listOf("Condensação", "Fusão", "Sublimação", "Solidificação"),
            correctIndex = 2,
            explanation = "Sublimação é a mudança direta de fase do estado sólido para o gasoso sem passar pelo estado líquido intermediário."
        ),
        Question(
            id = 307,
            subject = Subject.CIENCIAS,
            gradeLevel = "3º ano do Ensino Médio",
            difficulty = "Difícil",
            statement = "O que caracteriza as ligações covalentes entre átomos?",
            options = listOf(
                "Compartilhamento de pares de elétrons.",
                "Transferência definitiva de elétrons formando íons.",
                "Interação exclusiva entre metais pesados.",
                "Atração por gravidade nuclear."
            ),
            correctIndex = 0,
            explanation = "Na ligação covalente, os átomos compartilham pares eletrônicos para alcançarem a estabilidade eletrônica."
        ),

        // ==========================================
        // HISTÓRIA
        // ==========================================
        Question(
            id = 401,
            subject = Subject.HISTORIA,
            gradeLevel = "6º ano",
            difficulty = "Fácil",
            statement = "Qual civilização antiga desenvolveu a escrita cuneiforme entre os rios Tigre e Eufrates?",
            options = listOf("Egípcia", "Mesopotâmica", "Grega", "Romana"),
            correctIndex = 1,
            explanation = "A escrita cuneiforme foi criada pelos sumérios na Mesopotâmia por volta de 3200 a.C."
        ),
        Question(
            id = 402,
            subject = Subject.HISTORIA,
            gradeLevel = "7º ano",
            difficulty = "Médio",
            statement = "Qual foi o principal sistema socioeconômico predominante na Europa Ocidental durante a Idade Média?",
            options = listOf("Capitalismo industrial", "Feudalismo", "Socialismo", "Mercantilismo"),
            correctIndex = 1,
            explanation = "O feudalismo era baseado na posse da terra (feudo), laços de suserania e vassalagem e trabalho servil."
        ),
        Question(
            id = 403,
            subject = Subject.HISTORIA,
            gradeLevel = "8º ano",
            difficulty = "Médio",
            statement = "Qual evento histórico ocorrido em 1789 teve como lema 'Liberdade, Igualdade e Fraternidade'?",
            options = listOf("Revolução Francesa", "Guerra Civil Americana", "Independência do Brasil", "Revolução Russa"),
            correctIndex = 0,
            explanation = "A Revolução Francesa iniciou-se em 1789 com a queda da Bastilha, sob os ideais iluministas de Liberdade, Igualdade e Fraternidade."
        ),
        Question(
            id = 404,
            subject = Subject.HISTORIA,
            gradeLevel = "9º ano",
            difficulty = "Médio",
            statement = "A Proclamação da República no Brasil ocorreu em qual data?",
            options = listOf("7 de setembro de 1822", "15 de novembro de 1889", "13 de maio de 1888", "21 de abril de 1792"),
            correctIndex = 1,
            explanation = "A República foi proclamada no dia 15 de novembro de 1889 na Praça da Aclamação (atual Praça da República) no Rio de Janeiro."
        ),
        Question(
            id = 405,
            subject = Subject.HISTORIA,
            gradeLevel = "1º ano do Ensino Médio",
            difficulty = "Difícil",
            statement = "Qual foi a principal consequência imediata do assassinato do arquiduque Francisco Ferdinando em 1914?",
            options = listOf(
                "A deflagração da Primeira Guerra Mundial",
                "O fim do Império Romano",
                "A Queda do Muro de Berlim",
                "A Revolução Francesa"
            ),
            correctIndex = 0,
            explanation = "O atentado de Sarajevo em 1914 acionou a rede de alianças militares europeias, culminando na Primeira Guerra Mundial."
        ),
        Question(
            id = 406,
            subject = Subject.HISTORIA,
            gradeLevel = "2º ano do Ensino Médio",
            difficulty = "Médio",
            statement = "O período de tensão geopolítica entre Estados Unidos e União Soviética após 1945 ficou conhecido como:",
            options = listOf("Guerra Fria", "Guerra dos Cem Anos", "Pax Romana", "Corrida do Ouro"),
            correctIndex = 0,
            explanation = "A Guerra Fria caracterizou-se pela disputa ideológica, tecnológica e espacial sem conflito bélico direto entre as duas superpotências."
        ),
        Question(
            id = 407,
            subject = Subject.HISTORIA,
            gradeLevel = "3º ano do Ensino Médio",
            difficulty = "Difícil",
            statement = "A atual Constituição Brasileira, conhecida como a 'Constituição Cidadã', foi promulgada em:",
            options = listOf("1964", "1988", "1934", "1891"),
            correctIndex = 1,
            explanation = "A Constituição de 1988 consolidou o processo de redemocratização brasileira, ampliando direitos sociais e liberdades individuais."
        ),

        // ==========================================
        // GEOGRAFIA
        // ==========================================
        Question(
            id = 501,
            subject = Subject.GEOGRAFIA,
            gradeLevel = "6º ano",
            difficulty = "Fácil",
            statement = "Qual movimento da Terra em torno do seu próprio eixo dura cerca de 24 horas e origina os dias e as noites?",
            options = listOf("Translação", "Rotação", "Precessão", "Nutação"),
            correctIndex = 1,
            explanation = "O movimento de rotação é o giro da Terra ao redor do seu eixo imaginário, durando aproximadamente 23h 56min e 4s (24h)."
        ),
        Question(
            id = 502,
            subject = Subject.GEOGRAFIA,
            gradeLevel = "7º ano",
            difficulty = "Fácil",
            statement = "Em quantas grandes regiões oficiais o IBGE divide o território brasileiro?",
            options = listOf("4 regiões", "5 regiões", "6 regiões", "7 regiões"),
            correctIndex = 1,
            explanation = "O Brasil é dividido pelo IBGE em 5 macrorregiões: Norte, Nordeste, Centro-Oeste, Sudeste e Sul."
        ),
        Question(
            id = 503,
            subject = Subject.GEOGRAFIA,
            gradeLevel = "8º ano",
            difficulty = "Médio",
            statement = "Qual é o maior bioma brasileiro em extensão territorial?",
            options = listOf("Cerrado", "Mata Atlântica", "Amazônia", "Caatinga"),
            correctIndex = 2,
            explanation = "O bioma Amazônia abrange quase metade do território brasileiro (cerca de 49%), com extraordinária biodiversidade."
        ),
        Question(
            id = 504,
            subject = Subject.GEOGRAFIA,
            gradeLevel = "9º ano",
            difficulty = "Médio",
            statement = "Qual bloco econômico sul-americano foi criado pelo Tratado de Assunção em 1991?",
            options = listOf("União Europeia", "Mercosul", "Nafta", "Brics"),
            correctIndex = 1,
            explanation = "O Mercosul (Mercado Comum do Sul) foi formalizado em 1991 por Brasil, Argentina, Paraguai e Uruguai."
        ),
        Question(
            id = 505,
            subject = Subject.GEOGRAFIA,
            gradeLevel = "1º ano do Ensino Médio",
            difficulty = "Difícil",
            statement = "O ponto de encontro ou choque entre placas tectônicas é chamado de limite:",
            options = listOf("Convergente", "Divergente", "Transformante", "Estático"),
            correctIndex = 0,
            explanation = "Limites convergentes ocorrem quando placas tectônicas colidem, resultando em dobramentos modernos como a Cordilheira dos Andes."
        ),
        Question(
            id = 506,
            subject = Subject.GEOGRAFIA,
            gradeLevel = "2º ano do Ensino Médio",
            difficulty = "Médio",
            statement = "A pirâmide etária com base estreita e topo alargado indica um país com:",
            options = listOf(
                "Alta taxa de natalidade e baixa expectativa de vida",
                "Baixa taxa de natalidade e envelhecimento da população",
                "Predomínio absoluto de jovens",
                "Explosão demográfica recente"
            ),
            correctIndex = 1,
            explanation = "A base estreita reflete menor número de nascimentos e o topo largo demonstra alta longevidade da população idosa."
        ),
        Question(
            id = 507,
            subject = Subject.GEOGRAFIA,
            gradeLevel = "3º ano do Ensino Médio",
            difficulty = "Difícil",
            statement = "O que caracteriza a atual fase de Globalização no espaço mundial?",
            options = listOf(
                "Isolamento comercial e redução dos fluxos de dados",
                "Intensa integração econômica, fluxo instantâneo de informações e redes financeiras mundiais",
                "Fim das fronteiras geopolíticas nacionais",
                "Diminuição das desigualdades globais"
            ),
            correctIndex = 1,
            explanation = "A globalização é acelerada pela revolução técnico-científica informacional, conectando mercados em tempo real."
        ),

        // ==========================================
        // INGLÊS
        // ==========================================
        Question(
            id = 601,
            subject = Subject.INGLES,
            gradeLevel = "6º ano",
            difficulty = "Fácil",
            statement = "Qual é a forma correta do verbo to be na frase: 'She ___ my best friend'?",
            options = listOf("are", "is", "am", "be"),
            correctIndex = 1,
            explanation = "Para a terceira pessoa do singular (he/she/it) no presente simples do verbo to be, utiliza-se 'is'."
        ),
        Question(
            id = 602,
            subject = Subject.INGLES,
            gradeLevel = "7º ano",
            difficulty = "Fácil",
            statement = "Qual é o passado simples regular do verbo 'to play'?",
            options = listOf("playing", "played", "playes", "plays"),
            correctIndex = 1,
            explanation = "Verbos regulares em inglês formam o Simple Past adicionando o sufixo '-ed': play -> played."
        ),
        Question(
            id = 603,
            subject = Subject.INGLES,
            gradeLevel = "8º ano",
            difficulty = "Médio",
            statement = "Complete com o pronome interrogativo adequado: '___ is your favorite subject at school?'",
            options = listOf("When", "Where", "What", "Who"),
            correctIndex = 2,
            explanation = "'What' significa 'qual' ou 'o que' quando questionamos sobre coisas, matérias ou preferências."
        ),
        Question(
            id = 604,
            subject = Subject.INGLES,
            gradeLevel = "9º ano",
            difficulty = "Médio",
            statement = "Qual frase utiliza corretamente o comparativo de superioridade em inglês?",
            options = listOf(
                "Math is more easy than History.",
                "Math is easier than History.",
                "Math is most easy than History.",
                "Math is easyer than History."
            ),
            correctIndex = 1,
            explanation = "Adjetivos curtos terminados em 'y' precedido de consoante (easy) trocam o 'y' por 'ier': 'easier than'."
        ),
        Question(
            id = 605,
            subject = Subject.INGLES,
            gradeLevel = "1º ano do Ensino Médio",
            difficulty = "Difícil",
            statement = "Qual das opções representa uma frase na voz passiva (Passive Voice)?",
            options = listOf(
                "The chef cooked the meal.",
                "The meal was cooked by the chef.",
                "The chef is cooking now.",
                "The meal will cook soon."
            ),
            correctIndex = 1,
            explanation = "'The meal was cooked by the chef' tem sujeito paciente + verbo to be no passado (was) + particípio (cooked) + agente da passiva (by the chef)."
        ),
        Question(
            id = 606,
            subject = Subject.INGLES,
            gradeLevel = "2º ano do Ensino Médio",
            difficulty = "Difícil",
            statement = "Qual conector (linking word) expressa ideia de oposição ou contraste?",
            options = listOf("Furthermore", "However", "Because", "Therefore"),
            correctIndex = 1,
            explanation = "'However' significa 'no entanto' / 'porém', sendo uma conjunção adversativa de contraste."
        ),
        Question(
            id = 607,
            subject = Subject.INGLES,
            gradeLevel = "3º ano do Ensino Médio",
            difficulty = "Difícil",
            statement = "Identify the Second Conditional sentence:",
            options = listOf(
                "If it rains, I will stay home.",
                "If I had studied, I would have passed.",
                "If I won the lottery, I would travel around the world.",
                "If you heat water, it boils."
            ),
            correctIndex = 2,
            explanation = "A Second Conditional expressa hipótese presente/futura com estrutura: If + Simple Past (won), would + infinitive (would travel)."
        )
    )

    fun getQuestions(subject: Subject, grade: String, count: Int = 5): List<Question> {
        val filtered = allQuestions.filter { it.subject == subject }
        val gradeMatches = filtered.filter { it.gradeLevel.equals(grade, ignoreCase = true) }
        val pool = if (gradeMatches.size >= count) gradeMatches else filtered
        return pool.shuffled().take(count)
    }

    fun getQuestionsForCompetition(grade: String, count: Int = 5): List<Question> {
        val gradeMatches = allQuestions.filter { it.gradeLevel.equals(grade, ignoreCase = true) }
        val pool = if (gradeMatches.size >= count) gradeMatches else allQuestions
        return pool.shuffled().take(count)
    }

    fun getTieBreakQuestion(): Question {
        return Question(
            id = 999,
            subject = Subject.MATEMATICA,
            gradeLevel = "Geral",
            difficulty = "Desempate",
            statement = "PERGUNTA DE DESEMPATE: Quanto é (12 × 5) - (8 × 4)?",
            options = listOf("28", "32", "38", "24"),
            correctIndex = 0,
            explanation = "12 × 5 = 60. 8 × 4 = 32. 60 - 32 = 28."
        )
    }
}
