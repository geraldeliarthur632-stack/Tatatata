import React, { useEffect, useState } from 'react';
import { Mic, Bell, Sparkles, Volume2, VolumeX, CheckCircle2, ShieldCheck, ArrowRight, X } from 'lucide-react';
import { speechNarrator } from '../services/speechNarrator';
import { soundEffects } from '../services/soundEffects';
import { PermissionService } from '../services/permissionService';

interface PermissionsOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPermissionsGranted?: () => void;
  theme?: 'light' | 'dark';
}

export const PermissionsOnboardingModal: React.FC<PermissionsOnboardingModalProps> = ({
  isOpen,
  onClose,
  onPermissionsGranted,
  theme = 'light',
}) => {
  const [micStatus, setMicStatus] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [notifStatus, setNotifStatus] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);

  const isLight = theme === 'light';

  // Check current permission states on mount/open
  useEffect(() => {
    if (!isOpen) return;

    let isCancelled = false;

    // Check actual permission status via PermissionService
    PermissionService.checkStatus().then((status) => {
      if (isCancelled) return;

      // Se ambas as permissões já foram aceitas/concedidas, fecha o modal
      if (status.allGranted) {
        onClose();
        return;
      }

      setMicStatus(status.micGranted ? 'granted' : 'prompt');
      setNotifStatus(status.notifGranted ? 'granted' : 'prompt');
    });

    // Frase limpa, fluida e didática para sintetizador de voz em português
    const speechText =
      'Olá estudante! Para você ter uma experiência interativa completa com Inteligência Artificial, precisamos da permissão do microfone para responder questões por voz, e das notificações para lembrar seus horários de estudo!';

    // Dispara a narração garantindo que as vozes estejam carregadas e sem conflito de hardware
    const timer = setTimeout(async () => {
      if (isCancelled) return;
      try {
        await speechNarrator.ensureVoicesLoaded();
        if (isCancelled) return;
        speechNarrator.speak(
          speechText,
          () => setIsSpeaking(true),
          () => setIsSpeaking(false)
        );
      } catch {
        setIsSpeaking(false);
      }
    }, 400);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
      speechNarrator.stop();
      setIsSpeaking(false);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleToggleVoice = async () => {
    soundEffects.playClick();
    if (isSpeaking) {
      speechNarrator.stop();
      setIsSpeaking(false);
    } else {
      await speechNarrator.ensureVoicesLoaded();
      const speechText =
        'O microfone permite que você responda perguntas apenas falando em voz alta! E as notificações avisam suas metas e desafios diários de estudo!';
      speechNarrator.speak(
        speechText,
        () => setIsSpeaking(true),
        () => setIsSpeaking(false)
      );
    }
  };

  const handleRequestAll = async () => {
    soundEffects.playClick();
    // Interrompe imediatamente qualquer narração para liberar o hardware de áudio do dispositivo
    speechNarrator.stop();
    setIsSpeaking(false);
    setIsRequesting(true);

    // 1. Solicita Microfone se necessário
    if (micStatus !== 'granted') {
      const micOk = await PermissionService.requestMicrophone();
      setMicStatus(micOk ? 'granted' : 'denied');
    }

    // 2. Solicita Notificações se necessário
    if (notifStatus !== 'granted') {
      const notifOk = await PermissionService.requestNotification();
      setNotifStatus(notifOk ? 'granted' : 'denied');
    }

    PermissionService.markAllAccepted();
    setIsRequesting(false);
    soundEffects.playCorrect();

    if (onPermissionsGranted) {
      onPermissionsGranted();
    }

    // Close after brief feedback
    setTimeout(() => {
      speechNarrator.stop();
      onClose();
    }, 600);
  };

  const needsBoth = micStatus !== 'granted' && notifStatus !== 'granted';
  const onlyNeedsMic = micStatus !== 'granted' && notifStatus === 'granted';
  const onlyNeedsNotif = micStatus === 'granted' && notifStatus !== 'granted';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`w-full max-w-md rounded-3xl p-5 sm:p-6 shadow-2xl border space-y-4 relative overflow-hidden transition-colors ${
          isLight
            ? 'bg-white border-slate-200 text-slate-900'
            : 'bg-slate-900 border-slate-700 text-slate-100'
        }`}
      >
        {/* Top Accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />

        {/* Header */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base">Permissões de Estudo com IA</h3>
              <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Recursos interativos por voz e lembretes
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              speechNarrator.stop();
              onClose();
            }}
            className={`p-1.5 rounded-full transition cursor-pointer ${
              isLight ? 'hover:bg-slate-100 text-slate-400 hover:text-slate-700' : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* AI Speaking Banner */}
        <div
          className={`p-3 rounded-2xl border flex items-center justify-between gap-3 ${
            isLight
              ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 text-blue-900'
              : 'bg-indigo-950/40 border-indigo-800/60 text-indigo-200'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              {isSpeaking ? <Volume2 className="w-4 h-4 animate-pulse" /> : <Volume2 className="w-4 h-4" />}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider block">
                  {isSpeaking ? 'A IA está explicando...' : 'Explicação por Voz da IA'}
                </span>
                {isSpeaking && (
                  <span className="flex gap-0.5 items-end h-2.5">
                    <span className="w-1 bg-indigo-500 rounded-full animate-pulse h-2" />
                    <span className="w-1 bg-indigo-600 rounded-full animate-pulse h-3" />
                    <span className="w-1 bg-indigo-400 rounded-full animate-pulse h-1.5" />
                  </span>
                )}
              </div>
              <p className={`text-xs truncate ${isLight ? 'text-blue-800 font-medium' : 'text-indigo-300'}`}>
                {isSpeaking ? 'Ouvindo narração educativa...' : 'Toque para ouvir ou pausar'}
              </p>
            </div>
          </div>

          <button
            onClick={handleToggleVoice}
            className={`px-3 py-1.5 rounded-xl border font-black text-xs transition shrink-0 shadow-xs cursor-pointer flex items-center gap-1 ${
              isSpeaking
                ? 'bg-rose-500 text-white border-rose-600 hover:bg-rose-600'
                : isLight
                ? 'bg-white border-blue-300 text-blue-700 hover:bg-blue-50'
                : 'bg-slate-800 border-indigo-700 text-indigo-300 hover:bg-slate-700'
            }`}
          >
            {isSpeaking ? (
              <>
                <VolumeX className="w-3.5 h-3.5" />
                <span>Pausar</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5" />
                <span>Ouvir IA</span>
              </>
            )}
          </button>
        </div>

        {/* Explanatory Cards */}
        <div className="space-y-2.5 text-xs">
          {/* 1. Microphone Card */}
          <div
            className={`p-3 rounded-2xl border transition space-y-1.5 ${
              micStatus === 'granted'
                ? isLight
                  ? 'border-emerald-200 bg-emerald-50/60 text-slate-800'
                  : 'border-emerald-800/60 bg-emerald-950/30 text-emerald-100'
                : isLight
                ? 'border-slate-200 bg-slate-50/70 text-slate-800'
                : 'border-slate-700 bg-slate-800/70 text-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold ${
                    micStatus === 'granted'
                      ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                      : 'bg-indigo-500/20 text-indigo-600 dark:text-indigo-400'
                  }`}
                >
                  <Mic className="w-4 h-4" />
                </div>
                <span className="font-bold text-xs">1. Microfone (Responder por Voz)</span>
              </div>
              {micStatus === 'granted' ? (
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-500/30">
                  <CheckCircle2 className="w-3 h-3" /> Já Ativado
                </span>
              ) : (
                <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded-full border border-amber-500/30">
                  Pendente
                </span>
              )}
            </div>
            <p className={`text-[11px] leading-relaxed pl-9 ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
              <strong>Para que serve?</strong> Para você responder exercícios falando em voz alta <em>"Letra A"</em>, <em>"Letra B"</em> ou a resposta sem precisar digitar!
            </p>
          </div>

          {/* 2. Notifications Card */}
          <div
            className={`p-3 rounded-2xl border transition space-y-1.5 ${
              notifStatus === 'granted'
                ? isLight
                  ? 'border-emerald-200 bg-emerald-50/60 text-slate-800'
                  : 'border-emerald-800/60 bg-emerald-950/30 text-emerald-100'
                : isLight
                ? 'border-slate-200 bg-slate-50/70 text-slate-800'
                : 'border-slate-700 bg-slate-800/70 text-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold ${
                    notifStatus === 'granted'
                      ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                      : 'bg-purple-500/20 text-purple-600 dark:text-purple-400'
                  }`}
                >
                  <Bell className="w-4 h-4" />
                </div>
                <span className="font-bold text-xs">2. Notificações (Horários de Estudo)</span>
              </div>
              {notifStatus === 'granted' ? (
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-500/30">
                  <CheckCircle2 className="w-3 h-3" /> Já Ativado
                </span>
              ) : (
                <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded-full border border-amber-500/30">
                  Pendente
                </span>
              )}
            </div>
            <p className={`text-[11px] leading-relaxed pl-9 ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
              <strong>Para que serve?</strong> Lembrar suas metas diárias, pontuação e ofensivas de estudo sem você esquecer.
            </p>
          </div>
        </div>

        {/* Security & Privacy Badge */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 font-medium pt-1">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Segurança Infantil: Seus dados de voz nunca são gravados nem vendidos.</span>
        </div>

        {/* Action Button */}
        <div className="space-y-2 pt-1">
          <button
            onClick={handleRequestAll}
            disabled={isRequesting}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-extrabold text-sm shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition active:scale-98 disabled:opacity-50 cursor-pointer"
          >
            <span>
              {isRequesting
                ? 'Concedendo Permissões...'
                : needsBoth
                ? 'Permitir Microfone e Notificações'
                : onlyNeedsMic
                ? 'Permitir Microfone'
                : onlyNeedsNotif
                ? 'Permitir Notificações'
                : 'Concluir'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              speechNarrator.stop();
              onClose();
            }}
            className={`w-full py-2 rounded-xl text-xs font-semibold text-center transition cursor-pointer ${
              isLight ? 'text-slate-400 hover:text-slate-600' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Continuar sem ativar agora
          </button>
        </div>
      </div>
    </div>
  );
};
