import React from 'react';
import Image from 'next/image';
import { UnifiedPost } from '@/types/post';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  getPostTitle,
  getPostImageUrl,
  getPostHashtags,
  getPostScheduledDate,
  isValidated,
} from '@/lib/utils/post-adapters';
import { EditedContent } from './PostModal';

interface LinkedInPreviewProps {
  post: UnifiedPost;
  editedContent: EditedContent;
  onEditedContentChange: (content: EditedContent) => void;
}

export function LinkedInPreview({ post, editedContent, onEditedContentChange }: LinkedInPreviewProps) {
  const imageUrl = getPostImageUrl(post);
  const title = getPostTitle(post);
  const hashtagsArray = getPostHashtags(post);
  const scheduledDate = getPostScheduledDate(post);

  const containerStyle: React.CSSProperties = {
    backgroundColor: 'var(--color-white)',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--color-gray-200)',
    overflow: 'hidden',
    maxWidth: '600px',
    margin: '0 auto',
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-md)',
    padding: 'var(--spacing-lg)',
  };

  const avatarStyle: React.CSSProperties = {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    backgroundColor: 'var(--color-orange-primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--color-white)',
    fontSize: '1.25rem',
    fontWeight: 700,
    flexShrink: 0,
  };

  const profileInfoStyle: React.CSSProperties = {
    flex: 1,
  };

  const companyNameStyle: React.CSSProperties = {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: 'var(--color-gray-900)',
    marginBottom: '2px',
  };

  const metaStyle: React.CSSProperties = {
    fontSize: '0.75rem',
    color: 'var(--color-gray-600)',
  };

  const contentStyle: React.CSSProperties = {
    padding: '0 var(--spacing-lg) var(--spacing-lg)',
  };

  const hashtagsStyle: React.CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 'var(--spacing-xs)',
    marginBottom: 'var(--spacing-md)',
  };

  const hashtagStyle: React.CSSProperties = {
    fontSize: '0.875rem',
    color: '#0A66C2',
    fontWeight: 500,
  };

  const imageContainerStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    aspectRatio: '16 / 9',
    backgroundColor: 'var(--color-gray-100)',
  };

  const actionsStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-around',
    padding: 'var(--spacing-md)',
    borderTop: '1px solid var(--color-gray-200)',
  };

  const actionButtonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-xs)',
    padding: 'var(--spacing-sm) var(--spacing-md)',
    fontSize: '0.875rem',
    fontWeight: 600,
    color: 'var(--color-gray-600)',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: 'var(--radius-sm)',
    cursor: 'not-allowed',
    opacity: 0.6,
  };

  const scheduledDateStyle: React.CSSProperties = {
    padding: 'var(--spacing-md) var(--spacing-lg)',
    backgroundColor: 'var(--color-green-accent)10',
    borderTop: '1px solid var(--color-green-accent)30',
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-sm)',
    fontSize: '0.875rem',
    color: 'var(--color-gray-700)',
  };

  // Textarea styled to look like normal text, becomes visible on focus
  const editableTextStyle: React.CSSProperties = {
    width: '100%',
    padding: '4px 6px',
    margin: '-4px -6px',
    fontSize: '0.875rem',
    lineHeight: 1.6,
    color: 'var(--color-gray-900)',
    border: '1.5px solid transparent',
    borderRadius: 'var(--radius-sm)',
    fontFamily: 'var(--font-family)',
    resize: 'none',
    backgroundColor: 'transparent',
    boxSizing: 'border-box' as const,
    overflow: 'hidden',
    transition: 'border-color 0.15s ease, background-color 0.15s ease',
  };

  const sectionStyle: React.CSSProperties = {
    marginBottom: '8px',
  };

  const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    e.currentTarget.style.borderColor = 'var(--color-orange-primary)';
    e.currentTarget.style.backgroundColor = 'rgba(233, 78, 27, 0.03)';
  };

  const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    e.currentTarget.style.borderColor = 'transparent';
    e.currentTarget.style.backgroundColor = 'transparent';
  };

  // Auto-resize textarea to fit content
  const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const el = e.currentTarget;
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
  };

  // Set initial height on mount via ref callback
  const autoSizeRef = (el: HTMLTextAreaElement | null) => {
    if (el) {
      el.style.height = 'auto';
      el.style.height = el.scrollHeight + 'px';
    }
  };

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <div style={avatarStyle}>RP</div>
        <div style={profileInfoStyle}>
          <div style={companyNameStyle}>Rapid Pub</div>
          <div style={metaStyle}>Imprimerie en ligne B2B • 24h</div>
        </div>
      </div>

      {/* Content — always editable */}
      <div style={contentStyle}>
        <div style={sectionStyle}>
          <textarea
            ref={autoSizeRef}
            value={editedContent.hook}
            onChange={(e) => {
              onEditedContentChange({ ...editedContent, hook: e.target.value });
              handleInput(e);
            }}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onInput={handleInput}
            style={{ ...editableTextStyle, fontWeight: 600 }}
            rows={1}
          />
        </div>
        <div style={sectionStyle}>
          <textarea
            ref={autoSizeRef}
            value={editedContent.corps}
            onChange={(e) => {
              onEditedContentChange({ ...editedContent, corps: e.target.value });
              handleInput(e);
            }}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onInput={handleInput}
            style={editableTextStyle}
            rows={1}
          />
        </div>
        <div style={sectionStyle}>
          <textarea
            ref={autoSizeRef}
            value={editedContent.cta}
            onChange={(e) => {
              onEditedContentChange({ ...editedContent, cta: e.target.value });
              handleInput(e);
            }}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onInput={handleInput}
            style={editableTextStyle}
            rows={1}
          />
        </div>

        {/* Hashtags */}
        <div style={hashtagsStyle}>
          {hashtagsArray.map((tag, index) => (
            <span key={index} style={hashtagStyle}>
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Image */}
      {imageUrl && (
        <div style={imageContainerStyle}>
          <Image
            src={imageUrl}
            alt={title}
            fill
            style={{ objectFit: 'cover' }}
            sizes="600px"
          />
        </div>
      )}

      {/* Actions (disabled) */}
      <div style={actionsStyle}>
        <button style={actionButtonStyle} disabled>
          <span>👍</span>
          <span>J&apos;aime</span>
        </button>
        <button style={actionButtonStyle} disabled>
          <span>💬</span>
          <span>Commenter</span>
        </button>
        <button style={actionButtonStyle} disabled>
          <span>🔄</span>
          <span>Partager</span>
        </button>
      </div>

      {/* Scheduled date (if validated) */}
      {isValidated(post) && scheduledDate && (
        <div style={scheduledDateStyle}>
          <span>📅</span>
          <span>
            <strong>Publication prévue :</strong>{' '}
            {format(new Date(scheduledDate), "EEEE d MMMM yyyy 'à' HH'h'mm", {
              locale: fr,
            })}
          </span>
        </div>
      )}
    </div>
  );
}
