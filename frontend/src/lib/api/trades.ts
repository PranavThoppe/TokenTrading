import { supabase } from '../supabase';
import type { ListedCard } from '../supabase';

/**
 * Test function to verify Supabase connection by fetching listed cards
 * @returns Promise<ListedCard[]> - Array of publicly listed cards
 */
export async function getListedCards(): Promise<ListedCard[]> {
  try {
    const { data, error } = await supabase
      .from('listed_cards')
      .select('*')
      .eq('status', 'active')
      .order('listed_at', { ascending: false });

    if (error) {
      console.error('Error fetching listed cards:', error);
      throw new Error(`Failed to fetch listed cards: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    console.error('Supabase connection test failed:', error);
    throw error;
  }
}

/**
 * List a card for trading
 * @param tokenId - The token ID of the card to list
 * @param ownerAddress - The owner's wallet address
 * @param cardData - Additional card metadata
 * @returns Promise<ListedCard> - The listed card
 */
export async function listCardForTrade(
  tokenId: number,
  ownerAddress: string,
  cardData: {
    playerName: string;
    position?: string;
    rarity: number;
  }
): Promise<ListedCard> {
  try {
    const { data, error } = await supabase
      .from('listed_cards')
      .insert([{
        token_id: tokenId,
        owner_address: ownerAddress,
        player_name: cardData.playerName,
        position: cardData.position || null,
        rarity: cardData.rarity,
        status: 'active'
      }])
      .select()
      .single();

    if (error) {
      console.error('Error listing card:', error);
      throw new Error(`Failed to list card: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Error in listCardForTrade:', error);
    throw error;
  }
}

/**
 * Remove a card from listing (unlist it)
 * @param tokenId - The token ID to unlist
 * @param ownerAddress - The owner's address (for security)
 * @returns Promise<void>
 */
export async function unlistCard(tokenId: number, ownerAddress: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('listed_cards')
      .update({ status: 'cancelled' })
      .eq('token_id', tokenId)
      .eq('owner_address', ownerAddress)
      .eq('status', 'active');

    if (error) {
      console.error('Error unlisting card:', error);
      throw new Error(`Failed to unlist card: ${error.message}`);
    }
  } catch (error) {
    console.error('Error in unlistCard:', error);
    throw error;
  }
}

/**
 * Check if a card is already listed
 * @param tokenId - The token ID to check
 * @returns Promise<boolean> - True if card is actively listed
 */
export async function isCardListed(tokenId: number): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('listed_cards')
      .select('id')
      .eq('token_id', tokenId)
      .eq('status', 'active')
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error checking if card is listed:', error);
      throw new Error(`Failed to check card listing status: ${error.message}`);
    }

    return !!data;
  } catch (error) {
    console.error('Error in isCardListed:', error);
    throw error;
  }
}

/**
 * Get user's active trades with participants (pending, accepted)
 * @param userAddress - The user's wallet address
 * @returns Promise - Array of trades with their participants
 */
export async function getUserTrades(userAddress: string): Promise<Array<{
  trade: import('../supabase').Trade;
  cards: any[];
}>> {
  try {
    // First get the trades
    const { data: trades, error: tradeError } = await supabase
      .from('trades')
      .select('*')
      .or(`initiator_address.eq.${userAddress},counterparty_address.eq.${userAddress}`)
      .in('status', ['pending', 'accepted'])
      .order('created_at', { ascending: false });

    if (tradeError) {
      console.error('Error fetching user trades:', tradeError);
      throw new Error(`Failed to fetch user trades: ${tradeError.message}`);
    }

    if (!trades || trades.length === 0) {
      return [];
    }

    // Get all cards involved in these trades
    const tradeIds = trades.map(t => t.id);
    const { data: tradeCards, error: cardsError } = await supabase
      .from('cards')
      .select('*')
      .in('trade_id', tradeIds);

    if (cardsError) {
      console.error('Error fetching trade cards:', cardsError);
      throw new Error(`Failed to fetch trade cards: ${cardsError.message}`);
    }

    // Group cards by trade_id
    const cardsByTrade = (tradeCards || []).reduce((acc, card) => {
      if (!acc[card.trade_id]) {
        acc[card.trade_id] = [];
      }
      acc[card.trade_id].push(card);
      return acc;
    }, {} as Record<string, any[]>);

    // Combine trades with their cards
    return trades.map(trade => ({
      trade,
      cards: cardsByTrade[trade.id] || []
    }));
  } catch (error) {
    console.error('Error in getUserTrades:', error);
    throw error;
  }
}

/**
 * Get cards involved in a specific trade
 * @param tradeId - The trade ID
 * @returns Promise - Array of cards involved in the trade
 */
export async function getTradeCards(tradeId: string) {
  try {
    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .eq('trade_id', tradeId);

    if (error) {
      console.error('Error fetching trade cards:', error);
      throw new Error(`Failed to fetch trade cards: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    console.error('Error in getTradeCards:', error);
    throw error;
  }
}

/**
 * Get card details by token ID
 * @param tokenIds - Array of token IDs to fetch
 * @returns Promise - Map of token_id to card details
 */
export async function getCardDetails(tokenIds: number[]): Promise<Map<number, any>> {
  try {
    if (tokenIds.length === 0) return new Map();

    console.log('getCardDetails called with:', tokenIds, 'types:', tokenIds.map(id => typeof id));

    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .in('token_id', tokenIds);

    if (error) {
      console.error('Error fetching card details:', error);
      throw new Error(`Failed to fetch card details: ${error.message}`);
    }

    console.log('Raw data from DB:', data);

    // Convert array to Map for easy lookup
    const cardMap = new Map();
    (data || []).forEach(card => {
      console.log('Processing card from DB:', card.token_id, typeof card.token_id, card.rarity, typeof card.rarity);
      const tokenIdNum = Number(card.token_id);
      console.log('Setting map key:', tokenIdNum, typeof tokenIdNum);
      cardMap.set(tokenIdNum, card);
    });

    console.log('Final cardMap:', cardMap);
    return cardMap;
  } catch (error) {
    console.error('Error in getCardDetails:', error);
    throw error;
  }
}

/**
 * Create a new trade offer (UPDATED: Also saves card metadata)
 * @param initiatorAddress - Address of the user making the offer
 * @param counterpartyAddress - Address of the card owner
 * @param offeredCards - Array of token IDs the initiator is offering
 * @param requestedCard - The token ID being requested
 * @param offeredCardDetails - Details of cards being offered (from user's collection)
 * @param requestedCardDetails - Details of the requested card (from listed_cards)
 * @returns Promise<Trade> - The created trade
 */
export async function createTradeOffer(
  initiatorAddress: string,
  counterpartyAddress: string,
  offeredTokenIds: number[],
  requestedCard: number,
  offeredCardDetails: Array<{tokenId: number, playerName: string, position?: string, rarity: number}>,
  requestedCardDetails: {playerName: string, position?: string, rarity: number}
): Promise<import('../supabase').Trade> {
  try {
    // First, ensure all card data exists in cards table
    const allCardDetails = [
      ...offeredCardDetails.map(card => ({
        token_id: card.tokenId,
        owner_address: initiatorAddress, // Current owner
        player_name: card.playerName,
        position: card.position,
        rarity: card.rarity
      })),
      {
        token_id: requestedCard,
        owner_address: counterpartyAddress, // Current owner
        player_name: requestedCardDetails.playerName,
        position: requestedCardDetails.position,
        rarity: requestedCardDetails.rarity
      }
    ];

    console.log('Offered token IDs:', offeredTokenIds);
    console.log('All card details to save:', allCardDetails);

    console.log('All card details to save:', allCardDetails);

    // Create the trade record first
    const { data: tradeData, error: tradeError } = await supabase
      .from('trades')
      .insert([{
        trade_id: Date.now(), // Simple trade ID generation
        status: 'pending',
        initiator_address: initiatorAddress,
        counterparty_address: counterpartyAddress,
      }])
      .select()
      .single();

    if (tradeError) {
      console.error('Error creating trade:', tradeError);
      throw new Error(`Failed to create trade: ${tradeError.message}`);
    }

    // Link all cards to this trade
    const allCardDetailsWithTradeId = allCardDetails.map(card => ({
      ...card,
      trade_id: tradeData.id
    }));

    console.log('Cards with trade_id:', allCardDetailsWithTradeId);

    // Upsert card data with trade_id (update if exists, insert if not)
    const { error: cardsError } = await supabase
      .from('cards')
      .upsert(allCardDetailsWithTradeId, {
        onConflict: 'token_id',
        ignoreDuplicates: false
      });

    if (cardsError) {
      console.error('Error upserting card data:', cardsError);
      // Try to clean up the trade record if cards failed
      await supabase.from('trades').delete().eq('id', tradeData.id);
      throw new Error(`Failed to save card data: ${cardsError.message}`);
    }

    return tradeData;
  } catch (error) {
    console.error('Error in createTradeOffer:', error);
    throw error;
  }
}
