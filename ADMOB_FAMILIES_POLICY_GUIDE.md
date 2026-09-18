# 🛡️ Guia Oficial de Conformidade Google AdMob & Google Play Families

Este guia estabelece os padrões de engenharia, arquitetura e conformidade implementados no aplicativo **Trilha do Saber (EstudaHUD)**, garantindo conformidade irrestrita com as **Políticas para Famílias do Google Play (Google Play Families Policy)**, o **Children's Online Privacy Protection Act (COPPA)** e os **Regulamentos do Google AdMob**.

---

## 1. Identificação Oficial do Aplicativo no AdMob

* **AdMob App ID Oficial (Android):** `ca-app-pub-8922902046490534~6406875608`
* **Publisher ID:** `pub-8922902046490534`
* **Bloco Banner Principal:** `ca-app-pub-8922902046490534/7288943940`
* **Bloco Premiado (Rewarded):** `ca-app-pub-8922902046490534/2345533630`
* **Bloco App Open (Abertura):** `ca-app-pub-8922902046490534/5270245723`

### Declaração no AndroidManifest.xml:
O App ID está declarado diretamente no manifesto Android (`android/app/src/main/AndroidManifest.xml`) conforme exigido pelo Google Mobile Ads SDK:

```xml
<meta-data
    android:name="com.google.android.gms.ads.APPLICATION_ID"
    android:value="ca-app-pub-8922902046490534~6406875608" />
```

---

## 2. Os 5 Pontos de Exibição Homologados

Conforme a diretriz de projeto, anúncios comerciais são restritos **exclusivamente a 5 pontos estratégicos**:

| # | Ponto de Exibição | Identificador de Modo | Formatos Habilitados | Diretriz de Famílias Aplicada |
|---|---|---|---|---|
| **1** | **Início (Home & Abas)** | `'tabs'`, `'inicio'` | Banner de Rodapé, App Open Ad (Abertura), Rewarded Ad (Bônus Diário) | Cooldown mínimo de 60s entre App Open Ads. Banner fixo acima da barra de navegação sem sobrepor conteúdos clicáveis. |
| **2** | **Explicador de Lições com IA** | `'explainer'` | Banner de Rodapé, Rewarded Ad (Desbloqueio de Explicação) | Anúncio premiado 100% opt-in com diálogo explicativo claro e opção "Agora não". Banner isolado da área de digitação. |
| **3** | **Criador de Provas por Foto** | `'photo_exam'` | Banner de Rodapé (somente na configuração inicial), Rewarded Ad (Geração) | **PROIBIÇÃO ABSOLUTA:** Nenhum anúncio é exibido durante a realização das questões da prova (`subStep: 'taking_exam'`). |
| **4** | **Pesquisador Escolar com IA** | `'researcher'` | Banner de Rodapé, Rewarded Ad (Trabalho Completo BNCC) | Banner não oculta ações pedagógicas (áudio, cópia, download de PDF). Classificação de conteúdo estritamente "G". |
| **5** | **Tradutor Escolar com IA** | `'translator'` | Banner de Rodapé, Rewarded Ad (Tradução e Fonética) | Banner protegido contra sobreposição pelo teclado virtual em dispositivos móveis. |

---

## 3. Regras Absolutas da Política de Famílias do Google Play

### A. Proteção de Dados e Tratamento Infantil (COPPA / TFCD)
Para qualquer usuário classificado como **criança** ou cuja faixa etária **não foi informada**:
1. **`tagForChildDirectedTreatment = TRUE`**: Sinaliza ao Google AdMob que a requisição é direcionada ao público infantil (COPPA).
2. **`tagForUnderAgeOfConsent = TRUE`**: Sinaliza aos servidores do Google Ads que o usuário está abaixo da idade de consentimento digital (GDPR-K / LGPD).
3. **`maxAdContentRating = "G"`**: Garante que apenas anúncios com classificação indicativa livre ("General Audiences") sejam elegíveis.
4. **`nonPersonalizedAds = TRUE`**: Impede categoricamente o rastreamento comportamental e o uso do Identificador de Publicidade do Google (GAID/AAID).

### B. Proibição Estrita de Anúncios em Momentos de Avaliação
O Google Play proíbe a distração da criança durante testes de aprendizado. O método `adMobService.isAdAllowedForMode()` bloqueia anúncios automaticamente em:
* Provas ativas e simulados (`simulado`, `taking_exam`);
* Jornada de estudos e resolução de caderno de erros (`journey`, `caderno`);
* Jogos matemáticos, tabuada, xadrez, duelos e competições (`math`, `times_table`, `chess`, `duel`, `multiplayer`, `competition`);
* Atividades de fixação rápida (`lightning`, `challenges`, `memory`, `wordsearch`, `puzzle`, `crossword`, `languages`).

---

## 4. Arquitetura de Implementação em `adMobService.ts`

### Centralização e Gatekeeper
O arquivo `src/services/adMobService.ts` é a **única fonte da verdade** para exibição e ciclo de vida de anúncios:

```typescript
// Validação centralizada dos 5 pontos autorizados
public isAdAllowedForMode(currentMode?: string, subStep?: string): boolean {
  if (!currentMode) return false;

  // Bloqueio absoluto durante a realização de provas ou resolução de questões
  if (subStep === 'taking_exam' || subStep === 'answering') {
    return false;
  }

  // Bloqueio em qualquer modo de avaliação, teste ou jogo
  if (EXAM_AND_QUIZ_MODES.includes(currentMode as any)) {
    return false;
  }

  // Validação dos 5 pontos autorizados
  return (
    currentMode === 'tabs' ||
    currentMode === 'inicio' ||
    currentMode === 'explainer' ||
    currentMode === 'photo_exam' ||
    currentMode === 'researcher' ||
    currentMode === 'translator'
  );
}
```

### Inicialização e Comunicação com a Camada Nativa Android
Durante o bootstrap (`adMobService.initialize()`), as configurações de privacidade são transmitidas à camada Android nativa via `AndroidAdMobBridge.kt`:

```typescript
win.AndroidAdMobBridge.configurePrivacy(
  JSON.stringify({
    appId: 'ca-app-pub-8922902046490534~6406875608',
    tagForChildDirectedTreatment: true,
    tagForUnderAgeOfConsent: true,
    maxAdContentRating: 'G',
    nonPersonalizedAds: true,
    bannerUnitId: 'ca-app-pub-8922902046490534/7288943940',
    rewardedUnitId: 'ca-app-pub-8922902046490534/2345533630',
    appOpenUnitId: 'ca-app-pub-8922902046490534/5270245723',
    isTestMode: IS_TEST_MODE,
  })
);
```

---

## 5. Prevenção de Violações Frequentes do AdMob

1. **Sem Anúncios Simulados ou Falsos:** Se o AdMob não retornar anúncio (No-Fill) ou se o app estiver rodando na web sem ponte nativa, o container é colapsado (0px). Nunca são exibidos banners falsos com textos como "Anúncio Aqui" ou "Dica Patrocinada".
2. **Prevenção de Cliques Acidentais:** O banner inferior mantém espaçamento seguro em relação a botões de ação e à barra inferior de abas.
3. **Limite de Frequência (Frequency Capping):** 
   - O App Open Ad possui um intervalo mínimo de 60 segundos entre exibições.
   - Anúncios intersticiais de encerramento possuem debounce de segurança de 5 segundos.
4. **Anúncios Recompensados Transparentes:** O usuário recebe um aviso modal prévio explicando a recompensa, o tempo aproximado e a opção de não assistir.

---

## 6. Procedimento para Publicação na Google Play Store

No arquivo `src/config/adMobConfig.ts`:
1. Quando estiver desenvolvendo ou testando: `IS_TEST_MODE = true` (utiliza os IDs de teste padrão do Google `ca-app-pub-3940256099942544/...`).
2. Para gerar o APK / App Bundle de produção final para a Play Store:
   ```typescript
   export const IS_TEST_MODE: boolean = false;
   ```
   Com essa única alteração, o aplicativo passa a solicitar anúncios reais através dos identificadores oficiais configurados.
