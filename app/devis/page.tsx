'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout';
import { Button, Card, Badge, Select } from '@/components/ui';
import { EmailModal } from '@/components/ui/EmailModal';
import { Plus, Filter, FileText, Send, Check, X, Loader2, Mail, RefreshCw, Download } from 'lucide-react';
import Link from 'next/link';
import { formatPrice, formatDate } from '@/lib/utils';

interface Devis {
  id: string;
  numero: string;
  client_nom: string | null;
  client_email?: string | null;
  titre: string | null;
  prix_total: number | null;
  statut: string;
  created_at: string;
  date_envoi: string | null;
  relance_count: number;
  jours_depuis_envoi: number | null;
}

const statutOptions = [
  { value: '', label: 'Tous les statuts' },
  { value: 'brouillon', label: 'Brouillon' },
  { value: 'envoye', label: 'Envoyé' },
  { value: 'accepte', label: 'Accepté' },
  { value: 'refuse', label: 'Refusé' },
];

export default function DevisPage() {
  const [devis, setDevis] = useState<Devis[]>([]);
  const [loading, setLoading] = useState(true);
  const [statutFilter, setStatutFilter] = useState('');
  const [emailModal, setEmailModal] = useState<{
    isOpen: boolean;
    type: 'devis' | 'relance';
    devis: Devis | null;
  }>({ isOpen: false, type: 'devis', devis: null });

  const fetchDevis = async () => {
    try {
      const url = statutFilter ? `/api/devis?statut=${statutFilter}` : '/api/devis';
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setDevis(data);
      }
    } catch (err) {
      console.error('Erreur chargement devis:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevis();
  }, [statutFilter]);

  const handleSendDevis = async (d: Devis) => {
    // D'abord passer le statut à "envoyé"
    if (d.statut === 'brouillon') {
      await fetch(`/api/devis/${d.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statut: 'envoye' }),
      });
    }
    // Ouvrir le modal d'email
    setEmailModal({ isOpen: true, type: 'devis', devis: d });
  };

  const handleRelance = (d: Devis) => {
    setEmailModal({ isOpen: true, type: 'relance', devis: d });
  };

  const handleOpenPdf = (d: Devis) => {
    window.open(`/api/pdf/devis/${d.id}`, '_blank');
  };
  
  // Stats
  const stats = {
    brouillon: devis.filter((d) => d.statut === 'brouillon').length,
    envoye: devis.filter((d) => d.statut === 'envoye').length,
    accepte: devis.filter((d) => d.statut === 'accepte').length,
    refuse: devis.filter((d) => d.statut === 'refuse').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Devis" subtitle="Gérez tous vos devis" />
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-[#FF8C00]" />
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        title="Devis"
        subtitle="Gérez tous vos devis"
        showNewButton
        newButtonHref="/devis/new"
        newButtonLabel="Nouveau devis"
      />
      
      <div className="p-6">
        {/* Stats rapides */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <StatCard
            label="Brouillons"
            value={stats.brouillon}
            icon={<FileText className="w-5 h-5" />}
            color="gray"
          />
          <StatCard
            label="Envoyés"
            value={stats.envoye}
            icon={<Send className="w-5 h-5" />}
            color="blue"
          />
          <StatCard
            label="Acceptés"
            value={stats.accepte}
            icon={<Check className="w-5 h-5" />}
            color="green"
          />
          <StatCard
            label="Refusés"
            value={stats.refuse}
            icon={<X className="w-5 h-5" />}
            color="red"
          />
        </div>
        
        {/* Filtres */}
        <div className="flex items-center gap-3 mb-4">
          <Filter className="w-4 h-4 text-gray-400" />
          <Select
            options={statutOptions}
            value={statutFilter}
            onChange={(e) => setStatutFilter(e.target.value)}
            className="w-48"
          />
        </div>
        
        {/* Liste des devis */}
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
                    Statut
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Relances
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {devis.map((d) => (
                  <tr key={d.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <span className="font-medium text-gray-900">
                        {d.numero}
                      </span>
                      <p className="text-xs text-gray-500">
                        {formatDate(d.created_at)}
                      </p>
                    </td>
                    <td className="px-4 py-4 text-gray-600">
                      {d.client_nom || 'Client inconnu'}
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-gray-900">{d.titre || '-'}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="font-semibold text-[#FF8C00]">
                        {formatPrice(d.prix_total)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <Badge statut={d.statut} />
                        {d.statut === 'envoye' && d.jours_depuis_envoi && d.jours_depuis_envoi > 0 && (
                          <span className={`text-xs ${d.jours_depuis_envoi >= 5 ? 'text-red-500 font-medium' : 'text-gray-500'}`}>
                            J+{d.jours_depuis_envoi}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      {d.relance_count > 0 && (
                        <span className="text-sm text-gray-500">
                          {d.relance_count} relance{d.relance_count > 1 ? 's' : ''}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-1">
                        {/* PDF */}
                        <button
                          onClick={() => handleOpenPdf(d)}
                          className="p-2 hover:bg-gray-100 rounded-lg"
                          title="Voir le PDF"
                        >
                          <Download className="w-4 h-4 text-gray-500" />
                        </button>
                        
                        {/* Envoyer (brouillon) */}
                        {d.statut === 'brouillon' && (
                          <button
                            onClick={() => handleSendDevis(d)}
                            className="p-2 hover:bg-blue-50 rounded-lg"
                            title="Envoyer le devis"
                          >
                            <Mail className="w-4 h-4 text-blue-500" />
                          </button>
                        )}
                        
                        {/* Relancer (envoyé) */}
                        {d.statut === 'envoye' && (
                          <button
                            onClick={() => handleRelance(d)}
                            className="p-2 hover:bg-orange-50 rounded-lg"
                            title="Relancer le client"
                          >
                            <RefreshCw className="w-4 h-4 text-[#FF8C00]" />
                          </button>
                        )}
                        
                        <Link href={`/devis/${d.id}`}>
                          <Button variant="ghost" size="sm">
                            Voir
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {devis.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">Aucun devis trouvé</p>
                <Link href="/devis/new">
                  <Button className="mt-4">
                    <Plus className="w-4 h-4 mr-2" />
                    Créer un devis
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Modal Email */}
      <EmailModal
        isOpen={emailModal.isOpen}
        onClose={() => setEmailModal({ isOpen: false, type: 'devis', devis: null })}
        type={emailModal.type}
        devisId={emailModal.devis?.id}
        devisNumero={emailModal.devis?.numero}
        clientNom={emailModal.devis?.client_nom || undefined}
        clientEmail={emailModal.devis?.client_email || undefined}
        onSuccess={() => {
          fetchDevis();
          setEmailModal({ isOpen: false, type: 'devis', devis: null });
        }}
      />
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: 'gray' | 'blue' | 'green' | 'red';
}) {
  const colors = {
    gray: { bg: 'bg-gray-100', icon: 'text-gray-600' },
    blue: { bg: 'bg-blue-100', icon: 'text-blue-600' },
    green: { bg: 'bg-green-100', icon: 'text-green-600' },
    red: { bg: 'bg-red-100', icon: 'text-red-600' },
  };
  
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 ${colors[color].bg} rounded-lg flex items-center justify-center`}>
          <span className={colors[color].icon}>{icon}</span>
        </div>
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-xl font-bold">{value}</p>
        </div>
      </div>
    </Card>
  );
}
