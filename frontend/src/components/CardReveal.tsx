import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Card } from '@/types/contracts';
import { Rarity } from '@/types/contracts';

interface CardRevealProps {
  cards: Card[];
  onComplete?: () => void;
  isComplete?: boolean;
}

const rarityConfig: Record<number, { 
  name: string; 
  gradient: string; 
  glow: string;
  sparkleColor: string;
  borderColor: string;
}> = {
  [Rarity.Common]: {
    name: 'Common',
    gradient: 'from-gray-400 to-gray-600',
    glow: 'shadow-gray-400/30',
    sparkleColor: 'bg-gray-300',
    borderColor: 'border-gray-400',
  },
  [Rarity.Uncommon]: {
    name: 'Uncommon',
    gradient: 'from-green-400 to-green-600',
    glow: 'shadow-green-400/30',
    sparkleColor: 'bg-green-300',
    borderColor: 'border-green-400',
  },
  [Rarity.Rare]: {
    name: 'Rare',
    gradient: 'from-blue-400 to-blue-600',
    glow: 'shadow-blue-400/30',
    sparkleColor: 'bg-blue-300',
    borderColor: 'border-blue-400',
  },
  [Rarity.Epic]: {
    name: 'Epic',
    gradient: 'from-purple-400 to-purple-600',
    glow: 'shadow-purple-400/50',
    sparkleColor: 'bg-purple-300',
    borderColor: 'border-purple-400',
  },
  [Rarity.Legendary]: {
    name: 'Legendary',
    gradient: 'from-yellow-400 to-amber-500',
    glow: 'shadow-yellow-400/50',
    sparkleColor: 'bg-yellow-300',
    borderColor: 'border-yellow-400',
  },
};

interface SparkleProps {
  color: string;
  delay: number;
}

function Sparkle({ color, delay }: SparkleProps) {
  return (
    <motion.div
      className={`absolute w-2 h-2 ${color} rounded-full`}
      style={{
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
      }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: [0, 1, 0],
        scale: [0, 1.5, 0],
      }}
      transition={{
        duration: 1,
        delay,
        repeat: Infinity,
        repeatDelay: Math.random() * 2,
      }}
    />
  );
}

interface SingleCardRevealProps {
  card: Card;
  index: number;
  isRevealed: boolean;
  onReveal: () => void;
}

function SingleCardReveal({ card, index, isRevealed, onReveal }: SingleCardRevealProps) {
  const config = rarityConfig[card.rarity] || rarityConfig[Rarity.Common];
  const isHighRarity = card.rarity >= Rarity.Epic;

  useEffect(() => {
    if (!isRevealed) {
      const timer = setTimeout(onReveal, index * 600 + 300);
      return () => clearTimeout(timer);
    }
  }, [index, isRevealed, onReveal]);

  return (
    <motion.div
      className="relative perspective-1000"
      initial={{ opacity: 0, y: 50, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.15, duration: 0.5 }}
    >
      {/* Card container with flip animation */}
      <motion.div
        className="relative w-48 h-64 cursor-pointer preserve-3d"
        animate={{ rotateY: isRevealed ? 180 : 0 }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
        onClick={onReveal}
      >
        {/* Card Back */}
        <div 
          className="absolute inset-0 backface-hidden rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 border-2 border-white/20 shadow-xl"
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-4xl">❓</div>
          </div>
          <div className="absolute inset-2 border border-white/10 rounded-lg" />
        </div>

        {/* Card Front */}
        <div 
          className={`
            absolute inset-0 backface-hidden rounded-xl
            bg-gradient-to-br ${config.gradient}
            border-2 ${config.borderColor}
            shadow-xl ${config.glow}
            rotate-y-180
          `}
        >
          {/* Sparkles for high rarity */}
          {isHighRarity && isRevealed && (
            <div className="absolute inset-0 overflow-hidden rounded-xl">
              {[...Array(8)].map((_, i) => (
                <Sparkle key={i} color={config.sparkleColor} delay={i * 0.2} />
              ))}
            </div>
          )}

          {/* Card content */}
          <div className="absolute inset-0 flex flex-col items-center justify-between p-4">
            {/* Rarity badge */}
            <div className={`
              px-3 py-1 rounded-full text-xs font-bold
              bg-black/30 text-white backdrop-blur-sm
            `}>
              {config.name}
            </div>

            {/* Player image placeholder */}
            <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center text-4xl">
              ⚽
            </div>

            {/* Player info */}
            <div className="text-center">
              <p className="text-white font-bold text-sm truncate max-w-full">
                {card.playerName || 'Player'}
              </p>
              <p className="text-white/70 text-xs">
                {card.position || 'Position'} • {card.team || 'Team'}
              </p>
            </div>

            {/* Stats */}
            <div className="flex gap-2 text-xs">
              <span className="px-2 py-1 bg-black/30 rounded text-white">
                ⭐ {card.stats?.rating || 0}
              </span>
            </div>
          </div>

          {/* Shine effect */}
          <motion.div
            className="absolute inset-0 rounded-xl bg-gradient-to-tr from-white/0 via-white/30 to-white/0"
            initial={{ x: '-100%', opacity: 0 }}
            animate={isRevealed ? { x: '100%', opacity: 1 } : {}}
            transition={{ delay: 0.3, duration: 0.6 }}
          />
        </div>
      </motion.div>

      {/* Glow effect for high rarity */}
      {isHighRarity && isRevealed && (
        <motion.div
          className={`
            absolute -inset-4 rounded-2xl blur-xl -z-10
            bg-gradient-to-br ${config.gradient}
          `}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
    </motion.div>
  );
}

/**
 * Card reveal component with sequential flip animation
 */
export function CardReveal({ cards, onComplete }: CardRevealProps) {
  const [revealedIndices, setRevealedIndices] = useState<Set<number>>(new Set());
  const [allRevealed, setAllRevealed] = useState(false);

  const handleReveal = useCallback((index: number) => {
    setRevealedIndices(prev => {
      const next = new Set(prev);
      next.add(index);
      return next;
    });
  }, []);

  // Check if all cards are revealed
  useEffect(() => {
    if (cards.length > 0 && revealedIndices.size === cards.length && !allRevealed) {
      setAllRevealed(true);
      onComplete?.();
    }
  }, [revealedIndices.size, cards.length, allRevealed, onComplete]);

  // Skip animation - reveal all cards
  const handleSkip = () => {
    const allIndices = new Set(cards.map((_, i) => i));
    setRevealedIndices(allIndices);
  };

  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="text-6xl mb-4">🎴</div>
          <p className="text-white/60">Loading your cards...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h2 className="text-3xl font-bold text-white mb-2">
          {allRevealed ? '🎉 Cards Revealed!' : 'Your New Cards'}
        </h2>
        <p className="text-white/60">
          {allRevealed 
            ? `You got ${cards.length} new cards!` 
            : 'Click cards to reveal or wait for auto-reveal'}
        </p>
      </motion.div>

      {/* Cards Grid */}
      <div className="flex flex-wrap justify-center gap-6 max-w-4xl">
        <AnimatePresence>
          {cards.map((card, index) => (
            <SingleCardReveal
              key={card.tokenId?.toString() || index}
              card={card}
              index={index}
              isRevealed={revealedIndices.has(index)}
              onReveal={() => handleReveal(index)}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Skip Button */}
      {!allRevealed && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          onClick={handleSkip}
          className="px-6 py-2 rounded-lg bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition-colors text-sm"
        >
          Skip Animation
        </motion.button>
      )}
    </div>
  );
}
