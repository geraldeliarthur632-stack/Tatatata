// Voice Answer Recognition Service for Trilha do Saber
// Supports speech recognition for choosing alternatives (A, B, C, D) or speaking the exact answer text
import { speechNarrator } from './speechNarrator';

export interface VoiceMatchResult {
  matchedIndex: number | null; // 0, 1, 2, 3 or null
  action: 'select' | 'submit' | 'next' | 'unknown';
  rawTranscript: string;
  matchedText?: string;
  confidence?: number;
}

const NUMBER_WORDS: Record<string, string> = {
  zero: '0',
  um: '1',
  uma: '1',
  primeiro: '1',
  primeira: '1',
  dois: '2',
  duas: '2',
  segundo: '2',
  segunda: '2',
  tres: '3',
  três: '3',
  terceiro: '3',
  terceira: '3',
  quatro: '4',
  quarto: '4',
  quarta: '4',
  cinco: '5',
  seis: '6',
  sete: '7',
  oito: '8',
  nove: '9',
  dez: '10',
};

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents
    .replace(/[^\w\s0-9]/g, ' ') // replace punctuation with spaces
    .replace(/\s+/g, ' ')
    .trim();
}

export function matchTranscriptToOption(
  transcript: string,
  options: string[]
): VoiceMatchResult {
  const raw = transcript.trim();
  const norm = normalizeText(raw);

  // Check navigation/submit commands
  if (
    norm === 'confirmar' ||
    norm === 'responder' ||
    norm === 'enviar' ||
    norm === 'confirmar resposta' ||
    norm === 'valida' ||
    norm === 'validar'
  ) {
    return { matchedIndex: null, action: 'submit', rawTranscript: raw };
  }

  if (
    norm === 'proxima' ||
    norm === 'proximo' ||
    norm === 'proxima questao' ||
    norm === 'proxima pergunta' ||
    norm === 'avancar' ||
    norm === 'continuar'
  ) {
    return { matchedIndex: null, action: 'next', rawTranscript: raw };
  }

  // 1. Direct Letter Match: "letra a", "a", "opcao a", "alternativa a"
  // Letra A (0)
  if (
    norm === 'a' ||
    norm === 'letra a' ||
    norm === 'opcao a' ||
    norm === 'alternativa a' ||
    norm === 'letra á' ||
    norm.startsWith('letra a ') ||
    norm.startsWith('opcao a ') ||
    norm.startsWith('alternativa a ') ||
    norm === 'primeira' ||
    norm === 'primeira opcao' ||
    norm === 'opcao 1' ||
    norm === 'alternativa 1' ||
    norm === 'numero 1'
  ) {
    return { matchedIndex: 0, action: 'select', rawTranscript: raw, matchedText: 'Opção A' };
  }

  // Letra B (1)
  if (
    norm === 'b' ||
    norm === 'be' ||
    norm === 'letra b' ||
    norm === 'opcao b' ||
    norm === 'alternativa b' ||
    norm.startsWith('letra b ') ||
    norm.startsWith('opcao b ') ||
    norm.startsWith('alternativa b ') ||
    norm === 'segunda' ||
    norm === 'segunda opcao' ||
    norm === 'opcao 2' ||
    norm === 'alternativa 2' ||
    norm === 'numero 2'
  ) {
    return { matchedIndex: 1, action: 'select', rawTranscript: raw, matchedText: 'Opção B' };
  }

  // Letra C (2)
  if (
    norm === 'c' ||
    norm === 'ce' ||
    norm === 'letra c' ||
    norm === 'opcao c' ||
    norm === 'alternativa c' ||
    norm.startsWith('letra c ') ||
    norm.startsWith('opcao c ') ||
    norm.startsWith('alternativa c ') ||
    norm === 'terceira' ||
    norm === 'terceira opcao' ||
    norm === 'opcao 3' ||
    norm === 'alternativa 3' ||
    norm === 'numero 3'
  ) {
    return { matchedIndex: 2, action: 'select', rawTranscript: raw, matchedText: 'Opção C' };
  }

  // Letra D (3)
  if (
    norm === 'd' ||
    raw.toLowerCase().trim() === 'd' ||
    raw.toLowerCase().trim() === 'dê' ||
    norm === 'letra d' ||
    norm === 'letra de' ||
    norm === 'opcao d' ||
    norm === 'opcao de' ||
    norm === 'alternativa d' ||
    norm === 'alternativa de' ||
    norm.startsWith('letra d ') ||
    norm.startsWith('letra de ') ||
    norm.startsWith('opcao d ') ||
    norm.startsWith('opcao de ') ||
    norm.startsWith('alternativa d ') ||
    norm.startsWith('alternativa de ') ||
    norm === 'quarta' ||
    norm === 'quarta opcao' ||
    norm === 'opcao 4' ||
    norm === 'alternativa 4' ||
    norm === 'numero 4'
  ) {
    return { matchedIndex: 3, action: 'select', rawTranscript: raw, matchedText: 'Opção D' };
  }

  // 2. Exact or content-based match against option texts
  let bestIndex: number | null = null;
  let bestScore = 0;

  const validOptions = Array.isArray(options) ? options : [];
  validOptions.forEach((opt, idx) => {
    const normOpt = normalizeText(opt);
    if (!normOpt) return;

    // Check exact equality
    if (norm === normOpt) {
      bestIndex = idx;
      bestScore = 100;
      return;
    }

    // Number replacement check (e.g., student said "cinco" and option is "5" or "5 maçãs")
    let transcriptWithNumbers = norm;
    Object.entries(NUMBER_WORDS).forEach(([word, digit]) => {
      const reg = new RegExp(`\\b${word}\\b`, 'g');
      transcriptWithNumbers = transcriptWithNumbers.replace(reg, digit);
    });

    let optWithNumbers = normOpt;
    Object.entries(NUMBER_WORDS).forEach(([word, digit]) => {
      const reg = new RegExp(`\\b${word}\\b`, 'g');
      optWithNumbers = optWithNumbers.replace(reg, digit);
    });

    if (transcriptWithNumbers === optWithNumbers) {
      bestIndex = idx;
      bestScore = 95;
      return;
    }

    // Option contained in transcript or vice-versa
    if (transcriptWithNumbers.includes(optWithNumbers) || optWithNumbers.includes(transcriptWithNumbers)) {
      const score = 80;
      if (score > bestScore) {
        bestScore = score;
        bestIndex = idx;
      }
      return;
    }

    // Word token overlap
    const transTokens = transcriptWithNumbers.split(' ').filter(Boolean);
    const optTokens = optWithNumbers.split(' ').filter(Boolean);
    const commonCount = transTokens.filter((t) => optTokens.includes(t)).length;
    if (commonCount > 0 && commonCount >= Math.min(transTokens.length, optTokens.length)) {
      const score = 60 + commonCount * 5;
      if (score > bestScore) {
        bestScore = score;
        bestIndex = idx;
      }
    }
  });

  if (bestIndex !== null && bestScore >= 60) {
    const letters = ['A', 'B', 'C', 'D'];
    return {
      matchedIndex: bestIndex,
      action: 'select',
      rawTranscript: raw,
      matchedText: `Opção ${letters[bestIndex]} (${options[bestIndex]})`,
    };
  }

  return { matchedIndex: null, action: 'unknown', rawTranscript: raw };
}

export class VoiceAnswerListener {
  private recognition: any = null;
  private isListening: boolean = false;
  private desiredListening: boolean = false;
  private onResultCallback?: (result: VoiceMatchResult) => void;
  private onErrorCallback?: (err: string) => void;
  private onStateChangeCallback?: (listening: boolean) => void;
  private currentOptions: string[] = [];
  private restartTimeout: any = null;

  constructor() {
    this.initRecognition();
    // Sempre que a IA for falar, para o reconhecimento para não colidir no hardware e não capturar o próprio áudio
    speechNarrator.registerOnBeforeSpeak(() => {
      if (this.isListening) {
        this.stopListening();
      }
    });
  }

  private initRecognition() {
    if (typeof window === 'undefined') return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      return;
    }

    try {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = false;
      this.recognition.lang = 'pt-BR';

      this.recognition.onstart = () => {
        this.isListening = true;
        this.onStateChangeCallback?.(true);
      };

      this.recognition.onresult = (event: any) => {
        const last = event.results.length - 1;
        const transcript = event.results[last][0]?.transcript;
        if (transcript && this.onResultCallback) {
          const match = matchTranscriptToOption(transcript, this.currentOptions);
          this.onResultCallback(match);
        }
      };

      this.recognition.onerror = (event: any) => {
        if (event.error === 'not-allowed') {
          this.desiredListening = false;
          this.onErrorCallback?.('Permissão de microfone negada no navegador.');
        } else if (event.error !== 'no-speech') {
          this.onErrorCallback?.(event.error);
        }
      };

      this.recognition.onend = () => {
        this.isListening = false;
        this.onStateChangeCallback?.(false);

        // Auto-reconnect if desired listening is still active
        if (this.desiredListening) {
          clearTimeout(this.restartTimeout);
          this.restartTimeout = setTimeout(() => {
            if (this.desiredListening && !this.isListening && this.recognition) {
              try {
                this.recognition.start();
              } catch {}
            }
          }, 150);
        }
      };
    } catch {
      this.recognition = null;
    }
  }

  public isSupported(): boolean {
    return typeof window !== 'undefined' && !!(
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    );
  }

  public setOptions(options: string[]) {
    this.currentOptions = options;
  }

  public startListening(
    options: string[],
    onResult: (result: VoiceMatchResult) => void,
    onStateChange?: (listening: boolean) => void,
    onError?: (err: string) => void
  ) {
    // Interrompe qualquer narração de voz ativa antes de abrir o microfone
    speechNarrator.stop();

    this.currentOptions = options;
    this.onResultCallback = onResult;
    this.onStateChangeCallback = onStateChange;
    this.onErrorCallback = onError;
    this.desiredListening = true;

    if (!this.recognition) {
      this.initRecognition();
    }

    if (!this.recognition) {
      onError?.('Reconhecimento de voz não suportado neste navegador.');
      return;
    }

    try {
      if (!this.isListening) {
        this.recognition.start();
      }
    } catch (err: any) {
      // If already started or transitioning
      if (!this.isListening) {
        try {
          this.recognition.stop();
          setTimeout(() => {
            if (this.desiredListening) {
              try {
                this.recognition.start();
              } catch {}
            }
          }, 200);
        } catch {}
      }
    }
  }

  public stopListening() {
    this.desiredListening = false;
    clearTimeout(this.restartTimeout);
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch {}
      this.isListening = false;
      this.onStateChangeCallback?.(false);
    }
  }

  public getIsListening(): boolean {
    return this.isListening;
  }
}

export const voiceAnswerListener = new VoiceAnswerListener();
