import { useState, useEffect } from 'react';
import { useOpenPack } from '@/hooks/useOpenPack';
import { useUserCards } from '@/hooks/useUserCards';
import { CardRevealModal } from './CardRevealModal';
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
  onNavigateToStore?: () => void;
}

const packNames: Record<number, string> = {
  0: 'Starter Pack',
  1: 'Standard Pack',
  2: 'Premium Pack',
};

export function PackOpening({
  pendingPack,
  onPackOpened,
  onViewCollection,
  onNavigateToStore,
}: PackOpeningProps) {
  const [isOpening, setIsOpening] = useState(false);
  const [showRevealModal, setShowRevealModal] = useState(false);
  const [revealedCards, setRevealedCards] = useState<Card[]>([]);

  const { openPack, status, error, hash, isPending, mintedTokenIds, reset } =
    useOpenPack();
  const { fetchCardsByIds } = useUserCards();

  const handleOpenPack = async () => {
    if (!pendingPack || !pendingPack.fulfilled) return;
    console.log('[PackOpening] Opening pack:', pendingPack.requestId.toString());
    setIsOpening(true);
    setRevealedCards([]);
    await openPack(pendingPack.requestId);
    console.log('[PackOpening] openPack call completed');
  };

  // When we have minted token IDs, fetch the card data and show modal
  useEffect(() => {
    console.log('[PackOpening] Token IDs effect:', { 
      isOpening, 
      mintedTokenIdsCount: mintedTokenIds.length,
      showRevealModal
    });
    
    // Only fetch if we're in opening state and have token IDs
    if (isOpening && mintedTokenIds.length > 0 && !showRevealModal) {
      console.log('[PackOpening] Fetching card metadata for tokens:', mintedTokenIds.map(id => id.toString()));
      
      fetchCardsByIds(mintedTokenIds).then((cards) => {
        console.log('[PackOpening] Fetched cards:', cards.length);
        setRevealedCards(cards);
        setShowRevealModal(true);
        setIsOpening(false);
        onPackOpened?.(mintedTokenIds);
      }).catch((err) => {
        console.error('[PackOpening] Error fetching cards:', err);
        setIsOpening(false);
      });
    }
  }, [isOpening, mintedTokenIds, showRevealModal, fetchCardsByIds, onPackOpened]);

  const handleCloseReveal = () => {
    setShowRevealModal(false);
    setRevealedCards([]);
    reset();
  };

  const handleViewCollection = () => {
    setShowRevealModal(false);
    onViewCollection?.();
  };

  const handleReset = () => {
    setIsOpening(false);
    setShowRevealModal(false);
    setRevealedCards([]);
    reset();
  };

  // Render the content based on state
  const renderContent = () => {
    // No pack selected
    if (!pendingPack) {
      return (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
          <h2 style={{ color: '#fff', fontSize: '20px', marginBottom: '8px' }}>No Packs to Open</h2>
          <p style={{ color: '#888', marginBottom: '20px' }}>Purchase a pack from the store first!</p>
          {onNavigateToStore && (
            <button
              onClick={onNavigateToStore}
              style={{
                padding: '12px 24px',
                background: '#7c3aed',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Go to Pack Store
            </button>
          )}
        </div>
      );
    }

    // Pack not fulfilled yet
    if (!pendingPack.fulfilled) {
      return (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
          <h2 style={{ color: '#fff', fontSize: '20px', marginBottom: '8px' }}>Pack Pending</h2>
          <p style={{ color: '#888', maxWidth: '300px', margin: '0 auto' }}>
            Waiting for randomness. This usually takes 1-5 minutes. Click Refresh to check.
          </p>
        </div>
      );
    }

    // Ready to open
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <div
          style={{
            width: '160px',
            height: '200px',
            margin: '0 auto 24px',
            background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '64px',
            boxShadow: '0 8px 32px rgba(124, 58, 237, 0.3)',
            animation: isPending ? 'pulse 1s infinite' : 'none',
          }}
        >
          📦
        </div>

        <h2 style={{ color: '#fff', fontSize: '20px', marginBottom: '8px' }}>
          {packNames[pendingPack.packType] || 'Card Pack'}
        </h2>
        <p style={{ color: '#888', marginBottom: '24px' }}>
          {isPending ? 'Opening your pack...' : 'Ready to open!'}
        </p>

        <button
          onClick={handleOpenPack}
          disabled={isPending}
          style={{
            padding: '14px 32px',
            background: isPending ? '#555' : '#7c3aed',
            border: 'none',
            borderRadius: '8px',
            color: '#fff',
            fontSize: '16px',
            fontWeight: 600,
            cursor: isPending ? 'not-allowed' : 'pointer',
          }}
        >
          {isPending ? 'Opening...' : 'Open Pack'}
        </button>

        {error && (
          <div
            style={{
              marginTop: '20px',
              padding: '12px',
              background: '#7f1d1d',
              borderRadius: '8px',
              color: '#fca5a5',
              fontSize: '14px',
            }}
          >
            Error: {error.message}
            <button
              onClick={handleReset}
              style={{
                display: 'block',
                margin: '12px auto 0',
                padding: '8px 16px',
                background: '#991b1b',
                border: 'none',
                borderRadius: '6px',
                color: '#fff',
                cursor: 'pointer',
              }}
            >
              Try Again
            </button>
          </div>
        )}

        {hash && status === 'pending' && (
          <p style={{ marginTop: '16px' }}>
            <a
              href={`https://sepolia.etherscan.io/tx/${hash}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#8b5cf6', fontSize: '14px' }}
            >
              View transaction →
            </a>
          </p>
        )}
      </div>
    );
  };

  return (
    <>
      {renderContent()}

      {/* Card Reveal Modal - Always rendered so it shows even after pack is removed */}
      <CardRevealModal
        isOpen={showRevealModal}
        cards={revealedCards}
        onClose={handleCloseReveal}
        onViewCollection={handleViewCollection}
      />

      {/* Pulse animation for opening state */}
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `}</style>
    </>
  );
}
