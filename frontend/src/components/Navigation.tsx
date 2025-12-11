import { useState } from 'react';
import { useAccount } from 'wagmi';

interface NavItem {
  label: string;
  href: string;
  icon: string;
}

/**
 * Navigation bar component with menu items
 */
export function Navigation() {
  const { isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState('store');

  const navItems: NavItem[] = [
    { label: 'Pack Store', href: '#store', icon: '🎁' },
    { label: 'My Collection', href: '#collection', icon: '🎴' },
    { label: 'Marketplace', href: '#marketplace', icon: '🏪' },
  ];

  return (
    <nav className="border-b border-white/10 bg-slate-900/50 backdrop-blur-sm sticky top-16 z-40">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center gap-8">
          {navItems.map((item) => (
            <button
              key={item.href}
              onClick={() => setActiveTab(item.href.slice(1))}
              className={`py-4 px-2 font-medium transition-all duration-300 border-b-2 ${
                activeTab === item.href.slice(1)
                  ? 'border-violet-500 text-violet-400'
                  : 'border-transparent text-white/60 hover:text-white'
              }`}
            >
              <span className="mr-2">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
