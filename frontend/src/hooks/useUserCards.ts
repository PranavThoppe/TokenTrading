import { useState, useEffect, useCallback } from 'react';
import { useAccount, usePublicClient } from 'wagmi';
import { CARD_NFT_ABI } from '@/lib/abis';
import { CARD_NFT_ADDRESS } from '@/lib/contracts';
import { useCollectionStore } from '@/store/collectionStore';
import type { Card, Rarity } from '@/types/contracts';
import type { Address } from 'viem';

interface CardMetadataResult {
  playerId: bigint;
  rarity: number;
  mintTimestamp: bigint;
  metadataURI: string;
}

// Mock player data - in production this would come from IPFS or an API
const mockPlayerData: Record<string, { name: string; position: string; team: string; rating: number }> = {
  '1': { name: 'Lionel Messi', position: 'Forward', team: 'Inter Miami', rating: 93 },
  '2': { name: 'Cristiano Ronaldo', position: 'Forward', team: 'Al Nassr', rating: 91 },
  '3': { name: 'Kylian Mbappé', position: 'Forward', team: 'Real Madrid', rating: 92 },
  '4': { name: 'Erling Haaland', position: 'Forward', team: 'Man City', rating: 91 },
  '5': { name: 'Kevin De Bruyne', position: 'Midfielder', team: 'Man City', rating: 91 },
  '6': { name: 'Jude Bellingham', position: 'Midfielder', team: 'Real Madrid', rating: 89 },
  '7': { name: 'Vinícius Jr', position: 'Forward', team: 'Real Madrid', rating: 89 },
  '8': { name: 'Rodri', position: 'Midfielder', team: 'Man City', rating: 89 },
  '9': { name: 'Bukayo Saka', position: 'Forward', team: 'Arsenal', rating: 87 },
  '10': { name: 'Phil Foden', position: 'Midfielder', team: 'Man City', rating: 87 },
};

function getPlayerData(playerId: string) {
  return mockPlayerData[playerId] || {
    name: `Player #${playerId}`,
    position: 'Unknown',
    team: 'Unknown',
    rating: 70,
  };
}

interface UseUserCardsResult {
  cards: Card[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  fetchCardsByIds: (tokenIds: bigint[]) => Promise<Card[]>;
}

/**
 * Hook to fetch and manage user's card collection
 */
export function useUserCards(): UseUserCardsResult {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { cards, setCards, setLoading, setError, isLoading, error } = useCollectionStore();
  const [tokenIds, setTokenIds] = useState<bigint[]>([]);

  // Fetch card metadata for a single token
  const fetchCardMetadata = useCallback(async (tokenId: bigint): Promise<Card | null> => {
    if (!publicClient || !address) return null;

    try {
      const metadata = await publicClient.readContract({
        address: CARD_NFT_ADDRESS,
        abi: CARD_NFT_ABI,
        functionName: 'getCardMetadata',
        args: [tokenId],
      }) as CardMetadataResult;

      // Verify ownership
      const owner = await publicClient.readContract({
        address: CARD_NFT_ADDRESS,
        abi: CARD_NFT_ABI,
        functionName: 'ownerOf',
        args: [tokenId],
      }) as Address;

      if (owner.toLowerCase() !== address.toLowerCase()) {
        return null;
      }

      const playerData = getPlayerData(metadata.playerId.toString());

      return {
        tokenId,
        playerId: metadata.playerId.toString(),
        playerName: playerData.name,
        position: playerData.position,
        team: playerData.team,
        rarity: metadata.rarity as Rarity,
        imageUrl: '', // Would come from IPFS
        stats: {
          goals: Math.floor(Math.random() * 30),
          assists: Math.floor(Math.random() * 20),
          rating: playerData.rating,
        },
        owner: address,
        mintTimestamp: Number(metadata.mintTimestamp),
        metadataUri: metadata.metadataURI,
      };
    } catch (err) {
      console.error('Error fetching card metadata:', err);
      return null;
    }
  }, [publicClient, address]);

  // Fetch cards by specific token IDs with retry logic
  const fetchCardsByIds = useCallback(async (ids: bigint[], retries = 3, delayMs = 2000): Promise<Card[]> => {
    if (!publicClient || !address || ids.length === 0) return [];

    // Helper to delay
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    // Try fetching with retries
    for (let attempt = 0; attempt < retries; attempt++) {
      if (attempt > 0) {
        console.log(`[useUserCards] Retry attempt ${attempt + 1}/${retries} after ${delayMs}ms delay...`);
        await delay(delayMs);
      }

      const cardPromises = ids.map(id => fetchCardMetadata(id));
      const results = await Promise.all(cardPromises);
      const validCards = results.filter((card): card is Card => card !== null);

      // If we got all cards, return them
      if (validCards.length === ids.length) {
        console.log(`[useUserCards] Successfully fetched all ${validCards.length} cards`);
        return validCards;
      }

      // If we got some cards, log which ones are missing
      if (validCards.length > 0) {
        const foundIds = new Set(validCards.map(c => c.tokenId.toString()));
        const missingIds = ids.filter(id => !foundIds.has(id.toString()));
        console.log(`[useUserCards] Got ${validCards.length}/${ids.length} cards. Missing: ${missingIds.map(id => id.toString()).join(', ')}`);
      }
    }

    // Final attempt - return whatever we got
    const cardPromises = ids.map(id => fetchCardMetadata(id));
    const results = await Promise.all(cardPromises);
    return results.filter((card): card is Card => card !== null);
  }, [publicClient, address, fetchCardMetadata]);

  // Fetch all user's cards by scanning Transfer events
  const fetchUserCards = useCallback(async () => {
    if (!address || !publicClient) {
      setCards([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get current block and limit range to 9000 blocks (under free tier limit)
      const currentBlock = await publicClient.getBlockNumber();
      const fromBlock = currentBlock > 9000n ? currentBlock - 9000n : 0n;



      // Get Transfer events where user received tokens
      const receivedLogs = await publicClient.getLogs({
        address: CARD_NFT_ADDRESS,
        event: {
          type: 'event',
          name: 'Transfer',
          inputs: [
            { name: 'from', type: 'address', indexed: true },
            { name: 'to', type: 'address', indexed: true },
            { name: 'tokenId', type: 'uint256', indexed: true },
          ],
        },
        args: {
          to: address,
        },
        fromBlock,
        toBlock: 'latest',
      });

      // Get Transfer events where user sent tokens
      const sentLogs = await publicClient.getLogs({
        address: CARD_NFT_ADDRESS,
        event: {
          type: 'event',
          name: 'Transfer',
          inputs: [
            { name: 'from', type: 'address', indexed: true },
            { name: 'to', type: 'address', indexed: true },
            { name: 'tokenId', type: 'uint256', indexed: true },
          ],
        },
        args: {
          from: address,
        },
        fromBlock,
        toBlock: 'latest',
      });

      // Calculate owned tokens
      const receivedIds = new Set(receivedLogs.map(log => (log.args.tokenId as bigint).toString()));
      const sentIds = new Set(sentLogs.map(log => (log.args.tokenId as bigint).toString()));
      
      const ownedIds = [...receivedIds].filter(id => !sentIds.has(id)).map(id => BigInt(id));
      setTokenIds(ownedIds);

      // Fetch metadata for all owned tokens
      const fetchedCards = await fetchCardsByIds(ownedIds);
      setCards(fetchedCards);
    } catch (err) {
      console.error('Error fetching user cards:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch cards'));
    } finally {
      setLoading(false);
    }
  }, [address, publicClient, setCards, setLoading, setError, fetchCardsByIds]);

  // Initial fetch
  useEffect(() => {
    fetchUserCards();
  }, [fetchUserCards]);

  // Note: Event watching disabled to avoid RPC rate limits on free tier
  // Use refetch() to manually refresh the collection after opening packs

  return {
    cards,
    isLoading,
    error,
    refetch: fetchUserCards,
    fetchCardsByIds,
  };
}
