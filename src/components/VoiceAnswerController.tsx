import React, { useEffect, useState } from 'react';
import { Mic, MicOff, Volume2, Sparkles, CheckCircle2 } from 'lucide-react';
import { voiceAnswerListener, VoiceMatchResult } from '../services/voiceAnswerListener';
import { soundEffects } from '../services/soundEffects';

interface VoiceAnswerControllerProps {
  options: string[];
  selectedOption: number | null;
  isAnswerSubmitted: boolean;
  onSelectOption: (index: number) => void;
  onSubmitAnswer?: () => void;
  onNextQuestion?: () => void;
  autoSubmitOnVoice?: boolean;
  onCannotSpeak?: () => void;
  isTrueFalse?: boolean;
  promptVoicePhrase?: string;
}

export const VoiceAnswerController: React.FC<VoiceAnswerControllerProps> = ({
  options,
  selectedOption,
  isAnswerSubmitted,
  onSelectOption,
  onSubmitAnswer,
  onNextQuestion,
  autoSubmitOnVoice = false,
  onCannotSpeak,
  isTrueFalse = false,
  promptVoicePhrase,
}) => {
  const [isVoiceActive, setIsVoiceActive] = useState<boolean>(true);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [lastHeardText, setLastHeardText] = useState<string | null>(null);
  const [feedbackBanner, setFeedbackBanner] = useState<{
    text: string;
    type: 'success' | 'info' | 'error';
  } | null>(null);

  const isSupported = voiceAnswerListener.isSupported();

  // Update current options in recognition service when options change
  useEffect(() => {
    voiceAnswerListener.setOptions(options);
  }, [options]);

  // Start or stop listening based on isVoiceActive and submission state
  useEffect(() => {
    if (!isSupported || !isVoiceActive) {
      voiceAnswerListener.stopListening();
      setIsListening(false);
      return;
    }

    const handleVoiceResult = (res: VoiceMatchResult) => {
      setLastHeardText(res.rawTranscript);

      if (res.action === 'select' && res.matchedIndex !== null) {
        if (!isAnswerSubmitted) {
          soundEffects.playClick();
          onSelectOption(res.matchedIndex);
          const letters = isTrueFalse ? ['Verdadeiro (V)', 'Falso (F)'] : ['A', 'B', 'C', 'D'];
          setFeedbackBanner({
            text: `Reconhecido: "${res.rawTranscript}" ➔ Opção ${letters[res.matchedIndex] || res.matchedIndex + 1}`,
            type: 'success',
          });

          if (autoSubmitOnVoice && onSubmitAnswer) {
            setTimeout(() => {
              onSubmitAnswer();
            }, 800);
          }
        }
      } else if (res.action === 'submit') {
        if (!isAnswerSubmitted && selectedOption !== null && onSubmitAnswer) {
          soundEffects.playClick();
          setFeedbackBanner({
            text: `Comando por voz: "Confirmar Resposta"`,
            type: 'info',
          });
          onSubmitAnswer();
        }
      } else if (res.action === 'next') {
        if (isAnswerSubmitted && onNextQuestion) {
          soundEffects.playClick();
          setFeedbackBanner({
            text: `Comando por voz: "Próxima Pergunta"`,
            type: 'info',
          });
          onNextQuestion();
        }
      } else if (res.rawTranscript) {
        const hintPrompt = isTrueFalse ? 'Diga: "Verdadeiro" ou "Falso"' : 'Diga: Letra A, B, C, D ou o texto da resposta';
        setFeedbackBanner({
          text: `Ouvido: "${res.rawTranscript}" (${hintPrompt})`,
          type: 'info',
        });
      }
    };

    voiceAnswerListener.startListening(
      options,
      handleVoiceResult,
      (listening) => setIsListening(listening),
      (err) => {
        console.warn('Voice recognition:', err);
      }
    );

    return () => {
      voiceAnswerListener.stopListening();
    };
  }, [isVoiceActive, isSupported, options, isAnswerSubmitted, selectedOption, onSelectOption, onSubmitAnswer, onNextQuestion, autoSubmitOnVoice, isTrueFalse]);

  // Clear banner after 4 seconds
  useEffect(() => {
    if (feedbackBanner) {
      const timer = setTimeout(() => {
        setFeedbackBanner(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [feedbackBanner]);

  const toggleVoice = () => {
    soundEffects.playClick();
    if (isVoiceActive) {
      voiceAnswerListener.stopListening();
      setIsVoiceActive(false);
      setIsListening(false);
      setFeedbackBanner({
        text: 'Microfone pausado. Você pode responder tocando nas opções.',
        type: 'info',
      });
    } else {
      setIsVoiceActive(true);
      setFeedbackBanner({
        text: isTrueFalse ? 'Microfone ativado! Diga "Verdadeiro" ou "Falso".' : 'Microfone ativado! Fale a letra (A, B, C, D) ou a resposta.',
        type: 'success',
      });
    }
  };

  const handleSkipVoice = () => {
    soundEffects.playClick();
    if (onCannotSpeak) {
      onCannotSpeak();
    } else {
      setIsVoiceActive(false);
      voiceAnswerListener.stopListening();
      setFeedbackBanner({
        text: 'Modo por voz desativado. Você pode assinalar a resposta na tela!',
        type: 'info',
      });
    }
  };

  return (
    <div className="w-full my-2">
      <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 shadow-xs backdrop-blur-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            type="button"
            onClick={toggleVoice}
            className={`relative flex items-center justify-center w-9 h-9 rounded-lg font-medium transition-all ${
              isVoiceActive && isListening
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30 ring-2 ring-emerald-400/60 animate-pulse'
                : isVoiceActive
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-700'
            }`}
            title={isVoiceActive ? 'Pausar microfone' : 'Ativar microfone automático'}
          >
            {isVoiceActive ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
          </button>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {isVoiceActive ? '🎙️ Microfone Automático' : 'Resposta por Voz'}
              </span>
              {isVoiceActive && (
                <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                  isListening 
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 animate-pulse'
                    : 'bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300'
                }`}>
                  {isListening ? 'Ouvindo...' : 'Pronto'}
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              {promptVoicePhrase
                ? `Fale em voz alta: "${promptVoicePhrase}"`
                : isTrueFalse
                ? 'Diga "Verdadeiro" ou "Falso"'
                : isVoiceActive
                ? 'Diga a letra (A, B, C, D) ou a resposta'
                : 'Microfone pausado (toque para reativar)'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* BOTÃO OBRIGATÓRIO: NÃO CONSIGO FALAR AGORA */}
          <button
            type="button"
            onClick={handleSkipVoice}
            className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-800 rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-2xs active:scale-95"
            title="Pular pergunta de voz e responder assinalando ou Verdadeiro/Falso"
          >
            <MicOff className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
            <span>Não consigo falar agora</span>
          </button>
        </div>
      </div>

      {feedbackBanner && (
        <div
          className={`mt-1.5 px-3 py-1.5 rounded-lg text-xs flex items-center gap-2 transition-all animate-fadeIn ${
            feedbackBanner.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
              : feedbackBanner.type === 'error'
              ? 'bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800'
              : 'bg-blue-50 text-blue-800 border border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 shrink-0 text-current" />
          <span className="font-medium truncate">{feedbackBanner.text}</span>
        </div>
      )}
    </div>
  );
};
