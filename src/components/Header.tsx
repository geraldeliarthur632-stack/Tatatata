import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { soundEffects } from '../services/soundEffects';
import {
  Bell,
  Sparkles,
  Flame,
  Trophy,
  BookOpen,
  Calendar,
  X,
  CheckCircle2,
  Moon,
  Sun,
  Download,
  SlidersHorizontal,
  LayoutGrid,
  Cloud,
  KeyRound,
} from 'lucide-react';

interface HeaderProps {
  user: UserProfile;
  keys?: number;
  onOpenKeysModal?: () => void;
  onEditProfile: () => void;
  onOpenSettings?: () => void;
  onOpenIntroAudio?: () => void;
  onOpenReminders?: () => void;
  onOpenCalendar?: () => void;
  onOpenCaderno?: () => void;
  onOpenTrophiesAndBadges?: (tab?: 'trophies' | 'badges') => void;
  onOpenReportCard?: () => void;
  onOpenInstallApp?: () => void;
  onOpenOfflineAccess?: () => void;
  onOpenPdfSummaries?: () => void;
  onOpenErrorFeedback?: () => void;
  onOpenSubjectCustomization?: () => void;
  onOpenMoreApps?: () => void;
  onOpenLogin?: () => void;
  isLevelUpActive?: boolean;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onOpenCalendar,
  onOpenReminders,
  onOpenTrophiesAndBadges,
  onOpenInstallApp,
  onOpenOfflineAccess,
  onOpenPdfSummaries,
  onOpenErrorFeedback,
  onOpenSubjectCustomization,
  onOpenMoreApps,
  onOpenLogin,
  keys = 0,
  onOpenKeysModal,
  theme = 'light',
  onToggleTheme,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [hasUnread, setHasUnread] = useState<boolean>(() => {
    try {
      return localStorage.getItem('estudahud_notifications_seen_v2') !== 'true';
    } catch {
      return true;
    }
  });

  const handleToggleNotifications = () => {
    soundEffects.playClick();
    const nextState = !showNotifications;
    setShowNotifications(nextState);
    if (nextState || hasUnread) {
      setHasUnread(false);
      try {
        localStorage.setItem('estudahud_notifications_seen_v2', 'true');
      } catch {}
    }
  };

  const notifications = [
    {
      id: 'notif_streak',
      icon: '🔥',
      title: 'Ofensiva Ativa!',
      text: 'Você está no ritmo! Mantenha seus estudos hoje para não perder a sequência.',
      time: 'Hoje',
    },
    {
      id: 'notif_weekly',
      icon: '⚡',
      title: 'Meta de XP Semanal',
      text: 'Complete 3 simulados ou lições na Jornada para ganhar o bônus de 500 XP.',
      time: 'Esta semana',
    },
    {
      id: 'notif_challenge',
      icon: '🏆',
      title: 'Novo Desafio Disponível',
      text: 'O modo Desafio Matemático e os Jogos Educativos estão prontos para testar sua agilidade com voz da IA.',
      time: 'Recente',
    },
  ];

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 sticky top-0 z-30 shadow-xs">
      <div className="flex items-center justify-between max-w-lg md:max-w-3xl lg:max-w-5xl xl:max-w-6xl mx-auto w-full">
        {/* Brand Logo: Trilha do Saber */}
        <div className="flex items-center gap-2 select-none shrink-0 group">
          <div className="w-8 h-8 rounded-xl overflow-hidden shadow-sm shadow-indigo-200/50 flex items-center justify-center transition-transform group-hover:scale-105 border border-indigo-200/60 bg-indigo-950">
            <img src="/app-logo.png" alt="Trilha do Saber" className="w-full h-full object-cover" />
          </div>
          <div className="flex items-center gap-1">
            <span className="text-lg sm:text-xl font-black tracking-tight text-slate-900">Trilha</span>
            <span className="text-lg sm:text-xl font-black tracking-tight bg-gradient-to-r from-indigo-600 via-purple-600 to-sky-600 bg-clip-text text-transparent">
              do Saber
            </span>
          </div>
          <span className="w-2 h-2 rounded-full bg-indigo-600 shadow-xs ml-0.5 animate-pulse hidden sm:inline-block" />
        </div>

        {/* Action icons on the right: More Apps, Install App & Notifications Bell */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Botão Mais Apps & Jogos */}
          {onOpenMoreApps && (
            <button
              onClick={() => {
                soundEffects.playClick();
                onOpenMoreApps();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-xs text-xs font-black transition active:scale-95 group cursor-pointer border border-purple-400/30"
              title="Mais Apps & Jogos Educativos"
              aria-label="Mais Apps e Jogos"
            >
              <LayoutGrid className="w-3.5 h-3.5 text-white group-hover:rotate-12 transition-transform" />
              <span className="text-xs font-black">Mais Apps</span>
            </button>
          )}

          {/* Botão de Instalar App */}
          {onOpenInstallApp && (
            <button
              onClick={() => {
                soundEffects.playClick();
                onOpenInstallApp();
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-500 shadow-xs text-xs font-bold transition active:scale-95 group cursor-pointer"
              title="Instalar Aplicativo (Google Chrome)"
              aria-label="Instalar Aplicativo"
            >
              <Download className="w-3.5 h-3.5 text-white group-hover:translate-y-0.5 transition" />
              <span className="text-xs font-black hidden sm:inline">Instalar App</span>
              <span className="text-[11px] font-black sm:hidden">Instalar</span>
            </button>
          )}

          {/* Botão de Chaves do Estudante (ao lado do botão de instalar) */}
          <button
            onClick={() => {
              soundEffects.playClick();
              if (onOpenKeysModal) onOpenKeysModal();
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-300 border border-amber-400/40 shadow-xs text-xs font-black transition active:scale-95 group cursor-pointer"
            title={`Você tem ${keys} ${keys === 1 ? 'chave' : 'chaves'} de acesso (Jornada, Idiomas e Xadrez). Toque para ver ou conseguir mais!`}
            aria-label="Minhas Chaves de Acesso"
          >
            <KeyRound className="w-3.5 h-3.5 text-amber-500 group-hover:rotate-45 transition-transform" />
            <span className="text-xs font-black">{keys}</span>
            <span className="text-[11px] font-black hidden sm:inline text-amber-600 dark:text-amber-400">
              {keys === 1 ? 'Chave' : 'Chaves'}
            </span>
          </button>

          {/* Botão de Login / Sincronização Firestore */}
          {onOpenLogin && (
            <button
              onClick={() => {
                soundEffects.playClick();
                onOpenLogin();
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 border border-amber-300 shadow-xs text-xs font-bold transition active:scale-95 group cursor-pointer"
              title="Login & Sincronização em Nuvem (Firestore)"
              aria-label="Login Firestore"
            >
              <Cloud className="w-3.5 h-3.5 text-amber-600 group-hover:scale-110 transition-transform" />
              <span className="text-[11px] font-black hidden sm:inline">Nuvem</span>
            </button>
          )}

          <button
            onClick={handleToggleNotifications}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 hover:text-slate-900 flex items-center justify-center transition relative active:scale-95 shadow-xs cursor-pointer"
            title="Notificações e Avisos"
            aria-label="Notificações"
          >
            <Bell className="w-4 h-4" />
            {hasUnread && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white shadow-xs animate-pulse" />
            )}
          </button>
        </div>
      </div>

      {/* Notifications Popover Dropdown */}
      {showNotifications && (
        <div className="absolute top-14 right-4 z-50 w-80 bg-white border border-slate-200 rounded-2xl shadow-2xl p-3.5 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900">Notificações</span>
              <span className="px-1.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-extrabold border border-indigo-200">
                {notifications.length} novas
              </span>
            </div>
            <button
              onClick={() => setShowNotifications(false)}
              className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto scrollbar-thin">
            {notifications.map((n) => (
              <div
                key={n.id}
                className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition space-y-1 text-left"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span>{n.icon}</span>
                    <span className="text-xs font-bold text-slate-900">{n.title}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">{n.time}</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-snug">{n.text}</p>
              </div>
            ))}
          </div>

          <div className="pt-1 flex items-center justify-between text-[11px] border-t border-slate-100">
            {onOpenCalendar && (
              <button
                onClick={() => {
                  setShowNotifications(false);
                  onOpenCalendar();
                }}
                className="text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-1 cursor-pointer"
              >
                <Calendar className="w-3 h-3" />
                <span>Ver Provas</span>
              </button>
            )}
            <button
              onClick={() => setShowNotifications(false)}
              className="text-slate-400 hover:text-slate-700 font-medium ml-auto cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

