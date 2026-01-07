import { useState } from 'react';
import { useAccount } from 'wagmi';
import { listCardForTrade, unlistCard, isCardListed } from '../lib/api/trades';

interface CardData {
  tokenId: number;
  playerName: string;
  position?: string;
  rarity: number;
}

interface CardListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: CardData | null;
  onSuccess?: () => void;
}

export function CardListingModal({ isOpen, onClose, card, onSuccess }: CardListingModalProps) {
  const { address } = useAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isListed, setIsListed] = useState(false);

  // Check if card is already listed when modal opens
  useState(() => {
    if (isOpen && card) {
      checkListingStatus();
    }
  });

  const checkListingStatus = async () => {
    if (!card) return;

    try {
      const listed = await isCardListed(card.tokenId);
      setIsListed(listed);
    } catch (err) {
      console.error('Error checking listing status:', err);
    }
  };

  const handleListCard = async () => {
    if (!card || !address) return;

    setIsLoading(true);
    setError(null);

    try {
      await listCardForTrade(card.tokenId, address, {
        playerName: card.playerName,
        position: card.position,
        rarity: card.rarity
      });

      setIsListed(true);
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to list card');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnlistCard = async () => {
    if (!card || !address) return;

    setIsLoading(true);
    setError(null);

    try {
      await unlistCard(card.tokenId, address);
      setIsListed(false);
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unlist card');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !card) return null;

  const rarityColors = {
    0: { name: 'Common', color: '#6b7280' },
    1: { name: 'Uncommon', color: '#10b981' },
    2: { name: 'Rare', color: '#3b82f6' },
    3: { name: 'Epic', color: '#a855f7' },
    4: { name: 'Legendary', color: '#eab308' },
  };

  const rarity = rarityColors[card.rarity as keyof typeof rarityColors] || rarityColors[0];

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#1a1a2e',
          borderRadius: '16px',
          border: '1px solid #333',
          padding: '24px',
          maxWidth: '400px',
          width: '100%',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'transparent',
            border: 'none',
            color: '#888',
            fontSize: '20px',
            cursor: 'pointer',
            padding: '4px',
          }}
        >
          ×
        </button>

        {/* Card Preview */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div
            style={{
              width: '120px',
              height: '180px',
              background: `linear-gradient(135deg, #374151, #1a1a2e)`,
              borderRadius: '8px',
              border: `2px solid ${rarity.color}`,
              margin: '0 auto 12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px',
            }}
          >
            🃏
          </div>
          <h3 style={{ color: '#fff', margin: '0 0 4px 0', fontSize: '18px' }}>
            {card.playerName}
          </h3>
          <p style={{ color: '#888', margin: '0 0 8px 0' }}>
            {card.position} • <span style={{ color: rarity.color }}>{rarity.name}</span>
          </p>
          <p style={{ color: '#666', fontSize: '14px', margin: '0' }}>
            Token ID: {card.tokenId}
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div
            style={{
              background: '#dc2626',
              color: '#fff',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '16px',
              fontSize: '14px',
            }}
          >
            {error}
          </div>
        )}

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '12px' }}>
          {isListed ? (
            <button
              onClick={handleUnlistCard}
              disabled={isLoading}
              style={{
                flex: 1,
                padding: '12px',
                background: '#dc2626',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '14px',
                fontWeight: 600,
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.6 : 1,
              }}
            >
              {isLoading ? 'Unlisting...' : 'Remove from Trades'}
            </button>
          ) : (
            <button
              onClick={handleListCard}
              disabled={isLoading}
              style={{
                flex: 1,
                padding: '12px',
                background: '#7c3aed',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '14px',
                fontWeight: 600,
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.6 : 1,
              }}
            >
              {isLoading ? 'Listing...' : 'List for Trade'}
            </button>
          )}

          <button
            onClick={onClose}
            disabled={isLoading}
            style={{
              flex: 1,
              padding: '12px',
              background: '#333',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '14px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.6 : 1,
            }}
          >
            Cancel
          </button>
        </div>

        {/* Info text */}
        <p style={{
          color: '#666',
          fontSize: '12px',
          textAlign: 'center',
          margin: '16px 0 0 0'
        }}>
          {isListed
            ? 'This card is currently listed for trade. Removing it will hide it from the marketplace.'
            : 'Listing this card will make it visible to other traders who can make offers.'
          }
        </p>
      </div>
    </div>
  );
}
