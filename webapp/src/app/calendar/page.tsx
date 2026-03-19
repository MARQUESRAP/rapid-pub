'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UnifiedPost } from '@/types/post';
import { getAllPosts, getAllPromoPosts } from '@/lib/supabase/queries';
import { isAuthenticated } from '@/lib/auth/pin-auth';
import ViewToggle, { CalendarView } from '@/components/calendar/ViewToggle';
import WeekView from '@/components/calendar/WeekView';
import MonthView from '@/components/calendar/MonthView';
import UpcomingList from '@/components/calendar/UpcomingList';
import { PostModal } from '@/components/detail/PostModal';
import { Toast, ToastType } from '@/components/shared/Toast';
import { Logo } from '@/components/shared/Logo';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

export default function CalendarPage() {
  const router = useRouter();
  const [view, setView] = useState<CalendarView>('week');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [unifiedPosts, setUnifiedPosts] = useState<UnifiedPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<UnifiedPost | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<ToastType>('info');
  const [isToastVisible, setIsToastVisible] = useState(false);

  // Check authentication
  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/');
      return;
    }
  }, [router]);

  // Fetch both generic and promo posts
  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      const [genericData, promoData] = await Promise.all([
        getAllPosts(),
        getAllPromoPosts(),
      ]);

      const unified: UnifiedPost[] = [
        ...genericData.map((p): UnifiedPost => ({ postType: 'generic', data: p })),
        ...promoData.map((p): UnifiedPost => ({ postType: 'promo', data: p })),
      ];

      setUnifiedPosts(unified);
      setIsLoading(false);
    };

    fetchPosts();
  }, []);

  const handlePostClick = (post: UnifiedPost) => {
    setSelectedPost(post);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPost(null);
  };

  const handlePostUpdated = async () => {
    // Refresh all posts after update
    const [genericData, promoData] = await Promise.all([
      getAllPosts(),
      getAllPromoPosts(),
    ]);

    const unified: UnifiedPost[] = [
      ...genericData.map((p): UnifiedPost => ({ postType: 'generic', data: p })),
      ...promoData.map((p): UnifiedPost => ({ postType: 'promo', data: p })),
    ];

    setUnifiedPosts(unified);
    handleCloseModal();
  };

  const showToast = (message: string, type: ToastType) => {
    setToastMessage(message);
    setToastType(type);
    setIsToastVisible(true);
  };

  const handleBackToDashboard = () => {
    router.push('/dashboard');
  };

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--color-gray-50)',
        }}
      >
        <LoadingSpinner size="lg" color="var(--color-orange-primary)" />
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-gray-50)',
      }}
    >
      {/* Header */}
      <header
        style={{
          backgroundColor: 'var(--color-white)',
          borderBottom: '1px solid var(--color-gray-200)',
          padding: '16px 24px',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <div
          style={{
            maxWidth: '1400px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Logo size={40} />
            <div>
              <h1
                style={{
                  fontSize: '20px',
                  fontWeight: 700,
                  color: 'var(--color-gray-900)',
                  margin: 0,
                }}
              >
                Calendrier
              </h1>
              <p
                style={{
                  fontSize: '13px',
                  color: 'var(--color-gray-500)',
                  margin: 0,
                }}
              >
                Planification des publications LinkedIn
              </p>
            </div>
          </div>

          <button
            onClick={handleBackToDashboard}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: '1px solid var(--color-gray-300)',
              backgroundColor: 'var(--color-white)',
              color: 'var(--color-gray-700)',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-orange-primary)';
              e.currentTarget.style.color = 'var(--color-orange-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-gray-300)';
              e.currentTarget.style.color = 'var(--color-gray-700)';
            }}
          >
            ← Retour au dashboard
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '32px 24px',
        }}
      >
        {/* View Toggle */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '32px',
          }}
        >
          <ViewToggle view={view} onViewChange={setView} />
        </div>

        {/* Calendar + Upcoming List */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '24px',
          }}
          // Responsive: side-by-side on desktop
          className="calendar-layout"
        >
          <style jsx>{`
            @media (min-width: 1024px) {
              .calendar-layout {
                grid-template-columns: 1fr 320px !important;
              }
            }
          `}</style>

          {/* Calendar View */}
          <div>
            {view === 'week' ? (
              <WeekView
                currentDate={currentDate}
                posts={unifiedPosts}
                onDateChange={setCurrentDate}
                onPostClick={handlePostClick}
              />
            ) : (
              <MonthView
                currentDate={currentDate}
                posts={unifiedPosts}
                onDateChange={setCurrentDate}
                onPostClick={handlePostClick}
              />
            )}
          </div>

          {/* Upcoming List */}
          <div>
            <UpcomingList posts={unifiedPosts} onPostClick={handlePostClick} />
          </div>
        </div>
      </main>

      {/* Post Modal */}
      <PostModal
        post={selectedPost}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onPostUpdated={handlePostUpdated}
        onShowToast={showToast}
      />

      {/* Toast */}
      <Toast
        message={toastMessage}
        type={toastType}
        isVisible={isToastVisible}
        onClose={() => setIsToastVisible(false)}
      />
    </div>
  );
}
