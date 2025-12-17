import { useUserCards } from '@/hooks/useUserCards';
import { useCollectionStore } from '@/store/collectionStore';

const rarityColors: Record<number, { bg: string; border: string; glow: string; name: string }> = {
  0: { bg: '#374151', border: '#6b7280', glow: 'rgba(107, 114, 128, 0.3)', name: 'Common' },
  1: { bg: '#065f46', border: '#10b981', glow: 'rgba(16, 185, 129, 0.3)', name: 'Uncommon' },
  2: { bg: '#1e40af', border: '#3b82f6', glow: 'rgba(59, 130, 246, 0.3)', name: 'Rare' },
  3: { bg: '#581c87', border: '#a855f7', glow: 'rgba(168, 85, 247, 0.3)', name: 'Epic' },
  4: { bg: '#854d0e', border: '#eab308', glow: 'rgba(234, 179, 8, 0.4)', name: 'Legendary' },
};

interface CollectionProps {
  onNavigateToStore?: () => void;
}

export function Collection({ onNavigateToStore }: CollectionProps) {
  const { cards, isLoading, error, refetch } = useUserCards();
  const { newCardIds, clearNewCards } = useCollectionStore();

  // Clear new card highlights after viewing
  const handleClearNew = () => {
    clearNewCards();
  };

  if (isLoading) {
    return (
      <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
        <p style={{ color: '#888' }}>Loading your collection...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>❌</div>
        <p style={{ color: '#f87171', marginBottom: '16px' }}>Error loading collection</p>
        <button
          onClick={() => refetch()}
          style={{
            padding: '10px 20px',
            background: '#7c3aed',
            border: 'none',
            borderRadius: '8px',
            color: '#fff',
            cursor: 'pointer',
          }}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
        }}
      >
        <div>
          <h1 style={{ fontSize: '28px', marginBottom: '4px', color: '#fff' }}>My Collection</h1>
          <p style={{ color: '#888' }}>
            {cards.length} {cards.length === 1 ? 'card' : 'cards'} collected
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          {newCardIds.size > 0 && (
            <button
              onClick={handleClearNew}
              style={{
                padding: '8px 16px',
                background: '#333',
                border: 'none',
                borderRadius: '6px',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '13px',
              }}
            >
              Clear New ({newCardIds.size})
            </button>
          )}
          <button
            onClick={() => refetch()}
            style={{
              padding: '8px 16px',
              background: '#333',
              border: 'none',
              borderRadius: '6px',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '13px',
            }}
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Empty State */}
      {cards.length === 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: '60px 20px',
            background: '#1a1a2e',
            borderRadius: '12px',
            border: '1px solid #333',
          }}
        >
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>🃏</div>
          <h2 style={{ color: '#fff', fontSize: '20px', marginBottom: '8px' }}>No Cards Yet</h2>
          <p style={{ color: '#888', marginBottom: '24px' }}>
            Purchase and open packs to start your collection!
          </p>
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
      )}

      {/* Cards Grid */}
      {cards.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '16px',
          }}
        >
          {cards.map((card) => {
            const rarity = rarityColors[card.rarity] || rarityColors[0];
            const isNew = newCardIds.has(card.tokenId);

            return (
              <div
                key={card.tokenId.toString()}
                style={{
                  background: card.imageUrl
                    ? `url(${card.imageUrl}) center/cover no-repeat`
                    : `linear-gradient(135deg, ${rarity.bg}, #1a1a2e)`,
                  borderRadius: '12px',
                  border: `2px solid ${isNew ? '#22c55e' : rarity.border}`,
                  boxShadow: isNew
                    ? '0 0 20px rgba(34, 197, 94, 0.5)'
                    : `0 4px 12px ${rarity.glow}`,
                  padding: '12px',
                  position: 'relative',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  cursor: 'pointer',
                  overflow: 'hidden',
                  aspectRatio: '2/3', // 1024x1536 = 2:3 aspect ratio
                  width: '100%',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = `0 8px 24px ${rarity.glow}`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = isNew
                    ? '0 0 20px rgba(34, 197, 94, 0.5)'
                    : `0 4px 12px ${rarity.glow}`;
                }}
              >
                {/* Dark overlay for text readability when image is present */}
                {card.imageUrl && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.8) 100%)',
                      borderRadius: '12px',
                    }}
                  />
                )}

                {/* Content overlay */}
                <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  {/* New Badge */}
                  {isNew && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '-8px',
                        right: '-8px',
                        background: '#22c55e',
                        color: '#000',
                        padding: '2px 8px',
                        borderRadius: '10px',
                        fontSize: '10px',
                        fontWeight: 700,
                        zIndex: 2,
                      }}
                    >
                      NEW
                    </div>
                  )}

                  {/* Rarity Badge - only show if no card art */}
                  {!card.imageUrl && (
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        marginBottom: '8px',
                      }}
                    >
                      <span
                        style={{
                          padding: '2px 8px',
                          borderRadius: '4px',
                          background: rarity.border,
                          color: '#000',
                          fontSize: '10px',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                        }}
                      >
                        {rarity.name}
                      </span>
                    </div>
                  )}

                  {/* Player Image Placeholder (only if no image) */}
                  {!card.imageUrl && (
                    <div
                      style={{
                        height: '100px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '48px',
                        marginBottom: '12px',
                      }}
                    >
                      ⚽
                    </div>
                  )}

                  {/* Player Info - only show if no card art */}
                  {!card.imageUrl && (
                    <div style={{ textAlign: 'center', marginTop: 'auto' }}>
                      <div
                        style={{
                          color: '#fff',
                          fontWeight: 700,
                          fontSize: '14px',
                          marginBottom: '4px',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {card.playerName}
                      </div>
                      <div 
                        style={{ 
                          color: '#aaa', 
                          fontSize: '12px', 
                          marginBottom: '2px',
                        }}
                      >
                        {card.position}
                      </div>
                      <div 
                        style={{ 
                          color: '#888', 
                          fontSize: '11px',
                        }}
                      >
                        {card.team}
                      </div>
                    </div>
                  )}

                  
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
