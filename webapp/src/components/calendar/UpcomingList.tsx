'use client';

import React from 'react';
import { UnifiedPost } from '@/types/post';
import { formatScheduledDate } from '@/lib/utils/date-formatter';
import {
  getPostTitle,
  getPostImageUrl,
  getPostCategory,
  getPostScheduledDate,
} from '@/lib/utils/post-adapters';
import { isAfter, parseISO } from 'date-fns';

interface UpcomingListProps {
  posts: UnifiedPost[];
  onPostClick: (post: UnifiedPost) => void;
}

export default function UpcomingList({ posts, onPostClick }: UpcomingListProps) {
  // Filter and sort upcoming posts
  const upcomingPosts = posts
    .filter((post) => {
      const scheduled = getPostScheduledDate(post);
      if (!scheduled) return false;
      const postDate = typeof scheduled === 'string'
        ? parseISO(scheduled)
        : scheduled;
      return isAfter(postDate, new Date());
    })
    .sort((a, b) => {
      const dateA = getPostScheduledDate(a);
      const dateB = getPostScheduledDate(b);
      if (!dateA || !dateB) return 0;
      const parsedA = typeof dateA === 'string' ? parseISO(dateA) : new Date(dateA);
      const parsedB = typeof dateB === 'string' ? parseISO(dateB) : new Date(dateB);
      return parsedA.getTime() - parsedB.getTime();
    })
    .slice(0, 5); // Only show first 5

  if (upcomingPosts.length === 0) {
    return (
      <div
        style={{
          backgroundColor: 'var(--color-white)',
          borderRadius: '12px',
          border: '1px solid var(--color-gray-200)',
          padding: '24px',
        }}
      >
        <h3
          style={{
            fontSize: '16px',
            fontWeight: 600,
            color: 'var(--color-gray-900)',
            marginBottom: '16px',
          }}
        >
          Prochaines publications
        </h3>
        <div
          style={{
            textAlign: 'center',
            color: 'var(--color-gray-400)',
            fontSize: '14px',
            padding: '20px',
          }}
        >
          Aucune publication planifiée
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: 'var(--color-white)',
        borderRadius: '12px',
        border: '1px solid var(--color-gray-200)',
        padding: '24px',
      }}
    >
      <h3
        style={{
          fontSize: '16px',
          fontWeight: 600,
          color: 'var(--color-gray-900)',
          marginBottom: '16px',
        }}
      >
        Prochaines publications
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {upcomingPosts.map((post) => {
          const scheduled = getPostScheduledDate(post);
          const scheduledDate = typeof scheduled === 'string'
            ? parseISO(scheduled)
            : new Date(scheduled!);
          const imageUrl = getPostImageUrl(post);
          const title = getPostTitle(post);
          const category = getPostCategory(post);

          return (
            <div
              key={post.data.id}
              onClick={() => onPostClick(post)}
              style={{
                display: 'flex',
                gap: '12px',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid var(--color-gray-200)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateX(4px)';
                e.currentTarget.style.borderColor = 'var(--color-orange-primary)';
                e.currentTarget.style.backgroundColor = 'var(--color-gray-50)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateX(0)';
                e.currentTarget.style.borderColor = 'var(--color-gray-200)';
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              {/* Thumbnail */}
              {imageUrl ? (
                <div
                  style={{
                    width: '80px',
                    height: '60px',
                    borderRadius: '6px',
                    backgroundColor: 'var(--color-gray-100)',
                    backgroundImage: `url(${imageUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    flexShrink: 0,
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '80px',
                    height: '60px',
                    borderRadius: '6px',
                    backgroundColor: 'var(--color-gray-100)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <span style={{ fontSize: '20px' }}>📄</span>
                </div>
              )}

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: 'var(--color-gray-900)',
                    marginBottom: '4px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {title}
                </div>
                <div
                  style={{
                    fontSize: '12px',
                    color: 'var(--color-gray-500)',
                    marginBottom: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <span>{category}</span>
                  {post.postType === 'promo' && (
                    <span
                      style={{
                        fontSize: '9px',
                        fontWeight: 700,
                        backgroundColor: 'var(--color-green-accent)',
                        color: 'var(--color-white)',
                        padding: '1px 5px',
                        borderRadius: '3px',
                        textTransform: 'uppercase',
                      }}
                    >
                      Promo
                    </span>
                  )}
                </div>
                <div
                  style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'var(--color-orange-primary)',
                  }}
                >
                  {formatScheduledDate(scheduledDate)}
                </div>
              </div>

              {/* Arrow */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  color: 'var(--color-gray-400)',
                  fontSize: '18px',
                  flexShrink: 0,
                }}
              >
                ›
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
