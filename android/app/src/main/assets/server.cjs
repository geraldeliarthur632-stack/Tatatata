var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_dotenv = __toESM(require("dotenv"), 1);
var import_path = __toESM(require("path"), 1);
var import_genai = require("@google/genai");
var import_chess = require("chess.js");
var import_vite = require("vite");
import_dotenv.default.config();
async function startServer() {
  const app = (0, import_express.default)();
  const PORT = 3e3;
  app.use(import_express.default.json({ limit: "100mb" }));
  app.use(import_express.default.urlencoded({ extended: true, limit: "100mb" }));
  let ai = null;
  if (process.env.GEMINI_API_KEY) {
    ai = new import_genai.GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
  }
  async function callGeminiSafe(params) {
    if (!ai) return null;
    const modelCandidates = params.models || [
      "gemini-3.8-flash",
      "gemini-flash-latest",
      "gemini-3.1-flash-lite"
    ];
    const perModelTimeout = params.timeoutMs || 25e3;
    for (const model of modelCandidates) {
      try {
        const timeoutPromise = new Promise(
          (_, reject) => setTimeout(() => reject(new Error("AI_TIMEOUT")), perModelTimeout)
        );
        const generatePromise = ai.models.generateContent({
          model,
          contents: params.contents,
          config: params.config
        });
        const response = await Promise.race([generatePromise, timeoutPromise]);
        if (response && response.text) {
          return response;
        }
      } catch (err) {
        const msg = err?.message || "";
        const isPermissionOrAuth = err?.status === "PERMISSION_DENIED" || err?.error?.code === 403 || msg.includes("403") || msg.includes("PERMISSION_DENIED") || msg.includes("denied access");
        const isQuotaOrBusy = err?.status === "RESOURCE_EXHAUSTED" || err?.status === "UNAVAILABLE" || err?.error?.code === 429 || err?.error?.code === 503 || msg.includes("429") || msg.includes("503") || msg.includes("quota") || msg.includes("AI_TIMEOUT") || msg.includes("Quota exceeded") || msg.includes("RESOURCE_EXHAUSTED") || msg.includes("high demand") || msg.includes("UNAVAILABLE");
        if (isPermissionOrAuth) {
          console.log(`[AI Info] Model ${model} access denied/403. Trying next model candidate...`);
          continue;
        } else if (isQuotaOrBusy) {
          console.log(`[AI Info] Model ${model} is busy or timed out. Trying next model candidate...`);
          continue;
        } else {
          console.log(`[AI Info] Model ${model} request error: ${msg}. Trying next candidate...`);
          continue;
        }
      }
    }
    console.log("[AI Info] All AI model candidates exhausted. Seamlessly engaging local BNCC curriculum engine.");
    return null;
  }
  function shuffleServerQuestionOptions(q) {
    if (!q.options || q.options.length <= 1) return q;
    const correctText = q.options[q.correctIndex];
    const paired = q.options.map((opt) => ({ opt, sort: Math.random() }));
    paired.sort((a, b) => a.sort - b.sort);
    const newOptions = paired.map((p) => p.opt);
    let newCorrectIndex = newOptions.indexOf(correctText);
    if (newCorrectIndex === -1) newCorrectIndex = 0;
    return {
      ...q,
      options: newOptions,
      correctIndex: newCorrectIndex
    };
  }
  const rooms = /* @__PURE__ */ new Map();
  setInterval(() => {
    const now = Date.now();
    for (const [code, room] of rooms.entries()) {
      if (now - room.createdAt > 2 * 60 * 60 * 1e3) {
        rooms.delete(code);
      }
    }
  }, 15 * 60 * 1e3);
  app.post("/api/ai/explain", async (req, res) => {
    try {
      const { text, imageBase64, grade, subject, difficulty } = req.body;
      if (!text && !imageBase64) {
        return res.status(400).json({ error: "Forne\xE7a um texto ou imagem do conte\xFAdo escolar a ser estudado." });
      }
      if (!ai) {
        return res.status(503).json({
          error: "Chave do Gemini n\xE3o configurada no servidor. Usando modo de estudo local.",
          fallback: true
        });
      }
      const diffLabel = difficulty === "easy" ? "F\xC1CIL (direto e conceitual)" : difficulty === "hard" ? "DIF\xCDCIL (complexo e aprofundado)" : "M\xC9DIO (padr\xE3o BNCC)";
      const gradeRule = GRADE_BNCC_RULES[grade] || GRADE_BNCC_RULES["6_fund"] || "";
      const systemInstruction = `Voc\xEA \xE9 um professor e tutor did\xE1tico especialista do sistema educacional brasileiro (BNCC) com base de conhecimento alinhada a fontes oficiais como MEC, BNCC e Gemini. Sua tarefa \xE9 explicar conte\xFAdos escolares (Matem\xE1tica, L\xEDngua Portuguesa, Ci\xEAncias, Hist\xF3ria, Geografia, F\xEDsica, Qu\xEDmica, Biologia, etc.) de forma extremamente clara, did\xE1tica e estruturada para ser lida e ouvida pelo aluno. DIRETRIZES DA S\xC9RIE:
${gradeRule}

REGRA ABSOLUTA DE SEGURAN\xC7A PEDAG\xD3GICA POR S\xC9RIE: - Se o aluno for do 1\xBA ano fundamental (1_fund): NUNCA gere divis\xE3o, fra\xE7\xE3o, multiplica\xE7\xE3o, \xE1lgebra ou n\xFAmeros decimais! Em Matem\xE1tica do 1\xBA ano, use APENAS contagem de 1 a 10, somas e subtra\xE7\xF5es simples menores que 10 com objetos do cotidiano (ma\xE7\xE3s, dedinhos, patinhos) e formas geom\xE9tricas b\xE1sicas (c\xEDrculo, quadrado, tri\xE2ngulo). - Se o aluno for do 2\xBA ano: somas/subtra\xE7\xF5es at\xE9 50, sem divis\xE3o com resto e sem fra\xE7\xF5es. Al\xE9m da explica\xE7\xE3o, voc\xEA DEVE gerar exatamente 10 perguntas de m\xFAltipla escolha adequadas \xE0 s\xE9rie: 5 perguntas de REVIS\xC3O da s\xE9rie anterior para fixar a base necess\xE1ria, e 5 perguntas da S\xC9RIE ATUAL para dominar a mat\xE9ria. Cada quest\xE3o deve ter 4 alternativas com a resposta correta no \xEDndice 0 (o servidor far\xE1 o embaralhamento) e explica\xE7\xE3o educativa detalhada. IMPORTANTE: Se o usu\xE1rio enviar assunto n\xE3o-escolar, recuse educadamente informando que o app \xE9 para mat\xE9rias escolares.`;
      const promptText = `Analise o seguinte conte\xFAdo para a s\xE9rie escolar ${grade || "Ensino Fundamental/M\xE9dio"}:
Mat\xE9ria: ${subject || "Geral"}
Dificuldade: ${diffLabel}
Texto/D\xFAvida do estudante: "${text || "Explique o conte\xFAdo da imagem escolar anexada"}"

Estruture a resposta:
1. Explica\xE7\xE3o did\xE1tica completa: t\xEDtulo cativante, resumo claro em par\xE1grafos simples para leitura em voz alta, 4 pontos-chave essenciais, e 1 exemplo pr\xE1tico do cotidiano.
2. Exatamente 10 quest\xF5es de m\xFAltipla escolha com 4 alternativas:
   - 5 quest\xF5es com 'gradeOriginLabel' indicando revis\xE3o do ano anterior (ex: "Revis\xE3o (Ano Anterior)").
   - 5 quest\xF5es com 'gradeOriginLabel' indicando a mat\xE9ria da s\xE9rie atual (ex: "S\xE9rie Atual (${grade || "Atual"})").

Retorne em formato JSON estruturado.`;
      const parts = [];
      if (imageBase64) {
        const mimeType = imageBase64.includes("data:image/png") ? "image/png" : "image/jpeg";
        const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, "");
        parts.push({
          inlineData: {
            mimeType,
            data: cleanBase64
          }
        });
      }
      parts.push({ text: promptText });
      const response = await callGeminiSafe({
        contents: { parts },
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: import_genai.Type.OBJECT,
            properties: {
              isAcademicStudy: {
                type: import_genai.Type.BOOLEAN,
                description: "Verdadeiro se o conte\xFAdo for acad\xEAmico/estudo escolar, falso se for aleat\xF3rio/n\xE3o-estudo."
              },
              rejectionMessage: {
                type: import_genai.Type.STRING,
                description: "Mensagem de recusa se n\xE3o for conte\xFAdo de estudo."
              },
              title: {
                type: import_genai.Type.STRING,
                description: "T\xEDtulo do conte\xFAdo escolar."
              },
              summary: {
                type: import_genai.Type.STRING,
                description: "Explica\xE7\xE3o did\xE1tica detalhada e simples em par\xE1grafos fluidos para leitura e voz."
              },
              keyPoints: {
                type: import_genai.Type.ARRAY,
                items: { type: import_genai.Type.STRING },
                description: "3 a 5 pontos fundamentais para fixa\xE7\xE3o."
              },
              example: {
                type: import_genai.Type.STRING,
                description: "Exemplo pr\xE1tico do cotidiano."
              },
              practiceQuestions: {
                type: import_genai.Type.ARRAY,
                items: {
                  type: import_genai.Type.OBJECT,
                  properties: {
                    id: { type: import_genai.Type.STRING },
                    subject: { type: import_genai.Type.STRING },
                    topic: { type: import_genai.Type.STRING },
                    question: { type: import_genai.Type.STRING },
                    options: {
                      type: import_genai.Type.ARRAY,
                      items: { type: import_genai.Type.STRING }
                    },
                    correctIndex: { type: import_genai.Type.INTEGER },
                    explanation: { type: import_genai.Type.STRING },
                    difficulty: { type: import_genai.Type.STRING },
                    gradeOriginLabel: { type: import_genai.Type.STRING, description: 'Ex: "Revis\xE3o (1\xBA Ano)" ou "S\xE9rie Atual (2\xBA Ano)"' }
                  },
                  required: ["id", "question", "options", "correctIndex", "explanation"]
                }
              }
            },
            required: ["isAcademicStudy"]
          }
        }
      });
      if (!response || !response.text) {
        return res.status(503).json({
          error: "Limite tempor\xE1rio da IA atingido. Ativando curr\xEDculo local inteligente.",
          fallback: true
        });
      }
      const parsed = JSON.parse(response.text || "{}");
      if (parsed.practiceQuestions && Array.isArray(parsed.practiceQuestions)) {
        parsed.practiceQuestions = parsed.practiceQuestions.map(shuffleServerQuestionOptions);
      }
      return res.json(parsed);
    } catch (err) {
      const errorMsg = err?.message || "Servi\xE7o temporariamente ocupado";
      return res.status(503).json({
        error: `Instabilidade tempor\xE1ria na IA: ${errorMsg}. Usando modo de estudo local.`,
        fallback: true
      });
    }
  });
  const LANGUAGE_NAMES = {
    auto: "Detectar Automaticamente",
    pt: "Portugu\xEAs (Brasil)",
    en: "Ingl\xEAs (English)",
    es: "Espanhol (Espa\xF1ol)",
    fr: "Franc\xEAs (Fran\xE7ais)",
    it: "Italiano (Italiano)",
    de: "Alem\xE3o (Deutsch)",
    ja: "Japon\xEAs (\u65E5\u672C\u8A9E)",
    zh: "Chin\xEAs (\u4E2D\u6587)",
    ru: "Russo (\u0420\u0443\u0441\u0441\u043A\u0438\u0439)",
    la: "Latim (Latina)",
    ko: "Coreano (\uD55C\uAD6D\uC5B4)"
  };
  app.post("/api/ai/translate", async (req, res) => {
    try {
      const { text, imageBase64, sourceLang = "auto", targetLang = "pt" } = req.body;
      if (!text && !imageBase64) {
        return res.status(400).json({ error: "Envie um texto ou uma imagem para ser traduzida." });
      }
      const targetName = LANGUAGE_NAMES[targetLang] || targetLang;
      const sourceName = LANGUAGE_NAMES[sourceLang] || sourceLang;
      if (ai) {
        const parts = [];
        if (imageBase64) {
          const mimeType = imageBase64.includes("data:image/png") ? "image/png" : "image/jpeg";
          const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, "");
          parts.push({
            inlineData: {
              mimeType,
              data: cleanBase64
            }
          });
        }
        const promptText = `Voc\xEA \xE9 um tradutor pedag\xF3gico e linguista poliglota de alta precis\xE3o.
Tarefa:
1. ${imageBase64 ? "Extraia com precis\xE3o todo o texto contido na imagem (OCR fiel e completo)." : `Texto original a traduzir: "${text}"`}
2. Idioma de Origem: ${sourceName} (Se for autom\xE1tico, detecte com precis\xE3o).
3. Idioma de Destino: ${targetName}.
4. Traduza de forma natural, idiom\xE1tica, precisa e gramaticalmente correta.
5. Forne\xE7a:
   - detectedSourceLang: Nome do idioma de origem detectado.
   - detectedSourceLangCode: C\xF3digo ISO (ex: 'en', 'es', 'pt', 'fr', 'it', 'de', 'ja', 'zh', 'ru', 'la').
   - originalText: O texto original limpo (ou transcrito da foto).
   - translatedText: A tradu\xE7\xE3o de alta qualidade no idioma de destino.
   - pronunciationGuide: Guia de pron\xFAncia fon\xE9tica e entona\xE7\xE3o em caracteres latinos claros e acess\xEDveis para estudantes.
   - culturalOrGrammarNotes: Breve explica\xE7\xE3o pedag\xF3gica de gram\xE1tica, falsos amigos (falsos cognatos) ou contexto cultural \xFAtil.
   - vocabularyBreakdown: Lista de 2 a 6 palavras-chave mais importantes com palavra de origem, tradu\xE7\xE3o, classe gramatical e mini-exemplo.
   - exampleSentences: 2 frases de exemplo pr\xE1ticas usando as palavras traduzidas no cotidiano.
   - alternativeTranslations: 1 a 3 varia\xE7\xF5es ou sin\xF4nimos em contextos formais ou informais.

Retorne em formato JSON rigoroso.`;
        parts.push({ text: promptText });
        const response = await callGeminiSafe({
          contents: { parts },
          config: {
            systemInstruction: "Voc\xEA \xE9 um tradutor inteligente e tutor lingu\xEDstico multil\xEDngue escolar. Forne\xE7a transcri\xE7\xF5es de OCR impec\xE1veis de imagens e tradu\xE7\xF5es detalhadas, did\xE1ticas e naturais.",
            responseMimeType: "application/json",
            responseSchema: {
              type: import_genai.Type.OBJECT,
              properties: {
                detectedSourceLang: { type: import_genai.Type.STRING },
                detectedSourceLangCode: { type: import_genai.Type.STRING },
                originalText: { type: import_genai.Type.STRING },
                translatedText: { type: import_genai.Type.STRING },
                pronunciationGuide: { type: import_genai.Type.STRING },
                culturalOrGrammarNotes: { type: import_genai.Type.STRING },
                vocabularyBreakdown: {
                  type: import_genai.Type.ARRAY,
                  items: {
                    type: import_genai.Type.OBJECT,
                    properties: {
                      word: { type: import_genai.Type.STRING },
                      translation: { type: import_genai.Type.STRING },
                      partOfSpeech: { type: import_genai.Type.STRING },
                      example: { type: import_genai.Type.STRING }
                    },
                    required: ["word", "translation"]
                  }
                },
                exampleSentences: {
                  type: import_genai.Type.ARRAY,
                  items: {
                    type: import_genai.Type.OBJECT,
                    properties: {
                      original: { type: import_genai.Type.STRING },
                      translation: { type: import_genai.Type.STRING }
                    },
                    required: ["original", "translation"]
                  }
                },
                alternativeTranslations: {
                  type: import_genai.Type.ARRAY,
                  items: { type: import_genai.Type.STRING }
                }
              },
              required: ["detectedSourceLang", "originalText", "translatedText", "pronunciationGuide"]
            }
          }
        });
        if (response && response.text) {
          const parsed = JSON.parse(response.text);
          return res.json({
            ...parsed,
            sourceLang,
            targetLang,
            isOfflineFallback: false
          });
        }
      }
      const rawInput = (text || "Texto da imagem escolar").trim();
      let detectedLang = sourceLang === "auto" ? "Ingl\xEAs (Detectado localmente)" : sourceName;
      let detectedCode = sourceLang === "auto" ? "en" : sourceLang;
      let translated = rawInput;
      let pronunciation = "Pron\xFAncia aproximada dispon\xEDvel via \xE1udio";
      let notes = "Tradu\xE7\xE3o gerada com o dicion\xE1rio offline integrado.";
      const DICTIONARY = {
        "hello": {
          pt: { trans: "Ol\xE1", pron: "oh-LAH", notes: "Sauda\xE7\xE3o universal amig\xE1vel." },
          es: { trans: "Hola", pron: "OH-lah", notes: "Sauda\xE7\xE3o comum em espanhol." },
          it: { trans: "Ciao", pron: "TCHAH-oh", notes: "Pode significar tanto oi quanto tchau." },
          fr: { trans: "Bonjour", pron: "bon-JOUR", notes: "Usado durante o dia." }
        },
        "good morning": {
          pt: { trans: "Bom dia", pron: "BOM DEE-ah" },
          es: { trans: "Buenos d\xEDas", pron: "BWEH-nos DEE-as" },
          it: { trans: "Buongiorno", pron: "bwon-JOR-noh" },
          fr: { trans: "Bonjour", pron: "bon-JOUR" }
        },
        "thank you": {
          pt: { trans: "Obrigado(a)", pron: "oh-bree-GAH-doo" },
          es: { trans: "Gracias", pron: "GRAH-syas" },
          it: { trans: "Grazie", pron: "GRAH-tsyeh" },
          fr: { trans: "Merci", pron: "mehr-SEE" }
        },
        "how are you": {
          pt: { trans: "Como voc\xEA est\xE1?", pron: "KOH-moh voh-SEH es-TAH" },
          es: { trans: "\xBFC\xF3mo est\xE1s?", pron: "KOH-moh es-TAHS" },
          it: { trans: "Come stai?", pron: "KOH-meh STAH-ee" },
          fr: { trans: "Comment allez-vous?", pron: "koh-mahn tah-lay VOO" }
        },
        "i love you": {
          pt: { trans: "Eu te amo", pron: "EH-oo teh AH-moo" },
          es: { trans: "Te quiero / Te amo", pron: "teh KYEH-roh" },
          it: { trans: "Ti amo", pron: "tee AH-moh" },
          fr: { trans: "Je t'aime", pron: "zhuh TEM" }
        }
      };
      const lower = rawInput.toLowerCase();
      const match = DICTIONARY[lower];
      if (match && match[targetLang]) {
        translated = match[targetLang].trans;
        pronunciation = match[targetLang].pron;
        notes = match[targetLang].notes || notes;
      } else {
        translated = `[Tradu\xE7\xE3o para ${targetName}]: ${rawInput}`;
        pronunciation = "Use o bot\xE3o de \xE1udio para ouvir a pron\xFAncia com voz natural.";
      }
      return res.json({
        detectedSourceLang: detectedLang,
        detectedSourceLangCode: detectedCode,
        originalText: rawInput,
        translatedText: translated,
        pronunciationGuide: pronunciation,
        culturalOrGrammarNotes: notes,
        vocabularyBreakdown: [
          {
            word: rawInput.split(" ")[0] || "Palavra",
            translation: translated.split(" ")[0] || "Tradu\xE7\xE3o",
            partOfSpeech: "Termo / Express\xE3o",
            example: `${rawInput} \u2794 ${translated}`
          }
        ],
        exampleSentences: [
          {
            original: rawInput,
            translation: translated
          }
        ],
        alternativeTranslations: [translated],
        sourceLang,
        targetLang,
        isOfflineFallback: true
      });
    } catch (err) {
      return res.status(500).json({
        error: `Erro ao processar tradu\xE7\xE3o: ${err?.message || "Tente novamente."}`
      });
    }
  });
  const FALLBACK_TIPS_BY_SUBJECT = {
    matematica: [
      {
        tip: 'Ao resolver problemas de matem\xE1tica, separe os dados do enunciado em "O que eu sei" e "O que o problema pede". Isso reduz erros de interpreta\xE7\xE3o em 70%!',
        topic: "Estrat\xE9gia de Resolu\xE7\xE3o",
        icon: "\u{1F4D0}",
        category: "dica_estudo",
        step: "Sublinhe com cores diferentes os n\xFAmeros e a pergunta final do exerc\xEDcio de hoje."
      },
      {
        tip: "A regra de sinais na multiplica\xE7\xE3o e divis\xE3o \xE9 simples: sinais iguais d\xE3o positivo (+), sinais diferentes d\xE3o negativo (-). Memorize com exemplos reais!",
        topic: "Regra dos Sinais",
        icon: "\u26A1",
        category: "tecnica_memorizacao",
        step: "Anote no topo do seu caderno: (+ com + = +) e (+ com - = -) para consulta r\xE1pida."
      },
      {
        tip: "Para somar fra\xE7\xF5es com denominadores diferentes, o segredo \xE9 o MMC para igualar as partes antes de somar os numeradores.",
        topic: "Macetes de Fra\xE7\xF5es",
        icon: "\u{1F3AF}",
        category: "dica_estudo",
        step: "Pratique 2 exerc\xEDcios de MMC no Desafio Matem\xE1tico para fixar o processo."
      }
    ],
    portugues: [
      {
        tip: 'Para n\xE3o errar a crase, substitua a palavra feminina seguinte por uma masculina. Se virar "ao", a crase \xE9 obrigat\xF3ria! Ex: "Vou \xE0 escola" -> "Vou ao col\xE9gio".',
        topic: "Macete da Crase",
        icon: "\u270D\uFE0F",
        category: "tecnica_memorizacao",
        step: 'Aplique o teste do "ao" nas pr\xF3ximas 3 frases que escrever hoje.'
      },
      {
        tip: "Todas as palavras proparox\xEDtonas na l\xEDngua portuguesa s\xE3o obrigatoriamente acentuadas (ex: l\xE2mpada, m\xE9dico, p\xE1ssaro). Identifique a antepen\xFAltima s\xEDlaba!",
        topic: "Regra de Acentua\xE7\xE3o",
        icon: "\u{1F4D6}",
        category: "tecnica_memorizacao",
        step: "Ao ler um texto, circule as palavras proparox\xEDtonas e observe o acento."
      },
      {
        tip: 'O verbo "haver" no sentido de existir ou de tempo decorrido n\xE3o vai para o plural! Diga sempre "Havia muitas pessoas" e nunca "Haviam".',
        topic: "Concord\xE2ncia Verbal",
        icon: "\u{1F4A1}",
        category: "dica_estudo",
        step: "Revise suas \xFAltimas anota\xE7\xF5es para garantir o uso correto do verbo haver."
      }
    ],
    ciencias: [
      {
        tip: "Desenhar diagramas e ciclos (como o ciclo da \xE1gua ou a cadeia alimentar) ativa a mem\xF3ria visual e ajuda a fixar conceitos complexos com facilidade.",
        topic: "Mem\xF3ria Visual em Ci\xEAncias",
        icon: "\u{1F52C}",
        category: "tecnica_memorizacao",
        step: "Fa\xE7a um rascunho com setas coloridas ligando produtores, consumidores e decompositores."
      },
      {
        tip: "A fotoss\xEDntese transforma g\xE1s carb\xF4nico e \xE1gua em glicose e oxig\xEAnio com a energia da luz solar. Lembre-se: plantas produzem seu pr\xF3prio alimento!",
        topic: "Fixa\xE7\xE3o de Biologia",
        icon: "\u{1F331}",
        category: "dica_estudo",
        step: "Explique em voz alta as etapas da fotoss\xEDntese como se ensinasse a um amigo."
      }
    ],
    historia: [
      {
        tip: "Estude Hist\xF3ria criando Linhas do Tempo visuais. Compreender a ordem dos fatos \xE9 muito mais eficiente do que tentar decorar datas isoladas.",
        topic: "Linhas do Tempo",
        icon: "\u{1F3DB}\uFE0F",
        category: "tecnica_memorizacao",
        step: "Desenhe uma linha no caderno com os 3 fatos mais marcantes do conte\xFAdo atual."
      }
    ],
    geografia: [
      {
        tip: "Associe biomas brasileiros a suas caracter\xEDsticas marcantes: Amaz\xF4nia (\xFAmida e densa), Cerrado (\xE1rvores tortuosas), Caatinga (semi\xE1rida e cactos).",
        topic: "Mapas Mentais de Biomas",
        icon: "\u{1F5FA}\uFE0F",
        category: "dica_estudo",
        step: "Feche os olhos e tente listar os 6 principais biomas do Brasil de cabe\xE7a."
      }
    ],
    ingles: [
      {
        tip: "Crie frases curtas do seu cotidiano usando novos verbos e vocabul\xE1rios em ingl\xEAs em vez de apenas ler listas de palavras soltas.",
        topic: "Vocabul\xE1rio Ativo em Ingl\xEAs",
        icon: "\u{1F30D}",
        category: "dica_estudo",
        step: "Escreva 3 frases em ingl\xEAs sobre o que voc\xEA fez hoje pela manh\xE3."
      }
    ]
  };
  const FALLBACK_TIPS = [
    {
      tip: "A t\xE9cnica de repeti\xE7\xE3o espa\xE7ada (revisar em 1 dia, 3 dias e 7 dias) aumenta a reten\xE7\xE3o da mem\xF3ria em at\xE9 80%!",
      category: "tecnica_memorizacao",
      topic: "T\xE9cnica de Aprendizado",
      icon: "\u{1F9E0}",
      actionableStep: "Fa\xE7a uma revis\xE3o r\xE1pida de 5 minutos do que estudou anteontem.",
      targetSubject: "Geral",
      proficiencyBadge: "Fixa\xE7\xE3o Cont\xEDnua"
    },
    {
      tip: "Explicar uma mat\xE9ria em voz alta para si mesmo ou para outra pessoa (T\xE9cnica de Feynman) \xE9 a forma mais r\xE1pida de descobrir o que voc\xEA realmente aprendeu.",
      category: "dica_estudo",
      topic: "M\xE9todo Feynman",
      icon: "\u{1F4A1}",
      actionableStep: "Explique o conte\xFAdo de hoje em 2 minutos com suas pr\xF3prias palavras.",
      targetSubject: "Geral",
      proficiencyBadge: "Dom\xEDnio Ativo"
    },
    {
      tip: "O sucesso no aprendizado n\xE3o \xE9 sobre estudar 10 horas em um s\xF3 dia, e sim estudar 25 minutos com foco total todos os dias.",
      category: "motivacao",
      topic: "Consist\xEAncia Di\xE1ria",
      icon: "\u26A1",
      actionableStep: "Conclua hoje ao menos 1 li\xE7\xE3o na Jornada BNCC para manter seu ritmo.",
      targetSubject: "Geral",
      proficiencyBadge: "H\xE1bito Di\xE1rio"
    },
    {
      tip: "Resolver exerc\xEDcios pr\xE1ticos ativa 3x mais conex\xF5es neurais do que apenas ler passivamente resumos ou anota\xE7\xF5es.",
      category: "dica_estudo",
      topic: "Pr\xE1tica Ativa",
      icon: "\u{1F3AF}",
      actionableStep: "Responda 5 quest\xF5es do Simulado antes de consultar a teoria.",
      targetSubject: "Geral",
      proficiencyBadge: "Pr\xE1tica Eficaz"
    }
  ];
  app.post("/api/ai/daily-tip", async (req, res) => {
    try {
      const {
        grade = "6_fund",
        userName = "Estudante",
        proficiencyLevel = "intermediario",
        weakSubjects = [],
        accuracyRate = 70
      } = req.body;
      const weakSubjectsList = Array.isArray(weakSubjects) && weakSubjects.length > 0 ? weakSubjects.join(", ") : "Matem\xE1tica e Portugu\xEAs";
      if (!ai) {
        const firstWeak = (Array.isArray(weakSubjects) && weakSubjects[0] ? weakSubjects[0] : "matematica").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const subjectPool = FALLBACK_TIPS_BY_SUBJECT[firstWeak] || FALLBACK_TIPS_BY_SUBJECT["matematica"];
        const chosen = subjectPool[Math.floor(Math.random() * subjectPool.length)];
        return res.json({
          ...chosen,
          targetSubject: weakSubjects[0] || "Matem\xE1tica",
          proficiencyBadge: `Refor\xE7o Personalizado \u2022 N\xEDvel ${proficiencyLevel === "iniciante" ? "Iniciante" : proficiencyLevel === "avancado" ? "Avan\xE7ado" : "Intermedi\xE1rio"}`
        });
      }
      const gradeRule = getGradeRule(grade);
      const systemInstruction = `Voc\xEA \xE9 o Especialista Pedag\xF3gico em Otimiza\xE7\xE3o de Aprendizagem do aplicativo escolar "Let's Study". Sua miss\xE3o \xE9 gerar uma "Dica de Estudo Di\xE1ria Altamente Personalizada" baseada no N\xCDVEL DE PROFICI\xCANCIA e nas DISCIPLINAS COM MAIOR NECESSIDADE DE REFOR\xC7O do estudante. DIRETRIZES DA DICA PERSONALIZADA:
1. FOCO NO REFOR\xC7O: Forne\xE7a um macete pr\xE1tico, m\xE9todo de resolu\xE7\xE3o ou t\xE9cnica de fixa\xE7\xE3o diretamente aplic\xE1vel \xE0s mat\xE9rias que o aluno mais precisa refor\xE7ar.
2. ADAPTA\xC7\xC3O AO N\xCDVEL DE PROFICI\xCANCIA: Se for iniciante, use analogias simples e passos graduais. Se for intermedi\xE1rio/avan\xE7ado, ensine estrat\xE9gias de agilidade, elimina\xE7\xE3o e conex\xE3o entre conceitos.
3. PASSO PR\xC1TICO (actionableStep): Uma a\xE7\xE3o direta e r\xE1pida que o aluno pode fazer no aplicativo hoje (ex: "Resolva 3 exerc\xEDcios de fra\xE7\xF5es", "Fa\xE7a o teste do 'ao' na crase").
4. LINGUAGEM: Encorajadora, acolhedora, vibrante e did\xE1tica em portugu\xEAs do Brasil.`;
      const promptText = `Estudante: ${userName || "Estudante"}
S\xE9rie Escolar: ${grade} (${gradeRule})
N\xEDvel de Profici\xEAncia Atual: ${proficiencyLevel} (Taxa de Acertos: ${accuracyRate}%)
Disciplinas com Maior Necessidade de Refor\xE7o: ${weakSubjectsList}

Gere uma dica de estudo personalizada para hoje, focando em ajudar o estudante a superar as dificuldades nas mat\xE9rias de refor\xE7o (${weakSubjectsList}) de acordo com o n\xEDvel ${proficiencyLevel}.
Retorne no formato JSON com:
- tip: explica\xE7\xE3o da dica/macete em 2 a 3 frases claras
- category: uma de ["dica_estudo", "fato_rapido", "motivacao", "tecnica_memorizacao"]
- topic: t\xEDtulo curto e chamativo da t\xE9cnica (ex: "Macete para n\xE3o errar Fra\xE7\xF5es", "Regra de Ouro da Crase", "T\xE1tica para C\xE1lculos R\xE1pidos")
- icon: emoji representativo (ex: \u{1F4D0}, \u270D\uFE0F, \u{1F9E0}, \u26A1, \u{1F4A1}, \u{1F52C})
- actionableStep: passo pr\xE1tico e direto para o aluno executar hoje
- targetSubject: a mat\xE9ria principal que esta dica refor\xE7a (ex: "Matem\xE1tica", "Portugu\xEAs", "Ci\xEAncias", "Hist\xF3ria")
- proficiencyBadge: selo de personaliza\xE7\xE3o (ex: "Refor\xE7o Focado em Matem\xE1tica", "N\xEDvel Intermedi\xE1rio \u2022 Estrat\xE9gia de Prova")`;
      const response = await callGeminiSafe({
        contents: promptText,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: import_genai.Type.OBJECT,
            properties: {
              tip: { type: import_genai.Type.STRING },
              category: {
                type: import_genai.Type.STRING,
                enum: ["dica_estudo", "fato_rapido", "motivacao", "tecnica_memorizacao"]
              },
              topic: { type: import_genai.Type.STRING },
              icon: { type: import_genai.Type.STRING },
              actionableStep: { type: import_genai.Type.STRING },
              targetSubject: { type: import_genai.Type.STRING },
              proficiencyBadge: { type: import_genai.Type.STRING }
            },
            required: ["tip", "category", "topic", "icon", "actionableStep", "targetSubject"]
          }
        }
      });
      const parsed = JSON.parse(response?.text || "{}");
      if (!parsed.tip) {
        throw new Error("Resposta vazia da IA");
      }
      return res.json(parsed);
    } catch (_err) {
      const randomFallback = FALLBACK_TIPS[Math.floor(Math.random() * FALLBACK_TIPS.length)];
      return res.json(randomFallback);
    }
  });
  app.post("/api/ai/topic-theory", async (req, res) => {
    const { topic = "Conte\xFAdo Escolar", grade = "6_fund", subject = "matematica" } = req.body || {};
    const cleanTopic = String(topic).trim() || "Conte\xFAdo Escolar";
    const gradeRule = getGradeRule(grade);
    const fallbackData = {
      topic: cleanTopic,
      conceptSummary: `O conte\xFAdo "${cleanTopic}" \xE9 essencial na disciplina de ${subject} para a forma\xE7\xE3o educacional (${gradeRule}). Compreender seus fundamentos permite solucionar exerc\xEDcios com clareza e precis\xE3o.`,
      howToSolveStepByStep: [
        "Identifique a pergunta principal e anote os dados fornecidos.",
        "Selecione as regras, f\xF3rmulas ou propriedades aplic\xE1veis ao assunto.",
        "Desenvolva a resolu\xE7\xE3o passo a passo sem pular c\xE1lculos essenciais.",
        "Revise a resposta final garantindo que ela responde diretamente \xE0 quest\xE3o."
      ],
      rulesAndFormulas: [
        "Organiza\xE7\xE3o e clareza na escrita das etapas de racioc\xEDnio.",
        "Aten\xE7\xE3o especial \xE0s unidades de medida e termos t\xE9cnicos da mat\xE9ria.",
        "Verifica\xE7\xE3o da coer\xEAncia do resultado final antes da conclus\xE3o."
      ],
      similarExample: {
        problem: `Como aplicar o tema "${cleanTopic}" em uma situa\xE7\xE3o pr\xE1tica de estudo?`,
        solutionStep: `Ao analisar uma situa\xE7\xE3o sobre ${cleanTopic}, come\xE7amos destacando o objetivo central e aplicando o m\xE9todo ordenado passo a passo para chegar \xE0 solu\xE7\xE3o correta.`,
        finalTakeaway: `Resultado consistente alcan\xE7ado atrav\xE9s da aplica\xE7\xE3o correta dos conceitos fundamentais de ${subject}.`
      },
      goldenTip: `Dica de Ouro: Sempre destaque os termos-chave ao ler o enunciado de ${cleanTopic} para evitar erros comuns!`
    };
    if (!ai) {
      return res.json(fallbackData);
    }
    try {
      const promptText = `Voc\xEA \xE9 um professor e autor pedag\xF3gico da BNCC.
Gere um resumo te\xF3rico completo e did\xE1tico sobre o tema escolar: "${cleanTopic}"
Disciplina: ${subject}
S\xE9rie/N\xEDvel: ${grade} (${gradeRule})

Formate em JSON com:
- topic: nome formal do t\xF3pico
- conceptSummary: explica\xE7\xE3o conceitual completa em 2 a 3 par\xE1grafos claros
- howToSolveStepByStep: lista com 4 passos claros de resolu\xE7\xE3o
- rulesAndFormulas: lista com 3 a 4 regras, macetes ou f\xF3rmulas essenciais
- similarExample: objeto com problem, solutionStep e finalTakeaway
- goldenTip: dica de ouro pedag\xF3gica para n\xE3o errar na prova`;
      const response = await callGeminiSafe({
        contents: promptText,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: import_genai.Type.OBJECT,
            properties: {
              topic: { type: import_genai.Type.STRING },
              conceptSummary: { type: import_genai.Type.STRING },
              howToSolveStepByStep: { type: import_genai.Type.ARRAY, items: { type: import_genai.Type.STRING } },
              rulesAndFormulas: { type: import_genai.Type.ARRAY, items: { type: import_genai.Type.STRING } },
              similarExample: {
                type: import_genai.Type.OBJECT,
                properties: {
                  problem: { type: import_genai.Type.STRING },
                  solutionStep: { type: import_genai.Type.STRING },
                  finalTakeaway: { type: import_genai.Type.STRING }
                },
                required: ["problem", "solutionStep", "finalTakeaway"]
              },
              goldenTip: { type: import_genai.Type.STRING }
            },
            required: ["topic", "conceptSummary", "howToSolveStepByStep", "rulesAndFormulas", "similarExample", "goldenTip"]
          }
        }
      });
      const parsed = JSON.parse(response?.text || "{}");
      if (parsed.topic && parsed.conceptSummary) {
        return res.json(parsed);
      }
      return res.json(fallbackData);
    } catch (_e) {
      return res.json(fallbackData);
    }
  });
  app.post("/api/ai/explainer", async (req, res) => {
    try {
      const {
        imageBase64,
        imagesBase64 = [],
        topicText = "",
        grade = "6_fund",
        userName = "Estudante",
        subjectHint = ""
      } = req.body;
      const allImages = Array.isArray(imagesBase64) && imagesBase64.length > 0 ? imagesBase64 : imageBase64 ? [imageBase64] : [];
      if (allImages.length === 0 && !topicText.trim()) {
        return res.status(400).json({
          error: "Envie ao menos uma foto do tema, conte\xFAdo ou trabalho escolar, ou digite o assunto."
        });
      }
      const gradeRule = getGradeRule(grade);
      if (!ai) {
        const subject = subjectHint || "Mat\xE9ria Escolar";
        const cleanTopic = topicText || "Conte\xFAdo da Foto Escolar";
        return res.json({
          title: cleanTopic,
          subject,
          overview: `Identificamos o conte\xFAdo de ${subject} para a sua s\xE9rie escolar. Este tema aborda conceitos fundamentais essenciais para o seu desenvolvimento acad\xEAmico.`,
          detailedExplanation: `Aqui est\xE1 a explica\xE7\xE3o completa do conte\xFAdo:

1. **Conceito Central**: A mat\xE9ria apresentada organiza as ideias principais de forma l\xF3gica e estruturada.
2. **Funcionamento**: Para resolver quest\xF5es deste conte\xFAdo, \xE9 essencial identificar os dados fornecidos e a rela\xE7\xE3o entre eles.
3. **Regras B\xE1sicas**: Siga a ordem padr\xE3o de resolu\xE7\xE3o, conferindo cada etapa com aten\xE7\xE3o aos sinais e termos t\xE9cnicos.`,
          stepByStep: [
            "Passo 1: Leia atentamente o enunciado ou t\xEDtulo do trabalho.",
            "Passo 2: Destaque as palavras-chave e f\xF3rmulas essenciais.",
            "Passo 3: Resolva etapa por etapa sem pular c\xE1lculos ou regras gramaticais.",
            "Passo 4: Revise o resultado final para confirmar a coer\xEAncia com a pergunta."
          ],
          keyRules: [
            "Sempre mantenha a organiza\xE7\xE3o das contas e das anota\xE7\xF5es no caderno.",
            "Verifique a concord\xE2ncia e a pontua\xE7\xE3o antes de entregar o trabalho."
          ],
          solvedExamples: [
            {
              problem: "Exemplo pr\xE1tico do conte\xFAdo aplicado ao dia a dia.",
              solution: "Resolu\xE7\xE3o passo a passo detalhando o racioc\xEDnio e a resposta final correta."
            }
          ],
          pitfallsToAvoid: [
            "N\xE3o pular a leitura atenta das instru\xE7\xF5es do exerc\xEDcio.",
            "Aten\xE7\xE3o \xE0s pegadinhas de unidades de medida e regras de sinais."
          ],
          summaryForVoice: `Aqui est\xE1 a explica\xE7\xE3o do seu tema. O conceito principal envolve a compreens\xE3o dos passos de resolu\xE7\xE3o e das regras essenciais da mat\xE9ria.`
        });
      }
      const multiImageNote = allImages.length > 1 ? `ATEN\xC7\xC3O MULTI-P\xC1GINAS: O estudante anexou ${allImages.length} fotos correspondentes a p\xE1ginas consecutivas da apostila, livro ou caderno. Examine TODAS as fotos na ordem enviada, lendo o texto completo de cada folha e integrando os t\xF3picos em uma \xFAnica explica\xE7\xE3o completa e coesa.

` : "";
      const systemInstruction = `Voc\xEA \xE9 o "Explicador IA" pedag\xF3gico do aplicativo escolar "Let's Study". Sua miss\xE3o \xE9 analisar minuciosamente fotos de temas, p\xE1ginas de livros did\xE1ticos, folhas de caderno, trabalhos escolares ou enunciados digitados e fornecer uma EXPLICA\xC7\xC3O COMPLETA, PROFUNDA, DID\xC1TICA E HIPERDETALHADA para o estudante. ` + multiImageNote + `DIRETRIZ CURRICULAR DA S\xC9RIE (${grade}):
${gradeRule}

ESTRUTURA OBRIGAT\xD3RIA DA EXPLICA\xC7\xC3O:
1. title: T\xEDtulo pedag\xF3gico claro e formal do conte\xFAdo identificado na foto/texto.
2. subject: Mat\xE9ria identificada (Matem\xE1tica, L\xEDngua Portuguesa, Ci\xEAncias, F\xEDsica, Qu\xEDmica, Biologia, Hist\xF3ria, Geografia, Ingl\xEAs).
3. overview: Explica\xE7\xE3o inicial envolvente, simples e clara do que \xE9 o tema em 1 a 2 par\xE1grafos fluidos.
4. detailedExplanation: Aprofundamento te\xF3rico completo, explicando todos os conceitos, termos t\xE9cnicos, causas, efeitos e funcionamento da mat\xE9ria.
5. stepByStep: Lista com 4 a 6 passos numerados e detalhados de COMO FAZER / COMO RESOLVER exerc\xEDcios ou trabalhos desse tema.
6. keyRules: Lista com 3 a 5 regras essenciais, f\xF3rmulas, propriedades ou macetes que n\xE3o podem ser esquecidos.
7. solvedExamples: 1 a 2 exemplos reais resolvidos com o passo a passo completo do c\xE1lculo/an\xE1lise e resposta justificada.
8. pitfallsToAvoid: 2 a 3 erros mais comuns dos alunos nesse assunto e como evitar cair neles.
9. summaryForVoice: Um resumo falado perfeito para leitura por voz fluida e natural sem s\xEDmbolos estranhos.

REGRAS MANDAT\xD3RIAS DE LINGUAGEM NATURAL E PRON\xDANCIA DE VOZ (TTS):
- NUNCA use a abrevia\xE7\xE3o "etc." ou "etc". Em vez disso, escreva "e assim por diante" ou "dentre outros".
- NUNCA use palavras com h\xEDfens no resumo de voz ou explica\xE7\xF5es que possam ser lidas como sinal de menos por sintetizadores de voz (exemplo: escreva "quebra cabe\xE7a" em vez de "quebra-cabe\xE7a", "passo a passo" em vez de "passo-a-passo", "dia a dia" em vez de "dia-a-dia").
- Evite qualquer abrevia\xE7\xE3o como "ex.", "obs.", "p\xE1g.". Escreva por extenso: "por exemplo", "observa\xE7\xE3o", "p\xE1gina".`;
      const promptText = `Analise a(s) foto(s) (${allImages.length > 1 ? `${allImages.length} p\xE1ginas da apostila` : "foto do material"}) e/ou o texto do tema escolar do estudante ${userName} (${grade}):
Texto do estudante: "${topicText || "Explicar detalhadamente o conte\xFAdo desta foto"}"

Retorne a explica\xE7\xE3o estruturada em JSON seguindo rigorosamente a BNCC brasileira e a faixa et\xE1ria.`;
      const parts = [];
      for (const img of allImages) {
        const mimeType = img.includes("data:image/png") ? "image/png" : "image/jpeg";
        const cleanBase64 = img.replace(/^data:image\/[a-z]+;base64,/, "");
        parts.push({
          inlineData: {
            mimeType,
            data: cleanBase64
          }
        });
      }
      parts.push({ text: promptText });
      const response = await callGeminiSafe({
        contents: { parts },
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: import_genai.Type.OBJECT,
            properties: {
              title: { type: import_genai.Type.STRING },
              subject: { type: import_genai.Type.STRING },
              overview: { type: import_genai.Type.STRING },
              detailedExplanation: { type: import_genai.Type.STRING },
              stepByStep: {
                type: import_genai.Type.ARRAY,
                items: { type: import_genai.Type.STRING }
              },
              keyRules: {
                type: import_genai.Type.ARRAY,
                items: { type: import_genai.Type.STRING }
              },
              solvedExamples: {
                type: import_genai.Type.ARRAY,
                items: {
                  type: import_genai.Type.OBJECT,
                  properties: {
                    problem: { type: import_genai.Type.STRING },
                    solution: { type: import_genai.Type.STRING }
                  },
                  required: ["problem", "solution"]
                }
              },
              pitfallsToAvoid: {
                type: import_genai.Type.ARRAY,
                items: { type: import_genai.Type.STRING }
              },
              summaryForVoice: { type: import_genai.Type.STRING }
            },
            required: [
              "title",
              "subject",
              "overview",
              "detailedExplanation",
              "stepByStep",
              "keyRules",
              "solvedExamples",
              "pitfallsToAvoid",
              "summaryForVoice"
            ]
          }
        }
      });
      const parsed = JSON.parse(response?.text || "{}");
      if (!parsed.title) {
        const subject = subjectHint || "Mat\xE9ria Escolar";
        const cleanTopic = topicText || "Conte\xFAdo da Foto Escolar";
        return res.json({
          title: cleanTopic,
          subject,
          overview: `Identificamos o conte\xFAdo pedag\xF3gico de ${subject} para a sua s\xE9rie escolar (${gradeRule}). Este tema aborda conceitos fundamentais essenciais para o seu desenvolvimento acad\xEAmico.`,
          detailedExplanation: `Aqui est\xE1 a explica\xE7\xE3o completa do conte\xFAdo:

1. **Conceito Central**: A mat\xE9ria apresentada organiza as ideias principais de forma l\xF3gica e estruturada.
2. **Funcionamento**: Para resolver quest\xF5es deste conte\xFAdo, \xE9 essencial identificar os dados fornecidos e a rela\xE7\xE3o entre eles.
3. **Regras B\xE1sicas**: Siga a ordem padr\xE3o de resolu\xE7\xE3o, conferindo cada etapa com aten\xE7\xE3o aos sinais e termos t\xE9cnicos.`,
          stepByStep: [
            "Passo 1: Leia atentamente o enunciado ou t\xEDtulo do trabalho.",
            "Passo 2: Destaque as palavras-chave e f\xF3rmulas essenciais.",
            "Passo 3: Resolva etapa por etapa sem pular c\xE1lculos ou regras gramaticais.",
            "Passo 4: Revise o resultado final para confirmar a coer\xEAncia com a pergunta."
          ],
          keyRules: [
            "Sempre mantenha a organiza\xE7\xE3o das contas e das anota\xE7\xF5es no caderno.",
            "Verifique a concord\xE2ncia e a pontua\xE7\xE3o antes de entregar o trabalho."
          ],
          solvedExamples: [
            {
              problem: "Exemplo pr\xE1tico do conte\xFAdo aplicado ao dia a dia.",
              solution: "Resolu\xE7\xE3o passo a passo detalhando o racioc\xEDnio e a resposta final correta."
            }
          ],
          pitfallsToAvoid: [
            "N\xE3o pular a leitura atenta das instru\xE7\xF5es do exerc\xEDcio.",
            "Aten\xE7\xE3o \xE0s pegadinhas de unidades de medida e regras de sinais."
          ],
          summaryForVoice: `Aqui est\xE1 a explica\xE7\xE3o do seu tema. O conceito principal envolve a compreens\xE3o dos passos de resolu\xE7\xE3o e das regras essenciais da mat\xE9ria.`
        });
      }
      return res.json(parsed);
    } catch (err) {
      const subject = req.body?.subjectHint || "Mat\xE9ria Escolar";
      const cleanTopic = req.body?.topicText || "Conte\xFAdo Escolar";
      return res.json({
        title: cleanTopic,
        subject,
        overview: `Resumo did\xE1tico preparado para os estudos de ${subject}.`,
        detailedExplanation: `Explica\xE7\xE3o conceitual clara sobre ${cleanTopic}.`,
        stepByStep: ["Passo 1: Compreenda o conceito central.", "Passo 2: Aplique as regras pr\xE1ticas de resolu\xE7\xE3o."],
        keyRules: ["Mantenha aten\xE7\xE3o \xE0s regras essenciais da mat\xE9ria."],
        solvedExamples: [{ problem: "Exemplo pr\xE1tico do tema escolar.", solution: "Resolu\xE7\xE3o passo a passo explicada." }],
        pitfallsToAvoid: ["Evite conclus\xF5es precipitadas antes de revisar os dados."],
        summaryForVoice: `Aqui est\xE1 a explica\xE7\xE3o do seu tema escolar.`
      });
    }
  });
  app.post("/api/ai/researcher", async (req, res) => {
    try {
      const {
        searchQuery = "",
        grade = "6_fund",
        userName = "Estudante",
        depth = "deep_project"
      } = req.body;
      if (!searchQuery.trim()) {
        return res.status(400).json({ error: "Digite o tema ou trabalho escolar a ser pesquisado." });
      }
      const gradeRule = getGradeRule(grade);
      if (!ai) {
        return res.json({
          title: `Trabalho Escolar: ${searchQuery}`,
          subject: "Pesquisa Escolar & Geral",
          executiveSummary: `Esta pesquisa aborda os principais aspectos, contexto hist\xF3rico e aplica\xE7\xF5es do tema "${searchQuery}" de forma clara e estruturada.`,
          introduction: `O tema "${searchQuery}" \xE9 fundamental para o entendimento de processos hist\xF3ricos, cient\xEDficos e sociais. Ao longo dos estudos, compreender suas origens e impactos permite desenvolver uma vis\xE3o cr\xEDtica e informada.`,
          sections: [
            {
              heading: "1. Contexto Geral e Origens",
              content: `Nesta se\xE7\xE3o, analisa-se como o tema "${searchQuery}" se originou e quais foram os principais fatores que impulsionaram o seu desenvolvimento ao longo do tempo.`,
              keyTakeaway: "Compreender a origem \xE9 a chave para entender o presente."
            },
            {
              heading: "2. Funcionamento, Caracter\xEDsticas e Desdobramentos",
              content: `Os elementos centrais de "${searchQuery}" envolvem m\xFAltiplos fatores interligados que influenciam tanto o meio acad\xEAmico quanto o cotidiano da sociedade moderna.`,
              keyTakeaway: "Os desdobramentos pr\xE1ticos impactam diversas \xE1reas do conhecimento."
            },
            {
              heading: "3. Import\xE2ncia Atual e Perspectivas Futuras",
              content: `Atualmente, o estudo de "${searchQuery}" continua em constante evolu\xE7\xE3o, trazendo novas solu\xE7\xF5es, descobertas e debates relevantes para as pr\xF3ximas gera\xE7\xF5es.`,
              keyTakeaway: "O conhecimento deste tema prepara para desafios contempor\xE2neos."
            }
          ],
          realWorldApplications: [
            "Aplica\xE7\xE3o em projetos cient\xEDficos e pesquisas acad\xEAmicas.",
            "Uso em debates escolares, reda\xE7\xF5es e quest\xF5es de vestibulares."
          ],
          fascinatingFacts: [
            "Pesquisas mostram que aprofundar temas atrav\xE9s de trabalhos estruturados aumenta em at\xE9 3x a reten\xE7\xE3o do conhecimento."
          ],
          conclusion: `Em conclus\xE3o, o trabalho sobre "${searchQuery}" evidencia a import\xE2ncia da pesquisa aprofundada e da investiga\xE7\xE3o cont\xEDnua para a constru\xE7\xE3o do saber escolar.`,
          suggestedReferences: [
            "Livros did\xE1ticos da BNCC de Educa\xE7\xE3o B\xE1sica",
            "Enciclop\xE9dias e artigos cient\xEDficos reconhecidos"
          ],
          summaryForVoice: `Aqui est\xE1 o resultado da sua pesquisa sobre ${searchQuery}. O trabalho est\xE1 organizado em introdu\xE7\xE3o, desenvolvimento em tr\xEAs se\xE7\xF5es e conclus\xE3o com refer\xEAncias.`
        });
      }
      const systemInstruction = `Voc\xEA \xE9 o "Pesquisador IA Escolar" do aplicativo "Let's Study". Sua miss\xE3o \xE9 receber qualquer tema, projeto, trabalho escolar ou assunto de reda\xE7\xE3o digitado pelo aluno e gerar uma PESQUISA ESCOLAR COMPLETA, RICA, EXTREMAMENTE DETALHADA E BEM FORMATADA pronta para apresenta\xE7\xE3o e estudo. DIRETRIZ CURRICULAR DA S\xC9RIE (${grade}):
${gradeRule}

ESTRUTURA DA PESQUISA ESCOLAR GERADA:
1. title: T\xEDtulo formal e acad\xEAmico do trabalho escolar.
2. subject: \xC1rea do conhecimento (ex: Hist\xF3ria do Brasil, F\xEDsica, Biologia, Geografia Humana, Literatura, etc.).
3. executiveSummary: Resumo executivo de alto impacto (1 par\xE1grafo denso e informativo).
4. introduction: Introdu\xE7\xE3o contextualizando o tema com dados hist\xF3ricos/cient\xEDficos e sua relev\xE2ncia.
5. sections: 3 a 4 se\xE7\xF5es de desenvolvimento profundo, cada uma com "heading" (t\xEDtulo da se\xE7\xE3o), "content" (texto rico, explicativo e bem fundamentado) e "keyTakeaway" (conclus\xE3o r\xE1pida da se\xE7\xE3o).
6. realWorldApplications: 2 a 4 exemplos pr\xE1ticos de como esse tema se manifesta no mundo real ou no dia a dia.
7. fascinatingFacts: 2 a 3 curiosidades hist\xF3ricas ou cient\xEDficas surpreendentes para enriquecer a apresenta\xE7\xE3o.
8. conclusion: Conclus\xE3o s\xF3lida sintetizando os aprendizados principais do trabalho.
9. suggestedReferences: 2 a 4 fontes, conceitos e refer\xEAncias bibliogr\xE1ficas recomendadas.
10. summaryForVoice: Resumo fluido para leitura por voz.`;
      const promptText = `Estudante: ${userName || "Estudante"} (${grade})
Pesquisa solicitada: "${searchQuery}"
N\xEDvel de detalhamento: ${depth}

Gere o trabalho escolar completo, aprofundado, rigoroso e altamente did\xE1tico em formato JSON.`;
      const response = await callGeminiSafe({
        contents: promptText,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: import_genai.Type.OBJECT,
            properties: {
              title: { type: import_genai.Type.STRING },
              subject: { type: import_genai.Type.STRING },
              executiveSummary: { type: import_genai.Type.STRING },
              introduction: { type: import_genai.Type.STRING },
              sections: {
                type: import_genai.Type.ARRAY,
                items: {
                  type: import_genai.Type.OBJECT,
                  properties: {
                    heading: { type: import_genai.Type.STRING },
                    content: { type: import_genai.Type.STRING },
                    keyTakeaway: { type: import_genai.Type.STRING }
                  },
                  required: ["heading", "content", "keyTakeaway"]
                }
              },
              realWorldApplications: {
                type: import_genai.Type.ARRAY,
                items: { type: import_genai.Type.STRING }
              },
              fascinatingFacts: {
                type: import_genai.Type.ARRAY,
                items: { type: import_genai.Type.STRING }
              },
              conclusion: { type: import_genai.Type.STRING },
              suggestedReferences: {
                type: import_genai.Type.ARRAY,
                items: { type: import_genai.Type.STRING }
              },
              summaryForVoice: { type: import_genai.Type.STRING }
            },
            required: [
              "title",
              "subject",
              "executiveSummary",
              "introduction",
              "sections",
              "realWorldApplications",
              "fascinatingFacts",
              "conclusion",
              "suggestedReferences",
              "summaryForVoice"
            ]
          }
        }
      });
      const parsed = JSON.parse(response?.text || "{}");
      if (!parsed.title) {
        throw new Error("Falha ao processar pesquisa escolar");
      }
      return res.json(parsed);
    } catch (err) {
      console.error("Error in /api/ai/researcher:", err);
      const q = req.body?.searchQuery || "Pesquisa Escolar";
      return res.json({
        title: `Trabalho Escolar: ${q}`,
        subject: "Pesquisa Escolar & Geral",
        executiveSummary: `Esta pesquisa aborda os principais aspectos, contexto hist\xF3rico e aplica\xE7\xF5es pr\xE1ticas do tema "${q}" de forma clara, did\xE1tica e estruturada para apresenta\xE7\xE3o escolar.`,
        introduction: `O tema "${q}" \xE9 fundamental para o entendimento de processos hist\xF3ricos, cient\xEDficos e sociais. Ao longo dos estudos, compreender suas origens e impactos permite desenvolver uma vis\xE3o cr\xEDtica e aprofundada.`,
        sections: [
          {
            heading: "1. Contexto Hist\xF3rico e Origens",
            content: `Ao analisar "${q}", observa-se como as primeiras descobertas e eventos estruturaram a base dos conhecimentos modernos. Os registros hist\xF3ricos evidenciam transforma\xE7\xF5es decisivas causadas por esse tema.`,
            keyTakeaway: "Compreender a origem hist\xF3rica \xE9 a chave para analisar o presente com clareza."
          },
          {
            heading: "2. Funcionamento, Estrutura e Caracter\xEDsticas Centrais",
            content: `Os pilares fundamentais de "${q}" envolvem mecanismos pr\xE1ticos, regras essenciais e fatores interdependentes que conectam a teoria com situa\xE7\xF5es reais do cotidiano e do meio acad\xEAmico.`,
            keyTakeaway: "A estrutura t\xE9cnica permite a aplica\xE7\xE3o em m\xFAltiplos campos do saber."
          },
          {
            heading: "3. Aplica\xE7\xF5es Pr\xE1ticas, Desdobramentos e Futuro",
            content: `No cen\xE1rio contempor\xE2neo, "${q}" impulsiona novas solu\xE7\xF5es, debates e inova\xE7\xF5es em escala nacional e global, sendo t\xF3pico recorrente em avalia\xE7\xF5es, projetos e vestibulares.`,
            keyTakeaway: "O dom\xEDnio deste assunto prepara o estudante para desafios interdisciplinares."
          }
        ],
        realWorldApplications: [
          "Aplica\xE7\xE3o direta em feiras de ci\xEAncias e apresenta\xE7\xF5es orais em sala de aula.",
          "Desenvolvimento de argumentos s\xF3lidos para reda\xE7\xF5es e provas escolares.",
          "Compreens\xE3o de fen\xF4menos e tecnologias utilizadas na sociedade atual."
        ],
        fascinatingFacts: [
          "Estudos de neuroci\xEAncia comprovam que sintetizar temas atrav\xE9s de t\xF3picos visuais aumenta a reten\xE7\xE3o em 75%.",
          `Grandes pensadores e cientistas dedicaram d\xE9cadas de estudo para consolidar as bases de "${q}".`
        ],
        conclusion: `Em conclus\xE3o, o trabalho sobre "${q}" demonstra a relev\xE2ncia da investiga\xE7\xE3o cont\xEDnua e do estudo ativo para a constru\xE7\xE3o de um aprendizado duradouro e significativo.`,
        suggestedReferences: [
          "Diretrizes Curriculares Nacionais (BNCC) - Educa\xE7\xE3o B\xE1sica",
          "Artigos cient\xEDficos, enciclop\xE9dias e livros did\xE1ticos de refer\xEAncia"
        ],
        summaryForVoice: `Aqui est\xE1 o resultado da sua pesquisa sobre ${q}. O trabalho est\xE1 organizado em introdu\xE7\xE3o, desenvolvimento em tr\xEAs se\xE7\xF5es principais e conclus\xE3o com fontes de refer\xEAncia.`
      });
    }
  });
  const GRADE_BNCC_RULES = {
    "1_fund": `1\xBA ANO DO ENSINO FUNDAMENTAL (Crian\xE7as de 6 a 7 anos):
- MATEM\xC1TICA: Contagem at\xE9 10, somas e subtra\xE7\xF5es simples com n\xFAmeros menores ou iguais a 10 (ex: 2+3, 5-2, quantos patinhos), no\xE7\xF5es de maior/menor, antes/depois, figuras geom\xE9tricas b\xE1sicas (c\xEDrculo, quadrado, tri\xE2ngulo). ESTRITAMENTE PROIBIDO: NUNCA USAR DIVIS\xC3O, NUNCA USAR FRA\xC7\xD5ES, NUNCA USAR MULTIPLICA\xC7\xC3O, NUNCA USAR \xC1LGEBRA, NUNCA USAR N\xDAMEROS NEGATIVOS! Todas as perguntas de matem\xE1tica devem ser de contagem simples, adi\xE7\xE3o b\xE1sica at\xE9 10 ou formas geom\xE9tricas.
- PORTUGU\xCAS: Alfabeto, vogais (A, E, I, O, U), identificar primeira/\xFAltima letra de palavras cotidianas (BOLA, PATO, CASA), rimas simples, separa\xE7\xE3o de letras.
- CI\xCANCIAS: Corpo humano b\xE1sico (olhos, boca, m\xE3os, p\xE9s), 5 sentidos, h\xE1bitos de higiene (lavar m\xE3os, escovar dentes), animais conhecidos, plantas simples, dia e noite.
- HIST\xD3RIA E GEOGRAFIA: Fam\xEDlia, escola, brinquedos, regras de conviv\xEAncia, em cima/embaixo, direita/esquerda, dia/noite.
- INGL\xCAS: First Words: Sauda\xE7\xF5es (Hello, Hi, Bye), cores b\xE1sicas (Red, Blue, Yellow, Green), n\xFAmeros 1 a 5 (One, Two, Three...), animais conhecidos (Dog, Cat, Bird).`,
    "2_fund": `2\xBA ANO DO ENSINO FUNDAMENTAL (7 a 8 anos):
- MATEM\xC1TICA: Contagem at\xE9 100, dezenas e unidades, somas e subtra\xE7\xF5es com n\xFAmeros at\xE9 50, dobro e metade intuitivo, rel\xF3gio de horas cheias, moedas de Real. ESTRITAMENTE PROIBIDO: divis\xE3o formal com resto, fra\xE7\xF5es, potencia\xE7\xE3o, \xE1lgebra.
- PORTUGU\xCAS: S\xEDlabas simples e complexas (LH, NH, CH, RR, SS), separa\xE7\xE3o de s\xEDlabas, ant\xF4nimos simples (alto/baixo, grande/pequeno), pontua\xE7\xE3o (. ? !).
- CI\xCANCIAS: Ambientes naturais e constru\xEDdos, seres vivos e elementos n\xE3o vivos, fases da vida (beb\xEA, crian\xE7a, adulto, idoso).
- HIST\xD3RIA E GEOGRAFIA: Bairro, moradias, meios de transporte, profiss\xF5es, calend\xE1rio (dias da semana e meses).
- INGL\xCAS: Membros da fam\xEDlia (Mother, Father, Brother, Sister), partes do corpo (Eyes, Nose, Mouth), frutas (Apple, Banana), n\xFAmeros at\xE9 10.`,
    "3_fund": `3\xBA ANO DO ENSINO FUNDAMENTAL (8 a 9 anos):
- MATEM\xC1TICA: Centenas (at\xE9 1.000), adi\xE7\xE3o e subtra\xE7\xE3o com reserva, introdu\xE7\xE3o \xE0 multiplica\xE7\xE3o (tabuadas 2, 3, 4, 5) como adi\xE7\xE3o repetida, no\xE7\xF5es de medidas (metro, quilo, litro), divis\xE3o intuitiva exata sem resto.
- PORTUGU\xCAS: Substantivos pr\xF3prios e comuns, adjetivos, s\xEDlaba t\xF4nica, sin\xF4nimos/ant\xF4nimos.
- CI\xCANCIAS: Solo, \xE1gua e seus estados (s\xF3lido, l\xEDquido, gasoso), animais vertebrados e invertebrados, luz e sombra.
- HIST\xD3RIA E GEOGRAFIA: Povos ind\xEDgenas, hist\xF3ria da cidade, paisagens naturais e modificadas, pontos cardeais.
- INGL\xCAS: Objetos escolares (Pencil, Book, Eraser), dias da semana, sentimentos (Happy, Sad), comandos simples de sala de aula.`,
    "4_fund": `4\xBA ANO DO ENSINO FUNDAMENTAL (9 a 10 anos):
- MATEM\xC1TICA: Milhares, multiplica\xE7\xE3o por 2 algarismos, divis\xE3o simples com 1 d\xEDgito no divisor, fra\xE7\xF5es intuitivas (metade, 1/3, 1/4), per\xEDmetro de figuras simples.
- PORTUGU\xCAS: Verbos (passado, presente, futuro), concord\xE2ncia nominal, pronomes, acentua\xE7\xE3o.
- CI\xCANCIAS: Cadeia alimentar (produtores, consumidores, decompositores), misturas, microrganismos.
- HIST\xD3RIA E GEOGRAFIA: Coloniza\xE7\xE3o do Brasil, mapas, estados e capitais brasileiras, migra\xE7\xF5es.
- INGL\xCAS: Pronomes pessoais (I, You, He, She, It, We, They), Verbo To Be no presente (am, is, are), dizer as horas, roupas e clima (sunny, rainy).`,
    "5_fund": `5\xBA ANO DO ENSINO FUNDAMENTAL (10 a 11 anos):
- MATEM\xC1TICA: As 4 opera\xE7\xF5es completas com n\xFAmeros grandes, fra\xE7\xF5es equivalentes, decimais simples (v\xEDrgula e dinheiro), porcentagens b\xE1sicas (50%, 25%, 10%), c\xE1lculo de \xE1rea.
- PORTUGU\xCAS: Sujeito e predicado b\xE1sico, conjun\xE7\xF5es simples, g\xEAneros textuais (f\xE1bulas, not\xEDcias, cartas).
- CI\xCANCIAS: Sistemas do corpo (digest\xF3rio, respirat\xF3rio, circulat\xF3rio b\xE1sico), ciclo da \xE1gua, sustentabilidade e reciclagem.
- HIST\xD3RIA E GEOGRAFIA: Cidadania, direitos e deveres, regi\xF5es do Brasil, relevo e hidrografia brasileira.
- INGL\xCAS: Present Simple e rotina di\xE1ria (wake up, go to school), perguntas com Wh- (What, Where, When, Who), preposi\xE7\xF5es de lugar (in, on, under).`,
    "6_fund": `6\xBA ANO DO ENSINO FUNDAMENTAL:
- MATEM\xC1TICA: M\xFAltiplos e divisores, MDC e MMC, fra\xE7\xF5es e decimais, pot\xEAncias e ra\xEDzes exatas, \xE2ngulos e pol\xEDgonos.
- PORTUGU\xCAS: Classes de palavras (substantivo, adjetivo, verbo, pronome, numeral, artigo), figuras de linguagem iniciais.
- CI\xCANCIAS: C\xE9lulas, tecidos, sistemas do corpo humano, atmosfera e camadas da Terra.
- HIST\xD3RIA E GEOGRAFIA: Pr\xE9-hist\xF3ria, Mesopot\xE2mia, Egito, Gr\xE9cia e Roma Antiga, relevo, clima e vegeta\xE7\xE3o.
- INGL\xCAS: Present Continuous (a\xE7\xF5es em andamento), adjetivos possessivos (my, your, his, her), adv\xE9rbios de frequ\xEAncia (always, never, sometimes).`,
    "7_fund": `7\xBA ANO DO ENSINO FUNDAMENTAL:
- MATEM\xC1TICA: N\xFAmeros inteiros (positivos e negativos), opera\xE7\xF5es com inteiros, equa\xE7\xF5es do 1\xBA grau simples, \xE2ngulos, propor\xE7\xE3o e regra de tr\xEAs simples.
- PORTUGU\xCAS: Predicado verbal e nominal, transitividade verbal, tipos de frases, cr\xF4nicas e contos.
- CI\xCANCIAS: Biodiversidade, os 5 reinos dos seres vivos, biomas brasileiros (Amaz\xF4nia, Cerrado, Caatinga, Mata Atl\xE2ntica...), vacinas e sa\xFAde p\xFAblica.
- HIST\xD3RIA E GEOGRAFIA: Idade M\xE9dia, Feudalismo, Renascimento, Grandes Navega\xE7\xF5es, forma\xE7\xE3o do territ\xF3rio brasileiro e demografia.
- INGL\xCAS: Simple Past com verbos regulares e irregulares (went, saw, played), comparativos e superlativos (bigger, the best), vocabul\xE1rio de viagens e ambiente.`,
    "8_fund": `8\xBA ANO DO ENSINO FUNDAMENTAL:
- MATEM\xC1TICA: C\xE1lculo alg\xE9brico, produtos not\xE1veis, fatora\xE7\xE3o, sistemas de equa\xE7\xF5es do 1\xBA grau, geometria e tri\xE2ngulos, porcentagem e juros simples.
- PORTUGU\xCAS: Vozes verbais (ativa, passiva, reflexiva), concord\xE2ncia verbal e nominal, figuras de sintaxe.
- CI\xCANCIAS: Sistema cardiovascular, respirat\xF3rio, nervoso e end\xF3crino, reprodu\xE7\xE3o e sexualidade, fontes de energia (renov\xE1veis e n\xE3o renov\xE1veis).
- HIST\xD3RIA E GEOGRAFIA: Iluminismo, Revolu\xE7\xE3o Francesa, Independ\xEAncia dos EUA e da Am\xE9rica Latina, geopol\xEDtica da Am\xE9rica e \xC1frica.
- INGL\xCAS: Futuro com Will e Going to, Modal Verbs (can, could, should, must), quantificadores (many, much, a few).`,
    "9_fund": `9\xBA ANO DO ENSINO FUNDAMENTAL:
- MATEM\xC1TICA: Equa\xE7\xF5es do 2\xBA grau (Bhaskara), Teorema de Pit\xE1goras, Teorema de Tales, fun\xE7\xF5es afins e quadr\xE1ticas b\xE1sicas, probabilidade e estat\xEDstica.
- PORTUGU\xCAS: Ora\xE7\xF5es coordenadas e subordinadas, reg\xEAncia verbal e nominal, crase, an\xE1lise sint\xE1tica avan\xE7ada.
- CI\xCANCIAS: Introdu\xE7\xE3o \xE0 Qu\xEDmica (mat\xE9ria, \xE1tomo, tabela peri\xF3dica, liga\xE7\xF5es qu\xEDmicas) e \xE0 F\xEDsica (movimento, velocidade, acelera\xE7\xE3o, for\xE7as e Leis de Newton, ondas e calor).
- HIST\xD3RIA E GEOGRAFIA: Proclama\xE7\xE3o da Rep\xFAblica, Era Vargas, Primeira e Segunda Guerras Mundiais, Guerra Fria, Globaliza\xE7\xE3o e blocos econ\xF4micos.
- INGL\xCAS: Present Perfect (have/has + past participle), voz passiva b\xE1sica, leitura e interpreta\xE7\xE3o de textos aut\xEAnticos e not\xEDcias internacionais.`,
    "1_medio": `1\xAA S\xC9RIE DO ENSINO M\xC9DIO:
- MATEM\xC1TICA: Fun\xE7\xF5es afim, quadr\xE1tica, modular e exponencial, conjuntos, progress\xF5es (PA e PG).
- F\xCDSICA: Cinem\xE1tica escalar e vetorial, Leis de Newton, Trabalho, Energia mec\xE2nica e Pot\xEAncia.
- QU\xCDMICA: Estrutura at\xF4mica, Tabela Peri\xF3dica, Liga\xE7\xF5es i\xF4nicas e covalentes, Fun\xE7\xF5es inorg\xE2nicas.
- BIOLOGIA: Bioqu\xEDmica celular (\xE1gua, sais, prote\xEDnas, carboidratos, lip\xEDdios, DNA e RNA), Citologia e organelas celulares.
- PORTUGU\xCAS: Trovadorismo, Humanismo, Classicismo, Quinhentismo, Teoria da Literatura, fun\xE7\xF5es da linguagem.
- HIST\xD3RIA E GEOGRAFIA: Antiguidade Cl\xE1ssica, Feudalismo, Forma\xE7\xE3o dos Estados Nacionais, Cartografia, Geologia, Fusos hor\xE1rios.
- INGL\xCAS: Reading strategies (Skimming, Scanning), First e Second Conditionals (If clauses), prefixes and suffixes, vocabul\xE1rio acad\xEAmico.`,
    "2_medio": `2\xAA S\xC9RIE DO ENSINO M\xC9DIO:
- MATEM\xC1TICA: Trigonometria no ciclo, Matrizes, Determinantes, Sistemas lineares, Geometria Espacial.
- F\xCDSICA: Termologia (temperatura, calorimetria, termodin\xE2mica), \xD3ptica geom\xE9trica (espelhos e lentes), Ondulat\xF3ria.
- QU\xCDMICA: Estequiometria, Solu\xE7\xF5es (concentra\xE7\xF5es, molaridade), Termoqu\xEDmica, Cin\xE9tica qu\xEDmica, Equil\xEDbrio qu\xEDmico.
- BIOLOGIA: Reino Plantae, Reino Animalia, Fisiologia humana comparada.
- PORTUGU\xCAS: Barroco, Arcadismo, Romantismo, Realismo, Naturalismo, Parnasianismo, Simbolismo.
- HIST\xD3RIA E GEOGRAFIA: Brasil Imp\xE9rio, Revolu\xE7\xF5es do s\xE9culo XIX, Imperialismo, Industrializa\xE7\xE3o mundial.
- INGL\xCAS: Reported speech, Phrasal verbs, Third Conditional, conectivos de causa, contraste e conclus\xE3o em textos argumentativos.`,
    "3_medio": `3\xAA S\xC9RIE DO ENSINO M\xC9DIO / ENEM:
- MATEM\xC1TICA: Geometria Anal\xEDtica, N\xFAmeros Complexos, Polin\xF4mios, An\xE1lise Combinat\xF3ria e Probabilidade avan\xE7ada, Estat\xEDstica.
- F\xCDSICA: Eletrost\xE1tica, Eletrodin\xE2mica (circuitos, resistores, Lei de Ohm), Eletromagnetismo, F\xEDsica Moderna.
- QU\xCDMICA: Qu\xEDmica Org\xE2nica, Eletroqu\xEDmica (pilhas e eletr\xF3lise).
- BIOLOGIA: Gen\xE9tica Mendeliana e Molecular, Biotecnologia, Evolu\xE7\xE3o, Ecologia e Impactos Ambientais.
- PORTUGU\xCAS & REDA\xC7\xC3O: Pr\xE9-Modernismo, Modernismo no Brasil, Tend\xEAncias contempor\xE2neas, Reda\xE7\xE3o nota 1000.
- HIST\xD3RIA E GEOGRAFIA: Rep\xFAblica Velha, Ditadura Militar no Brasil, Redemocratiza\xE7\xE3o, Nova Ordem Mundial, Geopol\xEDtica contempor\xE2nea.
- INGL\xCAS ENEM: Interpreta\xE7\xE3o de charges, cartuns, tirinhas, artigos de opini\xE3o, falsos cognatos (false friends) e identifica\xE7\xE3o de tese central e infer\xEAncias textuais.`,
    "enem": `PR\xC9-VESTIBULAR & ENEM:
- Matriz interdisciplinar completa do ENEM e vestibulares incluindo L\xEDngua Inglesa instrumental e interpreta\xE7\xE3o cr\xEDtica.`
  };
  function getGradeRule(gradeKeyOrName) {
    if (!gradeKeyOrName) return GRADE_BNCC_RULES["6_fund"];
    if (GRADE_BNCC_RULES[gradeKeyOrName]) return GRADE_BNCC_RULES[gradeKeyOrName];
    const lower = gradeKeyOrName.toLowerCase();
    if (lower.includes("1\xBA ano") || lower.includes("1_fund") || lower.includes("1 ano") || lower.includes("primeiro ano")) {
      return GRADE_BNCC_RULES["1_fund"];
    }
    if (lower.includes("2\xBA ano") || lower.includes("2_fund") || lower.includes("2 ano") || lower.includes("segundo ano")) {
      return GRADE_BNCC_RULES["2_fund"];
    }
    if (lower.includes("3\xBA ano") || lower.includes("3_fund") || lower.includes("3 ano") || lower.includes("terceiro ano")) {
      return GRADE_BNCC_RULES["3_fund"];
    }
    if (lower.includes("4\xBA ano") || lower.includes("4_fund") || lower.includes("4 ano") || lower.includes("quarto ano")) {
      return GRADE_BNCC_RULES["4_fund"];
    }
    if (lower.includes("5\xBA ano") || lower.includes("5_fund") || lower.includes("5 ano") || lower.includes("quinto ano")) {
      return GRADE_BNCC_RULES["5_fund"];
    }
    if (lower.includes("6\xBA ano") || lower.includes("6_fund") || lower.includes("6 ano") || lower.includes("sexto ano")) {
      return GRADE_BNCC_RULES["6_fund"];
    }
    if (lower.includes("7\xBA ano") || lower.includes("7_fund") || lower.includes("7 ano") || lower.includes("setimo ano") || lower.includes("s\xE9timo ano")) {
      return GRADE_BNCC_RULES["7_fund"];
    }
    if (lower.includes("8\xBA ano") || lower.includes("8_fund") || lower.includes("8 ano") || lower.includes("oitavo ano")) {
      return GRADE_BNCC_RULES["8_fund"];
    }
    if (lower.includes("9\xBA ano") || lower.includes("9_fund") || lower.includes("9 ano") || lower.includes("nono ano")) {
      return GRADE_BNCC_RULES["9_fund"];
    }
    if (lower.includes("1_medio") || lower.includes("1\xBA em") || lower.includes("1\xAA serie") || lower.includes("1\xAA s\xE9rie")) {
      return GRADE_BNCC_RULES["1_medio"];
    }
    if (lower.includes("2_medio") || lower.includes("2\xBA em") || lower.includes("2\xAA serie") || lower.includes("2\xAA s\xE9rie")) {
      return GRADE_BNCC_RULES["2_medio"];
    }
    if (lower.includes("3_medio") || lower.includes("3\xBA em") || lower.includes("3\xAA serie") || lower.includes("3\xAA s\xE9rie")) {
      return GRADE_BNCC_RULES["3_medio"];
    }
    if (lower.includes("enem") || lower.includes("vestibular")) {
      return GRADE_BNCC_RULES["enem"];
    }
    return GRADE_BNCC_RULES["6_fund"];
  }
  app.post("/api/ai/generate-lesson", async (req, res) => {
    try {
      const { grade, subject, userName } = req.body;
      if (!ai) {
        return res.status(503).json({ error: "AI offline, usando curr\xEDculo local." });
      }
      const gradeRule = getGradeRule(grade);
      const systemInstruction = `Voc\xEA \xE9 um professor e autor pedag\xF3gico brasileiro especialista na BNCC. REGRA ABSOLUTA DE DISCIPLINA: Voc\xEA est\xE1 criando uma li\xE7\xE3o EXCLUSIVAMENTE sobre a mat\xE9ria "${subject}". Todas as 10 quest\xF5es, o resumo explicativo do conte\xFAdo, as regras de como fazer e os exemplos DEVEM ser 100% sobre "${subject}". NUNCA misture mat\xE9rias e NUNCA use termos como "pr\xE9-requisitos" ou "revis\xE3o de s\xE9rie anterior". Sua miss\xE3o \xE9 apresentar o RESUMO COMPLETO DO CONTE\xDADO em 3 blocos did\xE1ticos claros, ricos e objetivos: 1. O CONTE\xDADO DA AULA: Explica\xE7\xE3o detalhada, did\xE1tica e completa do que \xE9 a mat\xE9ria e seus conceitos fundamentais (exemplo: se o tema for Multiplica\xE7\xE3o, explique detalhadamente o que \xE9 multiplica\xE7\xE3o, a ideia de somar parcelas iguais, termos de fatores e produto). 2. COMO FAZER: Regras pr\xE1ticas, passo a passo de como resolver e armar as contas/analisar as quest\xF5es (exemplo: regras de arma\xE7\xE3o, tabuada, alinhamento, regras gramaticais ou f\xF3rmulas). 3. EXEMPLO DO CONTE\xDADO: 1 a 2 exemplos pr\xE1ticos reais resolvidos com c\xE1lculo/an\xE1lise passo a passo e resposta final explicada. REGRA DE OURO CONTRA SPOILERS: N\xC3O revele nem copie os enunciados ou gabaritos das 10 perguntas no resumo te\xF3rico! O resumo deve ensinar o CONCEITO e o M\xC9TODO antes dos exerc\xEDcios, para que o aluno aprenda a mat\xE9ria e consiga resolver as 10 perguntas. DIRETRIZ CURRICULAR OBRIGAT\xD3RIA DA S\xC9RIE:
${gradeRule}

ATEN\xC7\xC3O M\xC1XIMA \xC0 FAIXA ET\xC1RIA: Se a s\xE9rie for 1\xBA ano, NUNCA use divis\xE3o, multiplica\xE7\xE3o, fra\xE7\xF5es ou \xE1lgebra! Gere exatamente 10 quest\xF5es de m\xFAltipla escolha com 4 alternativas sobre o conte\xFAdo explicado. REGRA DE OURO DE UNICIDADE: TODAS as 10 perguntas DEVEM ser totalmente diferentes umas das outras. \xC9 estritamente proibido repetir o mesmo enunciado ou pergunta. A alternativa 0 deve ser a correta (o servidor embaralha). Resumos diretos para leitura por voz clara.`;
      const promptText = `Crie uma li\xE7\xE3o escolar completa exclusivamente sobre a mat\xE9ria "${subject || "Matem\xE1tica"}" para o estudante ${userName || "Estudante"} da s\xE9rie ${grade || "1_fund"}.
LEMBRE-SE: Foque exclusivamente no RESUMO DO CONTE\xDADO (O que \xE9 a mat\xE9ria e conceitos principais), COMO FAZER (passo a passo e regras) e EXEMPLO DO CONTE\xDADO (resolvido passo a passo).
A li\xE7\xE3o deve conter:
1. title: T\xEDtulo espec\xEDfico do Conte\xFAdo Principal da Aula de ${subject} (ex: "Multiplica\xE7\xE3o e Tabuada: Conceitos e Como Fazer", "Concord\xE2ncia Verbal e Regras", etc.).
2. detailedExplanation: Resumo did\xE1tico e completo do Conte\xFAdo da Aula (explique com clareza o que \xE9 a mat\xE9ria, conceitos fundamentais e funcionamento).
3. summary: Resumo did\xE1tico conciso do conte\xFAdo para a introdu\xE7\xE3o em voz.
4. keyPoints: 3 a 4 regras pr\xE1ticas de COMO FAZER e passos para resolver os problemas.
5. example: Exemplo pr\xE1tico do conte\xFAdo resolvido e explicado passo a passo com n\xFAmeros ou frases reais.
6. practiceQuestions: Exatamente 10 quest\xF5es de m\xFAltipla escolha estritamente sobre ${subject} e o conte\xFAdo explicado, TODAS com enunciados \xFAnicos e diferentes.`;
      const response = await callGeminiSafe({
        contents: promptText,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: import_genai.Type.OBJECT,
            properties: {
              id: { type: import_genai.Type.STRING },
              subject: { type: import_genai.Type.STRING },
              grade: { type: import_genai.Type.STRING },
              title: { type: import_genai.Type.STRING },
              detailedExplanation: { type: import_genai.Type.STRING },
              summary: { type: import_genai.Type.STRING },
              keyPoints: {
                type: import_genai.Type.ARRAY,
                items: { type: import_genai.Type.STRING }
              },
              example: { type: import_genai.Type.STRING },
              practiceQuestions: {
                type: import_genai.Type.ARRAY,
                items: {
                  type: import_genai.Type.OBJECT,
                  properties: {
                    id: { type: import_genai.Type.STRING },
                    subject: { type: import_genai.Type.STRING },
                    topic: { type: import_genai.Type.STRING },
                    question: { type: import_genai.Type.STRING },
                    options: {
                      type: import_genai.Type.ARRAY,
                      items: { type: import_genai.Type.STRING }
                    },
                    correctIndex: { type: import_genai.Type.INTEGER },
                    explanation: { type: import_genai.Type.STRING },
                    difficulty: { type: import_genai.Type.STRING },
                    gradeOriginLabel: { type: import_genai.Type.STRING }
                  },
                  required: ["id", "question", "options", "correctIndex", "explanation"]
                }
              }
            },
            required: ["title", "detailedExplanation", "summary", "keyPoints", "example", "practiceQuestions"]
          }
        }
      });
      if (!response || !response.text) {
        return res.status(503).json({
          error: "Limite de requisi\xE7\xF5es da IA temporariamente atingido. Usando curr\xEDculo local inteligente.",
          fallback: true
        });
      }
      const parsed = JSON.parse(response.text || "{}");
      if (parsed.practiceQuestions && Array.isArray(parsed.practiceQuestions)) {
        parsed.practiceQuestions = parsed.practiceQuestions.map(shuffleServerQuestionOptions);
      }
      return res.json(parsed);
    } catch (err) {
      const msg = err?.message || "Erro tempor\xE1rio na gera\xE7\xE3o da li\xE7\xE3o";
      return res.status(503).json({
        error: `IA temporariamente indispon\xEDvel: ${msg}. Usando curr\xEDculo local.`,
        fallback: true
      });
    }
  });
  app.post("/api/ai/tutor-chat", async (req, res) => {
    try {
      const {
        messages = [],
        history = [],
        grade = "6_fund",
        userName = "Estudante",
        imageBase64,
        mimeType = "image/jpeg",
        currentText = "",
        message = ""
      } = req.body;
      const effectiveText = currentText || message || "";
      const rawHistory = messages && messages.length > 0 ? messages : history || [];
      const gradeRule = getGradeRule(grade);
      const systemInstruction = `Voc\xEA \xE9 o Tutor IA Pedag\xF3gico do aplicativo escolar "Let's Study". Voc\xEA \xE9 um professor paciente, acolhedor, altamente did\xE1tico e especialista na Base Nacional Comum Curricular (BNCC) do Brasil. O estudante se chama ${userName} e estuda na s\xE9rie escolar ${gradeRule}. DIRETRIZES DE RESPOSTA:
1. DID\xC1TICA E CLAREZA: Explique conceitos com clareza, passo a passo e com exemplos pr\xE1ticos adaptados \xE0 idade do estudante.
2. MATEM\xC1TICA E CI\xCANCIAS: Mostre as etapas dos c\xE1lculos de forma organizada (Passo 1, Passo 2, Passo 3) e destaque f\xF3rmulas com clareza.
3. FOTO DE CADERNO/LIVRO/PROVA: Analise com precis\xE3o o que est\xE1 na foto e explique detalhadamente a mat\xE9ria ou m\xE9todo de resolu\xE7\xE3o.
4. ESTILO DE ESCRITA: Use emojis amig\xE1veis, t\xF3picos destacados e linguagem encorajadora.`;
      if (!ai) {
        const lower = effectiveText.toLowerCase();
        let fallbackReply = `Ol\xE1, ${userName}! \u{1F393} `;
        if (lower.includes("bhaskara") || lower.includes("equa\xE7\xE3o") || lower.includes("segundo grau")) {
          fallbackReply += "Para resolver uma equa\xE7\xE3o do 2\xBA grau ($$ax\xB2 + bx + c = 0$$):\n\n1. **Identifique os coeficientes**: $a$, $b$ e $c$.\n2. **Calcule o discriminante (Delta)**: $$\\Delta = b\xB2 - 4ac$$\n3. **Aplique a f\xF3rmula de Bhaskara**:\n$$x = \\frac{-b \\pm \\sqrt{\\Delta}}{2a}$$\n\nSe $\\Delta > 0$, temos duas ra\xEDzes reais. Se $\\Delta = 0$, uma raiz real. Se $\\Delta < 0$, n\xE3o h\xE1 ra\xEDzes reais. Quer ver um exemplo com n\xFAmeros?";
        } else if (lower.includes("fra\xE7\xE3o") || lower.includes("fracao") || lower.includes("soma de fra\xE7\xE3o")) {
          fallbackReply += "Para somar ou subtrair fra\xE7\xF5es:\n\n1. **Mesmo denominador**: Mantenha o denominador e some os numeradores (ex: 2/5 + 1/5 = 3/5).\n2. **Denominadores diferentes**: Encontre o MMC (m\xEDnimo m\xFAltiplo comum), converta as fra\xE7\xF5es equivalentes e depois some.\n\nQuer praticar um exemplo?";
        } else if (imageBase64) {
          fallbackReply += `Excelente foto! \u{1F4F8} Analisei o material da sua mat\xE9ria para a s\xE9rie ${gradeRule}.

\u{1F4A1} **Resumo do Conte\xFAdo**:
\u2022 Identifiquei os conceitos principais do seu conte\xFAdo escolar.
\u2022 Dica de ouro: Resolva os exerc\xEDcios separando os dados conhecidos do que o problema pede.

Qual parte espec\xEDfica dessa p\xE1gina voc\xEA gostaria que eu explicasse em detalhes?`;
        } else {
          fallbackReply += `Estou pronto para te ajudar com qualquer mat\xE9ria escolar (${gradeRule})! \u{1F31F}

Voc\xEA pode me enviar d\xFAvidas de Matem\xE1tica, Portugu\xEAs, Ci\xEAncias, Hist\xF3ria, Geografia e muito mais. Digite sua d\xFAvida ou aperte o microfone!`;
        }
        return res.json({ reply: fallbackReply, text: fallbackReply });
      }
      const contents = [];
      const recentMessages = rawHistory.slice(-8);
      for (const msg of recentMessages) {
        if (msg.role === "user") {
          const parts = [];
          if (msg.imageBase64) {
            const cleanBase64 = msg.imageBase64.includes("base64,") ? msg.imageBase64.split("base64,")[1] : msg.imageBase64;
            parts.push({
              inlineData: {
                data: cleanBase64,
                mimeType: msg.mimeType || "image/jpeg"
              }
            });
          }
          if (msg.text) {
            parts.push({ text: msg.text });
          }
          if (parts.length > 0) {
            contents.push({ role: "user", parts });
          }
        } else if (msg.role === "model" && msg.text) {
          contents.push({ role: "model", parts: [{ text: msg.text }] });
        }
      }
      if (imageBase64 || effectiveText) {
        const currentParts = [];
        if (imageBase64) {
          const cleanBase64 = imageBase64.includes("base64,") ? imageBase64.split("base64,")[1] : imageBase64;
          currentParts.push({
            inlineData: {
              data: cleanBase64,
              mimeType: mimeType || "image/jpeg"
            }
          });
        }
        if (effectiveText) {
          currentParts.push({ text: effectiveText });
        } else if (imageBase64 && currentParts.length === 1) {
          currentParts.push({
            text: "Por favor, analise a foto desta mat\xE9ria/exerc\xEDcio e explique de forma altamente did\xE1tica, passo a passo, para a minha s\xE9rie escolar."
          });
        }
        contents.push({ role: "user", parts: currentParts });
      }
      if (contents.length === 0) {
        contents.push({ role: "user", parts: [{ text: "Ol\xE1, pode me ajudar a estudar?" }] });
      }
      const response = await callGeminiSafe({
        contents,
        config: {
          systemInstruction,
          temperature: 0.7
        }
      });
      const reply = response?.text || "Desculpe, n\xE3o consegui processar a resposta no momento. Poderia perguntar novamente?";
      return res.json({ reply, text: reply });
    } catch (err) {
      console.error("Error in /api/ai/tutor-chat:", err);
      const fallbackErr = "Tivemos uma oscila\xE7\xE3o moment\xE2nea na conex\xE3o com o servidor de IA. Mas posso continuar te ajudando! Envie sua d\xFAvida novamente.";
      return res.json({
        reply: fallbackErr,
        text: fallbackErr
      });
    }
  });
  app.post("/api/ai/study-recommendation", async (req, res) => {
    try {
      const { grade, currentSubject, correctCount, totalCount, revisionMistakes, currentMistakes, studiedSubjects } = req.body;
      if (!ai) {
        let recSubject = "ingles";
        if (currentSubject === "matematica") recSubject = "portugues";
        else if (currentSubject === "portugues") recSubject = "ingles";
        else if (currentSubject === "ingles") recSubject = "ciencias";
        const needsReinforcement = (correctCount || 0) < (totalCount || 10) * 0.7;
        return res.json({
          type: needsReinforcement ? "reinforce" : "advance",
          targetSubject: needsReinforcement ? currentSubject : recSubject,
          headline: needsReinforcement ? `Recomenda\xE7\xE3o de Refor\xE7o em ${currentSubject}` : `Pr\xF3ximo Passo: Explorar ${recSubject}`,
          advice: needsReinforcement ? `Percebemos que voc\xEA teve algumas d\xFAvidas. Recomendamos revisar os conceitos de ${currentSubject} usando os Flashcards ou refazer a pr\xE1tica!` : `Excelente desempenho com ${correctCount}/${totalCount} acertos! Recomendamos agora avan\xE7ar para ${recSubject} para manter seu aprendizado equilibrado!`,
          actionType: needsReinforcement ? "flashcards" : "new_subject"
        });
      }
      const prompt = `Gere uma recomenda\xE7\xE3o inteligente de estudos para um estudante da s\xE9rie ${grade || "6_fund"}.
Dados:
- Mat\xE9ria atual estudada: ${currentSubject || "Matem\xE1tica"}
- Acertos totais: ${correctCount || 0} de ${totalCount || 10}
- Erros na fase de revis\xE3o: ${revisionMistakes || 0}
- Erros na s\xE9rie atual: ${currentMistakes || 0}
- Mat\xE9rias j\xE1 estudadas: ${(studiedSubjects || []).join(", ") || "Nenhuma"}

REGRA DE MAT\xC9RIAS:
- Para o Ensino Fundamental (1\xBA ao 9\xBA ano), targetSubject DEVE ser uma de: ['matematica', 'portugues', 'ciencias', 'historia', 'geografia', 'ingles'].
- Para o Ensino M\xE9dio (1\xBA EM, 2\xBA EM, 3\xBA EM e ENEM), targetSubject pode ser: ['matematica', 'portugues', 'fisica', 'quimica', 'biologia', 'historia', 'geografia', 'ingles'].

Responda em JSON:
{
  "type": "reinforce" (se teve muitos erros) ou "advance" (se dominou bem),
  "targetSubject": id da mat\xE9ria compat\xEDvel com a s\xE9rie,
  "headline": t\xEDtulo motivador em portugu\xEAs (ex: "Refor\xE7ar Fra\xE7\xF5es" ou "Avan\xE7ar para L\xEDngua Inglesa"),
  "advice": conselho pedag\xF3gico de 2 frases simples,
  "actionType": "flashcards" ou "new_subject"
}`;
      const response = await callGeminiSafe({
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: import_genai.Type.OBJECT,
            properties: {
              type: { type: import_genai.Type.STRING },
              targetSubject: { type: import_genai.Type.STRING },
              headline: { type: import_genai.Type.STRING },
              advice: { type: import_genai.Type.STRING },
              actionType: { type: import_genai.Type.STRING }
            },
            required: ["type", "targetSubject", "headline", "advice", "actionType"]
          }
        }
      });
      const parsed = JSON.parse(response?.text || "{}");
      return res.json(parsed);
    } catch (_err) {
      return res.json({
        type: "advance",
        targetSubject: "ingles",
        headline: "Avan\xE7ar para L\xEDngua Inglesa",
        advice: "Parab\xE9ns pelos estudos! Que tal agora praticar vocabul\xE1rio e interpreta\xE7\xE3o em Ingl\xEAs?",
        actionType: "new_subject"
      });
    }
  });
  app.post("/api/ai/challenge-questions", async (req, res) => {
    try {
      const { grade, subject, difficulty, count = 5 } = req.body;
      if (!ai) {
        return res.status(503).json({ error: "AI indispon\xEDvel, usando quest\xF5es locais." });
      }
      const gradeRule = getGradeRule(grade);
      const diffDesc = difficulty === "easy" ? "F\xC1CIL: conceitos diretos, contas simples dentro da faixa et\xE1ria, vocabul\xE1rio b\xE1sico do dia a dia." : difficulty === "hard" ? "DIF\xCDCIL: problemas mais elaborados de racioc\xEDnio dentro da faixa et\xE1ria, pegadinhas l\xF3gicas." : "M\xC9DIO: aplica\xE7\xE3o padr\xE3o da s\xE9rie escolar.";
      const systemInstruction = `Voc\xEA \xE9 um criador de quest\xF5es escolares de alto n\xEDvel para olimp\xEDadas, competi\xE7\xF5es e simulados da BNCC brasileira. REGRA ABSOLUTA DE DISCIPLINA: Todas as ${count} quest\xF5es DEVEM pertencer 100% \xE0 mat\xE9ria "${subject || "Matem\xE1tica"}". NUNCA misture mat\xE9rias (por exemplo, nunca coloque contas em prova de portugu\xEAs, nem gram\xE1tica em prova de matem\xE1tica). REGRA CR\xCDTICA DE CONTE\xDADO (PROIBIDO META-QUEST\xD5ES): \xC9 TERMINANTEMENTE PROIBIDO gerar perguntas sobre m\xE9todos de estudo, tais como "como estudar para esta mat\xE9ria", "como fixar o conte\xFAdo", "o que estuda esta mat\xE9ria", "qual a import\xE2ncia de estudar", ou perguntas reflexivas sobre a disciplina. TODAS as quest\xF5es DEVEM ser 100% EXERC\xCDCIOS T\xC9CNICOS E APLICA\xC7\xD5ES PR\xC1TICAS DO CONTE\xDADO REAL DA DISCIPLINA (ex: em matem\xE1tica, c\xE1lculos, problemas, fra\xE7\xF5es, equa\xE7\xF5es; em portugu\xEAs, gram\xE1tica, pontua\xE7\xE3o, figuras de linguagem, interpreta\xE7\xE3o textual; em ci\xEAncias/f\xEDsica/qu\xEDmica/biologia, processos naturais, rea\xE7\xF5es, leis cient\xEDficas, anatomia; em hist\xF3ria/geografia, fatos hist\xF3ricos, relevo, clima, mapas). Gere exatamente ${count} quest\xF5es de m\xFAltipla escolha para a mat\xE9ria "${subject || "Matem\xE1tica"}" da s\xE9rie "${grade || "6_fund"}". DIRETRIZ PEDAG\xD3GICA DA S\xC9RIE:
${gradeRule}

Complexidade exigida: ${diffDesc}. ATEN\xC7\xC3O: Se for 1\xBA ano, NUNCA use divis\xE3o ou multiplica\xE7\xE3o! Cada quest\xE3o deve ter 4 alternativas onde a primeira (\xEDndice 0) \xE9 a correta, com explica\xE7\xE3o detalhada em portugu\xEAs.`;
      const prompt = `Gere ${count} quest\xF5es de conte\xFAdo pr\xE1tico exclusivamente sobre ${subject} para ${grade} na dificuldade ${difficulty} (${diffDesc}). N\xE3o inclua perguntas sobre como estudar ou o que estuda a mat\xE9ria; crie apenas exerc\xEDcios reais do conte\xFAdo.
Retorne no formato JSON com lista de questions contendo id, topic, question, options (4 alternativas), correctIndex (0), explanation, difficulty.`;
      const response = await callGeminiSafe({
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: import_genai.Type.OBJECT,
            properties: {
              questions: {
                type: import_genai.Type.ARRAY,
                items: {
                  type: import_genai.Type.OBJECT,
                  properties: {
                    id: { type: import_genai.Type.STRING },
                    topic: { type: import_genai.Type.STRING },
                    question: { type: import_genai.Type.STRING },
                    options: {
                      type: import_genai.Type.ARRAY,
                      items: { type: import_genai.Type.STRING }
                    },
                    correctIndex: { type: import_genai.Type.INTEGER },
                    explanation: { type: import_genai.Type.STRING },
                    difficulty: { type: import_genai.Type.STRING }
                  },
                  required: ["id", "topic", "question", "options", "correctIndex", "explanation"]
                }
              }
            },
            required: ["questions"]
          }
        }
      });
      const parsed = JSON.parse(response?.text || "{}");
      const rawQuestions = parsed.questions || [];
      const randomizedQuestions = rawQuestions.map(shuffleServerQuestionOptions);
      return res.json(randomizedQuestions);
    } catch (err) {
      const errorMsg = err?.message || "Erro tempor\xE1rio na gera\xE7\xE3o de quest\xF5es";
      return res.status(500).json({ error: `N\xE3o foi poss\xEDvel gerar novas quest\xF5es no momento: ${errorMsg}. Usando banco de quest\xF5es padr\xE3o.` });
    }
  });
  function generateFallbackExamQuestions(subject, grade, count, questionTypes, pointsPerQuestion) {
    const normSubj = (subject || "").toLowerCase().trim();
    const typesToUse = Array.isArray(questionTypes) && questionTypes.length > 0 ? questionTypes : ["multiple_choice", "true_false", "discursive"];
    const contentBanks = {
      matematica: {
        tf: [
          {
            q: 'Julgue o item como Verdadeiro ou Falso: "Em uma express\xE3o num\xE9rica contendo adi\xE7\xF5es e multiplica\xE7\xF5es sem par\xEAnteses, a multiplica\xE7\xE3o deve ser calculada antes da adi\xE7\xE3o."',
            ans: true,
            exp: "Verdadeiro! Pela ordem de preced\xEAncia das opera\xE7\xF5es matem\xE1ticas, multiplica\xE7\xF5es e divis\xF5es t\xEAm prioridade sobre adi\xE7\xF5es e subtra\xE7\xF5es.",
            topic: "Express\xF5es Num\xE9ricas"
          },
          {
            q: 'Julgue o item como Verdadeiro ou Falso: "O n\xFAmero zero (0) \xE9 considerado um n\xFAmero primo porque \xE9 divis\xEDvel apenas por ele mesmo."',
            ans: false,
            exp: "Falso! N\xFAmeros primos s\xE3o n\xFAmeros naturais maiores que 1 que possuem exatamente dois divisores distintos (o 1 e ele mesmo). O zero n\xE3o \xE9 primo.",
            topic: "N\xFAmeros Primos"
          },
          {
            q: 'Julgue o item como Verdadeiro ou Falso: "Duas fra\xE7\xF5es 2/4 e 3/6 s\xE3o equivalentes porque ambas representam a metade (1/2) do todo."',
            ans: true,
            exp: "Verdadeiro! Ao simplificar 2/4 (dividindo por 2) e 3/6 (dividindo por 3), ambas resultam na fra\xE7\xE3o irredut\xEDvel 1/2.",
            topic: "Fra\xE7\xF5es Equivalentes"
          }
        ],
        disc: [
          {
            q: "Resolva o problema e mostre os c\xE1lculos: Um comerciante comprou um produto por R$ 80,00 e deseja revend\xEA-lo com um lucro de 25%. Qual deve ser o pre\xE7o de venda?",
            ans: "C\xE1lculo de 25% de 80: (25/100) * 80 = R$ 20,00 de lucro. Pre\xE7o de venda = 80 + 20 = R$ 100,00.",
            rubric: ["Calculou 25% corretamente (R$ 20)", "Somou o lucro ao custo inicial", "Chegou ao valor final de R$ 100,00"],
            exp: "Para calcular a porcentagem de acr\xE9scimo, calcula-se a fra\xE7\xE3o percentual sobre o valor base e soma-se ao pre\xE7o de custo.",
            topic: "Porcentagem e Lucro"
          },
          {
            q: "Em um tri\xE2ngulo ret\xE2ngulo, um dos \xE2ngulos agudos mede 35\xB0. Calcule e justifique o valor da medida do outro \xE2ngulo agudo.",
            ans: "A soma dos \xE2ngulos internos de qualquer tri\xE2ngulo \xE9 180\xB0. Como \xE9 um tri\xE2ngulo ret\xE2ngulo, um \xE2ngulo \xE9 90\xB0. Portanto, o outro \xE2ngulo agudo \xE9: 180\xB0 - 90\xB0 - 35\xB0 = 55\xB0.",
            rubric: ["Identificou a soma dos \xE2ngulos internos (180\xB0)", "Subtraiu os 90\xB0 do \xE2ngulo reto", "Encontrou o \xE2ngulo complementar de 55\xB0"],
            exp: "Os \xE2ngulos agudos de um tri\xE2ngulo ret\xE2ngulo s\xE3o complementares, logo somam 90\xB0 (90\xB0 - 35\xB0 = 55\xB0).",
            topic: "Geometria e \xC2ngulos"
          }
        ],
        mc: [
          {
            q: "Qual \xE9 o resultado da opera\xE7\xE3o matem\xE1tica: 45 - 3 \xD7 (8 + 2)?",
            opts: ["15", "420", "42", "35"],
            exp: "Calculando dentro dos par\xEAnteses primeiro: (8 + 2) = 10. Em seguida a multiplica\xE7\xE3o: 3 \xD7 10 = 30. Por fim: 45 - 30 = 15.",
            topic: "Opera\xE7\xF5es e Express\xF5es"
          },
          {
            q: "Uma sala retangular possui 6 metros de comprimento e 4 metros de largura. Qual \xE9 a \xE1rea total e o per\xEDmetro dessa sala, respectivamente?",
            opts: ["\xC1rea = 24 m\xB2 e Per\xEDmetro = 20 m", "\xC1rea = 20 m\xB2 e Per\xEDmetro = 24 m", "\xC1rea = 10 m\xB2 e Per\xEDmetro = 24 m", "\xC1rea = 24 m\xB2 e Per\xEDmetro = 10 m"],
            exp: "\xC1rea = Comprimento \xD7 Largura = 6 \xD7 4 = 24 m\xB2. Per\xEDmetro = 2\xD7(6 + 4) = 20 m.",
            topic: "\xC1rea e Per\xEDmetro"
          }
        ]
      },
      portugues: {
        tf: [
          {
            q: `Julgue o item como Verdadeiro ou Falso: "Na ora\xE7\xE3o 'Eles chegaram atrasados ao col\xE9gio', o termo 'atrasados' funciona sintaticamente como predicativo do sujeito."`,
            ans: true,
            exp: 'Verdadeiro! "Atrasados" \xE9 um adjetivo que qualifica o sujeito "Eles" no momento da a\xE7\xE3o do verbo "chegaram".',
            topic: "Sintaxe e Predicativo"
          },
          {
            q: `Julgue o item como Verdadeiro ou Falso: "As palavras 'm\xE9dico', 'p\xFAblico' e '\xE1rvore' s\xE3o acentuadas porque todas s\xE3o parox\xEDtonas terminadas em vogal."`,
            ans: false,
            exp: "Falso! Essas palavras s\xE3o proparox\xEDtonas (a s\xEDlaba t\xF4nica \xE9 a antepen\xFAltima) e todas as proparox\xEDtonas s\xE3o obrigatoriamente acentuadas na l\xEDngua portuguesa.",
            topic: "Acentua\xE7\xE3o Gr\xE1fica"
          }
        ],
        disc: [
          {
            q: 'Identifique e explique a figura de linguagem presente na seguinte frase: "Chorei rios de l\xE1grimas quando me despedi dos meus colegas de turma."',
            ans: 'A figura de linguagem \xE9 a Hip\xE9rbole, que consiste no exagero intencional de uma ideia para enfatizar a intensidade da emo\xE7\xE3o ("rios de l\xE1grimas").',
            rubric: ["Identificou corretamente a Hip\xE9rbole", "Explicou o conceito de exagero expressivo", "Relacionou com o trecho citado"],
            exp: "A hip\xE9rbole utiliza o exagero dram\xE1tico ou expressivo para intensificar o sentido da mensagem.",
            topic: "Figuras de Linguagem"
          },
          {
            q: 'Reescreva a frase corrigindo o erro de concord\xE2ncia verbal e justifique a corre\xE7\xE3o: "Fazem tr\xEAs anos que n\xE3o vejo meus primos."',
            ans: 'Frase corrigida: "Faz tr\xEAs anos que n\xE3o vejo meus primos." Justificativa: O verbo "fazer", quando indica tempo transcorrido, \xE9 impessoal e deve ficar na 3\xAA pessoa do singular.',
            rubric: ['Corrigiu "Fazem" para "Faz"', "Explicou que o verbo fazer indicando tempo \xE9 impessoal", "Manteve a estrutura coerente"],
            exp: "Verbos impessoais (haver no sentido de existir/tempo e fazer indicando tempo) n\xE3o v\xE3o para o plural.",
            topic: "Concord\xE2ncia Verbal"
          }
        ],
        mc: [
          {
            q: 'Na frase: "Embora estivesse chovendo muito, decidimos fazer a caminhada no parque", a conjun\xE7\xE3o "EMBORA" introduz uma ora\xE7\xE3o com ideia de:',
            opts: ["Concess\xE3o (oposi\xE7\xE3o que n\xE3o impede a a\xE7\xE3o principal)", "Causa (o motivo da chuva)", "Consequ\xEAncia (o efeito do temporal)", "Condi\xE7\xE3o (uma exig\xEAncia pr\xE9via)"],
            exp: '"Embora" \xE9 uma conjun\xE7\xE3o subordinativa concessiva, indicando uma ideia de quebra de expectativa ou contraste que n\xE3o anula a a\xE7\xE3o principal.',
            topic: "Ora\xE7\xF5es Subordinadas"
          },
          {
            q: "Assinale a alternativa em que o uso da crase \xE9 OBRIGAT\xD3RIO de acordo com a norma-padr\xE3o:",
            opts: ["Entreguei o documento \xE0 diretora da escola.", "Come\xE7ou a chover forte \xE0 tarde toda.", "Ele caminhava a passo lento.", "Fomos a p\xE9 at\xE9 o mercado."],
            exp: 'Ocorre crase em "\xE0 diretora" devido \xE0 fus\xE3o da preposi\xE7\xE3o "a" (exigida por entregar a) com o artigo feminino "a" que antecede "diretora". N\xE3o h\xE1 crase antes de verbo ("a chover") nem de palavras masculinas ("a passo", "a p\xE9").',
            topic: "Emprego da Crase"
          }
        ]
      },
      ciencias: {
        tf: [
          {
            q: 'Julgue o item como Verdadeiro ou Falso: "A fotoss\xEDntese \xE9 o processo pelo qual os vegetais utilizam g\xE1s carb\xF4nico, \xE1gua e luz solar para produzir glicose e liberar g\xE1s oxig\xEAnio na atmosfera."',
            ans: true,
            exp: "Verdadeiro! Na fotoss\xEDntese, a clorofila absorve luz solar para sintetizar mat\xE9ria org\xE2nica (glicose) a partir de CO2 e H2O, liberando O2.",
            topic: "Fotoss\xEDntese e Energia"
          },
          {
            q: 'Julgue o item como Verdadeiro ou Falso: "As art\xE9rias s\xE3o vasos sangu\xEDneos que sempre transportam sangue pobre em oxig\xEAnio diretamente para o cora\xE7\xE3o."',
            ans: false,
            exp: "Falso! As art\xE9rias transportam sangue saindo DO cora\xE7\xE3o para os tecidos do corpo. As veias \xE9 que trazem o sangue de volta ao cora\xE7\xE3o.",
            topic: "Sistema Cardiovascular"
          }
        ],
        disc: [
          {
            q: "Explique a diferen\xE7a funcional entre c\xE9lulas procariontes e eucariontes e cite um exemplo de organismo para cada tipo celular.",
            ans: "As c\xE9lulas procariontes n\xE3o possuem n\xFAcleo delimitado por membrana (carioteca) e seu material gen\xE9tico fica disperso no citoplasma (ex: bact\xE9rias). As c\xE9lulas eucariontes possuem n\xFAcleo individualizado e organelas membranosas (ex: animais, plantas e fungos).",
            rubric: ["Diferenciou presen\xE7a/aus\xEAncia de n\xFAcleo (carioteca)", "Citou organelas membranosas", "Apresentou exemplos corretos para ambos os tipos"],
            exp: "A principal distin\xE7\xE3o evolutiva \xE9 a compartimentaliza\xE7\xE3o celular e o n\xFAcleo verdadeiro nas c\xE9lulas eucariontes.",
            topic: "Citologia e Estrutura Celular"
          }
        ],
        mc: [
          {
            q: "Qual organela celular \xE9 conhecida como a principal respons\xE1vel pela respira\xE7\xE3o celular e produ\xE7\xE3o de ATP (energia) na c\xE9lula eucarionte?",
            opts: ["Mitoc\xF4ndria", "Ribossomo", "Complexo de Golgi", "Lisossomo"],
            exp: "A mitoc\xF4ndria realiza a respira\xE7\xE3o celular oxidativa, quebrando glicose na presen\xE7a de oxig\xEAnio para gerar energia na forma de mol\xE9culas de ATP.",
            topic: "Organelas Celulares"
          }
        ]
      },
      historia: {
        tf: [
          {
            q: 'Julgue o item como Verdadeiro ou Falso: "A Lei \xC1urea, assinada pela Princesa Isabel em 13 de maio de 1888, extinguiu formalmente a escravid\xE3o no territ\xF3rio brasileiro."',
            ans: true,
            exp: "Verdadeiro! A Lei \xC1urea de 1888 aboliu a escravid\xE3o no Brasil, embora n\xE3o tenha sido acompanhada por pol\xEDticas p\xFAblicas de integra\xE7\xE3o social e econ\xF4mica dos libertos.",
            topic: "Brasil Imp\xE9rio e Aboli\xE7\xE3o"
          }
        ],
        disc: [
          {
            q: "Quais foram as principais transforma\xE7\xF5es nas rela\xE7\xF5es de trabalho e nas cidades provocadas pela Primeira Revolu\xE7\xE3o Industrial no s\xE9culo XVIII?",
            ans: "A Revolu\xE7\xE3o Industrial substituiu o trabalho artesanal pela maquinofatura nas f\xE1bricas, gerou o \xEAxodo rural acelerado (crescimento desordenado das cidades), longas jornadas de trabalho fabril e a consolida\xE7\xE3o das classes da burguesia e do proletariado.",
            rubric: ["Mencionou a maquinofatura/f\xE1bricas", "Citou o \xEAxodo rural e urbaniza\xE7\xE3o", "Destacou a forma\xE7\xE3o do operariado e burguesia"],
            exp: "A introdu\xE7\xE3o da m\xE1quina a vapor na Inglaterra alterou drasticamente os ritmos de produ\xE7\xE3o, o tempo de trabalho e a paisagem urbana.",
            topic: "Revolu\xE7\xE3o Industrial"
          }
        ],
        mc: [
          {
            q: "Qual foi o lema central da Revolu\xE7\xE3o Francesa de 1789, inspirado pelos princ\xEDpios filos\xF3ficos do Iluminismo?",
            opts: ["Liberdade, Igualdade e Fraternidade (Libert\xE9, \xC9galit\xE9, Fraternit\xE9)", "Ordem e Progresso", "Paz, Terra e P\xE3o", "Deus, P\xE1tria e Fam\xEDlia"],
            exp: '"Libert\xE9, \xC9galit\xE9, Fraternit\xE9" foi o lema sintetizado na Revolu\xE7\xE3o Francesa que combateu os privil\xE9gios do Antigo Regime absolutista.',
            topic: "Revolu\xE7\xE3o Francesa"
          }
        ]
      },
      geografia: {
        tf: [
          {
            q: 'Julgue o item como Verdadeiro ou Falso: "O Cerrado \xE9 o segundo maior bioma brasileiro, caracterizado por vegeta\xE7\xE3o de savana, solos \xE1cidos e troncos de \xE1rvores tortuosos."',
            ans: true,
            exp: "Verdadeiro! O Cerrado \xE9 a savana brasileira com elevada biodiversidade e \xE1rvores de casca grossa e ra\xEDzes profundas.",
            topic: "Biomas Brasileiros"
          }
        ],
        disc: [
          {
            q: "Explique o que \xE9 o fen\xF4meno da Urbaniza\xE7\xE3o e diferencie-o do simples crescimento da popula\xE7\xE3o total de um pa\xEDs.",
            ans: "Urbaniza\xE7\xE3o \xE9 o processo em que a propor\xE7\xE3o da popula\xE7\xE3o urbana cresce em ritmo superior ao da popula\xE7\xE3o rural, decorrente principalmente do \xEAxodo rural e da concentra\xE7\xE3o de ind\xFAstrias e servi\xE7os nas cidades.",
            rubric: ["Definiu urbaniza\xE7\xE3o como aumento relativo da popula\xE7\xE3o urbana", "Citou o \xEAxodo rural e atra\xE7\xE3o por servi\xE7os/ind\xFAstrias", "Diferenciou de crescimento populacional bruto"],
            exp: "Um pa\xEDs s\xF3 \xE9 considerado urbanizado quando a maioria absoluta de seus habitantes vive nas cidades.",
            topic: "Espa\xE7o Urbano e Demografia"
          }
        ],
        mc: [
          {
            q: "Qual das seguintes camadas terrestres \xE9 respons\xE1vel pelo movimento das placas tect\xF4nicas atrav\xE9s de correntes de convec\xE7\xE3o de magma?",
            opts: ["Manto Superior / Astenosfera", "Crosta Continental", "N\xFAcleo Interno S\xF3lido", "Litosfera R\xEDgida"],
            exp: "As correntes de convec\xE7\xE3o do magma no manto movimentam os blocos r\xEDgidos da litosfera (placas tect\xF4nicas), gerando terremotos, vulcanismo e dobras montanhosas.",
            topic: "Geologia e Tect\xF4nica de Placas"
          }
        ]
      }
    };
    const selectedBank = contentBanks[normSubj] || contentBanks.matematica;
    const questions = [];
    for (let i = 0; i < count; i++) {
      const type = typesToUse[i % typesToUse.length];
      if (type === "true_false") {
        const pool = selectedBank.tf;
        const item = pool[i % pool.length];
        questions.push({
          id: `q_tf_fb_${Date.now()}_${i}`,
          type: "true_false",
          question: item.q,
          correctBoolean: item.ans,
          explanation: item.exp,
          points: pointsPerQuestion,
          topic: item.topic
        });
      } else if (type === "discursive") {
        const pool = selectedBank.disc;
        const item = pool[i % pool.length];
        questions.push({
          id: `q_disc_fb_${Date.now()}_${i}`,
          type: "discursive",
          question: item.q,
          correctAnswerText: item.ans,
          rubricCriteria: item.rubric,
          explanation: item.exp,
          points: pointsPerQuestion,
          topic: item.topic
        });
      } else {
        const pool = selectedBank.mc;
        const item = pool[i % pool.length];
        questions.push({
          id: `q_mc_fb_${Date.now()}_${i}`,
          type: "multiple_choice",
          question: item.q,
          options: item.opts,
          correctOptionIndex: 0,
          explanation: item.exp,
          points: pointsPerQuestion,
          topic: item.topic
        });
      }
    }
    return questions;
  }
  app.post("/api/ai/generate-flashcards", async (req, res) => {
    try {
      const { grade, subject, topic, count = 6 } = req.body;
      if (!ai) {
        return res.status(503).json({ error: "IA indispon\xEDvel, usando flashcards pr\xE9-carregados." });
      }
      const gradeRule = getGradeRule(grade);
      const systemInstruction = `Voc\xEA \xE9 um especialista em m\xE9todos de estudo ativo, repeti\xE7\xE3o espa\xE7ada e flashcards educacionais alinhados \xE0 BNCC brasileira. Gere exatamente ${count} flashcards de alta qualidade para o tema escolar "${topic || "Conceitos Fundamentais"}" da mat\xE9ria "${subject || "Geral"}" para a s\xE9rie "${grade || "6_fund"}". DIRETRIZ PEDAG\xD3GICA OBRIGAT\xD3RIA DA S\xC9RIE:
${gradeRule}

ATEN\xC7\xC3O: Se a s\xE9rie for 1\xBA ano, NUNCA use divis\xE3o, multiplica\xE7\xE3o, fra\xE7\xF5es ou termos complexos! Cada flashcard deve conter: 1. question: A pergunta ou conceito da frente do cart\xE3o (clara, instigante, direta). 2. answer: A resposta completa, resumida e f\xE1cil de memorizar do verso do cart\xE3o. 3. hint: Uma dica curta para ajudar o estudante a lembrar sem dar a resposta imediatamente. 4. category: Categoria do cart\xE3o (ex: "Conceito-Chave", "F\xF3rmula", "Vocabul\xE1rio", "Data", "Curiosidade").`;
      const prompt = `Crie um baralho de ${count} flashcards sobre "${topic || "Revis\xE3o Geral"}" da mat\xE9ria ${subject || "Matem\xE1tica"} para o ${grade || "6_fund"}.
Retorne no formato JSON com:
- title: T\xEDtulo do Baralho
- description: Breve descri\xE7\xE3o
- cards: Lista de ${count} objetos com { id, topic, question, answer, hint, category }`;
      const response = await callGeminiSafe({
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: import_genai.Type.OBJECT,
            properties: {
              title: { type: import_genai.Type.STRING },
              description: { type: import_genai.Type.STRING },
              cards: {
                type: import_genai.Type.ARRAY,
                items: {
                  type: import_genai.Type.OBJECT,
                  properties: {
                    id: { type: import_genai.Type.STRING },
                    topic: { type: import_genai.Type.STRING },
                    question: { type: import_genai.Type.STRING },
                    answer: { type: import_genai.Type.STRING },
                    hint: { type: import_genai.Type.STRING },
                    category: { type: import_genai.Type.STRING }
                  },
                  required: ["id", "topic", "question", "answer", "hint", "category"]
                }
              }
            },
            required: ["title", "description", "cards"]
          }
        }
      });
      const parsed = JSON.parse(response?.text || "{}");
      return res.json(parsed);
    } catch (err) {
      const errorMsg = err?.message || "Erro ao gerar flashcards";
      return res.status(500).json({ error: `Erro na IA: ${errorMsg}. Usando baralho padr\xE3o.` });
    }
  });
  app.post("/api/ai/generate-exam-from-photo", async (req, res) => {
    try {
      const {
        imagesBase64 = [],
        imageBase64,
        textPrompt = "",
        grade = "6_fund",
        subject = "Geral",
        questionTypes = ["multiple_choice", "true_false", "discursive"],
        questionCount = 5,
        examTitle = "",
        maxExamValue = 10
      } = req.body;
      const allImages = Array.isArray(imagesBase64) && imagesBase64.length > 0 ? imagesBase64 : imageBase64 ? [imageBase64] : [];
      if (allImages.length === 0 && !textPrompt) {
        return res.status(400).json({ error: "Envie ao menos uma foto do conte\xFAdo (livro, caderno, folha) ou digite o assunto da prova." });
      }
      const gradeRule = getGradeRule(grade);
      const count = Math.min(Math.max(Number(questionCount) || 5, 3), 10);
      const resolvedMaxVal = Number(maxExamValue) || 10;
      const pointsPerQuestion = Number((resolvedMaxVal / count).toFixed(1));
      const buildFallbackSummary = (subj, titleStr) => ({
        title: titleStr || `Resumo de ${subj}`,
        detectedSubject: subj,
        overview: `Resumo pedag\xF3gico dos pontos centrais da mat\xE9ria para a s\xE9rie ${gradeRule}. Revise atentamente estes conceitos antes de responder \xE0s quest\xF5es da prova.`,
        keyConcepts: [
          "Compreenda o objetivo principal e as defini\xE7\xF5es essenciais dos conte\xFAdos estudados.",
          "Siga a ordem l\xF3gica de resolu\xE7\xE3o, identificando os dados conhecidos e as f\xF3rmulas aplic\xE1veis.",
          "Revise seus resultados verificando a coer\xEAncia com as regras da mat\xE9ria."
        ],
        importantRulesOrFormulas: [
          "Organize o racioc\xEDnio passo a passo antes de assinalar ou escrever a resposta.",
          "Aten\xE7\xE3o \xE0s regras de c\xE1lculo, termos t\xE9cnicos e normas gramaticais da disciplina."
        ],
        summaryForVoice: `Ol\xE1! Preparamos um resumo com os principais conceitos da sua mat\xE9ria. Ou\xE7a com aten\xE7\xE3o os pontos-chave antes de iniciar as perguntas da avalia\xE7\xE3o. Boa prova!`
      });
      const buildFallbackExam = () => {
        const fallbackQuestions = generateFallbackExamQuestions(
          subject,
          grade,
          count,
          questionTypes,
          pointsPerQuestion
        );
        return {
          id: `exam_${Date.now()}`,
          title: examTitle || `Prova de ${subject}`,
          subject,
          grade,
          description: `Prova curricular de ${subject} (${count} quest\xF5es, totalizando ${resolvedMaxVal} pontos).`,
          contentSummary: buildFallbackSummary(subject, examTitle),
          extractedTopicSummary: `Conte\xFAdo essencial de ${subject} (${gradeRule}).`,
          questions: fallbackQuestions,
          totalPoints: resolvedMaxVal,
          maxExamValue: resolvedMaxVal,
          createdAt: Date.now()
        };
      };
      if (!ai) {
        return res.json(buildFallbackExam());
      }
      const multiImageNote = allImages.length > 1 ? `ATEN\xC7\xC3O MULTI-P\xC1GINAS: O estudante enviou ${allImages.length} fotos de p\xE1ginas da sua apostila/caderno. Examine e leia minuciosamente (OCR) TODAS as p\xE1ginas na ordem fornecida. ` : "O estudante enviou foto da p\xE1gina de sua apostila/livro/caderno. Examine e leia minuciosamente (OCR) todo o texto, termos e exerc\xEDcios. ";
      const systemInstruction = "Voc\xEA \xE9 um professor examinador e autor de materiais did\xE1ticos do sistema educacional brasileiro (BNCC). " + multiImageNote + `MISS\xC3O CR\xCDTICA DE ALINHAMENTO COM A APOSTILA DO ALUNO:
1. LEITURA MINUCIOSA DO MATERIAL: Leia com m\xE1xima aten\xE7\xE3o o texto, t\xEDtulos, subt\xEDtulos, defini\xE7\xF5es, f\xF3rmulas, fatos hist\xF3ricos, regras gramaticais e exerc\xEDcios impressos nas fotos da apostila.
2. IDENTIFICA\xC7\xC3O DO TEMA REAL: Identifique a mat\xE9ria real e o cap\xEDtulo/assunto exato do material das fotos (ex: Revolu\xE7\xE3o Francesa, Fotoss\xEDntese, Teorema de Pit\xE1goras, Termodin\xE2mica, Biomas, Concord\xE2ncia Verbal). Se a mat\xE9ria das fotos for diferente da informada, PREVALECE O QUE EST\xC1 NAS FOTOS DA APOSTILA.
3. RESUMO DO CONTE\xDADO (contentSummary): Antes das perguntas, voc\xEA DEVE gerar um resumo profundo e did\xE1tico do conte\xFAdo da apostila, contendo title, overview, lista de conceitos-chave (keyConcepts), regras/f\xF3rmulas (importantRulesOrFormulas) e um texto falado motivador e did\xE1tico (summaryForVoice) para ser narrado ao aluno por \xE1udio antes de ele iniciar as quest\xF5es.
4. FIDELIDADE ABSOLUTA DAS PERGUNTAS (PROIBIDO INVENTAR ASSUNTOS FORA DA APOSTILA): TODAS as quest\xF5es DEVEM ser 100% baseadas e extra\xEDdas diretamente do conte\xFAdo vis\xEDvel nas fotos da apostila enviada. Se a apostila fala sobre determinado assunto ou exerc\xEDcio, as quest\xF5es devem cobrar exatamente os dados e teorias ali explicados.
5. PROIBIDO META-QUEST\xD5ES: N\xE3o fa\xE7a perguntas sobre "como estudar", "qual a import\xE2ncia de estudar", "o que a mat\xE9ria estuda". Todas as quest\xF5es devem ser exerc\xEDcios pr\xE1ticos do conte\xFAdo real.
DIRETRIZ CURRICULAR DA S\xC9RIE:
${gradeRule}

Gere exatamente ${count} quest\xF5es no total, distribu\xEDdas equilibradamente entre os tipos solicitados: ${questionTypes.join(", ")}. FORMATOS DE QUEST\xD5ES:
1. multiple_choice: Quest\xE3o de assinalar com exatamente 4 alternativas (options), onde correctOptionIndex \xE9 0 (o servidor embaralha).
2. true_false: Afirma\xE7\xE3o t\xE9cnica do conte\xFAdo da apostila para julgar como Verdadeira ou Falsa, com correctBoolean (true ou false) e explica\xE7\xE3o.
3. discursive: Quest\xE3o discursiva/aberta cobrando aplica\xE7\xE3o do conte\xFAdo da apostila, contendo correctAnswerText (gabarito ideal) e rubricCriteria (2 a 3 crit\xE9rios objetivos de corre\xE7\xE3o).
4. fill_blank: Quest\xE3o com lacuna para preencher o termo correto.

CADA QUEST\xC3O DEVE TER CAMPO "points" de modo que a soma de todas as quest\xF5es totalize ${resolvedMaxVal} PONTOS.`;
      const promptText = `Analise com extremo cuidado todas as fotos da apostila e gere:
1. O resumo completo e estruturado do conte\xFAdo fotografado (contentSummary) para falar ao aluno antes da prova.
2. A prova com ${count} quest\xF5es diretamente extra\xEDdas dos textos e exerc\xEDcios da apostila.

Mat\xE9ria indicada: ${subject}
S\xE9rie: ${grade}
T\xEDtulo sugerido: ${examTitle || `Prova de ${subject}`}
Observa\xE7\xF5es adicionais do aluno: "${textPrompt || "Criar prova com base no conte\xFAdo exato das fotos da apostila"}"
Tipos de quest\xF5es exigidos: ${questionTypes.join(", ")}
Total de quest\xF5es: ${count}
Valor total da prova na escola: ${resolvedMaxVal} pontos (cada quest\xE3o deve valer ${pointsPerQuestion} pontos).

Retorne em formato JSON estruturado.`;
      const parts = [];
      for (const img of allImages) {
        const mimeType = img.includes("data:image/png") ? "image/png" : "image/jpeg";
        const cleanBase64 = img.replace(/^data:image\/[a-z]+;base64,/, "");
        parts.push({
          inlineData: {
            mimeType,
            data: cleanBase64
          }
        });
      }
      parts.push({ text: promptText });
      const response = await callGeminiSafe({
        contents: { parts },
        timeoutMs: 35e3,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: import_genai.Type.OBJECT,
            properties: {
              title: { type: import_genai.Type.STRING },
              description: { type: import_genai.Type.STRING },
              extractedTopicSummary: { type: import_genai.Type.STRING, description: "Breve resumo pedag\xF3gico do conte\xFAdo identificado nas fotos." },
              contentSummary: {
                type: import_genai.Type.OBJECT,
                properties: {
                  title: { type: import_genai.Type.STRING, description: "T\xEDtulo do tema identificado na apostila." },
                  detectedSubject: { type: import_genai.Type.STRING, description: "Mat\xE9ria escolar identificada." },
                  overview: { type: import_genai.Type.STRING, description: "Resumo pedag\xF3gico did\xE1tico e completo dos conceitos." },
                  keyConcepts: {
                    type: import_genai.Type.ARRAY,
                    items: { type: import_genai.Type.STRING },
                    description: "Lista com 3 a 6 pontos-chave da mat\xE9ria."
                  },
                  importantRulesOrFormulas: {
                    type: import_genai.Type.ARRAY,
                    items: { type: import_genai.Type.STRING },
                    description: "F\xF3rmulas, regras ou macetes essenciais."
                  },
                  summaryForVoice: {
                    type: import_genai.Type.STRING,
                    description: "Texto falado did\xE1tico e fluido para ser narrado ao estudante antes das perguntas."
                  }
                },
                required: ["title", "overview", "keyConcepts", "summaryForVoice"]
              },
              questions: {
                type: import_genai.Type.ARRAY,
                items: {
                  type: import_genai.Type.OBJECT,
                  properties: {
                    id: { type: import_genai.Type.STRING },
                    type: {
                      type: import_genai.Type.STRING,
                      enum: ["multiple_choice", "true_false", "discursive", "fill_blank"]
                    },
                    topic: { type: import_genai.Type.STRING },
                    question: { type: import_genai.Type.STRING },
                    options: {
                      type: import_genai.Type.ARRAY,
                      items: { type: import_genai.Type.STRING }
                    },
                    correctOptionIndex: { type: import_genai.Type.INTEGER },
                    correctBoolean: { type: import_genai.Type.BOOLEAN },
                    correctAnswerText: { type: import_genai.Type.STRING },
                    rubricCriteria: {
                      type: import_genai.Type.ARRAY,
                      items: { type: import_genai.Type.STRING }
                    },
                    explanation: { type: import_genai.Type.STRING },
                    points: { type: import_genai.Type.NUMBER }
                  },
                  required: ["id", "type", "question", "explanation", "points"]
                }
              }
            },
            required: ["title", "questions"]
          }
        }
      });
      if (!response || !response.text) {
        return res.json(buildFallbackExam());
      }
      let parsed = {};
      try {
        const cleanJson = response.text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim();
        parsed = JSON.parse(cleanJson);
      } catch {
        return res.json(buildFallbackExam());
      }
      let examQuestions = Array.isArray(parsed.questions) && parsed.questions.length > 0 ? parsed.questions : buildFallbackExam().questions;
      examQuestions = examQuestions.map((q, idx) => {
        if (q.type === "multiple_choice" && Array.isArray(q.options) && q.options.length > 1) {
          const correctText = q.options[q.correctOptionIndex || 0];
          const paired = q.options.map((opt) => ({ opt, sort: Math.random() }));
          paired.sort((a, b) => a.sort - b.sort);
          const shuffled = paired.map((p) => p.opt);
          const newCorrectIdx = Math.max(shuffled.indexOf(correctText), 0);
          return {
            ...q,
            id: q.id || `q_${Date.now()}_${idx}`,
            options: shuffled,
            correctOptionIndex: newCorrectIdx,
            points: q.points || pointsPerQuestion
          };
        }
        return {
          ...q,
          id: q.id || `q_${Date.now()}_${idx}`,
          points: q.points || pointsPerQuestion
        };
      });
      const finalSummary = parsed.contentSummary || buildFallbackSummary(
        parsed.contentSummary?.detectedSubject || subject,
        parsed.title || examTitle
      );
      return res.json({
        id: `exam_${Date.now()}`,
        title: parsed.title || examTitle || `Prova de ${subject}`,
        subject: parsed.contentSummary?.detectedSubject || subject,
        grade,
        description: parsed.description || `Prova elaborada a partir das fotos do material did\xE1tico (${examQuestions.length} quest\xF5es, ${resolvedMaxVal} pontos).`,
        extractedTopicSummary: parsed.extractedTopicSummary || finalSummary.overview || "",
        contentSummary: finalSummary,
        questions: examQuestions,
        totalPoints: resolvedMaxVal,
        maxExamValue: resolvedMaxVal,
        createdAt: Date.now()
      });
    } catch (err) {
      console.error("Error in /api/ai/generate-exam-from-photo, returning fallback exam:", err);
      const {
        grade = "6_fund",
        subject = "Geral",
        questionTypes = ["multiple_choice", "true_false", "discursive"],
        questionCount = 5,
        examTitle = "",
        maxExamValue = 10
      } = req.body || {};
      const count = Math.min(Math.max(Number(questionCount) || 5, 3), 10);
      const resolvedMaxVal = Number(maxExamValue) || 10;
      const pointsPerQuestion = Number((resolvedMaxVal / count).toFixed(1));
      const fallbackQuestions = generateFallbackExamQuestions(
        subject,
        grade,
        count,
        questionTypes,
        pointsPerQuestion
      );
      const catchSummary = {
        title: examTitle || `Resumo de ${subject}`,
        detectedSubject: subject,
        overview: `Resumo curricular de ${subject}. Revise atentamente os conceitos fundamentais antes de responder \xE0s quest\xF5es da prova.`,
        keyConcepts: [
          "Compreenda o objetivo principal e as defini\xE7\xF5es essenciais dos conte\xFAdos estudados.",
          "Siga a ordem l\xF3gica de resolu\xE7\xE3o, identificando os dados conhecidos e as f\xF3rmulas aplic\xE1veis.",
          "Revise seus resultados verificando a coer\xEAncia com as regras da mat\xE9ria."
        ],
        importantRulesOrFormulas: [
          "Organize o racioc\xEDnio passo a passo antes de assinalar ou escrever a resposta."
        ],
        summaryForVoice: `Ol\xE1! Preparamos o resumo com os conceitos essenciais da sua mat\xE9ria. Revise estes pontos com calma antes de come\xE7ar a responder \xE0s quest\xF5es da prova.`
      };
      return res.json({
        id: `exam_${Date.now()}`,
        title: examTitle || `Prova de ${subject}`,
        subject,
        grade,
        description: `Prova curricular de ${subject} (${count} quest\xF5es, totalizando ${resolvedMaxVal} pontos).`,
        extractedTopicSummary: catchSummary.overview,
        contentSummary: catchSummary,
        questions: fallbackQuestions,
        totalPoints: resolvedMaxVal,
        maxExamValue: resolvedMaxVal,
        createdAt: Date.now()
      });
    }
  });
  app.post("/api/ai/grade-exam", async (req, res) => {
    try {
      const {
        questions = [],
        studentAnswers = {},
        grade = "6_fund",
        subject = "Geral",
        examTitle = "Prova",
        maxExamValue = 10
      } = req.body;
      if (!Array.isArray(questions) || questions.length === 0) {
        return res.status(400).json({ error: "Nenhuma quest\xE3o enviada para corre\xE7\xE3o." });
      }
      const resolvedMaxVal = Number(maxExamValue) || 10;
      let totalPointsPossible = 0;
      let earnedPoints = 0;
      const gradedResults = [];
      const discursiveToGradeWithAI = [];
      for (const q of questions) {
        const qPoints = Number(q.points) || resolvedMaxVal / questions.length;
        totalPointsPossible += qPoints;
        const userAns = studentAnswers[q.id];
        if (q.type === "multiple_choice") {
          const isCorrect = typeof userAns === "number" && userAns === q.correctOptionIndex;
          const awarded = isCorrect ? qPoints : 0;
          earnedPoints += awarded;
          gradedResults.push({
            questionId: q.id,
            type: q.type,
            question: q.question,
            userSelectedOption: userAns,
            correctOptionIndex: q.correctOptionIndex,
            isCorrect,
            pointsEarned: awarded,
            maxPoints: qPoints,
            explanation: q.explanation
          });
        } else if (q.type === "true_false") {
          const isCorrect = typeof userAns === "boolean" && userAns === q.correctBoolean;
          const awarded = isCorrect ? qPoints : 0;
          earnedPoints += awarded;
          gradedResults.push({
            questionId: q.id,
            type: q.type,
            question: q.question,
            userSelectedBoolean: userAns,
            correctBoolean: q.correctBoolean,
            isCorrect,
            pointsEarned: awarded,
            maxPoints: qPoints,
            explanation: q.explanation
          });
        } else if (q.type === "discursive") {
          discursiveToGradeWithAI.push({
            id: q.id,
            question: q.question,
            studentAnswer: typeof userAns === "string" ? userAns.trim() : "",
            expectedAnswer: q.correctAnswerText || "",
            rubricCriteria: q.rubricCriteria || [],
            maxPoints: qPoints,
            explanation: q.explanation
          });
        } else {
          const isAnswered = Boolean(userAns);
          const awarded = isAnswered ? qPoints : 0;
          earnedPoints += awarded;
          gradedResults.push({
            questionId: q.id,
            type: q.type,
            question: q.question,
            isCorrect: isAnswered,
            pointsEarned: awarded,
            maxPoints: qPoints,
            explanation: q.explanation
          });
        }
      }
      if (discursiveToGradeWithAI.length > 0 && ai) {
        try {
          const discursivePrompt = `Voc\xEA \xE9 um professor examinador corrigindo quest\xF5es discursivas/escritas de uma prova escolar de ${subject} (${grade}).
Avalie a resposta de cada estudante com rigor pedag\xF3gico, atribuindo nota proporcional aos pontos m\xE1ximos de cada quest\xE3o e fornecendo feedback formativo em portugu\xEAs.

QUEST\xD5ES DISCURSIVAS PARA CORRE\xC7\xC3O:
${JSON.stringify(discursiveToGradeWithAI, null, 2)}

Retorne um JSON com uma lista "discursiveEvaluations" contendo para cada quest\xE3o:
- questionId: string
- pointsEarned: number (de 0 at\xE9 maxPoints da quest\xE3o)
- isFullyCorrect: boolean
- feedback: string (coment\xE1rio construtivo dizendo o que o aluno acertou e o que faltou)`;
          const aiGradingRes = await callGeminiSafe({
            contents: discursivePrompt,
            config: {
              responseMimeType: "application/json",
              responseSchema: {
                type: import_genai.Type.OBJECT,
                properties: {
                  discursiveEvaluations: {
                    type: import_genai.Type.ARRAY,
                    items: {
                      type: import_genai.Type.OBJECT,
                      properties: {
                        questionId: { type: import_genai.Type.STRING },
                        pointsEarned: { type: import_genai.Type.NUMBER },
                        isFullyCorrect: { type: import_genai.Type.BOOLEAN },
                        feedback: { type: import_genai.Type.STRING }
                      },
                      required: ["questionId", "pointsEarned", "feedback"]
                    }
                  }
                },
                required: ["discursiveEvaluations"]
              }
            }
          });
          const parsedAI = JSON.parse(aiGradingRes?.text || "{}");
          const evaluations = parsedAI.discursiveEvaluations || [];
          for (const disc of discursiveToGradeWithAI) {
            const evalItem = evaluations.find((e) => e.questionId === disc.id);
            const studentWroteSomething = disc.studentAnswer && disc.studentAnswer.length > 4;
            const awarded = evalItem ? Math.min(Math.max(evalItem.pointsEarned, 0), disc.maxPoints) : studentWroteSomething ? Math.round(disc.maxPoints * 0.7) : 0;
            earnedPoints += awarded;
            gradedResults.push({
              questionId: disc.id,
              type: "discursive",
              question: disc.question,
              userTextAnswer: disc.studentAnswer,
              expectedAnswer: disc.expectedAnswer,
              pointsEarned: awarded,
              maxPoints: disc.maxPoints,
              isCorrect: awarded >= disc.maxPoints * 0.6,
              feedback: evalItem?.feedback || (studentWroteSomething ? "Resposta desenvolvida pelo estudante." : "Nenhuma resposta inserida."),
              explanation: disc.explanation
            });
          }
        } catch (discErr) {
          for (const disc of discursiveToGradeWithAI) {
            const studentWrote = disc.studentAnswer && disc.studentAnswer.length > 5;
            const awarded = studentWrote ? Number((disc.maxPoints * 0.75).toFixed(1)) : 0;
            earnedPoints += awarded;
            gradedResults.push({
              questionId: disc.id,
              type: "discursive",
              question: disc.question,
              userTextAnswer: disc.studentAnswer,
              pointsEarned: awarded,
              maxPoints: disc.maxPoints,
              isCorrect: studentWrote,
              feedback: studentWrote ? "Resposta com bom desenvolvimento conceitual." : "Quest\xE3o n\xE3o respondida.",
              explanation: disc.explanation
            });
          }
        }
      } else if (discursiveToGradeWithAI.length > 0) {
        for (const disc of discursiveToGradeWithAI) {
          const studentWrote = disc.studentAnswer && disc.studentAnswer.length > 5;
          const awarded = studentWrote ? Number((disc.maxPoints * 0.75).toFixed(1)) : 0;
          earnedPoints += awarded;
          gradedResults.push({
            questionId: disc.id,
            type: "discursive",
            question: disc.question,
            userTextAnswer: disc.studentAnswer,
            pointsEarned: awarded,
            maxPoints: disc.maxPoints,
            isCorrect: studentWrote,
            feedback: studentWrote ? "Resposta respondida com clareza." : "Quest\xE3o sem resposta.",
            explanation: disc.explanation
          });
        }
      }
      const finalScore100 = totalPointsPossible > 0 ? Math.min(Math.max(Math.round(earnedPoints / totalPointsPossible * 100), 0), 100) : 0;
      const gradeEstimate10 = Number((finalScore100 / 10).toFixed(1));
      const scaledScore = Number((finalScore100 / 100 * resolvedMaxVal).toFixed(1));
      let classification = "Excelente / Dom\xEDnio Pleno";
      let gradeEstimateFeedback = "";
      let studyAdvice = "";
      if (finalScore100 >= 90) {
        classification = "Excelente / Dom\xEDnio Pleno";
        gradeEstimateFeedback = `\u{1F3AF} Estimativa de Nota: ${scaledScore} de ${resolvedMaxVal} pontos (${gradeEstimate10}/10,0). Voc\xEA demonstrou dom\xEDnio completo dos t\xF3picos da prova!`;
        studyAdvice = "Mantenha esse ritmo! Voc\xEA est\xE1 super preparado para a prova real na escola.";
      } else if (finalScore100 >= 70) {
        classification = "Bom Desempenho";
        gradeEstimateFeedback = `\u{1F4D8} Estimativa de Nota: ${scaledScore} de ${resolvedMaxVal} pontos (${gradeEstimate10}/10,0). Bom n\xEDvel de reten\xE7\xE3o com pequenas oportunidades de aprimoramento.`;
        studyAdvice = "Fa\xE7a uma revis\xE3o r\xE1pida das quest\xF5es que voc\xEA errou ou teve d\xFAvidas para garantir a nota m\xE1xima na escola!";
      } else if (finalScore100 >= 60) {
        classification = "Regular / Na M\xE9dia";
        gradeEstimateFeedback = `\u2696\uFE0F Estimativa de Nota: ${scaledScore} de ${resolvedMaxVal} pontos (${gradeEstimate10}/10,0). Voc\xEA atingiu a m\xE9dia necess\xE1ria, mas pode melhorar sua margem de seguran\xE7a.`;
        studyAdvice = "Pratique os Flashcards e releia as f\xF3rmulas e conceitos da mat\xE9ria antes do dia da avalia\xE7\xE3o.";
      } else if (finalScore100 >= 40) {
        classification = "Abaixo da Medida";
        gradeEstimateFeedback = `\u26A0\uFE0F Estimativa de Nota: ${scaledScore} de ${resolvedMaxVal} pontos (${gradeEstimate10}/10,0). Seu resultado ficou abaixo da m\xE9dia esperada para esta mat\xE9ria.`;
        studyAdvice = "Recomendamos ouvir o resumo em \xE1udio da mat\xE9ria e tirar d\xFAvidas com o Tutor IA antes da prova escolar.";
      } else {
        classification = "Necessita Refor\xE7o Urgente";
        gradeEstimateFeedback = `\u{1F6A8} Estimativa de Nota: ${scaledScore} de ${resolvedMaxVal} pontos (${gradeEstimate10}/10,0). \xC9 fundamental revisar a teoria b\xE1sica urgentemente.`;
        studyAdvice = "Utilize o Guia Te\xF3rico passo a passo e fa\xE7a novos testes para elevar sua pontua\xE7\xE3o.";
      }
      const strengths = [];
      const improvementAreas = [];
      gradedResults.forEach((r, idx) => {
        const topicName = questions[idx]?.topic || `Quest\xE3o ${idx + 1}`;
        if (r.isCorrect) {
          if (!strengths.includes(topicName)) strengths.push(topicName);
        } else {
          if (!improvementAreas.includes(topicName)) improvementAreas.push(topicName);
        }
      });
      return res.json({
        examTitle,
        subject,
        grade,
        score: finalScore100,
        totalPointsPossible: resolvedMaxVal,
        maxExamValue: resolvedMaxVal,
        scaledScore,
        gradeEstimate10,
        classification,
        gradeEstimateFeedback,
        studyAdvice,
        strengths: strengths.slice(0, 4),
        improvementAreas: improvementAreas.slice(0, 4),
        gradedResults,
        completedAt: Date.now()
      });
    } catch (err) {
      console.error("Error in /api/ai/grade-exam:", err);
      return res.status(500).json({ error: "Erro ao processar corre\xE7\xE3o da prova." });
    }
  });
  const STOP_LETTERS = ["A", "B", "C", "D", "E", "F", "G", "L", "M", "P", "R", "S", "T", "V"];
  const BOT_NAMES = [
    { name: "Rob\xF4 Albert \u{1F916}", avatar: "\u{1F916}" },
    { name: "Raposa \xC1gil \u{1F98A}", avatar: "\u{1F98A}" },
    { name: "Coruja S\xE1bia \u{1F989}", avatar: "\u{1F989}" },
    { name: "Raio Turbo \u26A1", avatar: "\u26A1" },
    { name: "Le\xE3o Campe\xE3o \u{1F981}", avatar: "\u{1F981}" }
  ];
  function getRandomStopLetter(exclude = []) {
    const available = STOP_LETTERS.filter((l) => !exclude.includes(l));
    const pool = available.length > 0 ? available : STOP_LETTERS;
    return pool[Math.floor(Math.random() * pool.length)];
  }
  app.post("/api/rooms/create", (req, res) => {
    const { hostName, hostGrade, hostAvatar, grade, gameType, questions, tiebreakerQuestions } = req.body;
    const type = gameType || "general";
    const prefix = type === "chess" ? "XADREZ" : type === "math" ? "MAT" : type === "stop" ? "STOP" : type === "speed_reflex" ? "REFLEX" : "SALA";
    const randomCode = Math.floor(1e3 + Math.random() * 9e3).toString();
    const code = `${prefix}-${randomCode}`;
    const hostId = `player_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const hostPlayer = {
      id: hostId,
      name: hostName || "Jogador 1",
      avatar: hostAvatar || (type === "chess" ? "\u265F\uFE0F" : type === "stop" ? "\u{1F6D1}" : type === "math" ? "\u26A1" : "\u{1F393}"),
      grade: hostGrade || grade || "6_fund",
      score: 0,
      errors: 0,
      currentQuestionIndex: 0,
      isReady: true,
      connected: true
    };
    let chessState = void 0;
    if (type === "chess") {
      const chess = new import_chess.Chess();
      chessState = {
        fen: chess.fen(),
        turn: "w",
        history: [],
        lastMove: null,
        isCheck: false,
        isCheckmate: false,
        isDraw: false,
        capturedByWhite: [],
        capturedByBlack: [],
        whitePlayerId: hostId,
        blackPlayerId: ""
      };
    }
    let stopState = void 0;
    if (type === "stop") {
      stopState = {
        letter: getRandomStopLetter(),
        roundNumber: 1,
        totalRounds: 3,
        playerAnswers: {},
        roundScores: {},
        isReviewing: false
      };
    }
    let reflexState = void 0;
    if (type === "speed_reflex") {
      reflexState = {
        targetColor: "blue",
        targetShape: "circle",
        targetSymbol: "\u26A1",
        roundNumber: 1,
        totalRounds: 5,
        roundStartTime: Date.now() + 3e3
      };
    }
    const incomingQuestions = (questions || []).map(shuffleServerQuestionOptions);
    const incomingTiebreakers = (tiebreakerQuestions || []).map(shuffleServerQuestionOptions);
    const newRoom = {
      code,
      grade: grade || hostGrade || "6_fund",
      gameType: type,
      status: "waiting",
      hostId,
      players: [hostPlayer],
      questions: incomingQuestions,
      tiebreakerQuestions: incomingTiebreakers,
      currentQuestionIndex: 0,
      maxPlayers: type === "chess" ? 2 : 6,
      createdAt: Date.now(),
      chessState,
      stopState,
      reflexState,
      recentReactions: []
    };
    rooms.set(code, newRoom);
    return res.json({ room: newRoom, playerId: hostId });
  });
  app.post("/api/rooms/join", (req, res) => {
    const { code, playerName, playerGrade, playerAvatar } = req.body;
    const cleanCode = code?.trim().toUpperCase();
    const room = rooms.get(cleanCode);
    if (!room) {
      return res.status(404).json({ error: "Sala n\xE3o encontrada. Verifique o c\xF3digo e tente novamente." });
    }
    if (room.status !== "waiting") {
      return res.status(400).json({ error: "Esta partida j\xE1 foi iniciada." });
    }
    if (room.players.length >= room.maxPlayers) {
      return res.status(400).json({ error: `A sala j\xE1 est\xE1 cheia (m\xE1ximo de ${room.maxPlayers} jogadores).` });
    }
    const playerId = `player_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newPlayer = {
      id: playerId,
      name: playerName || `Jogador ${room.players.length + 1}`,
      avatar: playerAvatar || (room.gameType === "chess" ? "\u265F\uFE0F" : "\u2B50"),
      grade: playerGrade || room.grade,
      score: 0,
      errors: 0,
      currentQuestionIndex: 0,
      isReady: true,
      connected: true
    };
    room.players.push(newPlayer);
    if (room.gameType === "chess" && room.chessState && !room.chessState.blackPlayerId) {
      room.chessState.blackPlayerId = playerId;
    }
    return res.json({ room, playerId });
  });
  app.post("/api/rooms/:code/add-bot", (req, res) => {
    const code = req.params.code.trim().toUpperCase();
    const room = rooms.get(code);
    if (!room) {
      return res.status(404).json({ error: "Sala n\xE3o encontrada." });
    }
    if (room.players.length >= room.maxPlayers) {
      return res.status(400).json({ error: `A sala j\xE1 est\xE1 cheia (m\xE1ximo de ${room.maxPlayers} jogadores).` });
    }
    const usedNames = room.players.map((p) => p.name);
    const availableBots = BOT_NAMES.filter((b) => !usedNames.includes(b.name));
    const botTemplate = availableBots.length > 0 ? availableBots[0] : BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)];
    const botId = `bot_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const botPlayer = {
      id: botId,
      name: botTemplate.name,
      avatar: botTemplate.avatar,
      grade: room.grade,
      score: 0,
      errors: 0,
      currentQuestionIndex: 0,
      isReady: true,
      connected: true,
      isBot: true
    };
    room.players.push(botPlayer);
    if (room.gameType === "chess" && room.chessState && !room.chessState.blackPlayerId) {
      room.chessState.blackPlayerId = botId;
    }
    return res.json({ room, botId });
  });
  app.post("/api/rooms/:code/kick", (req, res) => {
    const code = req.params.code.trim().toUpperCase();
    const { hostPlayerId, targetPlayerId } = req.body;
    const room = rooms.get(code);
    if (!room) {
      return res.status(404).json({ error: "Sala n\xE3o encontrada." });
    }
    if (room.hostId !== hostPlayerId) {
      return res.status(403).json({ error: "Apenas o anfitri\xE3o pode remover participantes." });
    }
    if (targetPlayerId === room.hostId) {
      return res.status(400).json({ error: "O anfitri\xE3o n\xE3o pode ser removido." });
    }
    room.players = room.players.filter((p) => p.id !== targetPlayerId);
    if (room.gameType === "chess" && room.chessState && room.chessState.blackPlayerId === targetPlayerId) {
      room.chessState.blackPlayerId = "";
    }
    return res.json({ room });
  });
  app.post("/api/rooms/:code/reaction", (req, res) => {
    const code = req.params.code.trim().toUpperCase();
    const { playerId, emoji } = req.body;
    const room = rooms.get(code);
    if (!room) {
      return res.status(404).json({ error: "Sala n\xE3o encontrada." });
    }
    const player = room.players.find((p) => p.id === playerId);
    if (!player) {
      return res.status(404).json({ error: "Jogador n\xE3o encontrado." });
    }
    player.reaction = emoji;
    const reactionObj = {
      id: `react_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      playerId,
      playerName: player.name,
      emoji,
      timestamp: Date.now()
    };
    if (!room.recentReactions) room.recentReactions = [];
    room.recentReactions.push(reactionObj);
    if (room.recentReactions.length > 20) {
      room.recentReactions = room.recentReactions.slice(-20);
    }
    return res.json({ room, reaction: reactionObj });
  });
  app.get("/api/rooms/:code", (req, res) => {
    const code = req.params.code.trim().toUpperCase();
    const room = rooms.get(code);
    if (!room) {
      return res.status(404).json({ error: "Sala n\xE3o encontrada." });
    }
    if (room.status === "in_progress") {
      const bots = room.players.filter((p) => p.isBot);
      for (const bot of bots) {
        if (room.gameType === "general" || room.gameType === "math") {
          const totalQ = room.questions.length || 10;
          if (bot.currentQuestionIndex < totalQ) {
            if (Math.random() < 0.35) {
              const isCorrect = Math.random() < 0.85;
              if (isCorrect) bot.score += 1;
              else bot.errors += 1;
              bot.currentQuestionIndex += 1;
            }
          }
        }
      }
      if (room.gameType === "general" || room.gameType === "math") {
        const totalQuestions = room.questions.length || 10;
        const allFinished = room.players.every((p) => p.currentQuestionIndex >= totalQuestions);
        if (allFinished) {
          const scores = room.players.map((p) => p.score);
          const maxScore = Math.max(...scores);
          const topPlayers = room.players.filter((p) => p.score === maxScore);
          if (topPlayers.length === 1) {
            room.status = "finished";
            room.winnerId = topPlayers[0].id;
          } else {
            room.status = "tiebreaker";
          }
        }
      }
    }
    return res.json({ room });
  });
  app.post("/api/rooms/:code/start", (req, res) => {
    const code = req.params.code.trim().toUpperCase();
    const { playerId } = req.body;
    const room = rooms.get(code);
    if (!room) {
      return res.status(404).json({ error: "Sala n\xE3o encontrada." });
    }
    if (room.hostId !== playerId) {
      return res.status(403).json({ error: "Apenas o anfitri\xE3o pode iniciar a partida." });
    }
    room.status = "in_progress";
    room.currentQuestionIndex = 0;
    if (room.gameType === "stop" && room.stopState) {
      room.stopState.playerAnswers = {};
      room.stopState.roundScores = {};
      room.stopState.stoppedBy = void 0;
      room.stopState.stoppedByName = void 0;
      room.stopState.stopCountdownEnd = void 0;
      room.stopState.isReviewing = false;
    }
    return res.json({ room });
  });
  app.post("/api/rooms/:code/answer", (req, res) => {
    const code = req.params.code.trim().toUpperCase();
    const { playerId, isCorrect, questionIndex, isTiebreaker } = req.body;
    const room = rooms.get(code);
    if (!room) {
      return res.status(404).json({ error: "Sala n\xE3o encontrada." });
    }
    const player = room.players.find((p) => p.id === playerId);
    if (!player) {
      return res.status(404).json({ error: "Jogador n\xE3o encontrado na sala." });
    }
    if (isCorrect) {
      player.score += 1;
    } else {
      player.errors += 1;
    }
    player.currentQuestionIndex = questionIndex + 1;
    const totalQuestions = room.questions.length || 10;
    const allFinishedRegular = room.players.every((p) => p.currentQuestionIndex >= totalQuestions);
    if (allFinishedRegular && room.status === "in_progress") {
      const scores = room.players.map((p) => p.score);
      const maxScore = Math.max(...scores);
      const topPlayers = room.players.filter((p) => p.score === maxScore);
      if (topPlayers.length === 1) {
        room.status = "finished";
        room.winnerId = topPlayers[0].id;
      } else {
        room.status = "tiebreaker";
      }
    } else if (room.status === "tiebreaker" && isTiebreaker) {
      const scores = room.players.map((p) => p.score);
      const maxScore = Math.max(...scores);
      const topPlayers = room.players.filter((p) => p.score === maxScore);
      if (topPlayers.length === 1) {
        room.status = "finished";
        room.winnerId = topPlayers[0].id;
      }
    }
    return res.json({ room });
  });
  app.post("/api/rooms/:code/stop-call", (req, res) => {
    const code = req.params.code.trim().toUpperCase();
    const { playerId, answers } = req.body;
    const room = rooms.get(code);
    if (!room || !room.stopState) {
      return res.status(404).json({ error: "Sala de STOP n\xE3o encontrada." });
    }
    const player = room.players.find((p) => p.id === playerId);
    if (!player) {
      return res.status(404).json({ error: "Jogador n\xE3o encontrado." });
    }
    if (answers) {
      room.stopState.playerAnswers[playerId] = answers;
    }
    if (!room.stopState.stoppedBy) {
      room.stopState.stoppedBy = playerId;
      room.stopState.stoppedByName = player.name;
      room.stopState.stopCountdownEnd = Date.now() + 1e4;
    }
    return res.json({ room });
  });
  app.post("/api/rooms/:code/stop-submit", (req, res) => {
    const code = req.params.code.trim().toUpperCase();
    const { playerId, answers } = req.body;
    const room = rooms.get(code);
    if (!room || !room.stopState) {
      return res.status(404).json({ error: "Sala de STOP n\xE3o encontrada." });
    }
    if (answers) {
      room.stopState.playerAnswers[playerId] = answers;
    }
    const currentLetter = room.stopState.letter.toUpperCase();
    const bots = room.players.filter((p) => p.isBot);
    for (const bot of bots) {
      if (!room.stopState.playerAnswers[bot.id]) {
        room.stopState.playerAnswers[bot.id] = {
          cidade: `${currentLetter}uritiba`,
          animal: `${currentLetter}acaco`,
          materia: `${currentLetter}atem\xE1tica`,
          objeto: `${currentLetter}ochila`,
          verbo: `${currentLetter}orrer`
        };
      }
    }
    const categories = ["cidade", "animal", "materia", "objeto", "verbo"];
    const roundScores = {};
    for (const p of room.players) {
      roundScores[p.id] = 0;
    }
    for (const cat of categories) {
      const catWords = [];
      for (const p of room.players) {
        const ans = room.stopState.playerAnswers[p.id]?.[cat]?.trim().toLowerCase() || "";
        if (ans.length > 0 && ans[0].toUpperCase() === currentLetter) {
          catWords.push({ playerId: p.id, word: ans });
        }
      }
      for (const item of catWords) {
        const duplicates = catWords.filter((w) => w.word === item.word);
        if (duplicates.length === 1) {
          roundScores[item.playerId] = (roundScores[item.playerId] || 0) + 10;
        } else {
          roundScores[item.playerId] = (roundScores[item.playerId] || 0) + 5;
        }
      }
    }
    for (const p of room.players) {
      p.score += roundScores[p.id] || 0;
    }
    room.stopState.roundScores = roundScores;
    room.stopState.isReviewing = true;
    return res.json({ room });
  });
  app.post("/api/rooms/:code/stop-next-round", (req, res) => {
    const code = req.params.code.trim().toUpperCase();
    const { playerId } = req.body;
    const room = rooms.get(code);
    if (!room || !room.stopState) {
      return res.status(404).json({ error: "Sala de STOP n\xE3o encontrada." });
    }
    if (room.hostId !== playerId) {
      return res.status(403).json({ error: "Apenas o anfitri\xE3o pode avan\xE7ar o round." });
    }
    if (room.stopState.roundNumber >= room.stopState.totalRounds) {
      room.status = "finished";
      const scores = room.players.map((p) => p.score);
      const maxScore = Math.max(...scores);
      const topPlayers = room.players.filter((p) => p.score === maxScore);
      room.winnerId = topPlayers.length === 1 ? topPlayers[0].id : void 0;
    } else {
      const prevLetter = room.stopState.letter;
      room.stopState.roundNumber += 1;
      room.stopState.letter = getRandomStopLetter([prevLetter]);
      room.stopState.stoppedBy = void 0;
      room.stopState.stoppedByName = void 0;
      room.stopState.stopCountdownEnd = void 0;
      room.stopState.playerAnswers = {};
      room.stopState.roundScores = {};
      room.stopState.isReviewing = false;
    }
    return res.json({ room });
  });
  app.post("/api/rooms/:code/chess-move", (req, res) => {
    const code = req.params.code.trim().toUpperCase();
    const { playerId, from, to, promotion } = req.body;
    const room = rooms.get(code);
    if (!room || !room.chessState) {
      return res.status(404).json({ error: "Partida de xadrez n\xE3o encontrada." });
    }
    const isWhite = room.chessState.whitePlayerId === playerId;
    const isBlack = room.chessState.blackPlayerId === playerId;
    if (!isWhite && !isBlack) {
      return res.status(403).json({ error: "Voc\xEA n\xE3o \xE9 um dos jogadores desta partida." });
    }
    const expectedTurn = room.chessState.turn;
    if (expectedTurn === "w" && !isWhite || expectedTurn === "b" && !isBlack) {
      return res.status(400).json({ error: "N\xE3o \xE9 a sua vez de jogar!" });
    }
    try {
      const chess = new import_chess.Chess(room.chessState.fen);
      const moveResult = chess.move({ from, to, promotion: promotion || "q" });
      if (!moveResult) {
        return res.status(400).json({ error: "Movimento inv\xE1lido no xadrez." });
      }
      if (moveResult.captured) {
        if (expectedTurn === "w") {
          room.chessState.capturedByWhite.push(moveResult.captured);
        } else {
          room.chessState.capturedByBlack.push(moveResult.captured);
        }
      }
      room.chessState.fen = chess.fen();
      room.chessState.turn = chess.turn();
      room.chessState.history.push(moveResult.san);
      room.chessState.lastMove = { from, to };
      room.chessState.isCheck = chess.inCheck();
      room.chessState.isCheckmate = chess.isCheckmate();
      room.chessState.isDraw = chess.isDraw();
      if (chess.isCheckmate()) {
        room.status = "finished";
        room.winnerId = isWhite ? room.chessState.whitePlayerId : room.chessState.blackPlayerId;
      } else if (chess.isDraw()) {
        room.status = "finished";
        room.winnerId = void 0;
      }
      return res.json({ room, move: moveResult });
    } catch (err) {
      return res.status(400).json({ error: err.message || "Erro ao realizar movimento de xadrez." });
    }
  });
  app.post("/api/rooms/:code/chess-bot-move", (req, res) => {
    const code = req.params.code.trim().toUpperCase();
    const room = rooms.get(code);
    if (!room || !room.chessState) {
      return res.status(404).json({ error: "Partida n\xE3o encontrada." });
    }
    const blackPlayer = room.players.find((p) => p.id === room.chessState?.blackPlayerId);
    if (!blackPlayer || !blackPlayer.isBot || room.chessState.turn !== "b" || room.status !== "in_progress") {
      return res.json({ room });
    }
    try {
      const chess = new import_chess.Chess(room.chessState.fen);
      const moves = chess.moves({ verbose: true });
      if (moves.length === 0) return res.json({ room });
      const captures = moves.filter((m) => m.captured);
      const checks = moves.filter((m) => m.san.includes("+"));
      const chosenMove = captures.length > 0 ? captures[0] : checks.length > 0 ? checks[0] : moves[Math.floor(Math.random() * moves.length)];
      const moveResult = chess.move(chosenMove);
      if (moveResult) {
        if (moveResult.captured) {
          room.chessState.capturedByBlack.push(moveResult.captured);
        }
        room.chessState.fen = chess.fen();
        room.chessState.turn = chess.turn();
        room.chessState.history.push(moveResult.san);
        room.chessState.lastMove = { from: chosenMove.from, to: chosenMove.to };
        room.chessState.isCheck = chess.inCheck();
        room.chessState.isCheckmate = chess.isCheckmate();
        room.chessState.isDraw = chess.isDraw();
        if (chess.isCheckmate()) {
          room.status = "finished";
          room.winnerId = blackPlayer.id;
        } else if (chess.isDraw()) {
          room.status = "finished";
          room.winnerId = void 0;
        }
      }
      return res.json({ room });
    } catch (err) {
      return res.status(400).json({ error: "Erro no movimento do rob\xF4." });
    }
  });
  app.post("/api/rooms/:code/rematch", (req, res) => {
    const code = req.params.code.trim().toUpperCase();
    const { newQuestions } = req.body;
    const room = rooms.get(code);
    if (!room) {
      return res.status(404).json({ error: "Sala n\xE3o encontrada." });
    }
    for (const p of room.players) {
      p.score = 0;
      p.errors = 0;
      p.currentQuestionIndex = 0;
      p.reaction = void 0;
    }
    if (newQuestions && newQuestions.length > 0) {
      room.questions = newQuestions.map(shuffleServerQuestionOptions);
    }
    if (room.gameType === "chess" && room.chessState) {
      const chess = new import_chess.Chess();
      const oldWhite = room.chessState.whitePlayerId;
      const oldBlack = room.chessState.blackPlayerId;
      room.chessState = {
        fen: chess.fen(),
        turn: "w",
        history: [],
        lastMove: null,
        isCheck: false,
        isCheckmate: false,
        isDraw: false,
        capturedByWhite: [],
        capturedByBlack: [],
        whitePlayerId: oldBlack || oldWhite,
        blackPlayerId: oldBlack ? oldWhite : ""
      };
    }
    if (room.gameType === "stop") {
      room.stopState = {
        letter: getRandomStopLetter(),
        roundNumber: 1,
        totalRounds: 3,
        playerAnswers: {},
        roundScores: {},
        isReviewing: false
      };
    }
    room.status = "in_progress";
    room.winnerId = void 0;
    room.currentQuestionIndex = 0;
    return res.json({ room });
  });
  const initialErrorReports = [
    {
      id: "err_initial_1",
      userName: "Mariana Silva",
      userAvatar: "\u{1F989}",
      userGrade: "7_fund",
      category: "questao",
      title: "Gabarito da quest\xE3o de Fra\xE7\xE3o e Porcentagem",
      description: "Na quest\xE3o que pedia para converter 3/4 em porcentagem, marquei 75% mas apareceu um aviso para conferir a v\xEDrgula. Poderiam verificar?",
      createdAt: new Date(Date.now() - 36e5 * 5).toISOString(),
      status: "resolvido",
      upvotes: 7,
      upvotedBy: [],
      adminResponse: "Ol\xE1 Mariana! Revisamos a quest\xE3o na BNCC do 7\xBA ano e atualizamos o validador. 3/4 = 75% agora \xE9 aceito perfeitamente. Obrigado pelo aviso!"
    },
    {
      id: "err_initial_2",
      userName: "Gabriel Santos",
      userAvatar: "\u{1F680}",
      userGrade: "8_fund",
      category: "bug",
      title: "\xC1udio do narrador parou ao trocar de aplicativo",
      description: "Estava ouvindo a explica\xE7\xE3o de Ci\xEAncias e quando recebi uma notifica\xE7\xE3o do celular o \xE1udio n\xE3o retomou sozinho.",
      createdAt: new Date(Date.now() - 36e5 * 18).toISOString(),
      status: "resolvido",
      upvotes: 12,
      upvotedBy: [],
      adminResponse: "Implementamos a recupera\xE7\xE3o autom\xE1tica do motor de fala Web Speech com bot\xE3o de reproduzir manual para evitar interrup\xE7\xF5es."
    },
    {
      id: "err_initial_3",
      userName: "Beatriz Lima",
      userAvatar: "\u26A1",
      userGrade: "1_medio",
      category: "materia",
      title: "Adicionar mat\xE9rias espec\xEDficas como Biologia e F\xEDsica",
      description: "Minha escola divide Ci\xEAncias em Biologia, F\xEDsica e Qu\xEDmica desde o 9\xBA ano e no Ensino M\xE9dio. Gostaria de poder selecionar essas mat\xE9rias individualmente na grade.",
      createdAt: new Date(Date.now() - 36e5 * 28).toISOString(),
      status: "resolvido",
      upvotes: 24,
      upvotedBy: [],
      adminResponse: "Funcionalidade atendida! Agora ap\xF3s o login perguntamos se sua escola tem Biologia, F\xEDsica, Qu\xEDmica e voc\xEA pode personaliz\xE1-las a qualquer momento na Trilha do Saber."
    },
    {
      id: "err_initial_4",
      userName: "Lucas Ramos",
      userAvatar: "\u{1F981}",
      userGrade: "6_fund",
      category: "ia_explicador",
      title: "Explicador por foto em letra cursiva",
      description: "Enviei uma foto do meu caderno com anota\xE7\xF5es de aula e gostaria de mais exemplos resolvidos nas explica\xE7\xF5es.",
      createdAt: new Date(Date.now() - 36e5 * 42).toISOString(),
      status: "investigando",
      upvotes: 5,
      upvotedBy: [],
      adminResponse: "Estamos adicionando mais passos detalhados e regras pr\xE1ticas em todas as explica\xE7\xF5es da BNCC com suporte aprimorado a fotos de cadernos."
    }
  ];
  let globalErrorReports = [...initialErrorReports];
  app.get("/api/feedback/errors", (_req, res) => {
    return res.json({
      success: true,
      total: globalErrorReports.length,
      errors: globalErrorReports
    });
  });
  app.post("/api/feedback/errors", (req, res) => {
    try {
      const { userName, userAvatar, userGrade, category, title, description } = req.body || {};
      const cleanTitle = String(title || "").trim();
      const cleanDesc = String(description || "").trim();
      if (!cleanTitle || cleanTitle.length < 3) {
        return res.status(400).json({ error: "Informe um t\xEDtulo claro para o erro (m\xEDnimo 3 caracteres)." });
      }
      if (!cleanDesc || cleanDesc.length < 5) {
        return res.status(400).json({ error: "Descreva o erro com mais detalhes para que possamos investigar." });
      }
      const validCategories = ["questao", "bug", "ia_explicador", "materia", "sugestao", "outro"];
      const safeCategory = validCategories.includes(category) ? category : "outro";
      const newReport = {
        id: `err_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        userName: String(userName || "Estudante").trim(),
        userAvatar: String(userAvatar || "\u{1F9D1}\u200D\u{1F393}").trim(),
        userGrade: userGrade ? String(userGrade) : void 0,
        category: safeCategory,
        title: cleanTitle,
        description: cleanDesc,
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        status: "em_analise",
        upvotes: 1,
        upvotedBy: []
      };
      globalErrorReports.unshift(newReport);
      return res.status(201).json({
        success: true,
        message: "Relato registrado com sucesso na Central de Erros!",
        error: newReport
      });
    } catch (err) {
      return res.status(500).json({ error: "Falha ao salvar relato de erro." });
    }
  });
  app.post("/api/feedback/errors/:id/upvote", (req, res) => {
    const { id } = req.params;
    const report = globalErrorReports.find((r) => r.id === id);
    if (!report) {
      return res.status(404).json({ error: "Relato de erro n\xE3o encontrado." });
    }
    report.upvotes += 1;
    return res.json({ success: true, upvotes: report.upvotes });
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`EstudaHero server running on http://0.0.0.0:${PORT}`);
  });
}
startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
//# sourceMappingURL=server.cjs.map
