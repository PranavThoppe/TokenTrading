import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { PackCard } from './PackCard';
import type { PackType } from '@/types/contracts';

interface PackStoreProps {
  packs: PackType[];
  isLoading: boolean;
  error?: Error | null;
  onPurchase: (packType: number) => void;
  isPurchasing?: boolean;
}

/**
 * Pack store page component displaying available packs in a responsive grid
 */
export function PackStore({
  packs,
  isLoading,
  error,
  onPurchase,
  isPurchasing = false,
}: PackStoreProps) {
  const { isConnected } = useAccount();
  const [displayPacks, setDisplayPacks] = useState<PackType[]>([]);

  useEffect(() => {
    setDisplayPacks(packs);
  }, [packs]);

  if (!isConnected) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h2 className="text-3xl font-bold text-white mb-3 bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
            Connect Your Wallet
          </h2>
          <p className="text-white/70 text-lg leading-relaxed">
            Please connect your wallet to browse and purchase packs
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-8">
        {/* Header Skeleton */}
        <div className="text-center mb-12 animate-pulse">
          <div className="h-10 bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 rounded-lg w-64 mx-auto mb-4" />
          <div className="h-6 bg-white/10 rounded-lg w-96 mx-auto" />
        </div>

        {/* Pack Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-8 animate-pulse"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="h-7 bg-white/10 rounded-lg mb-3 w-3/4" />
                  <div className="h-4 bg-white/10 rounded-lg w-1/2" />
                </div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20" />
              </div>
              <div className="space-y-3 mb-8">
                <div className="h-3 bg-white/10 rounded-full" />
                {[...Array(5)].map((_, j) => (
                  <div key={j} className="flex items-center gap-3">
                    <div className="h-2 bg-white/10 rounded-full w-20" />
                    <div className="flex-1 h-2 bg-white/10 rounded-full" />
                    <div className="h-2 bg-white/10 rounded-full w-8" />
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between pt-6 border-t border-white/10">
                <div className="space-y-2">
                  <div className="h-3 bg-white/10 rounded w-12" />
                  <div className="h-8 bg-white/10 rounded-lg w-24" />
                </div>
                <div className="h-10 bg-white/10 rounded-lg w-32" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (displayPacks.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h2 className="text-3xl font-bold text-white mb-3">
            {error ? 'Error Loading Packs' : 'No Packs Available'}
          </h2>
          {error ? (
            <div className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/30">
              <p className="text-red-400 text-sm font-medium">
                {error.message}
              </p>
            </div>
          ) : null}
          <p className="text-white/70 text-lg leading-relaxed">
            {error
              ? 'Please check your contract configuration and try again'
              : 'Check back later for new pack types'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 px-4 py-6 max-w-7xl mx-auto">
      {/* Enhanced Header */}
      <div className="text-center space-y-3">
        <div>
          <h2 className="text-4xl md:text-5xl font-extrabold mb-3 bg-gradient-to-r from-violet-400 via-fuchsia-400 to-violet-400 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
            Pack Store
          </h2>
          <p className="text-lg text-white/70 max-w-2xl mx-auto leading-relaxed">
            Choose your pack and start building your collection
          </p>
        </div>
        {displayPacks.length > 0 && (
          <div className="pt-3">
            <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-white/70">
              {displayPacks.length} {displayPacks.length === 1 ? 'Pack' : 'Packs'} Available
            </span>
          </div>
        )}
      </div>

      {/* Pack Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {displayPacks.map((pack, index) => (
          <div
            key={pack.id}
            className="animate-fade-in"
            style={{
              animationDelay: `${index * 100}ms`,
              animationFillMode: 'both',
            }}
          >
            <PackCard
              pack={pack}
              onPurchase={onPurchase}
              isLoading={isPurchasing}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
