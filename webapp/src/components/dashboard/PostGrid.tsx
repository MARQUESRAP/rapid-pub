import React from 'react';
import { UnifiedPost } from '@/types/post';
import { PostCard } from './PostCard';
import { LoadingSpinner } from '../shared/LoadingSpinner';

interface PostGridProps {
  posts: UnifiedPost[];
  loading?: boolean;
  onPostClick: (post: UnifiedPost) => void;
}

export function PostGrid({ posts, loading, onPostClick }: PostGridProps) {
  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: 'var(--spacing-lg)',
    marginBottom: 'var(--spacing-xl)',
  };

  const emptyStateStyle: React.CSSProperties = {
    textAlign: 'center',
    padding: 'var(--spacing-2xl)',
    backgroundColor: 'var(--color-white)',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow-md)',
  };

  const emptyIconStyle: React.CSSProperties = {
    fontSize: '3rem',
    marginBottom: 'var(--spacing-md)',
  };

  const emptyTitleStyle: React.CSSProperties = {
    fontSize: '1.25rem',
    fontWeight: 600,
    color: 'var(--color-gray-900)',
    marginBottom: 'var(--spacing-sm)',
  };

  const emptyDescStyle: React.CSSProperties = {
    fontSize: '1rem',
    color: 'var(--color-gray-600)',
  };

  const loadingContainerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 'var(--spacing-2xl)',
    minHeight: '400px',
  };

  // Loading state
  if (loading) {
    return (
      <div style={loadingContainerStyle}>
        <LoadingSpinner size="lg" color="var(--color-orange-primary)" />
      </div>
    );
  }

  // Empty state
  if (posts.length === 0) {
    return (
      <div style={emptyStateStyle}>
        <div style={emptyIconStyle}>📭</div>
        <h3 style={emptyTitleStyle}>Aucun post à afficher</h3>
        <p style={emptyDescStyle}>
          Aucun post ne correspond aux critères de filtrage sélectionnés.
        </p>
      </div>
    );
  }

  // Grid of posts
  return (
    <div style={gridStyle}>
      {posts.map((post) => (
        <PostCard key={post.data.id} post={post} onClick={() => onPostClick(post)} />
      ))}
    </div>
  );
}
