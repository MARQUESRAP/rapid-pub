import React from 'react';

type SpinnerSize = 'sm' | 'md' | 'lg';

interface LoadingSpinnerProps {
  size?: SpinnerSize;
  color?: string;
}

export function LoadingSpinner({ size = 'md', color }: LoadingSpinnerProps) {
  const sizeMap: Record<SpinnerSize, number> = {
    sm: 16,
    md: 24,
    lg: 32,
  };

  const spinnerSize = sizeMap[size];
  const spinnerColor = color || 'var(--color-white)';

  const containerStyle: React.CSSProperties = {
    display: 'inline-block',
    width: `${spinnerSize}px`,
    height: `${spinnerSize}px`,
  };

  const spinnerStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    border: `${spinnerSize / 8}px solid ${spinnerColor}40`,
    borderTop: `${spinnerSize / 8}px solid ${spinnerColor}`,
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  };

  return (
    <div style={containerStyle}>
      <div style={spinnerStyle}></div>
      <style jsx>{`
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
