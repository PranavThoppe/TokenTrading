/**
 * PackCard Component - Migrated to CSS Modules
 * 
 * CSS Modules Example:
 * - Import: import styles from './PackCard.module.css'
 * - Use: className={styles.card} 
 * - Result: Class names are automatically scoped (e.g., "PackCard_card_abc123")
 * 
 * Benefits:
 * 1. No class name conflicts - styles are scoped to this component
 * 2. Type-safe - TypeScript knows about available classes
 * 3. No build-time issues - all classes are always available
 * 4. Better organization - styles live next to components
 * 
 * References:
 * - https://github.com/css-modules/css-modules
 * - https://vitejs.dev/guide/features.html#css-modules
 */

import { formatEther } from 'viem';
import type { PackType } from '@/types/contracts';
// Import CSS Module - Vite automatically handles .module.css files
import styles from './PackCard.module.css';

interface PackCardProps {
  pack: PackType;
  onPurchase: (packType: number) => void;
  isLoading?: boolean;
}

/**
 * Component displaying a single pack with details and purchase button
 * 
 * Pack color scheme:
 * - Starter Pack: Green
 * - Standard Pack: Yellow  
 * - Premium Pack: Blue
 */
export function PackCard({ pack, onPurchase, isLoading = false }: PackCardProps) {
  const priceInEth = formatEther(pack.price);
  
  // Determine pack type based on name to apply correct color variant
  // CSS Modules approach: We'll combine base classes with variant classes
  const packName = pack.name.toLowerCase();
  
  // Determine which variant classes to use
  // This is similar to Tailwind's conditional classes, but with CSS Modules
  let cardVariant = styles.cardStarter;
  let glowVariant = styles.cardGlowStarter;
  let titleVariant = styles.titleStarter;
  let buttonVariant = styles.buttonStarter;
  let buttonHoverVariant = styles.buttonHoverStarter;

  if (packName.includes('standard')) {
    cardVariant = styles.cardStandard;
    glowVariant = styles.cardGlowStandard;
    titleVariant = styles.titleStandard;
    buttonVariant = styles.buttonStandard;
    buttonHoverVariant = styles.buttonHoverStandard;
  } else if (packName.includes('premium')) {
    cardVariant = styles.cardPremium;
    glowVariant = styles.cardGlowPremium;
    titleVariant = styles.titlePremium;
    buttonVariant = styles.buttonPremium;
    buttonHoverVariant = styles.buttonHoverPremium;
  }

  // Rarity colors for progress bars
  // Using CSS Modules classes for each rarity type
  const rarityColorClasses = [
    styles.rarityCommon,      // Common - Gray
    styles.rarityUncommon,    // Uncommon - Green
    styles.rarityRare,        // Rare - Blue
    styles.rarityEpic,        // Epic - Purple
    styles.rarityLegendary,   // Legendary - Yellow
  ];

  const rarityNames = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'];

  return (
    // Combining multiple CSS Module classes using template literals
    // CSS Modules automatically handles class name scoping
    <div className={`${styles.card} ${cardVariant}`}>
      {/* Card glow effect that appears on hover */}
      <div className={`${styles.cardGlow} ${glowVariant}`} />
      
      {/* Content wrapper with z-index to appear above glow */}
      <div className={styles.content}>
        {/* Header section */}
        <div className={styles.header}>
          {/* Title with pack-specific color variant */}
          <h3 className={`${styles.title} ${titleVariant}`}>
            {pack.name}
          </h3>
          <p className={styles.subtitle}>
            {pack.cardCount} cards per pack
          </p>
        </div>

        {/* Rarity Distribution Section */}
        <div className={styles.raritySection}>
          <p className={styles.rarityTitle}>
            Rarity Distribution
          </p>
          <div className={styles.rarityList}>
            {pack.rarityWeights.map((weight, index) => (
              <div key={index} className={styles.rarityItem}>
                {/* Rarity label with name and percentage */}
                <div className={styles.rarityLabel}>
                  <span className={styles.rarityName}>{rarityNames[index]}</span>
                  <span className={styles.rarityPercent}>{weight}%</span>
                </div>
                {/* Progress bar container */}
                <div className={styles.rarityBar}>
                  {/* Progress bar fill with dynamic width and rarity-specific color */}
                  <div
                    className={`${styles.rarityBarFill} ${rarityColorClasses[index]}`}
                    style={{ width: `${weight}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Price and Button Section */}
        <div className={styles.priceSection}>
          <div className={styles.priceContainer}>
            <p className={styles.priceLabel}>Price</p>
            <div className={styles.priceValue}>
              <p className={styles.priceAmount}>{priceInEth}</p>
              <span className={styles.priceUnit}>ETH</span>
            </div>
          </div>
          {/* Purchase button with pack-specific color variant */}
          <button
            onClick={() => onPurchase(pack.id)}
            disabled={isLoading || !pack.active}
            className={`${styles.button} ${buttonVariant}`}
          >
            {/* Button hover overlay effect */}
            <div className={`${styles.buttonHover} ${buttonHoverVariant}`} />
            <span className={styles.buttonContent}>
              {isLoading ? 'Processing...' : !pack.active ? 'Unavailable' : 'Purchase Pack'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
