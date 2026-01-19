import { clsx, type ClassValue } from 'clsx';

// Fonction pour combiner les classes CSS
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

// Formater un prix en euros
export function formatPrice(price: number | null): string {
  if (price === null) return '-';
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(price);
}

// Formater une date
export function formatDate(date: string | null): string {
  if (!date) return '-';
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date));
}

// Formater une date relative (il y a X jours)
export function formatRelativeDate(date: string | null): string {
  if (!date) return '-';
  
  const now = new Date();
  const then = new Date(date);
  const diffTime = now.getTime() - then.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return "Aujourd'hui";
  if (diffDays === 1) return 'Hier';
  if (diffDays < 7) return `Il y a ${diffDays} jours`;
  if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} semaine(s)`;
  return formatDate(date);
}

// Calculer le nombre de jours depuis une date
export function daysSince(date: string | null): number {
  if (!date) return 0;
  const now = new Date();
  const then = new Date(date);
  const diffTime = now.getTime() - then.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

// Générer un numéro de devis
export function generateDevisNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `DEV-${year}-${random}`;
}

// Générer un numéro de commande
export function generateCommandeNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `CMD-${year}-${random}`;
}

// Générer un numéro de facture
export function generateFactureNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `FAC-${year}-${random}`;
}

// Couleurs de statut pour les badges
export const statutColors: Record<string, { bg: string; text: string }> = {
  // Devis
  brouillon: { bg: 'bg-gray-100', text: 'text-gray-700' },
  envoye: { bg: 'bg-blue-100', text: 'text-blue-700' },
  accepte: { bg: 'bg-green-100', text: 'text-green-700' },
  refuse: { bg: 'bg-red-100', text: 'text-red-700' },
  expire: { bg: 'bg-orange-100', text: 'text-orange-700' },
  
  // Commandes
  nouvelle: { bg: 'bg-purple-100', text: 'text-purple-700' },
  en_production: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  pret: { bg: 'bg-green-100', text: 'text-green-700' },
  livre: { bg: 'bg-gray-100', text: 'text-gray-700' },
  annule: { bg: 'bg-red-100', text: 'text-red-700' },
  
  // Factures
  emise: { bg: 'bg-blue-100', text: 'text-blue-700' },
  payee: { bg: 'bg-green-100', text: 'text-green-700' },
  en_retard: { bg: 'bg-red-100', text: 'text-red-700' },
  
  // Clients
  actif: { bg: 'bg-green-100', text: 'text-green-700' },
  inactif: { bg: 'bg-gray-100', text: 'text-gray-700' },
};

// Labels français pour les statuts
export const statutLabels: Record<string, string> = {
  // Devis
  brouillon: 'Brouillon',
  envoye: 'Envoyé',
  accepte: 'Accepté',
  refuse: 'Refusé',
  expire: 'Expiré',
  
  // Commandes
  nouvelle: 'Nouvelle',
  en_production: 'En production',
  pret: 'Prêt',
  livre: 'Livré',
  annule: 'Annulé',
  
  // Factures
  emise: 'Émise',
  payee: 'Payée',
  en_retard: 'En retard',
  
  // Clients
  actif: 'Actif',
  inactif: 'Inactif',
};
