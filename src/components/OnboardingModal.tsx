import React, { useState, useEffect } from 'react';
import { GradeLevel, SubjectId, UserProfile, AgeGroup } from '../types';
import {
  GRADE_LABELS,
  CONFIGURABLE_SPECIFIC_SUBJECTS,
  HIGH_SCHOOL_GRADES,
} from '../data/curriculumData';
import { soundEffects } from '../services/soundEffects';
import { generateUniqueNames } from '../utils/nameGenerator';
import { adMobService } from '../services/adMobService';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  GraduationCap,
  RefreshCw,
  Check,
  Atom,
  BookOpen,
  ShieldCheck,
} from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  user?: UserProfile;
  onComplete?: (profile: {
    name: string;
    grade: GradeLevel;
    avatar: string;
    ageGroup?: AgeGroup;
    customSubjects?: SubjectId[];
    hasConfiguredSubjects?: boolean;
  }) => void;
  onSaveProfile?: (profile: {
    name: string;
    grade: GradeLevel;
    avatar: string;
    ageGroup?: AgeGroup;
    customSubjects?: SubjectId[];
    hasConfiguredSubjects?: boolean;
  }) => void;
  onClose?: () => void;
}

const AVATARS = ['🎓', '🦁', '🚀', '⭐', '🦉', '⚡', '🦊', '👑', '💎', '🔥'];

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  user,
  onComplete,
  onSaveProfile,
  onClose,
}) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState(user?.name || '');
  const [grade, setGrade] = useState<GradeLevel>(user?.grade || '6_fund');
  const [avatar, setAvatar] = useState(user?.avatar || '🎓');
  const [ageGroup, setAgeGroup] = useState<AgeGroup>(() => user?.ageGroup || adMobService.getAgeGroup());
  const [error, setError] = useState('');
  const [suggestedNames, setSuggestedNames] = useState<string[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<SubjectId[]>([]);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setName(user?.name || '');
      const initGrade = user?.grade || '6_fund';
      setGrade(initGrade);
      setAvatar(user?.avatar || '🎓');
      setAgeGroup(user?.ageGroup || adMobService.deduceAgeGroupFromGrade(initGrade));
      setError('');
      setSuggestedNames(generateUniqueNames(4));
    }
  }, [isOpen, user]);

  // When grade changes, pre-configure subjects
  useEffect(() => {
    const isHS = HIGH_SCHOOL_GRADES.includes(grade);
    if (isHS) {
      setSelectedSubjects(['biologia', 'fisica', 'quimica']);
    } else {
      setSelectedSubjects([]);
    }
  }, [grade]);

  if (!isOpen) return null;

  const handlePickSuggestion = (sug: string) => {
    soundEffects.playClick();
    setName(sug);
    setError('');
  };

  const handleRefreshSuggestions = () => {
    soundEffects.playClick();
    setSuggestedNames(generateUniqueNames(4));
  };

  const toggleSubject = (id: SubjectId) => {
    soundEffects.playClick();
    setSelectedSubjects((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleSelectSciencePack = () => {
    soundEffects.playClick();
    setSelectedSubjects(['biologia', 'fisica', 'quimica']);
  };

  const handleClearSciencePack = () => {
    soundEffects.playClick();
    setSelectedSubjects([]);
  };

  const handleProceedToStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) {
      setError('Por favor, digite seu nome ou escolha uma sugestão.');
      soundEffects.playError();
      return;
    }
    if (cleanName.length < 3) {
      setError('O nome precisa ter pelo menos 3 caracteres.');
      soundEffects.playError();
      return;
    }

    soundEffects.playClick();
    setStep(2);
  };

  const handleFinalize = () => {
    soundEffects.playSuccess();
    try {
      localStorage.setItem('estudahud_subjects_prompted_once', 'true');
    } catch {}
    adMobService.setAgeGroup(ageGroup);
    const cleanName = name.trim();
    const profileData = {
      name: cleanName,
      grade,
      avatar,
      ageGroup,
      customSubjects: selectedSubjects,
      hasConfiguredSubjects: true,
    };
    if (onSaveProfile) onSaveProfile(profileData);
    if (onComplete) onComplete(profileData);
    if (onClose) onClose();
  };

  const scienceSubjects = CONFIGURABLE_SPECIFIC_SUBJECTS;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-700 w-full max-w-md rounded-3xl p-5 sm:p-6 shadow-2xl relative my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-800 text-xs">
          <div className="flex items-center gap-2">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                step === 1 ? 'bg-blue-600 text-white' : 'bg-emerald-600 text-white'
              }`}
            >
              {step === 1 ? '1' : '✓'}
            </span>
            <span className={step === 1 ? 'text-zinc-200 font-bold' : 'text-zinc-400'}>
              Perfil
            </span>
            <span className="text-zinc-600">→</span>
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                step === 2 ? 'bg-indigo-600 text-white' : 'bg-zinc-800 text-zinc-400'
              }`}
            >
              2
            </span>
            <span className={step === 2 ? 'text-zinc-200 font-bold' : 'text-zinc-400'}>
              Matérias
            </span>
          </div>
          <span className="text-[11px] text-zinc-400 font-medium">Passo {step} de 2</span>
        </div>

        {step === 1 ? (
          /* STEP 1: PERFIL */
          <>
            <div className="text-center mb-5">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-3xl shadow-lg mb-3">
                {avatar}
              </div>
              <h2 className="text-xl font-extrabold text-zinc-100">Bem-vindo à Trilha do Saber!</h2>
              <p className="text-xs text-zinc-400 mt-1">Configure seu perfil de estudos para começar</p>
            </div>

            <form onSubmit={handleProceedToStep2} className="space-y-4 text-xs">
              {/* Avatar selector */}
              <div>
                <label className="block text-zinc-300 font-medium mb-1.5">Escolha seu avatar</label>
                <div className="grid grid-cols-5 gap-1.5 p-2 bg-zinc-950/70 rounded-xl border border-zinc-800">
                  {AVATARS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => {
                        soundEffects.playClick();
                        setAvatar(emoji);
                      }}
                      className={`h-9 text-lg rounded-lg flex items-center justify-center transition cursor-pointer ${
                        avatar === emoji
                          ? 'bg-blue-600/40 border-2 border-blue-400 scale-105'
                          : 'hover:bg-zinc-800'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name & Suggestions */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-zinc-300 font-medium">Nome ou Apelido</label>
                  <button
                    type="button"
                    onClick={handleRefreshSuggestions}
                    className="text-[10px] text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1 transition cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Novas Sugestões</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={name}
                  maxLength={20}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="Digite seu nome ou escolha abaixo..."
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-zinc-100 focus:outline-hidden focus:border-blue-500 text-sm font-medium"
                  autoFocus
                />

                {/* Suggestions pills */}
                {suggestedNames.length > 0 && (
                  <div className="mt-2">
                    <div className="text-[10px] text-zinc-400 font-semibold mb-1 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-purple-400" />
                      <span>Sugestões disponíveis:</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {suggestedNames.map((sug) => (
                        <button
                          key={sug}
                          type="button"
                          onClick={() => handlePickSuggestion(sug)}
                          className={`text-[11px] px-2.5 py-1 rounded-lg border font-medium transition cursor-pointer ${
                            name === sug
                              ? 'bg-purple-600 border-purple-400 text-white'
                              : 'bg-zinc-950 border-zinc-800 text-purple-300 hover:border-purple-500'
                          }`}
                        >
                          {sug}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {error && <p className="text-rose-400 text-[11px] mt-1.5 font-medium">{error}</p>}
              </div>

              {/* Grade */}
              <div>
                <label className="block text-zinc-300 font-medium mb-1.5 flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-blue-400" />
                  <span>Qual série você estuda?</span>
                </label>
                <select
                  value={grade}
                  onChange={(e) => {
                    const newGrade = e.target.value as GradeLevel;
                    setGrade(newGrade);
                    // Atualiza a faixa etária sugerida se ainda estiver no padrão
                    setAgeGroup(adMobService.deduceAgeGroupFromGrade(newGrade));
                  }}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2.5 text-zinc-100 focus:outline-hidden focus:border-blue-500 text-xs font-semibold"
                >
                  {(Object.keys(GRADE_LABELS) as GradeLevel[]).map((g) => (
                    <option key={g} value={g}>
                      {GRADE_LABELS[g].full} ({GRADE_LABELS[g].stage})
                    </option>
                  ))}
                </select>
              </div>

              {/* Faixa Etária (Política para Famílias da Google Play) */}
              <div className="pt-2 border-t border-zinc-800">
                <label className="block text-zinc-300 font-medium mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Faixa Etária do Aluno</span>
                  </span>
                  <span className="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-1.5 py-0.5 rounded font-bold">
                    Proteção Familiar
                  </span>
                </label>
                <select
                  value={ageGroup}
                  onChange={(e) => setAgeGroup(e.target.value as AgeGroup)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2.5 text-zinc-100 focus:outline-hidden focus:border-emerald-500 text-xs font-semibold"
                >
                  <option value="crianca">🧒 Criança (Até 12 anos - Proteção Máxima & Classificação G)</option>
                  <option value="adolescente">🧑 Adolescente (13 a 17 anos - Sem Anúncios Personalizados)</option>
                  <option value="adulto">🧑‍💼 Adulto (18+ anos)</option>
                  <option value="nao_informada">❓ Prefiro não informar (Proteção Infantil Ativa)</option>
                </select>
                <p className="text-[10px] text-zinc-400 mt-1">
                  🔒 Não armazenamos data de nascimento nem idade exata.
                </p>
              </div>

              {/* Next Step */}
              <button
                type="submit"
                className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition active:scale-98 cursor-pointer"
              >
                <span>Avançar: Configurar Matérias</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </>
        ) : (
          /* STEP 2: PERSONALIZAR MATÉRIAS ESCOLARES */
          <div className="space-y-4">
            <div className="text-left">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">📚</span>
                <h3 className="text-base font-extrabold text-white">
                  Matérias da sua Escola
                </h3>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Sua escola tem matérias específicas como <strong>Biologia, Física e Química</strong>{' '}
                separadas? Selecione abaixo quais você estuda para adicioná-las aos seus estudos:
              </p>
            </div>

            {/* Sciences Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-indigo-400 flex items-center gap-1">
                  <Atom className="w-3.5 h-3.5" />
                  <span>Ciências da Natureza Específicas</span>
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSelectSciencePack}
                    className="text-[11px] text-blue-400 hover:underline cursor-pointer"
                  >
                    Marcar as 3
                  </button>
                  <span className="text-zinc-600">•</span>
                  <button
                    type="button"
                    onClick={handleClearSciencePack}
                    className="text-[11px] text-zinc-400 hover:underline cursor-pointer"
                  >
                    Desmarcar
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {scienceSubjects.map((s) => {
                  const isChecked = selectedSubjects.includes(s.id);
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => toggleSubject(s.id)}
                      className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1 cursor-pointer ${
                        isChecked
                          ? 'bg-indigo-600/30 border-indigo-400 text-white ring-1 ring-indigo-400'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      <span className="text-2xl">{s.icon}</span>
                      <span className="text-xs font-bold block">{s.name}</span>
                      <div
                        className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[10px] ${
                          isChecked ? 'bg-indigo-500 text-white' : 'border border-zinc-600'
                        }`}
                      >
                        {isChecked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Info note */}
            <p className="text-[11px] text-zinc-400 bg-zinc-950 p-2.5 rounded-xl border border-zinc-800">
              💡 As matérias básicas (Matemática, Português, Ciências geral, História, Geografia,
              Inglês e Artes) já vêm garantidas. Você pode alterar essa escolha a qualquer momento no seu
              perfil.
            </p>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  soundEffects.playClick();
                  setStep(1);
                }}
                className="px-3.5 py-3 rounded-xl border border-zinc-700 text-zinc-300 hover:bg-zinc-800 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Voltar</span>
              </button>

              <button
                type="button"
                onClick={handleFinalize}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition active:scale-98 cursor-pointer"
              >
                <span>Concluir e Iniciar Aventura</span>
                <Check className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


