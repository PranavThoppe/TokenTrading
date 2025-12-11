import { useState, useEffect } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
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
  purchasePack: (packType: number, price: bigint) => Promise<void>;
}

/**
 * Hook to handle pack purchase transactions
 * Manages transaction state and confirmation
 */
export function usePurchasePack(): PurchasePackResult {
  const [status, setStatus] = useState<TransactionStatus>('idle');
  const [error, setError] = useState<Error | null>(null);
  const [hash, setHash] = useState<string | undefined>();

  const { writeContractAsync } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: hash as `0x${string}` | undefined,
  });

  const purchasePack = async (packType: number, price: bigint) => {
    try {
      console.log('Starting purchase transaction...');
      console.log('Pack type:', packType);
      console.log('Price:', price.toString());
      console.log('Contract address:', PACK_MANAGER_ADDRESS);
      
      setStatus('pending');
      setError(null);

      const txHash = await writeContractAsync({
        address: PACK_MANAGER_ADDRESS,
        abi: PACK_MANAGER_ABI,
        functionName: 'purchasePack',
        args: [packType],
        value: price,
      });

      console.log('Transaction sent! Hash:', txHash);
      setHash(txHash);
    } catch (err: any) {
      console.error('Purchase error:', err);
      console.error('Error details:', {
        message: err?.message,
        cause: err?.cause,
        shortMessage: err?.shortMessage,
        details: err?.details,
        metaMessages: err?.metaMessages,
      });
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      setStatus('error');
    }
  };

  // Update status based on confirmation state
  useEffect(() => {
    if (isConfirmed && status === 'pending') {
      console.log('Transaction confirmed! Setting status to success');
      setStatus('success');
    }
  }, [isConfirmed, status]);

  const isPending = status === 'pending';

  return {
    hash,
    status,
    error,
    isPending,
    isConfirming,
    isConfirmed,
    purchasePack,
  };
}
