import React, { useState, useEffect } from 'react';
import { SubjectId, GradeLevel } from '../types';
import { notificationService, UpcomingReminderInfo, DAY_NAMES } from '../services/notificationService';
import { getSubjectsForGrade } from '../data/curriculumData';
import { soundEffects } from '../services/soundEffects';
import { Clock, Rocket, Calendar, ChevronRight, Bell, Sparkles, CheckCircle2 } from 'lucide-react';

interface NextReminderCardProps {
  onStartSession: (subjectId: SubjectId) => void;
  onOpenReminders?: () => void;
  userGrade?: GradeLevel;
  customSubjects?: SubjectId[];
  theme?: 'light' | 'dark';
}

const SUBJECT_THEMES: Record<string, { icon: string; gradient: string; text: string; bg: string }> = {
  matematica: { icon: '🔢', gradient: 'from-indigo-600 to-blue-600', text: 'text-indigo-400', bg: 'bg-indigo-500/15' },
  portugues: { icon: '📖', gradient: 'from-sky-600 to-indigo-600', text: 'text-sky-400', bg: 'bg-sky-500/15' },
  ingles: { icon: '🇬🇧', gradient: 'from-blue-600 to-cyan-600', text: 'text-blue-400', bg: 'bg-blue-500/15' },
  ciencias: { icon: '🧪', gradient: 'from-emerald-600 to-teal-600', text: 'text-emerald-400', bg: 'bg-emerald-500/15' },
  historia: { icon: '🏛️', gradient: 'from-rose-600 to-red-600', text: 'text-rose-400', bg: 'bg-rose-500/15' },
  geografia: { icon: '🌍', gradient: 'from-cyan-600 to-blue-600', text: 'text-cyan-400', bg: 'bg-cyan-500/15' },
  artes: { icon: '🎨', gradient: 'from-amber-500 to-pink-600', text: 'text-amber-400', bg: 'bg-amber-500/15' },
  filosofia: { icon: '💡', gradient: 'from-purple-600 to-violet-700', text: 'text-purple-400', bg: 'bg-purple-500/15' },
  fisica: { icon: '⚡', gradient: 'from-amber-600 to-yellow-600', text: 'text-amber-400', bg: 'bg-amber-500/15' },
  quimica: { icon: '🔬', gradient: 'from-teal-600 to-emerald-700', text: 'text-teal-400', bg: 'bg-teal-500/15' },
  biologia: { icon: '🧬', gradient: 'from-green-600 to-emerald-600', text: 'text-green-400', bg: 'bg-green-500/15' },
  xadrez: { icon: '♟️', gradient: 'from-slate-700 to-slate-900', text: 'text-slate-300', bg: 'bg-slate-500/15' },
  espanhol: { icon: '🇪🇸', gradient: 'from-red-500 to-amber-600', text: 'text-red-400', bg: 'bg-red-500/15' },
  italiano: { icon: '🇮🇹', gradient: 'from-emerald-600 to-red-600', text: 'text-emerald-400', bg: 'bg-emerald-500/15' },
  all: { icon: '📚', gradient: 'from-purple-600 to-indigo-600', text: 'text-purple-400', bg: 'bg-purple-500/15' },
};

export const NextReminderCard: React.FC<NextReminderCardProps> = ({
  onStartSession,
  onOpenReminders,
  userGrade = '6_fund',
  customSubjects = [],
  theme = 'light',
}) => {
  const isLight = theme === 'light';
  const [upcoming, setUpcoming] = useState<UpcomingReminderInfo | null>(() =>
    notificationService.getNextUpcomingReminder()
  );

  useEffect(() => {
    const refresh = () => {
      setUpcoming(notificationService.getNextUpcomingReminder());
    };

    refresh();
    const handleUpdate = () => refresh();
    window.addEventListener('estudahud_reminders_updated', handleUpdate);

    // Refresh every 30 seconds to keep countdown accurate
    const interval = setInterval(refresh, 30000);

    return () => {
      window.removeEventListener('estudahud_reminders_updated', handleUpdate);
      clearInterval(interval);
    };
  }, []);

  // Determine fallback subject if reminder is for 'all' or missing
  const gradeSubjects = getSubjectsForGrade(userGrade, customSubjects);
  const fallbackSubjectId: SubjectId = (gradeSubjects[0]?.id as SubjectId) || 'matematica';

  if (!upcoming) {
    // State when no reminder is active
    return (
      <div
        className={`p-4 rounded-3xl border transition shadow-sm ${
          isLight
            ? 'bg-gradient-to-br from-indigo-50/70 via-white to-purple-50/70 border-indigo-100 shadow-xs'
            : 'bg-[#121829] border-[#273553]'
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center text-lg shrink-0">
              ⏰
            </div>
            <div>
              <h4 className={`text-xs font-black uppercase tracking-wider ${isLight ? 'text-indigo-700' : 'text-indigo-400'}`}>
                Horários de Estudo
              </h4>
              <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                Nenhum lembrete ativado para os próximos dias
              </p>
            </div>
          </div>

          {onOpenReminders && (
            <button
              onClick={() => {
                soundEffects.playClick();
                onOpenReminders();
              }}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold transition active:scale-95 cursor-pointer shrink-0 shadow-xs"
            >
              Agendar Horário
            </button>
          )}
        </div>
      </div>
    );
  }

  const reminder = upcoming.reminder;
  const resolvedSubjectId: SubjectId =
    reminder.subjectId === 'all'
      ? fallbackSubjectId
      : (reminder.subjectId as SubjectId);

  const subjectMeta =
    SUBJECT_THEMES[reminder.subjectId] ||
    SUBJECT_THEMES[resolvedSubjectId] ||
    SUBJECT_THEMES['matematica'];

  const handleStart = () => {
    soundEffects.playClick();
    onStartSession(resolvedSubjectId);
  };

  const currentDayOfWeek = new Date().getDay();

  return (
    <div
      className={`p-4 sm:p-4.5 rounded-3xl border transition shadow-md relative overflow-hidden group ${
        isLight
          ? 'bg-white border-indigo-200/90 hover:border-indigo-300 shadow-indigo-100/50'
          : 'bg-[#121829] border-[#2a385c] hover:border-indigo-500/50'
      }`}
    >
      {/* Glow decorative highlight */}
      <div
        className={`absolute -top-12 -right-12 w-32 h-32 rounded-full blur-2xl pointer-events-none opacity-20 ${
          upcoming.isNow ? 'bg-emerald-500 opacity-30' : 'bg-indigo-500'
        }`}
      />

      <div className="space-y-3 relative z-10">
        {/* Card Header: Tag & Countdown Badge */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                upcoming.isNow ? 'bg-emerald-500 animate-ping' : 'bg-indigo-500'
              }`}
            />
            <span
              className={`text-[11px] font-black uppercase tracking-wider ${
                upcoming.isNow
                  ? isLight
                    ? 'text-emerald-700'
                    : 'text-emerald-400'
                  : isLight
                  ? 'text-indigo-700'
                  : 'text-indigo-400'
              }`}
            >
              {upcoming.isNow ? '🔔 Hora de Estudar!' : '⏰ Próximo Lembrete de Estudo'}
            </span>
          </div>

          <div
            className={`px-2.5 py-0.5 rounded-full text-[11px] font-black flex items-center gap-1 shrink-0 ${
              upcoming.isNow
                ? 'bg-emerald-500 text-slate-950 animate-pulse font-extrabold'
                : isLight
                ? 'bg-indigo-100/80 text-indigo-900 border border-indigo-200'
                : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
            }`}
          >
            <Clock className="w-3 h-3" />
            <span>{upcoming.timeLabel}</span>
          </div>
        </div>

        {/* Card Body: Subject & Schedule Info */}
        <div className="flex items-start gap-3">
          <div
            className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${subjectMeta.gradient} text-white flex items-center justify-center text-2xl shrink-0 shadow-md`}
          >
            {subjectMeta.icon}
          </div>

          <div className="flex-1 min-w-0 space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <h3
                className={`text-sm sm:text-base font-black truncate ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}
              >
                {reminder.subjectName || 'Matéria Agendada'}
              </h3>
              {reminder.subjectId === 'all' && (
                <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Geral
                </span>
              )}
            </div>

            <p
              className={`text-xs line-clamp-1 ${
                isLight ? 'text-slate-600' : 'text-slate-300'
              }`}
            >
              {reminder.notes || 'Revisão pedagógica com IA, teoria rápida e questões da BNCC'}
            </p>

            {/* Days of week mini-chips */}
            <div className="flex items-center gap-1 pt-1">
              {DAY_NAMES.map((d) => {
                const isScheduled = reminder.daysOfWeek.includes(d.id);
                const isCurrent = d.id === currentDayOfWeek;
                if (!isScheduled) return null;
                return (
                  <span
                    key={d.id}
                    className={`text-[9px] px-1.5 py-0.2 rounded-md font-bold ${
                      isCurrent
                        ? isLight
                          ? 'bg-indigo-600 text-white font-black'
                          : 'bg-indigo-500 text-white font-black'
                        : isLight
                        ? 'bg-slate-100 text-slate-600'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                    title={d.full}
                  >
                    {d.short}
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        {/* Action Row: Iniciar Sessão Button & Quick Adjust */}
        <div className="flex items-center gap-2 pt-1 border-t border-slate-200/60 dark:border-slate-800/80">
          <button
            onClick={handleStart}
            className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-black flex items-center justify-center gap-2 transition shadow-md shadow-indigo-600/25 active:scale-95 cursor-pointer group"
          >
            <Rocket className="w-4 h-4 group-hover:scale-110 transition-transform text-amber-300" />
            <span>Iniciar Sessão</span>
            <span className="text-[10px] font-medium text-white/80 hidden sm:inline">
              ({reminder.subjectName})
            </span>
          </button>

          {onOpenReminders && (
            <button
              onClick={() => {
                soundEffects.playClick();
                onOpenReminders();
              }}
              className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition active:scale-95 cursor-pointer shrink-0 ${
                isLight
                  ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                  : 'bg-[#161e31] hover:bg-[#1e293b] border-[#273553] text-slate-300'
              }`}
              title="Gerenciar todos os lembretes de estudo"
            >
              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Horários</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
