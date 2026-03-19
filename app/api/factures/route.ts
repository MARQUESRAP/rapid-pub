import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';

// GET - Liste des factures
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const statut = searchParams.get('statut');

    let factures;
    
    if (statut) {
      factures = await sql`
        SELECT 
          f.*,
          c.nom as client_nom,
          c.email as client_email,
          cmd.numero as commande_numero
        FROM factures f
        LEFT JOIN clients c ON f.client_id = c.id
        LEFT JOIN commandes cmd ON f.commande_id = cmd.id
        WHERE f.statut = ${statut}
        ORDER BY f.date_emission DESC
      `;
    } else {
      factures = await sql`
        SELECT 
          f.*,
          c.nom as client_nom,
          c.email as client_email,
          cmd.numero as commande_numero
        FROM factures f
        LEFT JOIN clients c ON f.client_id = c.id
        LEFT JOIN commandes cmd ON f.commande_id = cmd.id
        ORDER BY f.date_emission DESC
      `;
    }

    // Mettre à jour les factures en retard
    await sql`
      UPDATE factures 
      SET statut = 'en_retard'
      WHERE statut = 'emise' 
        AND date_echeance < NOW()
    `;

    return NextResponse.json(factures);
  } catch (error) {
    console.error('Erreur factures GET:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des factures' },
      { status: 500 }
    );
  }
}
