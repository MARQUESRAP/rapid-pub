import { useState, useCallback } from 'react';
import { Post } from '@/types/post';
import { schedulePost } from '@/lib/scheduling/auto-schedule';

interface UseOptimisticValidationResult {
  isValidating: boolean;
  optimisticPost: Post | null;
  validatePost: (post: Post) => Promise<{
    success: boolean;
    scheduledDate?: string;
    error?: string;
  }>;
  resetOptimistic: () => void;
}

/**
 * Hook for optimistic UI updates during post validation
 * Updates the UI immediately before the API call completes
 */
export function useOptimisticValidation(): UseOptimisticValidationResult {
  const [isValidating, setIsValidating] = useState(false);
  const [optimisticPost, setOptimisticPost] = useState<Post | null>(null);

  const validatePost = useCallback(async (post: Post) => {
    if (post.statut === 'valide') {
      return {
        success: false,
        error: 'Ce post est déjà validé',
      };
    }

    setIsValidating(true);

    // Optimistic update: immediately update UI
    const optimisticUpdate: Post = {
      ...post,
      statut: 'valide',
      validated_at: new Date().toISOString(),
    };
    setOptimisticPost(optimisticUpdate);

    try {
      // Actual API call
      const result = await schedulePost(post.id);

      if (result.success && result.scheduledDate) {
        // Update optimistic post with real scheduled date
        setOptimisticPost({
          ...optimisticUpdate,
          date_publication_prevue: result.scheduledDate,
        });

        return {
          success: true,
          scheduledDate: result.scheduledDate,
        };
      } else {
        // Revert optimistic update on error
        setOptimisticPost(null);
        return {
          success: false,
          error: result.error || 'Erreur lors de la validation',
        };
      }
    } catch (error) {
      // Revert optimistic update on error
      setOptimisticPost(null);
      console.error('Validation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      };
    } finally {
      setIsValidating(false);
    }
  }, []);

  const resetOptimistic = useCallback(() => {
    setOptimisticPost(null);
  }, []);

  return {
    isValidating,
    optimisticPost,
    validatePost,
    resetOptimistic,
  };
}
