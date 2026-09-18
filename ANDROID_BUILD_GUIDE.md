# Guia de Compilação do Aplicativo Nativo Android - Trilha do Saber
**Projeto 100% Nativo Kotlin + Android SDK + Gradle (Offline-First)**

O aplicativo **Trilha do Saber** foi reconstruído do zero como um projeto Android nativo, limpo e independente do Google AI Studio, pronto para ser compilado no seu PC Windows 11 (64-bit).

---

## 1. Identidade e Especificações Técnicas

| Propriedade | Valor |
|---|---|
| **Nome do App** | Trilha do Saber |
| **Application ID / Package** | `com.trilhadosaber.app` |
| **Versão** | 1.0.0 (versionCode 1) |
| **Linguagem** | Kotlin |
| **Arquitetura** | Android SDK Nativo + Material Components |
| **Compile SDK / Target SDK** | 35 (Android 15) |
| **Min SDK** | 23 (Android 6.0 Marshmallow+) |
| **Orientação** | Portrait (Retrato fixo) |
| **Tema** | Claro (Material Light Theme) |
| **Gradle** | 8.7 (com Gradle Wrapper incluso) |
| **Android Gradle Plugin** | 8.3.2 |
| **Modo de Funcionamento** | 100% Offline (com banco de questões embutido) |

---

## 2. Requisitos para Windows 11 (64-bit)

Para compilar o aplicativo no seu Windows 11:

1. **Java Development Kit (JDK):**
   - Recomendado: **JDK 17** (LTS) ou **JDK 21** (LTS) de 64-bit.
   - Distribuições recomendadas: [Eclipse Temurin (Adoptium)](https://adoptium.net/) ou Oracle JDK.
   - Certifique-se de que a variável de ambiente `JAVA_HOME` está configurada para a pasta do JDK e adicionada ao `Path`.
   - Para verificar no Prompt de Comando (CMD) ou PowerShell:
     ```cmd
     java -version
     ```

2. **Android SDK / Android Studio (Opcional, mas recomendado):**
   - [Android Studio Ladybug ou Hedgehog+](https://developer.android.com/studio)

---

## 3. Como Compilar no Windows 11 via Linha de Comando (Sem precisar do Android Studio)

1. Extraia o projeto ou o arquivo `TrilhaDoSaber-Native-Android.zip` no seu computador (por exemplo em `C:\Projetos\TrilhaDoSaber`).
2. Abra o **Prompt de Comando (cmd.exe)** ou o **PowerShell** no Windows 11.
3. Navegue até a pasta do projeto:
   ```cmd
   cd C:\Projetos\TrilhaDoSaber
   ```
4. Execute o Gradle Wrapper para compilar o APK de Debug:
   ```cmd
   gradlew.bat assembleDebug
   ```
5. O Gradle baixará as dependências necessárias e compilará o projeto.
6. **Localização do APK gerado:**
   ```
   app\build\outputs\apk\debug\app-debug.apk
   ```
7. Transfira o arquivo `app-debug.apk` para o seu celular Android e instale!

---

## 4. Como Abrir e Compilar no Android Studio

1. Abra o **Android Studio**.
2. Na tela de boas-vindas, clique em **Open** (ou no menu superior: `File > Open`).
3. Selecione a pasta raiz do projeto Android (`TrilhaDoSaber` ou `android`).
4. O Android Studio detectará o arquivo `settings.gradle` e iniciará a sincronização automática do Gradle.
5. Para compilar e gerar o APK:
   - Vá no menu superior: **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
6. Quando a compilação terminar, clique no link **locate** que surge na notificação inferior direita para abrir a pasta com o `app-debug.apk`.
7. Para rodar em um emulador ou aparelho conectado via USB com depuração ativa:
   - Pressione o botão verde **Run 'app'** (`Shift + F10`).

---

## 5. Estrutura dos Arquivos Criados

```
TrilhaDoSaber/
├── build.gradle                           # Configurações raiz do Gradle
├── settings.gradle                        # Declaração do módulo :app e repositórios
├── gradle.properties                      # JVM args e suporte AndroidX
├── gradlew                                # Wrapper Unix/macOS
├── gradlew.bat                            # Wrapper Windows 11
├── gradle/wrapper/
│   ├── gradle-wrapper.jar                 # Binário do Gradle Wrapper oficial
│   └── gradle-wrapper.properties          # Gradle 8.7
└── app/
    ├── build.gradle                       # Configuração do módulo app (compileSdk 35, etc.)
    ├── proguard-rules.pro                 # Regras de otimização ProGuard
    └── src/main/
        ├── AndroidManifest.xml            # Manifest com todas as Activities e permissões
        ├── java/com/trilhadosaber/app/
        │   ├── SplashActivity.kt          # Tela inicial com slogan e botão COMEÇAR
        │   ├── RegisterActivity.kt        # Cadastro do aluno (nome e série)
        │   ├── HomeActivity.kt            # Dashboard com XP, Moedas, Nível e 5 botões
        │   ├── JourneyActivity.kt         # Seleção das 6 matérias
        │   ├── QuizActivity.kt            # Quiz interativo com feedback e pontuação
        │   ├── CustomStudyActivity.kt     # "Quero estudar...", Resumo, Explicação, Exemplos, Exercícios
        │   ├── CompetitionActivity.kt     # Modo 1 a 5 jogadores com rodadas e desempate
        │   ├── ProfileActivity.kt         # Perfil, estatísticas e edição
        │   ├── RankingActivity.kt         # Ranking local por XP
        │   ├── RankingAdapter.kt          # Adapter para a lista do ranking
        │   ├── MainActivity.kt            # Redirecionador nativo
        │   ├── ai/
        │   │   └── AiStudyAssistant.kt    # Interface para integração futura de IA (segura)
        │   ├── data/
        │   │   ├── PreferencesManager.kt  # Armazenamento local SharedPreferences
        │   │   ├── QuestionsRepository.kt # Banco com 50+ questões offline
        │   │   └── StudyRepository.kt     # Base de resumos, explicações e exercícios
        │   ├── engine/
        │   │   └── GameEngine.kt          # Níveis, XP e progressão gamificada
        │   └── model/
        │       ├── CompetitionPlayer.kt
        │       ├── Question.kt
        │       ├── RankingEntry.kt
        │       ├── Student.kt
        │       ├── StudyTopic.kt
        │       └── Subject.kt
        └── res/
            ├── drawable/                  # Ícones vetoriais XML e fundos estilizados
            ├── layout/                    # Layouts XML nativos de todas as telas
            └── values/
                ├── colors.xml             # Cores da identidade visual (Primária #4F46E5, Acento #F59E0B)
                ├── strings.xml            # Textos e lista de séries escolares
                └── styles.xml             # Tema Theme.MaterialComponents.Light.NoActionBar
```

---

## 6. Recursos e Gamificação

- **XP & Níveis:**
  - Nível 1: Aprendiz (0 - 99 XP)
  - Nível 2: Explorador (100 - 249 XP)
  - Nível 3: Pesquisador (250 - 499 XP)
  - Nível 4: Estudioso (500 - 999 XP)
  - Nível 5: Mestre do Saber (1000+ XP)
- **Recompensas:**
  - Acerto no quiz: +10 XP, +2 Moedas
  - Conclusão de atividade: +20 XP bônus, +5 Moedas
  - Vitória em competição: +30 XP bônus, +10 Moedas
- **Segurança de API:** Nenhuma chave secreta ou API key foi incluída diretamente no código do app.
