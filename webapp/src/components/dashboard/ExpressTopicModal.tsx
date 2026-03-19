import React, { useState, useEffect } from 'react';
import { Button } from '@/components/shared/Button';
import { expressTopicWebhook } from '@/lib/webhooks/n8n';

interface ExpressTopicModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onShowToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export function ExpressTopicModal({ isOpen, onClose, onSuccess, onShowToast }: ExpressTopicModalProps) {
  const [sujet, setSujet] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!sujet.trim()) return;

    setIsLoading(true);
    try {
      const result = await expressTopicWebhook(sujet.trim(), notes.trim() || undefined);

      if (result.success) {
        onShowToast(result.message || 'Génération du post en cours...', 'success');
        setSujet('');
        setNotes('');
        onClose();
        onSuccess();
      } else {
        onShowToast(result.error || 'Erreur lors de la génération', 'error');
      }
    } catch {
      onShowToast('Erreur lors de la génération du post', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 'var(--spacing-md)',
    zIndex: 2000,
    animation: 'fadeIn 0.2s ease-in',
  };

  const dialogStyle: React.CSSProperties = {
    backgroundColor: 'var(--color-white)',
    borderRadius: 'var(--radius-lg)',
    maxWidth: '480px',
    width: '100%',
    padding: 'var(--spacing-xl)',
    boxShadow: 'var(--shadow-xl)',
    animation: 'slideUp 0.3s ease-out',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '1.25rem',
    fontWeight: 600,
    color: 'var(--color-gray-900)',
    marginBottom: 'var(--spacing-sm)',
  };

  const descStyle: React.CSSProperties = {
    fontSize: '0.85rem',
    color: 'var(--color-gray-500)',
    marginBottom: 'var(--spacing-lg)',
    lineHeight: 1.5,
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.85rem',
    fontWeight: 500,
    color: 'var(--color-gray-700)',
    marginBottom: '6px',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 14px',
    fontSize: '0.9rem',
    border: '1px solid var(--color-gray-200)',
    borderRadius: 'var(--radius-md)',
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
  };

  const textareaStyle: React.CSSProperties = {
    ...inputStyle,
    minHeight: '80px',
    resize: 'vertical' as const,
    fontFamily: 'inherit',
  };

  const actionsStyle: React.CSSProperties = {
    display: 'flex',
    gap: 'var(--spacing-md)',
    justifyContent: 'flex-end',
    marginTop: 'var(--spacing-xl)',
  };

  return (
    <div
      style={overlayStyle}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) {
          onClose();
        }
      }}
    >
      <div style={dialogStyle} onClick={(e) => e.stopPropagation()}>
        <h3 style={titleStyle}>Sujet Express</h3>
        <p style={descStyle}>
          Saisissez un theme ou sujet pour generer un post LinkedIn complet automatiquement.
        </p>

        <div style={{ marginBottom: 'var(--spacing-md)' }}>
          <label style={labelStyle}>Theme / sujet du post *</label>
          <input
            type="text"
            style={inputStyle}
            placeholder="Ex: L'importance du packaging eco-responsable"
            value={sujet}
            onChange={(e) => setSujet(e.target.value)}
            disabled={isLoading}
            onFocus={(e) => (e.target.style.borderColor = 'var(--color-orange-primary)')}
            onBlur={(e) => (e.target.style.borderColor = 'var(--color-gray-200)')}
            autoFocus
          />
        </div>

        <div>
          <label style={labelStyle}>Notes (optionnel)</label>
          <textarea
            style={textareaStyle}
            placeholder="Contexte, angle souhaite, ton particulier..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={isLoading}
            onFocus={(e) => (e.target.style.borderColor = 'var(--color-orange-primary)')}
            onBlur={(e) => (e.target.style.borderColor = 'var(--color-gray-200)')}
          />
        </div>

        <div style={actionsStyle}>
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            Annuler
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            loading={isLoading}
            disabled={isLoading || !sujet.trim()}
          >
            Generer
          </Button>
        </div>
      </div>
    </div>
  );
}
