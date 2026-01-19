'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout';
import { Button, Card, Badge, Select } from '@/components/ui';
import { Download, Filter, FileText, CheckCircle, AlertCircle, Clock, Loader2 } from 'lucide-react';
import { formatPrice, formatDate } from '@/lib/utils';

interface Facture {
  id: string;
  numero: string;
  client_nom: string | null;
  montant_ttc: number | null;
  date_emission: string | null;
  date_echeance: string | null;
  statut: string;
}

const statutOptions = [
  { value: '', label: 'Tous les statuts' },
  { value: 'emise', label: 'Émise' },
  { value: 'payee', label: 'Payée' },
  { value: 'en_retard', label: 'En retard' },
];

export default function FacturesPage() {
  const [factures, setFactures] = useState<Facture[]>([]);
  const [loading, setLoading] = useState(true);
  const [statutFilter, setStatutFilter] = useState('');

  const fetchFactures = async () => {
    try {
      const url = statutFilter ? `/api/factures?statut=${statutFilter}` : '/api/factures';
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setFactures(data);
      }
    } catch (err) {
      console.error('Erreur chargement factures:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFactures();
  }, [statutFilter]);

  const handleMarkPaid = async (id: string) => {
    try {
      const response = await fetch(`/api/factures/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statut: 'payee' }),
      });
      
      if (response.ok) {
        fetchFactures();
      }
    } catch (err) {
      console.error('Erreur marquage payé:', err);
    }
  };
  
  // Stats rapides
  const stats = {
    total: factures.length,
    emises: factures.filter((f) => f.statut === 'emise').length,
    payees: factures.filter((f) => f.statut === 'payee').length,
    en_retard: factures.filter((f) => f.statut === 'en_retard').length,
    montant_emis: factures
      .filter((f) => f.statut === 'emise')
      .reduce((sum, f) => sum + (f.montant_ttc || 0), 0),
    montant_retard: factures
      .filter((f) => f.statut === 'en_retard')
      .reduce((sum, f) => sum + (f.montant_ttc || 0), 0),
  };
  
  // Icône selon le statut
  const getStatutIcon = (statut: string) => {
    switch (statut) {
      case 'payee':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'en_retard':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-blue-600" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Factures" subtitle="Gérez vos factures et suivez les paiements" />
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-[#FF8C00]" />
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        title="Factures"
        subtitle="Gérez vos factures et suivez les paiements"
      />
      
      <div className="p-6">
        {/* Stats rapides */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Émises</p>
                <p className="text-xl font-bold">{stats.emises}</p>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {formatPrice(stats.montant_emis)} en attente
            </p>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Payées</p>
                <p className="text-xl font-bold">{stats.payees}</p>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">ce mois-ci</p>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">En retard</p>
                <p className="text-xl font-bold text-red-600">{stats.en_retard}</p>
              </div>
            </div>
            <p className="text-sm text-red-500 mt-2">
              {formatPrice(stats.montant_retard)} à récupérer
            </p>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#FFF3E0] rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-[#FF8C00]" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total</p>
                <p className="text-xl font-bold">{stats.total}</p>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">factures</p>
          </Card>
        </div>
        
        {/* Filtres et actions */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Filter className="w-4 h-4 text-gray-400" />
            <Select
              options={statutOptions}
              value={statutFilter}
              onChange={(e) => setStatutFilter(e.target.value)}
              className="w-48"
            />
          </div>
          
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </Button>
        </div>
        
        {/* Liste des factures */}
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
                    Montant TTC
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date émission
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Échéance
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {factures.map((facture) => (
                  <tr key={facture.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <span className="font-medium text-gray-900">
                        {facture.numero}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-gray-600">
                      {facture.client_nom || 'Client inconnu'}
                    </td>
                    <td className="px-4 py-4">
                      <span className="font-semibold">
                        {formatPrice(facture.montant_ttc)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      {facture.date_emission ? formatDate(facture.date_emission) : '-'}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      {facture.date_echeance ? formatDate(facture.date_echeance) : '-'}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        {getStatutIcon(facture.statut)}
                        <Badge statut={facture.statut} />
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => window.open(`/api/pdf/facture/${facture.id}`, '_blank')}
                          title="Télécharger le PDF"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        {facture.statut !== 'payee' && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleMarkPaid(facture.id)}
                            title="Marquer comme payée"
                          >
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {factures.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">Aucune facture trouvée</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
