import React, { useState, useEffect } from 'react';
import { AgeGroup } from '../types';
import { adMobService } from '../services/adMobService';
import { soundEffects } from '../services/soundEffects';
import {
  ShieldCheck,
  X,
  Check,
  Baby,
  Smile,
  GraduationCap,
  HelpCircle,
  Lock,
  EyeOff,
  AlertCircle,
} from 'lucide-react';

interface AgeClassificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme?: 'light' | 'dark';
  onAgeSaved?: (group: AgeGroup) => void;
}

export const AgeClassificationModal: React.FC<AgeClassificationModalProps> = ({
  isOpen,
  onClose,
  theme = 'light',
  onAgeSaved,
}) => {
  const [selectedGroup, setSelectedGroup] = useState<AgeGroup>(() => adMobService.getAgeGroup());
  const isLight = theme === 'light';

  useEffect(() => {
    if (isOpen) {
      setSelectedGroup(adMobService.getAgeGroup());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    soundEffects.playSuccess();
    adMobService.setAgeGroup(selectedGroup);
    if (onAgeSaved) {
      onAgeSaved(selectedGroup);
    }
    onClose();
  };

  const options: {
    id: AgeGroup;
    title: string;
    subtitle: string;
    badge: string;
    icon: React.ElementType;
    details: string;
    treatment: 'child' | 'teen' | 'adult' | 'safe_default';
  }[] = [
    {
      id: 'crianca',
      title: 'Criança (Até 12 anos)',
      subtitle: 'Alunos do Ensino Fundamental I e II',
      badge: 'Proteção COPPA & Classificação G',
      icon: Baby,
      details: 'Anúncios 100% livres de conteúdo sensível (Classificação G). Sem rastreamento de dados, sem publicidade personalizada e sem identificador de anúncios.',
      treatment: 'child',
    },
    {
      id: 'adolescente',
      title: 'Adolescente (13 a 17 anos)',
      subtitle: 'Alunos do Ensino Fundamental Final e Ensino Médio',
      badge: 'Proteção para Menores (TFUA)',
      icon: Smile,
      details: 'Anúncios adequados a estudantes jovens. Publicidade personalizada desativada para proteção de menores.',
      treatment: 'teen',
    },
    {
      id: 'adulto',
      title: 'Adulto (18 anos ou mais)',
      subtitle: 'Estudantes do ENEM, vestibulares e concurseiros',
      badge: 'Classificação Geral Educativa',
      icon: GraduationCap,
      details: 'Perfil educacional padrão para maiores de idade.',
      treatment: 'adult',
    },
    {
      id: 'nao_informada',
      title: 'Prefiro não informar',
      subtitle: 'Máxima cautela e privacidade',
      badge: 'Tratado como Criança (Classificação G)',
      icon: HelpCircle,
      details: 'Por segurança e respeito à Política para Famílias da Google Play, se a idade não for especificada, o app aplica automaticamente a proteção infantil integral.',
      treatment: 'safe_default',
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="age-config-modal-title"
    >
      <div
        className={`w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border flex flex-col max-h-[90vh] ${
          isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#0f172a] border-slate-700 text-slate-100'
        }`}
      >
        {/* Header */}
        <div
          className={`p-4 border-b flex items-center justify-between ${
            isLight ? 'bg-indigo-50/80 border-indigo-100' : 'bg-indigo-950/30 border-indigo-800/40'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 id="age-config-modal-title" className="text-sm font-black text-indigo-900 dark:text-indigo-300">
                Faixa Etária & Família
              </h3>
              <p className="text-[11px] text-indigo-700 dark:text-indigo-400 font-medium">
                Conformidade com a Política para Famílias do Google Play
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
        <div className="p-4 overflow-y-auto space-y-3.5 text-xs">
          {/* Privacy Note */}
          <div
            className={`p-3 rounded-xl border flex items-start gap-2.5 ${
              isLight ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-amber-950/30 border-amber-800/50 text-amber-200'
            }`}
          >
            <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed">
              <strong>Privacidade Garantida:</strong> Não coletamos nem armazenamos sua data de nascimento ou sua idade exata. Apenas registramos a categoria etária para impedir anúncios inadequados e proteger crianças.
            </div>
          </div>

          <div className="space-y-2">
            <label className="font-bold text-slate-700 dark:text-slate-300 block">
              Selecione a faixa etária do usuário:
            </label>

            <div className="space-y-2">
              {options.map((opt) => {
                const isSelected = selectedGroup === opt.id;
                const Icon = opt.icon;

                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      soundEffects.playClick();
                      setSelectedGroup(opt.id);
                    }}
                    className={`w-full p-3 rounded-xl border text-left transition relative cursor-pointer ${
                      isSelected
                        ? isLight
                          ? 'bg-indigo-50/90 border-indigo-500 ring-2 ring-indigo-500/20 shadow-xs'
                          : 'bg-indigo-950/50 border-indigo-500 ring-2 ring-indigo-500/30 shadow-xs'
                        : isLight
                        ? 'bg-white hover:bg-slate-50 border-slate-200'
                        : 'bg-slate-800/50 hover:bg-slate-800 border-slate-700'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          isSelected
                            ? 'bg-indigo-600 text-white'
                            : isLight
                            ? 'bg-slate-100 text-slate-600'
                            : 'bg-slate-700 text-slate-300'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>

                      <div className="flex-1 min-w-0 pr-6">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-xs text-slate-900 dark:text-white">
                            {opt.title}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500 block">
                          {opt.subtitle}
                        </span>
                        <p className="text-[10px] text-slate-600 dark:text-slate-400 mt-1 leading-snug">
                          {opt.details}
                        </p>
                      </div>

                      <div className="absolute top-3 right-3">
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center transition ${
                            isSelected
                              ? 'bg-indigo-600 border-indigo-600 text-white'
                              : 'border-slate-300 dark:border-slate-600'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className={`p-3.5 border-t flex items-center justify-between gap-2 ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/60 border-slate-800'
          }`}
        >
          <button
            onClick={() => {
              soundEffects.playClick();
              onClose();
            }}
            className="px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition cursor-pointer"
          >
            Cancelar
          </button>

          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition active:scale-95 cursor-pointer flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Salvar Configuração</span>
          </button>
        </div>
      </div>
    </div>
  );
};
