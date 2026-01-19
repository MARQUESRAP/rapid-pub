import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';

export interface Alerte {
  id: string;
  type: 'devis' | 'facture' | 'commande';
  niveau: 'danger' | 'warning' | 'info';
  titre: string;
  description: string;
  lien: string;
  date: string;
}

export async function GET() {
  try {
    const alertes: Alerte[] = [];

    // Devis sans réponse depuis plus de 3 jours
    const devisSansReponse = await sql`
      SELECT 
        d.id,
        d.numero,
        c.nom as client_nom,
        d.prix_total,
        d.date_envoi,
        EXTRACT(DAY FROM NOW() - d.date_envoi)::integer as jours
      FROM devis d
      LEFT JOIN clients c ON d.client_id = c.id
      WHERE d.statut = 'envoye'
        AND d.date_envoi < NOW() - INTERVAL '3 days'
      ORDER BY d.date_envoi ASC
    `;

    for (const devis of devisSansReponse) {
      const jours = devis.jours || 0;
      alertes.push({
        id: `devis-${devis.id}`,
        type: 'devis',
        niveau: jours >= 7 ? 'danger' : 'warning',
        titre: `Devis ${devis.numero} sans réponse`,
        description: `${devis.client_nom || 'Client'} - ${jours} jours sans réponse`,
        lien: `/devis/${devis.id}`,
        date: devis.date_envoi,
      });
    }

    // Factures en retard
    const facturesRetard = await sql`
      SELECT 
        f.id,
        f.numero,
        c.nom as client_nom,
        f.montant_ttc,
        f.date_echeance,
        EXTRACT(DAY FROM NOW() - f.date_echeance)::integer as jours_retard
      FROM factures f
      LEFT JOIN clients c ON f.client_id = c.id
      WHERE f.statut = 'en_retard'
        OR (f.statut = 'emise' AND f.date_echeance < NOW())
      ORDER BY f.date_echeance ASC
    `;

    for (const facture of facturesRetard) {
      alertes.push({
        id: `facture-${facture.id}`,
        type: 'facture',
        niveau: 'danger',
        titre: `Facture ${facture.numero} en retard`,
        description: `${facture.client_nom || 'Client'} - ${facture.montant_ttc}€ depuis ${facture.jours_retard} jours`,
        lien: `/factures`,
        date: facture.date_echeance,
      });
    }

    // Factures qui arrivent à échéance dans 3 jours
    const facturesEcheance = await sql`
      SELECT 
        f.id,
        f.numero,
        c.nom as client_nom,
        f.montant_ttc,
        f.date_echeance
      FROM factures f
      LEFT JOIN clients c ON f.client_id = c.id
      WHERE f.statut = 'emise'
        AND f.date_echeance BETWEEN NOW() AND NOW() + INTERVAL '3 days'
      ORDER BY f.date_echeance ASC
    `;

    for (const facture of facturesEcheance) {
      alertes.push({
        id: `facture-echeance-${facture.id}`,
        type: 'facture',
        niveau: 'warning',
        titre: `Échéance proche: ${facture.numero}`,
        description: `${facture.client_nom || 'Client'} - ${facture.montant_ttc}€`,
        lien: `/factures`,
        date: facture.date_echeance,
      });
    }

    // Commandes prêtes à livrer
    const commandesPret = await sql`
      SELECT 
        cmd.id,
        cmd.numero,
        c.nom as client_nom,
        cmd.titre
      FROM commandes cmd
      LEFT JOIN clients c ON cmd.client_id = c.id
      WHERE cmd.statut = 'pret'
      ORDER BY cmd.updated_at ASC
    `;

    for (const commande of commandesPret) {
      alertes.push({
        id: `commande-${commande.id}`,
        type: 'commande',
        niveau: 'info',
        titre: `Commande prête: ${commande.numero}`,
        description: `${commande.client_nom || 'Client'} - ${commande.titre || 'À livrer'}`,
        lien: `/commandes`,
        date: new Date().toISOString(),
      });
    }

    // Trier par niveau de gravité puis par date
    const niveauOrdre = { danger: 0, warning: 1, info: 2 };
    alertes.sort((a, b) => {
      if (niveauOrdre[a.niveau] !== niveauOrdre[b.niveau]) {
        return niveauOrdre[a.niveau] - niveauOrdre[b.niveau];
      }
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });

    return NextResponse.json(alertes);
  } catch (error) {
    console.error('Erreur alertes GET:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des alertes' },
      { status: 500 }
    );
  }
}
