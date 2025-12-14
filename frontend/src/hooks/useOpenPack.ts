import { useState, useEffect } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { decodeEventLog } from 'viem';
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
      setStatus('pending');
      setError(null);
      setMintedTokenIds([]);

      const txHash = await writeContractAsync({
        address: PACK_MANAGER_ADDRESS,
        abi: PACK_MANAGER_ABI,
        functionName: 'openPack',
        args: [requestId],
      });

      setHash(txHash);
    } catch (err: unknown) {
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

  // Parse PackOpened event when transaction is confirmed
  useEffect(() => {
    console.log('[useOpenPack] Effect triggered:', { isConfirmed, hasReceipt: !!receipt, status });
    
    if (isConfirmed && receipt && status === 'pending') {
      console.log('[useOpenPack] Transaction confirmed, parsing logs...', { 
        logsCount: receipt.logs.length,
        contractAddress: PACK_MANAGER_ADDRESS 
      });
      
      let foundTokenIds: bigint[] = [];
      
      // Find the PackOpened event in the logs
      for (const log of receipt.logs) {
        console.log('[useOpenPack] Checking log:', { 
          logAddress: log.address, 
          isOurContract: log.address.toLowerCase() === PACK_MANAGER_ADDRESS.toLowerCase() 
        });
        
        try {
          if (log.address.toLowerCase() !== PACK_MANAGER_ADDRESS.toLowerCase()) {
            continue;
          }

          const decoded = decodeEventLog({
            abi: PACK_MANAGER_ABI,
            data: log.data,
            topics: log.topics,
          });

          console.log('[useOpenPack] Decoded event:', decoded.eventName);

          if (decoded.eventName === 'PackOpened') {
            const args = decoded.args as unknown as { tokenIds: bigint[] };
            foundTokenIds = args.tokenIds;
            console.log('[useOpenPack] Found PackOpened event! Token IDs:', args.tokenIds.map(id => id.toString()));
            setMintedTokenIds(args.tokenIds);
            break;
          }
        } catch (e) {
          console.log('[useOpenPack] Could not decode log:', e);
        }
      }
      
      if (foundTokenIds.length === 0) {
        console.warn('[useOpenPack] No PackOpened event found in logs!');
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
    mintedTokenIds,
    openPack,
    reset,
  };
}
