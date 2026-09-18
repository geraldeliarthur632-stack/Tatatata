import React, { useState, useEffect } from 'react';
import { soundEffects } from '../services/soundEffects';
import { pwaService } from '../services/pwaService';
import installAppBanner from '../assets/images/lets_study_install_art_1787343676506.jpg';
import {
  X,
  Smartphone,
  Download,
  Share2,
  PlusSquare,
  Sparkles,
  CheckCircle2,
  Laptop,
  MonitorSmartphone,
  Zap,
  BellRing,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Flame,
} from 'lucide-react';

// Crisp Google Chrome Vector Emblem
const GoogleChromeLogo: React.FC<{ className?: string }> = ({ className = 'w-12 h-12' }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="48" fill="#FFFFFF" />
    {/* Red section */}
    <path
      d="M50 8 A42 42 0 0 1 86.4 29 L50 50 Z"
      fill="#EA4335"
    />
    <path
      d="M86.4 29 A42 42 0 0 1 92 50 L50 50 Z"
      fill="#EA4335"
    />
    <path
      d="M50 8 A42 42 0 0 0 13.6 29 L31.8 60.5 L50 50 Z"
      fill="#EA4335"
    />
    {/* Green section */}
    <path
      d="M13.6 29 A42 42 0 0 0 50 92 L68.2 60.5 L50 50 Z"
      fill="#34A853"
    />
    {/* Yellow section */}
    <path
      d="M50 92 A42 42 0 0 0 86.4 29 L50 50 Z"
      fill="#FBBC05"
    />
    {/* White boundary ring */}
    <circle cx="50" cy="50" r="22" fill="#FFFFFF" />
    {/* Blue Center */}
    <circle cx="50" cy="50" r="17" fill="#4285F4" />
  </svg>
);

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({ isOpen, onClose }) => {
  const [platformTab, setPlatformTab] = useState<'android' | 'ios' | 'pc'>('android');
  const [hasPrompt, setHasPrompt] = useState<boolean>(pwaService.hasNativePrompt());
  const [isInstalled, setIsInstalled] = useState<boolean>(pwaService.isStandalone());
  const [installSuccess, setInstallSuccess] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [isAttemptingInstall, setIsAttemptingInstall] = useState<boolean>(false);

  useEffect(() => {
    // Detect platform for default tab
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    if (/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream) {
      setPlatformTab('ios');
    } else if (/android/i.test(userAgent)) {
      setPlatformTab('android');
    } else if (/Win|Mac|Linux/i.test(userAgent) && !/Mobi/i.test(userAgent)) {
      setPlatformTab('pc');
    } else {
      setPlatformTab('android');
    }

    // Subscribe to PWA service install prompt updates
    const unsubscribe = pwaService.subscribe((promptAvailable) => {
      setHasPrompt(promptAvailable);
      setIsInstalled(pwaService.isStandalone());
    });

    return () => {
      unsubscribe();
    };
  }, []);

  if (!isOpen) return null;

  const handleTriggerNativeInstall = async () => {
    soundEffects.playClick();
    setIsAttemptingInstall(true);
    const outcome = await pwaService.promptNativeInstall();
    setIsAttemptingInstall(false);
    if (outcome === 'accepted') {
      setInstallSuccess(true);
      soundEffects.playVictoryFanfare();
    }
  };

  const handleCopyLink = () => {
    soundEffects.playClick();
    const currentUrl = window.location.href;
    navigator.clipboard.writeText(currentUrl).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-zinc-950 border border-zinc-800 w-full max-w-lg rounded-3xl p-5 sm:p-6 shadow-2xl relative space-y-4 my-auto">
        {/* Close Button */}
        <button
          onClick={() => {
            soundEffects.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white flex items-center justify-center transition border border-zinc-700 shadow-xs"
          aria-label="Fechar"
        >
          <X className="w-4 h-4" />
        </button>

        {/* HERO BANNER COM ILUSTRAÇÃO PERSONALIZADA */}
        <div className="relative rounded-2xl overflow-hidden border border-indigo-500/30 bg-gradient-to-br from-indigo-950 via-slate-900 to-zinc-950 shadow-md">
          <div className="aspect-[16/9] w-full relative overflow-hidden flex items-center justify-center bg-slate-950">
            <img
              src="/app-logo.png"
              alt="Trilha do Saber - Logotipo Oficial"
              className="w-full h-full object-contain p-2"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent pointer-events-none" />
          </div>

          <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden border border-indigo-400/50 shadow-md shrink-0 bg-indigo-950">
                <img src="/app-logo.png" alt="Logo" className="w-full h-full object-cover" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-md bg-indigo-500 text-white text-[10px] font-black uppercase tracking-wider shadow-2xs">
                    Atalho Oficial
                  </span>
                  <span className="text-xs font-bold text-amber-300 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    Trilha do Saber
                  </span>
                </div>
                <h2 className="text-base sm:text-lg font-black text-white leading-tight drop-shadow-xs">
                  Instalar Aplicativo
                </h2>
              </div>
            </div>

            {hasPrompt && (
              <button
                onClick={handleTriggerNativeInstall}
                className="px-3.5 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-zinc-950 font-black text-xs rounded-xl shadow-lg flex items-center gap-1.5 transition active:scale-95 shrink-0 animate-bounce"
              >
                <Download className="w-4 h-4" />
                <span>Instalar Agora</span>
              </button>
            )}
          </div>
        </div>

        {/* 🛑 AVISO EM NEGRITO E EM VERMELHO DO GOOGLE CHROME COM A FOTINHA */}
        <div className="p-4 bg-red-950/90 border-2 border-red-600 rounded-2xl shadow-xl flex items-center gap-3.5 animate-in fade-in">
          {/* Fotinha do Google Chrome */}
          <div className="p-1.5 bg-white rounded-2xl shadow-lg shrink-0 flex items-center justify-center border-2 border-red-400">
            <GoogleChromeLogo className="w-11 h-11" />
          </div>

          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-1.5 text-red-300 text-xs font-black uppercase tracking-wide">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <span>Aviso Importante de Instalação:</span>
            </div>
            <p className="text-xs sm:text-sm font-black text-red-200 leading-snug">
              <span className="text-red-400 font-extrabold underline decoration-red-500 underline-offset-2">
                A instalação direta e automática só funciona no Google Chrome!
              </span>
            </p>
            <p className="text-[11px] text-red-200/90 font-medium">
              Caso esteja em outro navegador, abra ou copie o link deste aplicativo no <strong>Google Chrome</strong> (no celular Android, Windows, Mac ou Linux).
            </p>
          </div>
        </div>

        {/* SUCESSO DE INSTALAÇÃO */}
        {installSuccess && (
          <div className="p-3.5 bg-emerald-950/70 border border-emerald-600/80 rounded-2xl flex items-center gap-3 text-emerald-200 animate-in fade-in">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-black text-white leading-tight">
                Aplicativo Instalado com Sucesso! 🎉
              </h4>
              <p className="text-[11px] text-emerald-300/90 mt-0.5">
                O ícone da <strong>Trilha do Saber</strong> já está na sua tela inicial pronto para você estudar a qualquer momento.
              </p>
            </div>
          </div>
        )}

        {/* BOTÃO PRINCIPAL DE AÇÃO: PEDIR INSTALAÇÃO NATIVO / BROWSER PROMPT */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3.5 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5" />
              Instalar com 1 Clique (Google Chrome)
            </span>
            <span className="text-[10px] text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded-md font-bold">
              1 Toque
            </span>
          </div>

          <button
            onClick={handleTriggerNativeInstall}
            disabled={isAttemptingInstall}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm rounded-xl transition shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-2.5 active:scale-98"
          >
            <Download className="w-5 h-5" />
            <span>{isAttemptingInstall ? 'Processando...' : 'Instalar Agora no Google Chrome'}</span>
          </button>
          
          <p className="text-[10px] text-zinc-400 text-center">
            Se a janela de confirmação não abrir de primeira, siga os 3 passos simples abaixo no Google Chrome:
          </p>
        </div>

        {/* BENEFÍCIOS DO ATALHO DO APP */}
        <div className="grid grid-cols-3 gap-2">
          <div className="p-2 rounded-xl bg-zinc-900/80 border border-zinc-800 text-center">
            <div className="w-7 h-7 mx-auto rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center mb-1">
              <Zap className="w-3.5 h-3.5" />
            </div>
            <span className="text-[11px] font-bold text-white block">1 Toque</span>
            <span className="text-[9px] text-zinc-400">Acesso direto</span>
          </div>

          <div className="p-2 rounded-xl bg-zinc-900/80 border border-zinc-800 text-center">
            <div className="w-7 h-7 mx-auto rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-1">
              <MonitorSmartphone className="w-3.5 h-3.5" />
            </div>
            <span className="text-[11px] font-bold text-white block">Tela Cheia</span>
            <span className="text-[9px] text-zinc-400">Sem barra de navegação</span>
          </div>

          <div className="p-2 rounded-xl bg-zinc-900/80 border border-zinc-800 text-center">
            <div className="w-7 h-7 mx-auto rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center mb-1">
              <BellRing className="w-3.5 h-3.5" />
            </div>
            <span className="text-[11px] font-bold text-white block">Lembretes</span>
            <span className="text-[9px] text-zinc-400">Alertas de estudo</span>
          </div>
        </div>

        {/* PLATFORM SELECTOR TABS */}
        <div className="flex bg-zinc-900 p-1 rounded-2xl border border-zinc-800">
          <button
            onClick={() => {
              soundEffects.playClick();
              setPlatformTab('android');
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              platformTab === 'android'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Android (Chrome)</span>
          </button>

          <button
            onClick={() => {
              soundEffects.playClick();
              setPlatformTab('pc');
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              platformTab === 'pc'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Laptop className="w-3.5 h-3.5" />
            <span>PC / Mac (Chrome)</span>
          </button>

          <button
            onClick={() => {
              soundEffects.playClick();
              setPlatformTab('ios');
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              platformTab === 'ios'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>iPhone (Safari)</span>
          </button>
        </div>

        {/* PLATFORM STEP-BY-STEP INSTRUCTIONS */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 space-y-3">
          {/* ANDROID / CHROME */}
          {platformTab === 'android' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-indigo-400 uppercase tracking-wide flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4" />
                  Como Instalar no Google Chrome (Android):
                </h4>
                <span className="text-[10px] text-zinc-500 font-medium">3 passos</span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-zinc-950/70 border border-zinc-800">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[11px] font-black shrink-0">
                    1
                  </span>
                  <div className="space-y-0.5">
                    <p className="font-bold text-white">Abra as opções do Google Chrome</p>
                    <p className="text-zinc-400 text-[11px]">
                      Toque no menu de <strong>três pontinhos (⋮)</strong> no canto superior direito do Google Chrome.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-zinc-950/70 border border-zinc-800">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[11px] font-black shrink-0">
                    2
                  </span>
                  <div className="space-y-0.5">
                    <p className="font-bold text-white">Toque em "Instalar aplicativo"</p>
                    <p className="text-zinc-400 text-[11px]">
                      Selecione <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong>.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-zinc-950/70 border border-zinc-800">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[11px] font-black shrink-0">
                    3
                  </span>
                  <div className="space-y-0.5">
                    <p className="font-bold text-white">Confirme em "Instalar"</p>
                    <p className="text-zinc-400 text-[11px]">
                      O ícone da <strong>Trilha do Saber</strong> ficará disponível na tela do seu celular como um app nativo!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* COMPUTADOR / PC / MAC */}
          {platformTab === 'pc' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-indigo-400 uppercase tracking-wide flex items-center gap-1.5">
                  <Laptop className="w-4 h-4" />
                  Como Instalar no PC / Mac (Google Chrome):
                </h4>
                <span className="text-[10px] text-zinc-500 font-medium">2 passos</span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-zinc-950/70 border border-zinc-800">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[11px] font-black shrink-0">
                    1
                  </span>
                  <div className="space-y-0.5">
                    <p className="font-bold text-white">Clique no ícone de instalação do Chrome</p>
                    <p className="text-zinc-400 text-[11px]">
                      No canto direito da barra de endereço do Google Chrome, clique no ícone de <strong>Instalar Aplicativo 💻</strong> ou vá nos 3 pontinhos (⋮) ➔ <strong>"Instalar Trilha do Saber..."</strong>.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-zinc-950/70 border border-zinc-800">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[11px] font-black shrink-0">
                    2
                  </span>
                  <div className="space-y-0.5">
                    <p className="font-bold text-white">Confirme a Instalação</p>
                    <p className="text-zinc-400 text-[11px]">
                      Clique em <strong>"Instalar"</strong>. Uma janela limpa e dedicada será aberta na sua área de trabalho!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* IPHONE / IPAD (IOS SAFARI) */}
          {platformTab === 'ios' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-indigo-400 uppercase tracking-wide flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4" />
                  Como Instalar no iPhone / iPad (Safari):
                </h4>
                <span className="text-[10px] text-zinc-500 font-medium">3 passos</span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-zinc-950/70 border border-zinc-800">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[11px] font-black shrink-0">
                    1
                  </span>
                  <div className="space-y-0.5">
                    <p className="font-bold text-white flex items-center gap-1.5">
                      Toque em Compartilhar
                      <Share2 className="w-3.5 h-3.5 text-blue-400" />
                    </p>
                    <p className="text-zinc-400 text-[11px]">
                      Na barra inferior do Safari, toque no ícone de <strong>Compartilhar (quadrado com seta ⎋)</strong>.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-zinc-950/70 border border-zinc-800">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[11px] font-black shrink-0">
                    2
                  </span>
                  <div className="space-y-0.5">
                    <p className="font-bold text-white flex items-center gap-1.5">
                      Selecione "Adicionar à Tela de Início"
                      <PlusSquare className="w-3.5 h-3.5 text-emerald-400" />
                    </p>
                    <p className="text-zinc-400 text-[11px]">
                      Role o menu de opções para baixo e toque em <strong>"Adicionar à Tela de Início" (+)</strong>.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-zinc-950/70 border border-zinc-800">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[11px] font-black shrink-0">
                    3
                  </span>
                  <div className="space-y-0.5">
                    <p className="font-bold text-white">Toque em "Adicionar"</p>
                    <p className="text-zinc-400 text-[11px]">
                      No canto superior direito, confirme em <strong>"Adicionar"</strong>. O app estará na tela inicial do seu iPhone!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* BOTÃO COPIAR LINK DO APP */}
          <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between gap-2">
            <span className="text-[11px] text-zinc-400">
              Link de acesso do aplicativo:
            </span>
            <button
              onClick={handleCopyLink}
              className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition active:scale-95 shrink-0"
              title="Copiar link direto do app"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Link Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Copiar Link do App</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* FOOTER CONFIRM BUTTON */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>100% Gratuito & Seguro</span>
          </div>

          <button
            onClick={() => {
              soundEffects.playClick();
              onClose();
            }}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white font-bold text-xs rounded-xl transition"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
