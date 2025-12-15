import type { Address } from 'viem';

/**
 * Card rarity enum matching contract
 */
export const Rarity = {
  Common: 0,
  Uncommon: 1,
  Rare: 2,
  Epic: 3,
  Legendary: 4,
} as const;

export type Rarity = (typeof Rarity)[keyof typeof Rarity];

/**
 * Card metadata structure
 */
export interface CardMetadata {
  playerId: string;
  playerName: string;
  position: string;
  team: string;
  rarity: Rarity;
  imageUrl: string;
  stats: PlayerStats;
}

/**
 * Player statistics
 */
export interface PlayerStats {
  touchdowns: number;
  passingYards: number;
  rating: number;
}

/**
 * Card data including on-chain info
 */
export interface Card extends CardMetadata {
  tokenId: bigint;
  owner: Address;
  mintTimestamp: number;
  metadataUri: string;
}

/**
 * Pack type configuration
 */
export interface PackType {
  id: number;
  name: string;
  price: bigint;
  cardCount: number;
  rarityWeights: number[];
  active: boolean;
}

/**
 * Pending pack data
 */
export interface PendingPack {
  requestId: string;
  packType: number;
  buyer: Address;
  fulfilled: boolean;
  timestamp: number;
}

/**
 * Transaction status
 */
export const TransactionStatus = {
  Idle: 'idle',
  Pending: 'pending',
  Success: 'success',
  Error: 'error',
} as const;

export type TransactionStatus = (typeof TransactionStatus)[keyof typeof TransactionStatus];

/**
 * Transaction data
 */
export interface Transaction {
  hash: string;
  status: TransactionStatus;
  type: string;
  timestamp: number;
  error?: string;
}
