import React, { useState, useEffect } from 'react';
import { StudyReminder, DayOfWeek, GradeLevel, SubjectId, ReminderHistoryEntry, ReminderHistoryStatus } from '../types';
import { SUBJECTS, getSubjectsForGrade } from '../data/curriculumData';
import { notificationService, DAY_NAMES } from '../services/notificationService';
import { soundEffects } from '../services/soundEffects';
import { studyGoalService } from '../services/studyGoalService';
import { FocusSessionsManagerPanel } from './FocusSessionsManagerPanel';
import {
  Bell,
  BellRing,
  Clock,
  Calendar,
  Plus,
  Trash2,
  Check,
  X,
  Volume2,
  Mic,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Play,
  RotateCcw,
  BookOpen,
  History,
  ListFilter,
  CheckCheck,
  HelpCircle,
  Zap,
  Flame,
  Target,
} from 'lucide-react';

interface StudyRemindersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSubjectToStudy?: (subjectId: SubjectId) => void;
  userGrade?: GradeLevel;
  onStartFocusDirectly?: (durationMinutes: number) => void;
}

export const StudyRemindersModal: React.FC<StudyRemindersModalProps> = ({
  isOpen,
  onClose,
  onSelectSubjectToStudy,
  userGrade = '6_fund',
  onStartFocusDirectly,
}) => {
  const [activeTab, setActiveTab] = useState<'active' | 'focus' | 'history'>('active');
  const [reminders, setReminders] = useState<StudyReminder[]>([]);
  const [history, setHistory] = useState<ReminderHistoryEntry[]>([]);
  const [historyFilter, setHistoryFilter] = useState<'all' | 'attended' | 'dismissed'>('all');
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission | 'unsupported'>('default');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showConfirmClearHistory, setShowConfirmClearHistory] = useState(false);

  // New Reminder Form States
  const [selectedSubjectId, setSelectedSubjectId] = useState<SubjectId | 'all'>('matematica');
  const [reminderTime, setReminderTime] = useState('15:00');
  const [selectedDays, setSelectedDays] = useState<DayOfWeek[]>([1, 2, 3, 4, 5]); // Seg a Sex
  const [reminderNotes, setReminderNotes] = useState('');
  const [enableSound, setEnableSound] = useState(true);
  const [enableVoice, setEnableVoice] = useState(true);
  const [testNotificationSent, setTestNotificationSent] = useState(false);

  // Daily Study Tip PWA Push state
  const [tipPushEnabled, setTipPushEnabled] = useState(() => notificationService.isDailyTipNotificationEnabled());
  const [tipPushTime, setTipPushTime] = useState(() => notificationService.getDailyTipScheduleTime());
  const [tipTestSent, setTipTestSent] = useState(false);

  // Daily Goal Reminder state
  const [dailyGoalReminderEnabled, setDailyGoalReminderEnabled] = useState(() => notificationService.isDailyGoalReminderEnabled());
  const [dailyGoalReminderTime, setDailyGoalReminderTime] = useState(() => notificationService.getDailyGoalReminderTime());
  const [dailyGoalTestSent, setDailyGoalTestSent] = useState(false);
  const [goalData, setGoalData] = useState(() => studyGoalService.getData());
  const [webPushTesting, setWebPushTesting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setReminders(notificationService.getReminders());
      setHistory(notificationService.getHistory());
      setPermissionStatus(notificationService.getPermissionStatus());
      setTipPushEnabled(notificationService.isDailyTipNotificationEnabled());
      setTipPushTime(notificationService.getDailyTipScheduleTime());
      setDailyGoalReminderEnabled(notificationService.isDailyGoalReminderEnabled());
      setDailyGoalReminderTime(notificationService.getDailyGoalReminderTime());
      setGoalData(studyGoalService.getData());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const refreshHistory = () => {
    setHistory(notificationService.getHistory());
  };

  const handleRequestPermission = async () => {
    soundEffects.playClick();
    const granted = await notificationService.requestNotificationPermission();
    setPermissionStatus(notificationService.getPermissionStatus());
    if (granted) {
      soundEffects.playVictory();
    }
  };

  const handleSendTestNotification = () => {
    soundEffects.playClick();
    const subjName =
      selectedSubjectId === 'all'
        ? 'Todas as Matérias'
        : SUBJECTS.find((s) => s.id === selectedSubjectId)?.name || 'Matemática';

    notificationService.sendTestNotification(subjName);
    setTestNotificationSent(true);
    setTimeout(() => setTestNotificationSent(false), 3000);
    refreshHistory();
  };

  const handleToggleReminder = (id: string) => {
    soundEffects.playClick();
    notificationService.toggleReminder(id);
    setReminders(notificationService.getReminders());
  };

  const handleDeleteReminder = (id: string) => {
    soundEffects.playClick();
    notificationService.deleteReminder(id);
    setReminders(notificationService.getReminders());
  };

  const handleToggleDaySelection = (day: DayOfWeek) => {
    soundEffects.playClick();
    if (selectedDays.includes(day)) {
      if (selectedDays.length > 1) {
        setSelectedDays(selectedDays.filter((d) => d !== day));
      }
    } else {
      setSelectedDays([...selectedDays, day].sort());
    }
  };

  const handleSelectDayPreset = (preset: 'weekdays' | 'weekend' | 'all') => {
    soundEffects.playClick();
    if (preset === 'weekdays') setSelectedDays([1, 2, 3, 4, 5]);
    if (preset === 'weekend') setSelectedDays([0, 6]);
    if (preset === 'all') setSelectedDays([0, 1, 2, 3, 4, 5, 6]);
  };

  const handleAddReminderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundEffects.playClick();

    const subjectName =
      selectedSubjectId === 'all'
        ? 'Geral (Todas as Matérias)'
        : SUBJECTS.find((s) => s.id === selectedSubjectId)?.name || 'Estudos';

    notificationService.addReminder({
      subjectId: selectedSubjectId,
      subjectName,
      time: reminderTime,
      daysOfWeek: selectedDays,
      enabled: true,
      notes: reminderNotes.trim() || `Estudar ${subjectName} e praticar 10 exercícios`,
      soundAlert: enableSound,
      voiceAlert: enableVoice,
    });

    setReminders(notificationService.getReminders());
    setShowAddForm(false);
    setReminderNotes('');
  };

  const handleApplyPresetRoutine = (presetType: 'bncc' | 'daily') => {
    soundEffects.playClick();
    if (presetType === 'bncc') {
      const bnccReminders: StudyReminder[] = [
        {
          id: `rem_math_${Date.now()}`,
          subjectId: 'matematica',
          subjectName: 'Matemática',
          time: '14:00',
          daysOfWeek: [1, 3, 5], // Seg, Qua, Sex
          enabled: true,
          notes: 'Resolver 10 questões e cálculos práticos',
          soundAlert: true,
          voiceAlert: true,
        },
        {
          id: `rem_port_${Date.now() + 1}`,
          subjectId: 'portugues',
          subjectName: 'Língua Portuguesa',
          time: '15:30',
          daysOfWeek: [1, 3, 5],
          enabled: true,
          notes: 'Interpretação e gramática com IA',
          soundAlert: true,
          voiceAlert: true,
        },
        {
          id: `rem_ciencias_${Date.now() + 2}`,
          subjectId: 'ciencias',
          subjectName: 'Ciências Naturais',
          time: '17:00',
          daysOfWeek: [2, 4], // Ter e Qui
          enabled: true,
          notes: 'Conceitos científicos e experimentos',
          soundAlert: true,
          voiceAlert: true,
        },
      ];
      notificationService.saveReminders(bnccReminders);
      setReminders(bnccReminders);
    } else {
      const dailyReminders: StudyReminder[] = [
        {
          id: `rem_daily_${Date.now()}`,
          subjectId: 'all',
          subjectName: 'Todas as Matérias',
          time: '18:00',
          daysOfWeek: [1, 2, 3, 4, 5],
          enabled: true,
          notes: 'Meta diária: 10 questões para manter a ofensiva!',
          soundAlert: true,
          voiceAlert: true,
        },
      ];
      notificationService.saveReminders(dailyReminders);
      setReminders(dailyReminders);
    }
  };

  // History Actions
  const handleToggleHistoryStatus = (entry: ReminderHistoryEntry) => {
    soundEffects.playClick();
    const newStatus: ReminderHistoryStatus = entry.status === 'attended' ? 'dismissed' : 'attended';
    const note =
      newStatus === 'attended'
        ? 'Marcado como atendido pelo estudante ✅'
        : 'Marcado como ignorado pelo estudante ❌';
    notificationService.updateHistoryStatus(entry.id, newStatus, note);
    refreshHistory();
  };

  const handleDeleteHistoryItem = (id: string) => {
    soundEffects.playClick();
    notificationService.deleteHistoryEntry(id);
    refreshHistory();
  };

  const handleClearHistory = () => {
    soundEffects.playClick();
    notificationService.clearHistory();
    refreshHistory();
    setShowConfirmClearHistory(false);
  };

  const handleSimulateNewReminderTrigger = () => {
    soundEffects.playVictory();
    const randomSubjects = [
      { id: 'matematica', name: 'Matemática', notes: 'Praticar álgebra e equações' },
      { id: 'portugues', name: 'Língua Portuguesa', notes: 'Leitura e interpretação de texto' },
      { id: 'ciencias', name: 'Ciências Naturais', notes: 'Revisão de ecossistemas' },
      { id: 'historia', name: 'História', notes: 'Linha do tempo e civilizações' },
      { id: 'geografia', name: 'Geografia', notes: 'Mapas e relevo brasileiro' },
    ];
    const picked = randomSubjects[Math.floor(Math.random() * randomSubjects.length)];
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    notificationService.recordReminderHistory({
      subjectId: picked.id as SubjectId,
      subjectName: picked.name,
      time: timeStr,
      notes: picked.notes,
      status: 'attended',
      actionNote: 'Concluído: 10 exercícios realizados com sucesso (+150 XP)',
    });
    refreshHistory();
  };

  // Filtered History
  const filteredHistory = history.filter((item) => {
    if (historyFilter === 'attended') return item.status === 'attended';
    if (historyFilter === 'dismissed') return item.status === 'dismissed';
    return true;
  });

  const totalHistoryCount = history.length;
  const attendedCount = history.filter((h) => h.status === 'attended').length;
  const dismissedCount = history.filter((h) => h.status === 'dismissed').length;
  const attendanceRate = totalHistoryCount > 0 ? Math.round((attendedCount / totalHistoryCount) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl overflow-hidden border border-indigo-200 flex items-center justify-center p-0.5 shadow-xs shrink-0 bg-indigo-950">
              <img src="/app-logo.png" alt="Trilha do Saber" className="w-full h-full object-cover rounded-xl" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                Lembretes & Notificações Push
              </h3>
              <p className="text-[11px] text-slate-500">
                Horários programados e histórico de estudos
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundEffects.playClick();
              onClose();
            }}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-full transition"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Segmented Tabs Navigation: Horários Programados vs Sessões de Foco vs Histórico */}
        <div className="p-2.5 bg-slate-100/90 border-b border-slate-200">
          <div className="grid grid-cols-3 gap-1.5 bg-slate-200/80 p-1 rounded-2xl">
            <button
              onClick={() => {
                soundEffects.playClick();
                setActiveTab('active');
              }}
              className={`py-2 px-2 rounded-xl font-extrabold text-[11px] sm:text-xs flex items-center justify-center gap-1 transition ${
                activeTab === 'active'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Matérias</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                  activeTab === 'active'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-slate-300 text-slate-700'
                }`}
              >
                {reminders.filter((r) => r.enabled).length}
              </span>
            </button>

            <button
              onClick={() => {
                soundEffects.playClick();
                setActiveTab('focus');
              }}
              className={`py-2 px-2 rounded-xl font-extrabold text-[11px] sm:text-xs flex items-center justify-center gap-1 transition ${
                activeTab === 'focus'
                  ? 'bg-white text-purple-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-purple-600" />
              <span>Sessões Foco</span>
            </button>

            <button
              onClick={() => {
                soundEffects.playClick();
                setActiveTab('history');
                refreshHistory();
              }}
              className={`py-2 px-2 rounded-xl font-extrabold text-[11px] sm:text-xs flex items-center justify-center gap-1 transition ${
                activeTab === 'history'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <History className="w-3.5 h-3.5 text-indigo-600" />
              <span>Histórico</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                  activeTab === 'history'
                    ? 'bg-indigo-100 text-indigo-800'
                    : 'bg-slate-300 text-slate-700'
                }`}
              >
                {history.length}
              </span>
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* ======================= TAB 1: HORÁRIOS ATIVOS ======================= */}
          {activeTab === 'active' && (
            <>
              {/* Permission & Test Notification Banner */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base">🔔</span>
                    <div>
                      <span className="font-bold text-slate-900 text-xs block">
                        Notificações no Dispositivo
                      </span>
                      <span className="text-[10px] text-slate-600">
                        {permissionStatus === 'granted'
                          ? 'Notificações ativadas com sucesso ✅'
                          : permissionStatus === 'denied'
                          ? 'Notificações bloqueadas nas configurações do navegador ⚠️'
                          : 'Ative para receber avisos nos horários marcados'}
                      </span>
                    </div>
                  </div>

                  {permissionStatus !== 'granted' && (
                    <button
                      onClick={handleRequestPermission}
                      className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] shadow-xs transition active:scale-95 shrink-0"
                    >
                      Permitir
                    </button>
                  )}
                </div>

                {/* Test Notification Button */}
                <div className="flex items-center justify-between pt-1 border-t border-blue-200/60">
                  <span className="text-[10px] text-slate-500">
                    Som do alarme e voz da IA no alerta
                  </span>
                  <button
                    onClick={handleSendTestNotification}
                    className="px-2.5 py-1 rounded-lg bg-white border border-blue-300 hover:bg-blue-100 text-blue-800 font-bold text-[10px] flex items-center gap-1 transition shadow-xs active:scale-95"
                  >
                    {testNotificationSent ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Disparado!</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3 h-3 text-blue-600" />
                        <span>Testar Alerta Agora</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Web Push API - Lembretes com Navegador Fechado */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 border border-emerald-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-sm shadow-xs shrink-0">
                      🚀
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-slate-900 text-xs block">
                          Web Push API (Navegador Fechado)
                        </span>
                        <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase">
                          Ativo
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-600 leading-snug block mt-0.5">
                        Lembretes agendados chegam mesmo se o navegador estiver fechado ou aparelho em repouso.
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-emerald-200/60 text-[10px]">
                  <span className="text-slate-600 font-medium">
                    Sincronizado com Service Worker
                  </span>
                  <button
                    onClick={async () => {
                      soundEffects.playClick();
                      setWebPushTesting(true);
                      await notificationService.registerWebPush();
                      notificationService.testWebPushBackground(5000);
                      setTimeout(() => setWebPushTesting(false), 5500);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] flex items-center gap-1.5 transition shadow-xs active:scale-95 cursor-pointer"
                  >
                    {webPushTesting ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-white animate-spin" />
                        <span>Disparando em 5s... Feche o app para testar!</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-3.5 h-3.5" />
                        <span>Testar Web Push em 5s</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Dica de Estudo do Dia - Push PWA & Offline Service Worker */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 border border-purple-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center text-sm shadow-xs shrink-0">
                      💡
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 text-xs block">
                        Dica de Estudo do Dia (Push PWA)
                      </span>
                      <span className="text-[10px] text-slate-600">
                        Disparada diariamente via Service Worker mesmo offline
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      soundEffects.playClick();
                      const next = !tipPushEnabled;
                      setTipPushEnabled(next);
                      notificationService.setDailyTipNotificationEnabled(next);
                      if (next) {
                        notificationService.scheduleDailyTipToServiceWorker(tipPushTime);
                      }
                    }}
                    className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                      tipPushEnabled ? 'bg-purple-600' : 'bg-slate-300'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                        tipPushEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {tipPushEnabled && (
                  <div className="flex items-center justify-between pt-2 border-t border-purple-200/60 text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-purple-600" />
                      <span className="text-slate-700 font-bold">Horário de entrega:</span>
                      <input
                        type="time"
                        value={tipPushTime}
                        onChange={(e) => {
                          const val = e.target.value;
                          setTipPushTime(val);
                          notificationService.setDailyTipScheduleTime(val);
                        }}
                        className="px-2 py-0.5 rounded-lg border border-purple-300 bg-white font-bold text-purple-900 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                      />
                    </div>

                    <button
                      onClick={async () => {
                        soundEffects.playClick();
                        await notificationService.requestNotificationPermission();
                        notificationService.triggerDailyTipNotification(undefined, true);
                        setTipTestSent(true);
                        setTimeout(() => setTipTestSent(false), 3000);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-[10px] flex items-center gap-1 shadow-xs transition active:scale-95"
                    >
                      {tipTestSent ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-300" />
                          <span>Enviado!</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3 h-3 text-amber-300" />
                          <span>Testar Push Dica</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Lembrete Amigável da Meta Diária - Push PWA & Celular */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-50 via-orange-50 to-rose-50 border border-amber-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center text-sm shadow-xs shrink-0">
                      <Flame className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 text-xs block">
                        Lembrete da Meta Diária (Celular)
                      </span>
                      <span className="text-[10px] text-slate-600">
                        Avisa à noite caso ainda falte estudar para manter sua ofensiva
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      soundEffects.playClick();
                      const next = !dailyGoalReminderEnabled;
                      setDailyGoalReminderEnabled(next);
                      notificationService.setDailyGoalReminderEnabled(next);
                    }}
                    className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                      dailyGoalReminderEnabled ? 'bg-amber-500' : 'bg-slate-300'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                        dailyGoalReminderEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {dailyGoalReminderEnabled && (
                  <div className="space-y-2 pt-2 border-t border-amber-200/70 text-[11px]">
                    {/* Status de Hoje */}
                    {(() => {
                      const studiedMin = Math.floor((goalData.todaySeconds || 0) / 60);
                      const targetMin = goalData.targetMinutes || 15;
                      const isMet = studiedMin >= targetMin;
                      const remaining = Math.max(0, targetMin - studiedMin);

                      return (
                        <div
                          className={`p-2 rounded-xl border flex items-center justify-between ${
                            isMet
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                              : 'bg-white/80 border-amber-200 text-amber-900'
                          }`}
                        >
                          <div className="flex items-center gap-1.5">
                            {isMet ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Target className="w-3.5 h-3.5 text-amber-600" />
                            )}
                            <span className="font-bold">
                              {isMet
                                ? `Meta batida: ${studiedMin}/${targetMin} min (Ofensiva segura!)`
                                : `Progresso: ${studiedMin}/${targetMin} min (Faltam ${remaining} min)`}
                            </span>
                          </div>
                          <span className="font-extrabold text-[10px] bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded-md">
                            🔥 {goalData.streakDays} dias
                          </span>
                        </div>
                      );
                    })()}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        <span className="text-slate-700 font-bold">Lembrar às:</span>
                        <input
                          type="time"
                          value={dailyGoalReminderTime}
                          onChange={(e) => {
                            const val = e.target.value;
                            setDailyGoalReminderTime(val);
                            notificationService.setDailyGoalReminderTime(val);
                          }}
                          className="px-2 py-0.5 rounded-lg border border-amber-300 bg-white font-bold text-amber-900 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                        />
                      </div>

                      <button
                        onClick={async () => {
                          soundEffects.playClick();
                          await notificationService.requestNotificationPermission();
                          await notificationService.triggerDailyGoalReminder(true);
                          setDailyGoalTestSent(true);
                          setTimeout(() => setDailyGoalTestSent(false), 3000);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-[10px] flex items-center gap-1 shadow-xs transition active:scale-95"
                      >
                        {dailyGoalTestSent ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-200" />
                            <span>Enviado!</span>
                          </>
                        ) : (
                          <>
                            <img src="/app-logo.png" alt="App" className="w-3.5 h-3.5 object-cover rounded-xs" />
                            <span>Testar Push</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Routines Preset Buttons */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">
                  Rotinas Escolares Prontas
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleApplyPresetRoutine('bncc')}
                    className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition shadow-xs group"
                  >
                    <span className="font-bold text-slate-900 text-xs block group-hover:text-blue-600">
                      📚 Rotina BNCC
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      Matemática, Português e Ciências
                    </span>
                  </button>

                  <button
                    onClick={() => handleApplyPresetRoutine('daily')}
                    className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition shadow-xs group"
                  >
                    <span className="font-bold text-slate-900 text-xs block group-hover:text-blue-600">
                      ⚡ Meta Diária (18h)
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      10 exercícios todo fim de tarde
                    </span>
                  </button>
                </div>
              </div>

              {/* Scheduled Reminders List Header */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span>Seus Horários de Estudos ({reminders.length})</span>
                </span>

                {!showAddForm && (
                  <button
                    onClick={() => {
                      soundEffects.playClick();
                      setShowAddForm(true);
                    }}
                    className="px-2.5 py-1 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] flex items-center gap-1 shadow-xs transition active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Adicionar Horário</span>
                  </button>
                )}
              </div>

              {/* ADD REMINDER FORM */}
              {showAddForm && (
                <form
                  onSubmit={handleAddReminderSubmit}
                  className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-300 space-y-3 animate-in fade-in"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs">
                      Novo Horário de Estudo
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="p-1 text-slate-400 hover:text-slate-700 rounded-md"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Subject Selector */}
                  <div>
                    <label className="block font-bold text-slate-700 text-[11px] mb-1">
                      Matéria
                    </label>
                    <select
                      value={selectedSubjectId}
                      onChange={(e) => setSelectedSubjectId(e.target.value as SubjectId | 'all')}
                      className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 font-semibold focus:outline-none focus:border-blue-500"
                    >
                      <option value="all">🌟 Geral (Todas as Matérias)</option>
                      {getSubjectsForGrade(userGrade).map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Time input */}
                  <div>
                    <label className="block font-bold text-slate-700 text-[11px] mb-1">
                      Horário do Alarme / Lembrete
                    </label>
                    <input
                      type="time"
                      required
                      value={reminderTime}
                      onChange={(e) => setReminderTime(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* Days of week selector */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="font-bold text-slate-700 text-[11px]">
                        Dias da Semana
                      </label>
                      <div className="flex items-center gap-1 text-[10px]">
                        <button
                          type="button"
                          onClick={() => handleSelectDayPreset('weekdays')}
                          className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-medium"
                        >
                          Seg-Sex
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSelectDayPreset('all')}
                          className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-medium"
                        >
                          Todos
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-7 gap-1">
                      {DAY_NAMES.map((day) => {
                        const isSelected = selectedDays.includes(day.id);
                        return (
                          <button
                            key={day.id}
                            type="button"
                            onClick={() => handleToggleDaySelection(day.id)}
                            className={`py-1.5 rounded-lg font-bold text-[10px] transition border ${
                              isSelected
                                ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            {day.short}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Optional Notes */}
                  <div>
                    <label className="block font-bold text-slate-700 text-[11px] mb-1">
                      Meta de Estudo (Opcional)
                    </label>
                    <input
                      type="text"
                      value={reminderNotes}
                      onChange={(e) => setReminderNotes(e.target.value)}
                      placeholder="Ex: Fazer 10 exercícios da série e revisar teoria"
                      className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 placeholder:text-slate-400"
                    />
                  </div>

                  {/* Audio & Voice toggles */}
                  <div className="flex items-center gap-4 text-xs font-semibold text-slate-700 pt-1">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={enableSound}
                        onChange={(e) => setEnableSound(e.target.checked)}
                        className="rounded text-blue-600 focus:ring-0"
                      />
                      <span>Tocar Som 🔔</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={enableVoice}
                        onChange={(e) => setEnableVoice(e.target.checked)}
                        className="rounded text-blue-600 focus:ring-0"
                      />
                      <span>Falar com IA 🎙️</span>
                    </label>
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="flex-1 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition"
                    >
                      Salvar Horário
                    </button>
                  </div>
                </form>
              )}

              {/* List of active reminders */}
              {reminders.length === 0 ? (
                <div className="p-6 text-center bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <span className="text-3xl">⏰</span>
                  <p className="font-bold text-slate-800 text-xs">
                    Nenhum horário de estudo cadastrado
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Adicione seus horários acima para ser lembrado de praticar suas matérias!
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {reminders.map((rem) => {
                    return (
                      <div
                        key={rem.id}
                        className={`p-3.5 rounded-2xl border transition shadow-xs ${
                          rem.enabled
                            ? 'bg-white border-slate-200 hover:border-blue-300'
                            : 'bg-slate-50 border-slate-200 opacity-60'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 border ${
                                rem.enabled
                                  ? 'bg-blue-100 text-blue-900 border-blue-200'
                                  : 'bg-slate-200 text-slate-500 border-slate-300'
                              }`}
                            >
                              ⏰
                            </div>

                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm truncate">
                                  {rem.subjectName}
                                </h4>
                                <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-extrabold text-xs border border-blue-200 shrink-0">
                                  {rem.time}
                                </span>
                              </div>

                              {rem.notes && (
                                <p className="text-[11px] text-slate-500 truncate mt-0.5">
                                  {rem.notes}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Toggle switch & Delete button */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleToggleReminder(rem.id)}
                              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                                rem.enabled ? 'bg-blue-600' : 'bg-slate-300'
                              }`}
                              title={rem.enabled ? 'Desativar Lembrete' : 'Ativar Lembrete'}
                            >
                              <span
                                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                                  rem.enabled ? 'translate-x-4.5' : 'translate-x-1'
                                }`}
                              />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteReminder(rem.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                              title="Excluir Horário"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Days badges and direct study shortcut */}
                        <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-100 text-[10px]">
                          <div className="flex items-center gap-1">
                            {DAY_NAMES.map((day) => {
                              const isActiveDay = rem.daysOfWeek.includes(day.id);
                              return (
                                <span
                                  key={day.id}
                                  className={`px-1 py-0.2 rounded font-bold ${
                                    isActiveDay
                                      ? rem.enabled
                                        ? 'bg-blue-100 text-blue-800'
                                        : 'bg-slate-200 text-slate-600'
                                      : 'text-slate-300'
                                  }`}
                                >
                                  {day.short}
                                </span>
                              );
                            })}
                          </div>

                          {rem.subjectId !== 'all' && onSelectSubjectToStudy && (
                            <button
                              onClick={() => {
                                soundEffects.playClick();
                                onClose();
                                onSelectSubjectToStudy(rem.subjectId as SubjectId);
                              }}
                              className="font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                            >
                              <BookOpen className="w-3 h-3" />
                              <span>Estudar Agora</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* ======================= TAB 2: SESSÕES DE FOCO RECORRENTES ======================= */}
          {activeTab === 'focus' && (
            <div className="space-y-4 animate-in fade-in">
              <FocusSessionsManagerPanel
                onStartFocusDirectly={(duration) => {
                  onClose();
                  if (onStartFocusDirectly) {
                    onStartFocusDirectly(duration);
                  }
                }}
              />
            </div>
          )}

          {/* ======================= TAB 3: HISTÓRICO DE LEMBRETES ======================= */}
          {activeTab === 'history' && (
            <div className="space-y-3.5 animate-in fade-in">
              {/* Summary Stats Overview */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 border border-purple-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base">📊</span>
                    <span className="font-extrabold text-slate-900 text-xs">
                      Desempenho de Rotina de Estudos
                    </span>
                  </div>
                  <span className="text-[10px] font-black text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full border border-purple-200">
                    {attendanceRate}% Atendido
                  </span>
                </div>

                {/* Stat pills 3-col */}
                <div className="grid grid-cols-3 gap-2 text-center pt-1">
                  <div className="p-2 rounded-xl bg-white border border-purple-100 shadow-xs">
                    <span className="text-[10px] text-slate-500 font-bold block">Total Avisos</span>
                    <span className="text-sm font-black text-slate-800">{totalHistoryCount}</span>
                  </div>

                  <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 shadow-xs">
                    <span className="text-[10px] text-emerald-700 font-bold block">Atendidos ✅</span>
                    <span className="text-sm font-black text-emerald-800">{attendedCount}</span>
                  </div>

                  <div className="p-2 rounded-xl bg-rose-50 border border-rose-200 shadow-xs">
                    <span className="text-[10px] text-rose-700 font-bold block">Ignorados ❌</span>
                    <span className="text-sm font-black text-rose-800">{dismissedCount}</span>
                  </div>
                </div>

                <p className="text-[10px] text-slate-600 leading-snug">
                  💡 Os lembretes atendidos garantem a sua ofensiva diária e aceleram seu aprendizado na Jornada.
                </p>
              </div>

              {/* Filter Pills & Actions */}
              <div className="flex items-center justify-between gap-2 flex-wrap pt-0.5">
                {/* Filter tabs */}
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                  <button
                    onClick={() => {
                      soundEffects.playClick();
                      setHistoryFilter('all');
                    }}
                    className={`px-2 py-1 rounded-lg text-[10px] font-extrabold transition ${
                      historyFilter === 'all'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Todos ({totalHistoryCount})
                  </button>

                  <button
                    onClick={() => {
                      soundEffects.playClick();
                      setHistoryFilter('attended');
                    }}
                    className={`px-2 py-1 rounded-lg text-[10px] font-extrabold transition ${
                      historyFilter === 'attended'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-emerald-700 hover:bg-emerald-50'
                    }`}
                  >
                    Atendidos ({attendedCount})
                  </button>

                  <button
                    onClick={() => {
                      soundEffects.playClick();
                      setHistoryFilter('dismissed');
                    }}
                    className={`px-2 py-1 rounded-lg text-[10px] font-extrabold transition ${
                      historyFilter === 'dismissed'
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'text-rose-700 hover:bg-rose-50'
                    }`}
                  >
                    Ignorados ({dismissedCount})
                  </button>
                </div>

                {/* Quick actions: Simulate / Clear */}
                <div className="flex items-center gap-1.5 ml-auto">
                  <button
                    onClick={handleSimulateNewReminderTrigger}
                    className="px-2 py-1 rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-800 text-[10px] font-bold transition flex items-center gap-1 shadow-xs"
                    title="Simular conclusão de lembrete"
                  >
                    <Plus className="w-3 h-3 text-purple-700" />
                    <span>+ Registro</span>
                  </button>

                  {history.length > 0 && (
                    <button
                      onClick={() => setShowConfirmClearHistory(true)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                      title="Limpar histórico"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Confirm Clear Modal Box */}
              {showConfirmClearHistory && (
                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 space-y-2 animate-in fade-in">
                  <p className="text-xs font-bold text-rose-900">
                    Deseja limpar todo o histórico de lembretes?
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowConfirmClearHistory(false)}
                      className="px-2.5 py-1 bg-white border border-slate-200 text-slate-700 text-[11px] font-bold rounded-lg"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleClearHistory}
                      className="px-2.5 py-1 bg-rose-600 text-white text-[11px] font-bold rounded-lg shadow-xs"
                    >
                      Sim, Limpar
                    </button>
                  </div>
                </div>
              )}

              {/* History List */}
              {filteredHistory.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <span className="text-3xl">📜</span>
                  <p className="font-bold text-slate-800 text-xs">
                    {historyFilter === 'all'
                      ? 'Nenhum registro no histórico'
                      : historyFilter === 'attended'
                      ? 'Nenhum lembrete atendido ainda'
                      : 'Nenhum lembrete ignorado'}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {historyFilter === 'all'
                      ? 'Conforme os alarmes forem disparados e você estudar, o histórico será preenchido automaticamente!'
                      : 'Altere o filtro acima para ver outros registros.'}
                  </p>
                  <button
                    onClick={handleSimulateNewReminderTrigger}
                    className="mt-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-[11px] rounded-xl shadow-xs inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Adicionar Registro de Teste</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {filteredHistory.map((item) => {
                    const isAttended = item.status === 'attended';

                    return (
                      <div
                        key={item.id}
                        className={`p-3.5 rounded-2xl border transition shadow-xs ${
                          isAttended
                            ? 'bg-white border-emerald-200 hover:border-emerald-300'
                            : 'bg-white border-slate-200 hover:border-rose-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 border ${
                                isAttended
                                  ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                  : 'bg-rose-100 text-rose-800 border-rose-200'
                              }`}
                            >
                              {isAttended ? '✅' : '⏰'}
                            </div>

                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm truncate">
                                  {item.subjectName}
                                </h4>
                                <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 font-bold text-[10px] border border-slate-200 shrink-0">
                                  {item.time}
                                </span>
                              </div>

                              <span className="text-[10px] text-slate-400 font-semibold block">
                                {item.dateFormatted}
                              </span>
                            </div>
                          </div>

                          {/* Status badge button (Click to toggle status) */}
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => handleToggleHistoryStatus(item)}
                              className={`px-2.5 py-1 rounded-xl text-[10px] font-black transition border shadow-xs flex items-center gap-1 active:scale-95 ${
                                isAttended
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                                  : 'bg-rose-50 text-rose-800 border-rose-300 hover:bg-rose-100'
                              }`}
                              title="Clique para alternar entre Atendido e Ignorado"
                            >
                              {isAttended ? (
                                <>
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  <span>Atendido</span>
                                </>
                              ) : (
                                <>
                                  <XCircle className="w-3 h-3 text-rose-600" />
                                  <span>Ignorado</span>
                                </>
                              )}
                            </button>

                            <button
                              onClick={() => handleDeleteHistoryItem(item.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                              title="Remover do histórico"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Note & Action details */}
                        <div className="mt-2 pt-2 border-t border-slate-100 space-y-1">
                          {item.notes && (
                            <p className="text-[11px] text-slate-600">
                              <span className="font-bold text-slate-700">Meta: </span>
                              {item.notes}
                            </p>
                          )}

                          {item.actionNote && (
                            <p
                              className={`text-[10px] font-semibold ${
                                isAttended ? 'text-emerald-700' : 'text-slate-500'
                              }`}
                            >
                              {item.actionNote}
                            </p>
                          )}

                          {/* Shortcut to study now */}
                          <div className="flex items-center justify-between pt-1">
                            <span className="text-[9px] text-slate-400">
                              Toque no botão de status para alternar
                            </span>

                            {item.subjectId && item.subjectId !== 'all' && onSelectSubjectToStudy && (
                              <button
                                onClick={() => {
                                  soundEffects.playClick();
                                  onClose();
                                  onSelectSubjectToStudy(item.subjectId as SubjectId);
                                }}
                                className="text-blue-600 hover:text-blue-800 font-extrabold text-[10px] flex items-center gap-1"
                              >
                                <BookOpen className="w-3 h-3" />
                                <span>Praticar Matéria Agora</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between text-xs">
          <span className="text-[11px] text-slate-500">
            Salvo automaticamente no seu aparelho
          </span>
          <button
            onClick={() => {
              soundEffects.playClick();
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shadow-xs"
          >
            Concluir
          </button>
        </div>
      </div>
    </div>
  );
};
