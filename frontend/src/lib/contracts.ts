import type { Address } from 'viem';

// Contract addresses from environment variables
export const CARD_NFT_ADDRESS = (import.meta.env.VITE_CARD_NFT_ADDRESS || '') as Address;
export const PACK_MANAGER_ADDRESS = (import.meta.env.VITE_PACK_MANAGER_ADDRESS || '') as Address;

// Validate that contract addresses are set
export function validateContractAddresses(): boolean {
  return !!(CARD_NFT_ADDRESS && PACK_MANAGER_ADDRESS);
}

// Get contract address by name
export function getContractAddress(contractName: 'CardNFT' | 'PackManager'): Address {
  switch (contractName) {
    case 'CardNFT':
      return CARD_NFT_ADDRESS;
    case 'PackManager':
      return PACK_MANAGER_ADDRESS;
    default:
      throw new Error(`Unknown contract: ${contractName}`);
  }
}
