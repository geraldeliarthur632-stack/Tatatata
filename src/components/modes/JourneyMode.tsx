import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, GradeLevel, SubjectId, TopicLesson, Question } from '../../types';
import { GRADE_LABELS, SAMPLE_LESSONS, SUBJECTS, shuffleQuestionOptions, shuffleQuestionsList } from '../../data/curriculumData';
import { soundEffects } from '../../services/soundEffects';
import { speechNarrator } from '../../services/speechNarrator';
import { reportCardService, SubjectEstimatedGrade } from '../../services/reportCardService';
import { mistakesTrackerService } from '../../services/mistakesTrackerService';
import { VoiceAnswerController } from '../VoiceAnswerController';
import { QuestionTheoryGuideModal } from '../QuestionTheoryGuideModal';
import {
  ArrowLeft,
  BookOpen,
  Sparkles,
  ChevronRight,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  CheckCircle2,
  XCircle,
  Play,
  Pause,
  Award,
  RotateCcw,
  Zap,
  Lightbulb,
  TrendingUp,
  AlertTriangle,
  SlidersHorizontal,
} from 'lucide-react';
import { getSubjectsForGrade } from '../../data/curriculumData';

interface JourneyModeProps {
  user: UserProfile;
  initialSubjectId?: SubjectId;
  onBack: () => void;
  onFinishLesson?: (score: number) => void;
  onEarnPoints?: (points: number, isMajorChallenge?: boolean, questionsCount?: number) => void;
  onAnswerCorrect?: () => void;
  onOpenSubjectCustomization?: () => void;
  onOpenErrorFeedback?: (topic?: string) => void;
}

type LessonPlan = TopicLesson;

type JourneyStep = 'subject_select' | 'lesson_intro' | 'quiz' | 'summary';

const SUBJECT_NAMES_MAP: Record<string, string> = {
  matematica: 'Matemática',
  portugues: 'Língua Portuguesa',
  ingles: 'Língua Inglesa',
  ciencias: 'Ciências da Natureza',
  historia: 'História',
  geografia: 'Geografia',
  artes: 'Artes',
  filosofia: 'Filosofia',
  fisica: 'Física',
  quimica: 'Química',
  biologia: 'Biologia',
  xadrez: 'Xadrez',
  espanhol: 'Espanhol',
  italiano: 'Italiano',
};

const SUBJECT_LIST: {
  id: SubjectId;
  name: string;
  icon: string;
  iconBg: string;
  accentColor: string;
  description: string;
}[] = [
  {
    id: 'matematica',
    name: 'Matemática',
    icon: '🔢',
    iconBg: 'bg-indigo-600',
    accentColor: 'border-indigo-500 text-indigo-400',
    description: 'Cálculos, frações, álgebra, geometria e resolução de problemas.',
  },
  {
    id: 'portugues',
    name: 'Português',
    icon: '📚',
    iconBg: 'bg-emerald-600',
    accentColor: 'border-emerald-500 text-emerald-400',
    description: 'Gramática, interpretação de texto, ortografia e redação.',
  },
  {
    id: 'ciencias',
    name: 'Ciências',
    icon: '🔬',
    iconBg: 'bg-cyan-600',
    accentColor: 'border-cyan-500 text-cyan-400',
    description: 'Corpo humano, ecossistemas, física básica e reações químicas.',
  },
  {
    id: 'biologia',
    name: 'Biologia',
    icon: '🧬',
    iconBg: 'bg-emerald-600',
    accentColor: 'border-emerald-500 text-emerald-400',
    description: 'Citologia, ecologia, seres vivos, genética e evolução humana.',
  },
  {
    id: 'fisica',
    name: 'Física',
    icon: '⚡',
    iconBg: 'bg-sky-600',
    accentColor: 'border-sky-500 text-sky-400',
    description: 'Cinemática, forças, energia, óptica, ondas e termologia.',
  },
  {
    id: 'quimica',
    name: 'Química',
    icon: '🧪',
    iconBg: 'bg-purple-600',
    accentColor: 'border-purple-500 text-purple-400',
    description: 'Átomos, tabela periódica, ligações químicas e reações.',
  },
  {
    id: 'historia',
    name: 'História',
    icon: '🏛️',
    iconBg: 'bg-amber-600',
    accentColor: 'border-amber-500 text-amber-400',
    description: 'Civilizações antigas, Brasil Colônia, guerras mundiais e cidadania.',
  },
  {
    id: 'geografia',
    name: 'Geografia',
    icon: '🌍',
    iconBg: 'bg-blue-600',
    accentColor: 'border-blue-500 text-blue-400',
    description: 'Relevo, clima, cartografia, geopolítica e urbanização.',
  },
  {
    id: 'ingles',
    name: 'Inglês',
    icon: '🇬🇧',
    iconBg: 'bg-rose-600',
    accentColor: 'border-rose-500 text-rose-400',
    description: 'Vocabulário, tempos verbais, conversação e interpretação.',
  },
  {
    id: 'artes',
    name: 'Artes',
    icon: '🎨',
    iconBg: 'bg-pink-600',
    accentColor: 'border-pink-500 text-pink-400',
    description: 'História da arte, cores, expressões culturais e movimentos visuais.',
  },
  {
    id: 'espanhol',
    name: 'Espanhol (Do Zero)',
    icon: '🇪🇸',
    iconBg: 'bg-amber-600',
    accentColor: 'border-amber-500 text-amber-400',
    description: 'Começando do zero: saudações, primeiras palavras, números e pronúncia.',
  },
  {
    id: 'italiano',
    name: 'Italiano (Do Zero)',
    icon: '🇮🇹',
    iconBg: 'bg-emerald-600',
    accentColor: 'border-emerald-500 text-emerald-400',
    description: 'Começando do zero: primeiras palavras, sons especiais (GLI, GN, C/CH) e saudações.',
  },
  {
    id: 'xadrez',
    name: 'Xadrez & Raciocínio',
    icon: '♟️',
    iconBg: 'bg-slate-700',
    accentColor: 'border-slate-500 text-slate-300',
    description: 'Táticas, aberturas, cálculo e visão posicional.',
  },
];

export const JourneyMode: React.FC<JourneyModeProps> = ({
  user,
  initialSubjectId,
  onBack,
  onFinishLesson,
  onEarnPoints,
  onAnswerCorrect,
  onOpenSubjectCustomization,
  onOpenErrorFeedback,
}) => {
  const [selectedSubject, setSelectedSubject] = useState<SubjectId>(
    initialSubjectId || 'matematica'
  );
  const [currentStep, setCurrentStep] = useState<JourneyStep>('subject_select');
  const [activeLesson, setActiveLesson] = useState<LessonPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Preparando sua aula com IA...');

  // Set initial subject when provided from external launcher (e.g. Next Study Reminder card)
  useEffect(() => {
    if (initialSubjectId) {
      setSelectedSubject(initialSubjectId);
    }
  }, [initialSubjectId]);

  // Ensure selectedSubject is valid for current grade and custom subjects
  useEffect(() => {
    const available = getSubjectsForGrade(user.grade, user.customSubjects);
    if (available.length > 0 && !available.some((s) => s.id === selectedSubject)) {
      setSelectedSubject(available[0].id);
    }
  }, [user.grade, user.customSubjects, selectedSubject]);

  // Quiz state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [sessionCorrectCount, setSessionCorrectCount] = useState(0);
  const [isTheoryGuideOpen, setIsTheoryGuideOpen] = useState(false);
  const [estimatedGrade, setEstimatedGrade] = useState<SubjectEstimatedGrade>(() =>
    reportCardService.getEstimatedSubjectGrade(selectedSubject)
  );

  // Audio / Speech State
  const [isSpeakingExplanation, setIsSpeakingExplanation] = useState(false);
  const [isSpeakingQuestion, setIsSpeakingQuestion] = useState(false);
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Fallback lesson builder
  const getFallbackLesson = (subjId: SubjectId): LessonPlan => {
    // Try finding in sample lessons
    const found = SAMPLE_LESSONS.find((l) => l.subject === subjId && l.grade === user.grade) ||
                  SAMPLE_LESSONS.find((l) => l.subject === subjId);
    if (found) {
      return {
        id: found.id,
        subject: found.subject,
        grade: user.grade,
        title: found.title,
        summary: found.summary,
        detailedExplanation: `${found.summary}\n\n${found.keyPoints?.map((p, i) => `${i + 1}. ${p}`).join('\n') || ''}\n\nExemplo: ${found.example || ''}`,
        keyPoints: found.keyPoints || [],
        example: found.example || '',
        practiceQuestions: shuffleQuestionsList(found.practiceQuestions || []),
      };
    }

    const subjName = SUBJECT_NAMES_MAP[subjId] || 'Matéria';
    const lessonResult: LessonPlan = {
      id: `lesson_${subjId}_${user.grade}`,
      subject: subjId,
      grade: user.grade,
      title: `${subjName}: Fundamentos e Aplicação Prática`,
      summary: `Nesta aula especial de ${subjName}, você aprenderá as regras fundamentais, conceitos principais e como aplicar os conhecimentos em exercícios práticos da BNCC.`,
      detailedExplanation: `O estudo de ${subjName} é essencial para o desenvolvimento do raciocínio lógico e interpretação.\n\n` +
        `1. **Conceito Central**: Compreender o funcionamento das regras e definições básicas.\n` +
        `2. **Aplicação Prática**: Como analisar enunciados e resolver questões com segurança.\n` +
        `3. **Dicas de Ouro**: Leia com atenção cada alternativa e elimine as opções incorretas.`,
      keyPoints: [
        'Leia o enunciado com atenção identificando os dados principais.',
        'Aplique a fórmula ou regra gramatical correspondente.',
        'Revise a resposta antes de confirmar a alternativa final.',
      ],
      example: `Exemplo Prático de ${subjName}: Ao analisar um problema, separe o que é pedido e resolva etapa por etapa para garantir 100% de precisão!`,
      practiceQuestions: [
        {
          id: `q_1_${subjId}`,
          subject: subjId,
          grade: user.grade,
          topic: subjName,
          question: `Qual é o princípio fundamental no estudo de ${subjName}?`,
          options: [
            'Compreender o conceito e aplicar o método passo a passo',
            'Chutar respostas aleatoriamente sem ler',
            'Ignorar as regras e fórmulas ensinadas',
            'Decorar apenas sem entender o raciocínio',
          ],
          correctIndex: 0,
          explanation: 'Compreender o conceito básico e aplicar o método passo a passo é a melhor forma de aprender de verdade e garantir o sucesso escolar.',
          difficulty: 'easy',
        },
        {
          id: `q_2_${subjId}`,
          subject: subjId,
          grade: user.grade,
          topic: subjName,
          question: `Em uma questão desafiadora de ${subjName}, qual é o primeiro passo recomendado?`,
          options: [
            'Ler com atenção e destacar as informações principais',
            'Responder imediatamente a primeira opção que ver',
            'Pular a questão sem tentar resolver',
            'Chutar a alternativa D sem pensar',
          ],
          correctIndex: 0,
          explanation: 'Ler o enunciado atentamente e destacar as informações principais evita pegadinhas e orienta o raciocínio correto.',
          difficulty: 'medium',
        },
        {
          id: `q_3_${subjId}`,
          subject: subjId,
          grade: user.grade,
          topic: subjName,
          question: `Por que revisar os conceitos teóricos antes dos exercícios melhora o aprendizado?`,
          options: [
            'Porque solidifica a memória e prepara a mente para a prática',
            'Porque não tem utilidade nenhuma',
            'Porque só serve para gastar tempo',
            'Porque o aprendizado não precisa de teoria',
          ],
          correctIndex: 0,
          explanation: 'A teoria e os exemplos guiam a compreensão lógica necessária para acertar qualquer tipo de questão na prova.',
          difficulty: 'easy',
        },
        {
          id: `q_4_${subjId}`,
          subject: subjId,
          grade: user.grade,
          topic: subjName,
          question: `Qual a melhor estratégia ao se deparar com alternativas parecidas?`,
          options: [
            'Eliminar as comprovadamente erradas e comparar as restantes',
            'Escolher na sorte',
            'Desistir da questão',
            'Marcar qualquer uma rápido',
          ],
          correctIndex: 0,
          explanation: 'A técnica de eliminação lógica reduz as opções e aumenta exponencialmente as chances de acerto.',
          difficulty: 'medium',
        },
        {
          id: `q_5_${subjId}`,
          subject: subjId,
          grade: user.grade,
          topic: subjName,
          question: `O que significa ter domínio no conteúdo de ${subjName}?`,
          options: [
            'Saber explicar o porquê da resposta e resolver com segurança',
            'Apenas acertar por coincidência',
            'Copiar a resposta de outros sem entender',
            'Saber apenas o título da matéria',
          ],
          correctIndex: 0,
          explanation: 'Dominar uma matéria significa ser capaz de explicar o raciocínio e resolver problemas semelhantes de forma independente.',
          difficulty: 'hard',
        },
      ],
    };
    lessonResult.practiceQuestions = shuffleQuestionsList(lessonResult.practiceQuestions || []);
    return lessonResult;
  };

  // Start Journey for selected subject - Instant loading without delay
  const handleStartJourney = () => {
    soundEffects.playClick();
    const subjName = SUBJECT_NAMES_MAP[selectedSubject] || 'Matéria';

    // Curated high quality lesson with randomized options is ready instantly
    const lesson = getFallbackLesson(selectedSubject);

    setIsLoading(false);
    setActiveLesson(lesson);
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setSessionCorrectCount(0);
    setCurrentStep('lesson_intro');

    // Auto narrate the lesson introduction if supported
    const fullSpeechText = `Aula de ${subjName}. ${lesson.title}. ${lesson.summary}. Regras principais: ${(lesson.keyPoints || []).join('. ')}. Exemplo: ${lesson.example || ''}`;
    try {
      speechNarrator.speak(
        fullSpeechText,
        () => setIsSpeakingExplanation(true),
        () => setIsSpeakingExplanation(false),
        undefined,
        1.05
      );
    } catch {}
  };

  // Toggle narration in theory screen
  const toggleExplanationSpeech = () => {
    soundEffects.playClick();
    if (isSpeakingExplanation) {
      speechNarrator.stop();
      setIsSpeakingExplanation(false);
    } else if (activeLesson) {
      const fullSpeechText = `${activeLesson.title}. ${activeLesson.summary}. ${activeLesson.detailedExplanation}. Dicas: ${(activeLesson.keyPoints || []).join('. ')}. ${activeLesson.example || ''}`;
      speechNarrator.speak(
        fullSpeechText,
        () => setIsSpeakingExplanation(true),
        () => setIsSpeakingExplanation(false),
        undefined,
        1.05
      );
    }
  };

  // Go to Quiz from Lesson Intro
  const handleProceedToQuiz = () => {
    soundEffects.playClick();
    speechNarrator.stop();
    setIsSpeakingExplanation(false);
    setCurrentStep('quiz');
  };

  const currentQ = activeLesson?.practiceQuestions?.[currentQuestionIndex];

  // Auto-speak question when entering quiz or navigating to next question
  useEffect(() => {
    if (currentStep === 'quiz' && currentQ && !isAnswerSubmitted) {
      const timer = setTimeout(() => {
        speechNarrator.speakQuestion({
          questionIndex: currentQuestionIndex,
          questionText: currentQ.question || (currentQ as any).text,
          options: currentQ.options || [],
          onStart: () => setIsSpeakingQuestion(true),
          onEnd: () => setIsSpeakingQuestion(false),
        });
      }, 300);
      return () => {
        clearTimeout(timer);
        speechNarrator.stop();
        setIsSpeakingQuestion(false);
      };
    }
  }, [currentStep, currentQuestionIndex, isAnswerSubmitted, currentQ?.id]);

  // Speak Current Question manually or replay
  const handleSpeakQuestion = () => {
    if (!currentQ) return;
    soundEffects.playClick();

    if (isSpeakingQuestion) {
      speechNarrator.stop();
      setIsSpeakingQuestion(false);
      return;
    }

    speechNarrator.speakQuestion({
      questionIndex: currentQuestionIndex,
      questionText: currentQ.question || (currentQ as any).text,
      options: currentQ.options || [],
      force: true,
      onStart: () => setIsSpeakingQuestion(true),
      onEnd: () => setIsSpeakingQuestion(false),
    });
  };

  // Voice recognition for answering question (A, B, C, D)
  const handleVoiceAnswer = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      soundEffects.playError();
      return;
    }

    if (isVoiceListening) {
      recognitionRef.current?.stop();
      setIsVoiceListening(false);
      return;
    }

    // Interrompe imediatamente qualquer leitura de voz da IA para liberar o microfone sem conflitos de hardware
    speechNarrator.stop();
    setIsSpeakingQuestion(false);

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'pt-BR';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsVoiceListening(true);
        soundEffects.playClick();
      };

      recognition.onresult = (event: any) => {
        const transcript = (event.results[0][0].transcript || '').toLowerCase().trim();
        setIsVoiceListening(false);

        if (!currentQ || isAnswerSubmitted) return;

        let detectedIndex: number | null = null;

        // Check for A, B, C, D
        if (transcript.includes('letra a') || transcript === 'a' || transcript.includes('opção a') || transcript.includes('primeira') || transcript === 'um' || transcript === '1') {
          detectedIndex = 0;
        } else if (transcript.includes('letra b') || transcript === 'b' || transcript.includes('opção b') || transcript.includes('segunda') || transcript === 'dois' || transcript === '2') {
          detectedIndex = 1;
        } else if (transcript.includes('letra c') || transcript === 'c' || transcript.includes('opção c') || transcript.includes('terceira') || transcript === 'três' || transcript === '3') {
          detectedIndex = 2;
        } else if (transcript.includes('letra d') || transcript === 'd' || transcript.includes('opção d') || transcript.includes('quarta') || transcript === 'quatro' || transcript === '4') {
          detectedIndex = 3;
        } else {
          // Check matching text with options
          currentQ.options.forEach((opt, idx) => {
            if (transcript.includes(opt.toLowerCase()) || opt.toLowerCase().includes(transcript)) {
              detectedIndex = idx;
            }
          });
        }

        if (detectedIndex !== null && detectedIndex < currentQ.options.length) {
          handleSelectOption(detectedIndex);
        } else {
          soundEffects.playError();
        }
      };

      recognition.onerror = () => {
        setIsVoiceListening(false);
      };

      recognition.onend = () => {
        setIsVoiceListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (_e) {
      setIsVoiceListening(false);
    }
  };

  const handleSelectOption = (idx: number) => {
    if (isAnswerSubmitted) return;
    soundEffects.playClick();
    setSelectedOption(idx);
    setIsAnswerSubmitted(true);

    const isCorrect = idx === currentQ?.correctIndex;
    if (isCorrect) {
      soundEffects.playCorrect();
      setSessionCorrectCount((prev) => prev + 1);
      onAnswerCorrect?.();
      onEarnPoints?.(15, false, 1);
    } else {
      soundEffects.playError();
    }

    // Update simulated grade for this subject based on Journey exercise results
    try {
      const updatedEstimate = reportCardService.recordJourneyExerciseResult(
        currentSubjectMeta.id,
        currentSubjectMeta.name,
        isCorrect
      );
      setEstimatedGrade(updatedEstimate);
    } catch {}

    // Track attempt in academic mistakes diagnostic service
    try {
      if (currentQ) {
        mistakesTrackerService.recordAttempt({
          questionText: currentQ.text,
          subjectId: currentSubjectMeta.id,
          subjectName: currentSubjectMeta.name,
          topic: activeLesson?.topic || currentSubjectMeta.name,
          isCorrect,
          grade: user.grade,
          userChoice: currentQ.options[idx],
          correctChoice: currentQ.options[currentQ.correctIndex],
          explanation: currentQ.explanation,
        });
      }
    } catch {}
  };

  const handleNextQuestion = () => {
    soundEffects.playClick();
    speechNarrator.stop();

    if (!activeLesson) return;

    const totalQuestions = activeLesson.practiceQuestions.length;
    if (currentQuestionIndex + 1 >= totalQuestions) {
      setCurrentStep('summary');
      onFinishLesson?.(sessionCorrectCount);
      onEarnPoints?.(60, true, 0);
      return;
    }

    setCurrentQuestionIndex((prev) => prev + 1);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
  };

  const currentSubjectMeta = SUBJECT_LIST.find((s) => s.id === selectedSubject) || SUBJECT_LIST[0];

  return (
    <div className="flex-1 flex flex-col p-4 bg-[#070a12] max-w-lg mx-auto w-full pb-20 select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => {
            soundEffects.playClick();
            speechNarrator.stop();
            if (currentStep === 'quiz' || currentStep === 'lesson_intro') {
              setCurrentStep('subject_select');
            } else if (currentStep === 'summary') {
              setCurrentStep('subject_select');
            } else {
              onBack();
            }
          }}
          className="p-2.5 rounded-2xl bg-[#121829] hover:bg-[#161f38] text-slate-300 hover:text-white border border-[#1e293b] transition"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        {currentStep === 'subject_select' && (
          <div className="text-center">
            <h1 className="text-sm font-black text-white">Continuar Jornada</h1>
            <span className="text-[10px] text-slate-400 font-semibold">
              {GRADE_LABELS[user.grade]?.short || 'Ensino Fundamental'}
            </span>
          </div>
        )}

        {currentStep === 'lesson_intro' && (
          <div className="text-center">
            <h1 className="text-sm font-black text-white">Explicação da Aula</h1>
            <span className="text-[10px] text-[#c084fc] font-bold">
              {currentSubjectMeta.name}
            </span>
          </div>
        )}

        {currentStep === 'quiz' && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-white bg-[#121829] border border-[#1e293b] px-3 py-1 rounded-full">
              Questão {currentQuestionIndex + 1} de {activeLesson?.practiceQuestions?.length || 10}
            </span>
          </div>
        )}

        <div className="w-9" />
      </div>

      {/* LOADING SCREEN */}
      {isLoading && (
        <div className="flex-1 flex flex-col items-center justify-center space-y-4 my-auto">
          <div className="relative">
            <div className="w-16 h-16 rounded-3xl bg-[#8b5cf6]/20 border border-[#8b5cf6]/50 flex items-center justify-center text-3xl animate-bounce">
              {currentSubjectMeta.icon}
            </div>
            <div className="absolute -inset-2 rounded-3xl border border-[#8b5cf6]/30 animate-ping pointer-events-none" />
          </div>
          <p className="text-sm font-bold text-white text-center animate-pulse">
            {loadingText}
          </p>
          <p className="text-xs text-slate-400 text-center max-w-xs">
            Gerando teoria personalizada, regras práticas e questões da BNCC...
          </p>
        </div>
      )}

      {/* STEP 1: SUBJECT SELECT WITH SINGLE CONTINUAR BUTTON */}
      {!isLoading && currentStep === 'subject_select' && (() => {
        const userSubjects = getSubjectsForGrade(user.grade, user.customSubjects);
        const allowedSubjectIds = new Set(userSubjects.map((s) => s.id));
        const filteredSubjectList = SUBJECT_LIST.filter((s) => allowedSubjectIds.has(s.id));

        return (
          <div className="flex-1 flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              {/* Title / Description */}
              <div className="p-4 rounded-3xl bg-[#121829] border border-[#1e293b] space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#c084fc]">
                    Escolha a Matéria
                  </span>
                  {onOpenSubjectCustomization && (
                    <button
                      onClick={() => {
                        soundEffects.playClick();
                        onOpenSubjectCustomization();
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-md shadow-indigo-500/20 text-xs font-bold transition active:scale-95 cursor-pointer"
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5" />
                      <span>Editar Matérias</span>
                    </button>
                  )}
                </div>
                <h2 className="text-base font-black text-white">
                  O que vamos aprender hoje?
                </h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Selecione a disciplina e clique em Continuar para ver a explicação com voz da IA antes das perguntas.
                </p>
              </div>

              {/* Subjects Grid */}
              <div className="grid grid-cols-2 gap-2.5">
                {filteredSubjectList.map((subj) => {
                  const isSelected = selectedSubject === subj.id;
                  return (
                    <button
                      key={subj.id}
                      onClick={() => {
                        soundEffects.playClick();
                        setSelectedSubject(subj.id);
                      }}
                      className={`p-3.5 rounded-2xl border text-left transition-all flex items-center gap-3 active:scale-[0.98] cursor-pointer ${
                        isSelected
                          ? 'bg-[#161f38] border-[#8b5cf6] shadow-[0_0_15px_rgba(139,92,246,0.3)] ring-1 ring-[#8b5cf6]'
                          : 'bg-[#121829] border-[#1e293b] hover:border-slate-600 opacity-90 hover:opacity-100'
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-xl ${subj.iconBg} flex items-center justify-center text-lg shadow-md shrink-0`}
                      >
                        {subj.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3
                          className={`text-xs font-black truncate ${
                            isSelected ? 'text-white' : 'text-slate-200'
                          }`}
                        >
                          {subj.name}
                        </h3>
                        <span className="text-[10px] text-slate-400 font-semibold block">
                          BNCC {GRADE_LABELS[user.grade]?.short || '6º ano'}
                        </span>
                      </div>
                    </button>
                  );
                })}

                {/* Botão de Adicionar / Editar Matérias no Grid */}
                {onOpenSubjectCustomization && (
                  <button
                    onClick={() => {
                      soundEffects.playClick();
                      onOpenSubjectCustomization();
                    }}
                    className="p-3.5 rounded-2xl border-2 border-dashed border-indigo-500/40 hover:border-indigo-400 bg-indigo-950/20 hover:bg-indigo-950/40 text-left transition-all flex items-center gap-3 active:scale-[0.98] cursor-pointer group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center text-base shadow-md group-hover:scale-105 transition shrink-0">
                      ➕
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-xs font-black text-indigo-200 group-hover:text-white truncate">
                        Editar Matérias
                      </h3>
                      <span className="text-[10px] text-indigo-300/80 font-semibold block leading-tight">
                        Adicionar Ciências
                      </span>
                    </div>
                  </button>
                )}
              </div>

              {/* Active Subject Summary Card */}
              <div className="p-4 rounded-3xl bg-[#121829] border border-[#1e293b] flex items-center gap-3.5">
                <div
                  className={`w-12 h-12 rounded-2xl ${currentSubjectMeta.iconBg} flex items-center justify-center text-2xl shadow-lg shrink-0`}
                >
                  {currentSubjectMeta.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-black text-white">
                      {currentSubjectMeta.name}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-[#8b5cf6]/20 border border-[#8b5cf6]/40 text-[#c084fc] text-[9px] font-black">
                      IA Pronta
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-snug mt-0.5 line-clamp-2">
                    {currentSubjectMeta.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Prominent Continuar Button */}
            <div className="pt-2">
              <button
                onClick={handleStartJourney}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#6366f1] via-[#7c3aed] to-[#8b5cf6] hover:from-[#4f46e5] hover:to-[#7c3aed] text-white font-black text-sm transition shadow-lg shadow-purple-900/40 flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
              >
                <span>Continuar Jornada</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })()}

      {/* STEP 2: LESSON INTRO / THEORY EXPLANATION WITH AI AUDIO NARRATOR */}
      {!isLoading && currentStep === 'lesson_intro' && activeLesson && (
        <div className="flex-1 flex flex-col justify-between space-y-4 overflow-y-auto pr-1">
          <div className="space-y-4">
            {/* Audio Narrator Control Bar */}
            <div className="p-3.5 rounded-2xl bg-[#121829] border border-[#1e293b] flex items-center justify-between gap-3 shadow-md">
              <div className="flex items-center gap-2.5">
                <button
                  onClick={toggleExplanationSpeech}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                    isSpeakingExplanation
                      ? 'bg-rose-600 text-white animate-pulse'
                      : 'bg-[#8b5cf6] text-white hover:bg-[#7c3aed]'
                  }`}
                  title={isSpeakingExplanation ? 'Pausar áudio' : 'Ouvir explicação'}
                >
                  {isSpeakingExplanation ? (
                    <Pause className="w-5 h-5" />
                  ) : (
                    <Volume2 className="w-5 h-5" />
                  )}
                </button>
                <div>
                  <h4 className="text-xs font-black text-white flex items-center gap-1.5">
                    <span>Voz da IA Pedagógica</span>
                    {isSpeakingExplanation && (
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    )}
                  </h4>
                  <span className="text-[10px] text-slate-400 font-semibold">
                    {isSpeakingExplanation
                      ? 'Narrando conteúdo da aula...'
                      : 'Toque para ouvir a explicação falada'}
                  </span>
                </div>
              </div>

              {/* Audio Wave Bars visualizer */}
              {isSpeakingExplanation && (
                <div className="flex items-center gap-0.5 h-5 px-2">
                  <span className="w-1 h-3 bg-[#8b5cf6] rounded-full animate-bounce delay-75" />
                  <span className="w-1 h-5 bg-[#c084fc] rounded-full animate-bounce delay-150" />
                  <span className="w-1 h-2 bg-[#8b5cf6] rounded-full animate-bounce delay-100" />
                  <span className="w-1 h-4 bg-[#a855f7] rounded-full animate-bounce delay-200" />
                </div>
              )}
            </div>

            {/* Title & Summary */}
            <div className="p-4 rounded-3xl bg-[#121829] border border-[#1e293b] space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-[#8b5cf6]/20 border border-[#8b5cf6]/40 text-[#c084fc] text-[10px] font-black">
                  📚 Resumo da Matéria
                </span>
              </div>
              <h2 className="text-base font-black text-white">
                {activeLesson.title}
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                {activeLesson.summary}
              </p>
            </div>

            {/* Block 1: O Conteúdo da Aula */}
            <div className="p-4 rounded-3xl bg-[#121829] border border-[#1e293b] space-y-2">
              <h3 className="text-xs font-black text-emerald-400 flex items-center gap-1.5">
                <span>📖 1. O Conteúdo da Aula</span>
              </h3>
              <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-line space-y-1">
                {activeLesson.detailedExplanation}
              </div>
            </div>

            {/* Block 2: Como Fazer / Regras Práticas */}
            {activeLesson.keyPoints && activeLesson.keyPoints.length > 0 && (
              <div className="p-4 rounded-3xl bg-[#121829] border border-[#1e293b] space-y-2">
                <h3 className="text-xs font-black text-amber-400 flex items-center gap-1.5">
                  <span>✍️ 2. Como Fazer (Regras e Dicas)</span>
                </h3>
                <ul className="space-y-1.5">
                  {activeLesson.keyPoints.map((point, i) => (
                    <li
                      key={i}
                      className="text-xs text-slate-300 flex items-start gap-2"
                    >
                      <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-300 font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span className="leading-snug">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Block 3: Exemplo Resolvido */}
            {activeLesson.example && (
              <div className="p-4 rounded-3xl bg-[#121829] border border-[#1e293b] space-y-2">
                <h3 className="text-xs font-black text-cyan-400 flex items-center gap-1.5">
                  <span>💡 3. Exemplo Prático Resolvido</span>
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed italic bg-[#0b0f19] p-3 rounded-2xl border border-[#1e293b]">
                  {activeLesson.example}
                </p>
              </div>
            )}
          </div>

          {/* CTA: Iniciar Exercícios */}
          <div className="pt-3 sticky bottom-0 bg-[#070a12]/90 backdrop-blur-xs pb-1">
            <button
              onClick={handleProceedToQuiz}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#6366f1] via-[#7c3aed] to-[#8b5cf6] hover:from-[#4f46e5] hover:to-[#7c3aed] text-white font-black text-sm transition shadow-lg shadow-purple-900/40 flex items-center justify-center gap-2 active:scale-98"
            >
              <span>Praticar Questões</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: QUIZ VIEW (NO TIMER, WITH AUTOMATIC VOICE ANSWER & QUESTION SPEECH) */}
      {!isLoading && currentStep === 'quiz' && currentQ && (
        <div className="flex-1 flex flex-col justify-between space-y-4">
          <div className="space-y-3.5">
            {/* Automatic Voice Answer Controller */}
            <VoiceAnswerController
              options={currentQ.options || []}
              selectedOption={selectedOption}
              isAnswerSubmitted={isAnswerSubmitted}
              onSelectOption={handleSelectOption}
              onNextQuestion={handleNextQuestion}
            />

            {/* Question Audio Readout Bar & Explain Question CTA */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    soundEffects.playClick();
                    setIsTheoryGuideOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-600/30 to-indigo-600/30 hover:from-purple-600/50 hover:to-indigo-600/50 text-purple-200 hover:text-white border border-purple-400/40 text-xs font-black transition shadow-xs active:scale-95"
                  title="Ver explicação didática completa da matéria e desta questão"
                >
                  <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                  <span>Explicar Pergunta 💡</span>
                </button>

                <button
                  onClick={handleSpeakQuestion}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-[#121829] hover:bg-[#161f38] text-slate-300 hover:text-white border border-[#1e293b] text-xs font-bold transition"
                  title="Ouvir pergunta em voz alta"
                >
                  <Volume2 className="w-3.5 h-3.5 text-[#8b5cf6]" />
                  <span>{isSpeakingQuestion ? 'Pausar' : 'Ouvir'}</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className="text-[10px] font-black text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-full"
                  title="Nota simulada pelo seu desempenho nos exercícios desta matéria"
                >
                  Nota Est: {estimatedGrade.estimatedGrade10.toFixed(1)}
                </span>
                <span className="text-[10px] font-bold text-slate-400">
                  {currentQuestionIndex + 1}/{activeLesson?.practiceQuestions.length || 1}
                </span>
              </div>
            </div>

            {/* Question Statement Card */}
            <div className="bg-[#121829] border border-[#1e293b] rounded-3xl p-4.5 shadow-xl">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#c084fc] block mb-1">
                {activeLesson?.title || currentSubjectMeta.name}
              </span>
              <h2 className="text-sm font-black text-white leading-relaxed">
                {currentQ.question || (currentQ as any).text}
              </h2>
            </div>

            {/* Options List (A, B, C, D) */}
            <div className="space-y-2.5">
              {(currentQ.options || []).map((optionText, idx) => {
                const letter = String.fromCharCode(65 + idx); // A, B, C, D
                const isSelected = selectedOption === idx;
                const isCorrect = idx === currentQ.correctIndex;

                let cardStyle =
                  'bg-[#121829] border-[#1e293b] text-slate-200 hover:border-slate-500 hover:bg-[#161f38]';
                let letterStyle = 'bg-[#1e293b] text-slate-300 border-[#273553]';

                if (isAnswerSubmitted) {
                  if (isCorrect) {
                    cardStyle =
                      'bg-emerald-950/40 border-emerald-500 text-emerald-100 shadow-[0_0_12px_rgba(34,197,94,0.3)]';
                    letterStyle = 'bg-emerald-500 text-black border-emerald-400 font-black';
                  } else if (isSelected) {
                    cardStyle = 'bg-rose-950/40 border-rose-500 text-rose-100';
                    letterStyle = 'bg-rose-500 text-white border-rose-400';
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={isAnswerSubmitted}
                    onClick={() => handleSelectOption(idx)}
                    className={`w-full p-3.5 rounded-2xl border transition-all flex items-center gap-3.5 text-left active:scale-[0.99] shadow-sm ${cardStyle}`}
                  >
                    <div
                      className={`w-8 h-8 rounded-xl border flex items-center justify-center font-black text-xs shrink-0 ${letterStyle}`}
                    >
                      {letter}
                    </div>
                    <span className="text-xs font-semibold flex-1 leading-snug">
                      {optionText}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Pedagogical Explanation Feedback Card */}
            {isAnswerSubmitted && (
              <div
                className={`p-4 rounded-2xl border space-y-1.5 animate-in fade-in slide-in-from-bottom-2 ${
                  selectedOption === currentQ.correctIndex
                    ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-100'
                    : 'bg-[#121829] border-[#1e293b] text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-emerald-400">
                    {selectedOption === currentQ.correctIndex
                      ? 'Parabéns, você acertou! 🎉'
                      : 'Explicação Pedagógica 💡'}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {currentQ.explanation}
                </p>

                {onOpenErrorFeedback && (
                  <div className="flex justify-end pt-1 border-t border-zinc-800/50">
                    <button
                      type="button"
                      onClick={() => {
                        soundEffects.playClick();
                        onOpenErrorFeedback(`Questão de ${currentSubjectMeta.name}: ${currentQ.question.substring(0, 50)}...`);
                      }}
                      className="text-[10px] text-rose-400 hover:text-rose-300 flex items-center gap-1 font-medium transition cursor-pointer"
                    >
                      <AlertTriangle className="w-3 h-3 text-rose-400" />
                      <span>Reportar erro nesta pergunta</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Next Question CTA Button */}
          {isAnswerSubmitted && (
            <div className="pt-2">
              <button
                onClick={handleNextQuestion}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#6366f1] via-[#7c3aed] to-[#8b5cf6] hover:from-[#4f46e5] hover:to-[#7c3aed] text-white font-black text-sm transition shadow-lg shadow-purple-900/40 flex items-center justify-center gap-2 active:scale-98"
              >
                <span>
                  {currentQuestionIndex + 1 >= (activeLesson?.practiceQuestions?.length || 10)
                    ? 'Ver Resultado Final'
                    : 'Próxima Pergunta'}
                </span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* STEP 4: SUMMARY VIEW */}
      {!isLoading && currentStep === 'summary' && (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-5 bg-[#121829] border border-[#1e293b] rounded-3xl shadow-xl my-auto">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-[#6366f1] to-[#8b5cf6] text-white flex items-center justify-center text-4xl shadow-xl animate-bounce">
            🎉
          </div>

          <div className="space-y-1.5">
            <h2 className="text-lg font-black text-white">Lição Concluída com Sucesso!</h2>
            <p className="text-xs text-slate-400">
              Você completou a jornada de {currentSubjectMeta.name}.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#0b0f19] border border-[#1e293b] w-full max-w-xs space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-bold">Acertos:</span>
              <span className="text-emerald-400 font-black text-sm">
                {sessionCorrectCount} de {activeLesson?.practiceQuestions?.length || 5}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-bold">XP Ganho:</span>
              <span className="text-[#c084fc] font-black text-sm">+60 XP</span>
            </div>
            <div className="pt-2 border-t border-[#1e293b] flex items-center justify-between text-xs">
              <span className="text-purple-300 font-bold">Nota Estimada ({currentSubjectMeta.name}):</span>
              <span className="text-amber-300 font-black text-sm">
                {estimatedGrade.estimatedGrade10.toFixed(1)} / 10,0 ({estimatedGrade.estimatedGrade100} pts)
              </span>
            </div>
            <p className="text-[10px] text-slate-400 text-left">
              Simulada automaticamente com base nos seus exercícios! Você também pode lançar suas notas reais no Boletim.
            </p>
          </div>

          <button
            onClick={() => setCurrentStep('subject_select')}
            className="w-full max-w-xs py-3.5 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-black text-sm rounded-2xl shadow-lg transition active:scale-95"
          >
            Continuar Jornada
          </button>
        </div>
      )}

      {/* QUESTION THEORY & AI GUIDE MODAL */}
      <QuestionTheoryGuideModal
        isOpen={isTheoryGuideOpen}
        onClose={() => setIsTheoryGuideOpen(false)}
        question={currentQ || null}
        userGrade={user.grade}
        lesson={activeLesson}
        userName={user.name}
      />
    </div>
  );
};
