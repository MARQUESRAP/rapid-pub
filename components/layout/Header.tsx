'use client';

import { Button } from '@/components/ui';
import { GlobalSearch } from '@/components/ui/GlobalSearch';
import { AlertesIndicator } from '@/components/ui/AlertesBanner';
import { Plus } from 'lucide-react';
import Link from 'next/link';

interface HeaderProps {
  title: string;
  subtitle?: string;
  showNewButton?: boolean;
  newButtonHref?: string;
  newButtonLabel?: string;
}

export function Header({
  title,
  subtitle,
  showNewButton = false,
  newButtonHref = '/devis/new',
  newButtonLabel = 'Nouvelle demande',
}: HeaderProps) {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      {/* Titre */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
      </div>
      
      {/* Actions */}
      <div className="flex items-center gap-3">
        {/* Recherche globale */}
        <GlobalSearch />
        
        {/* Notifications / Alertes */}
        <AlertesIndicator />
        
        {/* Bouton nouvelle demande */}
        {showNewButton && (
          <Link href={newButtonHref}>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              {newButtonLabel}
            </Button>
          </Link>
        )}
      </div>
    </header>
  );
}
