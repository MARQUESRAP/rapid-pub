'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout';
import { Card, Badge, Button } from '@/components/ui';
import { Package, Factory, CheckCircle, Truck, Clock, Loader2 } from 'lucide-react';
import { formatPrice, formatDate } from '@/lib/utils';

interface Commande {
  id: string;
  numero: string;
  client_nom: string | null;
  titre: string | null;
  prix_total: number | null;
  statut: string;
  date_livraison_prevue: string | null;
  created_at: string;
}

export default function CommandesPage() {
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCommandes = async () => {
    try {
      const response = await fetch('/api/commandes');
      if (response.ok) {
        const data = await response.json();
        setCommandes(data);
      }
    } catch (err) {
      console.error('Erreur chargement commandes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommandes();
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/commandes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statut: newStatus }),
      });
      
      if (response.ok) {
        fetchCommandes();
      }
    } catch (err) {
      console.error('Erreur changement statut:', err);
    }
  };
  
  // Stats
  const stats = {
    nouvelle: commandes.filter((c) => c.statut === 'nouvelle').length,
    en_production: commandes.filter((c) => c.statut === 'en_production').length,
    pret: commandes.filter((c) => c.statut === 'pret').length,
    livre: commandes.filter((c) => c.statut === 'livre').length,
  };
  
  // Icône selon le statut
  const getStatutIcon = (statut: string) => {
    switch (statut) {
      case 'nouvelle':
        return <Clock className="w-4 h-4 text-purple-600" />;
      case 'en_production':
        return <Factory className="w-4 h-4 text-yellow-600" />;
      case 'pret':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'livre':
        return <Truck className="w-4 h-4 text-gray-600" />;
      default:
        return <Package className="w-4 h-4 text-gray-600" />;
    }
  };

  // Prochain statut possible
  const getNextStatus = (statut: string): { status: string; label: string } | null => {
    switch (statut) {
      case 'nouvelle':
        return { status: 'en_production', label: 'Démarrer production' };
      case 'en_production':
        return { status: 'pret', label: 'Marquer prêt' };
      case 'pret':
        return { status: 'livre', label: 'Marquer livré' };
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Commandes" subtitle="Suivi de la production" />
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-[#FF8C00]" />
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        title="Commandes"
        subtitle="Suivi de la production"
      />
      
      <div className="p-6">
        {/* Stats rapides */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Nouvelles</p>
                <p className="text-xl font-bold">{stats.nouvelle}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Factory className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">En production</p>
                <p className="text-xl font-bold">{stats.en_production}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Prêt</p>
                <p className="text-xl font-bold">{stats.pret}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <Truck className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Livré</p>
                <p className="text-xl font-bold">{stats.livre}</p>
              </div>
            </div>
          </Card>
        </div>
        
        {/* Liste des commandes */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Numéro
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Montant
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Livraison prévue
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {commandes.map((commande) => {
                  const nextStatus = getNextStatus(commande.statut);
                  return (
                    <tr key={commande.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <span className="font-medium text-gray-900">
                          {commande.numero}
                        </span>
                        <p className="text-xs text-gray-500">
                          Créée le {formatDate(commande.created_at)}
                        </p>
                      </td>
                      <td className="px-4 py-4 text-gray-600">
                        {commande.client_nom || 'Client inconnu'}
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-gray-900">{commande.titre || '-'}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="font-semibold text-[#FF8C00]">
                          {formatPrice(commande.prix_total)}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">
                        {commande.date_livraison_prevue ? formatDate(commande.date_livraison_prevue) : '-'}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          {getStatutIcon(commande.statut)}
                          <Badge statut={commande.statut} />
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        {nextStatus && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleStatusChange(commande.id, nextStatus.status)}
                          >
                            {nextStatus.label}
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {commandes.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">Aucune commande pour le moment</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
