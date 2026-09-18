# 📱 Guia de Integração Oficial do Google AdMob - Trilha do Saber

Este documento apresenta o guia completo da integração oficial do **Google AdMob** no projeto Android nativo **Trilha do Saber**, estruturado com arquitetura robusta, conformidade rigorosa com a **Política para Famílias do Google Play (Families Policy)**, COPPA e proteção da experiência pedagógica do aluno.

---

## 🎯 1. Blocos de Anúncios Reais Configurados

Os dois identificadores reais fornecidos estão cadastrados com precisão no projeto:

| Tipo de Anúncio | Finalidade | ID Real Configurado |
| :--- | :--- | :--- |
| **App Open** | Abertura do aplicativo (com proteção de intervalo de 60s) | `ca-app-pub-8922902046490534/5270245723` |
| **Rewarded Ad** | Desbloqueio de Explicação & Desbloqueio de Prova | `ca-app-pub-8922902046490534/2345533630` |

> 🔒 **Regra de ouro do bloco premiado (Rewarded):** O mesmo bloco de anúncio é compartilhado entre as duas funções, diferenciando o fluxo de concessão em tempo de execução através do enum `RewardAction.EXPLANATION` e `RewardAction.EXAM`.

---

## 🏗️ 2. Arquitetura da Solução Android

Os arquivos de infraestrutura foram criados no pacote `com.trilhadosaber.app.ads`:

1. **`AdConfig.kt`**:
   - Centraliza os IDs reais e os IDs oficiais de teste do Google.
   - Fornece a flag `TEST_MODE` (atualmente `true` para desenvolvimento seguro, bastando alterar para `false` no lançamento).
   - Configura a **Google Play Families Policy**:
     - `TAG_FOR_CHILD_DIRECTED_TREATMENT_TRUE`
     - `TAG_FOR_UNDER_AGE_OF_CONSENT_TRUE`
     - `MAX_AD_CONTENT_RATING_G`

2. **`RewardAction.kt`**:
   - Enum que identifica se a ação pendente é `EXPLANATION` (Explicação) ou `EXAM` (Prova), evitando qualquer liberação cruzada ou consumo duplo de recompensas.

3. **`RewardedAdManager.kt`**:
   - Gerencia o pré-carregamento contínuo do Rewarded Ad.
   - Exibe o anúncio apenas com confirmação prévia do aluno.
   - Concede a recompensa **exclusivamente** via callback oficial do SDK (`onUserEarnedRewardListener`).
   - Pré-carrega o próximo anúncio automaticamente ao fechar ou concluir.
   - Trata cenários sem internet ou falhas de carregamento com mensagens amigáveis, sem travar o aplicativo.

4. **`AppOpenAdManager.kt`**:
   - Controla o ciclo de vida da aplicação (`ProcessLifecycleOwner` e `ActivityLifecycleCallbacks`).
   - Monitora se o app veio do segundo plano para o primeiro plano.
   - Implementa expiração de cache (4 horas) e trava de frequência mínima de 60 segundos entre exibições.
   - Impede anúncios de abertura durante telas de prova ou onboarding inicial.

5. **`AdManager.kt`**:
   - Fachada unificada que orquestra a inicialização e os diálogos de confirmação na UI.

6. **`TrilhaSaberApplication.kt`**:
   - Inicializa com segurança o SDK do Mobile Ads dentro de um bloco `try-catch` tolerante a falhas.
   - Registra o observador de ciclo de vida para o App Open Ad.

---

## 💬 3. Diálogos e Fluxos de Recompensa na UI

### 💡 A) Desbloqueio de Explicação (`CustomStudyActivity.kt`)
- **Título:** `Desbloquear explicação`
- **Texto:** `Assista a um anúncio para liberar esta explicação.`
- **Botão:** `Assistir anúncio`
- **Resultado:** Após validação oficial do SDK, a aba de explicação é destravada, exibe o conteúdo e emite um feedback toast: `"Explicação desbloqueada."`.

### 📝 B) Desbloqueio de Prova (`CustomStudyActivity.kt`)
- **Título:** `Desbloquear prova`
- **Texto:** `Assista a um anúncio para liberar a criação desta prova.`
- **Botão:** `Assistir anúncio`
- **Resultado:** Após validação oficial do SDK, a atividade do exame (`QuizActivity`) é iniciada e emite o feedback toast: `"Prova desbloqueada."`.

---

## ⚙️ 4. Como Alternar entre Teste e Produção

Antes de gerar o APK ou AAB final no Android Studio:

### 1. No arquivo `AdConfig.kt`
Caminho: `android/app/src/main/java/com/trilhadosaber/app/ads/AdConfig.kt`
```kotlin
// Altere TEST_MODE para false:
const val TEST_MODE: Boolean = false
```

### 2. No `AndroidManifest.xml`
Caminho: `android/app/src/main/AndroidManifest.xml`
Substitua o App ID pelo seu ID de aplicativo real cadastrado no console do AdMob:
```xml
<meta-data
    android:name="com.google.android.gms.ads.APPLICATION_ID"
    android:value="ca-app-pub-8922902046490534~XXXXXXXXXX" />
```

---

## 🛠️ 5. Passos para Gerar o APK / AAB no Android Studio

1. Abra o **Android Studio**.
2. Selecione **Open an Existing Project** e aponte para a pasta `android` (ou `TrilhaDoSaber`).
3. Aguarde o **Gradle Sync** concluir. O projeto já inclui as dependências:
   - `com.google.android.gms:play-services-ads:23.6.0`
   - `androidx.lifecycle:lifecycle-process:2.8.7`
4. Conecte um dispositivo físico ou emulador com Google Play Services.
5. Para gerar o instalador:
   - Menu **Build** > **Generate Signed Bundle / APK**.
   - Escolha **Android App Bundle (AAB)** para publicação na Google Play ou **APK** para instalação direta.
   - Utilize sua Chave de Assinatura (Keystore).
6. Teste com `TEST_MODE = true` para verificar as impressões de teste do Google sem risco de suspensão, e altere para `TEST_MODE = false` apenas para a compilação final que será enviada à Google Play Store.
