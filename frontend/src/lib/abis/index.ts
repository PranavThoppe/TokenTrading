import CardNFTAbiJson from './CardNFT.json';
import PackManagerAbiJson from './PackManager.json';
import TradingAbiJson from './Trading.json';

export const CARD_NFT_ABI = CardNFTAbiJson;
export const PACK_MANAGER_ABI = PackManagerAbiJson;
export const TRADING_ABI = TradingAbiJson;

export type CardNFTAbiType = typeof CARD_NFT_ABI;
export type PackManagerAbiType = typeof PACK_MANAGER_ABI;
export type TradingAbiType = typeof TRADING_ABI;
