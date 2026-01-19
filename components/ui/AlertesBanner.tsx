'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, AlertCircle, Info, X, Bell, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface Alerte {
  id: string;
  type: 'devis' | 'facture' | 'commande';
  niveau: 'danger' | 'warning' | 'info';
  titre: string;
  description: string;
  lien: string;
}

export function AlertesBanner() {
  const [alertes, setAlertes] = useState<Alerte[]>([]);
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const fetchAlertes = async () => {
      try {
        const response = await fetch('/api/alertes');
        if (response.ok) {
          const data = await response.json();
          setAlertes(data);
        }
      } catch (err) {
        console.error('Erreur chargement alertes:', err);
      }
    };

    fetchAlertes();
    // Rafraîchir toutes les 5 minutes
    const interval = setInterval(fetchAlertes, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const visibleAlertes = alertes.filter((a) => !dismissed.includes(a.id));
  const dangerCount = visibleAlertes.filter((a) => a.niveau === 'danger').length;
  const warningCount = visibleAlertes.filter((a) => a.niveau === 'warning').length;
  const infoCount = visibleAlertes.filter((a) => a.niveau === 'info').length;

  if (visibleAlertes.length === 0) return null;

  const getNiveauStyles = (niveau: string) => {
    switch (niveau) {
      case 'danger':
        return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', icon: 'text-red-500' };
      case 'warning':
        return { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-800', icon: 'text-yellow-500' };
      case 'info':
        return { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', icon: 'text-blue-500' };
      default:
        return { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-800', icon: 'text-gray-500' };
    }
  };

  const getNiveauIcon = (niveau: string) => {
    switch (niveau) {
      case 'danger':
        return <AlertTriangle className="w-4 h-4" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  return (
    <div className="mb-6">
      {/* Résumé des alertes */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#FFF3E0] rounded-lg flex items-center justify-center">
            <Bell className="w-5 h-5 text-[#FF8C00]" />
          </div>
          <div className="text-left">
            <p className="font-medium text-gray-900">
              {visibleAlertes.length} alerte{visibleAlertes.length > 1 ? 's' : ''} à traiter
            </p>
            <div className="flex items-center gap-2 text-xs">
              {dangerCount > 0 && (
                <span className="text-red-600">{dangerCount} urgente{dangerCount > 1 ? 's' : ''}</span>
              )}
              {warningCount > 0 && (
                <span className="text-yellow-600">{warningCount} attention</span>
              )}
              {infoCount > 0 && (
                <span className="text-blue-600">{infoCount} info</span>
              )}
            </div>
          </div>
        </div>
        <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
      </button>

      {/* Liste des alertes */}
      {isExpanded && (
        <div className="mt-2 space-y-2">
          {visibleAlertes.map((alerte) => {
            const styles = getNiveauStyles(alerte.niveau);
            return (
              <div
                key={alerte.id}
                className={`flex items-center gap-3 p-3 rounded-lg border ${styles.bg} ${styles.border}`}
              >
                <span className={styles.icon}>
                  {getNiveauIcon(alerte.niveau)}
                </span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${styles.text}`}>
                    {alerte.titre}
                  </p>
                  <p className="text-xs text-gray-600">
                    {alerte.description}
                  </p>
                </div>
                <Link
                  href={alerte.lien}
                  className="text-xs font-medium text-gray-600 hover:text-gray-900 whitespace-nowrap"
                >
                  Voir →
                </Link>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDismissed([...dismissed, alerte.id]);
                  }}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Version compacte pour le header
export function AlertesIndicator() {
  const [alertes, setAlertes] = useState<Alerte[]>([]);

  useEffect(() => {
    const fetchAlertes = async () => {
      try {
        const response = await fetch('/api/alertes');
        if (response.ok) {
          const data = await response.json();
          setAlertes(data);
        }
      } catch (err) {
        console.error('Erreur chargement alertes:', err);
      }
    };

    fetchAlertes();
  }, []);

  const dangerCount = alertes.filter((a) => a.niveau === 'danger').length;
  const totalCount = alertes.length;

  if (totalCount === 0) {
    return (
      <button className="relative p-2 hover:bg-gray-100 rounded-lg">
        <Bell className="w-5 h-5 text-gray-400" />
      </button>
    );
  }

  return (
    <button className="relative p-2 hover:bg-gray-100 rounded-lg">
      <Bell className={`w-5 h-5 ${dangerCount > 0 ? 'text-red-500' : 'text-[#FF8C00]'}`} />
      <span className={`absolute -top-1 -right-1 w-5 h-5 text-xs font-bold text-white rounded-full flex items-center justify-center ${dangerCount > 0 ? 'bg-red-500' : 'bg-[#FF8C00]'}`}>
        {totalCount > 9 ? '9+' : totalCount}
      </span>
    </button>
  );
}
