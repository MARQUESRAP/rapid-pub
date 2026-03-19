'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { validatePin, setAuthToken } from '@/lib/auth/pin-auth';
import { Logo } from '../shared/Logo';

export function PinLogin() {
  const router = useRouter();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  const handleNumberClick = (num: string) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);

      // Auto-validate when 4 digits entered
      if (newPin.length === 4) {
        setTimeout(() => validateAndLogin(newPin), 100);
      }
    }
  };

  const handleBackspace = () => {
    setPin(pin.slice(0, -1));
    setError(false);
  };

  const validateAndLogin = (pinToValidate: string) => {
    if (validatePin(pinToValidate)) {
      setAuthToken();
      router.push('/dashboard');
    } else {
      // Show error and shake animation
      setError(true);
      setIsShaking(true);
      setPin('');

      setTimeout(() => {
        setIsShaking(false);
        setError(false);
      }, 500);
    }
  };

  const containerStyle: React.CSSProperties = {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'var(--color-gray-50)',
    padding: 'var(--spacing-md)',
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: 'var(--color-white)',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow-xl)',
    padding: 'var(--spacing-2xl)',
    maxWidth: '400px',
    width: '100%',
    animation: isShaking ? 'shake 0.5s' : undefined,
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '1.5rem',
    fontWeight: 600,
    textAlign: 'center',
    marginTop: 'var(--spacing-xl)',
    marginBottom: 'var(--spacing-md)',
    color: 'var(--color-gray-900)',
  };

  const subtitleStyle: React.CSSProperties = {
    fontSize: '0.875rem',
    textAlign: 'center',
    marginBottom: 'var(--spacing-xl)',
    color: 'var(--color-gray-500)',
  };

  const pinDisplayStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    gap: 'var(--spacing-md)',
    marginBottom: 'var(--spacing-xl)',
  };

  const pinDotStyle = (filled: boolean): React.CSSProperties => ({
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    backgroundColor: filled ? 'var(--color-orange-primary)' : 'var(--color-gray-200)',
    transition: 'all 0.2s ease',
    border: error ? '2px solid var(--color-error)' : 'none',
  });

  const keypadStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 'var(--spacing-md)',
    marginBottom: 'var(--spacing-md)',
  };

  const keyStyle: React.CSSProperties = {
    aspectRatio: '1',
    fontSize: '1.5rem',
    fontWeight: 600,
    border: '2px solid var(--color-gray-200)',
    borderRadius: 'var(--radius-md)',
    backgroundColor: 'var(--color-white)',
    color: 'var(--color-gray-900)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const backspaceStyle: React.CSSProperties = {
    ...keyStyle,
    gridColumn: '1 / -1',
    backgroundColor: 'var(--color-gray-100)',
    fontSize: '1rem',
  };

  const errorMessageStyle: React.CSSProperties = {
    textAlign: 'center',
    color: 'var(--color-error)',
    fontSize: '0.875rem',
    marginTop: 'var(--spacing-md)',
    minHeight: '1.25rem',
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Logo size={32} />
        </div>

        <h1 style={titleStyle}>Connexion</h1>
        <p style={subtitleStyle}>Entrez votre code PIN à 4 chiffres</p>

        {/* PIN Display */}
        <div style={pinDisplayStyle}>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} style={pinDotStyle(i < pin.length)} />
          ))}
        </div>

        {/* Numeric Keypad */}
        <div style={keypadStyle}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              style={keyStyle}
              onClick={() => handleNumberClick(num.toString())}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-gray-50)';
                e.currentTarget.style.borderColor = 'var(--color-orange-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-white)';
                e.currentTarget.style.borderColor = 'var(--color-gray-200)';
              }}
            >
              {num}
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--spacing-md)' }}>
          <div /> {/* Empty space */}
          <button
            style={keyStyle}
            onClick={() => handleNumberClick('0')}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-gray-50)';
              e.currentTarget.style.borderColor = 'var(--color-orange-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-white)';
              e.currentTarget.style.borderColor = 'var(--color-gray-200)';
            }}
          >
            0
          </button>
          <button
            style={{...keyStyle, fontSize: '1.25rem'}}
            onClick={handleBackspace}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-gray-200)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-white)';
            }}
          >
            ⌫
          </button>
        </div>

        {/* Error Message */}
        <div style={errorMessageStyle}>
          {error && 'Code PIN incorrect. Veuillez réessayer.'}
        </div>
      </div>
    </div>
  );
}
