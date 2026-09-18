import React, { useState } from 'react';
import { UserProfile } from '../types';
import { GRADE_LABELS, getSubjectsForGrade } from '../data/curriculumData';
import { calculateAcademicLevel } from './ProgressDashboard';
import { soundEffects } from '../services/soundEffects';
import { studyGoalService } from '../services/studyGoalService';
import { ALL_BADGES } from '../data/trophiesAndBadges';
import { THEMATIC_AVATARS, getAvatarById, getAvatarByEmoji, isAvatarUnlocked, ThematicAvatar } from '../data/avatarGalleryData';
import { AvatarGalleryModal } from './AvatarGalleryModal';
import {
  Pencil,
  Settings,
  Trophy,
  Award,
  BookOpen,
  Calendar,
  Clock,
  GraduationCap,
  Smartphone,
  ChevronRight,
  Sparkles,
  FileCheck,
  CheckCircle2,
  Lock,
  Moon,
  Sun,
  Palette,
  Zap,
  FileDown,
  AlertCircle,
  SlidersHorizontal,
  Cloud,
} from 'lucide-react';

interface ProfileViewProps {
  user: UserProfile;
  onEditProfile: () => void;
  onOpenSettings: () => void;
  onOpenTrophiesAndBadges: (tab?: 'trophies' | 'badges') => void;
  onOpenReportCard: () => void;
  onOpenCalendar: () => void;
  onOpenReminders: () => void;
  onOpenInstallApp?: () => void;
  onOpenPdfSummaries?: () => void;
  onOpenErrorFeedback?: () => void;
  onOpenSubjectCustomization?: () => void;
  onOpenLogin?: () => void;
  onSelectAvatar?: (avatar: ThematicAvatar) => void;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  onEditProfile,
  onOpenSettings,
  onOpenTrophiesAndBadges,
  onOpenReportCard,
  onOpenCalendar,
  onOpenReminders,
  onOpenInstallApp,
  onOpenPdfSummaries,
  onOpenErrorFeedback,
  onOpenSubjectCustomization,
  onOpenLogin,
  onSelectAvatar,
  theme = 'dark',
  onToggleTheme,
}) => {
  const [isAvatarGalleryOpen, setIsAvatarGalleryOpen] = useState<boolean>(false);
  const levelInfo = calculateAcademicLevel(user.totalPoints || 0);
  const goalData = studyGoalService.getData();

  // Find active avatar metadata
  const activeAvatarData =
    (user.avatarId ? getAvatarById(user.avatarId) : null) ||
    getAvatarByEmoji(user.avatar) ||
    THEMATIC_AVATARS[0];

  const unlockedAvatarsCount = THEMATIC_AVATARS.filter((a) =>
    isAvatarUnlocked(a, user.totalPoints || 0)
  ).length;

  // Real computed stats from user profile and studyGoalService
  const exercisesCount = user.totalCorrectAnswers || 0;
  const simuladosCount = user.completedChallenges || 0;
  const streakDays = goalData.streakDays || 0;
  const gradeSubjects = getSubjectsForGrade(user.grade);
  const subjectsCount = gradeSubjects.length;

  // Real 8 badges from ALL_BADGES evaluated by user's points
  const badgeShowcase = ALL_BADGES.slice(0, 8).map((badge) => {
    const isUnlocked = (user.totalPoints || 0) >= badge.pointsRequired;
    return {
      id: badge.id,
      icon: badge.icon,
      label: badge.title,
      pointsRequired: badge.pointsRequired,
      isUnlocked,
    };
  });

  const handleAvatarSelected = (avatar: ThematicAvatar) => {
    if (onSelectAvatar) {
      onSelectAvatar(avatar);
    }
    setIsAvatarGalleryOpen(false);
  };

  const isLight = theme === 'light';

  return (
    <div className="flex-1 flex flex-col p-4 space-y-4 max-w-lg md:max-w-3xl lg:max-w-5xl mx-auto w-full pb-32 sm:pb-36">
      {/* Header Title */}
      <div className="flex items-center justify-between">
        <h1 className={`text-xl font-black tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>Perfil</h1>
        <button
          onClick={() => {
            soundEffects.playClick();
            onOpenSettings();
          }}
          className={`p-2 rounded-xl border transition active:scale-95 shadow-xs ${
            isLight
              ? 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
              : 'bg-[#161e31] hover:bg-[#1e293b] text-slate-300 hover:text-white border-[#273553]'
          }`}
          title="Configurações"
          aria-label="Configurações"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {/* User Info Card */}
      <div className={`rounded-3xl p-4.5 shadow-xl space-y-3.5 relative overflow-hidden border ${
        isLight
          ? 'bg-white border-slate-200 shadow-xs'
          : 'bg-[#121829] border-[#273553]'
      }`}>
        <div className="flex items-center gap-3.5">
          <div className="relative">
            <div
              className={`w-16 h-16 rounded-2xl bg-gradient-to-tr ${activeAvatarData.bgGradient} p-0.5 ${activeAvatarData.borderClass} ${activeAvatarData.glowClass} shadow-lg flex items-center justify-center`}
            >
              <div className={`w-full h-full rounded-[14px] flex items-center justify-center text-3xl select-none relative overflow-hidden ${
                isLight ? 'bg-slate-100' : 'bg-[#0b0f19]'
              }`}>
                <span className="inline-block transform hover:scale-110 transition">
                  {user.avatar || activeAvatarData.emoji}
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                soundEffects.playClick();
                setIsAvatarGalleryOpen(true);
              }}
              className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center shadow-md border-2 hover:scale-110 transition cursor-pointer ${
                isLight ? 'border-white' : 'border-[#121829]'
              }`}
              title="Trocar Avatar na Galeria"
            >
              <Palette className="w-3 h-3" />
            </button>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <h2 className={`text-lg font-black truncate flex items-center gap-1.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                <span>{user.name || 'Estudante'}</span>
                {activeAvatarData.badgeLabel && (
                  <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md border ${
                    isLight
                      ? 'bg-amber-100 text-amber-800 border-amber-300'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  }`}>
                    {activeAvatarData.name}
                  </span>
                )}
              </h2>
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                isLight
                  ? 'bg-purple-100 text-purple-700 border-purple-200'
                  : 'bg-[#8b5cf6]/20 text-[#c084fc] border-[#8b5cf6]/40'
              }`}>
                {GRADE_LABELS[user.grade]?.short || '6º Ano'}
              </span>
            </div>

            <div className="flex items-center gap-2 mt-0.5">
              <span className={`text-xs font-bold ${isLight ? 'text-purple-600' : 'text-[#c084fc]'}`}>
                Nível {levelInfo.level}
              </span>
              <span className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>• {levelInfo.title}</span>
            </div>

            {/* Level XP Bar */}
            <div className="mt-2 space-y-1">
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>Progresso</span>
                <span className={isLight ? 'text-slate-800' : 'text-white'}>
                  {levelInfo.currentPointsInLevel} / {levelInfo.pointsNeededForNextLevel} XP
                </span>
              </div>
              <div className={`w-full h-2 rounded-full overflow-hidden ${isLight ? 'bg-slate-100' : 'bg-[#1e293b]'}`}>
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#a855f7] transition-all duration-500 shadow-[0_0_8px_rgba(139,92,246,0.6)]"
                  style={{ width: `${Math.max(4, levelInfo.progressPercent)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              soundEffects.playClick();
              setIsAvatarGalleryOpen(true);
            }}
            className={`py-2.5 px-3 border text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs ${
              isLight
                ? 'bg-amber-50/80 hover:bg-amber-100/80 border-amber-200 text-amber-900'
                : 'bg-gradient-to-r from-amber-500/20 via-purple-600/20 to-pink-500/20 hover:from-amber-500/30 hover:to-pink-500/30 border-amber-500/40 text-amber-200'
            }`}
          >
            <Palette className="w-3.5 h-3.5 text-amber-500" />
            <span>Galeria de Avatares ({unlockedAvatarsCount})</span>
          </button>

          <button
            onClick={() => {
              soundEffects.playClick();
              onEditProfile();
            }}
            className={`py-2.5 px-3 border text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs ${
              isLight
                ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
                : 'bg-[#161e31] hover:bg-[#1e293b] border-[#273553] text-slate-200'
            }`}
          >
            <Pencil className="w-3.5 h-3.5 text-[#8b5cf6]" />
            <span>Editar Nome e Série</span>
          </button>
        </div>
      </div>

      {/* Conquistas (4x2 Grid) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className={`text-sm font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>Conquistas</h3>
            <span className={`text-[11px] font-bold ${isLight ? 'text-purple-600' : 'text-[#c084fc]'}`}>
              {badgeShowcase.filter((b) => b.isUnlocked).length}/{badgeShowcase.length} desbloqueados
            </span>
          </div>
          <button
            onClick={() => {
              soundEffects.playClick();
              onOpenTrophiesAndBadges('trophies');
            }}
            className={`text-xs font-bold transition cursor-pointer ${isLight ? 'text-purple-600 hover:text-purple-700' : 'text-[#8b5cf6] hover:text-[#a855f7]'}`}
          >
            Ver todas
          </button>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {badgeShowcase.map((b) => (
            <button
              key={b.id}
              onClick={() => {
                soundEffects.playClick();
                onOpenTrophiesAndBadges('badges');
              }}
              className={`p-3 rounded-2xl border ${
                isLight
                  ? b.isUnlocked
                    ? 'border-purple-300 hover:border-purple-400 bg-purple-50/70 shadow-xs'
                    : 'border-slate-200 bg-slate-50 opacity-60 hover:opacity-100'
                  : b.isUnlocked
                    ? 'border-[#8b5cf6]/40 hover:border-[#8b5cf6] bg-[#121829] bg-gradient-to-b from-[#8b5cf6]/10 to-transparent'
                    : 'border-[#273553] bg-[#121829] opacity-60 hover:opacity-100'
              } flex flex-col items-center justify-center transition active:scale-95 group shadow-xs relative overflow-hidden cursor-pointer`}
              title={`${b.label} (${b.isUnlocked ? 'Desbloqueado' : `Requer ${b.pointsRequired} XP`})`}
            >
              <div className="text-2xl select-none group-hover:scale-110 transition relative">
                {b.isUnlocked ? (
                  b.icon
                ) : (
                  <div className="relative">
                    <span className="grayscale opacity-40">{b.icon}</span>
                    <Lock className={`w-3 h-3 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${isLight ? 'text-slate-400' : 'text-slate-400'}`} />
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Estatísticas Rápidas (2x2 Grid) */}
      <div className="space-y-2.5">
        <h3 className={`text-sm font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>Estatísticas rápidas</h3>

        <div className="grid grid-cols-2 gap-2.5">
          {/* Exercícios */}
          <div className={`p-3.5 rounded-2xl border space-y-1 shadow-xs ${
            isLight ? 'bg-white border-slate-200' : 'bg-[#121829] border-[#273553]'
          }`}>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${
              isLight ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
            }`}>
              <FileCheck className="w-4 h-4" />
            </div>
            <span className={`text-[11px] font-semibold block mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Exercícios Acertados
            </span>
            <span className={`text-xl font-black block ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {exercisesCount}
            </span>
          </div>

          {/* Simulados */}
          <div className={`p-3.5 rounded-2xl border space-y-1 shadow-xs ${
            isLight ? 'bg-white border-slate-200' : 'bg-[#121829] border-[#273553]'
          }`}>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${
              isLight ? 'bg-purple-50 text-purple-600 border-purple-200' : 'bg-purple-500/20 text-purple-400 border-purple-500/30'
            }`}>
              <Award className="w-4 h-4" />
            </div>
            <span className={`text-[11px] font-semibold block mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Desafios Concluídos
            </span>
            <span className={`text-xl font-black block ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {simuladosCount}
            </span>
          </div>

          {/* Dias de estudo */}
          <div className={`p-3.5 rounded-2xl border space-y-1 shadow-xs ${
            isLight ? 'bg-white border-slate-200' : 'bg-[#121829] border-[#273553]'
          }`}>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${
              isLight ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
            }`}>
              <Calendar className="w-4 h-4" />
            </div>
            <span className={`text-[11px] font-semibold block mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Sequência de Estudo
            </span>
            <span className={`text-xl font-black block ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {streakDays} {streakDays === 1 ? 'dia' : 'dias'}
            </span>
          </div>

          {/* Matérias */}
          <div className={`p-3.5 rounded-2xl border space-y-1 shadow-xs ${
            isLight ? 'bg-white border-slate-200' : 'bg-[#121829] border-[#273553]'
          }`}>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${
              isLight ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
            }`}>
              <BookOpen className="w-4 h-4" />
            </div>
            <span className={`text-[11px] font-semibold block mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Disciplinas da Série
            </span>
            <span className={`text-xl font-black block ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {subjectsCount}
            </span>
          </div>
        </div>
      </div>

      {/* Menu Options List */}
      <div className={`rounded-3xl p-2 space-y-1 shadow-lg border ${
        isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-[#121829] border-[#273553]'
      }`}>
        {/* Baixar Resumos em PDF */}
        {onOpenPdfSummaries && (
          <button
            onClick={() => {
              soundEffects.playClick();
              onOpenPdfSummaries();
            }}
            className={`w-full p-3 rounded-2xl flex items-center justify-between text-left transition cursor-pointer ${
              isLight ? 'hover:bg-slate-50' : 'hover:bg-[#161e31]'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
                isLight ? 'bg-indigo-50 text-indigo-600 border-indigo-200' : 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30'
              }`}>
                <FileDown className="w-4 h-4" />
              </div>
              <div>
                <span className={`text-xs font-bold block ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  Resumos das Matérias em PDF
                </span>
                <span className={`text-[10px] block ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  Como se faz, passo a passo e exemplos práticos
                </span>
              </div>
            </div>
            <ChevronRight className={`w-4 h-4 ${isLight ? 'text-slate-400' : 'text-slate-500'}`} />
          </button>
        )}

        {/* Sincronização & Login na Nuvem (Firebase Firestore) */}
        {onOpenLogin && (
          <button
            onClick={() => {
              soundEffects.playClick();
              onOpenLogin();
            }}
            className={`w-full p-3 rounded-2xl flex items-center justify-between text-left transition cursor-pointer border ${
              isLight
                ? 'bg-amber-50/70 border-amber-200 hover:bg-amber-100/70'
                : 'bg-amber-950/20 border-amber-800/40 hover:bg-amber-950/40'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center border bg-amber-500/20 text-amber-500 border-amber-500/30">
                <Cloud className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold block ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    Conta & Sincronização Firestore
                  </span>
                  <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-500 border border-emerald-500/30">
                    Nuvem
                  </span>
                </div>
                <span className={`text-[10px] block ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  Fazer login para salvar seu progresso no Google Cloud Firestore
                </span>
              </div>
            </div>
            <ChevronRight className={`w-4 h-4 ${isLight ? 'text-slate-400' : 'text-slate-500'}`} />
          </button>
        )}

        {/* Boletim Escolar */}
        <button
          onClick={() => {
            soundEffects.playClick();
            onOpenReportCard();
          }}
          className={`w-full p-3 rounded-2xl flex items-center justify-between text-left transition cursor-pointer ${
            isLight ? 'hover:bg-slate-50' : 'hover:bg-[#161e31]'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
              isLight ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
            }`}>
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <span className={`text-xs font-bold block ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Meu Boletim Escolar
              </span>
              <span className={`text-[10px] block ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Lançar e calcular médias bimestrais
              </span>
            </div>
          </div>
          <ChevronRight className={`w-4 h-4 ${isLight ? 'text-slate-400' : 'text-slate-500'}`} />
        </button>

        {/* Minhas Matérias Escolares */}
        {onOpenSubjectCustomization && (
          <button
            onClick={() => {
              soundEffects.playClick();
              onOpenSubjectCustomization();
            }}
            className={`w-full p-3 rounded-2xl flex items-center justify-between text-left transition cursor-pointer ${
              isLight ? 'hover:bg-slate-50' : 'hover:bg-[#161e31]'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
                isLight ? 'bg-indigo-50 text-indigo-600 border-indigo-200' : 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30'
              }`}>
                <SlidersHorizontal className="w-4 h-4" />
              </div>
              <div>
                <span className={`text-xs font-bold block ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  Matérias da Minha Escola
                </span>
                <span className={`text-[10px] block ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  Configurar se tem Biologia, Física e Química separadas
                </span>
              </div>
            </div>
            <ChevronRight className={`w-4 h-4 ${isLight ? 'text-slate-400' : 'text-slate-500'}`} />
          </button>
        )}

        {/* Central de Erros & Feedback */}
        {onOpenErrorFeedback && (
          <button
            onClick={() => {
              soundEffects.playClick();
              onOpenErrorFeedback();
            }}
            className={`w-full p-3 rounded-2xl flex items-center justify-between text-left transition cursor-pointer ${
              isLight ? 'hover:bg-slate-50' : 'hover:bg-[#161e31]'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
                isLight ? 'bg-rose-50 text-rose-600 border-rose-200' : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
              }`}>
                <AlertCircle className="w-4 h-4" />
              </div>
              <div>
                <span className={`text-xs font-bold block ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  Central de Erros & Feedback
                </span>
                <span className={`text-[10px] block ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  Relatar um erro e ver problemas relatados por outros alunos
                </span>
              </div>
            </div>
            <ChevronRight className={`w-4 h-4 ${isLight ? 'text-slate-400' : 'text-slate-500'}`} />
          </button>
        )}

        {/* Calendário de Provas */}
        <button
          onClick={() => {
            soundEffects.playClick();
            onOpenCalendar();
          }}
          className={`w-full p-3 rounded-2xl flex items-center justify-between text-left transition cursor-pointer ${
            isLight ? 'hover:bg-slate-50' : 'hover:bg-[#161e31]'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
              isLight ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
            }`}>
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <span className={`text-xs font-bold block ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Calendário de Provas
              </span>
              <span className={`text-[10px] block ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Datas de avaliações e alertas de revisão
              </span>
            </div>
          </div>
          <ChevronRight className={`w-4 h-4 ${isLight ? 'text-slate-400' : 'text-slate-500'}`} />
        </button>

        {/* Horários e Lembretes */}
        <button
          onClick={() => {
            soundEffects.playClick();
            onOpenReminders();
          }}
          className={`w-full p-3 rounded-2xl flex items-center justify-between text-left transition cursor-pointer ${
            isLight ? 'hover:bg-slate-50' : 'hover:bg-[#161e31]'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
              isLight ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
            }`}>
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <span className={`text-xs font-bold block ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Horários de Estudo & Alarmes
              </span>
              <span className={`text-[10px] block ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Notificações e rotina organizada
              </span>
            </div>
          </div>
          <ChevronRight className={`w-4 h-4 ${isLight ? 'text-slate-400' : 'text-slate-500'}`} />
        </button>

        {/* Tema do Aplicativo (Claro / Escuro) */}
        {onToggleTheme && (
          <button
            onClick={() => {
              soundEffects.playClick();
              onToggleTheme();
            }}
            className={`w-full p-3 rounded-2xl flex items-center justify-between text-left transition cursor-pointer ${
              isLight ? 'hover:bg-slate-50' : 'hover:bg-[#161e31]'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
                isLight ? 'bg-purple-50 text-purple-600 border-purple-200' : 'bg-purple-500/20 text-purple-400 border-purple-500/30'
              }`}>
                {theme === 'dark' ? <Moon className="w-4 h-4 text-purple-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
              </div>
              <div>
                <span className={`text-xs font-bold block ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  Tema do App: {theme === 'light' ? 'Modo Claro (Ativo)' : 'Modo Escuro'}
                </span>
                <span className={`text-[10px] block ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  {theme === 'light' ? 'Toque para alternar para o tema escuro' : 'Toque para voltar ao tema claro'}
                </span>
              </div>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
              isLight
                ? 'bg-amber-100 text-amber-800 border-amber-300'
                : 'bg-[#8b5cf6]/20 text-[#c084fc] border-[#8b5cf6]/30'
            }`}>
              {theme === 'dark' ? '🌙 Escuro' : '☀️ Claro'}
            </span>
          </button>
        )}

        {/* Instalar App */}
        {onOpenInstallApp && (
          <button
            onClick={() => {
              soundEffects.playClick();
              onOpenInstallApp();
            }}
            className={`w-full p-3 rounded-2xl flex items-center justify-between text-left transition cursor-pointer ${
              isLight ? 'hover:bg-slate-50' : 'hover:bg-[#161e31]'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
                isLight ? 'bg-purple-50 text-purple-600 border-purple-200' : 'bg-purple-500/20 text-purple-400 border-purple-500/30'
              }`}>
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <span className={`text-xs font-bold block ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  Instalar Trilha do Saber
                </span>
                <span className={`text-[10px] block ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  Criar atalho na tela inicial
                </span>
              </div>
            </div>
            <ChevronRight className={`w-4 h-4 ${isLight ? 'text-slate-400' : 'text-slate-500'}`} />
          </button>
        )}
      </div>

      {/* Avatar Gallery Modal */}
      <AvatarGalleryModal
        isOpen={isAvatarGalleryOpen}
        onClose={() => setIsAvatarGalleryOpen(false)}
        user={user}
        onSelectAvatar={handleAvatarSelected}
      />
    </div>
  );
};
