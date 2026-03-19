'use client';

import React from 'react';
import { UnifiedPost } from '@/types/post';
import {
  getWeekDays,
  formatWeekRange,
  getDayNameShort,
  getDayNumber,
  isPublicationSlot,
  getSlotType,
  isDateToday,
  isDatePast,
  isSameCalendarDay,
  getPreviousWeek,
  getNextWeek,
} from '@/lib/utils/calendar-helpers';
import {
  getPostTitle,
  getPostImageUrl,
  getPostCategory,
  getPostScheduledDate,
} from '@/lib/utils/post-adapters';

interface WeekViewProps {
  currentDate: Date;
  posts: UnifiedPost[];
  onDateChange: (date: Date) => void;
  onPostClick: (post: UnifiedPost) => void;
}

export default function WeekView({ currentDate, posts, onDateChange, onPostClick }: WeekViewProps) {
  const weekDays = getWeekDays(currentDate);

  const handlePrevious = () => onDateChange(getPreviousWeek(currentDate));
  const handleNext = () => onDateChange(getNextWeek(currentDate));
  const handleToday = () => onDateChange(new Date());

  const getPostsForDay = (date: Date): UnifiedPost[] => {
    return posts.filter((post) => {
      const scheduled = getPostScheduledDate(post);
      if (!scheduled) return false;
      return isSameCalendarDay(scheduled, date);
    });
  };

  const navBtnStyle: React.CSSProperties = {
    padding: '8px 14px',
    borderRadius: '10px',
    border: 'none',
    backgroundColor: 'var(--color-white)',
    color: 'var(--color-gray-600)',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: 'var(--shadow-sm)',
  };

  return (
    <div>
      {/* Navigation Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--color-gray-900)', margin: 0 }}>
          {formatWeekRange(currentDate)}
        </h2>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <button onClick={handleToday} style={navBtnStyle}>Aujourd&apos;hui</button>
          <button onClick={handlePrevious} style={{ ...navBtnStyle, fontSize: '18px', padding: '8px 12px', lineHeight: 1 }}>‹</button>
          <button onClick={handleNext} style={{ ...navBtnStyle, fontSize: '18px', padding: '8px 12px', lineHeight: 1 }}>›</button>
        </div>
      </div>

      {/* Week Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
        {weekDays.map((day) => {
          const dayPosts = getPostsForDay(day);
          const isSlot = isPublicationSlot(day);
          const slotType = getSlotType(day);
          const isToday = isDateToday(day);
          const isPast = isDatePast(day);

          const slotColor = slotType === 'promo' ? 'var(--color-green-accent)' : 'var(--color-orange-primary)';
          const slotBgColor = slotType === 'promo' ? 'rgba(164,198,57,0.06)' : 'rgba(233,78,27,0.04)';

          return (
            <div
              key={day.toISOString()}
              style={{
                backgroundColor: isSlot ? slotBgColor : 'var(--color-white)',
                borderRadius: 'var(--radius-lg)',
                padding: '16px',
                minHeight: '180px',
                display: 'flex',
                flexDirection: 'column',
                opacity: isPast ? 0.6 : 1,
                boxShadow: 'var(--shadow-md)',
                borderTop: isSlot ? `3px solid ${slotColor}` : '3px solid transparent',
                transition: 'box-shadow 0.2s ease',
              }}
            >
              {/* Day Header */}
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '11px', fontWeight: 600, color: isToday ? 'var(--color-orange-primary)' : 'var(--color-gray-400)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '2px' }}>
                  {getDayNameShort(day)}
                </div>
                <div style={{ fontSize: '24px', fontWeight: 700, color: isToday ? 'var(--color-orange-primary)' : 'var(--color-gray-900)' }}>
                  {getDayNumber(day)}
                </div>
              </div>

              {/* Slot Indicator */}
              {isSlot && (() => {
                const isPromoSlot = slotType === 'promo';
                return (
                  <div style={{
                    fontSize: '10px',
                    color: isPromoSlot ? 'var(--color-green-accent)' : 'var(--color-orange-primary)',
                    fontWeight: 600,
                    marginBottom: '8px',
                    padding: '3px 8px',
                    backgroundColor: isPromoSlot ? 'rgba(164,198,57,0.1)' : 'rgba(233,78,27,0.08)',
                    borderRadius: 'var(--radius-full)',
                    textAlign: 'center',
                    width: 'fit-content',
                  }}>
                    {isPromoSlot ? 'Promo · 10h' : 'Générique · 14h'}
                  </div>
                );
              })()}

              {/* Posts */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                {dayPosts.length === 0 ? (
                  <div style={{ fontSize: '12px', color: 'var(--color-gray-300)', textAlign: 'center', marginTop: '8px' }}>
                    —
                  </div>
                ) : (
                  dayPosts.map((post) => {
                    const imageUrl = getPostImageUrl(post);
                    const title = getPostTitle(post);
                    const category = getPostCategory(post);

                    return (
                      <div
                        key={post.data.id}
                        onClick={() => onPostClick(post)}
                        style={{
                          cursor: 'pointer',
                          borderRadius: '10px',
                          overflow: 'hidden',
                          backgroundColor: 'var(--color-white)',
                          boxShadow: 'var(--shadow-sm)',
                          transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                        }}
                      >
                        {imageUrl && (
                          <div style={{
                            width: '100%',
                            aspectRatio: '4 / 3',
                            backgroundColor: 'var(--color-gray-100)',
                            backgroundImage: `url(${imageUrl})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                          }} />
                        )}
                        <div style={{ padding: '8px' }}>
                          <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-gray-900)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {title}
                          </div>
                          <div style={{ fontSize: '10px', color: 'var(--color-gray-400)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span>{category}</span>
                            {post.postType === 'promo' && (
                              <span style={{ fontSize: '8px', fontWeight: 600, backgroundColor: 'rgba(164,198,57,0.12)', color: 'var(--color-green-accent)', padding: '1px 5px', borderRadius: 'var(--radius-full)', textTransform: 'uppercase' }}>
                                Promo
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
