import { useEffect, useState } from 'react';
import type { TransactionStatus } from '@/types/contracts';

interface TransactionNotificationProps {
  status: TransactionStatus;
  hash?: string;
  error?: Error | null;
  isConfirming?: boolean;
  onClose?: () => void;
}

/**
 * Component to display transaction status notifications
 */
export function TransactionNotification({
  status,
  hash,
  error,
  isConfirming = false,
  onClose,
}: TransactionNotificationProps) {
  const [dismissed, setDismissed] = useState(false);
  const [lastHash, setLastHash] = useState<string | undefined>();

  // Reset dismissed state when a new transaction starts (new hash)
  useEffect(() => {
    if (hash && hash !== lastHash) {
      setDismissed(false);
      setLastHash(hash);
    }
  }, [hash, lastHash]);

  // Auto-dismiss after success
  useEffect(() => {
    if (status === 'success' && !dismissed) {
      const timer = setTimeout(() => {
        setDismissed(true);
        onClose?.();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [status, dismissed, onClose]);

  // Don't show if idle or dismissed
  const shouldShow = status !== 'idle' && !dismissed;
  
  console.log('TransactionNotification:', { status, hash, dismissed, shouldShow });

  if (!shouldShow) {
    return null;
  }

  const blockExplorerUrl = `https://sepolia.etherscan.io/tx/${hash}`;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] max-w-sm" style={{ backgroundColor: 'red', padding: '20px' }}>
      <div
        className={`rounded-lg p-4 shadow-lg border ${
          status === 'pending'
            ? 'bg-blue-900/20 border-blue-500/50'
            : status === 'success'
              ? 'bg-green-900/20 border-green-500/50'
              : 'bg-red-900/20 border-red-500/50'
        }`}
      >
        <div className="flex items-start gap-3">
          {status === 'pending' ? (
            <div className="w-5 h-5 rounded-full border-2 border-blue-400 border-t-transparent animate-spin flex-shrink-0 mt-0.5" />
          ) : status === 'success' ? (
            <div className="w-5 h-5 rounded-full bg-green-500/30 border border-green-500 flex-shrink-0 mt-0.5" />
          ) : (
            <div className="w-5 h-5 rounded-full bg-red-500/30 border border-red-500 flex-shrink-0 mt-0.5" />
          )}

          <div className="flex-1">
            <h3 className="font-semibold text-white mb-1">
              {status === 'pending'
                ? isConfirming
                  ? 'Confirming Transaction'
                  : 'Transaction Pending'
                : status === 'success'
                  ? 'Transaction Successful'
                  : 'Transaction Failed'}
            </h3>

            {hash && (
              <a
                href={blockExplorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-400 hover:text-blue-300 break-all"
              >
                {hash.slice(0, 10)}...{hash.slice(-8)}
              </a>
            )}

            {error && (
              <p className="text-sm text-red-300 mt-1">
                {error.message || 'An error occurred'}
              </p>
            )}

            {status === 'pending' && (
              <p className="text-xs text-white/60 mt-1">
                {isConfirming ? 'Waiting for confirmation...' : 'Waiting for network...'}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
