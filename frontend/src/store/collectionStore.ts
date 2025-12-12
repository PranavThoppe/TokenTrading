import { create } from 'zustand';
import type { Card } from '@/types/contracts';

interface CollectionState {
  cards: Card[];
  newCardIds: Set<bigint>;
  isLoading: boolean;
  error: Error | null;
  
  // Actions
  setCards: (cards: Card[]) => void;
  addCards: (cards: Card[]) => void;
  removeCard: (tokenId: bigint) => void;
  markCardsAsNew: (tokenIds: bigint[]) => void;
  clearNewCards: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: Error | null) => void;
  reset: () => void;
}

/**
 * Zustand store for managing user's card collection
 */
export const useCollectionStore = create<CollectionState>((set) => ({
  cards: [],
  newCardIds: new Set(),
  isLoading: false,
  error: null,

  setCards: (cards) => set({ cards }),

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

  reset: () => set({
    cards: [],
    newCardIds: new Set(),
    isLoading: false,
    error: null,
  }),
}));
