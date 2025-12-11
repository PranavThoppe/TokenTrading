import { formatEther } from 'viem';
import type { PackType } from '@/types/contracts';

interface PackCardProps {
  pack: PackType;
  onPurchase: (packType: number) => void;
  isLoading?: boolean;
}

/**
 * Component displaying a single pack with details and purchase button
 */
export function PackCard({ pack, onPurchase, isLoading = false }: PackCardProps) {
  const priceInEth = formatEther(pack.price);
  
  // Determine rarity colors based on weights
  const rarityColors = [
    'from-gray-400 to-gray-600',      // Common
    'from-green-400 to-green-600',    // Uncommon
    'from-blue-400 to-blue-600',      // Rare
    'from-purple-400 to-purple-600',  // Epic
    'from-yellow-400 to-yellow-600',  // Legendary
  ];

  return (
    <div className="group relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-slate-800 to-slate-900 p-6 transition-all duration-300 hover:border-violet-500/50 hover:shadow-lg hover:shadow-violet-500/20">
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/0 to-fuchsia-500/0 group-hover:from-violet-500/10 group-hover:to-fuchsia-500/10 transition-all duration-300" />
      
      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h3 className="text-xl font-bold text-white">{pack.name}</h3>
            <p className="text-sm text-white/60">{pack.cardCount} cards per pack</p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500" />
        </div>

        {/* Rarity Distribution */}
        <div className="mb-6 space-y-2">
          <p className="text-xs font-semibold text-white/70 uppercase tracking-wider">
            Rarity Distribution
          </p>
          <div className="space-y-1">
            {pack.rarityWeights.map((weight, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-20 text-xs text-white/60">
                  {['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'][index]}
                </div>
                <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${rarityColors[index]}`}
                    style={{ width: `${weight}%` }}
                  />
                </div>
                <div className="w-8 text-right text-xs text-white/60">{weight}%</div>
              </div>
            ))}
          </div>
        </div>

        {/* Price and Button */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <div>
            <p className="text-xs text-white/60 mb-1">Price</p>
            <p className="text-2xl font-bold text-white">{priceInEth} ETH</p>
          </div>
          <button
            onClick={() => {
              console.log('Purchase clicked for pack:', pack.id);
              onPurchase(pack.id);
            }}
            disabled={isLoading || !pack.active}
            className="px-6 py-2 rounded-lg bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-violet-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Processing...' : !pack.active ? 'Unavailable' : 'Purchase'}
          </button>
        </div>
      </div>
    </div>
  );
}
