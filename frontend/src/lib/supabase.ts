import { createClient } from '@supabase/supabase-js';

// Get Supabase URL and anon key from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error('Missing SUPABASE_URL environment variable');
}

if (!supabaseAnonKey) {
  throw new Error('Missing SUPABASE_ANON_KEY environment variable');
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types for TypeScript
export interface ListedCard {
  id: string;
  token_id: number;
  owner_address: string;
  player_name: string;
  position: string | null;
  rarity: number;
  listed_at: string;
  status: 'active' | 'traded' | 'cancelled';
}

export interface Trade {
  id: string;
  trade_id: number;
  status: 'pending' | 'accepted' | 'completed' | 'cancelled';
  initiator_address: string;
  counterparty_address: string;
  created_at: string;
  updated_at: string;
  executed_at: string | null;
  cancelled_at: string | null;
}

export interface TradeParticipant {
  id: string;
  trade_id: string;
  token_id: number;
  participant_address: string;
  offered: boolean;
  created_at: string;
}

export interface TradeEvent {
  id: string;
  trade_id: string;
  event_type: 'created' | 'accepted' | 'executed' | 'cancelled';
  actor_address: string;
  event_data: any;
  created_at: string;
}
