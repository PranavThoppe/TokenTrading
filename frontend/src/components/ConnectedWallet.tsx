import { useAccount, useBalance, useDisconnect } from 'wagmi';
import { useNetworkValidation } from '@/hooks/useNetworkValidation';
import { NetworkIndicator } from './NetworkIndicator';
import { useEffect, useState } from 'react';

export function ConnectedWallet() {
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const { data: balance } = useBalance({
    address: address,
  });
  const { isWrongNetwork } = useNetworkValidation();
  const [showMenu, setShowMenu] = useState(false);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setShowMenu(false);
    if (showMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showMenu]);

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const formatBalance = (bal: bigint, decimals: number) => {
    const value = Number(bal) / Math.pow(10, decimals);
    return value.toFixed(4);
  };

  return (
    <div className="flex items-center gap-3">
      <NetworkIndicator />
      
      <div className="relative">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(!showMenu);
          }}
          className={`flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition-all duration-300 glass-panel ${
            isWrongNetwork
              ? 'border border-red-500/50 hover:border-red-500 text-white hover:shadow-[0_0_20px_rgba(239,68,68,0.5)]'
              : 'neon-border-cyan hover:neon-glow-cyan text-white'
          }`}
        >
          <div className="flex flex-col items-end">
            <span className="text-sm text-white font-mono font-medium">
              {balance ? `${formatBalance(balance.value, balance.decimals)} ${balance.symbol}` : '0.0000 ETH'}
            </span>
            <span className="text-xs text-white/60">
              {address ? formatAddress(address) : ''}
            </span>
          </div>
          <div className={`w-2 h-2 rounded-full ${isWrongNetwork ? 'bg-red-500' : 'bg-cyan-400 animate-pulse neon-glow-cyan'}`}></div>
        </button>

        {showMenu && (
          <div className="absolute right-0 mt-2 w-48 glass-panel rounded-lg shadow-2xl neon-border-blue py-2 z-50">
            <button
              onClick={() => {
                disconnect();
                setShowMenu(false);
              }}
              className="w-full px-4 py-2 text-left text-white hover:text-white hover:bg-red-500/10 transition-colors"
            >
              Disconnect
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
