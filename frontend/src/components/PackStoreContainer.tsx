import { useState } from 'react';
import { PackStore } from './PackStore';
import { PurchaseConfirmationModal } from './PurchaseConfirmationModal';
import { TransactionNotification } from './TransactionNotification';
import { usePackTypes } from '@/hooks/usePackTypes';
import { usePurchasePack } from '@/hooks/usePurchasePack';
import type { PackType } from '@/types/contracts';

/**
 * Container component that manages pack store state and interactions
 */
export function PackStoreContainer() {
  const { packs, isLoading, error: packError } = usePackTypes();
  const { purchasePack, status, error, hash, isPending, isConfirming, isConfirmed } =
    usePurchasePack();

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

      <TransactionNotification
        status={status}
        hash={hash}
        error={error}
        isConfirming={isConfirming}
        onClose={() => {
          if (isConfirmed) {
            setSelectedPack(null);
          }
        }}
      />
    </>
  );
}
