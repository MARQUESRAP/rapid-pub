import React, { useState } from 'react';
import Image from 'next/image';
import { Product } from '@/types/post';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

interface ProductCardProps {
  product: Product;
  onGenerate: (productId: string) => void;
  isGenerating: boolean;
}

export function ProductCard({ product, onGenerate, isGenerating }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isBtnHovered, setIsBtnHovered] = useState(false);

  const getStatusColor = (statut: string): { bg: string; text: string } => {
    switch (statut) {
      case 'A_Poster':
        return { bg: 'rgba(233, 78, 27, 0.08)', text: 'var(--color-orange-primary)' };
      case 'En_Cours':
        return { bg: 'rgba(59, 130, 246, 0.08)', text: '#3B82F6' };
      case 'Poste':
        return { bg: 'rgba(164, 198, 57, 0.08)', text: 'var(--color-green-accent)' };
      default:
        return { bg: 'rgba(107, 114, 128, 0.08)', text: 'var(--color-gray-500)' };
    }
  };

  const getStatusLabel = (statut: string): string => {
    switch (statut) {
      case 'A_Poster': return 'A poster';
      case 'En_Cours': return 'En cours';
      case 'Poste': return 'Poste';
      default: return statut;
    }
  };

  const statusColors = getStatusColor(product.statut);

  const cardStyle: React.CSSProperties = {
    backgroundColor: 'var(--color-white)',
    borderRadius: 'var(--radius-lg)',
    overflow: 'hidden',
    boxShadow: isHovered ? 'var(--shadow-lg)' : 'var(--shadow-md)',
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

  const categoryBadgeStyle: React.CSSProperties = {
    display: 'inline-block',
    padding: '3px 9px',
    borderRadius: 'var(--radius-full)',
    fontSize: '0.65rem',
    fontWeight: 600,
    backgroundColor: 'rgba(233, 78, 27, 0.06)',
    color: 'var(--color-orange-primary)',
    marginBottom: 'var(--spacing-sm)',
    letterSpacing: '0.02em',
    textTransform: 'uppercase',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '0.95rem',
    fontWeight: 600,
    color: 'var(--color-gray-900)',
    marginBottom: '4px',
    lineHeight: 1.4,
  };

  const refStyle: React.CSSProperties = {
    fontSize: '0.72rem',
    color: 'var(--color-gray-400)',
    marginBottom: 'var(--spacing-sm)',
    fontFamily: 'monospace',
  };

  const descriptionStyle: React.CSSProperties = {
    fontSize: '0.8rem',
    color: 'var(--color-gray-500)',
    lineHeight: 1.5,
    marginBottom: 'var(--spacing-md)',
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
    borderTop: '1px solid var(--color-gray-100)',
  };

  const statusBadgeStyle: React.CSSProperties = {
    padding: '3px 9px',
    borderRadius: 'var(--radius-full)',
    fontSize: '0.7rem',
    fontWeight: 600,
    backgroundColor: statusColors.bg,
    color: statusColors.text,
  };

  const generateBtnStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    padding: '6px 14px',
    fontSize: '0.75rem',
    fontWeight: 500,
    fontFamily: 'var(--font-family)',
    color: isBtnHovered ? '#fff' : 'var(--color-orange-primary)',
    background: isBtnHovered
      ? 'linear-gradient(135deg, #E94E1B 0%, #FF6B3D 100%)'
      : 'transparent',
    border: isBtnHovered ? 'none' : '1.5px solid rgba(233, 78, 27, 0.25)',
    borderRadius: '8px',
    cursor: isGenerating ? 'not-allowed' : 'pointer',
    opacity: isGenerating ? 0.6 : 1,
    transition: 'all 0.2s cubic-bezier(0.22, 1, 0.36, 1)',
    whiteSpace: 'nowrap',
    boxShadow: isBtnHovered ? '0 3px 10px rgba(233, 78, 27, 0.2)' : 'none',
  };

  return (
    <div
      style={cardStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={imageContainerStyle}>
        {product.url_image ? (
          <Image
            src={product.url_image}
            alt={product.nom_produit}
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

      <div style={contentStyle}>
        <span style={categoryBadgeStyle}>{product.categorie}</span>
        <h3 style={titleStyle}>{product.nom_produit}</h3>
        <p style={refStyle}>{product.reference}</p>
        {product.description && (
          <p style={descriptionStyle}>{product.description}</p>
        )}
        {product.couleurs_dispo && (
          <p style={{ fontSize: '0.72rem', color: 'var(--color-gray-400)', marginBottom: 'var(--spacing-md)' }}>
            {product.couleurs_dispo}
          </p>
        )}

        <div style={footerStyle}>
          <span style={statusBadgeStyle}>{getStatusLabel(product.statut)}</span>
          {product.statut === 'A_Poster' && (
            <button
              style={generateBtnStyle}
              onClick={() => onGenerate(product.id)}
              onMouseEnter={() => setIsBtnHovered(true)}
              onMouseLeave={() => setIsBtnHovered(false)}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>Generer</>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
