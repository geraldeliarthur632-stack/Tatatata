import React, { useState, useEffect, useRef } from 'react';
import { AppMode, DifficultyLevel, GradeLevel, StudyReminder, ExamEntry, UserProfile, BadgeItem, TrophyItem, SubjectId } from './types';
import { GRADE_LABELS, getSubjectsForGrade } from './data/curriculumData';
import { soundEffects } from './services/soundEffects';
import { notificationService } from './services/notificationService';
import { studyGoalService } from './services/studyGoalService';
import { mistakesTrackerService } from './services/mistakesTrackerService';
import {
  ALL_BADGES,
  ALL_TROPHIES,
  getEarnedBadges,
  getEarnedTrophies,
  getHighestBadge,
  getHighestTrophy,
} from './data/trophiesAndBadges';

// Components
import { PortraitContainer } from './components/PortraitContainer';
import { Header } from './components/Header';
import { BottomNavBar, MainTab } from './components/BottomNavBar';
import { ProfileView } from './components/ProfileView';
import { ProgressDashboard, calculateAcademicLevel } from './components/ProgressDashboard';
import { NextReminderCard } from './components/NextReminderCard';
import { StudyTipCard } from './components/StudyTipCard';
import { OnboardingModal } from './components/OnboardingModal';
import { IntroNarratorModal } from './components/IntroNarratorModal';
import { ProfileEditModal } from './components/ProfileEditModal';
import { StudyRemindersModal } from './components/StudyRemindersModal';
import { CalendarModal } from './components/CalendarModal';
import { PermissionsOnboardingModal } from './components/PermissionsOnboardingModal';
import { TrophiesAndBadgesModal } from './components/TrophiesAndBadgesModal';
import { UnlockCelebrationModal } from './components/UnlockCelebrationModal';
import { ProgressReportModal } from './components/ProgressReportModal';
import { SettingsModal } from './components/SettingsModal';
import { FocusTimerModal } from './components/FocusTimerModal';
import { ReportCardModal } from './components/ReportCardModal';
import { InstallAppModal } from './components/InstallAppModal';
import { MoreAppsModal } from './components/MoreAppsModal';
import { SubjectSummariesPdfModal } from './components/SubjectSummariesPdfModal';
import { SubjectCustomizationModal } from './components/SubjectCustomizationModal';
import { ErrorFeedbackModal } from './components/ErrorFeedbackModal';
import { DailyXpCelebrationModal } from './components/DailyXpCelebrationModal';
import { DailyXp100Notification } from './components/DailyXp100Notification';
import { DailyXpCard } from './components/DailyXpCard';
import { DailyLimitNoticeModal } from './components/DailyLimitNoticeModal';
import { dailyTimeLimitService } from './services/dailyTimeLimitService';
import { pwaService } from './services/pwaService';
import { AdMobBanner } from './components/AdMobBanner';
import { TaskExitInterstitialAd } from './components/TaskExitInterstitialAd';
import { FullscreenAdMobModal, AdPlacementType } from './components/FullscreenAdMobModal';
import { AgeClassificationModal } from './components/AgeClassificationModal';
import { AdMobPrivacyModal } from './components/AdMobPrivacyModal';
import { adMobService } from './services/adMobService';
import { FirebaseService } from './services/database/firebaseService';
import { LoginModal } from './components/LoginModal';
import { PermissionService } from './services/permissionService';
import { KeysModal } from './components/modals/KeysModal';
import { keysService } from './services/keysService';

// Modes
import { CadernoMode } from './components/modes/CadernoMode';
import { JourneyMode } from './components/modes/JourneyMode';
import { AITutorChatMode } from './components/modes/AITutorChatMode';
import { AIExplainerMode } from './components/modes/AIExplainerMode';
import { AIResearcherMode } from './components/modes/AIResearcherMode';
import { PassAndPlayMode } from './components/modes/PassAndPlayMode';
import { MultiplayerMode } from './components/modes/MultiplayerMode';
import { KnowledgeDuelMode } from './components/modes/KnowledgeDuelMode';
import { ChessMode } from './components/modes/ChessMode';
import { MathChallengeMode } from './components/modes/MathChallengeMode';
import { ChallengesHub } from './components/modes/ChallengesHub';
import { WordSearchGame } from './components/modes/WordSearchGame';
import { SlidingPuzzleGame } from './components/modes/SlidingPuzzleGame';
import { MathTimesTableMode } from './components/modes/MathTimesTableMode';
import { LanguageLearningMode } from './components/modes/LanguageLearningMode';
import { AITranslatorMode } from './components/modes/AITranslatorMode';
import { QuickExamSimuladoMode } from './components/modes/QuickExamSimuladoMode';
import { PhotoExamCreatorMode } from './components/modes/PhotoExamCreatorMode';
import { MemoryGameMode } from './components/modes/MemoryGameMode';
import { LightningChallengeMode } from './components/modes/LightningChallengeMode';

// Icons
import {
  Rocket,
  FileText,
  BookOpen,
  Trophy,
  Globe,
  Camera,
  ChevronRight,
  Flame,
  Zap,
  Sparkles,
  Layers,
  Swords,
  Timer,
  Calendar,
  GraduationCap,
  Clock,
  Compass,
  Pencil,
  X,
  FileDown,
  Printer,
  AlertCircle,
} from 'lucide-react';

const STORAGE_KEY = 'estudahud_user_profile_v3';

export function App() {
  const [user, setUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          name: parsed.name || 'Estudante',
          grade: parsed.grade || '6_fund',
          avatar: parsed.avatar || '🧑‍🎓',
          isFirstTime: typeof parsed.isFirstTime === 'boolean' ? parsed.isFirstTime : true,
          hasSeenIntro: typeof parsed.hasSeenIntro === 'boolean' ? parsed.hasSeenIntro : false,
          totalPoints: typeof parsed.totalPoints === 'number' && !isNaN(parsed.totalPoints) ? parsed.totalPoints : 0,
          completedChallenges: typeof parsed.completedChallenges === 'number' && !isNaN(parsed.completedChallenges) ? parsed.completedChallenges : 0,
          totalCorrectAnswers: typeof parsed.totalCorrectAnswers === 'number' && !isNaN(parsed.totalCorrectAnswers) ? parsed.totalCorrectAnswers : 0,
          customSubjects: Array.isArray(parsed.customSubjects) ? parsed.customSubjects : undefined,
          hasConfiguredSubjects: typeof parsed.hasConfiguredSubjects === 'boolean' ? parsed.hasConfiguredSubjects : false,
        };
      }
    } catch {}
    return {
      name: 'Estudante',
      grade: '6_fund',
      avatar: '🧑‍🎓',
      isFirstTime: true,
      hasSeenIntro: false,
      totalPoints: 0,
      completedChallenges: 0,
      totalCorrectAnswers: 0,
    };
  });

  const [streakDays, setStreakDays] = useState<number>(() => studyGoalService.getData().streakDays || 0);

  useEffect(() => {
    const updateStreak = () => {
      setStreakDays(studyGoalService.getData().streakDays || 0);
    };
    updateStreak();
    const interval = setInterval(updateStreak, 2500);
    return () => clearInterval(interval);
  }, []);

  // Ensure daily XP is kept synchronized with total points (fixing desync where 0 points showed stale 70 XP)
  useEffect(() => {
    studyGoalService.syncDailyXpWithTotalPoints(user.totalPoints || 0);
  }, [user.totalPoints]);

  const [activeTab, setActiveTab] = useState<MainTab>('home');

  const [currentMode, setCurrentMode] = useState<
    | 'tabs'
    | 'caderno'
    | 'journey'
    | 'custom'
    | 'explainer'
    | 'researcher'
    | 'challenges'
    | 'chess'
    | 'math'
    | 'competition'
    | 'multiplayer'
    | 'duel'
    | 'wordsearch'
    | 'crossword'
    | 'puzzle'
    | 'times_table'
    | 'languages'
    | 'translator'
    | 'simulado'
    | 'photo_exam'
    | 'memory'
    | 'lightning'
  >('tabs');

  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel>('medium');

  // Modals state
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isIntroOpen, setIsIntroOpen] = useState(false);
  const [isProfileEditOpen, setIsProfileEditOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isFocusTimerOpen, setIsFocusTimerOpen] = useState(false);
  const [isRemindersOpen, setIsRemindersOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isProgressReportOpen, setIsProgressReportOpen] = useState(false);
  const [isReportCardOpen, setIsReportCardOpen] = useState(false);
  const [isInstallAppOpen, setIsInstallAppOpen] = useState(false);
  const [isMoreAppsOpen, setIsMoreAppsOpen] = useState(false);
  const [isPdfSummariesOpen, setIsPdfSummariesOpen] = useState(false);
  const [isSubjectCustomizationOpen, setIsSubjectCustomizationOpen] = useState(false);
  const [isErrorFeedbackOpen, setIsErrorFeedbackOpen] = useState(false);
  const [errorFeedbackTopic, setErrorFeedbackTopic] = useState<string | undefined>(undefined);

  // AdMob and Google Play Families Policy Modals
  const [isAgeClassificationOpen, setIsAgeClassificationOpen] = useState(false);
  const [isAdMobPrivacyOpen, setIsAdMobPrivacyOpen] = useState(false);

  // Intersticial AdMob ao entrar, iniciar funções ou concluir tarefas
  const [taskExitAdState, setTaskExitAdState] = useState<{
    isOpen: boolean;
    taskTitle?: string;
    earnedXp?: number;
    isEntryAd?: boolean;
    isStartingFunction?: boolean;
    actionButtonText?: string;
    onComplete?: () => void;
  }>({
    isOpen: false,
    taskTitle: undefined,
    earnedXp: undefined,
    isEntryAd: false,
    isStartingFunction: false,
    actionButtonText: undefined,
    onComplete: undefined,
  });

  // Estado para Anúncios em Tela Cheia autorizados estritamente nos 5 pontos solicitados:
  // Início, Explicador, Criador de Provas, Pesquisador e Tradutor
  const [fullscreenAdState, setFullscreenAdState] = useState<{
    isOpen: boolean;
    placement: AdPlacementType;
    featureTitle?: string;
    onComplete?: () => void;
  }>({
    isOpen: false,
    placement: 'inicio',
  });

  const triggerFullscreenAd = (
    placement: AdPlacementType,
    featureTitle?: string,
    onComplete?: () => void
  ) => {
    soundEffects.playClick();
    setFullscreenAdState({
      isOpen: true,
      placement,
      featureTitle,
      onComplete,
    });
  };

  const handleCloseFullscreenAd = () => {
    const nextAction = fullscreenAdState.onComplete;
    setFullscreenAdState((prev) => ({ ...prev, isOpen: false }));
    if (nextAction) {
      nextAction();
    }
  };

  // Compatibilidade com fechamento do componente de anúncio
  const handleCloseTaskExitAd = () => {
    const nextAction = taskExitAdState.onComplete;
    setTaskExitAdState({
      isOpen: false,
      taskTitle: undefined,
      earnedXp: undefined,
      isEntryAd: false,
      isStartingFunction: false,
      actionButtonText: undefined,
      onComplete: undefined,
    });

    if (nextAction) {
      nextAction();
    }
  };

  // Retorno limpo e direto das atividades para as abas, sem anúncios intrusivos
  const handleExitTaskWithAd = (taskTitle: string = 'Atividade de Estudos', earnedXp?: number) => {
    setJourneyInitialSubject(undefined);
    setCurrentMode('tabs');
  };

  // Sistema de Chaves de Acesso (Jornada, Idiomas e Xadrez)
  const [keys, setKeys] = useState<number>(() => keysService.getKeys());
  const [isKeysModalOpen, setIsKeysModalOpen] = useState<boolean>(false);
  const [keysModalContext, setKeysModalContext] = useState<'journey' | 'languages' | 'chess' | 'general'>('general');
  const [pendingGatedMode, setPendingGatedMode] = useState<'journey' | 'languages' | 'chess' | null>(null);

  useEffect(() => {
    return keysService.subscribe((updatedKeys) => {
      setKeys(updatedKeys);
    });
  }, []);

  const handleEnterGatedMode = (targetMode: 'journey' | 'languages' | 'chess', onConfirmProceed?: () => void) => {
    if (keysService.hasKeys()) {
      keysService.useKey();
      if (onConfirmProceed) {
        onConfirmProceed();
      } else {
        setCurrentMode(targetMode);
      }
    } else {
      soundEffects.playClick();
      setKeysModalContext(targetMode);
      setPendingGatedMode(targetMode);
      setIsKeysModalOpen(true);
    }
  };

  // Inicializa AdMob e dispara o anúncio em tela cheia no início (App Open Ad)
  useEffect(() => {
    adMobService.init();
    if (user.ageGroup) {
      adMobService.setAgeGroup(user.ageGroup);
    }

    // Regra oficial de exibição de anúncio em tela cheia no início
    const timer = setTimeout(() => {
      triggerFullscreenAd('inicio', 'Início do Aplicativo');
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  // Firebase Firestore automatic progress synchronization
  useEffect(() => {
    if (FirebaseService.isAvailable() && user.name) {
      const syncUserId = `user_${user.name.toLowerCase().replace(/[^a-z0-9]/g, '_') || 'default'}`;
      FirebaseService.syncProgress(syncUserId, {
        name: user.name,
        grade: user.grade,
        totalPoints: user.totalPoints,
        completedChallenges: user.completedChallenges,
        totalCorrectAnswers: user.totalCorrectAnswers,
        streakDays,
      }).catch((e) => console.warn('Firebase sync silent warn:', e));
    }
  }, [user.totalPoints, user.completedChallenges, user.totalCorrectAnswers, streakDays]);

  // Daily study time limit (2 hours / day)
  const [dailyStudySeconds, setDailyStudySeconds] = useState<number>(() =>
    dailyTimeLimitService.getTodaySeconds()
  );
  const [isDailyLimitModalOpen, setIsDailyLimitModalOpen] = useState(false);

  // Monitor active study time every second when tab is visible
  useEffect(() => {
    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        const next = dailyTimeLimitService.addSeconds(1);
        setDailyStudySeconds(next);

        if (dailyTimeLimitService.shouldShowNotice()) {
          setIsDailyLimitModalOpen(true);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Trophies & Badges modal state
  const [isTrophiesModalOpen, setIsTrophiesModalOpen] = useState(false);
  const [trophiesModalDefaultTab, setTrophiesModalDefaultTab] = useState<'trophies' | 'badges'>('trophies');
  const [unlockedCelebrationItem, setUnlockedCelebrationItem] = useState<{
    type: 'trophy' | 'badge';
    item: TrophyItem | BadgeItem;
  } | null>(null);

  // Daily XP 100% Celebration Modal State
  const [dailyXpCelebration, setDailyXpCelebration] = useState<{
    isOpen: boolean;
    earnedXp: number;
    goalXp: number;
  } | null>(null);

  // Daily XP 100% Floating Notification Toast State
  const [dailyXpToast, setDailyXpToast] = useState<{
    isOpen: boolean;
    earnedXp: number;
    goalXp: number;
    streakDays: number;
  } | null>(null);

  // Listen to 100% daily XP reached event from anywhere in the app
  useEffect(() => {
    const handle100Reached = (e: any) => {
      const detail = e.detail || studyGoalService.getDailyXpData();
      const curStreak = studyGoalService.getData().streakDays || streakDays || 1;
      setDailyXpToast({
        isOpen: true,
        earnedXp: detail.earnedXp,
        goalXp: detail.goalXp,
        streakDays: curStreak,
      });
    };

    window.addEventListener('estudahud_daily_xp_100_reached', handle100Reached);
    return () => {
      window.removeEventListener('estudahud_daily_xp_100_reached', handle100Reached);
    };
  }, [streakDays]);

  // Toasts
  const [activeReminderToast, setActiveReminderToast] = useState<StudyReminder | null>(null);
  const [activeExamToast, setActiveExamToast] = useState<{ exam: ExamEntry; type: 'day_before' | 'day_of' } | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  // App Theme State (Always Light mode as strictly requested by user: "coloque tudo em modo claro tudo tudo tudo")
  const [appTheme, setAppTheme] = useState<'dark' | 'light'>('light');

  // Enforce light theme in localStorage on initial mount and whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('estudahud_app_theme', 'light');
    } catch {}
  }, []);

  const toggleTheme = () => {
    soundEffects.playClick();
    setAppTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const isLight = appTheme === 'light';

  // Selected subject when starting a session directly from a study reminder card
  const [journeyInitialSubject, setJourneyInitialSubject] = useState<SubjectId | undefined>(undefined);

  // Suggested subject for "Continuar estudando" based on highest difficulty and accumulated correct answers
  const [continueSubjectId, setContinueSubjectId] = useState<string | null>(null);
  const [difficultySuggestionIndex, setDifficultySuggestionIndex] = useState<number>(-1);
  const [subjectSuggestionInfo, setSubjectSuggestionInfo] = useState<{
    subjectId: string;
    subjectName: string;
    icon: string;
    reason: string;
    badgeLabel: string;
    accuracyPercent: number;
    correctCount: number;
    totalAttempts: number;
  } | null>(null);

  const handleStartStudySession = (subjectId: SubjectId) => {
    soundEffects.playClick();
    setJourneyInitialSubject(subjectId);
    handleEnterGatedMode('journey');
  };

  const handleSuggestSubjectByDifficulty = () => {
    soundEffects.playClick();
    const gradeSubs = getSubjectsForGrade(user.grade);
    const customSubs = (user.customSubjects || []).map((cs) => ({
      id: cs.id,
      name: cs.name,
      icon: cs.icon || '📚',
    }));
    const allSubs = [...gradeSubs, ...customSubs];

    if (allSubs.length === 0) return;

    // Rank subjects by difficulty based on accumulated correct answers and error stats
    const ranked = mistakesTrackerService.getDifficultyRankedSubjects(user.grade, allSubs);
    if (ranked.length === 0) return;

    const nextIdx = (difficultySuggestionIndex + 1) % ranked.length;
    setDifficultySuggestionIndex(nextIdx);

    const chosen = ranked[nextIdx];
    setContinueSubjectId(chosen.subjectId);
    setSubjectSuggestionInfo({
      subjectId: chosen.subjectId,
      subjectName: chosen.subjectName,
      icon: chosen.icon,
      reason: chosen.reason,
      badgeLabel: chosen.badgeLabel,
      accuracyPercent: chosen.accuracyPercent,
      correctCount: chosen.correctCount,
      totalAttempts: chosen.totalAttempts,
    });

    soundEffects.playSuccess();
  };

  // Sync profile changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } catch {}
  }, [user]);

  // Listen to Notification Service for Study Reminders and Exam Alarms
  useEffect(() => {
    const unsubReminder = notificationService.addListener((reminder) => {
      setActiveReminderToast(reminder);
    });

    const unsubExam = notificationService.addExamListener((exam, type) => {
      setActiveExamToast({ exam, type });
    });

    const handleExamAlarmActive = (e: Event) => {
      const customEv = e as CustomEvent<{ exam: ExamEntry; type: 'day_before' | 'day_of' }>;
      if (customEv.detail?.exam) {
        setActiveExamToast({ exam: customEv.detail.exam, type: customEv.detail.type });
      }
    };

    const handleExamAlarmStopped = () => {
      setActiveExamToast(null);
    };

    window.addEventListener('estudahud_exam_alarm_active', handleExamAlarmActive);
    window.addEventListener('estudahud_exam_alarm_stopped', handleExamAlarmStopped);

    return () => {
      unsubReminder();
      unsubExam();
      window.removeEventListener('estudahud_exam_alarm_active', handleExamAlarmActive);
      window.removeEventListener('estudahud_exam_alarm_stopped', handleExamAlarmStopped);
    };
  }, []);

  // First time user detection and automatic onboarding / permissions flow
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored || user.isFirstTime) {
        setIsOnboardingOpen(true);
      } else {
        // Se as permissões já foram aceitas, não aparece. Se faltar alguma, aparece!
        PermissionService.checkStatus().then((status) => {
          if (!status.allGranted) {
            setIsPermissionsModalOpen(true);
          }
        });
      }
    } catch {}
  }, []);

  // Prompt user to select custom subjects (Biologia, Física, Química) only once ("1 vez só")
  useEffect(() => {
    try {
      const alreadyPrompted = localStorage.getItem('estudahud_subjects_prompted_once');
      if (!user.isFirstTime && !user.hasConfiguredSubjects && !alreadyPrompted && !isOnboardingOpen) {
        const timer = setTimeout(() => {
          setIsSubjectCustomizationOpen(true);
          try {
            localStorage.setItem('estudahud_subjects_prompted_once', 'true');
          } catch {}
        }, 700);
        return () => clearTimeout(timer);
      }
    } catch {}
  }, [user.isFirstTime, user.hasConfiguredSubjects, isOnboardingOpen]);

  // Greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const levelInfo = calculateAcademicLevel(user.totalPoints || 0);

  const handleUpdateProfile = (updatedProfile: Partial<UserProfile>) => {
    if (updatedProfile.ageGroup) {
      adMobService.setAgeGroup(updatedProfile.ageGroup);
    }
    setUser((prev) => {
      const next = { ...prev, ...updatedProfile, isFirstTime: false };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const handleEarnPoints = (
    earnedPoints: number,
    isMajorChallenge: boolean = false,
    questionsCount: number = 0
  ) => {
    if (earnedPoints > 0) {
      const prevXp = studyGoalService.getDailyXpData();
      const updatedXp = studyGoalService.addDailyXp(earnedPoints);

      // Check if student just reached 100% of daily XP goal
      const wasGoalMet = prevXp.isGoalMet || prevXp.progressPercent >= 100;
      const isNowGoalMet = updatedXp.isGoalMet || updatedXp.progressPercent >= 100;

      if (!wasGoalMet && isNowGoalMet) {
        const curStreak = studyGoalService.getData().streakDays || streakDays || 1;
        setDailyXpToast({
          isOpen: true,
          earnedXp: updatedXp.earnedXp,
          goalXp: updatedXp.goalXp,
          streakDays: curStreak,
        });

        if (!studyGoalService.hasCelebratedDailyXpToday()) {
          studyGoalService.markDailyXpCelebrated();
          setDailyXpCelebration({
            isOpen: true,
            earnedXp: updatedXp.earnedXp,
            goalXp: updatedXp.goalXp,
          });
        }
      }
    }
    setUser((prev) => {
      const newPoints = (prev.totalPoints || 0) + earnedPoints;
      const newCorrect = (prev.totalCorrectAnswers || 0) + questionsCount;
      const newChallenges = isMajorChallenge
        ? (prev.completedChallenges || 0) + 1
        : prev.completedChallenges || 0;

      return {
        ...prev,
        totalPoints: newPoints,
        totalCorrectAnswers: newCorrect,
        completedChallenges: newChallenges,
      };
    });
  };

  const handleOpenTrophiesAndBadges = (tab: 'trophies' | 'badges' = 'trophies') => {
    soundEffects.playClick();
    setTrophiesModalDefaultTab(tab);
    setIsTrophiesModalOpen(true);
  };

  const handleInstallAppClick = () => {
    soundEffects.playClick();
    setIsInstallAppOpen(true);
  };

  return (
    <PortraitContainer themeClass={appTheme === 'light' ? 'theme-light' : 'theme-dark'}>
      {/* Dynamic Header */}
      {currentMode === 'tabs' && (
        <Header
          user={user}
          theme={appTheme}
          keys={keys}
          onOpenKeysModal={() => {
            soundEffects.playClick();
            setKeysModalContext('general');
            setPendingGatedMode(null);
            setIsKeysModalOpen(true);
          }}
          onToggleTheme={toggleTheme}
          onEditProfile={() => setIsProfileEditOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenCalendar={() => setIsCalendarOpen(true)}
          onOpenReminders={() => setIsRemindersOpen(true)}
          onOpenTrophiesAndBadges={handleOpenTrophiesAndBadges}
          onOpenInstallApp={handleInstallAppClick}
          onOpenPdfSummaries={() => setIsPdfSummariesOpen(true)}
          onOpenLogin={() => setIsLoginOpen(true)}
          onOpenErrorFeedback={(topic) => {
            setErrorFeedbackTopic(topic);
            setIsErrorFeedbackOpen(true);
          }}
        />
      )}

      {/* Main App Content View */}
      <main className={`flex-1 flex flex-col min-h-0 ${isLight ? 'bg-slate-50 text-slate-900' : 'bg-[#0b0f19] text-white'}`}>
        {/* ===================== TAB 1: INÍCIO (HOME) ===================== */}
        {currentMode === 'tabs' && activeTab === 'home' && (
          <div className="flex-1 flex flex-col p-3 sm:p-4 md:p-6 space-y-4 max-w-lg md:max-w-3xl lg:max-w-5xl xl:max-w-6xl mx-auto w-full pb-32 sm:pb-36">
            {/* Student Greeting & Profile Avatar with edit pencil in the corner */}
            <div className={`flex items-center justify-between gap-3 p-3.5 rounded-3xl border ${
              isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-[#121829]/60 border-[#273553]'
            }`}>
              <div className="space-y-0.5 min-w-0">
                <h1 className={`text-lg sm:text-2xl font-black tracking-tight truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {getGreeting()}, {user.name || 'Estudante'}! 👋
                </h1>
                <p className={`text-xs sm:text-sm font-medium truncate ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  {GRADE_LABELS[user.grade]?.full || 'Ensino Fundamental'} • Pronto para aprender hoje?
                </p>
              </div>

              {/* Foto de Perfil do Estudante com Lapizinho no Canto */}
              <div className="relative shrink-0">
                <button
                  onClick={() => {
                    soundEffects.playClick();
                    setIsProfileEditOpen(true);
                  }}
                  className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-[#6366f1] via-[#8b5cf6] to-[#ec4899] p-0.5 shadow-lg flex items-center justify-center transition-all hover:scale-105 active:scale-95 group cursor-pointer"
                  title="Editar perfil e foto/avatar"
                  aria-label="Editar perfil e avatar"
                >
                  <div className={`w-full h-full rounded-full flex items-center justify-center text-2xl sm:text-3xl select-none transition ${
                    isLight ? 'bg-white group-hover:bg-slate-100' : 'bg-[#0b0f19] group-hover:bg-[#121829]'
                  }`}>
                    {user.avatar || '🎓'}
                  </div>
                </button>
                <button
                  onClick={() => {
                    soundEffects.playClick();
                    setIsProfileEditOpen(true);
                  }}
                  className={`absolute -bottom-0.5 -right-0.5 w-5 h-5 sm:w-5.5 sm:h-5.5 rounded-full bg-[#8b5cf6] hover:bg-[#a855f7] text-white flex items-center justify-center shadow-md border-2 transition-transform hover:scale-110 active:scale-90 cursor-pointer ${
                    isLight ? 'border-white' : 'border-[#121829]'
                  }`}
                  title="Editar perfil"
                  aria-label="Editar perfil"
                >
                  <Pencil className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                </button>
              </div>
            </div>

            {/* Dica de Estudo do Dia Personalizada */}
            <StudyTipCard userGrade={user.grade} user={user} theme={appTheme} />

            {/* Responsive 2-Column Grid on Tablet/Desktop/Landscape */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left Column: Level & Progress */}
              <div className="space-y-3.5">
                {/* Level Card */}
                <div className={`rounded-3xl p-4 sm:p-5 shadow-xl flex items-center justify-between gap-4 relative overflow-hidden border ${
                  isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-[#121829] border-[#273553]'
                }`}>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm sm:text-base font-black block ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        Nível {levelInfo.level}
                      </span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                        isLight
                          ? 'text-indigo-700 bg-indigo-50 border-indigo-200'
                          : 'text-[#c084fc] bg-[#8b5cf6]/20 border-[#8b5cf6]/40'
                      }`}>
                        {levelInfo.title}
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className={`w-full h-2 rounded-full overflow-hidden ${isLight ? 'bg-slate-100' : 'bg-[#1e293b]'}`}>
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#c084fc] transition-all duration-500 shadow-[0_0_8px_rgba(139,92,246,0.6)]"
                        style={{ width: `${Math.max(4, levelInfo.progressPercent)}%` }}
                      />
                    </div>

                    <div className={`flex items-center justify-between text-[11px] sm:text-xs font-bold ${
                      isLight ? 'text-slate-500' : 'text-slate-400'
                    }`}>
                      <span>{levelInfo.currentPointsInLevel} / {levelInfo.pointsNeededForNextLevel} XP</span>
                      <span>Próximo: {levelInfo.nextTitle}</span>
                    </div>
                  </div>

                  {/* Glowing Level Icon */}
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#6366f1] via-[#7c3aed] to-[#a855f7] p-0.5 shadow-lg shadow-purple-600/30 flex items-center justify-center shrink-0">
                    <div className={`w-full h-full rounded-2xl flex items-center justify-center text-2xl ${
                      isLight ? 'bg-white' : 'bg-[#121829]'
                    }`}>
                      {levelInfo.level >= 10 ? '👑' : levelInfo.level >= 7 ? '💎' : levelInfo.level >= 4 ? '⭐' : '🌱'}
                    </div>
                  </div>
                </div>

                {/* Streak & XP Stats Row (2 Cards) */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Card 1: Sequência */}
                  <div className={`p-3.5 sm:p-4 rounded-3xl space-y-1 shadow-sm border ${
                    isLight ? 'bg-white border-slate-200' : 'bg-[#121829] border-[#273553]'
                  }`}>
                    <div className={`flex items-center gap-1.5 text-xs font-bold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <span>Sequência</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className={`text-2xl sm:text-3xl font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>{streakDays}</span>
                      <span className={`text-xs font-semibold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{streakDays === 1 ? 'dia' : 'dias'}</span>
                    </div>
                  </div>

                  {/* Card 2: Pontos */}
                  <div className={`p-3.5 sm:p-4 rounded-3xl space-y-1 shadow-sm border ${
                    isLight ? 'bg-white border-slate-200' : 'bg-[#121829] border-[#273553]'
                  }`}>
                    <div className={`flex items-center gap-1.5 text-xs font-bold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      <Trophy className="w-3.5 h-3.5 text-amber-500" />
                      <span>Pontos</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className={`text-2xl sm:text-3xl font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        {(user.totalPoints || 0).toLocaleString('pt-BR')}
                      </span>
                      <span className={`text-xs font-semibold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>XP</span>
                    </div>
                  </div>
                </div>

                {/* Daily XP Progress Bar Card with 100% Celebration */}
                <DailyXpCard
                  streakDays={streakDays}
                  userTotalPoints={user.totalPoints || 0}
                  theme={appTheme}
                  onOpenCelebration={(earned, goal) => {
                    setDailyXpCelebration({
                      isOpen: true,
                      earnedXp: earned,
                      goalXp: goal,
                    });
                  }}
                />

                {/* Daily Study Time Pill (Limite Saudável 2h/dia) */}
                <div className={`p-3 rounded-2xl flex items-center justify-between text-xs shadow-md border ${
                  isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-[#121829] border-[#273553]'
                }`}>
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm shadow-xs shrink-0 ${
                        dailyStudySeconds >= 7200
                          ? isLight
                            ? 'bg-amber-100 text-amber-700 border border-amber-300'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : isLight
                          ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                          : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                      }`}
                    >
                      <Clock className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-200'}`}>Tempo de Estudo Hoje:</span>
                        <span
                          className={`font-black ${
                            dailyStudySeconds >= 7200
                              ? isLight ? 'text-amber-600' : 'text-amber-400'
                              : isLight ? 'text-indigo-600' : 'text-indigo-300'
                          }`}
                        >
                          {dailyTimeLimitService.formatTime(dailyStudySeconds)}
                        </span>
                        <span className={`text-[11px] ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>/ 2h recomendadas</span>
                      </div>
                      <span className={`text-[10px] block truncate ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                        {dailyStudySeconds >= 7200
                          ? '⚠️ Limite atingido: é melhor parar porque o recomendado é 2h/dia.'
                          : 'Recomendado: até 2 horas de estudo diárias para não cansar.'}
                      </span>
                    </div>
                  </div>
                  {dailyStudySeconds >= 7200 && (
                    <button
                      onClick={() => {
                        soundEffects.playClick();
                        setIsDailyLimitModalOpen(true);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition shrink-0 ml-2 cursor-pointer ${
                        isLight
                          ? 'bg-amber-100 hover:bg-amber-200 text-amber-800 border-amber-300'
                          : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border-amber-500/30'
                      }`}
                    >
                      Aviso 2h
                    </button>
                  )}
                </div>

                {/* Card Interativo: Próximo Lembrete de Estudo Agendado com Iniciar Sessão */}
                <NextReminderCard
                  onStartSession={handleStartStudySession}
                  onOpenReminders={() => setIsRemindersOpen(true)}
                  userGrade={user.grade}
                  customSubjects={user.customSubjects}
                  theme={appTheme}
                />

                {/* "Continuar estudando" Card */}
                {(() => {
                  const gradeSubs = getSubjectsForGrade(user.grade);
                  const customSubs = (user.customSubjects || []).map((cs) => ({
                    id: cs.id,
                    name: cs.name,
                    icon: cs.icon || '📚',
                  }));
                  const allSubs = [...gradeSubs, ...customSubs];

                  // If user selected a suggestion or clicked "Nova Matéria", use that subject, otherwise default to first
                  const activeSub =
                    allSubs.find((s) => s.id === continueSubjectId) ||
                    allSubs[0] ||
                    { id: 'matematica', name: 'Matemática', icon: '📐' };

                  const completedList = studyGoalService.getCompletedSubjects(user.grade);
                  const progressPerc = Math.min(100, Math.round((completedList.length / Math.max(1, allSubs.length)) * 100));

                  const isSuggested = subjectSuggestionInfo && subjectSuggestionInfo.subjectId === activeSub.id;

                  return (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className={`text-sm font-black ${isLight ? 'text-slate-900' : 'text-white'} truncate`}>
                          Continuar estudando
                        </h3>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {/* Botão "Nova Matéria" sugerida com base em dificuldade e acertos acumulados */}
                          <button
                            type="button"
                            onClick={handleSuggestSubjectByDifficulty}
                            className={`px-2.5 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs active:scale-95 cursor-pointer border ${
                              isLight
                                ? 'bg-gradient-to-r from-purple-50 to-indigo-50 hover:from-purple-100 hover:to-indigo-100 text-purple-700 border-purple-200 hover:border-purple-300'
                                : 'bg-gradient-to-r from-purple-950/60 to-indigo-950/60 hover:from-purple-900/80 hover:to-indigo-900/80 text-purple-300 border-purple-800/60 hover:border-purple-600'
                            }`}
                            title="Sugerir matéria baseada nas suas maiores dificuldades usando dados de acertos acumulados"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-purple-500 animate-pulse" />
                            <span>Nova Matéria</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              soundEffects.playClick();
                              handleEnterGatedMode('journey');
                            }}
                            className={`text-xs font-bold transition cursor-pointer px-2 py-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 ${
                              isLight ? 'text-indigo-600 hover:text-indigo-800' : 'text-[#8b5cf6] hover:text-[#a855f7]'
                            }`}
                          >
                            Ver tudo
                          </button>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          handleStartStudySession(activeSub.id as SubjectId);
                        }}
                        className={`w-full p-4 rounded-3xl border transition flex items-center gap-3.5 text-left active:scale-[0.99] group cursor-pointer ${
                          isSuggested
                            ? isLight
                              ? 'bg-gradient-to-br from-purple-50/80 via-white to-indigo-50/60 border-purple-300 ring-2 ring-purple-400/20 shadow-sm'
                              : 'bg-gradient-to-br from-[#1b1c3d] via-[#141a2e] to-[#1e1730] border-purple-500/50 ring-2 ring-purple-500/20 shadow-lg'
                            : isLight
                            ? 'bg-white border-slate-200 hover:border-purple-300 hover:bg-slate-50/80 shadow-xs'
                            : 'bg-[#121829] border-[#273553] hover:border-[#8b5cf6]/60 hover:bg-[#161e31] shadow-lg'
                        }`}
                      >
                        <div className="relative shrink-0">
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-700 text-white font-black flex items-center justify-center text-2xl shadow-md group-hover:scale-105 transition-transform">
                            {activeSub.icon || '📐'}
                          </div>
                          {isSuggested && (
                            <span className="absolute -top-1 -right-1 flex h-3 w-3">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-600"></span>
                            </span>
                          )}
                        </div>

                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`text-xs sm:text-sm font-bold truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
                              {activeSub.name}
                            </span>
                            {isSuggested && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30 shrink-0">
                                {subjectSuggestionInfo.badgeLabel}
                              </span>
                            )}
                          </div>

                          <p className={`text-xs truncate ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                            {isSuggested ? (
                              <span className="text-purple-600 dark:text-purple-300 font-medium">
                                {subjectSuggestionInfo.reason}
                              </span>
                            ) : (
                              `${GRADE_LABELS[user.grade]?.short || '6º Ano'} • BNCC`
                            )}
                          </p>

                          <div className="space-y-1 pt-1">
                            <div className="flex items-center justify-between text-[10px] font-bold">
                              <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>
                                {completedList.length}/{allSubs.length} matérias concluídas ({progressPerc}%)
                              </span>
                              <span className="text-indigo-600 dark:text-purple-400 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                                Iniciar agora →
                              </span>
                            </div>
                            <div className={`w-full h-1.5 rounded-full overflow-hidden ${isLight ? 'bg-slate-100' : 'bg-[#1e293b]'}`}>
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-[#6366f1] to-[#8b5cf6]"
                                style={{ width: `${Math.max(4, progressPerc)}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </button>
                    </div>
                  );
                })()}
              </div>

              {/* Right Column: 9 Core Study Modes Grid & Special Highlights */}
              <div className="space-y-3.5">
                {/* 9 Core Study Features (Grid 3x3) */}
                <div className="space-y-2.5">
                  <h3 className={`text-sm font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>Ferramentas de Estudo</h3>

                  <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
                    {/* 1. Jornada */}
                    <button
                      onClick={() => {
                        soundEffects.playClick();
                        handleEnterGatedMode('journey');
                      }}
                      className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-2 transition active:scale-95 shadow-sm group cursor-pointer ${
                        isLight
                          ? 'bg-white border-slate-200 hover:border-indigo-400 hover:bg-slate-50/80 shadow-xs'
                          : 'bg-[#121829] border-[#273553] hover:border-[#8b5cf6]/60 hover:bg-[#161e31]'
                      }`}
                    >
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-600 to-rose-500 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition">
                        <Rocket className="w-5 h-5" />
                      </div>
                      <span className={`text-xs font-bold truncate ${isLight ? 'text-slate-700 group-hover:text-slate-900' : 'text-slate-200 group-hover:text-white'}`}>
                        Jornada
                      </span>
                    </button>

                    {/* 2. Simulado */}
                    <button
                      onClick={() => {
                        soundEffects.playClick();
                        setCurrentMode('simulado');
                      }}
                      className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-2 transition active:scale-95 shadow-sm group cursor-pointer ${
                        isLight
                          ? 'bg-white border-slate-200 hover:border-indigo-400 hover:bg-slate-50/80 shadow-xs'
                          : 'bg-[#121829] border-[#273553] hover:border-[#8b5cf6]/60 hover:bg-[#161e31]'
                      }`}
                    >
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition">
                        <FileText className="w-5 h-5" />
                      </div>
                      <span className={`text-xs font-bold truncate ${isLight ? 'text-slate-700 group-hover:text-slate-900' : 'text-slate-200 group-hover:text-white'}`}>
                        Simulado
                      </span>
                    </button>

                    {/* 3. Caderno */}
                    <button
                      onClick={() => {
                        soundEffects.playClick();
                        setCurrentMode('caderno');
                      }}
                      className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-2 transition active:scale-95 shadow-sm group cursor-pointer ${
                        isLight
                          ? 'bg-white border-slate-200 hover:border-indigo-400 hover:bg-slate-50/80 shadow-xs'
                          : 'bg-[#121829] border-[#273553] hover:border-[#8b5cf6]/60 hover:bg-[#161e31]'
                      }`}
                    >
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <span className={`text-xs font-bold truncate ${isLight ? 'text-slate-700 group-hover:text-slate-900' : 'text-slate-200 group-hover:text-white'}`}>
                        Caderno
                      </span>
                    </button>

                    {/* 4. Resumos em PDF */}
                    <button
                      onClick={() => {
                        soundEffects.playClick();
                        setIsPdfSummariesOpen(true);
                      }}
                      className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-2 transition active:scale-95 shadow-sm group cursor-pointer ${
                        isLight
                          ? 'bg-white border-slate-200 hover:border-indigo-400 hover:bg-slate-50/80 shadow-xs'
                          : 'bg-[#121829] border-[#273553] hover:border-indigo-500/60 hover:bg-[#161e31]'
                      }`}
                    >
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-sky-500 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition">
                        <FileDown className="w-5 h-5" />
                      </div>
                      <span className={`text-xs font-bold truncate ${isLight ? 'text-indigo-600 group-hover:text-indigo-800' : 'text-indigo-300 group-hover:text-white'}`}>
                        PDF Resumos
                      </span>
                    </button>

                    {/* 5. Calendário de Provas */}
                    <button
                      onClick={() => {
                        soundEffects.playClick();
                        setIsCalendarOpen(true);
                      }}
                      className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-2 transition active:scale-95 shadow-sm group cursor-pointer ${
                        isLight
                          ? 'bg-white border-slate-200 hover:border-indigo-400 hover:bg-slate-50/80 shadow-xs'
                          : 'bg-[#121829] border-[#273553] hover:border-[#8b5cf6]/60 hover:bg-[#161e31]'
                      }`}
                    >
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <span className={`text-xs font-bold truncate ${isLight ? 'text-slate-700 group-hover:text-slate-900' : 'text-slate-200 group-hover:text-white'}`}>
                        Calendário
                      </span>
                    </button>

                    {/* 6. Boletim Escolar */}
                    <button
                      onClick={() => {
                        soundEffects.playClick();
                        setIsReportCardOpen(true);
                      }}
                      className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-2 transition active:scale-95 shadow-sm group cursor-pointer ${
                        isLight
                          ? 'bg-white border-slate-200 hover:border-indigo-400 hover:bg-slate-50/80 shadow-xs'
                          : 'bg-[#121829] border-[#273553] hover:border-[#8b5cf6]/60 hover:bg-[#161e31]'
                      }`}
                    >
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-sky-500 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition">
                        <GraduationCap className="w-5 h-5" />
                      </div>
                      <span className={`text-xs font-bold truncate ${isLight ? 'text-slate-700 group-hover:text-slate-900' : 'text-slate-200 group-hover:text-white'}`}>
                        Boletim
                      </span>
                    </button>

                    {/* 7. Horários de Estudos */}
                    <button
                      onClick={() => {
                        soundEffects.playClick();
                        setIsRemindersOpen(true);
                      }}
                      className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-2 transition active:scale-95 shadow-sm group cursor-pointer ${
                        isLight
                          ? 'bg-white border-slate-200 hover:border-indigo-400 hover:bg-slate-50/80 shadow-xs'
                          : 'bg-[#121829] border-[#273553] hover:border-[#8b5cf6]/60 hover:bg-[#161e31]'
                      }`}
                    >
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-600 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition">
                        <Clock className="w-5 h-5" />
                      </div>
                      <span className={`text-xs font-bold truncate ${isLight ? 'text-slate-700 group-hover:text-slate-900' : 'text-slate-200 group-hover:text-white'}`}>
                        Horários
                      </span>
                    </button>

                    {/* 8. Plano & Foco Pomodoro */}
                    <button
                      onClick={() => {
                        soundEffects.playClick();
                        setIsFocusTimerOpen(true);
                      }}
                      className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-2 transition active:scale-95 shadow-sm group cursor-pointer ${
                        isLight
                          ? 'bg-white border-slate-200 hover:border-indigo-400 hover:bg-slate-50/80 shadow-xs'
                          : 'bg-[#121829] border-[#273553] hover:border-[#8b5cf6]/60 hover:bg-[#161e31]'
                      }`}
                    >
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-600 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition">
                        <Timer className="w-5 h-5" />
                      </div>
                      <span className={`text-xs font-bold truncate ${isLight ? 'text-slate-700 group-hover:text-slate-900' : 'text-slate-200 group-hover:text-white'}`}>
                        Plano & Foco
                      </span>
                    </button>

                    {/* 9. Idiomas */}
                    <button
                      onClick={() => {
                        soundEffects.playClick();
                        handleEnterGatedMode('languages');
                      }}
                      className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-2 transition active:scale-95 shadow-sm group cursor-pointer ${
                        isLight
                          ? 'bg-white border-slate-200 hover:border-indigo-400 hover:bg-slate-50/80 shadow-xs'
                          : 'bg-[#121829] border-[#273553] hover:border-[#8b5cf6]/60 hover:bg-[#161e31]'
                      }`}
                    >
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition">
                        <Globe className="w-5 h-5" />
                      </div>
                      <span className={`text-xs font-bold truncate ${isLight ? 'text-slate-700 group-hover:text-slate-900' : 'text-slate-200 group-hover:text-white'}`}>
                        Idiomas
                      </span>
                    </button>

                    {/* 10. Xadrez */}
                    <button
                      onClick={() => {
                        soundEffects.playClick();
                        handleEnterGatedMode('chess');
                      }}
                      className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-2 transition active:scale-95 shadow-sm group cursor-pointer ${
                        isLight
                          ? 'bg-white border-slate-200 hover:border-indigo-400 hover:bg-slate-50/80 shadow-xs'
                          : 'bg-[#121829] border-[#273553] hover:border-[#8b5cf6]/60 hover:bg-[#161e31]'
                      }`}
                    >
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-slate-700 to-slate-900 text-white flex items-center justify-center shadow-md text-xl group-hover:scale-105 transition">
                        ♟️
                      </div>
                      <span className={`text-xs font-bold truncate ${isLight ? 'text-slate-700 group-hover:text-slate-900' : 'text-slate-200 group-hover:text-white'}`}>
                        Xadrez
                      </span>
                    </button>

                    {/* 11. Erros & Feedback */}
                    <button
                      onClick={() => {
                        soundEffects.playClick();
                        setIsErrorFeedbackOpen(true);
                      }}
                      className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-2 transition active:scale-95 shadow-sm group cursor-pointer ${
                        isLight
                          ? 'bg-white border-rose-200 hover:border-rose-400 hover:bg-rose-50/40 shadow-xs'
                          : 'bg-[#121829] border-[#273553] hover:border-rose-500/60 hover:bg-[#161e31]'
                      }`}
                      title="Central de Erros & Feedback"
                    >
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-rose-600 to-rose-700 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition">
                        <AlertCircle className="w-5 h-5" />
                      </div>
                      <span className={`text-xs font-bold truncate ${isLight ? 'text-rose-600 group-hover:text-rose-700' : 'text-rose-300 group-hover:text-white'}`}>
                        Erros
                      </span>
                    </button>

                    {/* 12. Desafio Relâmpago (60s) - Ao lado do botão de Erros */}
                    <button
                      onClick={() => {
                        soundEffects.playClick();
                        setCurrentMode('lightning');
                      }}
                      className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-2 transition active:scale-95 shadow-sm group cursor-pointer relative ${
                        isLight
                          ? 'bg-white border-amber-300 hover:border-amber-400 hover:bg-amber-50/40 shadow-xs'
                          : 'bg-[#121829] border-amber-500/40 hover:border-amber-400 hover:bg-[#161e31]'
                      }`}
                      title="Desafio Relâmpago (60 Segundos)"
                    >
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-400 via-orange-500 to-rose-600 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition">
                        <Zap className="w-5 h-5 text-white fill-white" />
                      </div>
                      <span className={`text-xs font-bold truncate ${isLight ? 'text-amber-700 group-hover:text-amber-800' : 'text-amber-300 group-hover:text-white'}`}>
                        Relâmpago
                      </span>
                    </button>
                  </div>
                </div>

                {/* Explicador IA, Pesquisador IA, Tradutor IA, Resumos em PDF & Criar Prova Highlights */}
                <div className="space-y-2 pt-1">
                  {/* Resumos das Matérias em PDF (Apostila Completa) */}
                  <button
                    onClick={() => {
                      soundEffects.playClick();
                      setIsPdfSummariesOpen(true);
                    }}
                    className="w-full p-4 rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-purple-500 text-white flex items-center justify-between transition shadow-lg shadow-indigo-600/25 active:scale-[0.99] group cursor-pointer"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-xl shrink-0">
                        📄
                      </div>
                      <div className="text-left">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-white block">Resumos das Matérias em PDF</span>
                          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-white/25 text-white">
                            Apostila
                          </span>
                        </div>
                        <p className="text-xs text-white/80">Baixe e imprima resumos com "como se faz" e exemplos resolvidos</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-white/80 group-hover:translate-x-1 transition shrink-0" />
                  </button>

                  {/* Tradutor IA (Texto & Foto) */}
                  <button
                    onClick={() => {
                      triggerFullscreenAd('tradutor', 'Tradutor IA (Texto & Foto)', () => {
                        setCurrentMode('translator');
                      });
                    }}
                    className="w-full p-4 rounded-3xl bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 hover:from-teal-500 hover:to-cyan-500 text-white flex items-center justify-between transition shadow-lg shadow-cyan-600/20 active:scale-[0.99] group cursor-pointer"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-xl shrink-0">
                        🌐
                      </div>
                      <div className="text-left">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-white block">Tradutor IA (Texto & Foto)</span>
                          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-white/25 text-white">
                            Novo
                          </span>
                        </div>
                        <p className="text-xs text-white/80">Traduza textos, fotos de livros & ouça a pronúncia em 12 línguas</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-white/80 group-hover:translate-x-1 transition shrink-0" />
                  </button>

                  {/* Explicador IA */}
                  <button
                    onClick={() => {
                      triggerFullscreenAd('explicador', 'Explicador IA (Foto & Temas)', () => {
                        setCurrentMode('explainer');
                      });
                    }}
                    className="w-full p-4 rounded-3xl bg-gradient-to-r from-purple-600 via-indigo-600 to-violet-600 hover:from-purple-500 hover:to-indigo-500 text-white flex items-center justify-between transition shadow-lg shadow-purple-600/20 active:scale-[0.99] group cursor-pointer"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-xl shrink-0">
                        📸
                      </div>
                      <div className="text-left">
                        <span className="text-sm font-black text-white block">Explicador IA (Foto & Temas)</span>
                        <p className="text-xs text-white/80">Tire foto do tema, caderno ou trabalho & ele explica tudo detalhado</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-white/80 group-hover:translate-x-1 transition shrink-0" />
                  </button>

                  {/* Pesquisador IA */}
                  <button
                    onClick={() => {
                      triggerFullscreenAd('pesquisador', 'Pesquisador IA (Trabalhos & Projetos)', () => {
                        setCurrentMode('researcher');
                      });
                    }}
                    className="w-full p-4 rounded-3xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-blue-500 text-white flex items-center justify-between transition shadow-lg shadow-cyan-600/20 active:scale-[0.99] group cursor-pointer"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-xl shrink-0">
                        🔍
                      </div>
                      <div className="text-left">
                        <span className="text-sm font-black text-white block">Pesquisador IA (Trabalhos & Projetos)</span>
                        <p className="text-xs text-white/80">Digite para pesquisar temas e receba o trabalho completo</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-white/80 group-hover:translate-x-1 transition shrink-0" />
                  </button>

                  {/* Criar Prova com IA */}
                  <button
                    onClick={() => {
                      triggerFullscreenAd('criador_provas', 'Criador de Provas IA', () => {
                        setCurrentMode('photo_exam');
                      });
                    }}
                    className={`w-full p-4 rounded-3xl border flex items-center justify-between transition active:scale-[0.99] group cursor-pointer ${
                      isLight
                        ? 'bg-white border-slate-200 hover:border-blue-400 hover:bg-slate-50/80 shadow-xs'
                        : 'bg-[#121829] border-[#273553] hover:border-blue-500/60'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0 ${
                        isLight
                          ? 'bg-blue-50 text-blue-600 border border-blue-200'
                          : 'bg-blue-600/20 text-blue-300 border border-blue-500/40'
                      }`}>
                        📝
                      </div>
                      <div className="text-left">
                        <span className={`text-sm font-black block ${isLight ? 'text-slate-900' : 'text-white'}`}>Criar Prova com IA</span>
                        <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Tire foto do caderno ou livro e gere provas completas com nota</p>
                      </div>
                    </div>
                    <ChevronRight className={`w-5 h-5 transition shrink-0 ${isLight ? 'text-slate-400 group-hover:text-slate-700 group-hover:translate-x-1' : 'text-slate-500 group-hover:text-white group-hover:translate-x-1'}`} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===================== TAB 2: EXPLORAR ===================== */}
        {currentMode === 'tabs' && activeTab === 'explore' && (
          <ChallengesHub
            user={user}
            selectedDifficulty={selectedDifficulty}
            onSelectDifficulty={setSelectedDifficulty}
            onOpenPdfSummaries={() => setIsPdfSummariesOpen(true)}
            onOpenMoreApps={() => setIsMoreAppsOpen(true)}
            theme={appTheme}
            onSelectChallenge={(mode) => {
              if (mode === 'explainer') {
                triggerFullscreenAd('explicador', 'Explicador IA', () => setCurrentMode('explainer'));
              } else if (mode === 'photo_exam') {
                triggerFullscreenAd('criador_provas', 'Criador de Provas IA', () => setCurrentMode('photo_exam'));
              } else if (mode === 'researcher') {
                triggerFullscreenAd('pesquisador', 'Pesquisador IA', () => setCurrentMode('researcher'));
              } else if (mode === 'translator') {
                triggerFullscreenAd('tradutor', 'Tradutor IA', () => setCurrentMode('translator'));
              } else if (mode === 'journey' || mode === 'languages' || mode === 'chess') {
                handleEnterGatedMode(mode);
              } else {
                setCurrentMode(mode as any);
              }
            }}
          />
        )}

        {/* ===================== TAB 3: PROGRESSO ===================== */}
        {currentMode === 'tabs' && activeTab === 'progress' && (
          <ProgressDashboard
            totalPoints={user.totalPoints || 0}
            completedChallenges={user.completedChallenges || 0}
            totalCorrectAnswers={user.totalCorrectAnswers || 0}
            userGrade={user.grade}
            userName={user.name}
            theme={appTheme}
            customSubjects={user.customSubjects}
            onStartSession={handleStartStudySession}
            onOpenReminders={() => setIsRemindersOpen(true)}
            onOpenTrophiesAndBadges={handleOpenTrophiesAndBadges}
            onOpenReportCard={() => setIsReportCardOpen(true)}
            onOpenFocusTimer={() => setIsFocusTimerOpen(true)}
            onOpenDailyXpCelebration={(earned, goal) => {
              setDailyXpCelebration({
                isOpen: true,
                earnedXp: earned,
                goalXp: goal,
              });
            }}
            onPracticeTopic={(_topic, _subjectId) => {
              soundEffects.playClick();
              handleEnterGatedMode('journey');
            }}
          />
        )}

        {/* ===================== TAB 4: PERFIL ===================== */}
        {currentMode === 'tabs' && activeTab === 'profile' && (
          <ProfileView
            user={user}
            theme={appTheme}
            onToggleTheme={toggleTheme}
            onEditProfile={() => setIsProfileEditOpen(true)}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenTrophiesAndBadges={handleOpenTrophiesAndBadges}
            onOpenReportCard={() => setIsReportCardOpen(true)}
            onOpenCalendar={() => setIsCalendarOpen(true)}
            onOpenReminders={() => setIsRemindersOpen(true)}
            onOpenInstallApp={handleInstallAppClick}
            onOpenPdfSummaries={() => setIsPdfSummariesOpen(true)}
            onOpenSubjectCustomization={() => setIsSubjectCustomizationOpen(true)}
            onOpenLogin={() => setIsLoginOpen(true)}
            onOpenErrorFeedback={(topic) => {
              setErrorFeedbackTopic(topic);
              setIsErrorFeedbackOpen(true);
            }}
            onSelectAvatar={(avatar) => handleUpdateProfile({ avatar: avatar.emoji, avatarId: avatar.id })}
          />
        )}

        {/* ===================== INDIVIDUAL MODES SCREENS ===================== */}
        {currentMode === 'journey' && (
          <JourneyMode
            user={user}
            initialSubjectId={journeyInitialSubject}
            onBack={() => handleExitTaskWithAd('Trilha de Aprendizagem')}
            onAnswerCorrect={() => handleEarnPoints(15, false, 1)}
            onFinishLesson={(count) => {
              handleEarnPoints(50, true, count);
              handleExitTaskWithAd('Lição da Trilha Concluída', 50);
            }}
            onEarnPoints={(pts, isMajor, count) => handleEarnPoints(pts, isMajor, count)}
            onOpenSubjectCustomization={() => setIsSubjectCustomizationOpen(true)}
            onOpenErrorFeedback={(topic) => {
              setErrorFeedbackTopic(topic);
              setIsErrorFeedbackOpen(true);
            }}
          />
        )}

        {currentMode === 'explainer' && (
          <AIExplainerMode
            user={user}
            theme={appTheme}
            onBack={() => handleExitTaskWithAd('Explicador Inteligente')}
            onEarnPoints={(pts) => handleEarnPoints(pts, false, 1)}
          />
        )}

        {currentMode === 'researcher' && (
          <AIResearcherMode
            user={user}
            theme={appTheme}
            onBack={() => handleExitTaskWithAd('Pesquisador Escolar')}
            onEarnPoints={(pts) => handleEarnPoints(pts, false, 1)}
          />
        )}

        {currentMode === 'custom' && (
          <AIExplainerMode
            user={user}
            theme={appTheme}
            onBack={() => handleExitTaskWithAd('Estudo Personalizado')}
            onEarnPoints={(pts) => handleEarnPoints(pts, false, 1)}
          />
        )}

        {currentMode === 'caderno' && (
          <CadernoMode
            user={user}
            onBack={() => handleExitTaskWithAd('Caderno de Questões')}
            onEarnPoints={(pts) => handleEarnPoints(pts, true, 1)}
            onOpenChessBoard={() => handleEnterGatedMode('chess')}
          />
        )}

        {currentMode === 'simulado' && (
          <QuickExamSimuladoMode
            user={user}
            onBack={() => handleExitTaskWithAd('Simulado Rápido')}
            onEarnPoints={(pts, count) => handleEarnPoints(pts, true, count)}
          />
        )}

        {currentMode === 'languages' && (
          <LanguageLearningMode
            onBack={() => handleExitTaskWithAd('Aprendizado de Idiomas')}
            onAddScore={(pts) => handleEarnPoints(pts, false, 1)}
          />
        )}

        {currentMode === 'translator' && (
          <AITranslatorMode
            user={user}
            theme={appTheme}
            onBack={() => handleExitTaskWithAd('Tradutor Educacional')}
            onEarnPoints={(pts) => handleEarnPoints(pts, false, 1)}
          />
        )}

        {currentMode === 'photo_exam' && (
          <PhotoExamCreatorMode
            user={user}
            theme={appTheme}
            onBack={() => handleExitTaskWithAd('Criador de Provas por Foto')}
            onEarnPoints={(pts, count) => handleEarnPoints(pts, true, count)}
            onOpenReminders={() => setIsRemindersOpen(true)}
          />
        )}

        {currentMode === 'chess' && (
          <ChessMode
            user={user}
            onBack={() => handleExitTaskWithAd('Xadrez Pedagógico')}
            onEarnPoints={(pts) => handleEarnPoints(pts, true, 1)}
          />
        )}

        {currentMode === 'math' && (
          <MathChallengeMode
            user={user}
            difficulty={selectedDifficulty}
            onBack={() => handleExitTaskWithAd('Desafio de Matemática')}
            onEarnPoints={(pts, isMajor) => handleEarnPoints(pts, isMajor, 1)}
          />
        )}

        {currentMode === 'times_table' && (
          <MathTimesTableMode
            onBack={() => handleExitTaskWithAd('Tabuada Divertida')}
            onAddScore={(pts) => handleEarnPoints(pts, true, 1)}
          />
        )}

        {currentMode === 'wordsearch' && (
          <WordSearchGame
            grade={user.grade}
            theme={appTheme}
            onBack={() => handleExitTaskWithAd('Caça-Palavras Educativo')}
            onEarnPoints={(pts, isMajor) => handleEarnPoints(pts, isMajor, 1)}
          />
        )}

        {currentMode === 'puzzle' && (
          <SlidingPuzzleGame
            grade={user.grade}
            onBack={() => handleExitTaskWithAd('Quebra-Cabeça Numérico')}
            onEarnPoints={(pts, isMajor) => handleEarnPoints(pts, isMajor, 1)}
          />
        )}

        {currentMode === 'duel' && (
          <KnowledgeDuelMode
            user={user}
            theme={appTheme}
            onBack={() => handleExitTaskWithAd('Duelo do Saber')}
            onEarnPoints={(pts, isMajor, count) => handleEarnPoints(pts, isMajor, count)}
          />
        )}

        {currentMode === 'competition' && (
          <PassAndPlayMode
            user={user}
            onBack={() => handleExitTaskWithAd('Competição do Saber')}
            onAnswerCorrect={() => handleEarnPoints(10, false, 1)}
            onMatchFinished={(winnerIsUser) => {
              handleEarnPoints(winnerIsUser ? 50 : 20, true, 0);
              handleExitTaskWithAd('Competição Finalizada', winnerIsUser ? 50 : 20);
            }}
            onEarnPoints={(pts, isMajor, count) => handleEarnPoints(pts, isMajor, count)}
          />
        )}

        {currentMode === 'multiplayer' && (
          <MultiplayerMode
            user={user}
            onBack={() => handleExitTaskWithAd('Desafio Multijogador')}
            onAnswerCorrect={() => handleEarnPoints(10, false, 1)}
            onMatchFinished={(winnerIsUser) => {
              handleEarnPoints(winnerIsUser ? 50 : 20, true, 0);
              handleExitTaskWithAd('Partida Multijogador Concluída', winnerIsUser ? 50 : 20);
            }}
            onEarnPoints={(pts, isMajor, count) => handleEarnPoints(pts, isMajor, count)}
          />
        )}

        {currentMode === 'memory' && (
          <MemoryGameMode
            user={user}
            onBack={() => handleExitTaskWithAd('Jogo da Memória')}
            onEarnPoints={(pts, isMajor) => handleEarnPoints(pts, isMajor, 1)}
          />
        )}

        {currentMode === 'lightning' && (
          <LightningChallengeMode
            user={user}
            onBack={() => handleExitTaskWithAd('Desafio Relâmpago')}
            onEarnPoints={(pts, isMajor, count) => handleEarnPoints(pts, isMajor, count)}
          />
        )}
      </main>

      {/* Persistent AdMob Banner nos 5 pontos homologados (Início, Explicador, Criador de Provas, Pesquisador, Tradutor) */}
      {adMobService.isAdAllowedForMode(currentMode) && (
        <div className="w-full max-w-lg md:max-w-3xl lg:max-w-5xl xl:max-w-6xl mx-auto px-3 sm:px-4 z-20">
          <AdMobBanner
            currentMode={currentMode}
            theme={appTheme}
            onOpenPrivacy={() => setIsAdMobPrivacyOpen(true)}
          />
        </div>
      )}

      {/* Persistent Bottom Bar (Visible when on Tabs) */}
      {currentMode === 'tabs' && (
        <BottomNavBar
          activeTab={activeTab}
          onChangeTab={(tab) => setActiveTab(tab)}
          theme={appTheme}
        />
      )}

      {/* Study Reminder Toast - Uses official App Symbol (not a bell) */}
      {activeReminderToast && (
        <div className="fixed bottom-16 left-4 right-4 max-w-sm mx-auto bg-[#121829] text-white p-3 rounded-2xl shadow-xl flex items-center justify-between border border-blue-500/40 z-50 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl overflow-hidden shadow-md shrink-0 border border-blue-400/40 bg-indigo-950 flex items-center justify-center p-0.5">
              <img src="/app-logo.png" alt="Trilha do Saber" className="w-full h-full object-cover rounded-lg" />
            </div>
            <div>
              <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider block">
                Trilha do Saber • Lembrete de Estudo
              </span>
              <span className="text-xs font-black">{activeReminderToast.subjectName}</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                soundEffects.playClick();
                setActiveReminderToast(null);
                handleEnterGatedMode('journey');
              }}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
            >
              Estudar
            </button>
            <button
              onClick={() => setActiveReminderToast(null)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition"
              aria-label="Fechar lembrete"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* EXAM ALARM BANNER / MODAL - Authentic Exam Alarm with App Symbol */}
      {activeExamToast && (
        <div className="fixed inset-x-4 top-4 z-[999] max-w-md mx-auto p-4 rounded-3xl bg-[#0d121f] border-2 border-rose-500 shadow-2xl text-white animate-in slide-in-from-top-4 duration-300 ring-4 ring-rose-500/20">
          <div className="flex items-start gap-3">
            {/* App Symbol Logo Badge */}
            <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-xl shrink-0 border-2 border-amber-400 bg-indigo-950 p-0.5 flex items-center justify-center animate-pulse">
              <img src="/app-logo.png" alt="Trilha do Saber" className="w-full h-full object-cover rounded-xl" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 text-[10px] font-black uppercase tracking-wider border border-rose-500/40">
                  🚨 ALARME DE PROVA
                </span>
                <span className="text-[11px] text-amber-300 font-bold">
                  {activeExamToast.type === 'day_before' ? 'Amanhã às 12:00' : 'Hoje!'}
                </span>
              </div>

              <h4 className="text-sm font-black text-white mt-1 truncate">
                {activeExamToast.exam.title}
              </h4>
              <p className="text-xs text-slate-300">
                Matéria: <strong className="text-amber-300">{activeExamToast.exam.subjectName}</strong>
                {activeExamToast.exam.time && ` • Horário: ${activeExamToast.exam.time}`}
              </p>
              {activeExamToast.exam.topicsCovered && (
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                  Conteúdos: {activeExamToast.exam.topicsCovered}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-800">
            <button
              onClick={() => {
                notificationService.stopExamAlarm();
                setActiveExamToast(null);
              }}
              className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-black text-xs transition shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>🔕 Desligar Alarme</span>
            </button>

            <button
              onClick={() => {
                notificationService.stopExamAlarm();
                setActiveExamToast(null);
                setIsCalendarOpen(true);
              }}
              className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 hover:text-white font-bold text-xs transition border border-slate-700 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>📅 Ver Calendário</span>
            </button>
          </div>
        </div>
      )}

      {/* ALL MODALS */}
      <LoginModal
        isOpen={isLoginOpen}
        user={user}
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={(profileUpdates) => {
          handleUpdateProfile(profileUpdates);
        }}
        onRequestPermissions={() => {
          setIsPermissionsModalOpen(true);
        }}
      />

      <OnboardingModal
        isOpen={isOnboardingOpen}
        user={user}
        onSaveProfile={(profile) => {
          handleUpdateProfile(profile);
          setIsOnboardingOpen(false);
          // Always ask for permissions right after registration
          setIsPermissionsModalOpen(true);
        }}
        onComplete={() => {
          setIsOnboardingOpen(false);
          setIsPermissionsModalOpen(true);
        }}
      />

      <IntroNarratorModal
        isOpen={isIntroOpen}
        onClose={() => setIsIntroOpen(false)}
        onComplete={() => setIsIntroOpen(false)}
      />

      <ProfileEditModal
        isOpen={isProfileEditOpen}
        user={user}
        onClose={() => setIsProfileEditOpen(false)}
        onSaveProfile={handleUpdateProfile}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        user={user}
        theme={appTheme}
        onToggleTheme={toggleTheme}
        onOpenProfileEdit={() => {
          setIsSettingsOpen(false);
          setIsProfileEditOpen(true);
        }}
        onOpenReminders={() => {
          setIsSettingsOpen(false);
          setIsRemindersOpen(true);
        }}
        onOpenCalendar={() => {
          setIsSettingsOpen(false);
          setIsCalendarOpen(true);
        }}
        onOpenReportCard={() => {
          setIsSettingsOpen(false);
          setIsReportCardOpen(true);
        }}
        onOpenInstallApp={() => {
          setIsSettingsOpen(false);
          handleInstallAppClick();
        }}
        onOpenPdfSummaries={() => {
          setIsSettingsOpen(false);
          setIsPdfSummariesOpen(true);
        }}
        onOpenSubjectCustomization={() => {
          setIsSettingsOpen(false);
          setIsSubjectCustomizationOpen(true);
        }}
        onOpenErrorFeedback={() => {
          setIsSettingsOpen(false);
          setErrorFeedbackTopic(undefined);
          setIsErrorFeedbackOpen(true);
        }}
        onOpenAgeClassification={() => {
          setIsSettingsOpen(false);
          setIsAgeClassificationOpen(true);
        }}
        onOpenAdMobPrivacy={() => {
          setIsSettingsOpen(false);
          setIsAdMobPrivacyOpen(true);
        }}
        isMuted={isMuted}
        onToggleMute={() => setIsMuted(!isMuted)}
        onResetProgress={() => {
          setUser((prev) => ({
            ...prev,
            totalPoints: 0,
            completedChallenges: 0,
            totalCorrectAnswers: 0,
          }));
        }}
      />

      <StudyRemindersModal
        isOpen={isRemindersOpen}
        userGrade={user.grade}
        onClose={() => setIsRemindersOpen(false)}
        onSelectSubjectToStudy={(subjId) => {
          setIsRemindersOpen(false);
          setJourneyInitialSubject(subjId as SubjectId);
          handleEnterGatedMode('journey');
        }}
      />

      <CalendarModal
        isOpen={isCalendarOpen}
        userGrade={user.grade}
        onClose={() => setIsCalendarOpen(false)}
      />

      <TrophiesAndBadgesModal
        isOpen={isTrophiesModalOpen}
        onClose={() => setIsTrophiesModalOpen(false)}
        user={user}
        defaultTab={trophiesModalDefaultTab}
      />

      <ProgressReportModal
        isOpen={isProgressReportOpen}
        onClose={() => setIsProgressReportOpen(false)}
        user={user}
      />

      <ReportCardModal
        isOpen={isReportCardOpen}
        onClose={() => setIsReportCardOpen(false)}
        user={user}
      />

      <UnlockCelebrationModal
        unlockedItem={unlockedCelebrationItem}
        onClose={() => setUnlockedCelebrationItem(null)}
        onOpenCollection={() => {
          setIsTrophiesModalOpen(true);
        }}
      />

      <PermissionsOnboardingModal
        isOpen={isPermissionsModalOpen}
        theme={appTheme}
        onClose={() => {
          setIsPermissionsModalOpen(false);
          try {
            localStorage.setItem('estudahud_permissions_prompted', 'true');
          } catch {}
          if (!user.hasSeenIntro) {
            setIsIntroOpen(true);
            setUser((prev) => ({ ...prev, hasSeenIntro: true }));
          }
        }}
        onPermissionsGranted={() => {
          try {
            localStorage.setItem('estudahud_permissions_prompted', 'true');
          } catch {}
          if (!user.hasSeenIntro) {
            setIsIntroOpen(true);
            setUser((prev) => ({ ...prev, hasSeenIntro: true }));
          }
        }}
      />

      <FocusTimerModal
        isOpen={isFocusTimerOpen}
        onClose={() => setIsFocusTimerOpen(false)}
        onEarnPoints={(pts) => handleEarnPoints(pts, false, 0)}
      />

      <InstallAppModal
        isOpen={isInstallAppOpen}
        onClose={() => setIsInstallAppOpen(false)}
      />

      <MoreAppsModal
        isOpen={isMoreAppsOpen}
        onClose={() => setIsMoreAppsOpen(false)}
        theme={appTheme}
      />

      <SubjectSummariesPdfModal
        isOpen={isPdfSummariesOpen}
        onClose={() => setIsPdfSummariesOpen(false)}
        user={user}
      />

      {/* Matérias da Minha Escola (Biologia, Física, Química, Espanhol...) */}
      <SubjectCustomizationModal
        isOpen={isSubjectCustomizationOpen}
        onClose={() => setIsSubjectCustomizationOpen(false)}
        user={user}
        onSaveSubjects={(subjects) => {
          handleUpdateProfile({
            customSubjects: subjects,
            hasConfiguredSubjects: true,
          });
        }}
      />

      {/* Central de Erros e Feedback dos Estudantes */}
      <ErrorFeedbackModal
        isOpen={isErrorFeedbackOpen}
        onClose={() => {
          setIsErrorFeedbackOpen(false);
          setErrorFeedbackTopic(undefined);
        }}
        user={user}
        initialTopic={errorFeedbackTopic}
      />

      {/* Aviso de Limite Diário Recomendado de 2 Horas */}
      <DailyLimitNoticeModal
        isOpen={isDailyLimitModalOpen}
        onClose={() => setIsDailyLimitModalOpen(false)}
        onSnooze={(minutes) => {
          dailyTimeLimitService.snoozeNotice(minutes || 15);
          setIsDailyLimitModalOpen(false);
        }}
        todaySeconds={dailyStudySeconds}
      />

      {/* Floating 100% Daily XP Notification Toast with Confetti */}
      <DailyXp100Notification
        isOpen={!!dailyXpToast?.isOpen}
        earnedXp={dailyXpToast?.earnedXp || 0}
        goalXp={dailyXpToast?.goalXp || 100}
        streakDays={dailyXpToast?.streakDays || streakDays}
        onClose={() => setDailyXpToast(null)}
        onOpenCelebrationModal={() => {
          if (dailyXpToast) {
            setDailyXpCelebration({
              isOpen: true,
              earnedXp: dailyXpToast.earnedXp,
              goalXp: dailyXpToast.goalXp,
            });
          }
        }}
      />

      {/* Fullscreen 100% Daily XP Celebration Modal with Confetti Cannon */}
      <DailyXpCelebrationModal
        isOpen={!!dailyXpCelebration?.isOpen}
        earnedXp={dailyXpCelebration?.earnedXp || 0}
        goalXp={dailyXpCelebration?.goalXp || 100}
        streakDays={streakDays}
        onClose={() => setDailyXpCelebration(null)}
        onContinueStudying={() => setDailyXpCelebration(null)}
        onOpenProgress={() => {
          setDailyXpCelebration(null);
          setIsProgressReportOpen(true);
        }}
      />

      {/* Modal de Configuração de Faixa Etária (Política para Famílias da Google Play) */}
      <AgeClassificationModal
        isOpen={isAgeClassificationOpen}
        onClose={() => setIsAgeClassificationOpen(false)}
        theme={appTheme}
        onAgeSaved={(group) => {
          handleUpdateProfile({ ageGroup: group });
        }}
      />

      {/* Modal de Transparência e Privacidade AdMob */}
      <AdMobPrivacyModal
        isOpen={isAdMobPrivacyOpen}
        onClose={() => setIsAdMobPrivacyOpen(false)}
        onOpenAgeSettings={() => {
          setIsAdMobPrivacyOpen(false);
          setIsAgeClassificationOpen(true);
        }}
        theme={appTheme}
      />

      {/* Anúncio Intersticial ao Concluir ou Sair de Tarefas (não fica toda hora na tela) */}
      <TaskExitInterstitialAd
        isOpen={taskExitAdState.isOpen}
        taskTitle={taskExitAdState.taskTitle}
        earnedXp={taskExitAdState.earnedXp}
        isEntryAd={taskExitAdState.isEntryAd}
        onClose={handleCloseTaskExitAd}
        theme={appTheme}
      />

      {/* Modal de Chaves de Acesso (Jornada, Idiomas e Xadrez) */}
      <KeysModal
        isOpen={isKeysModalOpen}
        onClose={() => {
          setIsKeysModalOpen(false);
          setPendingGatedMode(null);
        }}
        keys={keys}
        modeContext={keysModalContext}
        theme={appTheme}
        onKeyEarned={() => {
          if (pendingGatedMode) {
            const nextMode = pendingGatedMode;
            setPendingGatedMode(null);
            setIsKeysModalOpen(false);
            keysService.useKey();
            setCurrentMode(nextMode);
          }
        }}
      />

      {/* Anúncio em Tela Cheia Oficial AdMob (Início, Explicador, Criador de Provas, Pesquisador, Tradutor) */}
      <FullscreenAdMobModal
        isOpen={fullscreenAdState.isOpen}
        placement={fullscreenAdState.placement}
        featureTitle={fullscreenAdState.featureTitle}
        onClose={handleCloseFullscreenAd}
        theme={appTheme}
      />
    </PortraitContainer>
  );
}

export default App;
