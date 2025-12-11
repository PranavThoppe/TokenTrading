import { createPortal } from 'react-dom';
import { formatEther } from 'viem';
import type { PackType } from '@/types/contracts';

interface PurchaseConfirmationModalProps {
  pack: PackType;
  isOpen: boolean;
  isLoading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Modal component for confirming pack purchase
 */
export function PurchaseConfirmationModal({
  pack,
  isOpen,
  isLoading,
  onConfirm,
  onCancel,
}: PurchaseConfirmationModalProps) {
  console.log('Modal render - isOpen:', isOpen, 'pack:', pack);
  
  if (!isOpen) {
    return null;
  }

  const priceInEth = formatEther(pack.price);
  console.log('Modal is rendering with price:', priceInEth);

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 rounded-xl border border-white/10 p-8 max-w-md w-full mx-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-6 h-6 rounded bg-yellow-500/30 border border-yellow-500" />
          <h2 className="text-2xl font-bold text-white">Confirm Purchase</h2>
        </div>

        {/* Pack Details */}
        <div className="bg-slate-800/50 rounded-lg p-4 mb-6 border border-white/5">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-white/60">Pack</span>
              <span className="text-white font-semibold">{pack.name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/60">Cards</span>
              <span className="text-white font-semibold">{pack.cardCount}</span>
            </div>
            <div className="border-t border-white/10 pt-3 flex justify-between items-center">
              <span className="text-white/60">Total Cost</span>
              <span className="text-2xl font-bold text-violet-400">{priceInEth} ETH</span>
            </div>
          </div>
        </div>

        {/* Warning */}
        <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-3 mb-6">
          <p className="text-sm text-yellow-200">
            This transaction will be sent to your wallet for approval. Please review the details carefully.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 px-4 py-2 rounded-lg border border-white/20 text-white font-semibold transition-all duration-300 hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-violet-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Processing...' : 'Confirm Purchase'}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
