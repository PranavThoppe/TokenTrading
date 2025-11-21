import CardNFTAbiJson from './CardNFT.json';
import PackManagerAbiJson from './PackManager.json';

export const CARD_NFT_ABI = CardNFTAbiJson;
export const PACK_MANAGER_ABI = PackManagerAbiJson;

export type CardNFTAbiType = typeof CARD_NFT_ABI;
export type PackManagerAbiType = typeof PACK_MANAGER_ABI;
