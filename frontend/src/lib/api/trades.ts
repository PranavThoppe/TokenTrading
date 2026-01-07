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
