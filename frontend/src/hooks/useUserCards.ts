import { useEffect, useCallback } from 'react';
import { useAccount, usePublicClient } from 'wagmi';
import { CARD_NFT_ABI } from '@/lib/abis';
import { CARD_NFT_ADDRESS } from '@/lib/contracts';
import { useCollectionStore } from '@/store/collectionStore';
import type { Card, Rarity } from '@/types/contracts';
import type { Address } from 'viem';
import { fetchIPFSMetadata, ipfsToHttp } from '@/utils/contractHelpers';

interface CardMetadataResult {
  playerId: bigint;
  rarity: number;
  mintTimestamp: bigint;
  metadataURI: string;
}

// Mock player data - in production this would come from IPFS or an API
const mockPlayerData: Record<string, { name: string; position: string; team: string; rating: number }> = {
  '1': { name: 'Patrick Mahomes', position: 'QB', team: 'Kansas City Chiefs', rating: 99 },
  '2': { name: 'Josh Allen', position: 'QB', team: 'Buffalo Bills', rating: 95 },
  '3': { name: 'Lamar Jackson', position: 'QB', team: 'Baltimore Ravens', rating: 94 },
  '4': { name: 'Aaron Donald', position: 'DT', team: 'Los Angeles Rams', rating: 98 },
  '5': { name: 'Travis Kelce', position: 'TE', team: 'Kansas City Chiefs', rating: 97 },
  '6': { name: 'Tyreek Hill', position: 'WR', team: 'Miami Dolphins', rating: 96 },
  '7': { name: 'Christian McCaffrey', position: 'RB', team: 'San Francisco 49ers', rating: 95 },
  '8': { name: 'Myles Garrett', position: 'DE', team: 'Cleveland Browns', rating: 96 },
  '9': { name: 'Justin Jefferson', position: 'WR', team: 'Minnesota Vikings', rating: 97 },
  '10': { name: 'T.J. Watt', position: 'OLB', team: 'Pittsburgh Steelers', rating: 95 },
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

  // Fetch card metadata for a single token
  const fetchCardMetadata = useCallback(async (tokenId: bigint): Promise<Card | null> => {
    if (!publicClient || !address) return null;

    try {
      // First verify ownership - if not owned, skip immediately
      let owner: Address;
      try {
        owner = await publicClient.readContract({
          address: CARD_NFT_ADDRESS,
          abi: CARD_NFT_ABI,
          functionName: 'ownerOf',
          args: [tokenId],
        }) as Address;
      } catch (ownerError: any) {
        // Token might not exist or have been burned
        if (ownerError.message?.includes('nonexistent token') || ownerError.message?.includes('does not exist')) {
          console.warn(`[useUserCards] Token ${tokenId.toString()} does not exist`);
          return null;
        }
        throw ownerError;
      }

      if (owner.toLowerCase() !== address.toLowerCase()) {
        console.warn(`[useUserCards] Token ${tokenId.toString()} is not owned by user (owner: ${owner})`);
        return null;
      }

      // Fetch metadata
      const metadata = await publicClient.readContract({
        address: CARD_NFT_ADDRESS,
        abi: CARD_NFT_ABI,
        functionName: 'getCardMetadata',
        args: [tokenId],
      }) as CardMetadataResult;

      // Fetch tokenURI to get metadata JSON location
      let imageUrl = '';
      try {
        const tokenURI = await publicClient.readContract({
          address: CARD_NFT_ADDRESS,
          abi: CARD_NFT_ABI,
          functionName: 'tokenURI',
          args: [tokenId],
        }) as string;

        console.log(`[useUserCards] Token ${tokenId.toString()} tokenURI:`, tokenURI);

        if (tokenURI) {
          const ipfsMetadata = await fetchIPFSMetadata(tokenURI);
          console.log(`[useUserCards] Token ${tokenId.toString()} IPFS metadata:`, ipfsMetadata);
          
          if (ipfsMetadata?.image) {
            imageUrl = ipfsMetadata.image;
            console.log(`[useUserCards] Token ${tokenId.toString()} image from metadata:`, imageUrl);
            
            // Convert ipfs:// to HTTP if needed (use first gateway)
            // If already HTTP, use as-is
            if (imageUrl.startsWith('ipfs://')) {
              const gateways = ipfsToHttp(imageUrl);
              imageUrl = gateways[0] || imageUrl;
              console.log(`[useUserCards] Token ${tokenId.toString()} converted image URL:`, imageUrl);
            } else if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
              // Already HTTP, use as-is
              console.log(`[useUserCards] Token ${tokenId.toString()} image URL is already HTTP:`, imageUrl);
            } else {
              console.warn(`[useUserCards] Token ${tokenId.toString()} image URL has unexpected format:`, imageUrl);
            }
          } else {
            console.warn(`[useUserCards] Token ${tokenId.toString()} metadata has no image field. Metadata keys:`, ipfsMetadata ? Object.keys(ipfsMetadata) : 'null');
          }
        } else {
          console.warn(`[useUserCards] Token ${tokenId.toString()} has no tokenURI`);
        }
      } catch (err) {
        console.error(`[useUserCards] Failed to fetch image for token ${tokenId.toString()}:`, err);
        // Continue without image - will show placeholder
      }

      const playerData = getPlayerData(metadata.playerId.toString());

      const card = {
        tokenId,
        playerId: metadata.playerId.toString(),
        playerName: playerData.name,
        position: playerData.position,
        team: playerData.team,
        rarity: metadata.rarity as Rarity,
        imageUrl, // Now contains the image URL or empty string
        stats: {
          touchdowns: Math.floor(Math.random() * 50),
          passingYards: Math.floor(Math.random() * 5000),
          rating: playerData.rating,
        },
        owner: address,
        mintTimestamp: Number(metadata.mintTimestamp),
        metadataUri: metadata.metadataURI,
      };

      // Log final card data for debugging
      if (tokenId.toString() === '2' || tokenId.toString() === '13') {
        console.log(`[useUserCards] Final card data for token ${tokenId.toString()}:`, {
          tokenId: card.tokenId.toString(),
          playerId: card.playerId,
          playerName: card.playerName,
          imageUrl: card.imageUrl,
          metadataUri: card.metadataUri,
        });
      }

      return card;
    } catch (err) {
      console.error(`[useUserCards] Error fetching card metadata for token ${tokenId.toString()}:`, err);
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

      // Fetch cards with small delay between each to avoid rate limiting
      const results: (Card | null)[] = [];
      for (let i = 0; i < ids.length; i++) {
        const result = await fetchCardMetadata(ids[i]);
        results.push(result);
        // Small delay between fetches to avoid rate limiting (except for last one)
        if (i < ids.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }
      
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

    // Final attempt - return whatever we got (with delays)
    const results: (Card | null)[] = [];
    for (let i = 0; i < ids.length; i++) {
      const result = await fetchCardMetadata(ids[i]);
      results.push(result);
      // Small delay between fetches to avoid rate limiting (except for last one)
      if (i < ids.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
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
      // First, get the user's balance to verify we got all tokens
      const balance = await publicClient.readContract({
        address: CARD_NFT_ADDRESS,
        abi: CARD_NFT_ABI,
        functionName: 'balanceOf',
        args: [address],
      }) as bigint;

      console.log(`[useUserCards] User balance: ${balance.toString()}`);

      // Try to fetch from block 0 first (all history)
      // If that fails due to RPC limits, fall back to a larger range
      let fromBlock = 0n;
      let receivedLogs: any[] = [];
      let sentLogs: any[] = [];

      // RPC providers often limit block ranges (e.g., 10,000 blocks on free tier)
      // Use pagination to fetch all events in chunks
      const MAX_BLOCK_RANGE = 9000n; // Stay under 10k limit
      const currentBlock = await publicClient.getBlockNumber();
      
      // Start from the most recent blocks and work backwards
      let toBlock = currentBlock;
      let allReceivedLogs: any[] = [];
      let allSentLogs: any[] = [];
      let hasMoreBlocks = true;
      let iterations = 0;
      let consecutiveEmptyBlocks = 0;
      const MAX_ITERATIONS = 100; // Safety limit to prevent infinite loops
      const MAX_CONSECUTIVE_EMPTY = 5; // Stop after 5 consecutive empty blocks

      console.log(`[useUserCards] Starting paginated fetch from block ${currentBlock.toString()}...`);

      while (hasMoreBlocks && iterations < MAX_ITERATIONS) {
        iterations++;
        fromBlock = toBlock > MAX_BLOCK_RANGE ? toBlock - MAX_BLOCK_RANGE : 0n;
        
        try {
          const [batchReceived, batchSent] = await Promise.all([
            publicClient.getLogs({
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
              toBlock: toBlock === currentBlock ? 'latest' : toBlock,
            }),
            publicClient.getLogs({
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
              toBlock: toBlock === currentBlock ? 'latest' : toBlock,
            }),
          ]);

          const hasEvents = batchReceived.length > 0 || batchSent.length > 0;
          
          if (hasEvents) {
            consecutiveEmptyBlocks = 0; // Reset counter when we find events
            allReceivedLogs.push(...batchReceived);
            allSentLogs.push(...batchSent);
            console.log(`[useUserCards] Fetched blocks ${fromBlock.toString()} to ${toBlock.toString()}: ${batchReceived.length} received, ${batchSent.length} sent`);
          } else {
            consecutiveEmptyBlocks++;
            if (consecutiveEmptyBlocks >= MAX_CONSECUTIVE_EMPTY) {
              console.log(`[useUserCards] Stopping early: ${consecutiveEmptyBlocks} consecutive empty blocks. Found ${allReceivedLogs.length} received, ${allSentLogs.length} sent events.`);
              hasMoreBlocks = false;
              break;
            }
          }

          // Move to next chunk (going backwards)
          if (fromBlock === 0n) {
            hasMoreBlocks = false;
          } else {
            toBlock = fromBlock - 1n;
          }
        } catch (error: any) {
          // Check if it's a block range limit error
          const isRangeError = error.message?.includes('ranges over') || error.message?.includes('not supported');
          
          if (isRangeError && toBlock - fromBlock > 1000n) {
            // Try a smaller chunk if we hit a range limit
            console.warn(`[useUserCards] Block range too large, trying smaller chunk from ${fromBlock.toString()} to ${toBlock.toString()}`);
            const chunkSize = (toBlock - fromBlock) / 2n;
            toBlock = fromBlock + chunkSize;
            // Don't increment iterations since we're retrying the same range
            iterations--;
            continue;
          }
          
          console.warn(`[useUserCards] Error fetching blocks ${fromBlock.toString()} to ${toBlock.toString()}:`, error.message);
          
          // If we're at block 0 or very close, stop
          if (fromBlock === 0n || toBlock - fromBlock <= 100n) {
            hasMoreBlocks = false;
          } else {
            // Move to next chunk anyway - don't let one error stop the whole process
            // Just reduce the chunk size
            const chunkSize = toBlock - fromBlock;
            if (chunkSize > 1000n) {
              toBlock = fromBlock + chunkSize / 2n;
              iterations--; // Retry with smaller chunk
              continue;
            } else {
              // Very small chunk failed, move on
              toBlock = fromBlock - 1n;
            }
          }
        }
      }

      receivedLogs = allReceivedLogs;
      sentLogs = allSentLogs;
      console.log(`[useUserCards] Total fetched: ${receivedLogs.length} received, ${sentLogs.length} sent across ${iterations} iterations`);

      // Calculate owned tokens
      const receivedIds = new Set(receivedLogs.map(log => (log.args.tokenId as bigint).toString()));
      const sentIds = new Set(sentLogs.map(log => (log.args.tokenId as bigint).toString()));
      
      const ownedIds = [...receivedIds].filter(id => !sentIds.has(id)).map(id => BigInt(id));

      console.log(`[useUserCards] Calculated owned tokens: ${ownedIds.length} (balance: ${balance.toString()})`);

      // Verify we got all tokens (balance should match)
      if (BigInt(ownedIds.length) !== balance) {
        const missingCount = balance - BigInt(ownedIds.length);
        console.warn(
          `[useUserCards] Mismatch: Found ${ownedIds.length} tokens via events, but balanceOf returns ${balance.toString()}. ` +
          `Missing ${missingCount.toString()} token(s). Some tokens may have been minted/transferred before the queried block range ` +
          `(${fromBlock === 0n ? 'reached block 0' : `stopped at block ${fromBlock.toString()}`}).`
        );
      }

      // Fetch metadata for all owned tokens with small delay to avoid rate limiting
      const fetchedCards = await fetchCardsByIds(ownedIds);
      
      // Final verification: filter out any cards that don't actually belong to the user
      // (in case of edge cases with event filtering)
      const verifiedCards = fetchedCards.filter(card => card !== null);
      
      console.log(`[useUserCards] Successfully fetched ${verifiedCards.length} cards`);
      setCards(verifiedCards);
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
