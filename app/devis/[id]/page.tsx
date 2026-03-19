'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout';
import { Button, Card, CardContent, Input, Textarea, Select, Badge, Modal } from '@/components/ui';
import { 
  ArrowLeft, Save, Send, Trash2, FileText, Loader2, 
  CheckCircle, X, Clock, Mail, Phone, Building2,
  Download, Printer, RefreshCw
} from 'lucide-react';
import Link from 'next/link';
import { formatPrice, formatDate } from '@/lib/utils';

interface Devis {
  id: string;
  numero: string;
  client_id: string | null;
  client_nom: string | null;
  client_email: string | null;
  client_telephone: string | null;
  client_entreprise: string | null;
  demande_brute: string | null;
  titre: string | null;
  description: string | null;
  produit_type: string | null;
  quantite: number | null;
  format: string | null;
  papier: string | null;
  finition: string | null;
  recto_verso: boolean;
  prix_unitaire: number | null;
  prix_total: number | null;
  statut: string;
  date_envoi: string | null;
  date_reponse: string | null;
  date_validite: string | null;
  relance_count: number;
  created_at: string;
  updated_at: string;
}

const produitsOptions = [
  { value: '', label: 'Sélectionner' },
  { value: 'flyers', label: 'Flyers' },
  { value: 'cartes_visite', label: 'Cartes de visite' },
  { value: 'affiches', label: 'Affiches' },
  { value: 'depliants', label: 'Dépliants' },
  { value: 'kakemono', label: 'Kakémono / Roll-up' },
  { value: 'stickers', label: 'Stickers' },
  { value: 'brochures', label: 'Brochures' },
  { value: 'autres', label: 'Autres' },
];

const formatOptions = [
  { value: '', label: 'Sélectionner' },
  { value: 'A6', label: 'A6' },
  { value: 'A5', label: 'A5' },
  { value: 'A4', label: 'A4' },
  { value: 'A3', label: 'A3' },
  { value: 'A2', label: 'A2' },
  { value: '85x55mm', label: '85x55mm' },
  { value: 'personnalise', label: 'Personnalisé' },
];

const papierOptions = [
  { value: '', label: 'Sélectionner' },
  { value: '90g', label: '90g' },
  { value: '135g', label: '135g' },
  { value: '170g', label: '170g' },
  { value: '250g', label: '250g' },
  { value: '350g', label: '350g' },
  { value: '400g', label: '400g' },
];

export default function DevisDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [devis, setDevis] = useState<Devis | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  
  // Form data pour l'édition
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    produit_type: '',
    quantite: '',
    format: '',
    papier: '',
    finition: '',
    recto_verso: false,
    prix_total: '',
  });

  // Charger le devis
  const fetchDevis = async () => {
    try {
      const response = await fetch(`/api/devis/${id}`);
      if (response.ok) {
        const data = await response.json();
        setDevis(data);
        setFormData({
          titre: data.titre || '',
          description: data.description || '',
          produit_type: data.produit_type || '',
          quantite: data.quantite?.toString() || '',
          format: data.format || '',
          papier: data.papier || '',
          finition: data.finition || '',
          recto_verso: data.recto_verso || false,
          prix_total: data.prix_total?.toString() || '',
        });
      } else {
        router.push('/devis');
      }
    } catch (err) {
      console.error('Erreur chargement devis:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevis();
  }, [id]);

  // Changer le statut
  const handleStatusChange = async (newStatus: string) => {
    setSaving(true);
    try {
      const response = await fetch(`/api/devis/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statut: newStatus }),
      });
      
      if (response.ok) {
        fetchDevis();
      }
    } catch (err) {
      console.error('Erreur changement statut:', err);
    } finally {
      setSaving(false);
    }
  };

  // Supprimer le devis
  const handleDelete = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/devis/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        router.push('/devis');
      }
    } catch (err) {
      console.error('Erreur suppression:', err);
    } finally {
      setSaving(false);
      setShowDeleteModal(false);
    }
  };

  // Sauvegarder les modifications
  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/devis/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titre: formData.titre,
          description: formData.description,
          produit_type: formData.produit_type,
          quantite: formData.quantite ? parseInt(formData.quantite) : null,
          format: formData.format,
          papier: formData.papier,
          finition: formData.finition,
          recto_verso: formData.recto_verso,
          prix_total: formData.prix_total ? parseFloat(formData.prix_total) : null,
        }),
      });
      
      if (response.ok) {
        setEditMode(false);
        fetchDevis();
      }
    } catch (err) {
      console.error('Erreur sauvegarde:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Chargement..." />
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-[#FF8C00]" />
        </div>
      </div>
    );
  }

  if (!devis) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Devis non trouvé" />
        <div className="p-6 text-center">
          <p className="text-gray-500 mb-4">Ce devis n'existe pas ou a été supprimé.</p>
          <Link href="/devis">
            <Button>Retour à la liste</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Actions selon le statut
  const getStatusActions = () => {
    switch (devis.statut) {
      case 'brouillon':
        return (
          <Button onClick={() => handleStatusChange('envoye')} disabled={saving}>
            <Send className="w-4 h-4 mr-2" />
            Marquer comme envoyé
          </Button>
        );
      case 'envoye':
        return (
          <>
            <Button onClick={() => handleStatusChange('accepte')} disabled={saving}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Accepter
            </Button>
            <Button variant="danger" onClick={() => handleStatusChange('refuse')} disabled={saving}>
              <X className="w-4 h-4 mr-2" />
              Refuser
            </Button>
            <Button variant="outline" onClick={() => handleStatusChange('relance')} disabled={saving}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Relancer (+1)
            </Button>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        title={`Devis ${devis.numero}`}
        subtitle={devis.client_nom || 'Client inconnu'}
      />
      
      <div className="p-6">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/devis" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-4 h-4" />
            Retour à la liste
          </Link>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" disabled>
              <Download className="w-4 h-4 mr-2" />
              Télécharger PDF
            </Button>
            <Button variant="outline" disabled>
              <Printer className="w-4 h-4 mr-2" />
              Imprimer
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Colonne principale */}
          <div className="col-span-2 space-y-6">
            {/* Statut et actions */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge statut={devis.statut} className="text-base px-3 py-1" />
                    {devis.statut === 'envoye' && devis.date_envoi && (
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        Envoyé le {formatDate(devis.date_envoi)}
                      </span>
                    )}
                    {devis.relance_count > 0 && (
                      <span className="text-sm text-orange-500">
                        {devis.relance_count} relance{devis.relance_count > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusActions()}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Détails du produit */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg">Détails du devis</h3>
                  {!editMode && devis.statut === 'brouillon' && (
                    <Button variant="outline" size="sm" onClick={() => setEditMode(true)}>
                      Modifier
                    </Button>
                  )}
                </div>

                {editMode ? (
                  <div className="space-y-4">
                    <Input
                      label="Titre"
                      value={formData.titre}
                      onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                    />
                    <Textarea
                      label="Description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <Select
                        label="Type de produit"
                        options={produitsOptions}
                        value={formData.produit_type}
                        onChange={(e) => setFormData({ ...formData, produit_type: e.target.value })}
                      />
                      <Input
                        label="Quantité"
                        type="number"
                        value={formData.quantite}
                        onChange={(e) => setFormData({ ...formData, quantite: e.target.value })}
                      />
                      <Select
                        label="Format"
                        options={formatOptions}
                        value={formData.format}
                        onChange={(e) => setFormData({ ...formData, format: e.target.value })}
                      />
                      <Select
                        label="Papier"
                        options={papierOptions}
                        value={formData.papier}
                        onChange={(e) => setFormData({ ...formData, papier: e.target.value })}
                      />
                    </div>
                    <Input
                      label="Finitions"
                      value={formData.finition}
                      onChange={(e) => setFormData({ ...formData, finition: e.target.value })}
                    />
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.recto_verso}
                        onChange={(e) => setFormData({ ...formData, recto_verso: e.target.checked })}
                        className="rounded border-gray-300"
                      />
                      <span>Recto-verso</span>
                    </label>
                    <Input
                      label="Prix total HT (€)"
                      type="number"
                      step="0.01"
                      value={formData.prix_total}
                      onChange={(e) => setFormData({ ...formData, prix_total: e.target.value })}
                    />
                    <div className="flex gap-2">
                      <Button onClick={handleSave} disabled={saving}>
                        {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                        Enregistrer
                      </Button>
                      <Button variant="outline" onClick={() => setEditMode(false)}>
                        Annuler
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900">{devis.titre || 'Sans titre'}</h4>
                      {devis.description && (
                        <p className="text-gray-600 mt-1">{devis.description}</p>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <span className="text-gray-500">Type</span>
                        <p className="font-medium">{produitsOptions.find(p => p.value === devis.produit_type)?.label || '-'}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <span className="text-gray-500">Quantité</span>
                        <p className="font-medium">{devis.quantite || '-'} ex.</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <span className="text-gray-500">Format</span>
                        <p className="font-medium">{devis.format || '-'}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <span className="text-gray-500">Papier</span>
                        <p className="font-medium">{devis.papier || '-'}</p>
                      </div>
                      {devis.finition && (
                        <div className="bg-gray-50 rounded-lg p-3 col-span-2">
                          <span className="text-gray-500">Finitions</span>
                          <p className="font-medium">{devis.finition}</p>
                        </div>
                      )}
                      {devis.recto_verso && (
                        <div className="col-span-2">
                          <Badge variant="info">Recto-verso</Badge>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Demande brute */}
            {devis.demande_brute && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-3">Demande originale</h3>
                  <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-wrap">
                    {devis.demande_brute}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Colonne latérale */}
          <div className="space-y-6">
            {/* Prix */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3">Tarification</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Prix HT</span>
                    <span className="font-semibold">{formatPrice(devis.prix_total)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">TVA (20%)</span>
                    <span>{formatPrice((devis.prix_total || 0) * 0.2)}</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between">
                    <span className="font-semibold">Total TTC</span>
                    <span className="text-xl font-bold text-[#FF8C00]">
                      {formatPrice((devis.prix_total || 0) * 1.2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Client */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3">Client</h3>
                <div className="space-y-2">
                  <p className="font-medium">{devis.client_nom || 'Non renseigné'}</p>
                  {devis.client_entreprise && (
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      {devis.client_entreprise}
                    </p>
                  )}
                  {devis.client_email && (
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {devis.client_email}
                    </p>
                  )}
                  {devis.client_telephone && (
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      {devis.client_telephone}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Dates */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3">Historique</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Créé le</span>
                    <span>{formatDate(devis.created_at)}</span>
                  </div>
                  {devis.date_envoi && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Envoyé le</span>
                      <span>{formatDate(devis.date_envoi)}</span>
                    </div>
                  )}
                  {devis.date_validite && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Valide jusqu'au</span>
                      <span>{formatDate(devis.date_validite)}</span>
                    </div>
                  )}
                  {devis.date_reponse && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Réponse le</span>
                      <span>{formatDate(devis.date_reponse)}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Actions dangereuses */}
            {devis.statut === 'brouillon' && (
              <Card className="border-red-200">
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-3 text-red-600">Zone de danger</h3>
                  <Button 
                    variant="danger" 
                    className="w-full"
                    onClick={() => setShowDeleteModal(true)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Supprimer ce devis
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Modal de confirmation de suppression */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Supprimer le devis"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Êtes-vous sûr de vouloir supprimer le devis <strong>{devis.numero}</strong> ? 
            Cette action est irréversible.
          </p>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setShowDeleteModal(false)}>
              Annuler
            </Button>
            <Button variant="danger" className="flex-1" onClick={handleDelete} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
              Supprimer
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
