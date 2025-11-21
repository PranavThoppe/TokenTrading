import { useReadContract, useWriteContract, useWatchContractEvent } from 'wagmi';
import { PACK_MANAGER_ABI } from '@/lib/abis';
import { PACK_MANAGER_ADDRESS } from '@/lib/contracts';
import type { Address } from 'viem';

/**
 * Hook to read from PackManager contract
 */
export function useReadPackManager<T = unknown>(
  functionName: string,
  args?: unknown[],
) {
  return useReadContract({
    address: PACK_MANAGER_ADDRESS,
    abi: PACK_MANAGER_ABI,
    functionName,
    args,
  }) as { data: T; isLoading: boolean; error: Error | null };
}

/**
 * Hook to write to PackManager contract
 */
export function useWritePackManager() {
  return useWriteContract();
}

/**
 * Hook to watch PackManager contract events
 */
export function useWatchPackManagerEvent(
  eventName: string,
  onLogs: (logs: unknown[]) => void,
) {
  return useWatchContractEvent({
    address: PACK_MANAGER_ADDRESS,
    abi: PACK_MANAGER_ABI,
    eventName,
    onLogs,
  });
}

/**
 * Hook to get pack type configuration
 */
export function usePackType(packTypeId: number | undefined) {
  return useReadContract({
    address: PACK_MANAGER_ADDRESS,
    abi: PACK_MANAGER_ABI,
    functionName: 'packTypes',
    args: packTypeId !== undefined ? [packTypeId] : undefined,
    query: {
      enabled: packTypeId !== undefined,
    },
  });
}

/**
 * Hook to get pending pack for a user
 */
export function usePendingPack(address: Address | undefined, requestId: string | undefined) {
  return useReadContract({
    address: PACK_MANAGER_ADDRESS,
    abi: PACK_MANAGER_ABI,
    functionName: 'pendingPacks',
    args: address && requestId ? [address, requestId] : undefined,
    query: {
      enabled: !!(address && requestId),
    },
  });
}
