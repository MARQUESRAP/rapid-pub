import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';

// GET - Liste des commandes
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const statut = searchParams.get('statut');

    let commandes;
    
    if (statut) {
      commandes = await sql`
        SELECT 
          cmd.*,
          c.nom as client_nom,
          c.email as client_email,
          c.telephone as client_telephone
        FROM commandes cmd
        LEFT JOIN clients c ON cmd.client_id = c.id
        WHERE cmd.statut = ${statut}
        ORDER BY cmd.date_livraison_prevue ASC
      `;
    } else {
      commandes = await sql`
        SELECT 
          cmd.*,
          c.nom as client_nom,
          c.email as client_email,
          c.telephone as client_telephone
        FROM commandes cmd
        LEFT JOIN clients c ON cmd.client_id = c.id
        ORDER BY 
          CASE cmd.statut 
            WHEN 'nouvelle' THEN 1 
            WHEN 'en_production' THEN 2 
            WHEN 'pret' THEN 3 
            ELSE 4 
          END,
          cmd.date_livraison_prevue ASC
      `;
    }

    return NextResponse.json(commandes);
  } catch (error) {
    console.error('Erreur commandes GET:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des commandes' },
      { status: 500 }
    );
  }
}
