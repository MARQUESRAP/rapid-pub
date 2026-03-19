import React from 'react';

type FilterOption = 'tous' | 'a_valider' | 'valide';

interface FilterTabsProps {
  activeFilter: FilterOption;
  onFilterChange: (filter: FilterOption) => void;
  counts?: {
    tous: number;
    a_valider: number;
    valide: number;
  };
}

export function FilterTabs({ activeFilter, onFilterChange, counts }: FilterTabsProps) {
  const tabs: { value: FilterOption; label: string }[] = [
    { value: 'tous', label: 'Tous' },
    { value: 'a_valider', label: 'À valider' },
    { value: 'valide', label: 'Validés' },
  ];

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    gap: '4px',
    marginBottom: 'var(--spacing-xl)',
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

  const countBadgeStyle = (isActive: boolean): React.CSSProperties => ({
    display: 'inline-block',
    marginLeft: '6px',
    padding: '1px 7px',
    borderRadius: 'var(--radius-full)',
    fontSize: '0.7rem',
    fontWeight: 600,
    backgroundColor: isActive ? 'var(--color-gray-100)' : 'var(--color-gray-200)',
    color: 'var(--color-gray-500)',
  });

  return (
    <div style={containerStyle}>
      {tabs.map((tab) => {
        const isActive = activeFilter === tab.value;
        return (
          <button
            key={tab.value}
            style={tabStyle(isActive)}
            onClick={() => onFilterChange(tab.value)}
          >
            {tab.label}
            {counts && (
              <span style={countBadgeStyle(isActive)}>{counts[tab.value]}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
