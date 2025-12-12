import { useState, useCallback } from 'react';
import { PackOpening } from './PackOpening';
import { usePendingPacks, type PendingPackData } from '@/hooks/usePendingPacks';
import { useCollectionStore } from '@/store/collectionStore';

interface PackOpeningContainerProps {
  onViewCollection?: () => void;
  onNavigateToStore?: () => void;
}

const packNames: Record<number, string> = {
  0: 'Starter Pack',
  1: 'Standard Pack',
  2: 'Premium Pack',
};

export function PackOpeningContainer({ onViewCollection, onNavigateToStore }: PackOpeningContainerProps) {
  const { pendingPacks, isLoading, refetch } = usePendingPacks();
  const { markCardsAsNew } = useCollectionStore();

  const [selectedPack, setSelectedPack] = useState<PendingPackData | null>(null);

  const handlePackOpened = useCallback(
    (tokenIds: bigint[]) => {
      if (tokenIds.length > 0) {
        markCardsAsNew(tokenIds);
      }
      refetch();
    },
    [refetch, markCardsAsNew],
  );

  const handleViewCollection = () => {
    onViewCollection?.();
  };

  const activePack =
    selectedPack || pendingPacks.find((p) => p.fulfilled) || pendingPacks[0] || null;

  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '28px', marginBottom: '8px', color: '#fff' }}>Open Packs</h1>
      <p style={{ color: '#aaa', marginBottom: '24px' }}>
        Open your purchased packs to reveal new cards
      </p>

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        {/* Packs List */}
        <div
          style={{
            flex: '1',
            minWidth: '280px',
            background: '#1a1a2e',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid #333',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px',
            }}
          >
            <h2 style={{ fontSize: '18px', color: '#fff', margin: 0 }}>Your Packs</h2>
            <button
              onClick={() => refetch()}
              style={{
                padding: '6px 12px',
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

          {isLoading ? (
            <p style={{ color: '#888' }}>Loading...</p>
          ) : pendingPacks.length === 0 ? (
            <p style={{ color: '#888' }}>No packs. Purchase one from the store!</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {pendingPacks.map((pack) => {
                const isSelected = activePack?.requestId === pack.requestId;
                return (
                  <button
                    key={pack.requestId.toString()}
                    onClick={() => setSelectedPack(pack)}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 16px',
                      background: isSelected ? '#2d2d4a' : '#252538',
                      border: isSelected ? '2px solid #7c3aed' : '2px solid transparent',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <div>
                      <div style={{ color: '#fff', fontWeight: 600, fontSize: '14px' }}>
                        {packNames[pack.packType] || 'Pack'}
                      </div>
                      <div style={{ color: '#888', fontSize: '12px' }}>
                        ID: {pack.requestId.toString().slice(0, 10)}...
                      </div>
                    </div>
                    <div
                      style={{
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: 600,
                        background: pack.fulfilled ? '#166534' : '#854d0e',
                        color: pack.fulfilled ? '#4ade80' : '#fbbf24',
                      }}
                    >
                      {pack.fulfilled ? 'Ready' : 'Pending'}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Stats */}
          <div
            style={{
              marginTop: '20px',
              paddingTop: '16px',
              borderTop: '1px solid #333',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#fff' }}>
                {pendingPacks.length}
              </div>
              <div style={{ fontSize: '12px', color: '#888' }}>Total</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#4ade80' }}>
                {pendingPacks.filter((p) => p.fulfilled).length}
              </div>
              <div style={{ fontSize: '12px', color: '#888' }}>Ready</div>
            </div>
          </div>
        </div>

        {/* Pack Opening Area */}
        <div
          style={{
            flex: '2',
            minWidth: '320px',
            background: '#1a1a2e',
            borderRadius: '12px',
            padding: '24px',
            border: '1px solid #333',
            minHeight: '400px',
          }}
        >
          <PackOpening
            pendingPack={activePack}
            onPackOpened={handlePackOpened}
            onViewCollection={handleViewCollection}
            onNavigateToStore={onNavigateToStore}
          />
        </div>
      </div>
    </div>
  );
}
