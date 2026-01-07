import { useState, useEffect } from 'react';
import { getListedCards } from '../lib/api/trades';
import type { ListedCard } from '../lib/supabase';

// Mock data types for active trades - will be replaced with Supabase data later
interface ActiveTrade {
  id: string;
  status: 'pending' | 'accepted' | 'completed' | 'cancelled';
  initiatedBy: string;
  otherParty: string;
  yourCards: number[];
  theirCards: number[];
  createdAt: Date;
  updatedAt: Date;
}

// Card display interface (what renderCard expects)
interface CardDisplay {
  tokenId: number;
  playerName: string;
  position: string;
  team: string;
  rarity: number;
  imageUrl?: string;
}

interface ActiveTrade {
  id: string;
  status: 'pending' | 'accepted' | 'completed' | 'cancelled';
  initiatedBy: string;
  otherParty: string;
  yourCards: number[];
  theirCards: number[];
  createdAt: Date;
  updatedAt: Date;
}

const rarityColors: Record<number, { bg: string; border: string; glow: string; name: string }> = {
  0: { bg: '#374151', border: '#6b7280', glow: 'rgba(107, 114, 128, 0.3)', name: 'Common' },
  1: { bg: '#065f46', border: '#10b981', glow: 'rgba(16, 185, 129, 0.3)', name: 'Uncommon' },
  2: { bg: '#1e40af', border: '#3b82f6', glow: 'rgba(59, 130, 246, 0.3)', name: 'Rare' },
  3: { bg: '#581c87', border: '#a855f7', glow: 'rgba(168, 85, 247, 0.3)', name: 'Epic' },
  4: { bg: '#854d0e', border: '#eab308', glow: 'rgba(234, 179, 8, 0.4)', name: 'Legendary' },
};

// Mock data for active trades - will be replaced with real Supabase queries later
const mockActiveTrades: ActiveTrade[] = [
  {
    id: 'trade-1',
    status: 'pending',
    initiatedBy: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    otherParty: '0x987d35Cc6634C0532925a3b844Bc454e4438f44e',
    yourCards: [15, 22],
    theirCards: [8, 19],
    createdAt: new Date('2025-01-04T12:00:00Z'),
    updatedAt: new Date('2025-01-04T12:00:00Z'),
  },
];

export function Trades() {
  const [activeSection, setActiveSection] = useState<'listed' | 'trades'>('listed');
  const [listedCards, setListedCards] = useState<ListedCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchListedCards() {
      try {
        setIsLoading(true);
        setError(null);
        const cards = await getListedCards();
        setListedCards(cards);
      } catch (err) {
        console.error('Failed to fetch listed cards:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch listed cards');
      } finally {
        setIsLoading(false);
      }
    }

    fetchListedCards();
  }, []);

  const renderCard = (card: CardDisplay) => {
    const rarity = rarityColors[card.rarity] || rarityColors[0];

    return (
      <div
        key={card.tokenId}
        style={{
          background: card.imageUrl
            ? `url(${card.imageUrl}) center/cover no-repeat`
            : `linear-gradient(135deg, ${rarity.bg}, #1a1a2e)`,
          borderRadius: '12px',
          border: `2px solid ${rarity.border}`,
          boxShadow: `0 4px 12px ${rarity.glow}`,
          padding: '12px',
          position: 'relative',
          transition: 'transform 0.2s, box-shadow 0.2s',
          cursor: 'pointer',
          overflow: 'hidden',
          aspectRatio: '2/3',
          width: '100%',
          minHeight: '180px',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = `0 8px 24px ${rarity.glow}`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = `0 4px 12px ${rarity.glow}`;
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
                height: '80px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px',
                marginBottom: '8px',
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
                  fontSize: '12px',
                  marginBottom: '2px',
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
                  fontSize: '10px',
                  marginBottom: '2px',
                }}
              >
                {card.position}
              </div>
              <div
                style={{
                  color: '#888',
                  fontSize: '9px',
                }}
              >
                {card.team}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderListedCards = () => (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
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
          <h1 style={{ fontSize: '28px', marginBottom: '4px', color: '#fff' }}>Publicly Listed Cards</h1>
          <p style={{ color: '#888' }}>
            Cards other users have listed for trade
          </p>
        </div>
        <button
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
          List Your Card
        </button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
          <p style={{ color: '#888' }}>Loading listed cards...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div
          style={{
            textAlign: 'center',
            padding: '60px 20px',
            background: '#1a1a2e',
            borderRadius: '12px',
            border: '1px solid #dc2626',
          }}
        >
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>❌</div>
          <h2 style={{ color: '#f87171', fontSize: '20px', marginBottom: '8px' }}>Connection Error</h2>
          <p style={{ color: '#888', marginBottom: '16px' }}>{error}</p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '8px 16px',
              background: '#7c3aed',
              border: 'none',
              borderRadius: '6px',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '13px',
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && listedCards.length === 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: '60px 20px',
            background: '#1a1a2e',
            borderRadius: '12px',
            border: '1px solid #333',
          }}
        >
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>🔄</div>
          <h2 style={{ color: '#fff', fontSize: '20px', marginBottom: '8px' }}>No Cards Listed</h2>
          <p style={{ color: '#888', marginBottom: '24px' }}>
            Be the first to list a card for trade!
          </p>
        </div>
      )}

      {/* Cards Grid */}
      {!isLoading && !error && listedCards.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: '16px',
          }}
        >
          {listedCards.map((card) => (
            <div key={card.id}>
              {renderCard({
                tokenId: card.token_id,
                playerName: card.player_name,
                position: card.position || '',
                team: '', // Not in our schema yet
                rarity: card.rarity,
                imageUrl: undefined, // Not in our schema yet
              })}
              <div
                style={{
                  marginTop: '8px',
                  padding: '8px',
                  background: '#1a1a2e',
                  borderRadius: '6px',
                  border: '1px solid #333',
                }}
              >
                <div style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>
                  Listed by: {card.owner_address.slice(0, 6)}...{card.owner_address.slice(-4)}
                </div>
                <div style={{ fontSize: '11px', color: '#666' }}>
                  {new Date(card.listed_at).toLocaleDateString()}
                </div>
                <button
                  style={{
                    width: '100%',
                    marginTop: '8px',
                    padding: '6px',
                    background: '#7c3aed',
                    border: 'none',
                    borderRadius: '4px',
                    color: '#fff',
                    fontSize: '12px',
                    cursor: 'pointer',
                  }}
                >
                  Make Offer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderActiveTrades = () => (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
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
          <h1 style={{ fontSize: '28px', marginBottom: '4px', color: '#fff' }}>My Active Trades</h1>
          <p style={{ color: '#888' }}>
            Trades you're currently involved in
          </p>
        </div>
      </div>

      {/* Empty State */}
      {mockActiveTrades.length === 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: '60px 20px',
            background: '#1a1a2e',
            borderRadius: '12px',
            border: '1px solid #333',
          }}
        >
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>🤝</div>
          <h2 style={{ color: '#fff', fontSize: '20px', marginBottom: '8px' }}>No Active Trades</h2>
          <p style={{ color: '#888', marginBottom: '24px' }}>
            Browse listed cards to start trading!
          </p>
        </div>
      )}

      {/* Trades List */}
      {mockActiveTrades.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {mockActiveTrades.map((trade) => (
            <div
              key={trade.id}
              style={{
                background: '#1a1a2e',
                borderRadius: '12px',
                border: '1px solid #333',
                padding: '20px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ color: '#fff', margin: '0 0 4px 0' }}>
                    Trade with {trade.otherParty.slice(0, 6)}...{trade.otherParty.slice(-4)}
                  </h3>
                  <div style={{ fontSize: '12px', color: '#888' }}>
                    Status: <span style={{
                      color: trade.status === 'pending' ? '#eab308' :
                             trade.status === 'accepted' ? '#22c55e' :
                             trade.status === 'completed' ? '#3b82f6' : '#ef4444'
                    }}>
                      {trade.status.charAt(0).toUpperCase() + trade.status.slice(1)}
                    </span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '11px', color: '#666' }}>
                    Created: {trade.createdAt.toLocaleDateString()}
                  </div>
                  <div style={{ fontSize: '11px', color: '#666' }}>
                    Updated: {trade.updatedAt.toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <h4 style={{ color: '#fff', fontSize: '14px', margin: '0 0 8px 0' }}>You Offer:</h4>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {trade.yourCards.map((tokenId) => (
                      <div key={tokenId} style={{ width: '60px' }}>
                        {renderCard({
                          tokenId,
                          playerName: `Card ${tokenId}`,
                          position: 'POS',
                          team: 'TEAM',
                          rarity: Math.floor(Math.random() * 5),
                        })}
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ fontSize: '24px', color: '#666' }}>↔️</div>

                <div style={{ flex: 1 }}>
                  <h4 style={{ color: '#fff', fontSize: '14px', margin: '0 0 8px 0' }}>They Offer:</h4>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {trade.theirCards.map((tokenId) => (
                      <div key={tokenId} style={{ width: '60px' }}>
                        {renderCard({
                          tokenId,
                          playerName: `Card ${tokenId}`,
                          position: 'POS',
                          team: 'TEAM',
                          rarity: Math.floor(Math.random() * 5),
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '16px', justifyContent: 'flex-end' }}>
                {trade.status === 'pending' && (
                  <>
                    <button
                      style={{
                        padding: '8px 16px',
                        background: '#dc2626',
                        border: 'none',
                        borderRadius: '6px',
                        color: '#fff',
                        fontSize: '12px',
                        cursor: 'pointer',
                      }}
                    >
                      Cancel Trade
                    </button>
                    <button
                      style={{
                        padding: '8px 16px',
                        background: '#7c3aed',
                        border: 'none',
                        borderRadius: '6px',
                        color: '#fff',
                        fontSize: '12px',
                        cursor: 'pointer',
                      }}
                    >
                      Accept Trade
                    </button>
                  </>
                )}
                {trade.status === 'accepted' && (
                  <button
                    style={{
                      padding: '8px 16px',
                      background: '#22c55e',
                      border: 'none',
                      borderRadius: '6px',
                      color: '#fff',
                      fontSize: '12px',
                      cursor: 'pointer',
                    }}
                  >
                    Execute Trade
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div>
      {/* Section Tabs */}
      <div
        style={{
          background: '#1a1a2e',
          borderBottom: '1px solid #333',
          padding: '0 24px',
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'flex',
            gap: '8px',
          }}
        >
          <button
            onClick={() => setActiveSection('listed')}
            style={{
              padding: '12px 20px',
              background: 'transparent',
              border: 'none',
              borderBottom: activeSection === 'listed' ? '2px solid #7c3aed' : '2px solid transparent',
              color: activeSection === 'listed' ? '#fff' : '#888',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'color 0.2s',
            }}
          >
            Listed Cards ({listedCards.length})
          </button>
          <button
            onClick={() => setActiveSection('trades')}
            style={{
              padding: '12px 20px',
              background: 'transparent',
              border: 'none',
              borderBottom: activeSection === 'trades' ? '2px solid #7c3aed' : '2px solid transparent',
              color: activeSection === 'trades' ? '#fff' : '#888',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'color 0.2s',
            }}
          >
            My Trades ({mockActiveTrades.length})
          </button>
        </div>
      </div>

      {/* Content */}
      {activeSection === 'listed' ? renderListedCards() : renderActiveTrades()}
    </div>
  );
}
