/**
 * PackStore Component - Migrated to CSS Modules
 * 
 * This component demonstrates:
 * - Using CSS Modules for component styling
 * - Responsive grid layouts with CSS Grid
 * - Loading states and skeleton screens
 * - Empty states
 * - CSS animations
 * 
 * CSS Modules Pattern:
 * 1. Import styles: import styles from './PackStore.module.css'
 * 2. Use classes: className={styles.container}
 * 3. Combine classes: className={`${styles.base} ${styles.variant}`}
 * 
 * References:
 * - CSS Grid Layout: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Grid_Layout
 * - CSS Animations: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Animations
 */

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { PackCard } from './PackCard';
import type { PackType } from '@/types/contracts';
// Import CSS Module - Vite automatically handles .module.css files
import styles from './PackStore.module.css';

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

  // Wallet not connected state
  if (!isConnected) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyStateContent}>
          <h2 className={`${styles.emptyStateTitle} ${styles.emptyStateTitleGradient}`}>
            Connect Your Wallet
          </h2>
          <p className={styles.emptyStateText}>
            Please connect your wallet to browse and purchase packs
          </p>
        </div>
      </div>
    );
  }

  // Loading state with skeleton screens
  // Skeleton pattern: Show placeholder content that mimics the final layout
  if (isLoading) {
    return (
      <div className={styles.skeletonContainer}>
        {/* Header skeleton */}
        <div className={styles.skeletonHeader}>
          <div className={styles.skeletonTitle} />
          <div className={styles.skeletonSubtitle} />
        </div>

        {/* Pack grid skeleton - shows 3 placeholder cards */}
        <div className={styles.grid}>
          {[...Array(3)].map((_, i) => (
            <div key={i} className={styles.skeletonCard}>
              {/* Skeleton card content - simplified structure */}
              <div style={{ height: '200px' }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Empty state (no packs available or error)
  if (displayPacks.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyStateContent}>
          <h2 className={styles.emptyStateTitle}>
            {error ? 'Error Loading Packs' : 'No Packs Available'}
          </h2>
          {error && (
            <div className={styles.errorContainer}>
              <p className={styles.errorText}>
                {error.message}
              </p>
            </div>
          )}
          <p className={styles.emptyStateText}>
            {error
              ? 'Please check your contract configuration and try again'
              : 'Check back later for new pack types'}
          </p>
        </div>
      </div>
    );
  }

  // Main content - pack store with grid layout
  return (
    <div className={styles.container}>
      {/* Header section */}
      <div className={styles.header}>
        <div>
          {/* Animated gradient title using CSS keyframes */}
          <h2 className={styles.title}>
            Pack Store
          </h2>
          <p className={styles.subtitle}>
            Choose your pack and start building your collection
          </p>
        </div>
        {/* Pack count badge */}
        {displayPacks.length > 0 && (
          <div>
            <span className={styles.badge}>
              {displayPacks.length} {displayPacks.length === 1 ? 'Pack' : 'Packs'} Available
            </span>
          </div>
        )}
      </div>

      {/* Responsive grid layout for pack cards */}
      {/* CSS Grid automatically handles responsive breakpoints */}
      <div className={styles.grid}>
        {displayPacks.map((pack, index) => (
          // Card wrapper with fade-in animation
          // Animation delay increases for each card (staggered animation)
          <div
            key={pack.id}
            className={styles.cardWrapper}
            style={{
              animationDelay: `${index * 100}ms`,
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
