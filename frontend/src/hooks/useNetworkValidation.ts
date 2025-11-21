import { useAccount, useChainId, useSwitchChain } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { useEffect, useState } from 'react';

export function useNetworkValidation() {
  const chainId = useChainId();
  const { isConnected } = useAccount();
  const { switchChain } = useSwitchChain();
  const [isWrongNetwork, setIsWrongNetwork] = useState(false);

  const SUPPORTED_CHAIN_ID = sepolia.id;

  useEffect(() => {
    if (isConnected && chainId !== SUPPORTED_CHAIN_ID) {
      setIsWrongNetwork(true);
    } else {
      setIsWrongNetwork(false);
    }
  }, [chainId, isConnected]);

  const handleSwitchNetwork = () => {
    if (switchChain) {
      switchChain({ chainId: SUPPORTED_CHAIN_ID });
    }
  };

  return {
    isWrongNetwork,
    currentChainId: chainId,
    supportedChainId: SUPPORTED_CHAIN_ID,
    supportedChainName: sepolia.name,
    switchNetwork: handleSwitchNetwork,
    canSwitchNetwork: !!switchChain,
  };
}
