import React from 'react';
import { PostStats } from '@/types/post';

interface StatsBarProps {
  stats: PostStats;
}

interface StatConfig {
  label: string;
  key: keyof PostStats;
  icon: string;
  iconBg: string;
  iconColor: string;
}

const statsConfig: StatConfig[] = [
  { label: 'Total', key: 'total', icon: '📊', iconBg: 'rgba(99,102,241,0.08)', iconColor: '#6366F1' },
  { label: 'À valider', key: 'a_valider', icon: '✏️', iconBg: 'rgba(233,78,27,0.08)', iconColor: '#E94E1B' },
  { label: 'Validés', key: 'valide', icon: '✓', iconBg: 'rgba(164,198,57,0.08)', iconColor: '#A4C639' },
];

export function StatsBar({ stats }: StatsBarProps) {
  const containerStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 'var(--spacing-md)',
    marginBottom: 'var(--spacing-xl)',
  };

  const statCardStyle: React.CSSProperties = {
    backgroundColor: 'var(--color-white)',
    borderRadius: 'var(--radius-lg)',
    padding: 'var(--spacing-lg)',
    boxShadow: 'var(--shadow-md)',
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-md)',
  };

  const infoStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    flex: 1,
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '0.72rem',
    fontWeight: 500,
    color: 'var(--color-gray-400)',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  };

  const valueStyle: React.CSSProperties = {
    fontSize: '2rem',
    fontWeight: 700,
    color: 'var(--color-gray-900)',
    lineHeight: 1.1,
  };

  return (
    <div style={containerStyle}>
      {statsConfig.map((cfg) => (
        <div key={cfg.key} style={statCardStyle}>
          <div style={infoStyle}>
            <div style={labelStyle}>{cfg.label}</div>
            <div style={valueStyle}>{stats[cfg.key]}</div>
          </div>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              backgroundColor: cfg.iconBg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: cfg.icon === '✓' ? '1.1rem' : '1.25rem',
              color: cfg.iconColor,
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {cfg.icon}
          </div>
        </div>
      ))}
    </div>
  );
}
