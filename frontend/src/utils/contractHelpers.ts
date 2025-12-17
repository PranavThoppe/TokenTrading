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

/**
 * Get list of IPFS gateways to try (in order of preference)
 */
function getIPFSGateways(hash: string): string[] {
  return [
    // Custom Pinata gateway (best performance, no CORS issues)
    `https://violet-magnetic-mite-770.mypinata.cloud/ipfs/${hash}`,
    // Public Pinata gateway
    `https://gateway.pinata.cloud/ipfs/${hash}`,
    // Public IPFS gateway (fallback)
    `https://ipfs.io/ipfs/${hash}`,
  ];
}

/**
 * Convert IPFS URI to HTTP gateway URLs (returns array for fallback)
 * Supports ipfs://, https://ipfs.io, and Pinata gateways
 */
export function ipfsToHttp(ipfsUri: string): string[] {
  if (!ipfsUri) return [];
  
  // If already HTTP, return as is
  if (ipfsUri.startsWith('http://') || ipfsUri.startsWith('https://')) {
    return [ipfsUri];
  }
  
  // Convert ipfs:// to multiple gateway URLs for fallback
  if (ipfsUri.startsWith('ipfs://')) {
    const hash = ipfsUri.replace('ipfs://', '');
    return getIPFSGateways(hash);
  }
  
  return [];
}

/**
 * Fetch metadata JSON from IPFS with gateway fallback and retry logic
 */
export async function fetchIPFSMetadata(uri: string, retries = 1): Promise<{ image?: string; [key: string]: any } | null> {
  const gateways = ipfsToHttp(uri);
  if (gateways.length === 0) return null;
  
  // Try each gateway with retries
  for (const gatewayUrl of gateways) {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        // Add delay between retries to avoid rate limiting
        if (attempt > 0) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
        
        // Add timeout to prevent long waits
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
        
        const response = await fetch(gatewayUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          const metadata = await response.json();
          return metadata;
        }
        
        // If 404 (not found), file doesn't exist - stop trying
        if (response.status === 404) {
          return null; // File doesn't exist, no point trying other gateways
        }
        
        // If 429 (rate limit), wait longer before retry
        if (response.status === 429) {
          await new Promise(resolve => setTimeout(resolve, 2000 * (attempt + 1)));
          continue;
        }
        
        // For other errors, try next gateway
        break;
      } catch (error) {
        // If timeout or network error, try next gateway immediately
        if (error instanceof Error && error.name === 'AbortError') {
          break; // Timeout - try next gateway
        }
        
        // If this is the last attempt on this gateway, try next gateway
        if (attempt === retries) {
          break;
        }
        // Otherwise retry this gateway
        continue;
      }
    }
  }
  
  // All gateways failed - file likely doesn't exist
  return null;
}
