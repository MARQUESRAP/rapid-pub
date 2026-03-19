import React from 'react';

export type PostTypeTab = 'generic' | 'promo' | 'products';

interface PostTypeTabsProps {
  activeType: PostTypeTab;
  onTypeChange: (type: PostTypeTab) => void;
}

export function PostTypeTabs({ activeType, onTypeChange }: PostTypeTabsProps) {
  const tabs: { value: PostTypeTab; label: string }[] = [
    { value: 'generic', label: 'Posts generiques' },
    { value: 'promo', label: 'Posts promo' },
    { value: 'products', label: 'Produits' },
  ];

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    gap: '4px',
    marginBottom: 'var(--spacing-lg)',
    padding: '4px',
    backgroundColor: 'var(--color-gray-100)',
    borderRadius: 'var(--radius-lg)',
    width: 'fit-content',
  };

  const tabStyle = (isActive: boolean): React.CSSProperties => ({
    padding: '8px 18px',
    fontSize: '0.85rem',
    fontWeight: 500,
    color: isActive ? 'var(--color-gray-900)' : 'var(--color-gray-500)',
    backgroundColor: isActive ? 'var(--color-white)' : 'transparent',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap',
    boxShadow: isActive ? 'var(--shadow-sm)' : 'none',
  });

  return (
    <div style={containerStyle}>
      {tabs.map((tab) => (
        <button
          key={tab.value}
          style={tabStyle(activeType === tab.value)}
          onClick={() => onTypeChange(tab.value)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
