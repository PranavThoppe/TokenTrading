import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useUserCards } from '../hooks/useUserCards';
import { createTradeOffer } from '../lib/api/trades';

interface ListedCard {
  id: string;
  token_id: number;
  owner_address: string;
  player_name: string;
  position: string | null;
  rarity: number;
  listed_at: string;
  status: 'active' | 'traded' | 'cancelled';
}

interface TradeCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  listedCard: ListedCard | null;
  onSuccess?: () => void;
}

export function TradeCreationModal({ isOpen, onClose, listedCard, onSuccess }: TradeCreationModalProps) {
  const { address } = useAccount();
  const { cards, isLoading: cardsLoading } = useUserCards();
  const [selectedCardIds, setSelectedCardIds] = useState<Set<number>>(new Set());
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setSelectedCardIds(new Set());
      setError(null);
    }
  }, [isOpen]);

  // Don't render if not open or no listed card
  if (!isOpen || !listedCard || !address) return null;

  const handleCardToggle = (tokenId: bigint | number) => {
    const tokenIdNum = Number(tokenId);
    const newSelected = new Set(selectedCardIds);
    if (newSelected.has(tokenIdNum)) {
      newSelected.delete(tokenIdNum);
    } else {
      newSelected.add(tokenIdNum);
    }
    setSelectedCardIds(newSelected);
  };

  const handleCreateTrade = async () => {
    if (selectedCardIds.size === 0) {
      setError('Please select at least one card to offer');
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      // Get details of selected cards from user's collection
      const offeredCardDetails = cards
        .filter(card => selectedCardIds.has(Number(card.tokenId)))
        .map(card => {
          console.log('Card from collection:', card.tokenId, 'rarity:', card.rarity, 'type:', typeof card.rarity);
          return {
            tokenId: Number(card.tokenId),
            playerName: card.playerName,
            position: card.position,
            rarity: card.rarity
          };
        });

      // Details of the requested card
      const requestedCardDetails = {
        playerName: listedCard.player_name,
        position: listedCard.position || undefined,
        rarity: listedCard.rarity
      };

      console.log('Offered card details:', offeredCardDetails);
      console.log('Requested card details:', requestedCardDetails);

      await createTradeOffer(
        address!,
        listedCard.owner_address,
        Array.from(selectedCardIds),
        Number(listedCard.token_id),
        offeredCardDetails,
        requestedCardDetails
      );

      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create trade offer');
    } finally {
      setIsCreating(false);
    }
  };

  const rarityColors = {
    0: { name: 'Common', color: '#6b7280' },
    1: { name: 'Uncommon', color: '#10b981' },
    2: { name: 'Rare', color: '#3b82f6' },
    3: { name: 'Epic', color: '#a855f7' },
    4: { name: 'Legendary', color: '#eab308' },
  };

  const requestedRarity = rarityColors[listedCard.rarity as keyof typeof rarityColors] || rarityColors[0];

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
          maxWidth: '800px',
          width: '100%',
          maxHeight: '80vh',
          overflow: 'auto',
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

        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ color: '#fff', margin: '0 0 8px 0', fontSize: '24px' }}>
            Make Trade Offer
          </h2>
          <p style={{ color: '#888', margin: '0' }}>
            Select cards from your collection to offer in exchange
          </p>
        </div>

        {/* Requested Card Display */}
        <div style={{ marginBottom: '24px', padding: '16px', background: '#0f0f1e', borderRadius: '12px' }}>
          <h3 style={{ color: '#fff', margin: '0 0 12px 0', fontSize: '16px' }}>You're requesting:</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: '80px',
                height: '120px',
                background: `linear-gradient(135deg, #374151, #1a1a2e)`,
                borderRadius: '8px',
                border: `2px solid ${requestedRarity.color}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
              }}
            >
              🃏
            </div>
            <div>
              <h4 style={{ color: '#fff', margin: '0 0 4px 0', fontSize: '18px' }}>
                {listedCard.player_name}
              </h4>
              <p style={{ color: '#888', margin: '0 0 4px 0' }}>
                {listedCard.position} • <span style={{ color: requestedRarity.color }}>{requestedRarity.name}</span>
              </p>
              <p style={{ color: '#666', margin: '0', fontSize: '14px' }}>
                Token ID: {Number(listedCard.token_id)}
              </p>
            </div>
          </div>
        </div>

        {/* Your Collection Selection */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ color: '#fff', margin: '0 0 12px 0', fontSize: '16px' }}>
            Select cards to offer ({selectedCardIds.size} selected):
          </h3>

          {cardsLoading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
              Loading your collection...
            </div>
          ) : cards.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
              You don't have any cards in your collection
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                gap: '12px',
                maxHeight: '300px',
                overflow: 'auto',
                padding: '12px',
                border: '1px solid #333',
                borderRadius: '8px',
              }}
            >
              {cards.map((card) => {
                const cardTokenId = Number(card.tokenId);
                const isSelected = selectedCardIds.has(cardTokenId);
                const cardRarity = rarityColors[card.rarity as keyof typeof rarityColors] || rarityColors[0];

                return (
                  <div
                    key={card.tokenId}
                    onClick={() => handleCardToggle(card.tokenId)}
                    style={{
                      padding: '8px',
                      borderRadius: '8px',
                      border: `2px solid ${isSelected ? '#7c3aed' : cardRarity.color}`,
                      background: isSelected ? 'rgba(124, 58, 237, 0.1)' : 'transparent',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      position: 'relative',
                    }}
                  >
                    {isSelected && (
                      <div
                        style={{
                          position: 'absolute',
                          top: '4px',
                          right: '4px',
                          background: '#7c3aed',
                          color: '#fff',
                          borderRadius: '50%',
                          width: '20px',
                          height: '20px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '12px',
                          fontWeight: 'bold',
                        }}
                      >
                        ✓
                      </div>
                    )}

                    <div
                      style={{
                        width: '80px',
                        height: '60px',
                        background: `linear-gradient(135deg, #374151, #1a1a2e)`,
                        borderRadius: '4px',
                        margin: '0 auto 8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '16px',
                      }}
                    >
                      🃏
                    </div>

                    <div style={{ textAlign: 'center' }}>
                      <div
                        style={{
                          color: '#fff',
                          fontSize: '11px',
                          fontWeight: 'bold',
                          marginBottom: '2px',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {card.playerName}
                      </div>
                      <div style={{ color: cardRarity.color, fontSize: '9px', fontWeight: 'bold' }}>
                        {cardRarity.name}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
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
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            disabled={isCreating}
            style={{
              padding: '12px 24px',
              background: '#333',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              cursor: isCreating ? 'not-allowed' : 'pointer',
              opacity: isCreating ? 0.6 : 1,
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleCreateTrade}
            disabled={isCreating || selectedCardIds.size === 0}
            style={{
              padding: '12px 24px',
              background: '#7c3aed',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              fontWeight: 'bold',
              cursor: (isCreating || selectedCardIds.size === 0) ? 'not-allowed' : 'pointer',
              opacity: (isCreating || selectedCardIds.size === 0) ? 0.6 : 1,
            }}
          >
            {isCreating ? 'Creating Offer...' : `Offer ${selectedCardIds.size} Card${selectedCardIds.size !== 1 ? 's' : ''}`}
          </button>
        </div>
      </div>
    </div>
  );
}
