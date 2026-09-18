# 📚 Trilha do Saber

> **Aplicativo Educacional Completo & Gamificado de Aprendizagem Escolar**  
> *"Aprenda. Pratique. Evolua."*

O **Trilha do Saber** é um aplicativo educacional moderno e interativo, construído em **React, TypeScript, Vite, Tailwind CSS e Capacitor**, preparado para futura compilação nativa no **Android Studio**, com suporte a geração de **APK** e **Android App Bundle (AAB)** para a Google Play Store.

---

## 🚀 1. Tecnologias Utilizadas

- **Frontend Core**: React 19, TypeScript 5.8, Vite 6.
- **Estilização**: Tailwind CSS (design moderno, responsivo para celular, tablet e desktop com suporte a modo claro e escuro).
- **Gamificação & Animações**: Canvas Confetti, Motion, Web Audio API para sons de acerto/erro/conquistas.
- **Inteligência Artificial**: Google Gemini API (`@google/genai` e endpoints dedicados via backend seguro em Node/Express).
- **Visualização de Dados**: Recharts (evolução de XP semanal, gráfico de erros por matéria e taxa de acerto).
- **Monetização**: Camada modular Google AdMob (`src/services/ads/`) com conformidade estrita com a Política para Famílias do Google Play (COPPA/TFUA).
- **Persistência**: LocalStorage / Capacitor Preferences e camada preparada para Firestore/Firebase.
- **Mobile Nativo**: Capacitor & Projeto Nativo Android (`android/`) com Gradle 8.7, AGP 8.3+, Java 17 e Android SDK 34.

---

## 📁 2. Estrutura do Projeto

```text
/
├── android/                             # Projeto nativo Android completo
│   ├── app/
│   │   ├── build.gradle                 # Configurações do app (applicationId, versionCode, etc.)
│   │   ├── proguard-rules.pro           # Regras de ofuscação R8/ProGuard
│   │   └── src/main/
│   │       ├── AndroidManifest.xml      # Manifesto, permissões e AdMob App ID
│   │       ├── java/                    # Código nativo Kotlin/Java (Activities, WebView)
│   │       ├── assets/                  # Assets estáticos web compilados
│   │       └── res/                     # Strings, layouts, temas e ícones mipmap
│   ├── build.gradle                     # Gradle raiz
│   ├── gradle.properties                # Propriedades de JVM e memória
│   └── settings.gradle                  # Módulos do projeto
│
├── src/
│   ├── components/                      # Componentes reutilizáveis de UI
│   │   ├── modes/                       # Modos de estudo (Trilha, IA Chat, Desafios, etc.)
│   │   ├── modals/                      # Modais de perfil, configurações, etc.
│   │   ├── Header.tsx                   # Topo com nível, XP, sequência e avatar
│   │   ├── BottomNavBar.tsx             # Navegação adaptativa (mobile inferior / desktop)
│   │   ├── AdMobBanner.tsx              # Banner educativo AdMob seguro
│   │   └── WeeklyXpEvolutionChart.tsx   # Gráficos de progresso
│   ├── config/                          # Configurações de anúncios e ambiente
│   ├── data/                            # Conteúdo curricular (BNCC, matérias, aulas)
│   │   ├── curriculumData.ts            # Matérias, unidades e exercícios estruturados
│   │   └── trophiesAndBadges.ts         # Conquistas desbloqueáveis
│   ├── hooks/                           # Custom React hooks (adaptação de tela, áudio)
│   ├── services/                        # Camada de serviços modular
│   │   ├── ai/                          # Professor IA (geminiService, aiService, aiConfig)
│   │   ├── ads/                         # Camada de anúncios AdMob (adService, adConfig)
│   │   ├── storage/                     # Persistência local (storageService)
│   │   ├── database/                    # Sincronização Firebase (firebaseService)
│   │   ├── soundEffects.ts              # Sintetizador sonoro Web Audio
│   │   └── notificationService.ts       # Lembretes diários e notificações de estudo
│   ├── types/                           # Definições completas TypeScript
│   ├── App.tsx                          # Orquestrador de fluxo, rotas e estado global
│   ├── index.css                        # Estilos globais Tailwind CSS
│   └── main.tsx                         # Ponto de entrada React
│
├── capacitor.config.ts                  # Configuração do Capacitor (com.trilhadosaber.app)
├── package.json                         # Dependências e scripts
├── server.ts                            # Servidor full-stack Express (proxy seguro para Gemini)
├── vite.config.ts                       # Configuração de build Vite
├── .env.example                         # Exemplo de variáveis de ambiente
└── README.md                            # Documentação completa
```

---

## 💻 3. Como Executar no Navegador (Desenvolvimento)

### Pré-requisitos
- **Node.js**: Versão 18 ou 20+ instalada
- **npm** ou **yarn**

### Instalação e Execução
```bash
# 1. Instalar as dependências do projeto
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env
# (Adicione sua GEMINI_API_KEY no arquivo .env se for utilizar recursos de IA)

# 3. Iniciar o servidor de desenvolvimento
npm run dev
```

Acesse em: `http://localhost:3000`

---

## 🤖 4. Configuração do Professor IA (Gemini)

1. Crie uma chave de API gratuita no [Google AI Studio](https://aistudio.google.com).
2. Adicione ao seu arquivo `.env`:
   ```env
   GEMINI_API_KEY=sua_chave_aqui
   ```
3. O serviço `src/services/ai/aiService.ts` se comunica através do endpoint protegido `/api/ai/tutor-chat`, garantindo que a sua chave **nunca seja exposta no navegador ou no APK**.
4. **Modo Offline**: Se não houver conexão com a internet ou chave configurada, o aplicativo continua funcionando normalmente e apresenta mensagens acolhedoras sem travar.

---

## 🔥 5. Configuração do Firebase (Opcional)

Para habilitar sincronização em nuvem:
1. Acesse o [Console do Firebase](https://console.firebase.google.com/) e crie um novo projeto.
2. Ative o **Authentication** (E-mail/Google) e o **Cloud Firestore**.
3. Adicione um App Web e copie as credenciais para o `.env`:
   ```env
   FIREBASE_API_KEY=AIzaSy...
   FIREBASE_AUTH_DOMAIN=seu-app.firebaseapp.com
   FIREBASE_PROJECT_ID=seu-app
   FIREBASE_STORAGE_BUCKET=seu-app.appspot.com
   FIREBASE_MESSAGING_SENDER_ID=123456789
   FIREBASE_APP_ID=1:123456789:web:abcdef
   ```

---

## 📱 6. Como Abrir no Android Studio & Compilar (APK / AAB)

O projeto já possui a pasta `android/` totalmente estruturada e pronta!

### Passo a Passo no seu Computador

#### 1. Instalar as Ferramentas Necessárias
- Baixe e instale o [Android Studio Hedgehog / Iguana / Jellyfish](https://developer.android.com/studio).
- Certifique-se de instalar o **JDK 17** e o **Android SDK Platform 34** através do *SDK Manager*.

#### 2. Compilar os Assets Web para o Android
No diretório raiz do projeto, execute:
```bash
npm run build:android
```
Isso compilará o frontend TypeScript/Vite diretamente para dentro da pasta de assets nativos do Android (`android/app/src/main/assets/`).

#### 3. Abrir no Android Studio
1. Abra o **Android Studio**.
2. Clique em **Open** e selecione a pasta `android/` localizada na raiz deste projeto.
3. Aguarde o Android Studio realizar a sincronização do Gradle (*Gradle Sync*).

#### 4. Testar no Celular via USB ou Emulador
1. No celular Android, ative o **Modo Desenvolvedor** (toque 7 vezes no *Número da Versão* em Configurações).
2. Ative a **Depuração USB**.
3. Conecte o cabo USB ao computador.
4. No Android Studio, selecione o dispositivo no menu superior e clique no botão verde **Run ▶** (ou `Shift + F10`).

---

## 📦 7. Como Gerar o APK de Teste (Debug)

Pelo terminal dentro da pasta `android/`:
```bash
cd android
./gradlew assembleDebug
```
O arquivo APK gerado estará em:
`android/app/build/outputs/apk/debug/app-debug.apk`

---

## 🚀 8. Como Gerar o AAB de Produção (Google Play Store)

Para publicar na Google Play Store, o Google exige o formato **AAB (Android App Bundle)** assinado.

### Passo a Passo no Android Studio:
1. No menu superior, acesse: **Build** ➔ **Generate Signed Bundle / APK...**
2. Escolha **Android App Bundle** e clique em **Next**.
3. Em **Key store path**:
   - Se já tiver uma keystore, selecione-a.
   - Caso não tenha, clique em **Create new...**, escolha uma pasta segura no seu computador (NUNCA versione a keystore no Git), defina uma senha forte e preencha os dados do certificado.
4. Selecione a variante de build: **release**.
5. Marque a opção de assinatura **V1 / V2** e clique em **Create**.
6. O arquivo final `.aab` será gerado em:
   `android/app/build/outputs/bundle/release/app-release.aab`

---

## 📝 9. Como Personalizar o Aplicativo

### Alterar o Nome do Aplicativo
- No Android: Edite `android/app/src/main/res/values/strings.xml` na chave `app_name`:
  ```xml
  <string name="app_name">Trilha do Saber</string>
  ```
- No Web: Edite `index.html` na tag `<title>`.

### Alterar o Package ID (Application ID)
- Edite `android/app/build.gradle`:
  ```groovy
  defaultConfig {
      applicationId "com.suaempresa.trilhadosaber"
      ...
  }
  ```
- Atualize também o `appId` em `capacitor.config.ts`.

### Alterar a Versão do App
- Edite `android/app/build.gradle`:
  ```groovy
  versionCode 2        // Incrementar a cada novo envio para a Play Store
  versionName "1.0.1"  // Versão visível aos usuários
  ```

### Adicionar Novas Matérias, Aulas e Exercícios
- Edite o arquivo `src/data/curriculumData.ts`. A estrutura modular aceita novos nós com facilidade:
  ```ts
  {
    id: 'minha_materia',
    name: 'Astronomia',
    icon: '🔭',
    color: 'from-purple-500 to-indigo-600',
    units: [
      {
        id: 'u1',
        title: 'Sistema Solar',
        lessons: [
          {
            id: 'l1',
            title: 'Planetas Rochosos',
            xp: 25,
            exercises: [...]
          }
        ]
      }
    ]
  }
  ```

---

## 📋 CONFIGURAÇÃO NECESSÁRIA ANTES DO AAB

Antes de gerar o bundle final (`.aab`) para publicação na loja, certifique-se de preencher:

1. **GEMINI_API_KEY**: Adicionar chave definitiva de produção no ambiente do servidor / Cloud.
2. **Firebase**: Inserir credenciais reais caso decida habilitar login social em nuvem.
3. **AdMob**:
   - Criar o app no console do Google AdMob.
   - Substituir o ID de teste pelo App ID real em `android/app/src/main/AndroidManifest.xml`:
     `android:name="com.google.android.gms.ads.APPLICATION_ID"`
   - Adicionar os blocos de Banner / Intersticial reais em `src/config/adMobConfig.ts`.
4. **Application ID**: Confirmar se `com.trilhadosaber.app` ou seu domínio próprio será o ID definitivo na Play Console.
5. **Ícone**: Gerar ícones adaptativos no Android Studio clicando com botão direito em `app/src/main/res` ➔ *New* ➔ *Image Asset*.
6. **Nome do Aplicativo**: Confirmar `Trilha do Saber` em `strings.xml`.
7. **Version Code**: Definir `1` (primeiro envio).
8. **Version Name**: Definir `1.0.0`.
9. **Keystore**: Gerar sua chave privada `.jks` ou `.keystore` e guardar em local seguro com backup.
10. **Assinatura**: Utilizar o Google Play App Signing no console da Play Store.
11. **Testes**: Executar testes em modo debug em celular físico verificando usabilidade, sons e navegação.
12. **Build AAB**: Gerar o arquivo através de *Build ➔ Generate Signed Bundle*.

---

## ⚡ COMANDOS PARA ANDROID

```bash
# 1. Compilar os arquivos da aplicação web para a pasta Android:
npm run build:android

# 2. Sincronizar plugins do Capacitor (se utilizar CLI do Capacitor):
npx cap sync android

# 3. Compilar APK Debug via linha de comando:
cd android && ./gradlew assembleDebug

# 4. Compilar APK Release assinado via linha de comando:
cd android && ./gradlew assembleRelease

# 5. Compilar AAB (App Bundle) para a Google Play Store:
cd android && ./gradlew bundleRelease
```

---

**Trilha do Saber** — Transformando o aprendizado em uma jornada memorável, motivadora e transformadora! 🎓✨
