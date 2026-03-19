'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/layout';
import { KanbanBoard } from '@/components/dashboard';
import { CAChart, TauxConversionGauge, TopClientsChart, RepartitionProduitsChart } from '@/components/dashboard/Charts';
import { AlertesBanner } from '@/components/ui/AlertesBanner';
import type { KanbanItem } from '@/types';
import { Loader2, TrendingUp, Users, FileText, Euro } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

interface DashboardData {
  aTraiter: KanbanItem[];
  devisEnvoyes: KanbanItem[];
  enProduction: KanbanItem[];
  termine: KanbanItem[];
}

interface StatsData {
  caParMois: { mois: string; mois_label: string; ca: number }[];
  tauxConversion: number;
  topClients: { nom: string; entreprise: string; ca_total: number; nb_commandes: number }[];
  repartitionProduits: { type: string; count: number; montant: number }[];
  statsGlobales: {
    total_clients: number;
    devis_brouillon: number;
    devis_envoyes: number;
    commandes_en_cours: number;
    factures_en_attente: number;
    factures_en_retard: number;
    ca_mois: number;
  };
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'kanban' | 'stats'>('kanban');

  const fetchData = async () => {
    try {
      const [dashboardRes, statsRes] = await Promise.all([
        fetch('/api/dashboard'),
        fetch('/api/stats'),
      ]);
      
      if (!dashboardRes.ok) throw new Error('Erreur de chargement dashboard');
      
      const dashboardData = await dashboardRes.json();
      setData(dashboardData);
      
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
    } catch (err) {
      setError('Impossible de charger les données');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStatusChange = async (item: KanbanItem, newStatus: string) => {
    try {
      const endpoint = item.type === 'devis' 
        ? `/api/devis/${item.id}` 
        : `/api/commandes/${item.id}`;
      
      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statut: newStatus }),
      });

      if (response.ok) {
        fetchData();
      }
    } catch (err) {
      console.error('Erreur changement statut:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Dashboard" subtitle="Vue d'ensemble de votre activité" />
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-[#FF8C00]" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Dashboard" subtitle="Vue d'ensemble de votre activité" />
        <div className="flex items-center justify-center h-96">
          <p className="text-red-500">{error || 'Erreur inconnue'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        title="Dashboard"
        subtitle="Vue d'ensemble de votre activité"
        showNewButton
        newButtonHref="/devis/new"
        newButtonLabel="Nouvelle demande"
      />
      
      <div className="p-6">
        {/* Alertes intelligentes */}
        <AlertesBanner />

        {/* Toggle vue */}
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => setViewMode('kanban')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'kanban'
                ? 'bg-[#FF8C00] text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            🎯 Kanban
          </button>
          <button
            onClick={() => setViewMode('stats')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'stats'
                ? 'bg-[#FF8C00] text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            📊 Statistiques
          </button>
        </div>

        {viewMode === 'kanban' ? (
          <>
            {/* Stats rapides */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <StatCard
                label="À traiter"
                value={data.aTraiter.length}
                icon={<FileText className="w-5 h-5" />}
                color="text-purple-600"
                bgColor="bg-purple-50"
              />
              <StatCard
                label="Devis en attente"
                value={data.devisEnvoyes.length}
                icon={<TrendingUp className="w-5 h-5" />}
                color="text-blue-600"
                bgColor="bg-blue-50"
              />
              <StatCard
                label="En production"
                value={data.enProduction.length}
                icon={<Users className="w-5 h-5" />}
                color="text-yellow-600"
                bgColor="bg-yellow-50"
              />
              <StatCard
                label="CA du mois"
                value={formatPrice(stats?.statsGlobales?.ca_mois || 0)}
                icon={<Euro className="w-5 h-5" />}
                color="text-green-600"
                bgColor="bg-green-50"
                isPrice
              />
            </div>
            
            {/* Kanban */}
            <KanbanBoard
              aTraiter={data.aTraiter}
              devisEnvoyes={data.devisEnvoyes}
              enProduction={data.enProduction}
              termine={data.termine}
              onStatusChange={handleStatusChange}
            />
          </>
        ) : (
          <>
            {/* Vue statistiques */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <StatCard
                label="Clients actifs"
                value={stats?.statsGlobales?.total_clients || 0}
                icon={<Users className="w-5 h-5" />}
                color="text-blue-600"
                bgColor="bg-blue-50"
              />
              <StatCard
                label="CA du mois"
                value={formatPrice(stats?.statsGlobales?.ca_mois || 0)}
                icon={<Euro className="w-5 h-5" />}
                color="text-green-600"
                bgColor="bg-green-50"
                isPrice
              />
              <StatCard
                label="Factures en attente"
                value={formatPrice(stats?.statsGlobales?.factures_en_attente || 0)}
                icon={<FileText className="w-5 h-5" />}
                color="text-yellow-600"
                bgColor="bg-yellow-50"
                isPrice
              />
              <StatCard
                label="Factures en retard"
                value={formatPrice(stats?.statsGlobales?.factures_en_retard || 0)}
                icon={<TrendingUp className="w-5 h-5" />}
                color="text-red-600"
                bgColor="bg-red-50"
                isPrice
              />
            </div>

            {/* Graphiques */}
            {stats && (
              <div className="grid grid-cols-2 gap-6">
                <CAChart data={stats.caParMois || []} />
                <TauxConversionGauge taux={stats.tauxConversion || 0} />
                <TopClientsChart clients={stats.topClients || []} />
                <RepartitionProduitsChart data={stats.repartitionProduits || []} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  color,
  bgColor,
  isPrice = false,
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  isPrice?: boolean;
}) {
  return (
    <div className={`${bgColor} rounded-lg p-4`}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-gray-600">{label}</p>
        <span className={color}>{icon}</span>
      </div>
      <p className={`text-2xl font-bold ${color}`}>
        {isPrice ? value : value}
      </p>
    </div>
  );
}
