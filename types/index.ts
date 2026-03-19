// Types pour l'application Rapid-Pub Dashboard

export interface Client {
  id: string;
  nom: string;
  email: string | null;
  telephone: string | null;
  adresse: string | null;
  entreprise: string | null;
  notes: string | null;
  statut: 'actif' | 'inactif';
  created_at: string;
  updated_at: string;
}

export interface Devis {
  id: string;
  numero: string;
  client_id: string | null;
  
  // Infos demande originale
  demande_brute: string | null;
  
  // Infos structurées
  titre: string | null;
  description: string | null;
  produit_type: string | null;
  quantite: number | null;
  format: string | null;
  papier: string | null;
  finition: string | null;
  recto_verso: boolean;
  
  // Prix
  prix_unitaire: number | null;
  prix_total: number | null;
  marge_estimee: number | null;
  
  // Statut et dates
  statut: 'brouillon' | 'envoye' | 'accepte' | 'refuse' | 'expire';
  date_envoi: string | null;
  date_reponse: string | null;
  date_validite: string | null;
  
  // Relances
  relance_count: number;
  derniere_relance: string | null;
  
  created_at: string;
  updated_at: string;
  
  // Relations (jointes)
  client?: Client;
}

export interface Commande {
  id: string;
  numero: string;
  devis_id: string | null;
  client_id: string | null;
  
  titre: string | null;
  description: string | null;
  prix_total: number | null;
  
  statut: 'nouvelle' | 'en_production' | 'pret' | 'livre' | 'annule';
  
  date_livraison_prevue: string | null;
  date_livraison_reelle: string | null;
  notes_production: string | null;
  
  created_at: string;
  updated_at: string;
  
  // Relations
  client?: Client;
  devis?: Devis;
}

export interface Facture {
  id: string;
  numero: string;
  commande_id: string | null;
  client_id: string | null;
  
  montant_ht: number | null;
  tva: number | null;
  montant_ttc: number | null;
  
  statut: 'emise' | 'payee' | 'en_retard';
  date_emission: string | null;
  date_echeance: string | null;
  date_paiement: string | null;
  
  created_at: string;
  updated_at: string;
  
  // Relations
  client?: Client;
  commande?: Commande;
}

// Types pour le Kanban
export type KanbanColumnId = 'a_traiter' | 'devis_envoyes' | 'en_production' | 'termine';

export interface KanbanColumn {
  id: KanbanColumnId;
  title: string;
  icon: string;
  color: string;
}

export interface KanbanItem {
  id: string;
  type: 'devis' | 'commande';
  client_nom: string;
  titre: string;
  prix: number | null;
  statut: string;
  created_at: string;
  jours_depuis_envoi?: number;
  relance_count?: number;
}

// Types pour l'analyse IA
export interface AIAnalysisResult {
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

// Types pour les statistiques
export interface ClientStats {
  ca_total: number;
  nb_commandes: number;
  panier_moyen: number;
  derniere_commande: string | null;
}
