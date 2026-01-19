'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout';
import { Button, Card, CardContent, Input, Textarea } from '@/components/ui';
import { Save, Loader2, Check, Settings, Mail, Euro, Building2 } from 'lucide-react';

interface Parametres {
  // Entreprise
  entreprise_nom: string;
  entreprise_adresse: string;
  entreprise_siret: string;
  entreprise_tva_intra: string;
  entreprise_telephone: string;
  entreprise_email: string;
  
  // TVA et paiement
  tva_taux: string;
  delai_paiement: string;
  iban: string;
  
  // Email
  email_expediteur: string;
  email_signature: string;
  
  // Grille tarifaire - Flyers
  prix_flyers_a6_500: string;
  prix_flyers_a6_1000: string;
  prix_flyers_a6_2000: string;
  prix_flyers_a5_500: string;
  prix_flyers_a5_1000: string;
  prix_flyers_a5_2000: string;
  prix_flyers_a4_500: string;
  prix_flyers_a4_1000: string;
  prix_flyers_a4_2000: string;
  
  // Grille tarifaire - Cartes de visite
  prix_cdv_250: string;
  prix_cdv_500: string;
  prix_cdv_1000: string;
  
  // Grille tarifaire - Affiches
  prix_affiche_a3_50: string;
  prix_affiche_a3_100: string;
  prix_affiche_a2_50: string;
  prix_affiche_a2_100: string;
  
  // Options
  prix_recto_verso: string;
  prix_pelliculage_mat: string;
  prix_pelliculage_brillant: string;
  prix_vernis_selectif: string;
  prix_dorure: string;
  
  // Relances
  relance_j1: string;
  relance_j2: string;
}

const defaultParametres: Parametres = {
  entreprise_nom: 'Rapid-Pub',
  entreprise_adresse: '123 rue de l\'Imprimerie, 75001 Paris',
  entreprise_siret: '123 456 789 00012',
  entreprise_tva_intra: 'FR12345678901',
  entreprise_telephone: '01 23 45 67 89',
  entreprise_email: 'contact@rapid-pub.fr',
  tva_taux: '20',
  delai_paiement: '30',
  iban: 'FR76 1234 5678 9012 3456 7890 123',
  email_expediteur: 'devis@rapid-pub.fr',
  email_signature: 'Cordialement,\n\nL\'équipe Rapid-Pub\nTél: 01 23 45 67 89',
  // Flyers (prix HT)
  prix_flyers_a6_500: '85',
  prix_flyers_a6_1000: '120',
  prix_flyers_a6_2000: '180',
  prix_flyers_a5_500: '120',
  prix_flyers_a5_1000: '180',
  prix_flyers_a5_2000: '280',
  prix_flyers_a4_500: '180',
  prix_flyers_a4_1000: '280',
  prix_flyers_a4_2000: '450',
  // Cartes de visite
  prix_cdv_250: '45',
  prix_cdv_500: '65',
  prix_cdv_1000: '95',
  // Affiches
  prix_affiche_a3_50: '120',
  prix_affiche_a3_100: '180',
  prix_affiche_a2_50: '180',
  prix_affiche_a2_100: '280',
  // Options (supplément %)
  prix_recto_verso: '30',
  prix_pelliculage_mat: '25',
  prix_pelliculage_brillant: '25',
  prix_vernis_selectif: '40',
  prix_dorure: '60',
  // Relances (jours)
  relance_j1: '3',
  relance_j2: '7',
};

export default function ParametresPage() {
  const [parametres, setParametres] = useState<Parametres>(defaultParametres);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'entreprise' | 'tarifs' | 'email' | 'relances'>('entreprise');

  useEffect(() => {
    const fetchParametres = async () => {
      try {
        const response = await fetch('/api/parametres');
        if (response.ok) {
          const data = await response.json();
          setParametres({ ...defaultParametres, ...data });
        }
      } catch (err) {
        console.error('Erreur chargement paramètres:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchParametres();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/parametres', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parametres),
      });
      
      if (response.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch (err) {
      console.error('Erreur sauvegarde:', err);
    } finally {
      setSaving(false);
    }
  };

  const updateParam = (key: keyof Parametres, value: string) => {
    setParametres(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Paramètres" />
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-[#FF8C00]" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Paramètres" subtitle="Configuration de votre application" />
      
      <div className="p-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <TabButton 
            active={activeTab === 'entreprise'} 
            onClick={() => setActiveTab('entreprise')}
            icon={<Building2 className="w-4 h-4" />}
          >
            Entreprise
          </TabButton>
          <TabButton 
            active={activeTab === 'tarifs'} 
            onClick={() => setActiveTab('tarifs')}
            icon={<Euro className="w-4 h-4" />}
          >
            Grille tarifaire
          </TabButton>
          <TabButton 
            active={activeTab === 'email'} 
            onClick={() => setActiveTab('email')}
            icon={<Mail className="w-4 h-4" />}
          >
            Email
          </TabButton>
          <TabButton 
            active={activeTab === 'relances'} 
            onClick={() => setActiveTab('relances')}
            icon={<Settings className="w-4 h-4" />}
          >
            Relances
          </TabButton>
        </div>

        {/* Contenu */}
        {activeTab === 'entreprise' && (
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">Informations entreprise</h2>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Nom de l'entreprise"
                  value={parametres.entreprise_nom}
                  onChange={(e) => updateParam('entreprise_nom', e.target.value)}
                />
                <Input
                  label="Téléphone"
                  value={parametres.entreprise_telephone}
                  onChange={(e) => updateParam('entreprise_telephone', e.target.value)}
                />
                <Input
                  label="Adresse"
                  value={parametres.entreprise_adresse}
                  onChange={(e) => updateParam('entreprise_adresse', e.target.value)}
                  className="col-span-2"
                />
                <Input
                  label="Email"
                  value={parametres.entreprise_email}
                  onChange={(e) => updateParam('entreprise_email', e.target.value)}
                />
                <Input
                  label="SIRET"
                  value={parametres.entreprise_siret}
                  onChange={(e) => updateParam('entreprise_siret', e.target.value)}
                />
                <Input
                  label="N° TVA Intracommunautaire"
                  value={parametres.entreprise_tva_intra}
                  onChange={(e) => updateParam('entreprise_tva_intra', e.target.value)}
                />
                <Input
                  label="IBAN"
                  value={parametres.iban}
                  onChange={(e) => updateParam('iban', e.target.value)}
                />
                <Input
                  label="Taux TVA (%)"
                  type="number"
                  value={parametres.tva_taux}
                  onChange={(e) => updateParam('tva_taux', e.target.value)}
                />
                <Input
                  label="Délai de paiement (jours)"
                  type="number"
                  value={parametres.delai_paiement}
                  onChange={(e) => updateParam('delai_paiement', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'tarifs' && (
          <div className="space-y-6">
            {/* Flyers */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4">🖨️ Flyers (prix HT)</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Format</th>
                        <th className="text-center py-2">500 ex</th>
                        <th className="text-center py-2">1000 ex</th>
                        <th className="text-center py-2">2000 ex</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="py-2 font-medium">A6</td>
                        <td className="py-2"><PriceInput value={parametres.prix_flyers_a6_500} onChange={(v) => updateParam('prix_flyers_a6_500', v)} /></td>
                        <td className="py-2"><PriceInput value={parametres.prix_flyers_a6_1000} onChange={(v) => updateParam('prix_flyers_a6_1000', v)} /></td>
                        <td className="py-2"><PriceInput value={parametres.prix_flyers_a6_2000} onChange={(v) => updateParam('prix_flyers_a6_2000', v)} /></td>
                      </tr>
                      <tr>
                        <td className="py-2 font-medium">A5</td>
                        <td className="py-2"><PriceInput value={parametres.prix_flyers_a5_500} onChange={(v) => updateParam('prix_flyers_a5_500', v)} /></td>
                        <td className="py-2"><PriceInput value={parametres.prix_flyers_a5_1000} onChange={(v) => updateParam('prix_flyers_a5_1000', v)} /></td>
                        <td className="py-2"><PriceInput value={parametres.prix_flyers_a5_2000} onChange={(v) => updateParam('prix_flyers_a5_2000', v)} /></td>
                      </tr>
                      <tr>
                        <td className="py-2 font-medium">A4</td>
                        <td className="py-2"><PriceInput value={parametres.prix_flyers_a4_500} onChange={(v) => updateParam('prix_flyers_a4_500', v)} /></td>
                        <td className="py-2"><PriceInput value={parametres.prix_flyers_a4_1000} onChange={(v) => updateParam('prix_flyers_a4_1000', v)} /></td>
                        <td className="py-2"><PriceInput value={parametres.prix_flyers_a4_2000} onChange={(v) => updateParam('prix_flyers_a4_2000', v)} /></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Cartes de visite */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4">💼 Cartes de visite (prix HT)</h2>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm text-gray-500">250 ex</label>
                    <PriceInput value={parametres.prix_cdv_250} onChange={(v) => updateParam('prix_cdv_250', v)} />
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">500 ex</label>
                    <PriceInput value={parametres.prix_cdv_500} onChange={(v) => updateParam('prix_cdv_500', v)} />
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">1000 ex</label>
                    <PriceInput value={parametres.prix_cdv_1000} onChange={(v) => updateParam('prix_cdv_1000', v)} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Affiches */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4">🖼️ Affiches (prix HT)</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Format</th>
                        <th className="text-center py-2">50 ex</th>
                        <th className="text-center py-2">100 ex</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="py-2 font-medium">A3</td>
                        <td className="py-2"><PriceInput value={parametres.prix_affiche_a3_50} onChange={(v) => updateParam('prix_affiche_a3_50', v)} /></td>
                        <td className="py-2"><PriceInput value={parametres.prix_affiche_a3_100} onChange={(v) => updateParam('prix_affiche_a3_100', v)} /></td>
                      </tr>
                      <tr>
                        <td className="py-2 font-medium">A2</td>
                        <td className="py-2"><PriceInput value={parametres.prix_affiche_a2_50} onChange={(v) => updateParam('prix_affiche_a2_50', v)} /></td>
                        <td className="py-2"><PriceInput value={parametres.prix_affiche_a2_100} onChange={(v) => updateParam('prix_affiche_a2_100', v)} /></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Options */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4">⚙️ Options (supplément en %)</h2>
                <div className="grid grid-cols-5 gap-4">
                  <div>
                    <label className="text-sm text-gray-500">Recto-verso</label>
                    <PriceInput value={parametres.prix_recto_verso} onChange={(v) => updateParam('prix_recto_verso', v)} suffix="%" />
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Pelliculage mat</label>
                    <PriceInput value={parametres.prix_pelliculage_mat} onChange={(v) => updateParam('prix_pelliculage_mat', v)} suffix="%" />
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Pelliculage brillant</label>
                    <PriceInput value={parametres.prix_pelliculage_brillant} onChange={(v) => updateParam('prix_pelliculage_brillant', v)} suffix="%" />
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Vernis sélectif</label>
                    <PriceInput value={parametres.prix_vernis_selectif} onChange={(v) => updateParam('prix_vernis_selectif', v)} suffix="%" />
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Dorure</label>
                    <PriceInput value={parametres.prix_dorure} onChange={(v) => updateParam('prix_dorure', v)} suffix="%" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'email' && (
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">Configuration email</h2>
              <div className="space-y-4">
                <Input
                  label="Email expéditeur"
                  value={parametres.email_expediteur}
                  onChange={(e) => updateParam('email_expediteur', e.target.value)}
                />
                <Textarea
                  label="Signature email"
                  value={parametres.email_signature}
                  onChange={(e) => updateParam('email_signature', e.target.value)}
                  rows={5}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'relances' && (
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">Configuration des relances</h2>
              <p className="text-sm text-gray-500 mb-4">
                Définissez après combien de jours sans réponse une alerte de relance doit apparaître.
              </p>
              <div className="grid grid-cols-2 gap-4 max-w-md">
                <Input
                  label="1ère relance (jours)"
                  type="number"
                  value={parametres.relance_j1}
                  onChange={(e) => updateParam('relance_j1', e.target.value)}
                />
                <Input
                  label="2ème relance (jours)"
                  type="number"
                  value={parametres.relance_j2}
                  onChange={(e) => updateParam('relance_j2', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Bouton sauvegarder */}
        <div className="mt-6 flex justify-end">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : saved ? (
              <Check className="w-4 h-4 mr-2" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {saved ? 'Enregistré !' : 'Enregistrer'}
          </Button>
        </div>
      </div>
    </div>
  );
}

function TabButton({ 
  active, 
  onClick, 
  children, 
  icon 
}: { 
  active: boolean; 
  onClick: () => void; 
  children: React.ReactNode;
  icon: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
        active 
          ? 'bg-[#FF8C00] text-white' 
          : 'bg-white text-gray-600 hover:bg-gray-100'
      }`}
    >
      {icon}
      {children}
    </button>
  );
}

function PriceInput({ 
  value, 
  onChange, 
  suffix = '€' 
}: { 
  value: string; 
  onChange: (v: string) => void;
  suffix?: string;
}) {
  return (
    <div className="relative">
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-[#FF8C00] focus:border-transparent"
      />
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
        {suffix}
      </span>
    </div>
  );
}
