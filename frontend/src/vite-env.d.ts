/// <reference types="vite/client" />

import { Buffer } from 'buffer';

declare global {
  interface Window {
    Buffer: typeof Buffer;
  }
}

interface ImportMetaEnv {
  readonly VITE_CHAIN_ID: string;
  readonly VITE_SEPOLIA_RPC_URL: string;
  readonly VITE_CARD_NFT_ADDRESS: string;
  readonly VITE_PACK_MANAGER_ADDRESS: string;
  readonly VITE_WALLETCONNECT_PROJECT_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
