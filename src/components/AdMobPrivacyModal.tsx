import React from 'react';
import { AgeGroup, AdMobPrivacySettings } from '../types';
import { adMobService } from '../services/adMobService';
import {
  getActiveAdMobAppId,
  getActiveBannerAdUnitId,
  IS_TEST_MODE,
  GOOGLE_TEST_IDS,
} from '../config/adMobConfig';
import { soundEffects } from '../services/soundEffects';
import {
  ShieldCheck,
  X,
  Info,
  CheckCircle2,
  Lock,
  Sparkles,
  HelpCircle,
  EyeOff,
  Baby,
  UserCheck,
  GraduationCap,
} from 'lucide-react';

interface AdMobPrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAgeSettings?: () => void;
  theme?: 'light' | 'dark';
}

export const AdMobPrivacyModal: React.FC<AdMobPrivacyModalProps> = ({
  isOpen,
  onClose,
  onOpenAgeSettings,
  theme = 'light',
}) => {
  if (!isOpen) return null;

  const isLight = theme === 'light';
  const ageGroup = adMobService.getAgeGroup();
  const privacy = adMobService.getPrivacySettings();
  const isChild = adMobService.isChildDirected();
  const currentAppId = getActiveAdMobAppId();
  const currentBannerId = getActiveBannerAdUnitId();

  const getAgeLabel = (group: AgeGroup) => {
    switch (group) {
      case 'crianca':
        return 'Criança (Até 12 anos)';
      case 'adolescente':
        return 'Adolescente (13 a 17 anos)';
      case 'adulto':
        return 'Adulto (18+ anos)';
      case 'nao_informada':
      default:
        return 'Idade Não Informada (Proteção Máxima)';
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="admob-privacy-title"
    >
      <div
        className={`w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border flex flex-col max-h-[90vh] ${
          isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#0f172a] border-slate-700 text-slate-100'
        }`}
      >
        {/* Header */}
        <div
          className={`p-4 border-b flex items-center justify-between ${
            isLight ? 'bg-emerald-50/80 border-emerald-100' : 'bg-emerald-950/30 border-emerald-800/40'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 id="admob-privacy-title" className="text-sm font-black text-emerald-900 dark:text-emerald-300">
                Política para Famílias • Google AdMob
              </h3>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                Proteção à Criança e Privacidade Escolar
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              soundEffects.playClick();
              onClose();
            }}
            className={`p-1.5 rounded-lg transition ${
              isLight ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto space-y-4 text-xs">
          {/* Status Box */}
          <div
            className={`p-3.5 rounded-xl border flex items-start gap-3 ${
              isChild
                ? isLight
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-emerald-950/40 border-emerald-800 text-emerald-200'
                : isLight
                ? 'bg-indigo-50 border-indigo-200 text-indigo-900'
                : 'bg-indigo-950/40 border-indigo-800 text-indigo-200'
            }`}
          >
            <Baby className="w-5 h-5 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
            <div className="space-y-1">
              <span className="font-bold text-xs block">
                Tratamento Infantil Ativo: {isChild ? 'SIM (100% Protegido)' : 'NÃO (Perfil Jovem/Adulto)'}
              </span>
              <p className="text-[11px] leading-relaxed opacity-90">
                Faixa etária selecionada: <strong>{getAgeLabel(ageGroup)}</strong>. O aplicativo aplica as diretrizes de
                idade apropriada da Google Play Store.
              </p>
            </div>
          </div>

          {/* Guidelines checklist */}
          <div className="space-y-2.5">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Garantias Ativas no Google Mobile Ads
            </h4>

            <div className="space-y-2">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-xs">Classificação Máxima de Conteúdo: {privacy.maxAdContentRating} (Livre)</strong>
                  <span className="text-[11px] text-slate-500">
                    Apenas anúncios com classificação livre para todas as idades (G) são solicitados para crianças.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Lock className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-xs">Sem Publicidade Personalizada (NPA = 1)</strong>
                  <span className="text-[11px] text-slate-500">
                    Nenhum anúncio baseado em histórico, rastreamento ou preferências pessoais é exibido para crianças.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <EyeOff className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-xs">Identificadores de Publicidade Bloqueados</strong>
                  <span className="text-[11px] text-slate-500">
                    Identificadores de publicidade (GAID/AAID) não são transmitidos para o perfil infantil.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <GraduationCap className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-xs">Zero Anúncios em Telas de Prova ou Exercícios</strong>
                  <span className="text-[11px] text-slate-500">
                    O banner é restrito à navegação inicial e nunca atrapalha resolução de provas, simulados ou foco pedagógico.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-xs">Idade Exata Não Armazenada</strong>
                  <span className="text-[11px] text-slate-500">
                    Não coletamos nem armazenamos data de nascimento ou a idade exata da pessoa, apenas a faixa necessária para cumprir a política.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Technical Info (Test mode) */}
          <div
            className={`p-3 rounded-xl border text-[10px] space-y-1 font-mono ${
              isLight ? 'bg-slate-50 border-slate-200 text-slate-600' : 'bg-slate-900/80 border-slate-800 text-slate-400'
            }`}
          >
            <div className="flex justify-between items-center font-bold text-slate-700 dark:text-slate-300">
              <span>Status do SDK:</span>
              <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400 font-sans text-[9px]">
                {IS_TEST_MODE ? 'MODO DE TESTE ATIVO' : 'MODO PRODUÇÃO'}
              </span>
            </div>
            <div>Ad Unit ID: {currentBannerId}</div>
            <div>App ID: {currentAppId}</div>
            <div>TFCD (Child-Directed): {privacy.tagForChildDirectedTreatment ? 'TRUE' : 'FALSE'}</div>
            <div>TFUA (Under-Age): {privacy.tagForUnderAgeOfConsent ? 'TRUE' : 'FALSE'}</div>
            <div>Max Rating: {privacy.maxAdContentRating}</div>
          </div>
        </div>

        {/* Footer */}
        <div
          className={`p-3.5 border-t flex items-center justify-between gap-2 ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/60 border-slate-800'
          }`}
        >
          {onOpenAgeSettings ? (
            <button
              onClick={() => {
                soundEffects.playClick();
                onClose();
                onOpenAgeSettings();
              }}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
            >
              Alterar Faixa Etária
            </button>
          ) : (
            <div />
          )}

          <button
            onClick={() => {
              soundEffects.playClick();
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition cursor-pointer"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
