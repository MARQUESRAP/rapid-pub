import React, { useState } from 'react';
import Image from 'next/image';
import { UnifiedPost } from '@/types/post';
import {
  getPostTitle,
  getPostImageUrl,
  getPostCategory,
  getPostCategoryColor,
  getPostScore,
  getPostStatusLabel,
  getPostStatusColors,
} from '@/lib/utils/post-adapters';

interface PostCardProps {
  post: UnifiedPost;
  onClick: () => void;
}

export function PostCard({ post, onClick }: PostCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const title = getPostTitle(post);
  const imageUrl = getPostImageUrl(post);
  const category = getPostCategory(post);
  const categoryColor = getPostCategoryColor(post);
  const score = getPostScore(post);
  const statusLabel = getPostStatusLabel(post);
  const statusColors = getPostStatusColors(post);

  const getScoreColor = (score: number): string => {
    if (score < 7) return 'var(--color-error)';
    if (score < 8) return 'var(--color-warning)';
    return 'var(--color-success)';
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: 'var(--color-white)',
    borderRadius: 'var(--radius-lg)',
    overflow: 'hidden',
    boxShadow: isHovered ? 'var(--shadow-lg)' : 'var(--shadow-md)',
    cursor: 'pointer',
    transition: 'all 0.25s cubic-bezier(0.22, 1, 0.36, 1)',
    transform: isHovered ? 'translateY(-3px)' : 'translateY(0)',
  };

  const imageContainerStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    aspectRatio: '4 / 3',
    backgroundColor: 'var(--color-gray-100)',
    overflow: 'hidden',
  };

  const contentStyle: React.CSSProperties = {
    padding: 'var(--spacing-lg)',
  };

  // Pastel category badge
  const categoryBadgeStyle: React.CSSProperties = {
    display: 'inline-block',
    padding: '4px 10px',
    borderRadius: 'var(--radius-full)',
    fontSize: '0.7rem',
    fontWeight: 600,
    backgroundColor: `${categoryColor}12`,
    color: categoryColor,
    marginBottom: 'var(--spacing-sm)',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '0.95rem',
    fontWeight: 600,
    color: 'var(--color-gray-900)',
    marginBottom: 'var(--spacing-md)',
    lineHeight: 1.4,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  };

  const footerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 'var(--spacing-md)',
  };

  const scoreStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '0.8rem',
    fontWeight: 600,
    color: getScoreColor(score),
  };

  const statusBadgeStyle: React.CSSProperties = {
    padding: '4px 10px',
    borderRadius: 'var(--radius-full)',
    fontSize: '0.7rem',
    fontWeight: 600,
    backgroundColor: statusColors.bg,
    color: statusColors.text,
  };

  const promoBadgeStyle: React.CSSProperties = {
    position: 'absolute',
    top: '10px',
    right: '10px',
    padding: '3px 8px',
    borderRadius: 'var(--radius-full)',
    fontSize: '0.6rem',
    fontWeight: 700,
    backgroundColor: 'rgba(164,198,57,0.15)',
    color: 'var(--color-green-accent)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    zIndex: 1,
    backdropFilter: 'blur(8px)',
  };

  return (
    <div
      style={cardStyle}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image */}
      <div style={imageContainerStyle}>
        {post.postType === 'promo' && (
          <span style={promoBadgeStyle}>Promo</span>
        )}
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            style={{ objectFit: 'cover' }}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-gray-400)',
              fontSize: '0.875rem',
            }}
          >
            Pas d&apos;image
          </div>
        )}
      </div>

      {/* Content */}
      <div style={contentStyle}>
        <span style={categoryBadgeStyle}>{category}</span>
        <h3 style={titleStyle}>{title}</h3>

        <div style={footerStyle}>
          {post.postType !== 'promo' && (
            <div style={scoreStyle}>
              <span>⭐</span>
              <span>{score.toFixed(1)}/10</span>
            </div>
          )}
          <div style={statusBadgeStyle}>
            {statusLabel}
          </div>
        </div>
      </div>
    </div>
  );
}
