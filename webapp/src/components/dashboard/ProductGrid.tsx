import React, { useState, useMemo } from 'react';
import { Product } from '@/types/post';
import { ProductCard } from './ProductCard';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

interface ProductGridProps {
  products: Product[];
  loading: boolean;
  onGenerate: (productId: string) => void;
  generatingProductId: string | null;
}

export function ProductGrid({ products, loading, onGenerate, generatingProductId }: ProductGridProps) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return products;
    const q = search.toLowerCase();
    return products.filter(
      (p) =>
        p.nom_produit.toLowerCase().includes(q) ||
        p.reference.toLowerCase().includes(q) ||
        p.categorie.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q))
    );
  }, [products, search]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
        <LoadingSpinner />
      </div>
    );
  }

  const searchBarStyle: React.CSSProperties = {
    position: 'relative',
    marginBottom: 'var(--spacing-lg)',
    maxWidth: '400px',
  };

  const searchInputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 14px 10px 40px',
    fontSize: '0.875rem',
    fontFamily: 'var(--font-family)',
    border: '1.5px solid var(--color-gray-200)',
    borderRadius: '12px',
    outline: 'none',
    backgroundColor: 'var(--color-white)',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    color: 'var(--color-gray-900)',
    boxSizing: 'border-box',
  };

  const searchIconStyle: React.CSSProperties = {
    position: 'absolute',
    left: '14px',
    top: '50%',
    transform: 'translateY(-50%)',
    fontSize: '0.9rem',
    color: 'var(--color-gray-400)',
    pointerEvents: 'none',
  };

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: 'var(--spacing-lg)',
  };

  return (
    <div>
      {/* Search bar */}
      <div style={searchBarStyle}>
        <span style={searchIconStyle}>&#x1F50D;</span>
        <input
          type="text"
          placeholder="Rechercher un produit..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={searchInputStyle}
          onFocus={(e) => {
            e.target.style.borderColor = 'var(--color-orange-primary)';
            e.target.style.boxShadow = '0 0 0 3px rgba(233, 78, 27, 0.08)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = 'var(--color-gray-200)';
            e.target.style.boxShadow = 'none';
          }}
        />
      </div>

      {/* Empty state */}
      {filtered.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: 'var(--color-gray-400)',
            fontSize: '0.95rem',
          }}
        >
          {search.trim()
            ? `Aucun produit ne correspond a "${search}"`
            : 'Aucun produit disponible'}
        </div>
      ) : (
        <div style={gridStyle}>
          {filtered.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onGenerate={onGenerate}
              isGenerating={generatingProductId === product.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
