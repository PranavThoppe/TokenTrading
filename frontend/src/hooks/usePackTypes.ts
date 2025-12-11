import { useEffect, useState } from 'react';
import { useReadContract } from 'wagmi';
import { PACK_MANAGER_ABI } from '@/lib/abis';
import { PACK_MANAGER_ADDRESS } from '@/lib/contracts';
import type { PackType } from '@/types/contracts';

/**
 * Hook to fetch all available pack types from the contract
 * Fetches pack data with caching via wagmi
 */
export function usePackTypes() {
  const [packs, setPacks] = useState<PackType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Only enable queries if we have a valid contract address
  const isEnabled = !!PACK_MANAGER_ADDRESS && PACK_MANAGER_ADDRESS !== '';

  // Fetch pack type 0
  const pack0 = useReadContract({
    address: PACK_MANAGER_ADDRESS,
    abi: PACK_MANAGER_ABI,
    functionName: 'getPackConfig',
    args: [0],
    query: { enabled: isEnabled },
  });

  // Fetch pack type 1
  const pack1 = useReadContract({
    address: PACK_MANAGER_ADDRESS,
    abi: PACK_MANAGER_ABI,
    functionName: 'getPackConfig',
    args: [1],
    query: { enabled: isEnabled },
  });

  // Fetch pack type 2
  const pack2 = useReadContract({
    address: PACK_MANAGER_ADDRESS,
    abi: PACK_MANAGER_ABI,
    functionName: 'getPackConfig',
    args: [2],
    query: { enabled: isEnabled },
  });

  useEffect(() => {
    if (!isEnabled) {
      setError(new Error('Contract address not configured'));
      setIsLoading(false);
      return;
    }

    const allLoading = pack0.isLoading || pack1.isLoading || pack2.isLoading;
    const allError = pack0.error || pack1.error || pack2.error;

    if (allError) {
      setError(allError as Error);
      setIsLoading(false);
      return;
    }

    if (allLoading) {
      setIsLoading(true);
      return;
    }

    // Build packs array from successful responses
    const fetchedPacks: PackType[] = [];

    if (pack0.data) {
      fetchedPacks.push(buildPackType(0, pack0.data));
    }
    if (pack1.data) {
      fetchedPacks.push(buildPackType(1, pack1.data));
    }
    if (pack2.data) {
      fetchedPacks.push(buildPackType(2, pack2.data));
    }

    setPacks(fetchedPacks);
    setIsLoading(false);
  }, [isEnabled, pack0.data, pack0.isLoading, pack0.error, pack1.data, pack1.isLoading, pack1.error, pack2.data, pack2.isLoading, pack2.error]);

  return {
    packs,
    isLoading,
    error,
  };
}

/**
 * Build a PackType object from contract data
 * Contract returns: { price: bigint, cardCount: number, rarityWeights: number[] }
 */
function buildPackType(
  id: number,
  data: { price: bigint; cardCount: number; rarityWeights: readonly number[] } | undefined
): PackType {
  if (!data || !data.price || data.price === 0n) {
    return {
      id,
      name: `Pack ${id + 1}`,
      price: 0n,
      cardCount: 0,
      rarityWeights: [40, 30, 20, 8, 2],
      active: false,
    };
  }

  const { price, cardCount, rarityWeights } = data;

  // Pack names based on ID
  const packNames = ['Starter Pack', 'Standard Pack', 'Premium Pack'];

  return {
    id,
    name: packNames[id] || `Pack ${id + 1}`,
    price,
    cardCount,
    rarityWeights: Array.from(rarityWeights),
    active: true,
  };
}
