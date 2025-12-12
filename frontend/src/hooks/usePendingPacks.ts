import { useState, useEffect, useCallback } from 'react';
import { useAccount, useReadContract, usePublicClient } from 'wagmi';
import { PACK_MANAGER_ABI } from '@/lib/abis';
import { PACK_MANAGER_ADDRESS } from '@/lib/contracts';
import type { Address } from 'viem';

export interface PendingPackData {
  requestId: bigint;
  packType: number;
  buyer: Address;
  playerIds: bigint[];
  rarities: number[];
  fulfilled: boolean;
}

interface UsePendingPacksResult {
  pendingPacks: PendingPackData[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Hook to fetch and track pending packs for the connected user
 * Uses the contract's getUserPendingPacks function - no localStorage needed
 */
export function usePendingPacks(): UsePendingPacksResult {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const [pendingPacks, setPendingPacks] = useState<PendingPackData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Fetch pending pack data for a specific request ID
  const fetchPendingPack = useCallback(
    async (requestId: bigint): Promise<PendingPackData | null> => {
      if (!publicClient) return null;

      try {
        const result = (await publicClient.readContract({
          address: PACK_MANAGER_ADDRESS,
          abi: PACK_MANAGER_ABI,
          functionName: 'getPendingPack',
          args: [requestId],
        })) as {
          buyer: Address;
          packType: number;
          playerIds: bigint[];
          rarities: number[];
          fulfilled: boolean;
        };

        return {
          requestId,
          buyer: result.buyer,
          packType: result.packType,
          playerIds: result.playerIds || [],
          rarities: result.rarities || [],
          fulfilled: result.fulfilled,
        };
      } catch (err) {
        console.error('Error fetching pending pack:', requestId.toString(), err);
        return null;
      }
    },
    [publicClient],
  );

  // Fetch all pending packs for the user from the contract
  const fetchPendingPacks = useCallback(async () => {
    if (!address || !publicClient) {
      setPendingPacks([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get all request IDs for this user directly from the contract
      const requestIds = (await publicClient.readContract({
        address: PACK_MANAGER_ADDRESS,
        abi: PACK_MANAGER_ABI,
        functionName: 'getUserPendingPacks',
        args: [address],
      })) as bigint[];

      console.log('User pending pack IDs from contract:', requestIds.map((id) => id.toString()));

      if (requestIds.length === 0) {
        setPendingPacks([]);
        return;
      }

      // Fetch pack data for each request ID
      const packs = await Promise.all(requestIds.map((id) => fetchPendingPack(id)));

      // Filter out any null results
      const validPacks = packs.filter((p): p is PendingPackData => p !== null);

      console.log('Found pending packs:', validPacks.length);
      setPendingPacks(validPacks);
    } catch (err) {
      console.error('Error fetching pending packs:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch pending packs'));
    } finally {
      setIsLoading(false);
    }
  }, [address, publicClient, fetchPendingPack]);

  // Fetch on mount and when address changes
  useEffect(() => {
    fetchPendingPacks();
  }, [fetchPendingPacks]);

  return {
    pendingPacks,
    isLoading,
    error,
    refetch: fetchPendingPacks,
  };
}

/**
 * Hook to get a single pending pack by request ID
 */
export function usePendingPack(requestId: bigint | undefined) {
  const { data, isLoading, error, refetch } = useReadContract({
    address: PACK_MANAGER_ADDRESS,
    abi: PACK_MANAGER_ABI,
    functionName: 'getPendingPack',
    args: requestId ? [requestId] : undefined,
    query: {
      enabled: !!requestId,
    },
  });

  const pendingPack: PendingPackData | null = data
    ? {
        requestId: requestId!,
        buyer: (data as any).buyer,
        packType: (data as any).packType,
        playerIds: (data as any).playerIds,
        rarities: (data as any).rarities,
        fulfilled: (data as any).fulfilled,
      }
    : null;

  return {
    pendingPack,
    isLoading,
    error,
    refetch,
  };
}
