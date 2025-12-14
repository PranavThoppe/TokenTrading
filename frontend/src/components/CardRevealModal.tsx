import { useState, useEffect } from 'react';
import type { Card } from '@/types/contracts';

interface CardRevealModalProps {
  isOpen: boolean;
  cards: Card[];
  onClose: () => void;
  onViewCollection?: () => void;
}

type RevealPhase = 'pack' | 'burst' | 'cards' | 'done';

const rarityColors: Record<number, { bg: string; border: string; glow: string; name: string }> = {
  0: { bg: '#374151', border: '#6b7280', glow: 'rgba(107, 114, 128, 0.5)', name: 'Common' },
  1: { bg: '#065f46', border: '#10b981', glow: 'rgba(16, 185, 129, 0.5)', name: 'Uncommon' },
  2: { bg: '#1e40af', border: '#3b82f6', glow: 'rgba(59, 130, 246, 0.5)', name: 'Rare' },
  3: { bg: '#581c87', border: '#a855f7', glow: 'rgba(168, 85, 247, 0.5)', name: 'Epic' },
  4: { bg: '#854d0e', border: '#eab308', glow: 'rgba(234, 179, 8, 0.6)', name: 'Legendary' },
};

export function CardRevealModal({ isOpen, cards, onClose, onViewCollection }: CardRevealModalProps) {
  const [phase, setPhase] = useState<RevealPhase>('pack');
  const [revealedIndices, setRevealedIndices] = useState<Set<number>>(new Set());
  const [currentRevealIndex, setCurrentRevealIndex] = useState(0);

  console.log('[CardRevealModal] Render:', { isOpen, cardsCount: cards.length, phase });

  // Reset state when modal opens
  useEffect(() => {
    console.log('[CardRevealModal] Effect - isOpen:', isOpen, 'cards:', cards.length);
    if (isOpen && cards.length > 0) {
      setPhase('pack');
      setRevealedIndices(new Set());
      setCurrentRevealIndex(0);

      // Pack animation: shake for 1.5s, then burst
      const burstTimer = setTimeout(() => setPhase('burst'), 1500);
      const cardsTimer = setTimeout(() => setPhase('cards'), 2000);

      return () => {
        clearTimeout(burstTimer);
        clearTimeout(cardsTimer);
      };
    }
  }, [isOpen, cards]);

  // Auto-reveal cards one by one
  useEffect(() => {
    if (phase !== 'cards' || currentRevealIndex >= cards.length) {
      if (phase === 'cards' && currentRevealIndex >= cards.length) {
        setPhase('done');
      }
      return;
    }

    const timer = setTimeout(() => {
      setRevealedIndices((prev) => new Set([...prev, currentRevealIndex]));
      setCurrentRevealIndex((prev) => prev + 1);
    }, 400);

    return () => clearTimeout(timer);
  }, [phase, currentRevealIndex, cards.length]);

  const handleViewCollection = () => {
    onViewCollection?.();
    onClose();
  };

  if (!isOpen) {
    console.log('[CardRevealModal] Not rendering - isOpen is false');
    return null;
  }

  console.log('[CardRevealModal] RENDERING MODAL CONTENT - phase:', phase);

  const modalContent = (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.95)',
      }}
    >
      {/* Pack Opening Animation */}
      {(phase === 'pack' || phase === 'burst') && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            animation: phase === 'pack' ? 'packShake 0.1s infinite' : 'packBurst 0.5s forwards',
          }}
        >
          <div
            style={{
              width: '200px',
              height: '260px',
              background: 'linear-gradient(135deg, #7c3aed, #a855f7, #c084fc)',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '80px',
              boxShadow:
                phase === 'pack'
                  ? '0 0 60px rgba(124, 58, 237, 0.8), 0 0 120px rgba(168, 85, 247, 0.4)'
                  : '0 0 100px rgba(255, 255, 255, 0.9)',
              border: '4px solid rgba(255, 255, 255, 0.3)',
            }}
          >
            📦
          </div>
          <p
            style={{
              color: '#fff',
              marginTop: '24px',
              fontSize: '18px',
              fontWeight: 600,
            }}
          >
            {phase === 'pack' ? 'Opening pack...' : '✨'}
          </p>
        </div>
      )}

      {/* Cards Reveal */}
      {(phase === 'cards' || phase === 'done') && (
        <div
          style={{
            background: '#1a1a2e',
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '900px',
            width: '95%',
            maxHeight: '90vh',
            overflow: 'auto',
            border: '1px solid #333',
            animation: 'fadeIn 0.3s ease-out',
          }}
        >
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <h2 style={{ color: '#fff', fontSize: '28px', marginBottom: '8px' }}>
              🎉 You got {cards.length} cards!
            </h2>
          </div>

          {/* Cards Grid */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '16px',
              justifyContent: 'center',
              marginBottom: '24px',
            }}
          >
            {cards.map((card, index) => {
              const isRevealed = revealedIndices.has(index);
              const rarity = rarityColors[card.rarity] || rarityColors[0];

              return (
                <div
                  key={card.tokenId.toString()}
                  style={{
                    width: '140px',
                    height: '200px',
                    perspective: '1000px',
                    opacity: phase === 'cards' && !isRevealed && index > currentRevealIndex ? 0.3 : 1,
                    transform:
                      phase === 'cards' && !isRevealed && index > currentRevealIndex
                        ? 'scale(0.9)'
                        : 'scale(1)',
                    transition: 'opacity 0.3s, transform 0.3s',
                  }}
                >
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      position: 'relative',
                      transformStyle: 'preserve-3d',
                      transition: 'transform 0.6s',
                      transform: isRevealed ? 'rotateY(180deg)' : 'rotateY(0deg)',
                    }}
                  >
                    {/* Card Back */}
                    <div
                      style={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        backfaceVisibility: 'hidden',
                        background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '3px solid #9333ea',
                        boxShadow: '0 4px 20px rgba(124, 58, 237, 0.4)',
                      }}
                    >
                      <div style={{ fontSize: '40px' }}>❓</div>
                    </div>

                    {/* Card Front */}
                    <div
                      style={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        backfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)',
                        background: `linear-gradient(135deg, ${rarity.bg}, #1a1a2e)`,
                        borderRadius: '12px',
                        border: `3px solid ${rarity.border}`,
                        boxShadow: `0 4px 20px ${rarity.glow}`,
                        padding: '10px',
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                    >
                      {/* Rarity Badge */}
                      <div
                        style={{
                          alignSelf: 'flex-end',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          background: rarity.border,
                          color: '#000',
                          fontSize: '9px',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                        }}
                      >
                        {rarity.name}
                      </div>

                      {/* Player Image Placeholder */}
                      <div
                        style={{
                          flex: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '36px',
                        }}
                      >
                        ⚽
                      </div>

                      {/* Player Info */}
                      <div style={{ textAlign: 'center' }}>
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
                        <div style={{ color: '#aaa', fontSize: '10px' }}>{card.position}</div>
                        <div style={{ color: '#888', fontSize: '9px' }}>{card.team}</div>
                      </div>

                      {/* Token ID */}
                      <div
                        style={{
                          marginTop: '6px',
                          textAlign: 'center',
                          padding: '3px',
                          background: 'rgba(0,0,0,0.3)',
                          borderRadius: '4px',
                          fontSize: '9px',
                          color: '#666',
                        }}
                      >
                        #{card.tokenId.toString()}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Button */}
          {phase === 'done' && (
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button
                onClick={handleViewCollection}
                style={{
                  padding: '14px 32px',
                  background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '16px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 4px 20px rgba(124, 58, 237, 0.4)',
                }}
              >
                View My Collection →
              </button>
            </div>
          )}
        </div>
      )}

      {/* Animations */}
      <style>{`
        @keyframes packShake {
          0%, 100% { transform: translateX(0) rotate(0deg); }
          25% { transform: translateX(-5px) rotate(-2deg); }
          75% { transform: translateX(5px) rotate(2deg); }
        }
        @keyframes packBurst {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.3); opacity: 1; }
          100% { transform: scale(2); opacity: 0; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );

  // Render directly without portal to debug
  return modalContent;
}
