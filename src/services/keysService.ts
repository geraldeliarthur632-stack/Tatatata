/**
 * Serviço de Gerenciamento de Chaves (Keys) do Trilha do Saber.
 * 
 * Regra do Usuário:
 * - O usuário utiliza essas chaves para continuar na Jornada, Idiomas e Xadrez.
 * - Quando as chaves acabam (0 chaves), exibe o aviso "Acabaram as suas chaves".
 * - Para conseguir mais chaves, o usuário assiste a um anúncio premiado do AdMob.
 * - A cada anúncio assistido, o usuário ganha 1 chave (+1).
 */

const STORAGE_KEY = 'estudahud_user_keys_v2';
const INITIAL_KEYS = 3; // Chaves iniciais para começar a explorar

export type KeysListener = (keys: number) => void;

class KeysService {
  private currentKeys: number = INITIAL_KEYS;
  private listeners: Set<KeysListener> = new Set();

  constructor() {
    this.loadKeys();
  }

  private loadKeys(): void {
    if (typeof window === 'undefined') return;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved !== null) {
        const parsed = parseInt(saved, 10);
        this.currentKeys = isNaN(parsed) ? INITIAL_KEYS : Math.max(0, parsed);
      } else {
        this.currentKeys = INITIAL_KEYS;
        this.persistKeys();
      }
    } catch {
      this.currentKeys = INITIAL_KEYS;
    }
  }

  private persistKeys(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, this.currentKeys.toString());
    } catch (err) {
      console.warn('[KeysService] Falha ao persistir chaves no localStorage', err);
    }
  }

  private notifyListeners(): void {
    this.persistKeys();
    this.listeners.forEach((listener) => {
      try {
        listener(this.currentKeys);
      } catch (e) {
        console.error('[KeysService] Erro no listener de chaves', e);
      }
    });
  }

  /**
   * Retorna o saldo atual de chaves.
   */
  public getKeys(): number {
    return this.currentKeys;
  }

  /**
   * Verifica se o usuário tem chaves suficientes (> 0).
   */
  public hasKeys(): boolean {
    return this.currentKeys > 0;
  }

  /**
   * Consome 1 chave para continuar (Jornada, Idiomas ou Xadrez).
   * Retorna true se a chave foi consumida com sucesso, ou false se o usuário não tem chaves.
   */
  public useKey(): boolean {
    if (this.currentKeys > 0) {
      this.currentKeys -= 1;
      this.notifyListeners();
      return true;
    }
    return false;
  }

  /**
   * Adiciona chaves (ex: +1 chave por anúncio assistido).
   */
  public addKey(amount: number = 1): number {
    this.currentKeys += Math.max(1, amount);
    this.notifyListeners();
    return this.currentKeys;
  }

  /**
   * Define o número exato de chaves (para sincronização em nuvem).
   */
  public setKeys(count: number): void {
    this.currentKeys = Math.max(0, count);
    this.notifyListeners();
  }

  /**
   * Inscreve um componente para receber atualizações do saldo de chaves em tempo real.
   */
  public subscribe(listener: KeysListener): () => void {
    this.listeners.add(listener);
    listener(this.currentKeys);
    return () => {
      this.listeners.delete(listener);
    };
  }
}

export const keysService = new KeysService();
