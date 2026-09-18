import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { soundEffects } from '../services/soundEffects';
import { GRADE_LABELS } from '../data/curriculumData';
import { notificationService } from '../services/notificationService';
import { studyGoalService } from '../services/studyGoalService';
import { adMobService } from '../services/adMobService';
import { IS_TEST_MODE, getActiveBannerAdUnitId } from '../config/adMobConfig';
import {
  X,
  Settings,
  User,
  Volume2,
  VolumeX,
  Bell,
  Sparkles,
  Shield,
  Trash2,
  RotateCcw,
  Check,
  GraduationCap,
  Sliders,
  HelpCircle,
  BookOpen,
  Info,
  Laptop,
  Smartphone,
  Download,
  Moon,
  Sun,
  FileDown,
  Printer,
  AlertCircle,
  SlidersHorizontal,
  Clock,
  Target,
  Flame,
  CheckCircle2,
  ShieldCheck,
  Lock,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onOpenProfileEdit: () => void;
  onOpenReminders: () => void;
  onOpenCalendar: () => void;
  onOpenReportCard?: () => void;
  onOpenInstallApp?: () => void;
  onOpenOfflineAccess?: () => void;
  onOpenPdfSummaries?: () => void;
  onOpenErrorFeedback?: () => void;
  onOpenSubjectCustomization?: () => void;
  onOpenAgeClassification?: () => void;
  onOpenAdMobPrivacy?: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onResetProgress: () => void;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  user,
  onOpenProfileEdit,
  onOpenReminders,
  onOpenCalendar,
  onOpenReportCard,
  onOpenInstallApp,
  onOpenOfflineAccess,
  onOpenPdfSummaries,
  onOpenErrorFeedback,
  onOpenSubjectCustomization,
  onOpenAgeClassification,
  onOpenAdMobPrivacy,
  isMuted,
  onToggleMute,
  onResetProgress,
  theme = 'light',
  onToggleTheme,
}) => {
  const [speechRate, setSpeechRate] = useState<'slow' | 'normal' | 'fast'>(() => {
    return (localStorage.getItem('estudahud_speech_rate') as any) || 'normal';
  });
  const [autoNarrate, setAutoNarrate] = useState<boolean>(() => {
    return localStorage.getItem('estudahud_auto_narrate') !== 'false';
  });
  const [reminderSoundAlert, setReminderSoundAlert] = useState<boolean>(() => {
    return localStorage.getItem('estudahud_reminder_sound_alert') !== 'false';
  });
  const [dailyGoalReminderEnabled, setDailyGoalReminderEnabled] = useState<boolean>(() => {
    return notificationService.isDailyGoalReminderEnabled();
  });
  const [dailyGoalReminderTime, setDailyGoalReminderTime] = useState<string>(() => {
    return notificationService.getDailyGoalReminderTime();
  });
  const [goalTargetMinutes, setGoalTargetMinutes] = useState<number>(() => {
    return studyGoalService.getData().targetMinutes || 15;
  });
  const [goalData, setGoalData] = useState(() => studyGoalService.getData());
  const [dailyGoalTestSent, setDailyGoalTestSent] = useState<boolean>(false);
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  useEffect(() => {
    const updateGoalInfo = () => {
      setGoalData(studyGoalService.getData());
    };
    window.addEventListener('estudahud_study_seconds_added', updateGoalInfo);
    window.addEventListener('estudahud_daily_goal_reminder_config_updated', () => {
      setDailyGoalReminderEnabled(notificationService.isDailyGoalReminderEnabled());
      setDailyGoalReminderTime(notificationService.getDailyGoalReminderTime());
    });
    return () => {
      window.removeEventListener('estudahud_study_seconds_added', updateGoalInfo);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('estudahud_speech_rate', speechRate);
  }, [speechRate]);

  useEffect(() => {
    localStorage.setItem('estudahud_auto_narrate', String(autoNarrate));
  }, [autoNarrate]);

  useEffect(() => {
    localStorage.setItem('estudahud_reminder_sound_alert', String(reminderSoundAlert));
  }, [reminderSoundAlert]);

  if (!isOpen) return null;

  const handleSpeechRateChange = (rate: 'slow' | 'normal' | 'fast') => {
    soundEffects.playClick();
    setSpeechRate(rate);
  };

  const handleAutoNarrateToggle = () => {
    soundEffects.playClick();
    setAutoNarrate((prev) => !prev);
  };

  const handleToggleReminderSoundAlert = () => {
    const next = !reminderSoundAlert;
    setReminderSoundAlert(next);
    if (next) {
      soundEffects.playStudyReminderChime();
    } else {
      soundEffects.playClick();
    }
  };

  const handleTestReminderChime = () => {
    soundEffects.playStudyReminderChime();
  };

  const handleConfirmReset = () => {
    soundEffects.playError();
    onResetProgress();
    setShowConfirmReset(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 w-full max-w-md rounded-3xl p-5 shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shadow-xs">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Configurações</h3>
              <p className="text-xs text-slate-500">Preferências, perfil, offline e áudio</p>
            </div>
          </div>

          <button
            onClick={() => {
              soundEffects.playClick();
              onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. SEÇÃO DE PERFIL DO ESTUDANTE */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-indigo-600" />
              Perfil do Estudante
            </span>
            <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
              Conta Ativa
            </span>
          </div>

          <div className="flex items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-200 flex items-center justify-center text-xl font-bold shadow-xs">
                {user.avatar || '🎓'}
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-slate-900 truncate max-w-[160px]">
                  {user.name || 'Estudante'}
                </h4>
                <p className="text-xs text-indigo-600 font-semibold">
                  {GRADE_LABELS[user.grade]?.name || '6º Ano Fundamental'}
                </p>
                <p className="text-[11px] text-slate-500">
                  {user.totalPoints || 0} pts • {user.totalCorrectAnswers || 0} acertos
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                soundEffects.playClick();
                onOpenProfileEdit();
              }}
              className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition shadow-xs active:scale-95 whitespace-nowrap cursor-pointer"
            >
              Editar Perfil
            </button>
          </div>
        </div>

        {/* 2. ACESSO OFFLINE */}
        {onOpenOfflineAccess && (
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
                <Download className="w-3.5 h-3.5 text-indigo-600" />
                Cursos Offline
              </span>
              <span className="text-[10px] text-indigo-700 bg-white border border-indigo-200 px-2 py-0.5 rounded-full font-bold">
                IndexedDB + SW
              </span>
            </div>

            <div className="flex items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-bold text-slate-900 leading-tight">
                  Estudo Sem Conexão
                </h4>
                <p className="text-[10px] text-slate-600 mt-0.5">
                  Baixe simulados e aulas para estudar quando estiver sem internet.
                </p>
              </div>

              <button
                onClick={() => {
                  soundEffects.playClick();
                  onOpenOfflineAccess();
                  onClose();
                }}
                className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition active:scale-95 shrink-0 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Gerenciar</span>
              </button>
            </div>
          </div>
        )}

        {/* 3. ÁUDIO, VOZ E SONS */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Volume2 className="w-3.5 h-3.5 text-indigo-600" />
            Sons e Narração de Voz
          </span>

          {/* Efeitos Sonoros */}
          <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className={`p-2 rounded-lg ${isMuted ? 'bg-rose-50 text-rose-600' : 'bg-indigo-50 text-indigo-600'}`}>
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Efeitos Sonoros do Jogo</p>
                <p className="text-[10px] text-slate-500">Sons de cliques, acertos e vitórias</p>
              </div>
            </div>

            <button
              onClick={onToggleMute}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                isMuted
                  ? 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs'
              }`}
            >
              {isMuted ? 'Silenciado' : 'Ativado'}
            </button>
          </div>

          {/* Notificações Sonoras Curtas nos Lembretes Diários */}
          <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-lg ${reminderSoundAlert ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-400'}`}>
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Som Curto no Lembrete Diário</p>
                  <p className="text-[10px] text-slate-500">Toca um sino musical curto no horário de estudo agendado</p>
                </div>
              </div>

              <button
                onClick={handleToggleReminderSoundAlert}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  reminderSoundAlert
                    ? 'bg-amber-600 text-white hover:bg-amber-700 shadow-xs'
                    : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                }`}
              >
                {reminderSoundAlert ? 'Ativado' : 'Desativado'}
              </button>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-slate-100">
              <span className="text-[10px] text-amber-700">
                🔔 Ajuda a não perder o horário de estudos e manter a ofensiva
              </span>
              <button
                onClick={handleTestReminderChime}
                className="px-2 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 text-[10px] font-bold border border-amber-200 flex items-center gap-1 transition active:scale-95 cursor-pointer"
              >
                <Volume2 className="w-3 h-3" />
                <span>Ouvir Toque</span>
              </button>
            </div>
          </div>

          {/* Velocidade de Narração */}
          <div className="space-y-1.5 p-2.5 bg-white rounded-xl border border-slate-200 shadow-xs">
            <p className="text-xs font-bold text-slate-900">Velocidade da Voz da IA</p>
            <p className="text-[10px] text-slate-500 mb-2">Velocidade com que a inteligência artificial lê as explicações teóricas</p>

            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'slow', label: 'Lenta (0.8x)' },
                { id: 'normal', label: 'Normal (1.0x)' },
                { id: 'fast', label: 'Rápida (1.2x)' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSpeechRateChange(item.id as any)}
                  className={`py-1.5 px-2 rounded-xl text-xs font-bold text-center transition border cursor-pointer ${
                    speechRate === item.id
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 4. ROTINA E LEMBRETES */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Bell className="w-3.5 h-3.5 text-amber-600" />
            Rotina & Provas
          </span>

          {/* Lembrete Amigável da Meta Diária no Celular */}
          <div className="p-3.5 bg-gradient-to-br from-amber-50/90 via-orange-50/70 to-rose-50/50 rounded-2xl border border-amber-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-xs shrink-0">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-black text-slate-900 leading-tight">
                      Lembrete da Meta Diária
                    </h4>
                    <span className="px-1.5 py-0.2 bg-amber-200 text-amber-900 text-[9px] font-extrabold rounded-full">
                      Celular & PWA
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-600 mt-0.5">
                    Avisa no celular caso ainda falte estudar até o horário limite
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  soundEffects.playClick();
                  const next = !dailyGoalReminderEnabled;
                  setDailyGoalReminderEnabled(next);
                  notificationService.setDailyGoalReminderEnabled(next);
                }}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                  dailyGoalReminderEnabled ? 'bg-amber-500' : 'bg-slate-300'
                }`}
                aria-label="Ativar lembrete da meta diária"
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                    dailyGoalReminderEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {dailyGoalReminderEnabled && (
              <div className="space-y-2.5 pt-2 border-t border-amber-200/80">
                {/* Horário de Checagem */}
                <div className="flex items-center justify-between text-[11px] bg-white/80 p-2 rounded-xl border border-amber-100">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span className="text-slate-700 font-bold">Lembrar às:</span>
                  </div>
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

                {/* Meta Diária em Minutos */}
                <div className="space-y-1 bg-white/80 p-2 rounded-xl border border-amber-100">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-700 font-bold flex items-center gap-1">
                      <Target className="w-3 h-3 text-amber-600" />
                      Sua Meta de Hoje:
                    </span>
                    <span className="font-black text-amber-800 text-xs">
                      {goalTargetMinutes} minutos/dia
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1 pt-1">
                    {[10, 15, 20, 30].map((mins) => (
                      <button
                        key={mins}
                        type="button"
                        onClick={() => {
                          soundEffects.playClick();
                          setGoalTargetMinutes(mins);
                          studyGoalService.setTargetMinutes(mins);
                          setGoalData(studyGoalService.getData());
                        }}
                        className={`py-1 rounded-lg text-[10px] font-bold transition border cursor-pointer ${
                          goalTargetMinutes === mins
                            ? 'bg-amber-500 text-white border-amber-500 shadow-2xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-amber-50'
                        }`}
                      >
                        {mins} min
                      </button>
                    ))}
                  </div>
                </div>

                {/* Status em Tempo Real do Dia */}
                {(() => {
                  const studiedMin = Math.floor((goalData.todaySeconds || 0) / 60);
                  const targetMin = goalData.targetMinutes || 15;
                  const isMet = studiedMin >= targetMin;
                  const remaining = Math.max(0, targetMin - studiedMin);

                  return (
                    <div
                      className={`p-2 rounded-xl text-[11px] border ${
                        isMet
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                          : 'bg-amber-100/70 border-amber-200 text-amber-900'
                      }`}
                    >
                      <div className="flex items-start gap-1.5">
                        {isMet ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        ) : (
                          <Flame className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        )}
                        <div>
                          <p className="font-extrabold leading-tight">
                            {isMet
                              ? `✅ Meta diária batida hoje! (${studiedMin} de ${targetMin} min)`
                              : `⏳ Estudou ${studiedMin} de ${targetMin} min (faltam ${remaining} min)`}
                          </p>
                          <p className="text-[10px] opacity-90 mt-0.5">
                            {isMet
                              ? `Ofensiva de ${goalData.streakDays} dias protegida. Nenhuma cobrança será enviada hoje!`
                              : `Se você não atingir a meta até as ${dailyGoalReminderTime}, um lembrete amigável vibrará no seu celular.`}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Botão de Teste Imediato */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-slate-500">
                    💡 Funciona com app aberto ou no celular (PWA)
                  </span>
                  <button
                    type="button"
                    onClick={async () => {
                      soundEffects.playClick();
                      await notificationService.requestNotificationPermission();
                      await notificationService.triggerDailyGoalReminder(true);
                      setDailyGoalTestSent(true);
                      setTimeout(() => setDailyGoalTestSent(false), 3500);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-[10px] flex items-center gap-1.5 shadow-xs transition active:scale-95 cursor-pointer"
                  >
                    {dailyGoalTestSent ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200" />
                        <span>Notificação Enviada!</span>
                      </>
                    ) : (
                      <>
                        <Bell className="w-3.5 h-3.5" />
                        <span>Testar no Celular</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                soundEffects.playClick();
                onOpenReminders();
                onClose();
              }}
              className="p-3 bg-white hover:bg-amber-50 border border-slate-200 hover:border-amber-300 rounded-xl text-left transition group active:scale-95 shadow-xs cursor-pointer"
            >
              <span className="text-xs font-bold text-slate-900 block group-hover:text-amber-700 transition">
                ⏰ Horários de Estudo
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                Lembretes e foco
              </span>
            </button>

            <button
              onClick={() => {
                soundEffects.playClick();
                onOpenCalendar();
                onClose();
              }}
              className="p-3 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 rounded-xl text-left transition group active:scale-95 shadow-xs cursor-pointer"
            >
              <span className="text-xs font-bold text-slate-900 block group-hover:text-indigo-700 transition">
                📅 Calendário de Provas
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                Anotar datas de exames
              </span>
            </button>

            {onOpenReportCard && (
              <button
                onClick={() => {
                  soundEffects.playClick();
                  onOpenReportCard();
                  onClose();
                }}
                className="col-span-2 p-3 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 rounded-xl text-left transition group active:scale-95 flex items-center justify-between shadow-xs cursor-pointer"
              >
                <div>
                  <span className="text-xs font-bold text-slate-900 block group-hover:text-indigo-700 transition">
                    📊 Meu Boletim Escolar & Notas
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    Lançar notas bimestrais e metas
                  </span>
                </div>
                <GraduationCap className="w-5 h-5 text-indigo-600 shrink-0" />
              </button>
            )}

            {/* Personalizar Matérias (Biologia, Física, Química...) */}
            {onOpenSubjectCustomization && (
              <button
                onClick={() => {
                  soundEffects.playClick();
                  onOpenSubjectCustomization();
                  onClose();
                }}
                className="col-span-2 p-3 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 rounded-xl text-left transition group active:scale-95 flex items-center justify-between shadow-xs cursor-pointer"
              >
                <div>
                  <span className="text-xs font-bold text-slate-900 block group-hover:text-indigo-700 transition">
                    🧬 Matérias da Minha Escola
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    Configurar se tem Biologia, Física e Química separadas
                  </span>
                </div>
                <SlidersHorizontal className="w-5 h-5 text-indigo-600 shrink-0" />
              </button>
            )}

            {/* Central de Erros e Feedback */}
            {onOpenErrorFeedback && (
              <button
                onClick={() => {
                  soundEffects.playClick();
                  onOpenErrorFeedback();
                  onClose();
                }}
                className="col-span-2 p-3 bg-rose-50/60 hover:bg-rose-100/80 border border-rose-200 hover:border-rose-300 rounded-xl text-left transition group active:scale-95 flex items-center justify-between shadow-xs cursor-pointer"
              >
                <div>
                  <span className="text-xs font-bold text-rose-900 block group-hover:text-rose-700 transition">
                    🚨 Central de Erros & Feedback
                  </span>
                  <span className="text-[10px] text-rose-600 block mt-0.5">
                    Relatar um erro no app e acompanhar erros enviados pela comunidade
                  </span>
                </div>
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              </button>
            )}
          </div>
        </div>

        {/* 5. RESUMOS DAS MATÉRIAS EM PDF */}
        {(onOpenPdfSummaries || onOpenOfflineAccess) && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-indigo-800 uppercase tracking-wider flex items-center gap-1.5">
                <FileDown className="w-3.5 h-3.5 text-indigo-700" />
                Apostila & Resumos em PDF
              </span>
              <span className="text-[10px] text-indigo-700 bg-white border border-indigo-200 px-2 py-0.5 rounded-full font-bold">
                Passo a Passo
              </span>
            </div>

            <div className="flex items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-bold text-slate-900 leading-tight">
                  Baixar Resumos em PDF
                </h4>
                <p className="text-[10px] text-slate-600 mt-0.5">
                  Gere o PDF didático com "Como se faz" e exemplos práticos resolvidos.
                </p>
              </div>

              <button
                onClick={() => {
                  soundEffects.playClick();
                  if (onOpenPdfSummaries) onOpenPdfSummaries();
                  else if (onOpenOfflineAccess) onOpenOfflineAccess();
                  onClose();
                }}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition active:scale-95 shrink-0 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Ver PDF</span>
              </button>
            </div>
          </div>
        )}

        {/* 6. INSTALAR APLICATIVO NA TELA INICIAL (TRILHA DO SABER PWA) */}
        {onOpenInstallApp && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-emerald-700" />
                Aplicativo Trilha do Saber
              </span>
              <span className="text-[10px] text-emerald-700 bg-white border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                Atalho Rápido
              </span>
            </div>

            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl overflow-hidden border border-emerald-300/80 bg-indigo-950 shrink-0 shadow-xs">
                  <img src="/app-logo.png" alt="Trilha do Saber" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 leading-tight">
                    Instalar na Tela Inicial
                  </h4>
                  <p className="text-[10px] text-slate-600 mt-0.5">
                    Crie o atalho oficial com o logotipo da Trilha do Saber.
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  soundEffects.playClick();
                  onOpenInstallApp();
                  onClose();
                }}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition active:scale-95 shrink-0 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Instalar</span>
              </button>
            </div>
          </div>
        )}

        {/* 6. GOOGLE ADMOB & POLÍTICA PARA FAMÍLIAS (GOOGLE PLAY) */}
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Google AdMob & Política para Famílias
            </span>
            <span className="text-[10px] text-emerald-700 bg-white border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
              {IS_TEST_MODE ? 'Anúncios de Teste' : 'Produção'}
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between gap-2">
              <div>
                <span className="font-bold text-slate-900 block">Faixa Etária Configurada:</span>
                <span className="text-[11px] text-slate-600">
                  {adMobService.getAgeGroup() === 'crianca' && '🧒 Criança (Até 12 anos - Classificação G)'}
                  {adMobService.getAgeGroup() === 'adolescente' && '🧑 Adolescente (13 a 17 anos - Sem Anúncios Personalizados)'}
                  {adMobService.getAgeGroup() === 'adulto' && '🧑‍💼 Adulto (18+ anos)'}
                  {adMobService.getAgeGroup() === 'nao_informada' && '❓ Não Informada (Proteção Infantil Ativa)'}
                </span>
              </div>

              {onOpenAgeClassification && (
                <button
                  type="button"
                  onClick={() => {
                    soundEffects.playClick();
                    onOpenAgeClassification();
                  }}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer shrink-0"
                >
                  Alterar
                </button>
              )}
            </div>

            <div className="p-2.5 bg-white rounded-xl border border-emerald-100 text-[10px] text-slate-600 space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-800 font-semibold">
                <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                <span>Anúncios infantis com classificação livre (G) e sem rastreamento.</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-800 font-semibold">
                <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                <span>Zero anúncios em provas, simulados ou resolução de questões.</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-800 font-semibold">
                <Lock className="w-3 h-3 text-emerald-600 shrink-0" />
                <span>Não coletamos nem armazenamos data de nascimento ou idade exata.</span>
              </div>
            </div>

            {onOpenAdMobPrivacy && (
              <button
                type="button"
                onClick={() => {
                  soundEffects.playClick();
                  onOpenAdMobPrivacy();
                }}
                className="w-full py-1.5 text-center text-xs font-bold text-emerald-700 hover:text-emerald-900 underline cursor-pointer"
              >
                Ver Detalhes Técnicos e Política de Privacidade do AdMob
              </button>
            )}
          </div>
        </div>

        {/* 7. DADOS & SEGURANÇA */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-rose-600" />
            Gerenciamento de Dados
          </span>

          {!showConfirmReset ? (
            <button
              onClick={() => {
                soundEffects.playClick();
                setShowConfirmReset(true);
              }}
              className="w-full py-2.5 px-3 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Redefinir Pontuação e Progresso</span>
            </button>
          ) : (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-2.5 text-center">
              <p className="text-xs font-bold text-slate-900">Tem certeza que deseja zerar o progresso?</p>
              <p className="text-[10px] text-rose-700">
                Seus pontos e emblemas serão redefinidos. O nome e a série serão mantidos.
              </p>
              <div className="flex items-center gap-2 justify-center pt-1">
                <button
                  onClick={() => setShowConfirmReset(false)}
                  className="px-3 py-1.5 bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmReset}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  Sim, Zerar Progresso
                </button>
              </div>
            </div>
          )}
        </div>

        {/* SOBRE O APLICATIVO */}
        <div className="p-3 bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
          <span>Trilha do Saber • 100% Alinhado à BNCC</span>
          <span className="font-semibold">Versão 3.6</span>
        </div>
      </div>
    </div>
  );
};
