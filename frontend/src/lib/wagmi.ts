import { http, createConfig } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { coinbaseWallet, metaMask, walletConnect } from 'wagmi/connectors';

// Get environment variables
const sepoliaRpcUrl = import.meta.env.VITE_SEPOLIA_RPC_URL || 'https://eth-sepolia.g.alchemy.com/v2/demo';
const walletConnectProjectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || '';

// Create wagmi config
export const config = createConfig({
  chains: [sepolia],
  connectors: [
    metaMask(),
    walletConnect({
      projectId: walletConnectProjectId,
    }),
    coinbaseWallet({
      appName: 'Blockchain Trading Cards',
    }),
  ],
  transports: {
    [sepolia.id]: http(sepoliaRpcUrl),
  },
});

// Export supported chain for validation
export const SUPPORTED_CHAIN = sepolia;
