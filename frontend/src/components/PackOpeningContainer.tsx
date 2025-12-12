import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { PackOpening } from './PackOpening';
import { PendingPacksList } from './PendingPacksList';
import { usePendingPacks, type PendingPackData } from '@/hooks/usePendingPacks';
import { useUserCards } from '@/hooks/useUserCards';
import { useCollectionStore } from '@/store/collectionStore';
import type { Card } from '@/types/contracts';

interface PackOpeningContainerProps {
  onViewCollection?: () => void;
}

/**
 * Container component that manages pack opening flow and collection integration
 */
export function PackOpeningContainer({ onViewCollection }: PackOpeningContainerProps) {
  const { pendingPacks, isLoading: packsLoading, refetch: refetchPacks } = usePendingPacks();
  const { fetchCardsByIds } = useUserCards();
  const { markCardsAsNew } = useCollectionStore();
  
  const [selectedPack, setSelectedPack] = useState<PendingPackData | null>(null);
  const [revealedCards, setRevealedCards] = useState<Card[]>([]);

  // Handle pack selection
  const handleSelectPack = (pack: PendingPackData) => {
    setSelectedPack(pack);
    setRevealedCards([]);
  };

  // Handle pack opened - fetch newly minted cards
  const handlePackOpened = useCallback(async () => {
    // After pack is opened, we need to fetch the newly minted cards
    // The PackOpened event contains the token IDs
    // For now, we'll refetch all cards and show the newest ones
    refetchPacks();
    
    // In a real implementation, we'd parse the PackOpened event logs
    // to get the exact token IDs that were minted
  }, [refetchPacks]);

  // Handle viewing collection with new cards highlighted
  const handleViewCollection = () => {
    if (revealedCards.length > 0) {
      const newIds = revealedCards.map(card => card.tokenId);
      markCardsAsNew(newIds);
    }
    onViewCollection?.();
  };

  // Get the first fulfilled pack if none selected
  const activePack = selectedPack || pendingPacks.find(p => p.fulfilled) || pendingPacks[0] || null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold text-white mb-3">Open Packs</h1>
        <p className="text-lg text-white/60">
          Open your purchased packs to reveal new cards
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Pending Packs Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1"
        >
          <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
            <h2 className="text-xl font-bold text-white mb-4">Your Packs</h2>
            <PendingPacksList
              pendingPacks={pendingPacks}
              isLoading={packsLoading}
              onSelectPack={handleSelectPack}
              selectedPackId={activePack?.requestId}
            />
            
            {/* Refresh button */}
            <button
              onClick={() => refetchPacks()}
              className="mt-4 w-full py-2 rounded-lg bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition-colors text-sm"
            >
              Refresh Packs
            </button>
          </div>
        </motion.div>

        {/* Pack Opening Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2"
        >
          <div className="rounded-2xl bg-white/5 border border-white/10 p-8 min-h-[500px]">
            <PackOpening
              pendingPack={activePack}
              onPackOpened={handlePackOpened}
              onViewCollection={handleViewCollection}
              revealedCards={revealedCards}
            />
          </div>
        </motion.div>
      </div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <div className="rounded-xl bg-white/5 border border-white/10 p-4 text-center">
          <p className="text-2xl font-bold text-white">{pendingPacks.length}</p>
          <p className="text-sm text-white/60">Total Packs</p>
        </div>
        <div className="rounded-xl bg-white/5 border border-white/10 p-4 text-center">
          <p className="text-2xl font-bold text-green-400">
            {pendingPacks.filter(p => p.fulfilled).length}
          </p>
          <p className="text-sm text-white/60">Ready to Open</p>
        </div>
        <div className="rounded-xl bg-white/5 border border-white/10 p-4 text-center">
          <p className="text-2xl font-bold text-yellow-400">
            {pendingPacks.filter(p => !p.fulfilled).length}
          </p>
          <p className="text-sm text-white/60">Pending</p>
        </div>
        <div className="rounded-xl bg-white/5 border border-white/10 p-4 text-center">
          <p className="text-2xl font-bold text-violet-400">{revealedCards.length}</p>
          <p className="text-sm text-white/60">Cards Revealed</p>
        </div>
      </motion.div>
    </div>
  );
}
