import { useEffect, useRef } from 'react';
import { useAccount } from 'wagmi';

/**
 * Hook to detect and handle account changes
 * Executes a callback when the connected wallet address changes
 */
export function useAccountChange(onAccountChange?: (address: string | undefined) => void) {
  const { address, isConnected } = useAccount();
  const previousAddress = useRef<string | undefined>(address);

  useEffect(() => {
    // Check if address has changed
    if (previousAddress.current !== address) {
      // Call the callback if provided
      if (onAccountChange) {
        onAccountChange(address);
      }
      
      // Update the previous address
      previousAddress.current = address;
    }
  }, [address, onAccountChange]);

  return {
    address,
    isConnected,
    hasChanged: previousAddress.current !== address,
  };
}
