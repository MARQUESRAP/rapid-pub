'use client';

import React from 'react';

export type CalendarView = 'week' | 'month';

interface ViewToggleProps {
  view: CalendarView;
  onViewChange: (view: CalendarView) => void;
}

export default function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  return (
    <div
      style={{
        display: 'flex',
        gap: '0',
        backgroundColor: 'var(--color-gray-100)',
        borderRadius: '8px',
        padding: '4px',
      }}
    >
      <button
        onClick={() => onViewChange('week')}
        style={{
          padding: '8px 20px',
          borderRadius: '6px',
          border: 'none',
          backgroundColor: view === 'week' ? 'var(--color-white)' : 'transparent',
          color: view === 'week' ? 'var(--color-orange-primary)' : 'var(--color-gray-600)',
          fontWeight: view === 'week' ? 600 : 400,
          fontSize: '14px',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: view === 'week' ? '0 1px 3px rgba(0, 0, 0, 0.1)' : 'none',
        }}
      >
        Semaine
      </button>
      <button
        onClick={() => onViewChange('month')}
        style={{
          padding: '8px 20px',
          borderRadius: '6px',
          border: 'none',
          backgroundColor: view === 'month' ? 'var(--color-white)' : 'transparent',
          color: view === 'month' ? 'var(--color-orange-primary)' : 'var(--color-gray-600)',
          fontWeight: view === 'month' ? 600 : 400,
          fontSize: '14px',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: view === 'month' ? '0 1px 3px rgba(0, 0, 0, 0.1)' : 'none',
        }}
      >
        Mois
      </button>
    </div>
  );
}
