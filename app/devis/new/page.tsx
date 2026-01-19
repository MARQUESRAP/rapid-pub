'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout';
import { Button, Card, CardContent, Input, Textarea, Select, Badge } from '@/components/ui';
import { Sparkles, Send, Save, ArrowLeft, Loader2, CheckCircle, User } from 'lucide-react';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';

// Types pour l'analyse IA
interface AIAnalysisResult {
  client: {
    nom: string;
    entreprise: string;
    email: string;
    telephone: string;
  };
  produit: {
    type: string;
    quantite: number | null;
    format: string;
    papier: string;
    recto_verso: boolean;
    finitions: string[];
  };
  delai: string;
  notes: string;
  confiance: number;
}

interface Client {
  id: string;
  nom: string;
  email: string;
  entreprise: string;
}

// Options pour les selects
const produitsOptions = [
  { value: '', label: 'Sélectionner un produit' },
  { value: 'flyers', label: 'Flyers' },
  { value: 'cartes_visite', label: 'Cartes de visite' },
  { value: 'affiches', label: 'Affiches' },
  { value: 'depliants', label: 'Dépliants' },
  { value: 'kakemono', label: 'Kakémono / Roll-up' },
  { value: 'stickers', label: 'Stickers / Autocollants' },
  { value: 'brochures', label: 'Brochures' },
  { value: 'autres', label: 'Autres' },
];

const formatOptions = [
  { value: '', label: 'Sélectionner un format' },
  { value: 'A6', label: 'A6 (10.5 x 14.8 cm)' },
  { value: 'A5', label: 'A5 (14.8 x 21 cm)' },
  { value: 'A4', label: 'A4 (21 x 29.7 cm)' },
  { value: 'A3', label: 'A3 (29.7 x 42 cm)' },
  { value: 'A2', label: 'A2 (42 x 59.4 cm)' },
  { value: '85x55mm', label: 'Carte de visite (85 x 55 mm)' },
  { value: 'personnalise', label: 'Format personnalisé' },
];

const papierOptions = [
  { value: '', label: 'Sélectionner un papier' },
  { value: '90g', label: '90g - Standard' },
  { value: '135g', label: '135g - Couché' },
  { value: '170g', label: '170g - Semi-rigide' },
  { value: '250g', label: '250g - Rigide' },
  { value: '350g', label: '350g - Cartonné' },
  { value: '400g', label: '400g - Très épais' },
];

export default function NouveauDevisPage() {
  const router = useRouter();
  const [demandeTexte, setDemandeTexte] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(null);
  const [showManualForm, setShowManualForm] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState('');
  
  // Champs du formulaire
  const [formData, setFormData] = useState({
    clientNom: '',
    clientEntreprise: '',
    clientEmail: '',
    clientTelephone: '',
    produitType: '',
    quantite: '',
    format: '',
    papier: '',
    rectoVerso: false,
    finitions: '',
    prixTotal: '',
    notes: '',
  });

  // Charger la liste des clients
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await fetch('/api/clients');
        if (response.ok) {
          const data = await response.json();
          setClients(data);
        }
      } catch (err) {
        console.error('Erreur chargement clients:', err);
      }
    };
    fetchClients();
  }, []);
  
  // Analyse avec l'IA
  const handleAnalyze = async () => {
    if (!demandeTexte.trim()) return;
    
    setIsAnalyzing(true);
    
    try {
      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ demande: demandeTexte }),
      });

      if (response.ok) {
        const result: AIAnalysisResult = await response.json();
        setAnalysisResult(result);
        
        // Pré-remplir le formulaire
        setFormData({
          clientNom: result.client.nom || '',
          clientEntreprise: result.client.entreprise || '',
          clientEmail: result.client.email || '',
          clientTelephone: result.client.telephone || '',
          produitType: result.produit.type || '',
          quantite: result.produit.quantite?.toString() || '',
          format: result.produit.format || '',
          papier: result.produit.papier || '',
          rectoVerso: result.produit.recto_verso || false,
          finitions: result.produit.finitions?.join(', ') || '',
          prixTotal: '',
          notes: result.notes || '',
        });
        
        setShowManualForm(true);
      }
    } catch (err) {
      console.error('Erreur analyse:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  // Mise à jour du formulaire
  const updateForm = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Sélection d'un client existant
  const handleClientSelect = (clientId: string) => {
    setSelectedClientId(clientId);
    const client = clients.find(c => c.id === clientId);
    if (client) {
      setFormData(prev => ({
        ...prev,
        clientNom: client.nom || '',
        clientEmail: client.email || '',
        clientEntreprise: client.entreprise || '',
      }));
    }
  };
  
  // Sauvegarde du devis
  const handleSave = async (status: 'brouillon' | 'envoye') => {
    setIsSaving(true);
    
    try {
      // Créer ou récupérer le client
      let clientId = selectedClientId;
      
      if (!clientId && formData.clientNom) {
        // Créer un nouveau client
        const clientResponse = await fetch('/api/clients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nom: formData.clientNom,
            email: formData.clientEmail || null,
            telephone: formData.clientTelephone || null,
            entreprise: formData.clientEntreprise || null,
          }),
        });
        
        if (clientResponse.ok) {
          const newClient = await clientResponse.json();
          clientId = newClient.id;
        }
      }

      // Créer le titre automatiquement
      const titre = [
        produitsOptions.find(p => p.value === formData.produitType)?.label || formData.produitType,
        formData.format,
        formData.quantite ? `${formData.quantite} ex` : '',
      ].filter(Boolean).join(' - ');

      // Créer le devis
      const devisResponse = await fetch('/api/devis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: clientId || null,
          demande_brute: demandeTexte || null,
          titre: titre || 'Nouveau devis',
          produit_type: formData.produitType || null,
          quantite: formData.quantite ? parseInt(formData.quantite) : null,
          format: formData.format || null,
          papier: formData.papier || null,
          finition: formData.finitions || null,
          recto_verso: formData.rectoVerso,
          prix_total: formData.prixTotal ? parseFloat(formData.prixTotal) : null,
          statut: status,
        }),
      });

      if (devisResponse.ok) {
        router.push('/devis');
      } else {
        throw new Error('Erreur création devis');
      }
    } catch (err) {
      console.error('Erreur sauvegarde:', err);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        title="Nouveau devis"
        subtitle="Créez un devis à partir d'une demande client"
      />
      
      <div className="p-6">
        {/* Bouton retour */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour au dashboard
        </Link>
        
        <div className="grid grid-cols-2 gap-6">
          {/* Colonne gauche - Demande brute */}
          <div>
            <Card>
              <CardContent className="p-4">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#FF8C00]" />
                  Analyse IA de la demande
                </h2>
                
                <Textarea
                  label="Collez ici l'email ou la demande du client"
                  placeholder="Ex: Bonjour, je voudrais un devis pour 500 flyers A5 recto-verso sur du papier 350g avec un vernis sélectif sur le logo. Livraison souhaitée pour le 20 janvier. Merci !"
                  rows={10}
                  value={demandeTexte}
                  onChange={(e) => setDemandeTexte(e.target.value)}
                />
                
                <Button
                  className="w-full mt-4"
                  onClick={handleAnalyze}
                  disabled={!demandeTexte.trim() || isAnalyzing}
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyse en cours...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Analyser avec l'IA
                    </>
                  )}
                </Button>
                
                {/* Résultat de l'analyse */}
                {analysisResult && (
                  <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="font-medium text-green-800">Analyse terminée</span>
                      <Badge variant="success" className="ml-auto">
                        {Math.round(analysisResult.confiance * 100)}% de confiance
                      </Badge>
                    </div>
                    <p className="text-sm text-green-700">
                      Les champs ont été pré-remplis. Vérifiez et complétez les informations.
                    </p>
                  </div>
                )}
                
                {/* Lien vers formulaire manuel */}
                {!showManualForm && (
                  <button
                    className="mt-4 text-sm text-gray-500 hover:text-gray-700 underline"
                    onClick={() => setShowManualForm(true)}
                  >
                    Ou remplir le formulaire manuellement
                  </button>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Colonne droite - Formulaire */}
          {showManualForm && (
            <div>
              <Card>
                <CardContent className="p-4">
                  <h2 className="text-lg font-semibold mb-4">Détails du devis</h2>
                  
                  {/* Section Client */}
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Client
                    </h3>

                    {/* Sélection client existant */}
                    {clients.length > 0 && (
                      <div className="mb-3">
                        <Select
                          label="Client existant"
                          options={[
                            { value: '', label: 'Nouveau client' },
                            ...clients.map(c => ({ value: c.id, label: `${c.nom}${c.entreprise ? ` - ${c.entreprise}` : ''}` }))
                          ]}
                          value={selectedClientId}
                          onChange={(e) => handleClientSelect(e.target.value)}
                        />
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        label="Nom"
                        value={formData.clientNom}
                        onChange={(e) => updateForm('clientNom', e.target.value)}
                        placeholder="Jean Dupont"
                        disabled={!!selectedClientId}
                      />
                      <Input
                        label="Entreprise"
                        value={formData.clientEntreprise}
                        onChange={(e) => updateForm('clientEntreprise', e.target.value)}
                        placeholder="Dupont SARL"
                        disabled={!!selectedClientId}
                      />
                      <Input
                        label="Email"
                        type="email"
                        value={formData.clientEmail}
                        onChange={(e) => updateForm('clientEmail', e.target.value)}
                        placeholder="email@exemple.com"
                        disabled={!!selectedClientId}
                      />
                      <Input
                        label="Téléphone"
                        value={formData.clientTelephone}
                        onChange={(e) => updateForm('clientTelephone', e.target.value)}
                        placeholder="06 12 34 56 78"
                      />
                    </div>
                  </div>
                  
                  {/* Section Produit */}
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
                      Produit
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <Select
                        label="Type de produit"
                        options={produitsOptions}
                        value={formData.produitType}
                        onChange={(e) => updateForm('produitType', e.target.value)}
                      />
                      <Input
                        label="Quantité"
                        type="number"
                        value={formData.quantite}
                        onChange={(e) => updateForm('quantite', e.target.value)}
                        placeholder="500"
                      />
                      <Select
                        label="Format"
                        options={formatOptions}
                        value={formData.format}
                        onChange={(e) => updateForm('format', e.target.value)}
                      />
                      <Select
                        label="Papier"
                        options={papierOptions}
                        value={formData.papier}
                        onChange={(e) => updateForm('papier', e.target.value)}
                      />
                    </div>
                    
                    <div className="mt-3 flex items-center gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.rectoVerso}
                          onChange={(e) => updateForm('rectoVerso', e.target.checked)}
                          className="w-4 h-4 rounded border-gray-300 text-[#FF8C00] focus:ring-[#FF8C00]"
                        />
                        <span className="text-sm text-gray-700">Recto-verso</span>
                      </label>
                    </div>
                    
                    <div className="mt-3">
                      <Input
                        label="Finitions (optionnel)"
                        value={formData.finitions}
                        onChange={(e) => updateForm('finitions', e.target.value)}
                        placeholder="Vernis sélectif, pelliculage mat..."
                      />
                    </div>
                  </div>
                  
                  {/* Section Prix */}
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
                      Tarification
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        label="Prix total HT (€)"
                        type="number"
                        step="0.01"
                        value={formData.prixTotal}
                        onChange={(e) => updateForm('prixTotal', e.target.value)}
                        placeholder="350.00"
                      />
                      <div className="flex items-end">
                        <div className="bg-gray-100 rounded-lg p-3 flex-1">
                          <span className="text-sm text-gray-500">Prix TTC</span>
                          <p className="text-xl font-bold text-[#FF8C00]">
                            {formData.prixTotal
                              ? formatPrice(parseFloat(formData.prixTotal) * 1.2)
                              : '-'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Notes */}
                  <div className="mb-6">
                    <Textarea
                      label="Notes internes (optionnel)"
                      value={formData.notes}
                      onChange={(e) => updateForm('notes', e.target.value)}
                      placeholder="Notes pour le suivi interne..."
                      rows={3}
                    />
                  </div>
                  
                  {/* Actions */}
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleSave('brouillon')}
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      Sauvegarder en brouillon
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={() => handleSave('envoye')}
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4 mr-2" />
                      )}
                      Marquer comme envoyé
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
