import { motion } from 'framer-motion';
import type { PendingPackData } from '@/hooks/usePendingPacks';

interface PendingPacksListProps {
  pendingPacks: PendingPackData[];
  isLoading: boolean;
  onSelectPack: (pack: PendingPackData) => void;
  selectedPackId?: bigint;
}

const packNames: Record<number, string> = {
  0: 'Starter Pack',
  1: 'Standard Pack',
  2: 'Premium Pack',
  3: 'Elite Pack',
  4: 'Legendary Pack',
};

const packColors: Record<number, string> = {
  0: 'from-gray-500 to-gray-700',
  1: 'from-green-500 to-green-700',
  2: 'from-blue-500 to-blue-700',
  3: 'from-purple-500 to-purple-700',
  4: 'from-yellow-500 to-yellow-700',
};

/**
 * Component to display list of pending packs
 */
export function PendingPacksList({ 
  pendingPacks, 
  isLoading, 
  onSelectPack,
  selectedPackId 
}: PendingPacksListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(2)].map((_, i) => (
          <div
            key={i}
            className="h-20 rounded-xl bg-white/5 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (pendingPacks.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-white/60">No pending packs</p>
        <p className="text-white/40 text-sm mt-1">
          Purchase a pack to get started!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {pendingPacks.map((pack, index) => {
        const isSelected = selectedPackId === pack.requestId;
        const packName = packNames[pack.packType] || 'Card Pack';
        const gradient = packColors[pack.packType] || packColors[0];

        return (
          <motion.button
            key={pack.requestId.toString()}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => onSelectPack(pack)}
            className={`
              w-full p-4 rounded-xl text-left transition-all duration-300
              ${isSelected 
                ? 'bg-violet-500/20 border-2 border-violet-500' 
                : 'bg-white/5 border-2 border-transparent hover:bg-white/10 hover:border-white/20'
              }
            `}
          >
            <div className="flex items-center gap-4">
              {/* Pack icon */}
              <div className={`
                w-12 h-12 rounded-lg bg-gradient-to-br ${gradient}
                flex items-center justify-center text-2xl
                shadow-lg
              `}>
                📦
              </div>

              {/* Pack info */}
              <div className="flex-1">
                <p className="font-semibold text-white">{packName}</p>
                <p className="text-sm text-white/60">
                  Request ID: {pack.requestId.toString().slice(0, 8)}...
                </p>
              </div>

              {/* Status badge */}
              <div className={`
                px-3 py-1 rounded-full text-xs font-semibold
                ${pack.fulfilled 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'bg-yellow-500/20 text-yellow-400'
                }
              `}>
                {pack.fulfilled ? (
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-400 rounded-full" />
                    Ready
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <motion.span
                      className="w-2 h-2 bg-yellow-400 rounded-full"
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                    Pending
                  </span>
                )}
              </div>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
