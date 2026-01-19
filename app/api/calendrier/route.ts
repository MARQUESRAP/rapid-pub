import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('start') || new Date().toISOString().split('T')[0];
    const endDate = searchParams.get('end') || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Récupérer les commandes avec dates de livraison prévues
    const commandes = await sql`
      SELECT 
        cmd.id,
        cmd.numero,
        cmd.titre,
        cmd.statut,
        cmd.date_livraison_prevue,
        cmd.prix_total,
        c.nom as client_nom
      FROM commandes cmd
      LEFT JOIN clients c ON cmd.client_id = c.id
      WHERE cmd.date_livraison_prevue BETWEEN ${startDate} AND ${endDate}
        AND cmd.statut NOT IN ('livre', 'annule')
      ORDER BY cmd.date_livraison_prevue ASC
    `;

    // Grouper par date
    const parJour: Record<string, typeof commandes> = {};
    
    for (const cmd of commandes) {
      const jour = new Date(cmd.date_livraison_prevue as string).toISOString().split('T')[0];
      if (!parJour[jour]) {
        parJour[jour] = [];
      }
      parJour[jour].push(cmd);
    }

    return NextResponse.json({
      commandes,
      parJour,
    });
  } catch (error) {
    console.error('Erreur calendrier GET:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du calendrier' },
      { status: 500 }
    );
  }
}
