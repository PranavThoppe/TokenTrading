import { useReadContract, useWriteContract, useWatchContractEvent } from 'wagmi';
import { CARD_NFT_ABI } from '@/lib/abis';
import { CARD_NFT_ADDRESS } from '@/lib/contracts';
import type { Address } from 'viem';

/**
 * Hook to read from CardNFT contract
 */
export function useReadCardNFT<T = unknown>(
  functionName: string,
  args?: unknown[],
) {
  return useReadContract({
    address: CARD_NFT_ADDRESS,
    abi: CARD_NFT_ABI,
    functionName,
    args,
  }) as { data: T; isLoading: boolean; error: Error | null };
}

/**
 * Hook to write to CardNFT contract
 */
export function useWriteCardNFT() {
  return useWriteContract();
}

/**
 * Hook to watch CardNFT contract events
 */
export function useWatchCardNFTEvent(
  eventName: string,
  onLogs: (logs: unknown[]) => void,
) {
  return useWatchContractEvent({
    address: CARD_NFT_ADDRESS,
    abi: CARD_NFT_ABI,
    eventName,
    onLogs,
  });
}

/**
 * Hook to get balance of NFTs for an address
 */
export function useCardBalance(address: Address | undefined) {
  return useReadContract({
    address: CARD_NFT_ADDRESS,
    abi: CARD_NFT_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });
}

/**
 * Hook to get token URI for a specific token
 */
export function useTokenURI(tokenId: bigint | undefined) {
  return useReadContract({
    address: CARD_NFT_ADDRESS,
    abi: CARD_NFT_ABI,
    functionName: 'tokenURI',
    args: tokenId !== undefined ? [tokenId] : undefined,
    query: {
      enabled: tokenId !== undefined,
    },
  });
}

/**
 * Hook to get owner of a specific token
 */
export function useTokenOwner(tokenId: bigint | undefined) {
  return useReadContract({
    address: CARD_NFT_ADDRESS,
    abi: CARD_NFT_ABI,
    functionName: 'ownerOf',
    args: tokenId !== undefined ? [tokenId] : undefined,
    query: {
      enabled: tokenId !== undefined,
    },
  });
}
