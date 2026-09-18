/**
 * ============================================================================
 * CONFIGURAÇÃO DO GOOGLE ADMOB - APLICATIVO "TRILHA DO SABER"
 * ============================================================================
 * 
 * Este arquivo centraliza todas as definições e identificadores do Google AdMob,
 * implementando estritamente a Política para Famílias do Google Play (Google Play
 * Families Policy), COPPA (Children's Online Privacy Protection Act) e LGPD.
 * 
 * ----------------------------------------------------------------------------
 * 📌 INSTRUÇÕES PARA PRODUÇÃO (QUANDO O APLICATIVO ESTIVER PRONTO):
 * ----------------------------------------------------------------------------
 * 1. Obtenha seus IDs reais no console do Google AdMob (https://admob.google.com).
 * 2. Cole seu AdMob App ID no campo `PRODUCTION_ADMOB_APP_ID` abaixo:
 *    Exemplo real do AdMob: "ca-app-pub-1234567890123456~1234567890"
 * 3. Cole seu Banner Ad Unit ID no campo `PRODUCTION_BANNER_AD_UNIT_ID` abaixo:
 *    Exemplo real de bloco de banner: "ca-app-pub-1234567890123456/1234567890"
 * 4. Mude `IS_TEST_MODE` para `false` apenas na versão final de publicação.
 * 
 * ⚠️ AVISO IMPORTANTE: Nunca invente IDs reais. Durante o desenvolvimento,
 * o aplicativo usa EXCLUSIVAMENTE os IDs oficiais de teste fornecidos pelo Google.
 * ============================================================================
 */

import { AgeGroup, AdMobPrivacySettings } from '../types';
import {
  OFFICIAL_ADMOB_APP_ID,
  ADMOB_CONTENT_RATINGS,
  resolvePrivacySettings,
  AdMobContentRating,
} from './adMobPolicies';

export * from './adMobPolicies';

// ============================================================================
// [1] IDENTIFICADORES OFICIAIS DE TESTE DO GOOGLE ADMOB (NUNCA ALTERE ESTES)
// Documentação oficial do Google: https://developers.google.com/admob/android/test-ads
// ============================================================================
export const GOOGLE_TEST_IDS = {
  /**
   * App ID oficial de teste do Google AdMob para Android
   */
  APP_ID: 'ca-app-pub-3940256099942544~3347511713',

  /**
   * Bloco de anúncio de Banner oficial de teste para Android (320x50 / Adaptativo)
   */
  BANNER_AD_UNIT_ID: 'ca-app-pub-3940256099942544/6300978111',

  /**
   * Bloco Intersticial de teste (caso venha a ser usado futuramente fora de provas)
   */
  INTERSTITIAL_AD_UNIT_ID: 'ca-app-pub-3940256099942544/1033173712',

  /**
   * Bloco Recompensado oficial de teste (Rewarded)
   */
  REWARDED_AD_UNIT_ID: 'ca-app-pub-3940256099942544/5224354917',

  /**
   * Bloco App Open oficial de teste (Abertura)
   */
  APP_OPEN_AD_UNIT_ID: 'ca-app-pub-3940256099942544/9257395921',
} as const;

// ============================================================================
// [2] CAMPOS CONFIGURÁVEIS PARA PRODUÇÃO
// ============================================================================

/**
 * 🚩 MODO DE TESTE DO ADMOB:
 * - `true`: Utiliza obrigatoriamente os IDs de teste do Google AdMob (Seguro para dev).
 * - `false`: Utiliza os IDs reais de produção configurados abaixo.
 * 
 * DEIXE COMO `true` DURANTE O DESENVOLVIMENTO.
 */
export const IS_TEST_MODE: boolean = false;

/**
 * 📍 ADMOB APP ID DE PRODUÇÃO:
 * ID oficial fornecido pelo usuário: ca-app-pub-8922902046490534~6406875608
 */
export const PRODUCTION_ADMOB_APP_ID: string = 'ca-app-pub-8922902046490534~6406875608';

/**
 * 📍 ID REAL DO BLOCO APP OPEN (ABERTURA DO APLICATIVO)
 * Fornecido pelo usuário: ca-app-pub-8922902046490534/5270245723
 */
export const PRODUCTION_APP_OPEN_AD_UNIT_ID: string = 'ca-app-pub-8922902046490534/5270245723';

/**
 * 📍 ID REAL DO BLOCO RECOMPENSADO (REWARDED)
 * Utilizado para as DUAS funções:
 * A) Desbloqueio de Explicação (REWARD_ACTION_EXPLANATION)
 * B) Desbloqueio de Prova (REWARD_ACTION_EXAM)
 * Fornecido pelo usuário: ca-app-pub-8922902046490534/2345533630
 */
export const PRODUCTION_REWARDED_AD_UNIT_ID: string = 'ca-app-pub-8922902046490534/2345533630';

/**
 * 📍 BLOCO DE ANÚNCIOS DO USUÁRIO: "Banner_principal"
 * Ad Unit ID fornecido pelo usuário: ca-app-pub-8922902046490534/7288943940
 */
export const PRODUCTION_BANNER_AD_UNIT_ID: string = 'ca-app-pub-8922902046490534/7288943940';

/**
 * 📍 BLOCO INTERSTICIAL DO USUÁRIO (exibido apenas ao finalizar/sair de tarefas)
 */
export const PRODUCTION_INTERSTITIAL_AD_UNIT_ID: string = '';

/**
 * Ações elegíveis para Anúncio Recompensado (Rewarded Ad) nos 5 pontos de exibição:
 * 1. Início: Recompensa de bônus diário (HOME_BONUS)
 * 2. Explicador: Desbloqueio de explicação detalhada com IA (EXPLANATION)
 * 3. Criador de Provas: Desbloqueio de geração de prova com IA (EXAM)
 * 4. Pesquisador: Desbloqueio de pesquisa e trabalho escolar aprofundado (RESEARCH)
 * 5. Tradutor: Desbloqueio de tradução e pronúncia avançada (TRANSLATION)
 */
export const REWARD_ACTIONS = {
  NONE: 'NONE',
  EXPLANATION: 'REWARD_ACTION_EXPLANATION',
  EXAM: 'REWARD_ACTION_EXAM',
  RESEARCH: 'REWARD_ACTION_RESEARCH',
  TRANSLATION: 'REWARD_ACTION_TRANSLATION',
  HOME_BONUS: 'REWARD_ACTION_HOME_BONUS',
  KEYS: 'REWARD_ACTION_KEYS',
} as const;

export type RewardActionType = typeof REWARD_ACTIONS[keyof typeof REWARD_ACTIONS];

/**
 * Versão do SDK do Google Mobile Ads para Android recomendada e compatível
 */
export const ANDROID_GMS_ADS_VERSION: string = '23.6.0';

// ============================================================================
// [3] HELPERS PARA RESOLUÇÃO SEGURA DE IDENTIFICADORES
// ============================================================================

/**
 * Retorna o App ID ativo do AdMob.
 */
export function getActiveAdMobAppId(): string {
  if (IS_TEST_MODE || !PRODUCTION_ADMOB_APP_ID.trim() || PRODUCTION_ADMOB_APP_ID === 'ADMOB_APP_ID_AQUI') {
    return GOOGLE_TEST_IDS.APP_ID;
  }
  return PRODUCTION_ADMOB_APP_ID.trim();
}

/**
 * Retorna o Publisher ID do AdMob/AdSense (formato ca-pub-XXXXXXXXXXXXXXXX).
 */
export function getPublisherId(): string {
  const appId = getActiveAdMobAppId();
  if (appId.includes('~')) {
    return appId.split('~')[0].replace('ca-app-pub-', 'ca-pub-');
  }
  return 'ca-pub-8922902046490534';
}

/**
 * Retorna o Ad Unit ID ativo para o App Open (Abertura).
 */
export function getActiveAppOpenAdUnitId(): string {
  if (IS_TEST_MODE || !PRODUCTION_APP_OPEN_AD_UNIT_ID.trim()) {
    return GOOGLE_TEST_IDS.APP_OPEN_AD_UNIT_ID;
  }
  return PRODUCTION_APP_OPEN_AD_UNIT_ID.trim();
}

/**
 * Retorna o Ad Unit ID ativo para o Rewarded (Recompensado).
 */
export function getActiveRewardedAdUnitId(): string {
  if (IS_TEST_MODE || !PRODUCTION_REWARDED_AD_UNIT_ID.trim()) {
    return GOOGLE_TEST_IDS.REWARDED_AD_UNIT_ID;
  }
  return PRODUCTION_REWARDED_AD_UNIT_ID.trim();
}

/**
 * Retorna o Banner Ad Unit ID ativo do AdMob.
 * Garante que se estiver em modo de teste ou se o ID de produção não estiver
 * preenchido, o ID oficial de teste do Google será retornado.
 */
export function getActiveBannerAdUnitId(): string {
  if (IS_TEST_MODE || !PRODUCTION_BANNER_AD_UNIT_ID.trim()) {
    return GOOGLE_TEST_IDS.BANNER_AD_UNIT_ID;
  }
  return PRODUCTION_BANNER_AD_UNIT_ID.trim();
}

/**
 * Retorna o Interstitial Ad Unit ID ativo do AdMob (usado ao sair/concluir tarefas).
 * Garante que se estiver em modo de teste ou se o ID de produção não estiver
 * preenchido, o ID oficial de teste do Google será retornado.
 */
export function getActiveInterstitialAdUnitId(): string {
  if (IS_TEST_MODE || !PRODUCTION_INTERSTITIAL_AD_UNIT_ID.trim()) {
    return GOOGLE_TEST_IDS.INTERSTITIAL_AD_UNIT_ID;
  }
  return PRODUCTION_INTERSTITIAL_AD_UNIT_ID.trim();
}

// ============================================================================
// [4] POLÍTICA PARA FAMÍLIAS DO GOOGLE PLAY & TRATAMENTO DE MENORES (COPPA/TFUA)
// ============================================================================

/**
 * Gera a configuração estrita de solicitação de anúncios (RequestConfiguration)
 * de acordo com a faixa etária do usuário.
 * 
 * Regras da Política para Famílias do Google Play:
 * 1. Crianças (até 12 anos):
 *    - tagForChildDirectedTreatment = TRUE (COPPA / TFCD)
 *    - tagForUnderAgeOfConsent = TRUE (TFUA)
 *    - maxAdContentRating = 'G' (Livre para todas as idades)
 *    - nonPersonalizedAds = TRUE (npa: '1')
 *    - allowAdIdTransmission = FALSE (Não transmitir GAID/AAID)
 * 
 * 2. Idade Não Informada:
 *    - Por prudência e conformidade com a Google Play Families Policy em neutral
 *      age screens, usuários sem idade informada RECEBEM O TRATAMENTO INFANTIL.
 * 
 * 3. Adolescentes (13 a 17 anos):
 *    - tagForChildDirectedTreatment = FALSE
 *    - tagForUnderAgeOfConsent = TRUE
 *    - maxAdContentRating = 'G' ou 'PG'
 *    - nonPersonalizedAds = TRUE
 *    - allowAdIdTransmission = FALSE
 * 
 * 4. Adultos (18+):
 *    - tagForChildDirectedTreatment = FALSE
 *    - tagForUnderAgeOfConsent = FALSE
 *    - maxAdContentRating = 'PG' (por se tratar de app educativo com crianças)
 *    - nonPersonalizedAds = FALSE
 *    - allowAdIdTransmission = TRUE
 */
export function buildAdMobPrivacySettings(ageGroup: AgeGroup): AdMobPrivacySettings {
  switch (ageGroup) {
    case 'crianca':
      return {
        ageGroup: 'crianca',
        tagForChildDirectedTreatment: true,
        tagForUnderAgeOfConsent: true,
        maxAdContentRating: 'G',
        nonPersonalizedAds: true,
        allowAdIdTransmission: false,
      };

    case 'adolescente':
      return {
        ageGroup: 'adolescente',
        tagForChildDirectedTreatment: false,
        tagForUnderAgeOfConsent: true,
        maxAdContentRating: 'PG',
        nonPersonalizedAds: true,
        allowAdIdTransmission: false,
      };

    case 'adulto':
      return {
        ageGroup: 'adulto',
        tagForChildDirectedTreatment: false,
        tagForUnderAgeOfConsent: false,
        maxAdContentRating: 'PG',
        nonPersonalizedAds: false,
        allowAdIdTransmission: true,
      };

    case 'nao_informada':
    default:
      // Princípio da máxima precaução para a Política para Famílias:
      // Se não informou, trata preventivamente como criança (Classificação G, TFCD=true, sem personalização)
      return {
        ageGroup: 'nao_informada',
        tagForChildDirectedTreatment: true,
        tagForUnderAgeOfConsent: true,
        maxAdContentRating: 'G',
        nonPersonalizedAds: true,
        allowAdIdTransmission: false,
      };
  }
}
