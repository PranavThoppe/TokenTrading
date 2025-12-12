interface NavItem {
  id: string;
  label: string;
  icon: string;
}

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

/**
 * Navigation bar component with menu items
 */
export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  const navItems: NavItem[] = [
    { id: 'store', label: 'Pack Store', icon: '🎁' },
    { id: 'open', label: 'Open Packs', icon: '📦' },
    { id: 'collection', label: 'My Collection', icon: '🎴' },
    { id: 'marketplace', label: 'Marketplace', icon: '🏪' },
  ];

  return (
    <nav className="border-b border-white/10 bg-slate-900/50 backdrop-blur-sm sticky top-16 z-40">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center gap-8">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`py-4 px-2 font-medium transition-all duration-300 border-b-2 ${
                activeTab === item.id
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
