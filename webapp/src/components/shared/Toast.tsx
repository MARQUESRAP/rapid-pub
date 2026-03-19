import React, { useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, type, isVisible, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  const getTypeStyles = (type: ToastType): React.CSSProperties => {
    const baseStyles = {
      padding: 'var(--spacing-md) var(--spacing-lg)',
      borderRadius: 'var(--radius-md)',
      boxShadow: 'var(--shadow-xl)',
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--spacing-sm)',
      fontWeight: 500,
      fontSize: '0.875rem',
    };

    const typeStyles: Record<ToastType, Partial<React.CSSProperties>> = {
      success: {
        backgroundColor: 'var(--color-green-accent)',
        color: 'var(--color-white)',
      },
      error: {
        backgroundColor: 'var(--color-error)',
        color: 'var(--color-white)',
      },
      info: {
        backgroundColor: 'var(--color-gray-900)',
        color: 'var(--color-white)',
      },
    };

    return { ...baseStyles, ...typeStyles[type] };
  };

  const containerStyle: React.CSSProperties = {
    position: 'fixed',
    top: 'var(--spacing-xl)',
    right: 'var(--spacing-xl)',
    zIndex: 9999,
    animation: 'slideUp 0.3s ease-out',
  };

  const toastStyle: React.CSSProperties = getTypeStyles(type);

  const getIcon = (type: ToastType): string => {
    const icons: Record<ToastType, string> = {
      success: '✓',
      error: '✕',
      info: 'ℹ',
    };
    return icons[type];
  };

  return (
    <div style={containerStyle}>
      <div style={toastStyle}>
        <span style={{ fontSize: '1.25rem' }}>{getIcon(type)}</span>
        <span>{message}</span>
      </div>
    </div>
  );
}
