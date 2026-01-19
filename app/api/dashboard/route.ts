import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Récupérer les devis en brouillon (À traiter)
    const aTraiter = await sql`
      SELECT 
        d.id,
        'devis' as type,
        COALESCE(c.nom, 'Client inconnu') as client_nom,
        COALESCE(d.titre, 'Sans titre') as titre,
        d.prix_total as prix,
        d.statut,
        d.created_at
      FROM devis d
      LEFT JOIN clients c ON d.client_id = c.id
      WHERE d.statut = 'brouillon'
      ORDER BY d.created_at DESC
    `;

    // Récupérer les devis envoyés (Devis envoyés)
    const devisEnvoyes = await sql`
      SELECT 
        d.id,
        'devis' as type,
        COALESCE(c.nom, 'Client inconnu') as client_nom,
        COALESCE(d.titre, 'Sans titre') as titre,
        d.prix_total as prix,
        d.statut,
        d.created_at,
        d.date_envoi,
        EXTRACT(DAY FROM NOW() - d.date_envoi)::integer as jours_depuis_envoi,
        d.relance_count
      FROM devis d
      LEFT JOIN clients c ON d.client_id = c.id
      WHERE d.statut = 'envoye'
      ORDER BY d.date_envoi ASC
    `;

    // Récupérer les commandes en production
    const enProduction = await sql`
      SELECT 
        cmd.id,
        'commande' as type,
        COALESCE(c.nom, 'Client inconnu') as client_nom,
        COALESCE(cmd.titre, 'Sans titre') as titre,
        cmd.prix_total as prix,
        cmd.statut,
        cmd.created_at
      FROM commandes cmd
      LEFT JOIN clients c ON cmd.client_id = c.id
      WHERE cmd.statut IN ('nouvelle', 'en_production')
      ORDER BY cmd.date_livraison_prevue ASC
    `;

    // Récupérer les commandes terminées (prêt ou livré récemment)
    const termine = await sql`
      SELECT 
        cmd.id,
        'commande' as type,
        COALESCE(c.nom, 'Client inconnu') as client_nom,
        COALESCE(cmd.titre, 'Sans titre') as titre,
        cmd.prix_total as prix,
        cmd.statut,
        cmd.created_at
      FROM commandes cmd
      LEFT JOIN clients c ON cmd.client_id = c.id
      WHERE cmd.statut IN ('pret', 'livre')
        AND cmd.updated_at > NOW() - INTERVAL '7 days'
      ORDER BY cmd.updated_at DESC
    `;

    return NextResponse.json({
      aTraiter,
      devisEnvoyes,
      enProduction,
      termine,
    });
  } catch (error) {
    console.error('Erreur dashboard:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des données' },
      { status: 500 }
    );
  }
}
