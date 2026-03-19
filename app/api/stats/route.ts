import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // CA des 6 derniers mois
    const caParMois = await sql`
      SELECT 
        TO_CHAR(date_emission, 'YYYY-MM') as mois,
        TO_CHAR(date_emission, 'Mon') as mois_label,
        SUM(montant_ttc)::numeric as ca
      FROM factures
      WHERE statut IN ('emise', 'payee')
        AND date_emission >= NOW() - INTERVAL '6 months'
      GROUP BY TO_CHAR(date_emission, 'YYYY-MM'), TO_CHAR(date_emission, 'Mon')
      ORDER BY mois
    `;

    // Taux de conversion devis -> commandes
    const totalDevis = await sql`SELECT COUNT(*)::integer as count FROM devis WHERE statut != 'brouillon'`;
    const devisAcceptes = await sql`SELECT COUNT(*)::integer as count FROM devis WHERE statut = 'accepte'`;
    const tauxConversion = totalDevis[0]?.count > 0 
      ? Math.round((devisAcceptes[0]?.count / totalDevis[0]?.count) * 100) 
      : 0;

    // Top 5 clients par CA
    const topClients = await sql`
      SELECT 
        c.nom,
        c.entreprise,
        COALESCE(SUM(f.montant_ttc), 0)::numeric as ca_total,
        COUNT(DISTINCT cmd.id)::integer as nb_commandes
      FROM clients c
      LEFT JOIN commandes cmd ON c.id = cmd.client_id
      LEFT JOIN factures f ON cmd.id = f.commande_id AND f.statut IN ('emise', 'payee')
      GROUP BY c.id, c.nom, c.entreprise
      ORDER BY ca_total DESC
      LIMIT 5
    `;

    // Répartition par type de produit
    const repartitionProduits = await sql`
      SELECT 
        COALESCE(produit_type, 'autres') as type,
        COUNT(*)::integer as count,
        SUM(prix_total)::numeric as montant
      FROM devis
      WHERE statut IN ('accepte')
      GROUP BY produit_type
      ORDER BY montant DESC
    `;

    // Stats globales
    const statsGlobales = await sql`
      SELECT
        (SELECT COUNT(*) FROM clients) as total_clients,
        (SELECT COUNT(*) FROM devis WHERE statut = 'brouillon') as devis_brouillon,
        (SELECT COUNT(*) FROM devis WHERE statut = 'envoye') as devis_envoyes,
        (SELECT COUNT(*) FROM commandes WHERE statut IN ('nouvelle', 'en_production')) as commandes_en_cours,
        (SELECT COALESCE(SUM(montant_ttc), 0) FROM factures WHERE statut = 'emise') as factures_en_attente,
        (SELECT COALESCE(SUM(montant_ttc), 0) FROM factures WHERE statut = 'en_retard') as factures_en_retard,
        (SELECT COALESCE(SUM(montant_ttc), 0) FROM factures WHERE statut = 'payee' AND date_paiement >= DATE_TRUNC('month', NOW())) as ca_mois
    `;

    // Commandes par statut
    const commandesParStatut = await sql`
      SELECT 
        statut,
        COUNT(*)::integer as count
      FROM commandes
      GROUP BY statut
    `;

    // Activité récente (7 derniers jours)
    const activiteRecente = await sql`
      SELECT 
        DATE(created_at) as jour,
        COUNT(*)::integer as count
      FROM (
        SELECT created_at FROM devis WHERE created_at >= NOW() - INTERVAL '7 days'
        UNION ALL
        SELECT created_at FROM commandes WHERE created_at >= NOW() - INTERVAL '7 days'
      ) as activite
      GROUP BY DATE(created_at)
      ORDER BY jour
    `;

    return NextResponse.json({
      caParMois,
      tauxConversion,
      topClients,
      repartitionProduits,
      statsGlobales: statsGlobales[0],
      commandesParStatut,
      activiteRecente,
    });
  } catch (error) {
    console.error('Erreur stats GET:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des statistiques' },
      { status: 500 }
    );
  }
}
