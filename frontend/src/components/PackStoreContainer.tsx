import { useState } from 'react';
import { PackStore } from './PackStore';
import { PurchaseConfirmationModal } from './PurchaseConfirmationModal';
import { usePackTypes } from '@/hooks/usePackTypes';
import { usePurchasePack } from '@/hooks/usePurchasePack';
import type { PackType } from '@/types/contracts';

interface PackStoreContainerProps {
  onNavigateToOpenPacks?: () => void;
}

/**
 * Container component that manages pack store state and interactions
 */
export function PackStoreContainer({ onNavigateToOpenPacks }: PackStoreContainerProps) {
  const { packs, isLoading, error: packError } = usePackTypes();
  const { purchasePack, status, hash, isPending } = usePurchasePack();

  // No need to track requestId locally - contract now tracks user's pending packs

  const [selectedPack, setSelectedPack] = useState<PackType | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handlePurchaseClick = async (packType: number) => {
    console.log('handlePurchaseClick called with packType:', packType);
    console.log('Available packs:', packs);
    const pack = packs.find((p) => p.id === packType);
    console.log('Found pack:', pack);
    if (pack) {
      setSelectedPack(pack);
      // Skip modal, trigger MetaMask directly
      console.log('Triggering purchase for pack:', pack.id, 'price:', pack.price.toString());
      await purchasePack(pack.id, pack.price);
    }
  };

  const handleConfirmPurchase = async () => {
    if (selectedPack) {
      await purchasePack(selectedPack.id, selectedPack.price);
      setShowConfirmation(false);
    }
  };

  const handleCancelPurchase = () => {
    setShowConfirmation(false);
    setSelectedPack(null);
  };

  return (
    <>
      <PackStore
        packs={packs}
        isLoading={isLoading}
        error={packError}
        onPurchase={handlePurchaseClick}
        isPurchasing={isPending}
      />

      {selectedPack && (
        <PurchaseConfirmationModal
          pack={selectedPack}
          isOpen={showConfirmation}
          isLoading={isPending}
          onConfirm={handleConfirmPurchase}
          onCancel={handleCancelPurchase}
        />
      )}

      {/* Transaction Status Banner - Using inline styles */}
      {status !== 'idle' && (
        <div style={{
          position: 'fixed',
          top: '80px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 99999,
          padding: '16px 24px',
          borderRadius: '12px',
          backgroundColor: status === 'pending' ? '#2563eb' : status === 'success' ? '#16a34a' : '#dc2626',
          boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          color: 'white',
          fontWeight: 600,
        }}>
          {status === 'pending' && (
            <>
              <div style={{
                width: '20px',
                height: '20px',
                border: '3px solid white',
                borderTopColor: 'transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
              }} />
              <span>Transaction Pending...</span>
            </>
          )}
          {status === 'success' && (
            <>
              <span style={{ fontSize: '24px' }}>✅</span>
              <div>
                <div>Pack Purchased Successfully!</div>
                <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
                  {hash && (
                    <a
                      href={`https://sepolia.etherscan.io/tx/${hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: '14px',
                        color: 'rgba(255,255,255,0.8)',
                        textDecoration: 'underline',
                      }}
                    >
                      View on Etherscan →
                    </a>
                  )}
                  {onNavigateToOpenPacks && (
                    <button
                      onClick={onNavigateToOpenPacks}
                      style={{
                        fontSize: '14px',
                        color: 'white',
                        background: 'rgba(255,255,255,0.2)',
                        border: 'none',
                        padding: '4px 12px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                      }}
                    >
                      Open Pack →
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
          {status === 'error' && (
            <>
              <span style={{ fontSize: '24px' }}>❌</span>
              <span>Transaction Failed</span>
            </>
          )}
        </div>
      )}
    </>
  );
}
