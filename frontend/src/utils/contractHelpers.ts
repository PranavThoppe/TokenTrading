import type { Address } from 'viem';
import { formatEther, parseEther } from 'viem';

/**
 * Format wei to ETH string
 */
export function formatWeiToEth(wei: bigint): string {
  return formatEther(wei);
}

/**
 * Parse ETH string to wei
 */
export function parseEthToWei(eth: string): bigint {
  return parseEther(eth);
}

/**
 * Shorten an Ethereum address for display
 */
export function shortenAddress(address: Address, chars = 4): string {
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

/**
 * Check if an address is valid
 */
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Format token ID for display
 */
export function formatTokenId(tokenId: bigint): string {
  return `#${tokenId.toString()}`;
}

/**
 * Parse error message from contract revert
 */
export function parseContractError(error: Error): string {
  const errorMessage = error.message;
  
  // Check for common error patterns
  if (errorMessage.includes('User rejected')) {
    return 'Transaction was rejected by user';
  }
  
  if (errorMessage.includes('insufficient funds')) {
    return 'Insufficient funds for transaction';
  }
  
  if (errorMessage.includes('execution reverted')) {
    // Try to extract the revert reason
    const match = errorMessage.match(/execution reverted: (.+?)"/);
    if (match && match[1]) {
      return match[1];
    }
    return 'Transaction failed';
  }
  
  // Return generic error message
  return errorMessage.length > 100 
    ? errorMessage.substring(0, 100) + '...' 
    : errorMessage;
}

/**
 * Get block explorer URL for transaction
 */
export function getBlockExplorerUrl(txHash: string, chainId: number): string {
  // Sepolia testnet
  if (chainId === 11155111) {
    return `https://sepolia.etherscan.io/tx/${txHash}`;
  }
  
  // Mainnet
  if (chainId === 1) {
    return `https://etherscan.io/tx/${txHash}`;
  }
  
  return '';
}

/**
 * Get block explorer URL for address
 */
export function getAddressExplorerUrl(address: Address, chainId: number): string {
  // Sepolia testnet
  if (chainId === 11155111) {
    return `https://sepolia.etherscan.io/address/${address}`;
  }
  
  // Mainnet
  if (chainId === 1) {
    return `https://etherscan.io/address/${address}`;
  }
  
  return '';
}
