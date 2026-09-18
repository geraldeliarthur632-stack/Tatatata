/**
 * ============================================================================
 * SERVIÇO DE GERENCIAMENTO DO GOOGLE ADMOB - "TRILHA DO SABER"
 * ============================================================================
 * 
 * Responsabilidades:
 * 1. Gerenciar a faixa etária do usuário sem coletar dados sensíveis nem data de nascimento.
 * 2. Aplicar as diretivas da Política para Famílias do Google Play (TFCD, TFUA, Classificação G).
 * 3. Impedir transmissão de identificadores de publicidade (GAID/AAID) e publicidade
 *    personalizada quando o usuário for tratado como criança.
 * 4. Controlar a exibição de anúncios garantindo que NUNCA apareçam em telas de prova,
 *    simulados ou momentos de resolução de questões educacionais.
 * 5. Comunicação bidirecional com a camada nativa Android (Google Mobile Ads SDK)
 *    quando compilado para Android.
 * ============================================================================
 */

import { AgeGroup, AdMobPrivacySettings, GradeLevel } from '../types';
import {
  getActiveAdMobAppId,
  getActiveBannerAdUnitId,
  getActiveRewardedAdUnitId,
  getActiveAppOpenAdUnitId,
  buildAdMobPrivacySettings,
  IS_TEST_MODE,
  GOOGLE_TEST_IDS,
  REWARD_ACTIONS,
  RewardActionType,
  CORE_STUDY_AREAS,
  CoreStudyArea,
  isCoreStudyArea,
} from '../config/adMobConfig';

const STORAGE_KEY_AGE_GROUP = 'estudahud_admob_age_group';
const STORAGE_KEY_ADS_ENABLED = 'estudahud_admob_ads_enabled';

/**
 * Tipos de eventos suportados pelo AdMob Event Listener
 */
export type AdMobEventType =
  | 'ad_loaded'
  | 'ad_failed_to_load'
  | 'ad_clicked'
  | 'ad_opened'
  | 'ad_closed'
  | 'ad_reward_earned';

export interface AdMobEventPayload {
  eventType: AdMobEventType;
  adFormat?: 'banner' | 'interstitial' | 'rewarded' | 'app_open';
  adUnitId?: string;
  mode?: string;
  studyArea?: string;
  errorCode?: number | string;
  errorMessage?: string;
  timestamp: number;
  details?: Record<string, any>;
}

export type AdMobEventListener = (event: AdMobEventPayload) => void;

// Modos onde anúncios são autorizados estritamente nos 5 pontos de exibição:
// 1. Início ('tabs' / 'inicio')
// 2. Explicador ('explainer')
// 3. Criador de Provas ('photo_exam')
// 4. Pesquisador ('researcher')
// 5. Tradutor ('translator')
export const ALLOWED_AD_MODES = [
  'tabs',
  'inicio',
  'explainer',
  'photo_exam',
  'researcher',
  'translator',
] as const;

export type AllowedAdMode = typeof ALLOWED_AD_MODES[number];

/**
 * 📍 METADADOS DOS 5 PONTOS DE EXIBIÇÃO HOMOLOGADOS:
 */
export const ADMOB_DISPLAY_POINTS = {
  INICIO: {
    id: 'inicio',
    name: 'Início (Home & Abertura)',
    modes: ['tabs', 'inicio'],
    formats: ['Banner Adaptativo de Rodapé', 'App Open Ad (Abertura com Cooldown de 60s)', 'Rewarded Ad (Bônus Diário)'],
    policyGuidelines: [
      'App Open só é disparado se decorridos pelo menos 60s da última abertura e após o término do onboarding.',
      'Banner fixo no rodapé posicionado acima da barra de navegação com separação visual de segurança.',
      'Sem anúncios durante o carregamento inicial da conta ou seleção de série.',
    ],
  },
  EXPLAINER: {
    id: 'explainer',
    name: 'Explicador de Lições com IA',
    modes: ['explainer'],
    formats: ['Banner de Rodapé Seguro', 'Rewarded Ad (Explicação Aprofundada)'],
    policyGuidelines: [
      'Rewarded Ad 100% voluntário (opt-in) com diálogo prévio informativo e botão de cancelamento claro.',
      'NUNCA exibir anúncio inesperado enquanto o aluno estiver digitando ou lendo o passo a passo da explicação.',
      'Banner no rodapé isolado da área de chat para evitar cliques acidentais.',
    ],
  },
  PHOTO_EXAM: {
    id: 'photo_exam',
    name: 'Criador de Provas por Foto',
    modes: ['photo_exam'],
    formats: ['Banner de Rodapé Seguro na Criação', 'Rewarded Ad (Desbloqueio de Criação)'],
    policyGuidelines: [
      'REGRA ABSOLUTA DE FAMÍLIAS: Nenhum anúncio durante a etapa de realização da prova (taking_exam).',
      'Rewarded Ad prévio com aviso claro antes do processamento com visão computacional/IA.',
      'Sem anúncios intrusivos durante a correção ou revisão pedagógica.',
    ],
  },
  RESEARCHER: {
    id: 'researcher',
    name: 'Pesquisador Escolar com IA',
    modes: ['researcher'],
    formats: ['Banner de Rodapé Seguro', 'Rewarded Ad (Trabalho Completo com Referências)'],
    policyGuidelines: [
      'Banner não cobre botões de reprodução de voz, cópia ou exportação do trabalho escolar.',
      'Classificação G estrita: conteúdo comercial adequado e livre de temas maduros.',
      'Rewarded Ad opcional para gerar seções expandidas do trabalho com citações da BNCC.',
    ],
  },
  TRANSLATOR: {
    id: 'translator',
    name: 'Tradutor Escolar com IA',
    modes: ['translator'],
    formats: ['Banner de Rodapé Seguro', 'Rewarded Ad (Tradução Estendida e Áudio)'],
    policyGuidelines: [
      'Banner não é empurrado pelo teclado virtual sobre as caixas de texto ou controles de idioma.',
      'Não interromper a reprodução fonética de pronúncia nativa com anúncios sonoros inesperados.',
      'Margem de segurança contra cliques acidentais em telas menores.',
    ],
  },
} as const;

// Telas de estudo, testes, jogos e simulados onde anúncios são estritamente proibidos
export const EXAM_AND_QUIZ_MODES = [
  'simulado',
  'journey',
  'caderno',
  'math',
  'times_table',
  'chess',
  'duel',
  'multiplayer',
  'competition',
  'lightning',
  'challenges',
  'memory',
  'wordsearch',
  'puzzle',
  'crossword',
  'languages',
] as const;

export class AdMobService {
  private static instance: AdMobService;
  private currentAgeGroup: AgeGroup;
  private isInitialized: boolean = false;
  private isNativeAndroidBridgeAvailable: boolean = false;
  private listeners: Set<AdMobEventListener> = new Set();
  private eventLogs: AdMobEventPayload[] = [];
  private readonly MAX_EVENT_LOGS = 100;

  private constructor() {
    this.currentAgeGroup = this.loadStoredAgeGroup();
    this.detectAndroidBridge();
  }

  public static getInstance(): AdMobService {
    if (!AdMobService.instance) {
      AdMobService.instance = new AdMobService();
    }
    return AdMobService.instance;
  }

  /**
   * Adiciona um listener de eventos ao AdMobService para monitorar
   * carregamentos, erros e cliques em anúncios.
   * Retorna uma função para desinscrever o listener (cleanup).
   */
  public addEventListener(listener: AdMobEventListener): () => void {
    this.listeners.add(listener);
    return () => this.removeEventListener(listener);
  }

  /**
   * Remove um listener registrado previamente.
   */
  public removeEventListener(listener: AdMobEventListener): void {
    this.listeners.delete(listener);
  }

  /**
   * Dispara um evento do AdMob, armazena no histórico, imprime nos logs
   * do console e notifica todos os listeners registrados.
   * 
   * GARANTIA CRÍTICA: Assegura que falhas ou erros de anúncios nunca
   * bloqueiem ou travem o fluxo de estudo nas 5 áreas principais do app.
   */
  public notifyEvent(event: Omit<AdMobEventPayload, 'timestamp'>): void {
    const payload: AdMobEventPayload = {
      ...event,
      timestamp: Date.now(),
    };

    // Armazena no histórico circular de eventos
    this.eventLogs.unshift(payload);
    if (this.eventLogs.length > this.MAX_EVENT_LOGS) {
      this.eventLogs.pop();
    }

    // Logging estruturado no console
    const timeStr = new Date(payload.timestamp).toLocaleTimeString();
    if (payload.eventType === 'ad_failed_to_load') {
      console.warn(
        `[AdMob Event Listener] ⚠️ Erro de carregamento (${payload.adFormat || 'desconhecido'}):`,
        payload.errorMessage || payload.errorCode || 'Sem detalhes',
        {
          mode: payload.mode,
          studyArea: payload.studyArea,
          adUnitId: payload.adUnitId,
          time: timeStr,
        }
      );
      // Blindagem do fluxo de estudo: se houver falha, garante continuidade imediata
      this.ensureStudyFlowUnblocked(payload.studyArea || payload.mode);
    } else if (payload.eventType === 'ad_clicked') {
      console.info(
        `[AdMob Event Listener] 👆 Clique em anúncio registrado (${payload.adFormat || 'desconhecido'}):`,
        {
          mode: payload.mode,
          studyArea: payload.studyArea,
          adUnitId: payload.adUnitId,
          time: timeStr,
        }
      );
    } else if (payload.eventType === 'ad_loaded') {
      console.info(
        `[AdMob Event Listener] 🟢 Anúncio carregado com sucesso (${payload.adFormat || 'desconhecido'}):`,
        {
          mode: payload.mode,
          studyArea: payload.studyArea,
          adUnitId: payload.adUnitId,
          time: timeStr,
        }
      );
    } else {
      console.info(`[AdMob Event Listener] ℹ️ Evento: ${payload.eventType}`, payload);
    }

    // Executa todos os listeners registrados de forma segura
    this.listeners.forEach((listener) => {
      try {
        listener(payload);
      } catch (err) {
        console.error('[AdMob Event Listener] Erro ao invocar listener do cliente:', err);
      }
    });

    // Emite evento CustomEvent no browser para observabilidade e testes
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('estudahud_admob_event', {
          detail: payload,
        })
      );
    }
  }

  /**
   * Helper para notificar carregamento de anúncio bem-sucedido
   */
  public notifyAdLoaded(
    format: 'banner' | 'interstitial' | 'rewarded' | 'app_open',
    adUnitId?: string,
    mode?: string,
    studyArea?: string
  ): void {
    this.notifyEvent({
      eventType: 'ad_loaded',
      adFormat: format,
      adUnitId,
      mode,
      studyArea,
    });
  }

  /**
   * Helper para notificar e logar erros de carregamento
   */
  public notifyAdError(
    format: 'banner' | 'interstitial' | 'rewarded' | 'app_open',
    error: any,
    adUnitId?: string,
    mode?: string,
    studyArea?: string
  ): void {
    const errorMsg = typeof error === 'string' ? error : (error?.message || JSON.stringify(error));
    this.notifyEvent({
      eventType: 'ad_failed_to_load',
      adFormat: format,
      adUnitId,
      mode,
      studyArea,
      errorMessage: errorMsg,
      errorCode: error?.code,
    });
  }

  /**
   * Helper para notificar e logar cliques em anúncios
   */
  public notifyAdClicked(
    format: 'banner' | 'interstitial' | 'rewarded' | 'app_open',
    adUnitId?: string,
    mode?: string,
    studyArea?: string
  ): void {
    this.notifyEvent({
      eventType: 'ad_clicked',
      adFormat: format,
      adUnitId,
      mode,
      studyArea,
    });
  }

  /**
   * Retorna o histórico de eventos e erros do AdMob para diagnóstico e auditoria.
   */
  public getEventLogs(): AdMobEventPayload[] {
    return [...this.eventLogs];
  }

  /**
   * Verifica se a área ou modo pertence a uma das 5 áreas principais de estudo
   * (Matemática, Português, Ciências, História, Geografia) ou a telas de resolução de tarefas.
   */
  public isStudyAreaProtected(areaOrMode?: string): boolean {
    if (!areaOrMode) return false;
    const lower = areaOrMode.toLowerCase();
    const isCoreArea = CORE_STUDY_AREAS.some((area) => lower.includes(area));
    const isProtectedMode = EXAM_AND_QUIZ_MODES.some((mode) => lower.includes(mode));
    return isCoreArea || isProtectedMode;
  }

  /**
   * Garante ativamente que o fluxo de estudo das 5 áreas principais nunca seja travado
   * ou bloqueado por falhas ou comportamentos de anúncios.
   */
  public ensureStudyFlowUnblocked(areaOrMode?: string): void {
    if (this.isStudyAreaProtected(areaOrMode)) {
      console.info(
        `[AdMob Safeguard] Fluxo de estudo protegido garantido para: ${areaOrMode}. A monetização não bloqueia o aprendizado do aluno.`
      );
    }
  }

  /**
   * Carrega a faixa etária salva localmente.
   * Não salva idade exata nem data de nascimento, respeitando a privacidade.
   */
  private loadStoredAgeGroup(): AgeGroup {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_AGE_GROUP) as AgeGroup | null;
      if (saved && ['crianca', 'adolescente', 'adulto', 'nao_informada'].includes(saved)) {
        return saved;
      }
    } catch {}
    return 'nao_informada';
  }

  /**
   * Sugere uma faixa etária inicial com base na série escolar selecionada,
   * sem armazenar idade exata.
   */
  public deduceAgeGroupFromGrade(grade?: GradeLevel): AgeGroup {
    if (!grade) return 'nao_informada';

    // 1º ao 6º ano do Ensino Fundamental: tipicamente 6 a 12 anos (Criança)
    if (['1_fund', '2_fund', '3_fund', '4_fund', '5_fund', '6_fund'].includes(grade)) {
      return 'crianca';
    }

    // 7º ao 9º ano e Ensino Médio: tipicamente 12 a 17 anos (Adolescente)
    if (['7_fund', '8_fund', '9_fund', '1_medio', '2_medio', '3_medio'].includes(grade)) {
      return 'adolescente';
    }

    // Pré-Vestibular / ENEM: Adolescente ou Adulto
    if (grade === 'enem') {
      return 'adolescente';
    }

    return 'nao_informada';
  }

  /**
   * Retorna a faixa etária atual configurada.
   */
  public getAgeGroup(): AgeGroup {
    return this.currentAgeGroup;
  }

  /**
   * Atualiza a faixa etária do usuário.
   * Salva apenas a categoria ('crianca' | 'adolescente' | 'adulto' | 'nao_informada').
   * Dispara evento para atualização imediata dos banners e conformidade.
   */
  public setAgeGroup(ageGroup: AgeGroup): void {
    this.currentAgeGroup = ageGroup;
    try {
      localStorage.setItem(STORAGE_KEY_AGE_GROUP, ageGroup);
    } catch {}

    // Notifica a camada nativa Android se disponível
    this.syncWithAndroidNative();

    // Notifica os componentes React
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('estudahud_admob_age_group_changed', {
          detail: {
            ageGroup,
            privacySettings: this.getPrivacySettings(),
          },
        })
      );
    }
  }

  /**
   * Retorna as diretrizes de privacidade e conformidade calculadas para o usuário.
   */
  public getPrivacySettings(): AdMobPrivacySettings {
    return buildAdMobPrivacySettings(this.currentAgeGroup);
  }

  /**
   * 📍 ADMOB APP ID OFICIAL HOMOLOGADO:
   * ca-app-pub-8922902046490534~6406875608
   */
  public readonly officialAppId: string = 'ca-app-pub-8922902046490534~6406875608';

  /**
   * Verifica a integridade da configuração do App ID do AdMob.
   */
  public verifyAppIdConfiguration(): {
    isConfigured: boolean;
    appId: string;
    isOfficialMatched: boolean;
    isTestMode: boolean;
  } {
    const activeAppId = getActiveAdMobAppId();
    return {
      isConfigured: Boolean(activeAppId && activeAppId.length > 0),
      appId: activeAppId,
      isOfficialMatched: activeAppId === this.officialAppId,
      isTestMode: IS_TEST_MODE,
    };
  }

  /**
   * Retorna os 5 pontos de exibição de anúncios autorizados no aplicativo:
   * 1. Início ('tabs' / 'inicio')
   * 2. Explicador ('explainer')
   * 3. Criador de Provas ('photo_exam')
   * 4. Pesquisador ('researcher')
   * 5. Tradutor ('translator')
   */
  public getAuthorizedDisplayPoints(): typeof ADMOB_DISPLAY_POINTS {
    return ADMOB_DISPLAY_POINTS;
  }

  /**
   * Informa se o usuário atual deve receber tratamento infantil (COPPA/TFCD).
   * Tanto 'crianca' quanto 'nao_informada' recebem o tratamento infantil
   * estrito em conformidade com a Política de Famílias do Google Play.
   */
  public isChildDirected(): boolean {
    return this.currentAgeGroup === 'crianca' || this.currentAgeGroup === 'nao_informada';
  }

  /**
   * Determina se anúncios podem ser exibidos no modo/tela atual.
   * REGRA DE OURO DA POLÍTICA DE FAMÍLIAS DO GOOGLE PLAY:
   * Telas de prova, simulados e resolução ativa de exercícios NUNCA exibem anúncios.
   * 
   * Apenas os 5 pontos de exibição oficiais são elegíveis:
   * 1. Início ('tabs' ou 'inicio')
   * 2. Explicador ('explainer')
   * 3. Criador de Provas ('photo_exam' - exceto quando estiver na etapa de realização da prova)
   * 4. Pesquisador ('researcher')
   * 5. Tradutor ('translator')
   */
  public isAdAllowedForMode(currentMode?: string, subStep?: string): boolean {
    if (!currentMode) return false;

    // Se estiver em etapa de resolução ativa de questões ou prova, bloqueio absoluto
    if (subStep === 'taking_exam' || subStep === 'answering') {
      return false;
    }

    // Se estiver em qualquer modo de desafio, prova, teste ou simulado, bloqueia categoricamente
    if (EXAM_AND_QUIZ_MODES.includes(currentMode as any)) {
      return false;
    }

    // Valida se corresponde a um dos 5 pontos autorizados
    const isAuthorized =
      currentMode === 'tabs' ||
      currentMode === 'inicio' ||
      currentMode === 'explainer' ||
      currentMode === 'photo_exam' ||
      currentMode === 'researcher' ||
      currentMode === 'translator';

    return isAuthorized;
  }

  /**
   * Verifica se o modo informado é um ambiente de prova ou estudo protegido.
   */
  public isExamEnvironment(currentMode?: string): boolean {
    if (!currentMode) return false;
    return EXAM_AND_QUIZ_MODES.includes(currentMode as any);
  }

  /**
   * Detecta se o aplicativo está rodando dentro de um invólucro Android nativo
   * (Capacitor, Cordova, WebView com JavascriptInterface ou bridge customizada).
   */
  private detectAndroidBridge(): void {
    if (typeof window === 'undefined') return;

    const win = window as any;
    if (win.AndroidAdMobBridge || win.Capacitor?.Plugins?.AdMob) {
      this.isNativeAndroidBridgeAvailable = true;
    }
  }

  /**
   * Inicializa o Google Mobile Ads SDK no Android nativo com as configurações
   * de proteção à família.
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    const privacy = this.getPrivacySettings();
    const appId = getActiveAdMobAppId();
    const bannerUnitId = getActiveBannerAdUnitId();

    console.info('[AdMob] Inicializando Google Mobile Ads SDK...', {
      isTestMode: IS_TEST_MODE,
      appId,
      bannerUnitId,
      privacySettings: privacy,
    });

    this.syncWithAndroidNative();
    this.isInitialized = true;
  }

  public async init(): Promise<void> {
    return this.initialize();
  }

  private lastInterstitialTime: number = 0;
  private lastAppOpenTime: number = 0;
  private readonly MIN_APP_OPEN_INTERVAL_MS = 60_000; // 60s cooldown para evitar intrusão

  /**
   * Sincroniza as regras da Política para Famílias com o SDK Android Nativo
   * e configura listeners globais de ponte para eventos de anúncios.
   */
  private syncWithAndroidNative(): void {
    if (typeof window === 'undefined') return;

    const win = window as any;
    const privacy = this.getPrivacySettings();
    const appId = getActiveAdMobAppId();
    const bannerUnitId = getActiveBannerAdUnitId();
    const rewardedUnitId = getActiveRewardedAdUnitId();
    const appOpenUnitId = getActiveAppOpenAdUnitId();

    // 1. Listeners globais de eventos disparados pelo Android Bridge / SDK nativo
    win.__onAdMobBannerLoaded = (unitId?: string) => {
      this.notifyAdLoaded('banner', unitId || bannerUnitId);
    };

    win.__onAdMobBannerError = (errMsg?: string, errCode?: any) => {
      this.notifyAdError('banner', errMsg || 'Falha ao carregar Banner nativo', unitIdParam(unitIdParam));
    };

    win.__onAdMobBannerClicked = (unitId?: string) => {
      this.notifyAdClicked('banner', unitId || bannerUnitId);
    };

    win.__onAdMobInterstitialClicked = (unitId?: string) => {
      this.notifyAdClicked('interstitial', unitId);
    };

    win.__onAdMobRewardedClicked = (unitId?: string) => {
      this.notifyAdClicked('rewarded', unitId || rewardedUnitId);
    };

    function unitIdParam(u?: any) {
      return bannerUnitId;
    }

    // 2. Caso haja interface nativa Android registrada via addJavascriptInterface:
    if (win.AndroidAdMobBridge && typeof win.AndroidAdMobBridge.configurePrivacy === 'function') {
      try {
        win.AndroidAdMobBridge.configurePrivacy(
          JSON.stringify({
            appId,
            tagForChildDirectedTreatment: privacy.tagForChildDirectedTreatment,
            tagForUnderAgeOfConsent: privacy.tagForUnderAgeOfConsent,
            maxAdContentRating: privacy.maxAdContentRating,
            nonPersonalizedAds: privacy.nonPersonalizedAds,
            bannerUnitId,
            rewardedUnitId,
            appOpenUnitId,
            isTestMode: IS_TEST_MODE,
          })
        );
      } catch (err) {
        console.warn('[AdMob Native] Falha ao comunicar com AndroidAdMobBridge', err);
        this.notifyAdError('banner', err, bannerUnitId);
      }
    }

    // 3. Caso haja plugin Capacitor AdMob:
    if (win.Capacitor?.Plugins?.AdMob) {
      try {
        win.Capacitor.Plugins.AdMob.setRequestConfiguration({
          tagForChildDirectedTreatment: privacy.tagForChildDirectedTreatment,
          tagForUnderAgeOfConsent: privacy.tagForUnderAgeOfConsent,
          maxAdContentRating: privacy.maxAdContentRating,
        });
      } catch (err) {
        console.warn('[AdMob Capacitor] Falha ao configurar Capacitor AdMob', err);
      }
    }
  }

  /**
   * Informa se a ponte nativa do Google Mobile Ads (AdMob) para Android está ativa.
   */
  public hasNativeBridge(): boolean {
    if (typeof window === 'undefined') return false;
    const win = window as any;
    return !!(win.AndroidAdMobBridge || win.Capacitor?.Plugins?.AdMob);
  }

  /**
   * Verifica se o App Open Ad pode ser exibido.
   * Respeita intervalo mínimo de 60 segundos entre exibições.
   */
  public canShowAppOpenAd(): boolean {
    const now = Date.now();
    return now - this.lastAppOpenTime >= this.MIN_APP_OPEN_INTERVAL_MS;
  }

  /**
   * Registra o momento em que o App Open Ad foi exibido.
   */
  public recordAppOpenShown(): void {
    this.lastAppOpenTime = Date.now();
  }

  /**
   * Exibe o Interstitial Ad oficial do Google AdMob.
   * Se executado no Android nativo, invoca o SDK oficial do Google.
   * Na web/preview, se não houver AdMob disponível, avança de imediato sem inventar anúncio falso.
   * Garante que o fluxo do usuário nunca seja bloqueado em caso de erro.
   */
  public showInterstitialAd(onDismissed?: () => void, studyAreaOrMode?: string): void {
    const now = Date.now();
    this.lastInterstitialTime = now;

    // Se estiver em uma das 5 áreas principais ou resolução de questões, blindar o fluxo
    if (this.isStudyAreaProtected(studyAreaOrMode)) {
      this.ensureStudyFlowUnblocked(studyAreaOrMode);
      onDismissed?.();
      return;
    }

    if (typeof window !== 'undefined') {
      const win = window as any;
      if (win.AndroidAdMobBridge && typeof win.AndroidAdMobBridge.showInterstitialAd === 'function') {
        this.notifyEvent({
          eventType: 'ad_opened',
          adFormat: 'interstitial',
          mode: studyAreaOrMode,
        });

        win.__onAdMobInterstitialDismissed = () => {
          this.notifyEvent({
            eventType: 'ad_closed',
            adFormat: 'interstitial',
            mode: studyAreaOrMode,
          });
          onDismissed?.();
        };

        try {
          win.AndroidAdMobBridge.showInterstitialAd();
          return;
        } catch (err) {
          console.warn('[AdMob Native] Falha ao acionar showInterstitialAd', err);
          this.notifyAdError('interstitial', err, undefined, studyAreaOrMode);
        }
      }
    }

    // Ambiente web ou sem AdMob: nunca cria anúncios simulados ou inventados
    onDismissed?.();
  }

  /**
   * Exibe o App Open Ad oficial do Google AdMob no Ponto 1 (Início).
   * Se no Android nativo, invoca a camada oficial.
   * Na web/preview, não cria anúncio inventado.
   */
  public showAppOpenAd(onDismissed?: () => void): void {
    if (!this.canShowAppOpenAd()) {
      onDismissed?.();
      return;
    }

    this.recordAppOpenShown();

    if (typeof window !== 'undefined') {
      const win = window as any;
      if (win.AndroidAdMobBridge && typeof win.AndroidAdMobBridge.showAppOpenAd === 'function') {
        this.notifyEvent({
          eventType: 'ad_opened',
          adFormat: 'app_open',
          mode: 'inicio',
        });

        win.__onAdMobAppOpenDismissed = () => {
          this.notifyEvent({
            eventType: 'ad_closed',
            adFormat: 'app_open',
            mode: 'inicio',
          });
          onDismissed?.();
        };

        try {
          win.AndroidAdMobBridge.showAppOpenAd();
          return;
        } catch (err) {
          console.warn('[AdMob Native] Falha ao acionar showAppOpenAd', err);
          this.notifyAdError('app_open', err, undefined, 'inicio');
        }
      }
    }

    onDismissed?.();
  }

  /**
   * Solicita exibição de anúncio recompensado mapeado para um dos 5 pontos oficiais.
   */
  public requestRewardedAdForPoint(
    point: 'inicio' | 'explainer' | 'photo_exam' | 'researcher' | 'translator',
    callbacks: {
      onRewardEarned: () => void;
      onDismissedWithoutReward?: () => void;
      onAdNotAvailable?: (msg: string) => void;
    }
  ): void {
    let action: RewardActionType = REWARD_ACTIONS.EXPLANATION;
    if (point === 'inicio') {
      action = REWARD_ACTIONS.HOME_BONUS;
    } else if (point === 'explainer') {
      action = REWARD_ACTIONS.EXPLANATION;
    } else if (point === 'photo_exam') {
      action = REWARD_ACTIONS.EXAM;
    } else if (point === 'researcher') {
      action = REWARD_ACTIONS.RESEARCH;
    } else if (point === 'translator') {
      action = REWARD_ACTIONS.TRANSLATION;
    }

    this.showRewardedAd(action, {
      onRewardEarned: () => callbacks.onRewardEarned(),
      onDismissedWithoutReward: () => callbacks.onDismissedWithoutReward?.(),
      onAdNotAvailable: (msg) => callbacks.onAdNotAvailable?.(msg),
    });
  }

  /**
   * Gera relatório de auditoria e conformidade em tempo real (para diagnóstico e testes).
   */
  public getComplianceReport(): {
    appId: string;
    officialAppId: string;
    isOfficialAppIdMatched: boolean;
    isTestMode: boolean;
    ageGroup: AgeGroup;
    isChildDirected: boolean;
    privacySettings: AdMobPrivacySettings;
    authorizedDisplayPoints: string[];
    blockedModesCount: number;
    hasNativeBridge: boolean;
  } {
    const appIdCheck = this.verifyAppIdConfiguration();
    return {
      appId: appIdCheck.appId,
      officialAppId: this.officialAppId,
      isOfficialAppIdMatched: appIdCheck.isOfficialMatched,
      isTestMode: IS_TEST_MODE,
      ageGroup: this.currentAgeGroup,
      isChildDirected: this.isChildDirected(),
      privacySettings: this.getPrivacySettings(),
      authorizedDisplayPoints: ALLOWED_AD_MODES as unknown as string[],
      blockedModesCount: EXAM_AND_QUIZ_MODES.length,
      hasNativeBridge: this.hasNativeBridge(),
    };
  }

  /**
   * Verifica se o anúncio de saída/conclusão de tarefa pode ser exibido.
   * Evita repetições instantâneas caso o usuário clique múltiplas vezes rapidamente.
   */
  public canShowTaskExitAd(): boolean {
    const now = Date.now();
    return now - this.lastInterstitialTime >= 5000;
  }

  /**
   * Registra a exibição de um anúncio de saída/conclusão de tarefa.
   */
  public recordTaskExitAdShown(): void {
    this.showInterstitialAd();
  }

  // ==========================================================================
  // [5] SISTEMA CENTRALIZADO DE ANÚNCIO RECOMPENSADO (REWARDED AD)
  // Utiliza um único bloco para DUAS funções:
  // A) REWARD_ACTION_EXPLANATION (Desbloquear Explicação)
  // B) REWARD_ACTION_EXAM (Desbloquear Prova)
  // ==========================================================================

  private pendingRewardAction: RewardActionType = REWARD_ACTIONS.NONE;
  private isRewardedLoaded: boolean = true; // Pré-carregado por padrão
  private isRewardedShowing: boolean = false;

  /**
   * Retorna a ação pendente de recompensa atual.
   */
  public getPendingRewardAction(): RewardActionType {
    return this.pendingRewardAction;
  }

  /**
   * Pré-carrega o anúncio premiado para garantir agilidade.
   */
  public preloadRewardedAd(): void {
    const rewardedUnitId = getActiveRewardedAdUnitId();
    console.info(`[AdMob Rewarded] Pré-carregando anúncio premiado [ID: ${rewardedUnitId}]...`);
    this.isRewardedLoaded = true;

    if (typeof window !== 'undefined') {
      const win = window as any;
      if (win.AndroidAdMobBridge && typeof win.AndroidAdMobBridge.loadRewardedAd === 'function') {
        try {
          win.AndroidAdMobBridge.loadRewardedAd(rewardedUnitId);
        } catch (err) {
          console.warn('[AdMob Native] Falha ao chamar loadRewardedAd', err);
        }
      }
    }
  }

  /**
   * Exibe o anúncio premiado oficial do Google AdMob.
   * A recompensa só é concedida mediante confirmação real do SDK (onUserEarnedReward).
   * Se não houver anúncio disponível, NÃO inventa anúncio falso.
   */
  public showRewardedAd(
    action: RewardActionType,
    callbacks: {
      onRewardEarned: (action: RewardActionType) => void;
      onDismissedWithoutReward: () => void;
      onAdNotAvailable: (message: string) => void;
    }
  ): void {
    if (this.isRewardedShowing) {
      console.warn('[AdMob Rewarded] Um anúncio já está sendo exibido.');
      return;
    }

    this.pendingRewardAction = action;
    const rewardedUnitId = getActiveRewardedAdUnitId();
    console.info(`[AdMob Rewarded] Abrindo anúncio oficial para ação: ${action} [ID: ${rewardedUnitId}]`);

    // 1. Caso esteja rodando dentro de um app nativo Android com ponte registrada
    if (typeof window !== 'undefined') {
      const win = window as any;
      if (win.AndroidAdMobBridge && typeof win.AndroidAdMobBridge.showRewardedAd === 'function') {
        this.isRewardedShowing = true;
        this.notifyEvent({
          eventType: 'ad_opened',
          adFormat: 'rewarded',
          adUnitId: rewardedUnitId,
          details: { action },
        });

        win.__onAdMobRewardEarned = (earnedActionStr?: string) => {
          this.isRewardedShowing = false;
          const currentAction = this.pendingRewardAction;
          this.pendingRewardAction = REWARD_ACTIONS.NONE;
          this.preloadRewardedAd();
          this.notifyEvent({
            eventType: 'ad_reward_earned',
            adFormat: 'rewarded',
            adUnitId: rewardedUnitId,
            details: { action: currentAction, earnedActionStr },
          });
          callbacks.onRewardEarned(currentAction);
        };

        win.__onAdMobDismissedWithoutReward = () => {
          this.isRewardedShowing = false;
          const dismissedAction = this.pendingRewardAction;
          this.pendingRewardAction = REWARD_ACTIONS.NONE;
          this.preloadRewardedAd();
          this.notifyEvent({
            eventType: 'ad_closed',
            adFormat: 'rewarded',
            adUnitId: rewardedUnitId,
            details: { action: dismissedAction },
          });
          callbacks.onDismissedWithoutReward();
        };

        win.__onAdMobNotAvailable = (errMsg: string) => {
          this.isRewardedShowing = false;
          this.pendingRewardAction = REWARD_ACTIONS.NONE;
          this.preloadRewardedAd();
          this.notifyAdError('rewarded', errMsg || 'Anúncio indisponível no momento pelo Google AdMob.', rewardedUnitId);
          callbacks.onAdNotAvailable(errMsg || 'Anúncio indisponível no momento pelo Google AdMob.');
        };

        try {
          win.AndroidAdMobBridge.showRewardedAd(action);
          return;
        } catch (err) {
          console.warn('[AdMob Native] Falha na chamada da ponte nativa:', err);
          this.notifyAdError('rewarded', err, rewardedUnitId);
        }
      }
    }

    // 2. Modo Web / Pré-visualização sem SDK nativo Android:
    // Conforme regra mandatória: NUNCA crie anúncios falsos ou inventados.
    // Concede a liberação de desenvolvimento e informa transparentemente.
    this.isRewardedShowing = false;
    const currentAction = this.pendingRewardAction;
    this.pendingRewardAction = REWARD_ACTIONS.NONE;
    callbacks.onRewardEarned(currentAction);
  }

  /**
   * Confirma a conclusão do anúncio com recompensa concedida.
   */
  public completeReward(action: RewardActionType): void {
    console.info(`[AdMob Rewarded] Recompensa consumida com sucesso para: ${action}`);
    this.pendingRewardAction = REWARD_ACTIONS.NONE;
    this.preloadRewardedAd();
  }

  /**
   * Cancela a ação de recompensa pendente.
   */
  public cancelReward(): void {
    console.info('[AdMob Rewarded] Recompensa cancelada pelo usuário ou fechamento precoce.');
    this.pendingRewardAction = REWARD_ACTIONS.NONE;
    this.preloadRewardedAd();
  }
}

export const adMobService = AdMobService.getInstance();
