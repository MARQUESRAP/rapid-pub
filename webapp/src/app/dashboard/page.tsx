'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, clearAuthToken } from '@/lib/auth/pin-auth';
import { getAllPosts, getPostStats, getAllPromoPosts, getPromoPostStats, getAllProducts, deletePost, deletePromoPost } from '@/lib/supabase/queries';
import { generatePromoPostWebhook } from '@/lib/webhooks/n8n';
import { supabase } from '@/lib/supabase/client';
import { Post, PostStats, PromoPost, Product, UnifiedPost } from '@/types/post';
import { Logo } from '@/components/shared/Logo';
import { Button } from '@/components/shared/Button';
import { StatsBar } from '@/components/dashboard/StatsBar';
import { FilterTabs } from '@/components/dashboard/FilterTabs';
import { PostGrid } from '@/components/dashboard/PostGrid';
import { ProductGrid } from '@/components/dashboard/ProductGrid';
import { PostTypeTabs, PostTypeTab } from '@/components/dashboard/PostTypeTabs';
import { PostModal } from '@/components/detail/PostModal';
import { ExpressTopicModal } from '@/components/dashboard/ExpressTopicModal';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Toast, ToastType } from '@/components/shared/Toast';

type FilterOption = 'tous' | 'a_valider' | 'valide';

// Status mapping for promo posts filtering
const promoStatusMap: Record<FilterOption, string[]> = {
  tous: [],
  a_valider: ['A_Valider'],
  valide: ['Valide', 'Planifie'],
};

export default function DashboardPage() {
  const router = useRouter();

  // Generic posts state
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<UnifiedPost[]>([]);
  const [stats, setStats] = useState<PostStats>({ total: 0, a_valider: 0, valide: 0 });

  // Promo posts state
  const [promoPosts, setPromoPosts] = useState<PromoPost[]>([]);
  const [filteredPromoPosts, setFilteredPromoPosts] = useState<UnifiedPost[]>([]);
  const [promoStats, setPromoStats] = useState<PostStats>({ total: 0, a_valider: 0, valide: 0 });

  // Products state
  const [products, setProducts] = useState<Product[]>([]);
  const [generatingProductId, setGeneratingProductId] = useState<string | null>(null);

  // UI state
  const [loading, setLoading] = useState(true);
  const [activePostType, setActivePostType] = useState<PostTypeTab>('generic');
  const [activeFilter, setActiveFilter] = useState<FilterOption>('tous');
  const [selectedPost, setSelectedPost] = useState<UnifiedPost | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Express Topic modal state
  const [isExpressModalOpen, setIsExpressModalOpen] = useState(false);

  // Delete dialog state
  const [postToDelete, setPostToDelete] = useState<UnifiedPost | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast state
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<ToastType>('info');
  const [isToastVisible, setIsToastVisible] = useState(false);

  useEffect(() => {
    // Check authentication
    if (!isAuthenticated()) {
      router.push('/');
      return;
    }

    // Load posts and stats
    loadData();

    // Subscribe to generic post changes (INSERT + UPDATE + DELETE)
    const genericSubscription = supabase
      .channel('posts-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'posts' },
        () => {
          getAllPosts().then(setPosts);
          getPostStats().then(setStats);
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'posts' },
        (payload) => {
          setPosts((current) =>
            current.map((p) => (p.id === payload.new.id ? payload.new as Post : p))
          );
          getPostStats().then(setStats);
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'posts' },
        (payload) => {
          setPosts((current) => current.filter((p) => p.id !== payload.old.id));
          getPostStats().then(setStats);
        }
      )
      .subscribe();

    // Subscribe to promo post changes (INSERT + UPDATE + DELETE)
    const promoSubscription = supabase
      .channel('posts-promo-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'posts_promo' },
        () => {
          getAllPromoPosts().then(setPromoPosts);
          getPromoPostStats().then(setPromoStats);
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'posts_promo' },
        (payload) => {
          setPromoPosts((current) =>
            current.map((p) => (p.id === payload.new.id ? payload.new as PromoPost : p))
          );
          getPromoPostStats().then(setPromoStats);
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'posts_promo' },
        (payload) => {
          setPromoPosts((current) => current.filter((p) => p.id !== payload.old.id));
          getPromoPostStats().then(setPromoStats);
        }
      )
      .subscribe();

    // Subscribe to product status changes
    const productsSubscription = supabase
      .channel('products-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'produits_promo' },
        () => {
          getAllProducts().then(setProducts);
        }
      )
      .subscribe();

    return () => {
      genericSubscription.unsubscribe();
      promoSubscription.unsubscribe();
      productsSubscription.unsubscribe();
    };
  }, [router]);

  // Filter generic posts
  useEffect(() => {
    let filtered: Post[];
    if (activeFilter === 'tous') {
      filtered = posts;
    } else {
      filtered = posts.filter((post) => post.statut === activeFilter);
    }
    setFilteredPosts(filtered.map((p): UnifiedPost => ({ postType: 'generic', data: p })));
  }, [posts, activeFilter]);

  // Filter promo posts
  useEffect(() => {
    let filtered: PromoPost[];
    if (activeFilter === 'tous') {
      filtered = promoPosts;
    } else {
      const validStatuses = promoStatusMap[activeFilter];
      filtered = promoPosts.filter((post) => validStatuses.includes(post.statut));
    }
    setFilteredPromoPosts(filtered.map((p): UnifiedPost => ({ postType: 'promo', data: p })));
  }, [promoPosts, activeFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [postsData, statsData, promoPostsData, promoStatsData, productsData] = await Promise.all([
        getAllPosts(),
        getPostStats(),
        getAllPromoPosts(),
        getPromoPostStats(),
        getAllProducts(),
      ]);
      setPosts(postsData);
      setStats(statsData);
      setPromoPosts(promoPostsData);
      setPromoStats(promoStatsData);
      setProducts(productsData);
    } catch (error) {
      console.error('Error loading data:', error);
      showToast('Erreur lors du chargement des donnees', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    clearAuthToken();
    router.push('/');
  };

  const handlePostClick = (post: UnifiedPost) => {
    setSelectedPost(post);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPost(null);
  };

  const handlePostUpdated = async () => {
    await loadData();
    handleCloseModal();
  };

  const showToast = (message: string, type: ToastType) => {
    setToastMessage(message);
    setToastType(type);
    setIsToastVisible(true);
  };

  // --- Delete handlers ---
  const handleDeletePost = (post: UnifiedPost) => {
    setPostToDelete(post);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!postToDelete) return;

    setIsDeleting(true);
    try {
      const success = postToDelete.postType === 'generic'
        ? await deletePost(postToDelete.data.id)
        : await deletePromoPost(postToDelete.data.id);

      if (success) {
        showToast('Post supprime avec succes', 'success');
        await loadData();
      } else {
        showToast('Erreur lors de la suppression', 'error');
      }
    } catch {
      showToast('Erreur lors de la suppression', 'error');
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      setPostToDelete(null);
    }
  };

  // --- Product generate handler ---
  const handleGeneratePromoPost = async (productId: string) => {
    setGeneratingProductId(productId);
    try {
      const result = await generatePromoPostWebhook(productId);
      if (result.success) {
        showToast(result.message || 'Generation du post promo en cours...', 'success');
      } else {
        showToast(result.error || 'Erreur lors de la generation', 'error');
      }
    } catch {
      showToast('Erreur lors de la generation du post promo', 'error');
    } finally {
      setGeneratingProductId(null);
    }
  };

  // Current stats and posts based on active post type
  const currentStats = activePostType === 'generic' ? stats : promoStats;
  const currentPosts = activePostType === 'generic' ? filteredPosts : filteredPromoPosts;

  const containerStyle: React.CSSProperties = {
    minHeight: '100vh',
    backgroundColor: 'var(--color-gray-50)',
  };

  const headerStyle: React.CSSProperties = {
    backgroundColor: 'var(--color-white)',
    borderBottom: '1px solid var(--color-gray-200)',
    padding: 'var(--spacing-lg)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    boxShadow: 'var(--shadow-sm)',
  };

  const headerContentStyle: React.CSSProperties = {
    maxWidth: '1280px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
  };

  const handleNavigateToCalendar = () => {
    router.push('/calendar');
  };

  const contentStyle: React.CSSProperties = {
    padding: 'var(--spacing-xl)',
    maxWidth: '1280px',
    margin: '0 auto',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '1.75rem',
    fontWeight: 700,
    color: 'var(--color-gray-900)',
    marginBottom: 'var(--spacing-md)',
  };

  const subtitleStyle: React.CSSProperties = {
    fontSize: '1rem',
    color: 'var(--color-gray-600)',
    marginBottom: 'var(--spacing-xl)',
  };

  return (
    <div style={containerStyle}>
      {/* Header */}
      <header style={headerStyle}>
        <div style={headerContentStyle}>
          <Logo size={28} />
          <div style={{ display: 'flex', gap: '12px' }}>
            <Button variant="primary" onClick={() => setIsExpressModalOpen(true)}>
              Sujet Express
            </Button>
            <Button variant="secondary" onClick={handleNavigateToCalendar}>
              Calendrier
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              Deconnexion
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={contentStyle}>
        <h1 style={titleStyle}>Dashboard</h1>
        <p style={subtitleStyle}>
          Gerez et planifiez vos posts LinkedIn en quelques clics.
        </p>

        {/* Post Type Tabs */}
        <PostTypeTabs
          activeType={activePostType}
          onTypeChange={setActivePostType}
        />

        {/* Show Stats + Filters only for post tabs, not products */}
        {activePostType !== 'products' && (
          <>
            <StatsBar stats={currentStats} />
            <FilterTabs
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
              counts={{
                tous: currentStats.total,
                a_valider: currentStats.a_valider,
                valide: currentStats.valide,
              }}
            />
          </>
        )}

        {/* Content based on active tab */}
        {activePostType === 'products' ? (
          <ProductGrid
            products={products}
            loading={loading}
            onGenerate={handleGeneratePromoPost}
            generatingProductId={generatingProductId}
          />
        ) : (
          <PostGrid
            posts={currentPosts}
            loading={loading}
            onPostClick={handlePostClick}
          />
        )}
      </main>

      {/* Post Detail Modal */}
      <PostModal
        post={selectedPost}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onPostUpdated={handlePostUpdated}
        onShowToast={showToast}
        onDeletePost={handleDeletePost}
      />

      {/* Express Topic Modal */}
      <ExpressTopicModal
        isOpen={isExpressModalOpen}
        onClose={() => setIsExpressModalOpen(false)}
        onSuccess={loadData}
        onShowToast={showToast}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        title="Supprimer ce post"
        message="Cette action est irreversible. Le post sera definitivement supprime de la base de donnees."
        confirmLabel="Supprimer"
        confirmVariant="primary"
        onConfirm={confirmDelete}
        onCancel={() => {
          setIsDeleteDialogOpen(false);
          setPostToDelete(null);
        }}
        isLoading={isDeleting}
      />

      {/* Toast Notifications */}
      <Toast
        message={toastMessage}
        type={toastType}
        isVisible={isToastVisible}
        onClose={() => setIsToastVisible(false)}
      />
    </div>
  );
}
