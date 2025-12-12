interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  const navItems = [
    { id: 'store', label: 'Pack Store' },
    { id: 'open', label: 'Open Packs' },
    { id: 'collection', label: 'My Collection' },
    { id: 'marketplace', label: 'Marketplace' },
  ];

  return (
    <nav
      style={{
        background: '#1a1a2e',
        borderBottom: '1px solid #333',
        padding: '0 24px',
        position: 'relative',
        zIndex: 100,
      }}
    >
      <div
        style={{
          maxWidth: '900px',
          margin: '0 auto',
          display: 'flex',
          gap: '8px',
        }}
      >
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            style={{
              padding: '14px 20px',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === item.id ? '2px solid #7c3aed' : '2px solid transparent',
              color: activeTab === item.id ? '#fff' : '#888',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'color 0.2s',
            }}
          >
            {item.label}
          </button>
        ))}
      </div>
    </nav>
  );
}
