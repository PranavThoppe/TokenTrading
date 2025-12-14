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
  
  // Determine pack type and colors based on name
  const packName = pack.name.toLowerCase();
  let packColors = {
    border: 'border-green-500/50',
    bg: 'from-green-500/20 to-green-600/10',
    hoverBorder: 'hover:border-green-400',
    hoverShadow: 'hover:shadow-green-500/30',
    button: 'from-green-500 to-green-600',
    buttonHover: 'from-green-600 to-green-700',
    textAccent: 'text-green-400',
  };

  if (packName.includes('standard')) {
    packColors = {
      border: 'border-yellow-500/50',
      bg: 'from-yellow-500/20 to-yellow-600/10',
      hoverBorder: 'hover:border-yellow-400',
      hoverShadow: 'hover:shadow-yellow-500/30',
      button: 'from-yellow-500 to-yellow-600',
      buttonHover: 'from-yellow-600 to-yellow-700',
      textAccent: 'text-yellow-400',
    };
  } else if (packName.includes('premium')) {
    packColors = {
      border: 'border-blue-500/50',
      bg: 'from-blue-500/20 to-blue-600/10',
      hoverBorder: 'hover:border-blue-400',
      hoverShadow: 'hover:shadow-blue-500/30',
      button: 'from-blue-500 to-blue-600',
      buttonHover: 'from-blue-600 to-blue-700',
      textAccent: 'text-blue-400',
    };
  }

  // Determine rarity colors based on weights
  const rarityColors = [
    'from-gray-400 to-gray-600',      // Common
    'from-green-400 to-green-600',    // Uncommon
    'from-blue-400 to-blue-600',      // Rare
    'from-purple-400 to-purple-600',  // Epic
    'from-yellow-400 to-yellow-600',  // Legendary
  ];

  const rarityNames = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'];

  return (
    <div className={`group relative overflow-hidden rounded-2xl border-2 ${packColors.border} bg-gradient-to-br ${packColors.bg} backdrop-blur-sm p-6 transition-all duration-300 ${packColors.hoverBorder} ${packColors.hoverShadow} hover:shadow-2xl hover:-translate-y-1`}>
      {/* Card glow effect */}
      <div className={`absolute inset-0 bg-gradient-to-br ${packColors.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
      
      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="mb-6 text-center">
          <h3 className={`text-3xl font-extrabold ${packColors.textAccent} mb-2`}>
            {pack.name}
          </h3>
          <p className="text-sm text-white/80">
            {pack.cardCount} cards per pack
          </p>
        </div>

        {/* Rarity Distribution */}
        <div className="mb-6 space-y-2">
          <p className="text-xs font-semibold text-white/90 uppercase tracking-wider text-center mb-3">
            Rarity Distribution
          </p>
          <div className="space-y-2">
            {pack.rarityWeights.map((weight, index) => (
              <div key={index} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-white/80">{rarityNames[index]}</span>
                  <span className="font-semibold text-white/90">{weight}%</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${rarityColors[index]} rounded-full transition-all duration-500`}
                    style={{ width: `${weight}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Price and Button */}
        <div className="space-y-4 pt-6 border-t border-white/20">
          <div className="text-center">
            <p className="text-xs text-white/60 mb-1 uppercase tracking-wide">Price</p>
            <div className="flex items-baseline justify-center gap-1">
              <p className="text-3xl font-extrabold text-white">{priceInEth}</p>
              <span className="text-sm font-semibold text-white/70">ETH</span>
            </div>
          </div>
          <button
            onClick={() => onPurchase(pack.id)}
            disabled={isLoading || !pack.active}
            className={`w-full py-3 rounded-xl bg-gradient-to-r ${packColors.button} text-white font-bold text-sm transition-all duration-300 hover:shadow-lg ${packColors.hoverShadow} hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none overflow-hidden group/btn`}
          >
            <span className="relative z-10">
              {isLoading ? 'Processing...' : !pack.active ? 'Unavailable' : 'Purchase Pack'}
            </span>
            <div className={`absolute inset-0 bg-gradient-to-r ${packColors.buttonHover} opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300`} />
          </button>
        </div>
      </div>
    </div>
  );
}
