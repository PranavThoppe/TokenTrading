import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedPack } from './AnimatedPack';
import { CardReveal } from './CardReveal';
import { useOpenPack } from '@/hooks/useOpenPack';
import type { Card } from '@/types/contracts';

interface PendingPackData {
  requestId: bigint;
  packType: number;
  fulfilled: boolean;
}

interface PackOpeningProps {
  pendingPack: PendingPackData | null;
  onPackOpened?: (tokenIds: bigint[]) => void;
  onViewCollection?: () => void;
  revealedCards?: Card[];
}

type OpeningPhase = 'idle' | 'opening' | 'revealing' | 'complete';

/**
 * Pack opening page component with animated pack and card reveal
 */
export function PackOpening({ 
  pendingPack, 
  onPackOpened, 
  onViewCollection,
  revealedCards = []
}: PackOpeningProps) {
  const [phase, setPhase] = useState<OpeningPhase>('idle');
  const [showCards, setShowCards] = useState(false);
  
  const { 
    openPack, 
    status, 
    error, 
    hash, 
    isPending, 
    isConfirmed,
    reset 
  } = useOpenPack();

  // Handle pack opening
  const handleOpenPack = async () => {
    if (!pendingPack || !pendingPack.fulfilled) return;
    
    setPhase('opening');
    await openPack(pendingPack.requestId);
  };

  // Transition to reveal phase when transaction confirms
  useEffect(() => {
    if (isConfirmed && phase === 'opening') {
      // Short delay before showing cards
      const timer = setTimeout(() => {
        setPhase('revealing');
        setShowCards(true);
        onPackOpened?.([]); // Trigger parent to fetch new cards
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isConfirmed, phase, onPackOpened]);

  // Handle reveal completion
  const handleRevealComplete = () => {
    setPhase('complete');
  };

  // Reset state for new pack
  const handleReset = () => {
    setPhase('idle');
    setShowCards(false);
    reset();
  };

  // No pending pack state
  if (!pendingPack) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="text-6xl mb-4">📭</div>
          <h2 className="text-2xl font-bold text-white">No Packs to Open</h2>
          <p className="text-white/60 max-w-md">
            Purchase a pack from the store to start opening cards!
          </p>
        </motion.div>
      </div>
    );
  }

  // Pack not yet fulfilled (waiting for VRF)
  if (!pendingPack.fulfilled) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <motion.div
            className="text-6xl"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            ⏳
          </motion.div>
          <h2 className="text-2xl font-bold text-white">Pack Pending</h2>
          <p className="text-white/60 max-w-md">
            Your pack is being prepared. This may take a few moments while we generate your random cards.
          </p>
          <motion.div
            className="flex items-center justify-center gap-2"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <div className="w-2 h-2 bg-violet-500 rounded-full" />
            <div className="w-2 h-2 bg-violet-500 rounded-full" />
            <div className="w-2 h-2 bg-violet-500 rounded-full" />
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] py-12">
      <AnimatePresence mode="wait">
        {/* Pack Opening Phase */}
        {(phase === 'idle' || phase === 'opening') && (
          <motion.div
            key="pack"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.5 }}
          >
            <AnimatedPack
              packType={pendingPack.packType}
              isOpening={phase === 'opening'}
              onOpenClick={handleOpenPack}
              isDisabled={isPending}
            />
          </motion.div>
        )}

        {/* Card Reveal Phase */}
        {(phase === 'revealing' || phase === 'complete') && showCards && (
          <motion.div
            key="reveal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full"
          >
            <CardReveal
              cards={revealedCards}
              onComplete={handleRevealComplete}
              isComplete={phase === 'complete'}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error State */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 p-4 rounded-xl bg-red-500/20 border border-red-500/50 text-center"
        >
          <p className="text-red-400 font-semibold mb-2">Failed to open pack</p>
          <p className="text-red-300/80 text-sm">{error.message}</p>
          <button
            onClick={handleReset}
            className="mt-4 px-4 py-2 rounded-lg bg-red-500/30 text-red-300 hover:bg-red-500/40 transition-colors"
          >
            Try Again
          </button>
        </motion.div>
      )}

      {/* Transaction Hash */}
      {hash && status === 'pending' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6 text-center"
        >
          <a
            href={`https://sepolia.etherscan.io/tx/${hash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-violet-400 hover:text-violet-300 text-sm underline"
          >
            View transaction on Etherscan →
          </a>
        </motion.div>
      )}

      {/* View Collection Button */}
      {phase === 'complete' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 flex gap-4"
        >
          <button
            onClick={onViewCollection}
            className="px-8 py-3 rounded-xl font-bold text-lg bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/30 hover:shadow-xl hover:shadow-violet-500/50 transition-shadow"
          >
            View Collection
          </button>
          <button
            onClick={handleReset}
            className="px-8 py-3 rounded-xl font-bold text-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            Open Another
          </button>
        </motion.div>
      )}
    </div>
  );
}
