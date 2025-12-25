import { create } from 'zustand';
import type { Card } from '@/types/contracts';

interface CollectionState {
  cards: Card[];
  newCardIds: Set<bigint>;
  isLoading: boolean;
  error: Error | null;
  lastScannedBlock: bigint | null;
  
  // Actions
  setCards: (cards: Card[]) => void;
  addCards: (cards: Card[]) => void;
  removeCard: (tokenId: bigint) => void;
  markCardsAsNew: (tokenIds: bigint[]) => void;
  clearNewCards: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: Error | null) => void;
  setLastScannedBlock: (block: bigint | null) => void;
  reset: () => void;
  loadFromCache: (address: string) => boolean;
  saveToCache: (address: string) => void;
}

const CACHE_KEY_PREFIX = 'collection_cache_';
const CACHE_VERSION = 1;

/**
 * Zustand store for managing user's card collection with localStorage caching
 */
export const useCollectionStore = create<CollectionState>((set, get) => ({
  cards: [],
  newCardIds: new Set(),
  isLoading: false,
  error: null,
  lastScannedBlock: null,

  setCards: (cards) => {
    set({ cards });
    // Auto-save to cache when cards are updated
    const address = (window as any).__walletAddress;
    if (address) {
      get().saveToCache(address);
    }
  },

  addCards: (newCards) => set((state) => ({
    cards: [...state.cards, ...newCards],
  })),

  removeCard: (tokenId) => set((state) => ({
    cards: state.cards.filter((card) => card.tokenId !== tokenId),
  })),

  markCardsAsNew: (tokenIds) => set((state) => ({
    newCardIds: new Set([...state.newCardIds, ...tokenIds]),
  })),

  clearNewCards: () => set({ newCardIds: new Set() }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  setLastScannedBlock: (block) => set({ lastScannedBlock: block }),

  loadFromCache: (address: string) => {
    try {
      const cacheKey = `${CACHE_KEY_PREFIX}${address.toLowerCase()}`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const data = JSON.parse(cached);
        if (data.version === CACHE_VERSION && data.cards && Array.isArray(data.cards)) {
          // Convert tokenId strings back to bigint
          const cards = data.cards.map((card: any) => ({
            ...card,
            tokenId: BigInt(card.tokenId),
          }));
          set({ 
            cards,
            lastScannedBlock: data.lastScannedBlock ? BigInt(data.lastScannedBlock) : null,
          });
          console.log(`[collectionStore] Loaded ${cards.length} cards from cache`);
          return true;
        }
      }
    } catch (err) {
      console.warn('[collectionStore] Failed to load from cache:', err);
    }
    return false;
  },

  saveToCache: (address: string) => {
    try {
      const state = get();
      const cacheKey = `${CACHE_KEY_PREFIX}${address.toLowerCase()}`;
      const data = {
        version: CACHE_VERSION,
        cards: state.cards.map(card => ({
          ...card,
          tokenId: card.tokenId.toString(), // Convert bigint to string for JSON
        })),
        lastScannedBlock: state.lastScannedBlock?.toString() || null,
        timestamp: Date.now(),
      };
      localStorage.setItem(cacheKey, JSON.stringify(data));
    } catch (err) {
      console.warn('[collectionStore] Failed to save to cache:', err);
    }
  },

  reset: () => set({
    cards: [],
    newCardIds: new Set(),
    isLoading: false,
    error: null,
    lastScannedBlock: null,
  }),
}));
