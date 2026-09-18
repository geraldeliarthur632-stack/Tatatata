import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { soundEffects } from '../services/soundEffects';
import {
  Sparkles,
  Trophy,
  Flame,
  Zap,
  CheckCircle2,
  X,
  ArrowRight,
  Target,
} from 'lucide-react';

interface DailyXp100NotificationProps {
  isOpen: boolean;
  earnedXp: number;
  goalXp: number;
  streakDays?: number;
  onClose: () => void;
  onOpenCelebrationModal?: () => void;
}

export const DailyXp100Notification: React.FC<DailyXp100NotificationProps> = ({
  isOpen,
  earnedXp,
  goalXp,
  streakDays = 1,
  onClose,
  onOpenCelebrationModal,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  // Trigger small celebratory confetti blast when the notification appears
  const shootMiniConfetti = () => {
    try {
      // Top center burst
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.2, x: 0.5 },
        colors: ['#10b981', '#fbbf24', '#8b5cf6', '#38bdf8', '#f59e0b'],
        ticks: 200,
        gravity: 1.2,
        scalar: 0.9,
      });

      // Side pops
      setTimeout(() => {
        confetti({
          particleCount: 30,
          angle: 60,
          spread: 55,
          origin: { x: 0.15, y: 0.25 },
          colors: ['#fbbf24', '#f59e0b', '#10b981'],
        });
      }, 150);

      setTimeout(() => {
        confetti({
          particleCount: 30,
          angle: 120,
          spread: 55,
          origin: { x: 0.85, y: 0.25 },
          colors: ['#8b5cf6', '#38bdf8', '#34d399'],
        });
      }, 300);
    } catch {}
  };

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      soundEffects.playVictoryFanfare();
      shootMiniConfetti();

      // Auto dismiss after 9 seconds if user doesn't interact
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 400);
      }, 9000);

      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  if (!isOpen && !isVisible) return null;

  return (
    <div
      id="daily-xp-100-toast-notification"
      className={`fixed top-4 left-3 right-3 sm:left-auto sm:right-6 sm:max-w-md z-50 transition-all duration-500 transform ${
        isVisible
          ? 'translate-y-0 opacity-100 scale-100'
          : '-translate-y-6 opacity-0 scale-95 pointer-events-none'
      }`}
    >
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0e1626] via-[#121d33] to-[#0f241a] border-2 border-emerald-400/70 p-4 sm:p-4.5 shadow-2xl shadow-emerald-950/80 backdrop-blur-md ring-1 ring-emerald-400/40">
        {/* Glow ambient background circles */}
        <div className="absolute -top-10 -right-10 w-28 h-28 bg-emerald-500/25 rounded-full blur-2xl pointer-events-none animate-pulse" />
        <div className="absolute -bottom-10 -left-10 w-28 h-28 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={() => {
            soundEffects.playClick();
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
          className="absolute top-3 right-3 p-1.5 rounded-full bg-[#162137] hover:bg-[#1f2e4d] text-slate-400 hover:text-white transition cursor-pointer border border-[#2d3e63]"
          aria-label="Fechar notificação"
          title="Fechar"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        {/* Header with 100% Badge and Icon */}
        <div className="flex items-start gap-3 pr-6">
          <div className="relative shrink-0">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-amber-400 p-0.5 shadow-lg shadow-emerald-500/30 flex items-center justify-center animate-bounce" style={{ animationDuration: '2s' }}>
              <div className="w-full h-full rounded-2xl bg-[#09111e] flex items-center justify-center text-xl">
                🏆
              </div>
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-black border-2 border-[#09111e] shadow-md">
              ✓
            </div>
          </div>

          <div className="min-w-0 space-y-0.5">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 text-[10px] font-black tracking-wide uppercase flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                100% Concluído
              </span>
              <span className="text-[10px] font-black text-amber-400 flex items-center gap-0.5">
                <Flame className="w-3 h-3 fill-amber-400 text-amber-400" />
                {streakDays} {streakDays === 1 ? 'dia' : 'dias'} de ofensiva
              </span>
            </div>

            <h4 className="text-sm font-black text-white tracking-tight flex items-center gap-1">
              <span>Meta Diária de XP Atingida!</span>
              <span>🎉</span>
            </h4>

            <p className="text-xs text-slate-300 font-medium leading-tight">
              Você conquistou <strong className="text-emerald-300 font-black">{earnedXp} XP</strong> hoje e completou a sua meta diária de estudos!
            </p>
          </div>
        </div>

        {/* Progress Bar Display */}
        <div className="mt-3 space-y-1">
          <div className="flex items-center justify-between text-[11px] font-bold">
            <span className="text-slate-300 flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />
              Progresso do Dia
            </span>
            <span className="text-emerald-300 font-mono font-black">
              {earnedXp} / {goalXp} XP (100%)
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-[#162137] overflow-hidden border border-emerald-500/40 p-0.5">
            <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 shadow-[0_0_10px_rgba(52,211,153,0.8)] w-full" />
          </div>
        </div>

        {/* Consistency Encouragement Text */}
        <div className="mt-2.5 px-2.5 py-1.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center gap-2 text-[11px] text-emerald-200">
          <span className="text-sm select-none">🔥</span>
          <span className="leading-tight">
            <strong>Consistência garantida:</strong> Estudar todo dia ativa a memória de longo prazo no cérebro!
          </span>
        </div>

        {/* Action Buttons */}
        <div className="mt-3 flex items-center gap-2">
          {onOpenCelebrationModal && (
            <button
              onClick={() => {
                soundEffects.playVictory();
                shootMiniConfetti();
                setIsVisible(false);
                setTimeout(() => {
                  onClose();
                  onOpenCelebrationModal();
                }, 200);
              }}
              className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 active:scale-95 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/20 transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ver Celebração Completa</span>
            </button>
          )}

          <button
            onClick={() => {
              shootMiniConfetti();
              soundEffects.playVictory();
            }}
            className="py-2 px-2.5 rounded-xl bg-[#1a2942] hover:bg-[#223555] active:scale-95 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
            title="Soltar mais confetes"
          >
            <span>🎊 Confetes</span>
          </button>
        </div>
      </div>
    </div>
  );
};
