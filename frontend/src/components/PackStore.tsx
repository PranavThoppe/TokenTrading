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
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h2>
        <p className="text-white/60">
          Please connect your wallet to browse and purchase packs
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-white/10 bg-slate-800 p-6 animate-pulse"
          >
            <div className="h-6 bg-white/10 rounded mb-4" />
            <div className="h-4 bg-white/10 rounded mb-6" />
            <div className="space-y-2 mb-6">
              {[...Array(5)].map((_, j) => (
                <div key={j} className="h-2 bg-white/10 rounded" />
              ))}
            </div>
            <div className="h-10 bg-white/10 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (displayPacks.length === 0) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-white mb-4">No Packs Available</h2>
        {error ? (
          <p className="text-red-400 mb-2">
            Error: {error.message}
          </p>
        ) : null}
        <p className="text-white/60">
          {error ? 'Please check your contract configuration' : 'Check back later for new pack types'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-white mb-3">Pack Store</h2>
        <p className="text-lg text-white/60">
          Choose your pack and start building your collection
        </p>
      </div>

      {/* Pack Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayPacks.map((pack) => (
          <PackCard
            key={pack.id}
            pack={pack}
            onPurchase={onPurchase}
            isLoading={isPurchasing}
          />
        ))}
      </div>
    </div>
  );
}
