import { useState, useEffect } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, usePublicClient } from 'wagmi';
import { decodeEventLog } from 'viem';
import { PACK_MANAGER_ABI } from '@/lib/abis';
import { PACK_MANAGER_ADDRESS } from '@/lib/contracts';
import type { TransactionStatus } from '@/types/contracts';

interface PurchasePackResult {
  hash: string | undefined;
  status: TransactionStatus;
  error: Error | null;
  isPending: boolean;
  isConfirming: boolean;
  isConfirmed: boolean;
  requestId: bigint | undefined;
  purchasePack: (packType: number, price: bigint) => Promise<void>;
  reset: () => void;
}

/**
 * Hook to handle pack purchase transactions
 * Manages transaction state and confirmation, extracts requestId from events
 */
export function usePurchasePack(): PurchasePackResult {
  const [status, setStatus] = useState<TransactionStatus>('idle');
  const [error, setError] = useState<Error | null>(null);
  const [hash, setHash] = useState<string | undefined>();
  const [requestId, setRequestId] = useState<bigint | undefined>();

  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    data: receipt,
  } = useWaitForTransactionReceipt({
    hash: hash as `0x${string}` | undefined,
  });

  const purchasePack = async (packType: number, price: bigint) => {
    try {
      setStatus('pending');
      setError(null);
      setRequestId(undefined);

      const txHash = await writeContractAsync({
        address: PACK_MANAGER_ADDRESS,
        abi: PACK_MANAGER_ABI,
        functionName: 'purchasePack',
        args: [packType],
        value: price,
      });

      setHash(txHash);
    } catch (err: unknown) {
      console.error('Purchase error:', err);
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      setStatus('error');
    }
  };

  const reset = () => {
    setStatus('idle');
    setError(null);
    setHash(undefined);
    setRequestId(undefined);
  };

  // Extract requestId from transaction receipt when confirmed
  useEffect(() => {
    if (isConfirmed && receipt && status === 'pending') {
      // Find the PackPurchased event in the logs
      for (const log of receipt.logs) {
        try {
          // Check if this log is from our contract
          if (log.address.toLowerCase() !== PACK_MANAGER_ADDRESS.toLowerCase()) {
            continue;
          }

          const decoded = decodeEventLog({
            abi: PACK_MANAGER_ABI,
            data: log.data,
            topics: log.topics,
          });

          if (decoded.eventName === 'PackPurchased') {
            const args = decoded.args as { requestId: bigint };
            setRequestId(args.requestId);
            break;
          }
        } catch {
          // Not a PackPurchased event, continue
        }
      }

      setStatus('success');
    }
  }, [isConfirmed, receipt, status]);

  const isPending = status === 'pending';

  return {
    hash,
    status,
    error,
    isPending,
    isConfirming,
    isConfirmed,
    requestId,
    purchasePack,
    reset,
  };
}
