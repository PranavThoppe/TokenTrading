import type { Address } from 'viem';

// Contract addresses from environment variables
export const CARD_NFT_ADDRESS = (import.meta.env.VITE_CARD_NFT_ADDRESS || '') as Address;
export const PACK_MANAGER_ADDRESS = (import.meta.env.VITE_PACK_MANAGER_ADDRESS || '') as Address;
export const TRADING_ADDRESS = (import.meta.env.VITE_TRADING_ADDRESS || '') as Address;

// Validate that contract addresses are set
export function validateContractAddresses(): boolean {
  return !!(CARD_NFT_ADDRESS && PACK_MANAGER_ADDRESS && TRADING_ADDRESS);
}

// Get contract address by name
export function getContractAddress(contractName: 'CardNFT' | 'PackManager' | 'Trading'): Address {
  switch (contractName) {
    case 'CardNFT':
      return CARD_NFT_ADDRESS;
    case 'PackManager':
      return PACK_MANAGER_ADDRESS;
    case 'Trading':
      return TRADING_ADDRESS;
    default:
      throw new Error(`Unknown contract: ${contractName}`);
  }
}
