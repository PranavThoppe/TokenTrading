import { useNetworkValidation } from '@/hooks/useNetworkValidation';

export function NetworkIndicator() {
  const { isWrongNetwork, supportedChainName, switchNetwork, canSwitchNetwork } = useNetworkValidation();

  if (!isWrongNetwork) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-sm text-white font-medium">{supportedChainName}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20">
      <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
      <span className="text-sm text-white font-medium">Wrong Network</span>
      {canSwitchNetwork && (
        <button
          onClick={switchNetwork}
          className="ml-2 text-xs px-2 py-1 rounded bg-red-500/20 hover:bg-red-500/30 text-white transition-all"
        >
          Switch
        </button>
      )}
    </div>
  );
}
