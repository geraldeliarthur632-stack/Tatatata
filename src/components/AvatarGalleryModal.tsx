import React, { useState } from 'react';
import { UserProfile } from '../types';
import { THEMATIC_AVATARS, ThematicAvatar, isAvatarUnlocked, getAvatarById, getAvatarByEmoji } from '../data/avatarGalleryData';
import { soundEffects } from '../services/soundEffects';
import {
  X,
  Sparkles,
  Lock,
  Check,
  Award,
  Zap,
  Star,
  Crown,
  ChevronRight,
  Flame,
  Shield,
  Palette,
} from 'lucide-react';

interface AvatarGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onSelectAvatar: (avatar: ThematicAvatar) => void;
}

type CategoryFilter = 'all' | 'exatas' | 'humanas' | 'ciencias' | 'estrategia' | 'lendarios' | 'iniciais';

export const AvatarGalleryModal: React.FC<AvatarGalleryModalProps> = ({
  isOpen,
  onClose,
  user,
  onSelectAvatar,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all');
  const [previewAvatar, setPreviewAvatar] = useState<ThematicAvatar>(() => {
    return (
      (user.avatarId ? getAvatarById(user.avatarId) : null) ||
      getAvatarByEmoji(user.avatar) ||
      THEMATIC_AVATARS[0]
    );
  });

  if (!isOpen) return null;

  const userPoints = user.totalPoints || 0;

  const filteredAvatars = THEMATIC_AVATARS.filter((avatar) => {
    if (selectedCategory === 'all') return true;
    return avatar.category === selectedCategory;
  });

  const unlockedCount = THEMATIC_AVATARS.filter((a) => isAvatarUnlocked(a, userPoints)).length;
  const isPreviewUnlocked = isAvatarUnlocked(previewAvatar, userPoints);
  const isPreviewEquipped =
    user.avatarId === previewAvatar.id || user.avatar === previewAvatar.emoji;

  const handleEquip = (avatar: ThematicAvatar) => {
    if (!isAvatarUnlocked(avatar, userPoints)) {
      soundEffects.playError();
      return;
    }
    soundEffects.playVictory();
    onSelectAvatar(avatar);
  };

  const getAnimationCSS = (anim: ThematicAvatar['animationKey']) => {
    switch (anim) {
      case 'matrix':
      case 'pulse':
        return 'animate-pulse';
      case 'float':
        return 'animate-bounce';
      case 'flame':
      case 'cosmic':
      case 'sparkle':
        return 'animate-pulse';
      default:
        return '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#0f1422] border border-[#273553] w-full max-w-2xl rounded-3xl p-5 sm:p-6 shadow-2xl relative my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#1e293b]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 via-purple-600 to-pink-500 p-0.5 shadow-lg flex items-center justify-center">
              <div className="w-full h-full rounded-[14px] bg-[#0b0f19] flex items-center justify-center text-amber-400">
                <Palette className="w-6 h-6" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white">Galeria de Avatares</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  {unlockedCount} / {THEMATIC_AVATARS.length} Desbloqueados
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Atinja metas de XP em estudos para liberar avatares temáticos e animados!
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#1e293b] transition cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Preview Card */}
        <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-[#141b2d] via-[#1a233b] to-[#141b2d] border border-[#2c3d61] relative overflow-hidden shadow-inner">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            {/* Animated Avatar Visual */}
            <div className="relative shrink-0">
              <div
                className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br ${previewAvatar.bgGradient} p-1 ${previewAvatar.borderClass} ${previewAvatar.glowClass} flex items-center justify-center transition-all duration-300`}
              >
                <div className="w-full h-full rounded-xl bg-[#0b0f19]/90 flex items-center justify-center text-4xl sm:text-5xl select-none relative overflow-hidden">
                  <span className={`${getAnimationCSS(previewAvatar.animationKey)} inline-block transform hover:scale-110 transition duration-200`}>
                    {previewAvatar.emoji}
                  </span>
                  {/* Subtle decorative glow overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-white/10 pointer-events-none" />
                </div>
              </div>

              {!isPreviewUnlocked && (
                <div className="absolute -top-1.5 -right-1.5 w-7 h-7 rounded-full bg-slate-900 border border-amber-500/60 text-amber-400 flex items-center justify-center shadow-lg">
                  <Lock className="w-3.5 h-3.5" />
                </div>
              )}
            </div>

            {/* Avatar Details */}
            <div className="flex-1 text-center sm:text-left space-y-1.5 min-w-0">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h3 className="text-base sm:text-lg font-black text-white">
                  {previewAvatar.name}
                </h3>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {previewAvatar.badgeLabel}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                  {previewAvatar.categoryLabel}
                </span>
              </div>

              <p className="text-xs text-slate-300 font-medium">
                {previewAvatar.description}
              </p>

              <div className="flex items-center justify-center sm:justify-start gap-1.5 text-[11px] text-amber-300 font-bold">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Efeito: {previewAvatar.specialPerk}</span>
              </div>

              {/* Unlock Requirement / Progress */}
              <div className="pt-1">
                {isPreviewUnlocked ? (
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Desbloqueado!
                    </span>
                    <button
                      onClick={() => handleEquip(previewAvatar)}
                      disabled={isPreviewEquipped}
                      className={`px-4 py-1.5 rounded-xl text-xs font-black transition cursor-pointer shadow-md ${
                        isPreviewEquipped
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 cursor-default'
                          : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold'
                      }`}
                    >
                      {isPreviewEquipped ? '✓ Equipado no Perfil' : 'Equipar Este Avatar'}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1.5 max-w-sm">
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Lock className="w-3 h-3 text-amber-400" /> Requisito: {previewAvatar.xpRequired} XP
                      </span>
                      <span className="text-amber-400">
                        {userPoints} / {previewAvatar.xpRequired} XP (Faltam {Math.max(previewAvatar.xpRequired - userPoints, 0)} XP)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden border border-slate-700">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500"
                        style={{
                          width: `${Math.min(Math.round((userPoints / previewAvatar.xpRequired) * 100), 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-3 no-scrollbar shrink-0">
          {[
            { id: 'all', label: 'Todos' },
            { id: 'iniciais', label: 'Iniciais' },
            { id: 'exatas', label: 'Exatas & Lógica' },
            { id: 'humanas', label: 'Humanas & Letras' },
            { id: 'ciencias', label: 'Ciências' },
            { id: 'estrategia', label: 'Estratégia' },
            { id: 'lendarios', label: 'Lendários 👑' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                soundEffects.playClick();
                setSelectedCategory(tab.id as CategoryFilter);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                selectedCategory === tab.id
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-[#161e31] hover:bg-[#1e293b] text-slate-300 border border-[#273553]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Avatars Grid */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-2 max-h-[340px]">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
            {filteredAvatars.map((avatar) => {
              const unlocked = isAvatarUnlocked(avatar, userPoints);
              const isSelected = previewAvatar.id === avatar.id;
              const isEquipped = user.avatarId === avatar.id || user.avatar === avatar.emoji;

              return (
                <button
                  key={avatar.id}
                  onClick={() => {
                    soundEffects.playClick();
                    setPreviewAvatar(avatar);
                  }}
                  className={`p-2.5 rounded-2xl border text-center relative flex flex-col items-center gap-1.5 transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'bg-[#1e293b] border-amber-400 ring-2 ring-amber-400/40 scale-[1.02] shadow-lg'
                      : unlocked
                      ? 'bg-[#121829] hover:bg-[#182238] border-[#273553]'
                      : 'bg-[#0e1320]/80 hover:bg-[#121829] border-[#1e293b] opacity-80'
                  }`}
                >
                  {/* Equipped tag */}
                  {isEquipped && (
                    <span className="absolute top-1.5 left-1.5 w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[9px] font-black shadow">
                      ✓
                    </span>
                  )}

                  {/* Lock icon */}
                  {!unlocked && (
                    <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-slate-900/90 text-amber-400 flex items-center justify-center">
                      <Lock className="w-2.5 h-2.5" />
                    </div>
                  )}

                  {/* Avatar Visual */}
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${avatar.bgGradient} p-0.5 ${
                      unlocked ? avatar.borderClass : 'border-slate-700'
                    } flex items-center justify-center`}
                  >
                    <div className="w-full h-full rounded-[10px] bg-[#0b0f19] flex items-center justify-center text-2xl select-none">
                      <span className={unlocked ? getAnimationCSS(avatar.animationKey) : 'grayscale contrast-75'}>
                        {avatar.emoji}
                      </span>
                    </div>
                  </div>

                  {/* Name & XP */}
                  <div className="w-full">
                    <p className="text-[11px] font-bold text-white truncate">{avatar.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">
                      {avatar.xpRequired === 0 ? 'Livre' : `${avatar.xpRequired} XP`}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-[#1e293b] flex items-center justify-between text-xs text-slate-400">
          <span>Seu XP Total: <strong className="text-amber-400 font-extrabold">{userPoints} XP</strong></span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#1e293b] hover:bg-[#2a3854] text-white font-bold transition cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
