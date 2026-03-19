'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout';
import { Button, Card, Input, Badge, Modal } from '@/components/ui';
import { Plus, Search, Mail, Phone, Building2, MoreVertical, Loader2 } from 'lucide-react';
import { formatPrice, formatDate } from '@/lib/utils';

interface Client {
  id: string;
  nom: string;
  email: string | null;
  telephone: string | null;
  adresse: string | null;
  entreprise: string | null;
  statut: string;
  nb_commandes: number;
  ca_total: number;
  derniere_commande: string | null;
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewClientModal, setShowNewClientModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Formulaire nouveau client
  const [newClient, setNewClient] = useState({
    nom: '',
    entreprise: '',
    email: '',
    telephone: '',
    adresse: '',
  });

  // Charger les clients
  const fetchClients = async () => {
    try {
      const response = await fetch('/api/clients');
      if (response.ok) {
        const data = await response.json();
        setClients(data);
      }
    } catch (err) {
      console.error('Erreur chargement clients:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  // Créer un nouveau client
  const handleCreateClient = async () => {
    if (!newClient.nom.trim()) return;
    
    setIsSaving(true);
    try {
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newClient),
      });

      if (response.ok) {
        setShowNewClientModal(false);
        setNewClient({ nom: '', entreprise: '', email: '', telephone: '', adresse: '' });
        fetchClients();
      }
    } catch (err) {
      console.error('Erreur création client:', err);
    } finally {
      setIsSaving(false);
    }
  };
  
  // Filtrer les clients
  const filteredClients = clients.filter(
    (client) =>
      client.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (client.entreprise?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (client.email?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Clients" />
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-[#FF8C00]" />
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        title="Clients"
        subtitle={`${clients.length} client${clients.length > 1 ? 's' : ''} au total`}
      />
      
      <div className="p-6">
        {/* Barre d'actions */}
        <div className="flex items-center justify-between mb-6">
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Rechercher un client..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Button onClick={() => setShowNewClientModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nouveau client
          </Button>
        </div>
        
        {/* Liste des clients */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Commandes
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CA Total
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dernière commande
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredClients.map((client) => (
                  <tr
                    key={client.id}
                    className="hover:bg-gray-50 cursor-pointer"
                  >
                    <td className="px-4 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{client.nom}</p>
                        {client.entreprise && (
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            <Building2 className="w-3 h-3" />
                            {client.entreprise}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="space-y-1">
                        {client.email && (
                          <p className="text-sm text-gray-600 flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {client.email}
                          </p>
                        )}
                        {client.telephone && (
                          <p className="text-sm text-gray-600 flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {client.telephone}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="font-medium">{client.nb_commandes}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="font-semibold text-[#FF8C00]">
                        {formatPrice(client.ca_total)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      {client.derniere_commande ? formatDate(client.derniere_commande) : '-'}
                    </td>
                    <td className="px-4 py-4">
                      <Badge statut={client.statut} />
                    </td>
                    <td className="px-4 py-4">
                      <button className="p-1 hover:bg-gray-100 rounded">
                        <MoreVertical className="w-4 h-4 text-gray-400" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredClients.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">
                  {searchQuery ? 'Aucun client trouvé' : 'Aucun client pour le moment'}
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>
      
      {/* Modal nouveau client */}
      <Modal
        isOpen={showNewClientModal}
        onClose={() => setShowNewClientModal(false)}
        title="Nouveau client"
        size="md"
      >
        <div className="space-y-4">
          <Input 
            label="Nom complet *" 
            placeholder="Jean Dupont"
            value={newClient.nom}
            onChange={(e) => setNewClient({ ...newClient, nom: e.target.value })}
          />
          <Input 
            label="Entreprise" 
            placeholder="Dupont SARL"
            value={newClient.entreprise}
            onChange={(e) => setNewClient({ ...newClient, entreprise: e.target.value })}
          />
          <Input 
            label="Email" 
            type="email" 
            placeholder="email@exemple.com"
            value={newClient.email}
            onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
          />
          <Input 
            label="Téléphone" 
            placeholder="06 12 34 56 78"
            value={newClient.telephone}
            onChange={(e) => setNewClient({ ...newClient, telephone: e.target.value })}
          />
          <Input 
            label="Adresse" 
            placeholder="123 rue de la Paix, 75001 Paris"
            value={newClient.adresse}
            onChange={(e) => setNewClient({ ...newClient, adresse: e.target.value })}
          />
          
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowNewClientModal(false)}
            >
              Annuler
            </Button>
            <Button 
              className="flex-1"
              onClick={handleCreateClient}
              disabled={!newClient.nom.trim() || isSaving}
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              Créer le client
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
