'use client';

import React, { Component, ReactNode } from 'react';
import { Button } from './Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const containerStyle: React.CSSProperties = {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--spacing-xl)',
        backgroundColor: 'var(--color-gray-50)',
      };

      const cardStyle: React.CSSProperties = {
        backgroundColor: 'var(--color-white)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--spacing-2xl)',
        maxWidth: '500px',
        width: '100%',
        textAlign: 'center',
        boxShadow: 'var(--shadow-xl)',
      };

      const iconStyle: React.CSSProperties = {
        fontSize: '4rem',
        marginBottom: 'var(--spacing-lg)',
      };

      const titleStyle: React.CSSProperties = {
        fontSize: '1.5rem',
        fontWeight: 700,
        color: 'var(--color-gray-900)',
        marginBottom: 'var(--spacing-md)',
      };

      const messageStyle: React.CSSProperties = {
        fontSize: '1rem',
        color: 'var(--color-gray-600)',
        marginBottom: 'var(--spacing-xl)',
        lineHeight: 1.6,
      };

      const errorDetailsStyle: React.CSSProperties = {
        backgroundColor: 'var(--color-gray-100)',
        padding: 'var(--spacing-md)',
        borderRadius: 'var(--radius-md)',
        marginBottom: 'var(--spacing-xl)',
        fontSize: '0.875rem',
        color: 'var(--color-gray-700)',
        fontFamily: 'monospace',
        textAlign: 'left',
        overflow: 'auto',
        maxHeight: '150px',
      };

      return (
        <div style={containerStyle}>
          <div style={cardStyle}>
            <div style={iconStyle}>⚠️</div>
            <h1 style={titleStyle}>Une erreur est survenue</h1>
            <p style={messageStyle}>
              Désolé, quelque chose s&apos;est mal passé. L&apos;équipe a été notifiée
              et nous travaillons à résoudre le problème.
            </p>

            {this.state.error && (
              <details>
                <summary
                  style={{
                    cursor: 'pointer',
                    marginBottom: 'var(--spacing-md)',
                    color: 'var(--color-gray-600)',
                    fontSize: '0.875rem',
                  }}
                >
                  Détails de l&apos;erreur
                </summary>
                <div style={errorDetailsStyle}>
                  {this.state.error.toString()}
                </div>
              </details>
            )}

            <div
              style={{
                display: 'flex',
                gap: 'var(--spacing-md)',
                justifyContent: 'center',
              }}
            >
              <Button variant="outline" onClick={() => window.location.reload()}>
                Recharger la page
              </Button>
              <Button variant="primary" onClick={this.handleReset}>
                Réessayer
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
