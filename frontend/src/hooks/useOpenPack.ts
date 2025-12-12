import { useState, useEffect } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { PACK_MANAGER_ABI } from '@/lib/abis';
import { PACK_MANAGER_ADDRESS } from '@/lib/contracts';
import type { TransactionStatus } from '@/types/contracts';

interface OpenPackResult {
  hash: string | undefined;
  status: TransactionStatus;
  error: Error | null;
  isPending: boolean;
  isConfirming: boolean;
  isConfirmed: boolean;
  mintedTokenIds: bigint[];
  openPack: (requestId: bigint) => Promise<void>;
  reset: () => void;
}

/**
 * Hook to handle pack opening transactions
 * Manages transaction state and returns minted token IDs
 */
export function useOpenPack(): OpenPackResult {
  const [status, setStatus] = useState<TransactionStatus>('idle');
  const [error, setError] = useState<Error | null>(null);
  const [hash, setHash] = useState<string | undefined>();
  const [mintedTokenIds, setMintedTokenIds] = useState<bigint[]>([]);

  const { writeContractAsync } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed, data: receipt } = useWaitForTransactionReceipt({
    hash: hash as `0x${string}` | undefined,
  });

  const openPack = async (requestId: bigint) => {
    try {
      console.log('Starting pack opening transaction...');
      console.log('Request ID:', requestId.toString());
      console.log('Contract address:', PACK_MANAGER_ADDRESS);
      
      setStatus('pending');
      setError(null);
      setMintedTokenIds([]);

      const txHash = await writeContractAsync({
        address: PACK_MANAGER_ADDRESS,
        abi: PACK_MANAGER_ABI,
        functionName: 'openPack',
        args: [requestId],
      });

      console.log('Transaction sent! Hash:', txHash);
      setHash(txHash);
    } catch (err: unknown) {
      console.error('Open pack error:', err);
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      setStatus('error');
    }
  };

  const reset = () => {
    setStatus('idle');
    setError(null);
    setHash(undefined);
    setMintedTokenIds([]);
  };

  // Update status based on confirmation state
  useEffect(() => {
    if (isConfirmed && status === 'pending') {
      console.log('Pack opening confirmed!');
      setStatus('success');
      
      // Parse PackOpened event from receipt to get token IDs
      if (receipt?.logs) {
        // The PackOpened event has tokenIds as the third indexed parameter
        // We'll need to decode the logs to get the actual token IDs
        console.log('Transaction receipt logs:', receipt.logs);
      }
    }
  }, [isConfirmed, status, receipt]);

  const isPending = status === 'pending';

  return {
    hash,
    status,
    error,
    isPending,
    isConfirming,
    isConfirmed,
    mintedTokenIds,
    openPack,
    reset,
  };
}
