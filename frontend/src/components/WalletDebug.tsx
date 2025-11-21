import { useAccount, useConnect, useDisconnect, useChainId } from 'wagmi';
import { sepolia } from 'wagmi/chains';

export function WalletDebug() {
  const { address, isConnected, isConnecting } = useAccount();
  const { connect, connectors, error, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();

  return (
    <div className="fixed bottom-4 right-4 rounded-lg bg-black/80 backdrop-blur-sm border border-white/10 p-4 text-xs max-w-sm z-50 shadow-2xl">
      <h3 className="font-bold mb-3 text-white flex items-center gap-2">
        <span>⚙️</span>
        Debug Panel
      </h3>
      <div className="space-y-1 text-white font-mono text-xs">
        <p>Connected: {isConnected ? '✅' : '❌'}</p>
        <p>Connecting: {isConnecting ? '⏳' : '❌'}</p>
        <p>Chain: <span className="text-white">{chainId === sepolia.id ? sepolia.name : 'Unknown'}</span> ({chainId})</p>
        <p>Address: <span className="text-white">{address ? `${address.slice(0, 10)}...` : 'None'}</span></p>
        {error && <p className="text-white">Error: {error.message}</p>}
        
        <div className="mt-3 pt-3 border-t border-white/10">
          <p className="font-semibold mb-2 text-white text-xs">Connectors:</p>
          {connectors.map((connector) => (
            <button
              key={connector.id}
              onClick={() => connect({ connector })}
              disabled={isPending}
              className="w-full mb-1 px-2 py-1 rounded bg-violet-500/10 border border-violet-500/20 hover:border-violet-500/40 text-white text-xs disabled:opacity-50 transition-all"
            >
              {connector.name}
            </button>
          ))}
        </div>

        {isConnected && (
          <button
            onClick={() => disconnect()}
            className="mt-3 w-full px-3 py-1.5 rounded bg-red-500/10 border border-red-500/20 hover:border-red-500/40 text-white text-xs transition-all"
          >
            Disconnect
          </button>
        )}
      </div>
    </div>
  );
}
