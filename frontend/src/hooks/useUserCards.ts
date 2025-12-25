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

// Batch size for parallel fetching (adjust based on RPC limits)
const BATCH_SIZE = 10;

/**
 * Hook to fetch and manage user's card collection
 */
export function useUserCards(): UseUserCardsResult {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { 
    cards, 
    setCards, 
    setLoading, 
    setError, 
    isLoading, 
    error, 
    lastScannedBlock, 
    setLastScannedBlock,
    loadFromCache,
    saveToCache,
  } = useCollectionStore();

  // Fetch card metadata for a single token (optimized with batched contract calls)
  const fetchCardMetadata = useCallback(async (tokenId: bigint): Promise<Card | null> => {
    if (!publicClient || !address) return null;

    try {
      // Batch all contract calls for this token in parallel
      const [ownerResult, metadataResult, tokenURIResult] = await Promise.allSettled([
        publicClient.readContract({
          address: CARD_NFT_ADDRESS,
          abi: CARD_NFT_ABI,
          functionName: 'ownerOf',
          args: [tokenId],
        }),
        publicClient.readContract({
          address: CARD_NFT_ADDRESS,
          abi: CARD_NFT_ABI,
          functionName: 'getCardMetadata',
          args: [tokenId],
        }),
        publicClient.readContract({
          address: CARD_NFT_ADDRESS,
          abi: CARD_NFT_ABI,
          functionName: 'tokenURI',
          args: [tokenId],
        }),
      ]);

      // Check ownership first
      if (ownerResult.status === 'rejected') {
        const error = ownerResult.reason as any;
        if (error.message?.includes('nonexistent token') || error.message?.includes('does not exist')) {
          return null;
        }
        throw error;
      }

      const owner = ownerResult.value as Address;
      if (owner.toLowerCase() !== address.toLowerCase()) {
        return null;
      }

      // Get metadata
      if (metadataResult.status === 'rejected') {
        throw metadataResult.reason;
      }
      const metadata = metadataResult.value as CardMetadataResult;

      // Fetch image URL if tokenURI is available
      let imageUrl = '';
      if (tokenURIResult.status === 'fulfilled' && tokenURIResult.value) {
        try {
          const tokenURI = tokenURIResult.value as string;
          if (tokenURI) {
            const ipfsMetadata = await fetchIPFSMetadata(tokenURI);
            if (ipfsMetadata?.image) {
              imageUrl = ipfsMetadata.image;
              if (imageUrl.startsWith('ipfs://')) {
                const gateways = ipfsToHttp(imageUrl);
                imageUrl = gateways[0] || imageUrl;
              }
            }
          }
        } catch (err) {
          console.error(`[useUserCards] Failed to fetch image for token ${tokenId.toString()}:`, err);
          // Continue without image
        }
      }

      const playerData = getPlayerData(metadata.playerId.toString());

      return {
        tokenId,
        playerId: metadata.playerId.toString(),
        playerName: playerData.name,
        position: playerData.position,
        team: playerData.team,
        rarity: metadata.rarity as Rarity,
        imageUrl,
        stats: {
          touchdowns: Math.floor(Math.random() * 50),
          passingYards: Math.floor(Math.random() * 5000),
          rating: playerData.rating,
        },
        owner: address,
        mintTimestamp: Number(metadata.mintTimestamp),
        metadataUri: metadata.metadataURI,
      };
    } catch (err) {
      console.error(`[useUserCards] Error fetching card metadata for token ${tokenId.toString()}:`, err);
      return null;
    }
  }, [publicClient, address]);

  // Fetch cards by specific token IDs in parallel batches (REMOVED DELAYS)
  const fetchCardsByIds = useCallback(async (ids: bigint[]): Promise<Card[]> => {
    if (!publicClient || !address || ids.length === 0) return [];

    // Process in batches to avoid overwhelming the RPC
    const results: Card[] = [];
    for (let i = 0; i < ids.length; i += BATCH_SIZE) {
      const batch = ids.slice(i, i + BATCH_SIZE);
      const batchResults = await Promise.all(
        batch.map(id => fetchCardMetadata(id))
      );
      results.push(...batchResults.filter((card): card is Card => card !== null));
      
      // Small delay between batches only (reduced from 200ms to 50ms)
      if (i + BATCH_SIZE < ids.length) {
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    }

    return results;
  }, [publicClient, address, fetchCardMetadata]);

  // Fetch all user's cards by scanning Transfer events
  const fetchUserCards = useCallback(async (forceRefresh = false) => {
    if (!address || !publicClient) {
      setCards([]);
      return;
    }

    // Load cached cards immediately if available and not forcing refresh
    if (!forceRefresh) {
      const cached = loadFromCache(address);
      if (cached && cards.length > 0) {
        console.log(`[useUserCards] Loaded ${cards.length} cards from cache, refreshing in background...`);
        // Don't set loading to true immediately - show cached data first
      }
    }

    setLoading(true);
    setError(null);

    try {
      // Get user's balance
      const balance = await publicClient.readContract({
        address: CARD_NFT_ADDRESS,
        abi: CARD_NFT_ABI,
        functionName: 'balanceOf',
        args: [address],
      }) as bigint;

      console.log(`[useUserCards] User balance: ${balance.toString()}`);

      // If balance is 0, clear cards and return
      if (balance === 0n) {
        setCards([]);
        setLastScannedBlock(null);
        if (address) saveToCache(address);
        return;
      }

      const MAX_BLOCK_RANGE = 9000n;
      const currentBlock = await publicClient.getBlockNumber();
      
      // Start from cached block if available, otherwise from current block
      let toBlock = currentBlock;
      let startFromBlock = 0n;
      if (!forceRefresh && lastScannedBlock && lastScannedBlock > 0n) {
        // Only scan new blocks since last scan
        const blocksSinceLastScan = currentBlock - lastScannedBlock;
        if (blocksSinceLastScan < MAX_BLOCK_RANGE && blocksSinceLastScan > 0n) {
          startFromBlock = lastScannedBlock;
          console.log(`[useUserCards] Resuming from cached block ${lastScannedBlock.toString()}, scanning ${blocksSinceLastScan.toString()} new blocks`);
        }
      }

      let allReceivedLogs: any[] = [];
      let allSentLogs: any[] = [];
      let hasMoreBlocks = true;
      let iterations = 0;
      let consecutiveEmptyBlocks = 0;
      const MAX_ITERATIONS = 200;
      const MAX_CONSECUTIVE_EMPTY = 10;

      // If we have cached cards and are only scanning new blocks, we need to merge with existing
      const existingTokenIds = new Set(cards.map(c => c.tokenId.toString()));

      console.log(`[useUserCards] Starting paginated fetch from block ${startFromBlock.toString()} to ${toBlock.toString()}...`);

      while (hasMoreBlocks && iterations < MAX_ITERATIONS) {
        iterations++;
        const fromBlock = toBlock > MAX_BLOCK_RANGE ? toBlock - MAX_BLOCK_RANGE : startFromBlock;
        
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
            consecutiveEmptyBlocks = 0;
            allReceivedLogs.push(...batchReceived);
            allSentLogs.push(...batchSent);
            console.log(`[useUserCards] Fetched blocks ${fromBlock.toString()} to ${toBlock.toString()}: ${batchReceived.length} received, ${batchSent.length} sent`);
          } else {
            consecutiveEmptyBlocks++;
            if (consecutiveEmptyBlocks >= MAX_CONSECUTIVE_EMPTY && (allReceivedLogs.length > 0 || allSentLogs.length > 0)) {
              console.log(`[useUserCards] Stopping early: ${consecutiveEmptyBlocks} consecutive empty blocks`);
              hasMoreBlocks = false;
              break;
            }
          }

          if (fromBlock === startFromBlock || fromBlock === 0n) {
            hasMoreBlocks = false;
          } else {
            toBlock = fromBlock - 1n;
          }
        } catch (error: any) {
          const isRangeError = error.message?.includes('ranges over') || error.message?.includes('not supported');
          
          if (isRangeError && toBlock - fromBlock > 1000n) {
            const chunkSize = (toBlock - fromBlock) / 2n;
            toBlock = fromBlock + chunkSize;
            iterations--;
            continue;
          }
          
          console.warn(`[useUserCards] Error fetching blocks ${fromBlock.toString()} to ${toBlock.toString()}:`, error.message);
          
          if (fromBlock === startFromBlock || fromBlock === 0n || toBlock - fromBlock <= 100n) {
            hasMoreBlocks = false;
          } else {
            const chunkSize = toBlock - fromBlock;
            if (chunkSize > 1000n) {
              toBlock = fromBlock + chunkSize / 2n;
              iterations--;
              continue;
            } else {
              toBlock = fromBlock - 1n;
            }
          }
        }
      }

      console.log(`[useUserCards] Total fetched: ${allReceivedLogs.length} received, ${allSentLogs.length} sent`);

      // Calculate owned tokens
      const receivedIds = new Set(allReceivedLogs.map(log => (log.args.tokenId as bigint).toString()));
      const sentIds = new Set(allSentLogs.map(log => (log.args.tokenId as bigint).toString()));
      
      let ownedIds = [...receivedIds].filter(id => !sentIds.has(id)).map(id => BigInt(id));

      // If we have cached cards, merge the token IDs
      if (!forceRefresh && existingTokenIds.size > 0) {
        const cachedIds = Array.from(existingTokenIds).map(id => BigInt(id));
        const newIds = ownedIds.filter(id => !existingTokenIds.has(id.toString()));
        console.log(`[useUserCards] Found ${newIds.length} new tokens since last scan`);
        ownedIds = [...cachedIds, ...newIds];
      }

      console.log(`[useUserCards] Calculated owned tokens: ${ownedIds.length} (balance: ${balance.toString()})`);

      // Handle missing tokens if balance doesn't match
      if (BigInt(ownedIds.length) !== balance && balance - BigInt(ownedIds.length) <= 20n) {
        const missingCount = balance - BigInt(ownedIds.length);
        console.log(`[useUserCards] Attempting to find ${missingCount.toString()} missing token(s)...`);
        
        const allSeenTokenIds = new Set<string>();
        allReceivedLogs.forEach(log => allSeenTokenIds.add((log.args.tokenId as bigint).toString()));
        allSentLogs.forEach(log => allSeenTokenIds.add((log.args.tokenId as bigint).toString()));
        
        const missingTokens: bigint[] = [];
        const checkPromises = Array.from(allSeenTokenIds)
          .filter(id => !ownedIds.some(oid => oid.toString() === id))
          .slice(0, Number(missingCount))
          .map(async (tokenIdStr) => {
            try {
              const owner = await publicClient.readContract({
                address: CARD_NFT_ADDRESS,
                abi: CARD_NFT_ABI,
                functionName: 'ownerOf',
                args: [BigInt(tokenIdStr)],
              }) as Address;
              
              if (owner.toLowerCase() === address.toLowerCase()) {
                return BigInt(tokenIdStr);
              }
            } catch (err) {
              // Token doesn't exist
            }
            return null;
          });
        
        const checkResults = await Promise.all(checkPromises);
        missingTokens.push(...checkResults.filter((id): id is bigint => id !== null));
        
        if (missingTokens.length > 0) {
          ownedIds.push(...missingTokens);
        }
      }

      // Only fetch metadata for new tokens if we have cached cards
      let fetchedCards: Card[] = [];
      if (!forceRefresh && existingTokenIds.size > 0) {
        // Only fetch new cards
        const newTokenIds = ownedIds.filter(id => !existingTokenIds.has(id.toString()));
        if (newTokenIds.length > 0) {
          const newCards = await fetchCardsByIds(newTokenIds);
          fetchedCards = [...cards, ...newCards];
        } else {
          fetchedCards = cards; // No new cards
        }
      } else {
        // Full fetch
        fetchedCards = await fetchCardsByIds(ownedIds);
      }
      
      console.log(`[useUserCards] Successfully fetched ${fetchedCards.length} cards`);
      setCards(fetchedCards);
      setLastScannedBlock(currentBlock);
      if (address) saveToCache(address);
    } catch (err) {
      console.error('Error fetching user cards:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch cards'));
    } finally {
      setLoading(false);
    }
  }, [address, publicClient, setCards, setLoading, setError, fetchCardsByIds, cards, lastScannedBlock, setLastScannedBlock, loadFromCache, saveToCache]);

  // Initial fetch - load cached data immediately, then refresh in background
  useEffect(() => {
    if (!address || !publicClient) return;

    // Store address for cache operations
    (window as any).__walletAddress = address;

    // Load from cache first
    const hadCache = loadFromCache(address);
    
    if (hadCache && cards.length > 0) {
      // Show cached data immediately, refresh in background
      console.log(`[useUserCards] Showing ${cards.length} cached cards, refreshing in background...`);
      fetchUserCards(false);
    } else {
      // No cache, do full fetch
      fetchUserCards(true);
    }
  }, [address, publicClient]); // Only depend on address and publicClient

  // Note: Event watching disabled to avoid RPC rate limits on free tier
  // Use refetch() to manually refresh the collection after opening packs

  return {
    cards,
    isLoading,
    error,
    refetch: () => fetchUserCards(true),
    fetchCardsByIds,
  };
}
