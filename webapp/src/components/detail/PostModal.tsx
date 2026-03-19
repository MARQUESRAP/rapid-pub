import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { UnifiedPost } from '@/types/post';
import { LinkedInPreview } from './LinkedInPreview';
import { ActionButtons } from './ActionButtons';
import { supabase } from '@/lib/supabase/client';
import { getPostTitle, isModifying, isAwaitingValidation } from '@/lib/utils/post-adapters';
import { Button } from '@/components/shared/Button';
import { updatePost, updatePromoPost } from '@/lib/supabase/queries';

export interface EditedContent {
  hook: string;
  corps: string;
  cta: string;
}

interface PostModalProps {
  post: UnifiedPost | null;
  isOpen: boolean;
  onClose: () => void;
  onPostUpdated: () => void;
  onShowToast: (message: string, type: 'success' | 'error' | 'info') => void;
  onDeletePost?: (post: UnifiedPost) => void;
}

export function PostModal({ post, isOpen, onClose, onPostUpdated, onShowToast, onDeletePost }: PostModalProps) {
  const [editedContent, setEditedContent] = useState<EditedContent>({ hook: '', corps: '', cta: '' });
  const [isSaving, setIsSaving] = useState(false);

  // Sync edited content when post changes
  useEffect(() => {
    if (post) {
      setEditedContent({
        hook: post.data.hook || '',
        corps: post.data.corps || '',
        cta: post.data.cta || '',
      });
    }
  }, [post?.data.id, isOpen]);

  // Detect if content has been modified
  const hasChanges = useMemo(() => {
    if (!post) return false;
    return (
      editedContent.hook !== (post.data.hook || '') ||
      editedContent.corps !== (post.data.corps || '') ||
      editedContent.cta !== (post.data.cta || '')
    );
  }, [post, editedContent]);

  const handleSaveEdit = useCallback(async () => {
    if (!post) return;

    setIsSaving(true);
    try {
      let result;
      if (post.postType === 'generic') {
        const versionPrecedente = {
          hook: post.data.hook || '',
          corps: post.data.corps || '',
          cta: post.data.cta || '',
          hashtags: post.data.hashtags as string[],
          saved_at: new Date().toISOString(),
        };
        result = await updatePost(post.data.id, {
          hook: editedContent.hook,
          corps: editedContent.corps,
          cta: editedContent.cta,
          version_precedente: versionPrecedente,
          updated_at: new Date().toISOString(),
        });
      } else {
        const versionPrecedente = {
          hook: post.data.hook || '',
          corps: post.data.corps || '',
          cta: post.data.cta || '',
          hashtags: post.data.hashtags as string,
          saved_at: new Date().toISOString(),
        };
        result = await updatePromoPost(post.data.id, {
          hook: editedContent.hook,
          corps: editedContent.corps,
          cta: editedContent.cta,
          version_precedente: versionPrecedente,
          updated_at: new Date().toISOString(),
        });
      }

      if (result) {
        onShowToast('Post enregistré avec succès', 'success');
        onPostUpdated();
      } else {
        onShowToast('Erreur lors de l\'enregistrement', 'error');
      }
    } catch (error) {
      console.error('Save error:', error);
      onShowToast('Erreur lors de l\'enregistrement', 'error');
    } finally {
      setIsSaving(false);
    }
  }, [post, editedContent, onPostUpdated, onShowToast]);

  const handleDiscardChanges = useCallback(() => {
    if (post) {
      setEditedContent({
        hook: post.data.hook || '',
        corps: post.data.corps || '',
        cta: post.data.cta || '',
      });
    }
  }, [post]);

  // Close modal on ESC key and subscribe to post updates
  useEffect(() => {
    if (!isOpen || !post) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    // Subscribe to post updates on the correct table
    const tableName = post.postType === 'generic' ? 'posts' : 'posts_promo';
    const subscription = supabase
      .channel(`post-${post.data.id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: tableName, filter: `id=eq.${post.data.id}` },
        (payload) => {
          // Check if modification is complete
          const updatedPost = post.postType === 'generic'
            ? { postType: 'generic' as const, data: payload.new as typeof post.data }
            : { postType: 'promo' as const, data: payload.new as typeof post.data };

          if (!isModifying(updatedPost)) {
            onShowToast('Post mis à jour', 'success');
            onPostUpdated();
          }
        }
      )
      .subscribe();

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
      subscription.unsubscribe();
    };
  }, [isOpen, post, onClose, onPostUpdated, onShowToast]);

  if (!isOpen || !post) return null;

  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 'var(--spacing-md)',
    zIndex: 1000,
    animation: 'fadeIn 0.2s ease-in',
  };

  const modalStyle: React.CSSProperties = {
    backgroundColor: 'var(--color-white)',
    borderRadius: '20px',
    maxWidth: '800px',
    width: '100%',
    maxHeight: '90vh',
    overflow: 'auto',
    position: 'relative',
    animation: 'slideUp 0.3s ease-out',
    boxShadow: 'var(--shadow-xl)',
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 'var(--spacing-lg)',
    position: 'sticky',
    top: 0,
    backgroundColor: 'var(--color-white)',
    zIndex: 1,
    borderRadius: '20px 20px 0 0',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '1.25rem',
    fontWeight: 600,
    color: 'var(--color-gray-900)',
  };

  const closeButtonStyle: React.CSSProperties = {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    border: 'none',
    backgroundColor: 'var(--color-gray-100)',
    color: 'var(--color-gray-700)',
    fontSize: '1.25rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
  };

  const contentStyle: React.CSSProperties = {
    padding: 'var(--spacing-xl)',
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={headerStyle}>
          <h2 style={titleStyle}>{getPostTitle(post)}</h2>
          <button
            style={closeButtonStyle}
            onClick={onClose}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-gray-200)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-gray-100)';
            }}
            aria-label="Fermer"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div style={contentStyle}>
          {/* LinkedIn Preview — always editable */}
          <LinkedInPreview
            post={post}
            editedContent={editedContent}
            onEditedContentChange={setEditedContent}
          />

          {/* Action Buttons */}
          <ActionButtons
            post={post}
            onPostUpdated={onPostUpdated}
            onShowToast={onShowToast}
            hasChanges={hasChanges}
            isSaving={isSaving}
            onSaveEdit={handleSaveEdit}
            onDiscardChanges={handleDiscardChanges}
          />

          {/* Delete button — only for unvalidated posts */}
          {onDeletePost && isAwaitingValidation(post) && (
            <div style={{
              marginTop: 'var(--spacing-xl)',
              paddingTop: 'var(--spacing-lg)',
              borderTop: '1px solid var(--color-gray-100)',
              display: 'flex',
              justifyContent: 'center',
            }}>
              <Button
                variant="danger"
                size="sm"
                onClick={() => {
                  onDeletePost(post);
                  onClose();
                }}
              >
                Supprimer ce post
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
