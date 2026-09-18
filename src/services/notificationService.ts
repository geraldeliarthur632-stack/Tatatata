import { StudyReminder, DayOfWeek, SubjectId, ExamEntry, ReminderHistoryEntry, ReminderHistoryStatus, FocusSessionReminder } from '../types';
import { soundEffects } from './soundEffects';
import { speechNarrator } from './speechNarrator';
import { indexedDbService } from './indexedDbService';
import { studyGoalService } from './studyGoalService';

const REMINDERS_STORAGE_KEY = 'estudahud_study_reminders_v2';
const EXAMS_STORAGE_KEY = 'estudahud_school_exams_v2';
const REMINDER_HISTORY_STORAGE_KEY = 'estudahud_study_reminder_history_v2';
const DAILY_TIP_NOTIF_ENABLED_KEY = 'estudahud_daily_tip_notif_enabled';
const DAILY_TIP_NOTIF_TIME_KEY = 'estudahud_daily_tip_notif_time';
const FOCUS_SESSIONS_STORAGE_KEY = 'estudahud_focus_session_reminders_v1';
const DAILY_GOAL_REMINDER_ENABLED_KEY = 'estudahud_daily_goal_reminder_enabled';
const DAILY_GOAL_REMINDER_TIME_KEY = 'estudahud_daily_goal_reminder_time';
const DAILY_GOAL_LAST_TRIGGERED_DATE_KEY = 'estudahud_daily_goal_last_reminded_date';

export const DAY_NAMES: { id: DayOfWeek; short: string; full: string }[] = [
  { id: 0, short: 'Dom', full: 'Domingo' },
  { id: 1, short: 'Seg', full: 'Segunda-feira' },
  { id: 2, short: 'Ter', full: 'Terça-feira' },
  { id: 3, short: 'Qua', full: 'Quarta-feira' },
  { id: 4, short: 'Qui', full: 'Quinta-feira' },
  { id: 5, short: 'Sex', full: 'Sexta-feira' },
  { id: 6, short: 'Sáb', full: 'Sábado' },
];

export interface UpcomingReminderInfo {
  reminder: StudyReminder;
  targetDate: Date;
  diffMinutes: number;
  timeLabel: string;
  isToday: boolean;
  isTomorrow: boolean;
  isNow: boolean;
}

export const DEFAULT_FOCUS_SESSIONS: FocusSessionReminder[] = [
  {
    id: 'focus_pomodoro_tarde',
    title: 'Sessão Pomodoro: Raciocínio & Cálculo',
    durationMinutes: 25,
    breakMinutes: 5,
    time: '15:00',
    daysOfWeek: [1, 2, 3, 4, 5], // Seg a Sex
    enabled: true,
    subjectId: 'matematica',
    subjectName: 'Matemática & Raciocínio',
    soundAlert: true,
    voiceAlert: true,
    technique: 'pomodoro',
    createdAt: Date.now(),
  },
  {
    id: 'focus_deepwork_noite',
    title: 'Deep Work: Leitura Crítica & Redação',
    durationMinutes: 50,
    breakMinutes: 10,
    time: '19:30',
    daysOfWeek: [2, 4], // Ter e Qui
    enabled: true,
    subjectId: 'portugues',
    subjectName: 'Português & Leitura',
    soundAlert: true,
    voiceAlert: true,
    technique: 'deep_work',
    createdAt: Date.now(),
  },
  {
    id: 'focus_sprint_sabado',
    title: 'Sprint Rápido: Revisão Semanal BNCC',
    durationMinutes: 15,
    breakMinutes: 3,
    time: '10:00',
    daysOfWeek: [6], // Sábado
    enabled: true,
    subjectId: 'all',
    subjectName: 'Revisão Geral',
    soundAlert: true,
    voiceAlert: true,
    technique: 'quick_sprint',
    createdAt: Date.now(),
  },
];

export const DEFAULT_REMINDERS: StudyReminder[] = [
  {
    id: 'rem_math_default',
    subjectId: 'matematica',
    subjectName: 'Matemática',
    time: '14:00',
    daysOfWeek: [1, 2, 3, 4, 5], // Seg a Sex
    enabled: true,
    notes: 'Resolver 10 exercícios e praticar cálculo mental',
    soundAlert: true,
    voiceAlert: true,
  },
  {
    id: 'rem_port_default',
    subjectId: 'portugues',
    subjectName: 'Língua Portuguesa',
    time: '16:00',
    daysOfWeek: [1, 2, 3, 4, 5], // Seg a Sex
    enabled: true,
    notes: 'Revisar gramática, interpretação de texto e vocabulário',
    soundAlert: true,
    voiceAlert: true,
  },
  {
    id: 'rem_ciencias_default',
    subjectId: 'ciencias',
    subjectName: 'Ciências Naturais',
    time: '18:00',
    daysOfWeek: [2, 4], // Ter e Qui
    enabled: true,
    notes: 'Estudar conceitos de física, química e biologia',
    soundAlert: true,
    voiceAlert: true,
  },
];

export const DEFAULT_REMINDER_HISTORY: ReminderHistoryEntry[] = [
  {
    id: 'hist_1',
    reminderId: 'rem_math_default',
    subjectId: 'matematica',
    subjectName: 'Matemática',
    time: '14:00',
    timestamp: Date.now() - 3600000 * 2,
    dateFormatted: 'Hoje, 14:00',
    notes: 'Resolver 10 exercícios e praticar cálculo mental',
    status: 'attended',
    actionNote: 'Concluído: 10 exercícios realizados com sucesso (+150 XP)',
  },
  {
    id: 'hist_2',
    reminderId: 'rem_port_default',
    subjectId: 'portugues',
    subjectName: 'Língua Portuguesa',
    time: '16:00',
    timestamp: Date.now() - 86400000,
    dateFormatted: 'Ontem, 16:00',
    notes: 'Revisar gramática, interpretação de texto e vocabulário',
    status: 'attended',
    actionNote: 'Concluído: Leitura e prática de interpretação',
  },
  {
    id: 'hist_3',
    reminderId: 'rem_ciencias_default',
    subjectId: 'ciencias',
    subjectName: 'Ciências Naturais',
    time: '18:00',
    timestamp: Date.now() - 86400000 * 2,
    dateFormatted: 'Anteontem, 18:00',
    notes: 'Estudar conceitos de física, química e biologia',
    status: 'dismissed',
    actionNote: 'Ignorado: Notificação dispensada pelo estudante',
  },
  {
    id: 'hist_4',
    reminderId: 'rem_math_default',
    subjectId: 'matematica',
    subjectName: 'Matemática',
    time: '14:00',
    timestamp: Date.now() - 86400000 * 3,
    dateFormatted: '20/08/2026, 14:00',
    notes: 'Resolver exercícios de fixação',
    status: 'attended',
    actionNote: 'Concluído: Praticou na Jornada BNCC',
  },
  {
    id: 'hist_5',
    reminderId: 'rem_daily_all',
    subjectId: 'all',
    subjectName: 'Todas as Matérias',
    time: '18:00',
    timestamp: Date.now() - 86400000 * 4,
    dateFormatted: '19/08/2026, 18:00',
    notes: 'Meta diária de 10 exercícios',
    status: 'dismissed',
    actionNote: 'Ignorado: Não acessou o aplicativo no horário',
  },
];

type ReminderListener = (reminder: StudyReminder) => void;
type ExamReminderListener = (exam: ExamEntry, type: 'day_before' | 'day_of') => void;
type FocusSessionListener = (session: FocusSessionReminder) => void;

class NotificationService {
  private reminders: StudyReminder[] = [];
  private focusSessions: FocusSessionReminder[] = [];
  private history: ReminderHistoryEntry[] = [];
  private exams: ExamEntry[] = [];
  private listeners: ReminderListener[] = [];
  private examListeners: ExamReminderListener[] = [];
  private focusListeners: FocusSessionListener[] = [];
  private intervalId: number | null = null;
  private lastTriggered: Record<string, boolean> = {};

  constructor() {
    this.loadReminders();
    this.loadFocusSessions();
    this.loadHistory();
    this.loadExams();
    this.initServiceWorker();
    this.startBackgroundMonitor();
  }

  // Initialize Service Worker for Native Browser Push Notifications and Background Alarms
  private async initServiceWorker() {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      try {
        const reg = await navigator.serviceWorker.register('/sw.js');
        console.log('[Push Notification] Service Worker registrado com sucesso:', reg.scope);
      } catch (err) {
        console.warn('[Push Notification] Falha ao registrar Service Worker:', err);
      }

      // Listen for background push interactions
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data?.type === 'STOP_EXAM_ALARM') {
          this.stopExamAlarm();
        } else if (event.data?.type === 'TRIGGER_EXAM_ALARM_SOUND') {
          soundEffects.playExamAlarm(true);
        }
      });

      // Synchronize alarms and reminders to Service Worker after delay
      setTimeout(() => this.syncBackgroundPushWithServiceWorker(), 1500);
    }
  }

  // Synchronize all upcoming exams and study reminders to Service Worker for background push
  public syncBackgroundPushWithServiceWorker() {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    try {
      const now = new Date();

      // 1. Schedule background Push Alarms for Exams
      for (const exam of this.exams) {
        // A. 1 day before at 12:00
        if (exam.reminderDayBeforeAtNoon && exam.date) {
          const [ey, em, ed] = exam.date.split('-').map(Number);
          const dayBeforeNoon = new Date(ey, em - 1, ed - 1, 12, 0, 0);
          const delayDayBefore = dayBeforeNoon.getTime() - now.getTime();
          if (delayDayBefore > 0 && delayDayBefore < 14 * 24 * 3600 * 1000) {
            navigator.serviceWorker.controller?.postMessage({
              type: 'SCHEDULE_EXAM_ALARM',
              payload: {
                title: `🚨 ALARME: Prova de ${exam.subjectName} amanhã!`,
                options: {
                  body: `Lembrete das 12h: Sua prova (${exam.title}) é amanhã${exam.time ? ' às ' + exam.time : ''}. Toque para desligar o alarme e revisar!`,
                  tag: `exam_alarm_${exam.id}_day_before`,
                  data: { url: '/?modal=calendar', examId: exam.id },
                },
                delayMs: delayDayBefore,
              },
            });
          }
        }

        // B. Day of exam at exam.time or 07:00
        if (exam.date) {
          const [ey, em, ed] = exam.date.split('-').map(Number);
          const [eh, emn] = (exam.time || '07:00').split(':').map(Number);
          const dayOfExam = new Date(ey, em - 1, ed, eh || 7, emn || 0, 0);
          const delayDayOf = dayOfExam.getTime() - now.getTime();
          if (delayDayOf > 0 && delayDayOf < 14 * 24 * 3600 * 1000) {
            navigator.serviceWorker.controller?.postMessage({
              type: 'SCHEDULE_EXAM_ALARM',
              payload: {
                title: `🚨 ALARME DE PROVA: Prova de ${exam.subjectName} é hoje!`,
                options: {
                  body: `Horário de prova (${exam.title})${exam.time ? ' às ' + exam.time : ''}! Toque para desligar o alarme e boa sorte!`,
                  tag: `exam_alarm_${exam.id}_day_of`,
                  data: { url: '/?modal=calendar', examId: exam.id },
                },
                delayMs: delayDayOf,
              },
            });
          }
        }
      }

      // 2. Schedule next Study Reminders across the next 7 days for background push
      const pushRemindersList: Array<{ title: string; body: string; delayMs: number; tag: string }> = [];

      for (const reminder of this.reminders) {
        if (reminder.enabled === false) continue;
        const [rh, rm] = (reminder.time || '14:00').split(':').map(Number);

        // Schedule all occurrences for the next 7 days
        for (let dayOffset = 0; dayOffset <= 7; dayOffset++) {
          const targetDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + dayOffset, rh, rm, 0);
          const targetDayOfWeek = targetDate.getDay() as DayOfWeek;

          if (reminder.daysOfWeek.includes(targetDayOfWeek)) {
            const delayMs = targetDate.getTime() - now.getTime();
            if (delayMs > 0 && delayMs < 7 * 24 * 3600 * 1000) {
              pushRemindersList.push({
                title: `🎒 Trilha do Saber: Hora de Estudar ${reminder.subjectName}!`,
                body: reminder.notes || `Seu horário programado para estudar ${reminder.subjectName} começou. Ganhe XP e suba no ranking!`,
                tag: `study_push_${reminder.id}_${targetDate.getFullYear()}_${targetDate.getMonth()}_${targetDate.getDate()}`,
                delayMs,
              });
            }
          }
        }
      }

      const sendMsg = (swTarget: ServiceWorker | null | undefined) => {
        if (!swTarget) return;
        swTarget.postMessage({
          type: 'SCHEDULE_PUSH_REMINDERS_BATCH',
          payload: { reminders: pushRemindersList },
        });
      };

      if (navigator.serviceWorker.controller) {
        sendMsg(navigator.serviceWorker.controller);
      } else {
        navigator.serviceWorker.ready.then((reg) => sendMsg(reg.active));
      }
    } catch {}
  }

  // Register Web Push API subscription
  public async registerWebPush(): Promise<boolean> {
    if (typeof window === 'undefined') return false;

    try {
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') return false;
      }

      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.ready;
        if ('pushManager' in reg) {
          try {
            await reg.pushManager.getSubscription();
          } catch {}
        }
      }

      this.syncBackgroundPushWithServiceWorker();
      return true;
    } catch {
      this.syncBackgroundPushWithServiceWorker();
      return true;
    }
  }

  // Test Web Push in background with 5-second delay
  public testWebPushBackground(delayMs: number = 5000): void {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    const payload = {
      type: 'TRIGGER_TEST_PUSH_STUDY_REMINDER',
      payload: {
        delayMs,
        body: 'Teste de Web Push: Seu lembrete de estudo agendado chegou com sucesso!',
      },
    };

    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage(payload);
    } else {
      navigator.serviceWorker.ready.then((reg) => reg.active?.postMessage(payload));
    }
  }

  // ===== STUDY REMINDERS =====
  public loadReminders(): StudyReminder[] {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem(REMINDERS_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            this.reminders = parsed;
            return this.reminders;
          }
        }
      }
    } catch {}

    this.reminders = [...DEFAULT_REMINDERS];
    this.saveReminders(this.reminders);
    return this.reminders;
  }

  public saveReminders(reminders: StudyReminder[]): void {
    this.reminders = reminders;
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(REMINDERS_STORAGE_KEY, JSON.stringify(reminders));
        window.dispatchEvent(new CustomEvent('estudahud_reminders_updated'));
      }
    } catch {}
  }

  public getReminders(): StudyReminder[] {
    return [...this.reminders];
  }

  /**
   * Retorna o próximo lembrete de estudo cronológico agendado com contagem de minutos.
   */
  public getNextUpcomingReminder(): UpcomingReminderInfo | null {
    const list = this.getReminders();
    const enabled = list.filter(
      (r) => r.enabled && Array.isArray(r.daysOfWeek) && r.daysOfWeek.length > 0
    );
    if (enabled.length === 0) return null;

    const now = new Date();
    const currentDay = now.getDay() as DayOfWeek; // 0=Dom, 1=Seg, ..., 6=Sáb
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    let bestMatch: UpcomingReminderInfo | null = null;
    let minDiff = Infinity;

    for (const rem of enabled) {
      const parts = rem.time.split(':');
      const remHour = parseInt(parts[0], 10);
      const remMin = parseInt(parts[1], 10);
      if (isNaN(remHour) || isNaN(remMin)) continue;
      const remMinutes = remHour * 60 + remMin;

      for (let dayOffset = 0; dayOffset <= 7; dayOffset++) {
        const checkDay = ((currentDay + dayOffset) % 7) as DayOfWeek;
        if (!rem.daysOfWeek.includes(checkDay)) continue;

        let diff = 0;
        if (dayOffset === 0) {
          // Se for hoje, checa se ainda vai acontecer ou se está dentro dos últimos 15 min (sessão ativa)
          if (remMinutes < currentMinutes - 15) {
            // Já passou hoje há mais de 15 min; será considerado para a próxima semana
            continue;
          }
          diff = remMinutes - currentMinutes;
        } else {
          diff = dayOffset * 24 * 60 + (remMinutes - currentMinutes);
        }

        if (diff < minDiff) {
          minDiff = diff;
          const targetDate = new Date(now.getTime() + diff * 60 * 1000);
          const isToday = dayOffset === 0;
          const isTomorrow = dayOffset === 1;
          const isNow = isToday && diff >= -15 && diff <= 25;

          let timeLabel = '';
          if (isNow) {
            timeLabel = `Agora (${rem.time})`;
          } else if (isToday) {
            if (diff > 0 && diff < 60) {
              timeLabel = `Hoje às ${rem.time} (em ${diff} min)`;
            } else if (diff >= 60) {
              const hrs = Math.floor(diff / 60);
              const remainingMins = diff % 60;
              timeLabel = `Hoje às ${rem.time} (em ~${hrs}h${remainingMins > 0 ? ` ${remainingMins}m` : ''})`;
            } else {
              timeLabel = `Hoje às ${rem.time}`;
            }
          } else if (isTomorrow) {
            timeLabel = `Amanhã às ${rem.time}`;
          } else {
            const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
            timeLabel = `${dayNames[checkDay]} às ${rem.time}`;
          }

          bestMatch = {
            reminder: rem,
            targetDate,
            diffMinutes: diff,
            timeLabel,
            isToday,
            isTomorrow,
            isNow,
          };
        }
      }
    }

    return bestMatch;
  }

  public addReminder(reminder: Omit<StudyReminder, 'id'>): StudyReminder {
    const newReminder: StudyReminder = {
      ...reminder,
      id: `rem_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    };
    const updated = [newReminder, ...this.reminders];
    this.saveReminders(updated);
    return newReminder;
  }

  public updateReminder(updatedReminder: StudyReminder): void {
    const updated = this.reminders.map((r) =>
      r.id === updatedReminder.id ? updatedReminder : r
    );
    this.saveReminders(updated);
  }

  public toggleReminder(id: string): boolean {
    let newState = false;
    const updated = this.reminders.map((r) => {
      if (r.id === id) {
        newState = !r.enabled;
        return { ...r, enabled: newState };
      }
      return r;
    });
    this.saveReminders(updated);
    return newState;
  }

  public deleteReminder(id: string): void {
    const updated = this.reminders.filter((r) => r.id !== id);
    this.saveReminders(updated);
  }

  // ===== FOCUS SESSIONS REMINDERS =====
  public loadFocusSessions(): FocusSessionReminder[] {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem(FOCUS_SESSIONS_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            this.focusSessions = parsed;
            return this.focusSessions;
          }
        }
      }
    } catch {}

    this.focusSessions = [...DEFAULT_FOCUS_SESSIONS];
    this.saveFocusSessions(this.focusSessions);
    return this.focusSessions;
  }

  public saveFocusSessions(sessions: FocusSessionReminder[]): void {
    this.focusSessions = sessions;
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(FOCUS_SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
        window.dispatchEvent(new CustomEvent('estudahud_focus_sessions_updated'));
      }
    } catch {}
  }

  public getFocusSessions(): FocusSessionReminder[] {
    return [...this.focusSessions];
  }

  public addFocusSession(session: Omit<FocusSessionReminder, 'id' | 'createdAt'>): FocusSessionReminder {
    const newSession: FocusSessionReminder = {
      ...session,
      id: `focus_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: Date.now(),
    };
    const updated = [...this.focusSessions, newSession];
    this.saveFocusSessions(updated);
    return newSession;
  }

  public updateFocusSession(updatedSession: FocusSessionReminder): void {
    const updated = this.focusSessions.map((s) =>
      s.id === updatedSession.id ? updatedSession : s
    );
    this.saveFocusSessions(updated);
  }

  public toggleFocusSession(id: string): boolean {
    let newState = false;
    const updated = this.focusSessions.map((s) => {
      if (s.id === id) {
        newState = !s.enabled;
        return { ...s, enabled: newState };
      }
      return s;
    });
    this.saveFocusSessions(updated);
    return newState;
  }

  public deleteFocusSession(id: string): void {
    const updated = this.focusSessions.filter((s) => s.id !== id);
    this.saveFocusSessions(updated);
  }

  public subscribeFocusSession(callback: FocusSessionListener): () => void {
    this.focusListeners.push(callback);
    return () => {
      this.focusListeners = this.focusListeners.filter((l) => l !== callback);
    };
  }

  // ===== REMINDER HISTORY =====
  public loadHistory(): ReminderHistoryEntry[] {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem(REMINDER_HISTORY_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            this.history = parsed;
            return this.history;
          }
        }
      }
    } catch {}

    this.history = [...DEFAULT_REMINDER_HISTORY];
    this.saveHistory(this.history);
    return this.history;
  }

  public saveHistory(history: ReminderHistoryEntry[]): void {
    this.history = history;
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(REMINDER_HISTORY_STORAGE_KEY, JSON.stringify(history));
      }
    } catch {}
  }

  public getHistory(): ReminderHistoryEntry[] {
    return [...this.history].sort((a, b) => b.timestamp - a.timestamp);
  }

  public recordReminderHistory(
    entry: Omit<ReminderHistoryEntry, 'id' | 'timestamp' | 'dateFormatted'> & {
      timestamp?: number;
      dateFormatted?: string;
    }
  ): ReminderHistoryEntry {
    const now = new Date(entry.timestamp || Date.now());
    const dateFormatted =
      entry.dateFormatted ||
      `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(
        2,
        '0'
      )}/${now.getFullYear()}, ${String(now.getHours()).padStart(2, '0')}:${String(
        now.getMinutes()
      ).padStart(2, '0')}`;

    const newHistoryItem: ReminderHistoryEntry = {
      id: `hist_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      reminderId: entry.reminderId,
      subjectId: entry.subjectId || 'all',
      subjectName: entry.subjectName,
      time: entry.time,
      timestamp: entry.timestamp || Date.now(),
      dateFormatted,
      notes: entry.notes,
      status: entry.status || 'dismissed',
      actionNote:
        entry.actionNote ||
        (entry.status === 'attended'
          ? 'Atendido: Estudou no horário'
          : 'Ignorado: Não praticou no horário agendado'),
    };

    const updated = [newHistoryItem, ...this.history.slice(0, 49)]; // keep max 50
    this.saveHistory(updated);
    return newHistoryItem;
  }

  public updateHistoryStatus(
    id: string,
    status: ReminderHistoryStatus,
    actionNote?: string
  ): void {
    const updated = this.history.map((h) => {
      if (h.id === id) {
        return {
          ...h,
          status,
          actionNote:
            actionNote ||
            (status === 'attended'
              ? 'Concluído: Marcado como estudado pelo usuário'
              : 'Ignorado: Dispensado pelo usuário'),
        };
      }
      return h;
    });
    this.saveHistory(updated);
  }

  public deleteHistoryEntry(id: string): void {
    const updated = this.history.filter((h) => h.id !== id);
    this.saveHistory(updated);
  }

  public clearHistory(): void {
    this.history = [];
    this.saveHistory([]);
  }

  // ===== EXAMS & PROVAS =====
  public loadExams(): ExamEntry[] {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem(EXAMS_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            this.exams = parsed;
            return this.exams;
          }
        }
      }
    } catch {}
    return this.exams;
  }

  public saveExams(exams: ExamEntry[]): void {
    this.exams = exams;
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(EXAMS_STORAGE_KEY, JSON.stringify(exams));
      }
    } catch {}
  }

  public getExams(): ExamEntry[] {
    return [...this.exams].sort((a, b) => a.date.localeCompare(b.date));
  }

  public addExam(exam: Omit<ExamEntry, 'id' | 'createdAt'>): ExamEntry {
    const newExam: ExamEntry = {
      ...exam,
      id: `exam_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: Date.now(),
    };
    const updated = [...this.exams, newExam];
    this.saveExams(updated);
    return newExam;
  }

  public updateExam(updatedExam: ExamEntry): void {
    const updated = this.exams.map((e) =>
      e.id === updatedExam.id ? updatedExam : e
    );
    this.saveExams(updated);
  }

  public deleteExam(id: string): void {
    const updated = this.exams.filter((e) => e.id !== id);
    this.saveExams(updated);
  }

  // ===== NOTIFICATION PERMISSIONS =====
  public getPermissionStatus(): NotificationPermission | 'unsupported' {
    try {
      if (typeof window !== 'undefined' && 'Notification' in window) {
        return Notification.permission;
      }
    } catch {}
    return 'unsupported';
  }

  public async requestNotificationPermission(): Promise<boolean> {
    try {
      if (typeof window !== 'undefined' && 'Notification' in window) {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
      }
    } catch {}
    return false;
  }

  public async requestPermission(): Promise<boolean> {
    return this.requestNotificationPermission();
  }

  public async sendDirectNotification(
    title: string,
    body: string,
    options?: Partial<NotificationOptions & { vibrate?: number[] }>
  ): Promise<void> {
    const notifOptions: any = {
      body,
      icon: '/icon.svg',
      badge: '/icon.svg',
      vibrate: [200, 100, 200],
      requireInteraction: false,
      data: { url: '/' },
      ...options,
    };

    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      'Notification' in window &&
      Notification.permission === 'granted'
    ) {
      try {
        const reg = await navigator.serviceWorker.ready;
        await reg.showNotification(title, notifOptions);
        return;
      } catch {}
    }

    if (
      typeof window !== 'undefined' &&
      'Notification' in window &&
      Notification.permission === 'granted'
    ) {
      try {
        const notif = new Notification(title, notifOptions);
        notif.onclick = () => {
          window.focus();
          notif.close();
        };
      } catch {}
    }
  }

  // Subscriptions
  public subscribe(callback: ReminderListener): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback);
    };
  }

  public addListener(callback: ReminderListener): () => void {
    return this.subscribe(callback);
  }

  public subscribeToExamReminders(callback: ExamReminderListener): () => void {
    this.examListeners.push(callback);
    return () => {
      this.examListeners = this.examListeners.filter((l) => l !== callback);
    };
  }

  public addExamListener(callback: ExamReminderListener): () => void {
    return this.subscribeToExamReminders(callback);
  }

  // Background monitor
  private startBackgroundMonitor() {
    if (typeof window === 'undefined') return;

    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
    }

    this.intervalId = window.setInterval(() => {
      this.checkAndTriggerReminders();
      this.checkAndTriggerFocusSessions();
      this.checkAndTriggerExamReminders();
      this.checkAndTriggerDailyTip();
      this.checkAndTriggerDailyGoalReminder();
    }, 15000);
  }

  // Check recurring focus sessions
  private checkAndTriggerFocusSessions() {
    const now = new Date();
    const currentDay = now.getDay() as DayOfWeek;
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const currentTimeStr = `${hours}:${minutes}`;
    const todayDateStr = now.toDateString();

    for (const session of this.focusSessions) {
      if (!session.enabled) continue;

      if (session.daysOfWeek.includes(currentDay) && session.time === currentTimeStr) {
        const triggerKey = `focus_${session.id}_${todayDateStr}_${currentTimeStr}`;
        if (!this.lastTriggered[triggerKey]) {
          this.lastTriggered[triggerKey] = true;
          this.triggerFocusSessionNotification(session);
        }
      }
    }
  }

  public triggerFocusSessionNotification(session: FocusSessionReminder, isTest = false) {
    const techniqueNames: Record<string, string> = {
      pomodoro: 'Pomodoro (25 min)',
      deep_work: 'Deep Work (50 min)',
      quick_sprint: 'Sprint Rápido (15 min)',
    };
    const techLabel = techniqueNames[session.technique] || `${session.durationMinutes} min`;

    const title = isTest
      ? `🎯 [Teste] Hora do Foco: ${session.title}`
      : `🎯 Hora da sua Sessão de Foco: ${session.title}`;

    const body = `Sua sessão de foco de ${session.durationMinutes} min (+ ${session.breakMinutes} min de pausa) está começando!\nMatéria: ${session.subjectName || 'Geral'}\nTécnica: ${techLabel}`;

    const notifOptions: any = {
      body,
      icon: '/icon.svg',
      badge: '/icon.svg',
      tag: `focus_${session.id}_${Date.now()}`,
      requireInteraction: true,
      data: { url: '/?focus=true', type: 'focus_session', session },
      actions: [
        { action: 'start_focus', title: '⏱️ Iniciar Foco Agora' },
        { action: 'snooze_5', title: '⏳ Adiar 5 min' },
      ],
    };

    // Notify registered listeners
    this.focusListeners.forEach((listener) => {
      try {
        listener(session);
      } catch {}
    });

    window.dispatchEvent(new CustomEvent('estudahud_trigger_focus_session', { detail: session }));

    // Send push / service worker notification
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'Notification' in window && Notification.permission === 'granted') {
      try {
        navigator.serviceWorker.ready.then((reg) => {
          reg.showNotification(title, notifOptions);
        }).catch(() => {
          new Notification(title, notifOptions);
        });
      } catch {
        try {
          new Notification(title, notifOptions);
        } catch {}
      }
    } else if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, notifOptions);
      } catch {}
    }

    if (session.soundAlert && this.isReminderSoundEnabled()) {
      try {
        soundEffects.playStudyReminderChime();
      } catch {}
    }

    if (session.voiceAlert) {
      try {
        speechNarrator.speak(`Hora do foco! ${session.title}. Sessão de ${session.durationMinutes} minutos com técnica ${techLabel}. Vamos começar?`);
      } catch {}
    }
  }

  // Check Daily Study Tip Notification
  private checkAndTriggerDailyTip() {
    if (!this.isDailyTipNotificationEnabled()) return;

    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const currentTimeStr = `${hours}:${minutes}`;
    const scheduledTime = this.getDailyTipScheduleTime();
    const todayDateStr = now.toDateString();

    if (currentTimeStr === scheduledTime) {
      const triggerKey = `daily_tip_${todayDateStr}_${currentTimeStr}`;
      if (!this.lastTriggered[triggerKey]) {
        this.lastTriggered[triggerKey] = true;
        this.triggerDailyTipNotification();
      }
    }
  }

  // Check if student has met their daily study goal before the configured evening hour
  private checkAndTriggerDailyGoalReminder() {
    if (!this.isDailyGoalReminderEnabled()) return;

    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const currentTimeStr = `${hours}:${minutes}`;
    const scheduledTime = this.getDailyGoalReminderTime();
    const todayDateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    // Compare configured time (e.g. 20:00)
    if (currentTimeStr === scheduledTime) {
      const triggerKey = `daily_goal_check_${todayDateStr}`;
      if (!this.lastTriggered[triggerKey]) {
        this.lastTriggered[triggerKey] = true;

        const goalData = studyGoalService.getData();
        const targetMinutes = goalData.targetMinutes || 15;
        const studiedMinutes = Math.floor((goalData.todaySeconds || 0) / 60);

        // Se o estudante ainda não cumpriu a meta do dia até este horário:
        if (studiedMinutes < targetMinutes) {
          this.triggerDailyGoalReminder(false);
        } else {
          // Meta diária já cumprida com sucesso!
          try {
            localStorage.setItem(DAILY_GOAL_LAST_TRIGGERED_DATE_KEY, todayDateStr);
          } catch {}
        }
      }
    }
  }

  // Check regular study reminders
  private checkAndTriggerReminders() {
    const now = new Date();
    const currentDay = now.getDay() as DayOfWeek;
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const currentTimeStr = `${hours}:${minutes}`;
    const todayDateStr = now.toDateString();

    for (const rem of this.reminders) {
      if (!rem.enabled) continue;

      if (rem.daysOfWeek.includes(currentDay) && rem.time === currentTimeStr) {
        const triggerKey = `${rem.id}_${todayDateStr}_${currentTimeStr}`;
        if (!this.lastTriggered[triggerKey]) {
          this.lastTriggered[triggerKey] = true;
          this.triggerReminderNotification(rem);
        }
      }
    }
  }

  // Check 1-day before exam at 12:00 or day of exam
  private checkAndTriggerExamReminders() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const currentTimeStr = `${hours}:${minutes}`;

    // Current date format YYYY-MM-DD
    const todayYear = now.getFullYear();
    const todayMonth = String(now.getMonth() + 1).padStart(2, '0');
    const todayDay = String(now.getDate()).padStart(2, '0');
    const todayStr = `${todayYear}-${todayMonth}-${todayDay}`;

    // Tomorrow date format YYYY-MM-DD
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomYear = tomorrow.getFullYear();
    const tomMonth = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const tomDay = String(tomorrow.getDate()).padStart(2, '0');
    const tomorrowStr = `${tomYear}-${tomMonth}-${tomDay}`;

    for (const exam of this.exams) {
      // 1. Check: 1 day before exam at 12:00
      if (exam.reminderDayBeforeAtNoon && exam.date === tomorrowStr && currentTimeStr === '12:00') {
        const triggerKey = `exam_day_before_${exam.id}_${todayStr}`;
        if (!this.lastTriggered[triggerKey]) {
          this.lastTriggered[triggerKey] = true;
          this.triggerExamNotification(exam, 'day_before');
        }
      }

      // 2. Check: Day of exam at 07:00 or exam time
      const checkTime = exam.time || '07:00';
      if (exam.date === todayStr && currentTimeStr === checkTime) {
        const triggerKey = `exam_day_of_${exam.id}_${todayStr}_${currentTimeStr}`;
        if (!this.lastTriggered[triggerKey]) {
          this.lastTriggered[triggerKey] = true;
          this.triggerExamNotification(exam, 'day_of');
        }
      }
    }
  }

  // Helper for Global Reminder Sound Setting
  public isReminderSoundEnabled(): boolean {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('estudahud_reminder_sound_alert');
        return saved !== 'false';
      }
    } catch {}
    return true;
  }

  public setReminderSoundEnabled(enabled: boolean): void {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('estudahud_reminder_sound_alert', String(enabled));
      }
    } catch {}
  }

  // Trigger Study Reminder Notification
  public triggerReminderNotification(reminder: StudyReminder, isTest = false) {
    const title = isTest
      ? `🎒 Trilha do Saber: Teste de Lembrete (${reminder.subjectName})`
      : `🎒 Trilha do Saber: Hora de Estudar ${reminder.subjectName}!`;

    const body = reminder.notes
      ? `${reminder.notes} • Horário: ${reminder.time}`
      : `Seu horário de estudo de ${reminder.subjectName} começou. Abra para praticar seus exercícios diários!`;

    const notifOptions: any = {
      body,
      icon: '/icon.svg',
      badge: '/icon.svg',
      tag: `study_${reminder.id}_${Date.now()}`,
      requireInteraction: true,
      vibrate: [200, 100, 200],
      data: { url: '/', reminderId: reminder.id },
      actions: [
        { action: 'study_now', title: '⚡ Estudar Agora' },
      ],
    };

    // 1. Service Worker Notification (Native Push / Background Worker API)
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'Notification' in window && Notification.permission === 'granted') {
      navigator.serviceWorker.ready
        .then((reg) => {
          reg.showNotification(title, notifOptions);
        })
        .catch(() => {
          try {
            const notif = new Notification(title, notifOptions);
            notif.onclick = () => {
              window.focus();
              notif.close();
            };
          } catch {}
        });
    } else if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        const notif = new Notification(title, notifOptions);
        notif.onclick = () => {
          window.focus();
          notif.close();
        };
      } catch {}
    }

    // Play pleasant study reminder chime if enabled in settings and reminder
    const isGloballySoundEnabled = this.isReminderSoundEnabled();
    if (reminder.soundAlert !== false && isGloballySoundEnabled) {
      try {
        soundEffects.playStudyReminderChime();
      } catch {}
    }

    if (reminder.voiceAlert !== false) {
      const voiceText = isTest
        ? `Atenção estudante! O seu sistema de notificações push está ativo e funcionando para a matéria de ${reminder.subjectName}.`
        : `Atenção estudante! Está na hora do seu horário agendado de estudos de ${reminder.subjectName}. Abra o aplicativo agora para garantir seus troféus e fazer seus exercícios!`;

      speechNarrator.speak(voiceText);
    }

    // Log to Reminder History
    try {
      this.recordReminderHistory({
        reminderId: reminder.id,
        subjectId: reminder.subjectId,
        subjectName: reminder.subjectName,
        time: reminder.time,
        notes: reminder.notes,
        status: isTest ? 'attended' : 'dismissed',
        actionNote: isTest
          ? 'Teste realizado com sucesso ✅ (Push Service Worker)'
          : 'Lembrete disparado • Notificação enviada em segundo plano',
      });
    } catch {}

    this.listeners.forEach((listener) => {
      try {
        listener(reminder);
      } catch {}
    });
  }

  // Trigger Exam Notification (1 day before at 12:00 or day of exam) - ACTS AS ALARM!
  public triggerExamNotification(exam: ExamEntry, type: 'day_before' | 'day_of', isTest = false) {
    const isDayBefore = type === 'day_before';

    const title = isTest
      ? `🚨 ALARME: Teste de Prova de ${exam.subjectName}`
      : isDayBefore
      ? `🚨 ALARME DE PROVA: ${exam.subjectName} amanhã!`
      : `🚨 ALARME DE PROVA: ${exam.subjectName} é hoje!`;

    const body = isDayBefore
      ? `Lembrete das 12:00: Sua prova de ${exam.subjectName} (${exam.title}) é amanhã${exam.time ? ' às ' + exam.time : ''}! Toque para desligar o alarme e revisar.`
      : `Horário de Prova: ${exam.subjectName} (${exam.title})${exam.time ? ' às ' + exam.time : ''}! Toque para desligar o alarme e boa sorte!`;

    const notifOptions: any = {
      body,
      icon: '/icon.svg',
      badge: '/icon.svg',
      tag: `exam_alarm_${exam.id}_${type}_${Date.now()}`,
      requireInteraction: true,
      vibrate: [300, 100, 300, 100, 300, 100, 500],
      data: { url: '/?modal=calendar', examId: exam.id, isExamAlarm: true },
      actions: [
        { action: 'stop_alarm', title: '🔕 Desligar Alarme' },
        { action: 'open_exam', title: '📝 Ver Prova' },
      ],
    };

    // 1. Browser Push with Service Worker (in background & foreground)
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'Notification' in window && Notification.permission === 'granted') {
      navigator.serviceWorker.ready
        .then((reg) => {
          reg.showNotification(title, notifOptions);
        })
        .catch(() => {
          try {
            const notif = new Notification(title, notifOptions);
            notif.onclick = () => {
              window.focus();
              notif.close();
            };
          } catch {}
        });
    } else if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        const notif = new Notification(title, notifOptions);
        notif.onclick = () => {
          window.focus();
          notif.close();
        };
      } catch {}
    }

    // 2. Authentic Digital Exam Alarm Sound (loops until dismissed!)
    try {
      soundEffects.playExamAlarm(true);
    } catch {}

    // 3. Broadcast Exam Alarm Active event so in-app UI can show alarm dismiss modal
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('estudahud_exam_alarm_active', {
          detail: { exam, type, isTest },
        })
      );
    }

    // 4. Voice Narrator
    const voiceText = isTest
      ? `Atenção estudante! Alarme de prova disparado para ${exam.subjectName}. O alarme sonoro e as notificações em segundo plano em push estão ativos.`
      : isDayBefore
      ? `Atenção estudante! Alarme do meio dia: a sua prova de ${exam.subjectName} é amanhã! Abra a Trilha do Saber para fazer sua revisão e praticar exercícios agora.`
      : `Atenção estudante! Alarme de prova: hoje é o dia da sua prova de ${exam.subjectName}! Respira fundo, revise suas anotações e tenha uma excelente prova!`;

    speechNarrator.speak(voiceText);

    // 5. In-App Exam Listeners
    this.examListeners.forEach((listener) => {
      try {
        listener(exam, type);
      } catch {}
    });
  }

  // Stop the continuous exam alarm sound and dismiss active state
  public stopExamAlarm() {
    try {
      soundEffects.stopExamAlarm();
      speechNarrator.stop();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('estudahud_exam_alarm_stopped'));
      }
    } catch {}
  }

  // Immediate Test for Exam Reminder
  public sendTestExamNotification(subjectName = 'Matemática', title = 'Prova Bimestral') {
    const testExam: ExamEntry = {
      id: 'test_exam',
      subjectId: 'matematica',
      subjectName,
      title,
      date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      time: '08:00',
      reminderDayBeforeAtNoon: true,
      notes: 'Conteúdo: Capítulos 1 a 4 e exercícios de fixação',
      createdAt: Date.now(),
    };

    this.triggerExamNotification(testExam, 'day_before', true);
  }

  public sendTestNotification(subjectName = 'Matemática') {
    const testReminder: StudyReminder = {
      id: 'test_reminder',
      subjectId: 'matematica',
      subjectName,
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
      enabled: true,
      notes: 'Notificação de teste com som e voz da IA!',
      soundAlert: true,
      voiceAlert: true,
    };

    this.triggerReminderNotification(testReminder, true);
  }

  // ===== DAILY STUDY TIPS PUSH & LOCAL NOTIFICATIONS =====
  public isDailyTipNotificationEnabled(): boolean {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem(DAILY_TIP_NOTIF_ENABLED_KEY);
        return saved !== 'false'; // Enabled by default
      }
    } catch {}
    return true;
  }

  public setDailyTipNotificationEnabled(enabled: boolean): void {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(DAILY_TIP_NOTIF_ENABLED_KEY, String(enabled));
      }
    } catch {}

    // Persist to IndexedDB
    indexedDbService.savePushSchedule({
      id: 'daily_study_tip_schedule',
      type: 'daily_tip',
      time: this.getDailyTipScheduleTime(),
      days: [0, 1, 2, 3, 4, 5, 6],
      enabled,
    });
  }

  public getDailyTipScheduleTime(): string {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem(DAILY_TIP_NOTIF_TIME_KEY);
        if (saved) return saved;
      }
    } catch {}
    return '09:00'; // Default 09:00 AM
  }

  public setDailyTipScheduleTime(time: string): void {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(DAILY_TIP_NOTIF_TIME_KEY, time);
      }
    } catch {}

    // Schedule to IndexedDB & Service Worker
    this.scheduleDailyTipToServiceWorker(time);
  }

  // Schedule next notification in Service Worker
  public async scheduleDailyTipToServiceWorker(timeStr?: string, tip?: { topic?: string; tip?: string }) {
    const targetTime = timeStr || this.getDailyTipScheduleTime();
    const [h, m] = targetTime.split(':').map(Number);
    const now = new Date();
    const scheduled = new Date();
    scheduled.setHours(h || 9, m || 0, 0, 0);

    if (scheduled.getTime() <= now.getTime()) {
      // Move to tomorrow if time has already passed today
      scheduled.setDate(scheduled.getDate() + 1);
    }

    const delayMs = scheduled.getTime() - now.getTime();

    // Register schedule in IndexedDB
    indexedDbService.savePushSchedule({
      id: 'daily_study_tip_schedule',
      type: 'daily_tip',
      time: targetTime,
      days: [0, 1, 2, 3, 4, 5, 6],
      enabled: this.isDailyTipNotificationEnabled(),
      payload: tip,
    });

    // Post schedule message to Service Worker via controller or ready promise
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      const msgPayload = {
        type: 'SCHEDULE_DAILY_TIP',
        payload: {
          title: `💡 Dica de Estudo do Dia: ${tip?.topic || 'Estratégia de Aprendizagem'}`,
          delayMs,
          options: {
            body: tip?.tip || 'Abra o Let\'s Study para conferir a dica de ouro de hoje e turbinar seus estudos!',
            data: { url: '/?tab=study_tips', type: 'daily_tip', tip },
            actions: [
              { action: 'open_tip', title: '💡 Ver Dica' },
              { action: 'listen_tip', title: '🔊 Ouvir Dica' },
              { action: 'study_now', title: '🚀 Praticar' },
            ],
          },
        },
      };

      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage(msgPayload);
      }

      navigator.serviceWorker.ready.then((reg) => {
        if (reg.active) {
          reg.active.postMessage(msgPayload);
        }
      }).catch(() => {});
    }
  }

  // Trigger Daily Tip Push Notification
  public async triggerDailyTipNotification(
    tip?: { topic?: string; tip?: string; actionableStep?: string; targetSubject?: string },
    isTest = false
  ) {
    const topic = tip?.topic || 'Estratégia de Aprendizagem';
    const tipText = tip?.tip || 'Praticar 10 minutos por dia todos os dias é 3x mais eficaz do que estudar horas acumuladas na véspera da prova!';
    const actionStep = tip?.actionableStep || 'Resolva seus exercícios diários e garanta seus 100 XP!';

    const title = isTest
      ? `💡 Teste de Push: Dica do Dia (${topic})`
      : `💡 Dica de Estudo do Dia: ${topic}`;

    const body = `${tipText}\n\n👉 Passo de hoje: ${actionStep}`;

    const notifOptions: any = {
      body,
      icon: '/icon.svg',
      badge: '/icon.svg',
      tag: `daily_tip_${Date.now()}`,
      requireInteraction: true,
      data: { url: '/?tab=study_tips', type: 'daily_tip', tip },
      actions: [
        { action: 'open_tip', title: '💡 Ver Dica' },
        { action: 'listen_tip', title: '🔊 Ouvir Dica' },
        { action: 'study_now', title: '🚀 Praticar' },
      ],
    };

    // Save to IndexedDB
    indexedDbService.saveStudyTip({
      tip: tipText,
      topic,
      actionableStep: actionStep,
      targetSubject: tip?.targetSubject || 'Geral',
      timestamp: Date.now(),
      read: true,
    });

    // 1. Service Worker Notification
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'Notification' in window && Notification.permission === 'granted') {
      try {
        const reg = await navigator.serviceWorker.ready;
        await reg.showNotification(title, notifOptions);
      } catch {
        try {
          const notif = new Notification(title, notifOptions);
          notif.onclick = () => {
            window.focus();
            notif.close();
          };
        } catch {}
      }
    } else if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        const notif = new Notification(title, notifOptions);
        notif.onclick = () => {
          window.focus();
          notif.close();
        };
      } catch {}
    }

    // Play chime sound
    if (this.isReminderSoundEnabled()) {
      try {
        soundEffects.playStudyReminderChime();
      } catch {}
    }

    // Read by voice if test
    if (isTest) {
      speechNarrator.speak(`Dica de estudo do dia: ${topic}. ${tipText}`);
    }
  }

  // ===== DAILY GOAL LOCAL NOTIFICATION SERVICE =====

  public isDailyGoalReminderEnabled(): boolean {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem(DAILY_GOAL_REMINDER_ENABLED_KEY);
        // Default is enabled (true) to help students protect their daily streak
        return saved !== 'false';
      }
    } catch {}
    return true;
  }

  public setDailyGoalReminderEnabled(enabled: boolean): void {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(DAILY_GOAL_REMINDER_ENABLED_KEY, String(enabled));
        window.dispatchEvent(new CustomEvent('estudahud_daily_goal_reminder_config_updated'));
      }
    } catch {}

    if (enabled) {
      this.scheduleDailyGoalReminderToServiceWorker();
    }
  }

  public getDailyGoalReminderTime(): string {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem(DAILY_GOAL_REMINDER_TIME_KEY);
        if (saved) return saved;
      }
    } catch {}
    // Default 20:00 (8:00 PM) - friendly evening check before bed to maintain daily streak
    return '20:00';
  }

  public setDailyGoalReminderTime(time: string): void {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(DAILY_GOAL_REMINDER_TIME_KEY, time);
        window.dispatchEvent(new CustomEvent('estudahud_daily_goal_reminder_config_updated'));
      }
    } catch {}

    this.scheduleDailyGoalReminderToServiceWorker(time);
  }

  /**
   * Schedules a background alarm/notification in the Service Worker
   * so that mobile devices (Android/iOS PWA) can receive the alarm.
   */
  public async scheduleDailyGoalReminderToServiceWorker(timeStr?: string) {
    const targetTime = timeStr || this.getDailyGoalReminderTime();
    const [h, m] = targetTime.split(':').map(Number);
    const now = new Date();
    const scheduled = new Date();
    scheduled.setHours(h || 20, m || 0, 0, 0);

    if (scheduled.getTime() <= now.getTime()) {
      // Move to next day if the time has already passed today
      scheduled.setDate(scheduled.getDate() + 1);
    }

    const delayMs = scheduled.getTime() - now.getTime();

    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      const msgPayload = {
        type: 'SCHEDULE_DAILY_GOAL_REMINDER',
        payload: {
          title: '🔥 Meta Diária: Hora de Manter sua Sequência!',
          delayMs,
          options: {
            body: 'Você ainda não concluiu sua meta diária de estudos hoje. Que tal resolver 5 questões rápidas para não perder sua ofensiva?',
            data: { url: '/', type: 'daily_goal_reminder' },
            actions: [
              { action: 'study_now', title: '🚀 Estudar Agora' },
              { action: 'snooze_15', title: '⏳ Lembrar em 15 min' },
            ],
          },
        },
      };

      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage(msgPayload);
      }

      navigator.serviceWorker.ready
        .then((reg) => {
          if (reg.active) {
            reg.active.postMessage(msgPayload);
          }
        })
        .catch(() => {});
    }
  }

  /**
   * Triggers a friendly local notification to mobile and desktop
   * encouraging the student to complete their study goal for today.
   */
  public async triggerDailyGoalReminder(isTest = false): Promise<boolean> {
    const goalData = studyGoalService.getData();
    const targetMinutes = goalData.targetMinutes || 15;
    const studiedMinutes = Math.floor((goalData.todaySeconds || 0) / 60);
    const remainingMinutes = Math.max(1, targetMinutes - studiedMinutes);
    const streak = goalData.streakDays || 0;

    let userName = 'Estudante';
    try {
      const userProfile = localStorage.getItem('estudahud_user_profile_v3');
      if (userProfile) {
        const parsed = JSON.parse(userProfile);
        if (parsed.name) userName = parsed.name;
      }
    } catch {}

    const title = isTest
      ? `🔥 Trilha do Saber: Teste de Notificação - Meta Diária`
      : studiedMinutes === 0
      ? `🔥 Não perca sua sequência! Falta sua meta de hoje`
      : `🔥 Quase lá! Faltam apenas ${remainingMinutes} min de estudo`;

    const body = studiedMinutes === 0
      ? `Olá, ${userName}! Você tem ${targetMinutes} minutos de meta diária e ainda não começou hoje. Que tal resolver alguns exercícios rápidos para manter sua sequência ativa?`
      : `Parabéns pelos ${studiedMinutes} minutos de hoje, ${userName}! Faltam só ${remainingMinutes} min para bater sua meta de ${targetMinutes} min e garantir seus 100 XP diários!`;

    const notifOptions: any = {
      body,
      icon: '/icon.svg',
      badge: '/icon.svg',
      tag: `daily_goal_reminder_${Date.now()}`,
      requireInteraction: true,
      vibrate: [200, 100, 200, 100, 200],
      data: { url: '/', type: 'daily_goal_reminder' },
      actions: [
        { action: 'study_now', title: '🚀 Estudar Agora' },
        { action: 'snooze_15', title: '⏳ Lembrar em 15 min' },
      ],
    };

    // 1. Service Worker Notification (Native Mobile Push / PWA background)
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      'Notification' in window &&
      Notification.permission === 'granted'
    ) {
      try {
        const reg = await navigator.serviceWorker.ready;
        await reg.showNotification(title, notifOptions);
      } catch {
        try {
          const notif = new Notification(title, notifOptions);
          notif.onclick = () => {
            window.focus();
            notif.close();
          };
        } catch {}
      }
    } else if (
      typeof window !== 'undefined' &&
      'Notification' in window &&
      Notification.permission === 'granted'
    ) {
      try {
        const notif = new Notification(title, notifOptions);
        notif.onclick = () => {
          window.focus();
          notif.close();
        };
      } catch {}
    }

    // Record in local history
    try {
      this.recordReminderHistory({
        subjectId: 'all',
        subjectName: 'Meta Diária de Estudos',
        time: this.getDailyGoalReminderTime(),
        status: isTest ? 'attended' : 'dismissed',
        notes: `${title} - ${body}`,
        actionNote: isTest
          ? 'Teste de Lembrete da Meta realizado com sucesso ✅'
          : 'Lembrete amigável de meta diária enviado',
      });
    } catch {}

    // Friendly study chime
    if (this.isReminderSoundEnabled()) {
      try {
        soundEffects.playStudyReminderChime();
      } catch {}
    }

    // Voice narration if test
    if (isTest) {
      speechNarrator.speak(`${title}. ${body}`);
    }

    // Save date record
    const now = new Date();
    const todayDateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    try {
      localStorage.setItem(DAILY_GOAL_LAST_TRIGGERED_DATE_KEY, todayDateStr);
    } catch {}

    window.dispatchEvent(
      new CustomEvent('estudahud_daily_goal_reminder_triggered', {
        detail: { remainingMinutes, studiedMinutes, targetMinutes, streak },
      })
    );

    return true;
  }
}

export const notificationService = new NotificationService();
