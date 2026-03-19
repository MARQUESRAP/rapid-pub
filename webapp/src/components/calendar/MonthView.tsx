'use client';

import React from 'react';
import { UnifiedPost } from '@/types/post';
import {
  getMonthDaysWithPadding,
  formatMonthYear,
  getDayNumber,
  isPublicationSlot,
  getSlotType,
  isDateToday,
  isDatePast,
  isSameCalendarDay,
  getPreviousMonth,
  getNextMonth,
} from '@/lib/utils/calendar-helpers';
import {
  getPostTitle,
  getPostScheduledDate,
} from '@/lib/utils/post-adapters';
import { isSameMonth } from 'date-fns';

interface MonthViewProps {
  currentDate: Date;
  posts: UnifiedPost[];
  onDateChange: (date: Date) => void;
  onPostClick: (post: UnifiedPost) => void;
}

export default function MonthView({ currentDate, posts, onDateChange, onPostClick }: MonthViewProps) {
  const monthDays = getMonthDaysWithPadding(currentDate);
  const weekDayNames = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  const handlePrevious = () => onDateChange(getPreviousMonth(currentDate));
  const handleNext = () => onDateChange(getNextMonth(currentDate));
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
        <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--color-gray-900)', margin: 0, textTransform: 'capitalize' }}>
          {formatMonthYear(currentDate)}
        </h2>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <button onClick={handleToday} style={navBtnStyle}>Aujourd&apos;hui</button>
          <button onClick={handlePrevious} style={{ ...navBtnStyle, fontSize: '18px', padding: '8px 12px', lineHeight: 1 }}>‹</button>
          <button onClick={handleNext} style={{ ...navBtnStyle, fontSize: '18px', padding: '8px 12px', lineHeight: 1 }}>›</button>
        </div>
      </div>

      {/* Month Grid */}
      <div style={{ backgroundColor: 'var(--color-white)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-md)' }}>
        {/* Weekday Headers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', backgroundColor: 'var(--color-gray-50)' }}>
          {weekDayNames.map((dayName) => (
            <div key={dayName} style={{ padding: '12px', textAlign: 'center', fontSize: '11px', fontWeight: 600, color: 'var(--color-gray-400)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {dayName}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
          {monthDays.map((day, index) => {
            const dayPosts = getPostsForDay(day);
            const isSlot = isPublicationSlot(day);
            const slotType = getSlotType(day);
            const isToday = isDateToday(day);
            const isPast = isDatePast(day);
            const isCurrentMonth = isSameMonth(day, currentDate);

            const slotBg = isSlot && isCurrentMonth
              ? slotType === 'promo'
                ? 'rgba(164,198,57,0.05)'
                : 'rgba(233,78,27,0.03)'
              : 'transparent';

            return (
              <div
                key={day.toISOString()}
                onClick={() => { if (dayPosts.length === 1) onPostClick(dayPosts[0]); }}
                style={{
                  minHeight: '100px',
                  padding: '12px',
                  borderRight: (index + 1) % 7 === 0 ? 'none' : '1px solid var(--color-gray-100)',
                  borderBottom: index < monthDays.length - 7 ? '1px solid var(--color-gray-100)' : 'none',
                  backgroundColor: slotBg,
                  opacity: !isCurrentMonth ? 0.35 : isPast ? 0.6 : 1,
                  cursor: dayPosts.length === 1 ? 'pointer' : 'default',
                  transition: 'background-color 0.2s ease',
                  position: 'relative',
                }}
                onMouseEnter={(e) => { if (dayPosts.length === 1) e.currentTarget.style.backgroundColor = 'var(--color-gray-50)'; }}
                onMouseLeave={(e) => { if (dayPosts.length === 1) e.currentTarget.style.backgroundColor = slotBg; }}
              >
                {/* Slot top-border indicator */}
                {isSlot && isCurrentMonth && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '3px',
                    backgroundColor: slotType === 'promo' ? 'var(--color-green-accent)' : 'var(--color-orange-primary)',
                    borderRadius: '0 0 2px 2px',
                  }} />
                )}

                {/* Day Number */}
                <div style={{
                  fontSize: '13px',
                  fontWeight: isToday ? 700 : 500,
                  color: isToday ? 'var(--color-white)' : !isCurrentMonth ? 'var(--color-gray-300)' : 'var(--color-gray-900)',
                  marginBottom: '8px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: isToday ? 'var(--color-orange-primary)' : 'transparent',
                  borderRadius: '50%',
                  width: '28px',
                  height: '28px',
                }}>
                  {getDayNumber(day)}
                </div>

                {/* Post Dots */}
                {dayPosts.length > 0 && (
                  <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', marginTop: '8px' }}>
                    {dayPosts.slice(0, 3).map((post) => (
                      <div
                        key={post.data.id}
                        style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          backgroundColor: post.postType === 'promo' ? 'var(--color-green-accent)' : 'var(--color-orange-primary)',
                        }}
                        title={getPostTitle(post)}
                      />
                    ))}
                    {dayPosts.length > 3 && (
                      <div style={{ fontSize: '10px', color: 'var(--color-gray-400)', fontWeight: 600 }}>
                        +{dayPosts.length - 3}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
