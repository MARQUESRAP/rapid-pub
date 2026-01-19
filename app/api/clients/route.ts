import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';

// GET - Liste des clients avec stats
export async function GET() {
  try {
    const clients = await sql`
      SELECT 
        c.*,
        COALESCE(stats.nb_commandes, 0)::integer as nb_commandes,
        COALESCE(stats.ca_total, 0)::numeric as ca_total,
        stats.derniere_commande
      FROM clients c
      LEFT JOIN (
        SELECT 
          client_id,
          COUNT(*)::integer as nb_commandes,
          SUM(prix_total) as ca_total,
          MAX(created_at) as derniere_commande
        FROM commandes
        WHERE statut != 'annule'
        GROUP BY client_id
      ) stats ON c.id = stats.client_id
      ORDER BY c.created_at DESC
    `;

    return NextResponse.json(clients);
  } catch (error) {
    console.error('Erreur clients GET:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des clients' },
      { status: 500 }
    );
  }
}

// POST - Création d'un client
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nom, email, telephone, adresse, entreprise, notes } = body;

    if (!nom) {
      return NextResponse.json(
        { error: 'Le nom est obligatoire' },
        { status: 400 }
      );
    }

    const result = await sql`
      INSERT INTO clients (nom, email, telephone, adresse, entreprise, notes)
      VALUES (${nom}, ${email || null}, ${telephone || null}, ${adresse || null}, ${entreprise || null}, ${notes || null})
      RETURNING *
    `;

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('Erreur clients POST:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création du client' },
      { status: 500 }
    );
  }
}
