import React, { useState, useRef, useCallback } from 'react';
import { UnifiedPost } from '@/types/post';
import { Button } from '../shared/Button';
import { schedulePost, schedulePromoPost } from '@/lib/scheduling/auto-schedule';
import { modifyTextWebhook, modifyImageWebhook, restoreVersionWebhook } from '@/lib/webhooks/n8n';
import { formatScheduledDateLong } from '@/lib/utils/date-formatter';
import { isValidated } from '@/lib/utils/post-adapters';

/* ── Pill-style action button ── */
interface ActionPillProps {
  icon: string;
  label: string;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
}

function ActionPill({ icon, label, onClick, active, disabled }: ActionPillProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const [hovered, setHovered] = useState(false);

  const handleClick = useCallback(() => {
    if (disabled) return;
    const el = ref.current;
    if (el) {
      el.classList.remove('action-btn-press');
      void el.offsetWidth;
      el.classList.add('action-btn-press');
    }
    onClick();
  }, [onClick, disabled]);

  const style: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 14px',
    background: active
      ? 'var(--color-gray-900)'
      : hovered
        ? 'var(--color-gray-100)'
        : 'var(--color-white)',
    color: active ? '#fff' : 'var(--color-gray-700)',
    border: active ? '1px solid var(--color-gray-900)' : '1px solid var(--color-gray-200)',
    borderRadius: '10px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.45 : 1,
    fontSize: '0.8rem',
    fontWeight: 500,
    fontFamily: 'var(--font-family)',
    transition: 'all 0.2s cubic-bezier(0.22, 1, 0.36, 1)',
    whiteSpace: 'nowrap',
  };

  return (
    <button
      ref={ref}
      style={style}
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      disabled={disabled}
    >
      <span style={{ fontSize: '0.95rem', lineHeight: 1 }}>{icon}</span>
      {label}
    </button>
  );
}

/* ── Main component ── */
interface ActionButtonsProps {
  post: UnifiedPost;
  onPostUpdated: () => void;
  onShowToast: (message: string, type: 'success' | 'error' | 'info') => void;
  hasChanges?: boolean;
  isSaving?: boolean;
  onSaveEdit?: () => void;
  onDiscardChanges?: () => void;
}

export function ActionButtons({ post, onPostUpdated, onShowToast, hasChanges, isSaving, onSaveEdit, onDiscardChanges }: ActionButtonsProps) {
  const [isValidating, setIsValidating] = useState(false);
  const [isModifyingText, setIsModifyingText] = useState(false);
  const [isModifyingImage, setIsModifyingImage] = useState(false);
  const [showTextPrompt, setShowTextPrompt] = useState(false);
  const [showImagePrompt, setShowImagePrompt] = useState(false);
  const [textPrompt, setTextPrompt] = useState('');
  const [imagePrompt, setImagePrompt] = useState('');
  const [isRestoring, setIsRestoring] = useState(false);

  const alreadyValidated = isValidated(post);

  const handleValidate = async () => {
    if (alreadyValidated) {
      onShowToast('Ce post est déjà validé', 'info');
      return;
    }
    setIsValidating(true);
    onShowToast('Validation en cours...', 'info');
    try {
      const result = post.postType === 'generic'
        ? await schedulePost(post.data.id)
        : await schedulePromoPost(post.data.id);
      if (result.success && result.scheduledDate) {
        const formattedDate = formatScheduledDateLong(result.scheduledDate);
        onShowToast(`✓ Post validé et planifié pour le ${formattedDate}`, 'success');
        setTimeout(() => { onPostUpdated(); }, 500);
      } else {
        onShowToast(result.error || 'Erreur lors de la validation', 'error');
      }
    } catch (error) {
      console.error('Validation error:', error);
      onShowToast('Erreur lors de la validation du post', 'error');
    } finally {
      setIsValidating(false);
    }
  };

  const handleModifyText = async () => {
    if (!textPrompt.trim()) { onShowToast('Veuillez entrer un prompt', 'error'); return; }
    setIsModifyingText(true);
    try {
      const result = await modifyTextWebhook(post.data.id, textPrompt, post.postType);
      if (result.success) {
        onShowToast(result.message || 'Modification en cours...', 'info');
        setShowTextPrompt(false);
        setTextPrompt('');
      } else {
        onShowToast(result.error || 'Erreur lors de la modification', 'error');
      }
    } catch (error) {
      console.error('Text modification error:', error);
      onShowToast('Erreur lors de la modification du texte', 'error');
    } finally {
      setIsModifyingText(false);
    }
  };

  const handleModifyImage = async () => {
    if (!imagePrompt.trim()) { onShowToast('Veuillez entrer un prompt', 'error'); return; }
    setIsModifyingImage(true);
    try {
      const result = await modifyImageWebhook(post.data.id, imagePrompt, post.postType);
      if (result.success) {
        onShowToast(result.message || 'Modification en cours...', 'info');
        setShowImagePrompt(false);
        setImagePrompt('');
      } else {
        onShowToast(result.error || 'Erreur lors de la modification', 'error');
      }
    } catch (error) {
      console.error('Image modification error:', error);
      onShowToast('Erreur lors de la modification de l\'image', 'error');
    } finally {
      setIsModifyingImage(false);
    }
  };

  const handleRestoreVersion = async () => {
    if (!post.data.version_precedente) { onShowToast('Aucune version précédente disponible', 'info'); return; }
    if (!confirm('Êtes-vous sûr de vouloir restaurer la version précédente ?')) return;
    setIsRestoring(true);
    try {
      const result = await restoreVersionWebhook(post.data.id, post.postType);
      if (result.success) {
        onShowToast(result.message || 'Version restaurée', 'success');
        setTimeout(() => { onPostUpdated(); }, 500);
      } else {
        onShowToast(result.error || 'Erreur lors de la restauration', 'error');
      }
    } catch (error) {
      console.error('Restore error:', error);
      onShowToast('Erreur lors de la restauration', 'error');
    } finally {
      setIsRestoring(false);
    }
  };

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginTop: 'var(--spacing-xl)',
  };

  const pillsRowStyle: React.CSSProperties = {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  };

  const promptPanelStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    padding: '14px',
    backgroundColor: 'var(--color-gray-50)',
    borderRadius: '12px',
    border: '1px solid var(--color-gray-200)',
    animation: 'slideDown 0.25s ease-out',
  };

  const inputStyle: React.CSSProperties = {
    padding: '10px 12px',
    fontSize: '0.85rem',
    border: '1.5px solid var(--color-gray-200)',
    borderRadius: '10px',
    fontFamily: 'var(--font-family)',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
    outline: 'none',
  };

  const saveBarStyle: React.CSSProperties = {
    display: 'flex',
    gap: '10px',
    padding: '10px 14px',
    backgroundColor: 'var(--color-gray-50)',
    borderRadius: '12px',
    border: '1px solid var(--color-gray-200)',
    alignItems: 'center',
    animation: 'slideDown 0.25s ease-out',
  };

  const chipStyle: React.CSSProperties = {
    padding: '4px 10px',
    fontSize: '0.72rem',
    fontWeight: 500,
    backgroundColor: 'var(--color-white)',
    border: '1px solid var(--color-gray-200)',
    borderRadius: '8px',
    cursor: 'pointer',
    color: 'var(--color-gray-500)',
    fontFamily: 'var(--font-family)',
    transition: 'all 0.15s ease',
  };

  return (
    <div style={containerStyle}>
      {/* Save bar */}
      {hasChanges && (
        <div style={saveBarStyle}>
          <div style={{ flex: 1, fontSize: '0.8rem', color: 'var(--color-gray-500)', fontWeight: 500 }}>
            Modifications non enregistrées
          </div>
          <Button variant="ghost" size="sm" onClick={onDiscardChanges} disabled={isSaving}>
            Annuler
          </Button>
          <Button variant="secondary" size="sm" onClick={onSaveEdit} loading={isSaving}>
            Enregistrer
          </Button>
        </div>
      )}

      {/* Validate */}
      <Button
        variant="secondary"
        size="lg"
        onClick={handleValidate}
        loading={isValidating}
        disabled={alreadyValidated}
        fullWidth
      >
        {alreadyValidated ? '✓ Déjà validé' : '✓ Valider'}
      </Button>

      {/* Action pills */}
      <div style={pillsRowStyle}>
        <ActionPill
          icon="🤖"
          label="Modifier par IA"
          onClick={() => { setShowTextPrompt(!showTextPrompt); setShowImagePrompt(false); }}
          active={showTextPrompt}
        />
        {post.postType === 'generic' && (
          <ActionPill
            icon="🖼️"
            label="Modifier l'image"
            onClick={() => { setShowImagePrompt(!showImagePrompt); setShowTextPrompt(false); }}
            active={showImagePrompt}
          />
        )}
        {post.data.version_precedente && (
          <ActionPill
            icon="↩️"
            label="Restaurer"
            onClick={handleRestoreVersion}
            disabled={isRestoring}
          />
        )}
      </div>

      {/* Text Prompt Panel */}
      {showTextPrompt && (
        <div style={promptPanelStyle}>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-gray-700)' }}>
            Décrivez comment modifier le texte
          </div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {['Rends le hook plus punchy', 'Ajoute des émojis', 'Simplifie le langage'].map((example) => (
              <button
                key={example}
                type="button"
                onClick={() => setTextPrompt(example)}
                style={chipStyle}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-gray-900)';
                  e.currentTarget.style.color = '#fff';
                  e.currentTarget.style.borderColor = 'var(--color-gray-900)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-white)';
                  e.currentTarget.style.color = 'var(--color-gray-500)';
                  e.currentTarget.style.borderColor = 'var(--color-gray-200)';
                }}
              >
                {example}
              </button>
            ))}
          </div>
          <textarea
            id="text-prompt"
            placeholder="Ex: Rends le hook plus punchy et ajoute des émojis"
            value={textPrompt}
            onChange={(e) => setTextPrompt(e.target.value)}
            rows={3}
            style={{ ...inputStyle, resize: 'vertical', minHeight: '70px' }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-gray-400)';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,0,0,0.04)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-gray-200)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--color-gray-400)' }}>
              {textPrompt.length} caractères
            </span>
            <div style={{ display: 'flex', gap: '6px' }}>
              <Button variant="ghost" size="sm" onClick={() => { setShowTextPrompt(false); setTextPrompt(''); }}>
                Annuler
              </Button>
              <Button variant="primary" size="sm" onClick={handleModifyText} loading={isModifyingText}>
                Envoyer
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Image Prompt Panel */}
      {showImagePrompt && (
        <div style={promptPanelStyle}>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-gray-700)' }}>
            Décrivez comment modifier l&apos;image
          </div>
          <input
            id="image-prompt"
            type="text"
            placeholder="Ex: Rends l'image plus lumineuse"
            value={imagePrompt}
            onChange={(e) => setImagePrompt(e.target.value)}
            style={inputStyle}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-gray-400)';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,0,0,0.04)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-gray-200)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
          <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
            <Button variant="ghost" size="sm" onClick={() => { setShowImagePrompt(false); setImagePrompt(''); }}>
              Annuler
            </Button>
            <Button variant="primary" size="sm" onClick={handleModifyImage} loading={isModifyingImage}>
              Envoyer
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
