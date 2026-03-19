import React from 'react';

interface LogoProps {
  size?: number;
}

export function Logo({ size = 40 }: LogoProps) {
  const containerStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'var(--spacing-sm)',
  };

  const logoStyle: React.CSSProperties = {
    fontSize: `${size}px`,
    fontWeight: 700,
    color: 'var(--color-orange-primary)',
    letterSpacing: '-0.02em',
  };

  const subTextStyle: React.CSSProperties = {
    fontSize: `${size * 0.4}px`,
    fontWeight: 500,
    color: 'var(--color-gray-600)',
  };

  return (
    <div style={containerStyle}>
      <div style={logoStyle}>Rapid Pub</div>
      <div style={subTextStyle}>LinkedIn Manager</div>
    </div>
  );
}
