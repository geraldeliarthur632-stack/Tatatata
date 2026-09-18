/**
 * ============================================================================
 * POLÍTICAS DE RESTRIÇÃO DE CONTEÚDO E CONFORMIDADE GOOGLE ADMOB & PLAY FAMILIES
 * ============================================================================
 * 
 * Aplicativo: Trilha do Saber (EstudaHUD)
 * AdMob App ID Oficial Homologado: ca-app-pub-8922902046490534~6406875608
 * 
 * Este arquivo centraliza todas as configurações de restrição de conteúdo (Content Ratings),
 * conformidade estrita com a Política para Famílias do Google Play (Google Play Families Policy),
 * COPPA (Children's Online Privacy Protection Act), TFCD (Tag For Child Directed Treatment),
 * TFUA (Tag For Users Under the Age of Consent in EEA/LGPD) e controle de anúncios nas 5 áreas principais.
 * ============================================================================
 */

import { AgeGroup, AdMobPrivacySettings } from '../types';

/**
 * 📍 ADMOB APP ID OFICIAL HOMOLOGADO
 * Utilizado para validação estrita de integridade em conformidade com a Google Play Store
 */
export const OFFICIAL_ADMOB_APP_ID = 'ca-app-pub-8922902046490534~6406875608' as const;

/**
 * Classificações de conteúdo do Google AdMob (RequestConfiguration MaxAdContentRating)
 * - 'G': General Audiences (Livre para todas as idades, compulsório para o programa Famílias)
 * - 'PG': Parental Guidance (Orientação parental / Conteúdo moderado leve)
 * - 'T': Teen (Adolescentes a partir de 13 anos)
 * - 'MA': Mature Audiences (Adultos 18+ / Proibido em apps para famílias)
 */
export const ADMOB_CONTENT_RATINGS = {
  G: 'G',
  PG: 'PG',
  T: 'T',
  MA: 'MA',
} as const;

export type AdMobContentRating = typeof ADMOB_CONTENT_RATINGS[keyof typeof ADMOB_CONTENT_RATINGS];

/**
 * Matriz de conformidade da Política de Famílias do Google Play (Google Play Families Policy)
 */
export interface ContentRatingPolicyRule {
  readonly rating: AdMobContentRating;
  readonly description: string;
  readonly isAllowedInFamiliesPolicy: boolean;
  readonly requiresChildDirectedTreatment: boolean;
  readonly requiresNonPersonalizedAds: boolean;
  readonly minAge: number;
}

export const CONTENT_RATING_RULES: Record<AdMobContentRating, ContentRatingPolicyRule> = {
  G: {
    rating: 'G',
    description: 'General Audiences (Livre): Adequado para todas as idades, incluindo crianças e estudantes de todas as séries.',
    isAllowedInFamiliesPolicy: true,
    requiresChildDirectedTreatment: true,
    requiresNonPersonalizedAds: true,
    minAge: 0,
  },
  PG: {
    rating: 'PG',
    description: 'Parental Guidance (Orientação Parental): Adequado para pré-adolescentes e adolescentes acompanhados.',
    isAllowedInFamiliesPolicy: true,
    requiresChildDirectedTreatment: false,
    requiresNonPersonalizedAds: true,
    minAge: 13,
  },
  T: {
    rating: 'T',
    description: 'Teen (Adolescentes): Adequado exclusivamente para 13+ anos. Não permitido para faixas infantis no Google Play.',
    isAllowedInFamiliesPolicy: false,
    requiresChildDirectedTreatment: false,
    requiresNonPersonalizedAds: true,
    minAge: 13,
  },
  MA: {
    rating: 'MA',
    description: 'Mature Audiences (Adultos): Expressamente PROIBIDO pela Política de Famílias do Google Play e bloqueado no app.',
    isAllowedInFamiliesPolicy: false,
    requiresChildDirectedTreatment: false,
    requiresNonPersonalizedAds: false,
    minAge: 18,
  },
};

/**
 * 5 ÁREAS PRINCIPAIS DE ESTUDO DO CURRÍCULO ESCOLAR
 * O fluxo de aprendizagem destas 5 matérias essenciais NUNCA deve ser bloqueado por anúncios.
 */
export const CORE_STUDY_AREAS = [
  'matematica',
  'portugues',
  'ciencias',
  'historia',
  'geografia',
] as const;

export type CoreStudyArea = typeof CORE_STUDY_AREAS[number];

/**
 * Diretrizes de restrição máxima permitida por faixa etária no aplicativo
 */
export const AGE_GROUP_POLICY_RESTRICTIONS: Record<AgeGroup, {
  readonly maxAllowedRating: AdMobContentRating;
  readonly tagForChildDirectedTreatment: boolean;
  readonly tagForUnderAgeOfConsent: boolean;
  readonly nonPersonalizedAds: boolean;
  readonly allowAdIdTransmission: boolean;
  readonly explanation: string;
}> = {
  crianca: {
    maxAllowedRating: ADMOB_CONTENT_RATINGS.G,
    tagForChildDirectedTreatment: true,
    tagForUnderAgeOfConsent: true,
    nonPersonalizedAds: true,
    allowAdIdTransmission: false,
    explanation: 'Crianças até 12 anos: restrição estrita "G" obrigatória pelo Google Play Families e COPPA sem identificadores de anúncio.',
  },
  nao_informada: {
    maxAllowedRating: ADMOB_CONTENT_RATINGS.G,
    tagForChildDirectedTreatment: true,
    tagForUnderAgeOfConsent: true,
    nonPersonalizedAds: true,
    allowAdIdTransmission: false,
    explanation: 'Idade não informada: aplicação preventiva das regras de proteção infantil ("G") para blindagem de neutral age screen.',
  },
  adolescente: {
    maxAllowedRating: ADMOB_CONTENT_RATINGS.PG,
    tagForChildDirectedTreatment: false,
    tagForUnderAgeOfConsent: true,
    nonPersonalizedAds: true,
    allowAdIdTransmission: false,
    explanation: 'Adolescentes (13-17 anos): restrição máxima "PG", proteção para menores (TFUA) e sem anúncios com segmentação comportamental.',
  },
  adulto: {
    maxAllowedRating: ADMOB_CONTENT_RATINGS.PG, // Limitado a PG para preservar a natureza pedagógica compartilhada
    tagForChildDirectedTreatment: false,
    tagForUnderAgeOfConsent: false,
    nonPersonalizedAds: false,
    allowAdIdTransmission: true,
    explanation: 'Adultos: mantido em "PG" para preservar a ambientação educacional segura do Trilha do Saber.',
  },
};

/**
 * Validador e normalizador estrito para conformidade de Classificação de Conteúdo.
 * Se uma classificação inválida ou proibida for requisitada (como 'MA' ou 'T' para menores),
 * é revertida automaticamente para 'G' ou 'PG'.
 */
export function sanitizeContentRating(
  requestedRating: string | undefined,
  ageGroup: AgeGroup
): AdMobContentRating {
  const policy = AGE_GROUP_POLICY_RESTRICTIONS[ageGroup] || AGE_GROUP_POLICY_RESTRICTIONS.nao_informada;
  
  // Em contas infantis ou não informadas, 'G' é compulsório
  if (ageGroup === 'crianca' || ageGroup === 'nao_informada') {
    return ADMOB_CONTENT_RATINGS.G;
  }

  // 'MA' é categoricamente proibido em qualquer contexto deste app pedagógico
  if (requestedRating === ADMOB_CONTENT_RATINGS.MA) {
    console.warn('[AdMob Policies] Tentativa de usar rating "MA" bloqueada pela política de famílias. Fallback para "PG".');
    return ADMOB_CONTENT_RATINGS.PG;
  }

  // Se o usuário for adolescente, só permite até 'PG'
  if (ageGroup === 'adolescente') {
    if (requestedRating === ADMOB_CONTENT_RATINGS.T || requestedRating === ADMOB_CONTENT_RATINGS.MA) {
      console.warn(`[AdMob Policies] Rating "${requestedRating}" restrito para adolescentes. Fallback para "PG".`);
      return ADMOB_CONTENT_RATINGS.PG;
    }
    return (requestedRating === ADMOB_CONTENT_RATINGS.G) ? ADMOB_CONTENT_RATINGS.G : ADMOB_CONTENT_RATINGS.PG;
  }

  // Para adultos, limitar a 'PG' ou 'G'
  if (requestedRating === ADMOB_CONTENT_RATINGS.G) return ADMOB_CONTENT_RATINGS.G;
  return policy.maxAllowedRating;
}

/**
 * Constrói o objeto de configuração de privacidade certificado para o AdMob.
 */
export function resolvePrivacySettings(ageGroup: AgeGroup, customRating?: string): AdMobPrivacySettings {
  const basePolicy = AGE_GROUP_POLICY_RESTRICTIONS[ageGroup] || AGE_GROUP_POLICY_RESTRICTIONS.nao_informada;
  const verifiedRating = sanitizeContentRating(customRating || basePolicy.maxAllowedRating, ageGroup);

  return {
    ageGroup,
    tagForChildDirectedTreatment: basePolicy.tagForChildDirectedTreatment,
    tagForUnderAgeOfConsent: basePolicy.tagForUnderAgeOfConsent,
    maxAdContentRating: verifiedRating,
    nonPersonalizedAds: basePolicy.nonPersonalizedAds,
    allowAdIdTransmission: basePolicy.allowAdIdTransmission,
  };
}

/**
 * Validação de integridade do App ID oficial
 */
export function validateAppIdIntegrity(appId: string): {
  isValid: boolean;
  isOfficialMatched: boolean;
  appId: string;
  errorMessage?: string;
} {
  const trimmed = (appId || '').trim();
  const isMatch = trimmed === OFFICIAL_ADMOB_APP_ID;
  const isValidFormat = /^ca-app-pub-\d{16}~\d{10}$/.test(trimmed);

  return {
    isValid: isValidFormat,
    isOfficialMatched: isMatch,
    appId: trimmed,
    errorMessage: !isValidFormat
      ? 'Formato de App ID inválido. Deve seguir o padrão ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX'
      : (!isMatch ? `App ID diverge do ID oficial homologado (${OFFICIAL_ADMOB_APP_ID})` : undefined),
  };
}

/**
 * Verifica se uma classificação de conteúdo é compatível com a Política para Famílias
 */
export function isContentRatingCompliantForFamilies(
  rating: string,
  ageGroup: AgeGroup
): boolean {
  if (rating === 'MA') return false;
  if ((ageGroup === 'crianca' || ageGroup === 'nao_informada') && rating !== 'G') {
    return false;
  }
  return true;
}

/**
 * Verifica se a matéria informada pertence às 5 áreas fundamentais onde
 * a monetização nunca deve interferir ou bloquear.
 */
export function isCoreStudyArea(areaId: string): boolean {
  return CORE_STUDY_AREAS.includes(areaId as any);
}
