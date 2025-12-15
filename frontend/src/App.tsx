import { useState } from 'react';
import { WalletButton } from './components/WalletButton';
import { Navigation } from './components/Navigation';
import { PackStoreContainer } from './components/PackStoreContainer';
import { PackOpeningContainer } from './components/PackOpeningContainer';
import { Collection } from './components/Collection';
import { useAccount } from 'wagmi';
import { useAccountChange } from './hooks/useAccountChange';

function App() {
  const { isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState('store');

  useAccountChange(() => {
    // Account changed - could refresh data here if needed
  });

  const handleViewCollection = () => setActiveTab('collection');
  const handleNavigateToOpenPacks = () => setActiveTab('open');

  const renderContent = () => {
    if (!isConnected) return null;

    switch (activeTab) {
      case 'store':
        return <PackStoreContainer onNavigateToOpenPacks={handleNavigateToOpenPacks} />;
      case 'open':
        return <PackOpeningContainer onViewCollection={handleViewCollection} onNavigateToStore={() => setActiveTab('store')} />;
      case 'collection':
        return <Collection onNavigateToStore={() => setActiveTab('store')} />;
      case 'marketplace':
        return (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <h2 style={{ color: '#fff', fontSize: '24px', marginBottom: '8px' }}>Marketplace</h2>
            <p style={{ color: '#888' }}>Coming soon...</p>
          </div>
        );
      default:
        return <PackStoreContainer />;
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f1e' }}>
      {/* Header */}
      <header
        style={{
          background: '#1a1a2e',
          borderBottom: '1px solid #333',
          padding: '16px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <h1 style={{ color: '#fff', fontSize: '20px', fontWeight: 700, margin: 0 }}>
          ⚡ Trading Cards
        </h1>
        <WalletButton />
      </header>

      {/* Navigation */}
      {isConnected && <Navigation activeTab={activeTab} onTabChange={setActiveTab} />}

      {/* Main Content */}
      <main>
        {!isConnected ? (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <h2 style={{ color: '#fff', fontSize: '32px', marginBottom: '16px' }}>
              NFL Trading Cards
            </h2>
            <p style={{ color: '#888', marginBottom: '32px', maxWidth: '400px', margin: '0 auto 32px' }}>
              Connect your wallet to collect, trade, and auction NFT cards on the blockchain.
            </p>
            <WalletButton />
          </div>
        ) : (
          renderContent()
        )}
      </main>
    </div>
  );
}

export default App;
