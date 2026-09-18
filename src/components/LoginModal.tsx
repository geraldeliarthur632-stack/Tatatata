import React, { useState } from 'react';
import { UserProfile, GradeLevel } from '../types';
import { FirebaseService } from '../services/database/firebaseService';
import { PermissionService } from '../services/permissionService';
import { soundEffects } from '../services/soundEffects';
import { GRADE_LABELS } from '../data/curriculumData';
import {
  Sparkles,
  ShieldCheck,
  Cloud,
  CheckCircle2,
  AlertCircle,
  X,
  ArrowRight,
  User,
  GraduationCap,
  Database,
  Flame,
} from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  user: UserProfile;
  onClose: () => void;
  onLoginSuccess: (profileUpdates: Partial<UserProfile>) => void;
  onRequestPermissions: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  user,
  onClose,
  onLoginSuccess,
  onRequestPermissions,
}) => {
  const [tab, setTab] = useState<'google' | 'profile'>('google');
  const [studentName, setStudentName] = useState(user.name || '');
  const [studentGrade, setStudentGrade] = useState<GradeLevel>(user.grade || '6_fund');
  const [studentAvatar, setStudentAvatar] = useState(user.avatar || '🎓');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleProcessPermissionsAfterLogin = async () => {
    // Verifica se as permissões já foram aceitas
    const status = await PermissionService.checkStatus();
    if (status.allGranted) {
      // Se já tiver aceitado, NÃO aparece!
      setSuccessMsg('Login realizado com sucesso! Suas permissões já estão ativas.');
      setTimeout(() => {
        onClose();
      }, 1000);
    } else {
      // Se NÃO tiver aceitado, aparece imediatamente!
      onClose();
      onRequestPermissions();
    }
  };

  const handleGoogleLogin = async () => {
    soundEffects.playClick();
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const googleUser = await FirebaseService.loginWithGoogle();
      if (!googleUser) {
        throw new Error('Não foi possível autenticar com o Google.');
      }

      // Restaura ou sincroniza perfil no Firestore
      const userId = googleUser.uid;
      const existingData = await FirebaseService.restoreProgress(userId);

      const updatedProfile: Partial<UserProfile> = {
        name: existingData?.name || googleUser.displayName || user.name || 'Estudante',
        avatar: existingData?.avatar || user.avatar || '🎓',
        totalPoints: existingData?.totalPoints ?? user.totalPoints ?? 0,
        completedChallenges: existingData?.completedChallenges ?? user.completedChallenges ?? 0,
        totalCorrectAnswers: existingData?.totalCorrectAnswers ?? user.totalCorrectAnswers ?? 0,
      };

      // Sincroniza dados atuais com Firestore
      await FirebaseService.syncProgress(userId, {
        ...user,
        ...updatedProfile,
        email: googleUser.email,
        authProvider: 'google',
      });

      soundEffects.playSuccess();
      onLoginSuccess(updatedProfile);

      await handleProcessPermissionsAfterLogin();
    } catch (err: any) {
      console.warn('Falha no login Google:', err);
      // Se popup for bloqueado pelo iframe, fornece mensagem clara
      setErrorMsg(
        err?.message?.includes('popup')
          ? 'O popup foi bloqueado pelo navegador. Você também pode entrar com seu Perfil de Estudante!'
          : err?.message || 'Erro ao conectar conta Google. Tente com Perfil de Estudante.'
      );
      soundEffects.playError();
    } finally {
      setIsLoading(false);
    }
  };

  const handleStudentProfileLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = studentName.trim();
    if (!cleanName || cleanName.length < 3) {
      setErrorMsg('Por favor, informe seu nome com pelo menos 3 letras.');
      soundEffects.playError();
      return;
    }

    soundEffects.playClick();
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const syncUserId = `student_${cleanName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;

      // Restaura dados se existirem no Firestore
      const existingData = await FirebaseService.restoreProgress(syncUserId);

      const updatedProfile: Partial<UserProfile> = {
        name: cleanName,
        grade: studentGrade,
        avatar: studentAvatar,
        totalPoints: existingData?.totalPoints ?? user.totalPoints ?? 0,
        completedChallenges: existingData?.completedChallenges ?? user.completedChallenges ?? 0,
        totalCorrectAnswers: existingData?.totalCorrectAnswers ?? user.totalCorrectAnswers ?? 0,
      };

      // Salva no Firestore
      await FirebaseService.syncProgress(syncUserId, {
        ...user,
        ...updatedProfile,
        lastLoginAt: new Date().toISOString(),
      });

      soundEffects.playSuccess();
      onLoginSuccess(updatedProfile);

      await handleProcessPermissionsAfterLogin();
    } catch (err: any) {
      console.warn('Erro ao salvar no Firestore:', err);
      setErrorMsg('Não foi possível sincronizar com o Firestore. Verifique sua conexão.');
      soundEffects.playError();
    } finally {
      setIsLoading(false);
    }
  };

  const avatarsList = ['🎓', '🦁', '🚀', '⭐', '🦉', '⚡', '🦊', '👑', '💎', '🔥'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-700 rounded-3xl p-5 sm:p-6 shadow-2xl relative space-y-4 text-zinc-100 overflow-hidden">
        {/* Top Accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-blue-600 to-indigo-600" />

        {/* Header */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-black">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-white">Login & Sincronização em Nuvem</h3>
              <p className="text-[11px] text-zinc-400">Firebase Firestore • Trilha do Saber</p>
            </div>
          </div>

          <button
            onClick={() => {
              soundEffects.playClick();
              onClose();
            }}
            className="p-1.5 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Firestore Status Badge */}
        <div className="p-2.5 rounded-xl bg-zinc-950/70 border border-zinc-800 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <Database className="w-4 h-4 text-amber-400 shrink-0" />
            <div className="min-w-0">
              <span className="text-[10px] text-zinc-400 font-medium block">Banco de Dados Ativo</span>
              <span className="text-[11px] font-bold text-amber-300 truncate block">
                Firestore Configurado
              </span>
            </div>
          </div>
          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/70 border border-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
            <CheckCircle2 className="w-3 h-3" /> Online
          </span>
        </div>

        {/* Tabs Switcher */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-zinc-950 rounded-xl border border-zinc-800 text-xs">
          <button
            type="button"
            onClick={() => {
              soundEffects.playClick();
              setTab('google');
            }}
            className={`py-2 rounded-lg font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              tab === 'google'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span>Conta Google</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundEffects.playClick();
              setTab('profile');
            }}
            className={`py-2 rounded-lg font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              tab === 'profile'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span>Perfil Estudante</span>
          </button>
        </div>

        {/* Feedback Messages */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* TAB 1: GOOGLE SIGN-IN */}
        {tab === 'google' && (
          <div className="space-y-3.5 py-1">
            <p className="text-xs text-zinc-300 leading-relaxed">
              Faça login com sua Conta Google para sincronizar seu XP, ofensivas de estudo, boletim e
              conquistas no <strong>Google Cloud Firestore</strong>.
            </p>

            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full py-3 px-4 bg-white hover:bg-zinc-100 text-zinc-900 font-black rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-lg transition active:scale-[0.99] cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{isLoading ? 'Conectando ao Google...' : 'Entrar com Google e Sincronizar'}</span>
            </button>

            <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-[11px] text-zinc-400 space-y-1">
              <span className="font-bold text-zinc-300 block">Após o login:</span>
              <p>
                • Suas permissões de <strong>Microfone</strong> e <strong>Notificações</strong> serão
                verificadas. Se já tiver aceitado, não aparecerá novamente!
              </p>
            </div>
          </div>
        )}

        {/* TAB 2: STUDENT PROFILE LOGIN */}
        {tab === 'profile' && (
          <form onSubmit={handleStudentProfileLogin} className="space-y-3.5 py-1 text-xs">
            <div>
              <label className="block text-zinc-300 font-medium mb-1">Nome do Estudante</label>
              <div className="relative">
                <input
                  type="text"
                  value={studentName}
                  maxLength={25}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="Seu nome ou apelido de estudos..."
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-zinc-100 focus:outline-hidden focus:border-indigo-500 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-zinc-300 font-medium mb-1 flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-indigo-400" />
                <span>Ano / Série Escolar</span>
              </label>
              <select
                value={studentGrade}
                onChange={(e) => setStudentGrade(e.target.value as GradeLevel)}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-zinc-100 focus:outline-hidden focus:border-indigo-500 text-xs font-semibold"
              >
                {(Object.keys(GRADE_LABELS) as GradeLevel[]).map((g) => (
                  <option key={g} value={g}>
                    {GRADE_LABELS[g].full}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-zinc-300 font-medium mb-1">Avatar de Estudante</label>
              <div className="grid grid-cols-5 gap-1.5 p-1.5 bg-zinc-950 rounded-xl border border-zinc-800">
                {avatarsList.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => {
                      soundEffects.playClick();
                      setStudentAvatar(emoji);
                    }}
                    className={`h-8 text-base rounded-lg flex items-center justify-center transition cursor-pointer ${
                      studentAvatar === emoji
                        ? 'bg-indigo-600/40 border-2 border-indigo-400 scale-105'
                        : 'hover:bg-zinc-800'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg transition active:scale-[0.99] cursor-pointer"
            >
              <Cloud className="w-4 h-4" />
              <span>{isLoading ? 'Sincronizando no Firestore...' : 'Entrar com Perfil e Sincronizar'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
