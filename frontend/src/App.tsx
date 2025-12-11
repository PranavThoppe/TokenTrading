import { WalletButton } from './components/WalletButton';
import { WalletDebug } from './components/WalletDebug';
import { Navigation } from './components/Navigation';
import { PackStoreContainer } from './components/PackStoreContainer';
import { useAccount } from 'wagmi';
import { useAccountChange } from './hooks/useAccountChange';

function App() {
  const { isConnected, address } = useAccount();

  // Handle account changes
  useAccountChange((newAddress) => {
    console.log('Account changed to:', newAddress);
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Subtle gradient overlay */}
      <div className="fixed inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-fuchsia-500/5 pointer-events-none" />
      
      {/* Header */}
      <header className="border-b border-white/5 backdrop-blur-sm bg-black/20 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-xl">
              ⚡
            </div>
            <h1 className="text-xl font-bold text-white">
              Trading Cards
            </h1>
          </div>
          <WalletButton />
        </div>
      </header>

      {/* Navigation */}
      {isConnected && <Navigation />}

      {/* Main Content */}
      <main className="relative">
        <div className="max-w-6xl mx-auto px-6 py-20">
          {/* Hero Section */}
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Collect, Trade & Auction
              <br />
              <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                Fantasy Football Cards
              </span>
            </h2>
            <p className="text-lg text-white max-w-2xl mx-auto">
              Connect your wallet to start building your ultimate collection on the blockchain
            </p>
          </div>

          {/* Connection Card */}
          {!isConnected && (
            <div className="max-w-md mx-auto mb-20">
              <div className="card-gradient rounded-2xl p-10 text-center">
                <h3 className="text-2xl font-bold text-white mb-3">
                  Get Started
                </h3>
                <p className="text-white mb-8">
                  Connect your wallet to access the platform
                </p>
                <WalletButton />
              </div>
            </div>
          )}

          {/* Pack Store */}
          {isConnected && (
            <div className="mb-20">
              <PackStoreContainer />
            </div>
          )}

          {/* Feature Cards */}
          {!isConnected && (
            <div className="grid md:grid-cols-3 gap-6">
              <div className="rounded-xl p-6 transition-all duration-300 hover:scale-105 border-2 border-violet-500/50 bg-slate-900/30 backdrop-blur-sm">
                <h3 className="text-lg font-bold text-white mb-2">Collect Cards</h3>
                <p className="text-white text-sm">
                  Build your ultimate fantasy football collection
                </p>
              </div>
              
              <div className="rounded-xl p-6 transition-all duration-300 hover:scale-105 border-2 border-fuchsia-500/50 bg-slate-900/30 backdrop-blur-sm">
                <h3 className="text-lg font-bold text-white mb-2">Trade NFTs</h3>
                <p className="text-white text-sm">
                  Exchange cards with other collectors
                </p>
              </div>
              
              <div className="rounded-xl p-6 transition-all duration-300 hover:scale-105 border-2 border-purple-500/50 bg-slate-900/30 backdrop-blur-sm">
                <h3 className="text-lg font-bold text-white mb-2">Auction House</h3>
                <p className="text-white text-sm">
                  Bid on rare and legendary cards
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Debug Panel */}
      <WalletDebug />
    </div>
  );
}

export default App;
