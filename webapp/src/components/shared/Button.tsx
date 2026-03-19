import React, { useState } from 'react';
import { LoadingSpinner } from './LoadingSpinner';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  const isDisabled = disabled || loading;

  const sizeStyles: Record<ButtonSize, React.CSSProperties> = {
    sm: { padding: '6px 14px', fontSize: '0.8rem', borderRadius: '8px' },
    md: { padding: '9px 20px', fontSize: '0.875rem', borderRadius: '10px' },
    lg: { padding: '12px 28px', fontSize: '0.95rem', borderRadius: '12px' },
  };

  const getVariantStyles = (): React.CSSProperties => {
    const hovered = isHovered && !isDisabled;

    switch (variant) {
      case 'primary':
        return {
          background: hovered
            ? 'linear-gradient(135deg, #d4440f 0%, #E94E1B 100%)'
            : 'linear-gradient(135deg, #E94E1B 0%, #FF6B3D 100%)',
          color: '#fff',
          border: 'none',
          boxShadow: hovered
            ? '0 4px 14px rgba(233, 78, 27, 0.35)'
            : '0 2px 8px rgba(233, 78, 27, 0.2)',
        };
      case 'secondary':
        return {
          background: hovered
            ? 'linear-gradient(135deg, #8fb030 0%, #A4C639 100%)'
            : 'linear-gradient(135deg, #A4C639 0%, #b8d94d 100%)',
          color: '#fff',
          border: 'none',
          boxShadow: hovered
            ? '0 4px 14px rgba(164, 198, 57, 0.35)'
            : '0 2px 8px rgba(164, 198, 57, 0.2)',
        };
      case 'outline':
        return {
          background: hovered ? 'rgba(233, 78, 27, 0.04)' : 'transparent',
          color: 'var(--color-orange-primary)',
          border: '1.5px solid var(--color-gray-200)',
          borderColor: hovered ? 'var(--color-orange-primary)' : 'var(--color-gray-200)',
          boxShadow: 'none',
        };
      case 'ghost':
        return {
          background: hovered ? 'var(--color-gray-100)' : 'transparent',
          color: 'var(--color-gray-600)',
          border: 'none',
          boxShadow: 'none',
        };
      case 'danger':
        return {
          background: hovered
            ? 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)'
            : 'transparent',
          color: hovered ? '#fff' : '#EF4444',
          border: hovered ? 'none' : '1.5px solid rgba(239, 68, 68, 0.3)',
          boxShadow: hovered ? '0 4px 14px rgba(239, 68, 68, 0.25)' : 'none',
        };
      default:
        return {};
    }
  };

  const baseStyles: React.CSSProperties = {
    fontFamily: 'var(--font-family)',
    fontWeight: 500,
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s cubic-bezier(0.22, 1, 0.36, 1)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    opacity: isDisabled ? 0.5 : 1,
    width: fullWidth ? '100%' : 'auto',
    letterSpacing: '0.01em',
    lineHeight: 1,
    whiteSpace: 'nowrap',
    ...sizeStyles[size],
    ...getVariantStyles(),
  };

  return (
    <button
      style={baseStyles}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      disabled={isDisabled}
      {...props}
    >
      {loading && <LoadingSpinner size="sm" />}
      {children}
    </button>
  );
}
