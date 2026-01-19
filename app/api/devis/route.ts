import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';

// GET - Liste des devis
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const statut = searchParams.get('statut');

    let devis;
    
    if (statut) {
      devis = await sql`
        SELECT 
          d.*,
          c.nom as client_nom,
          c.email as client_email,
          c.entreprise as client_entreprise,
          EXTRACT(DAY FROM NOW() - d.date_envoi)::integer as jours_depuis_envoi
        FROM devis d
        LEFT JOIN clients c ON d.client_id = c.id
        WHERE d.statut = ${statut}
        ORDER BY d.created_at DESC
      `;
    } else {
      devis = await sql`
        SELECT 
          d.*,
          c.nom as client_nom,
          c.email as client_email,
          c.entreprise as client_entreprise,
          EXTRACT(DAY FROM NOW() - d.date_envoi)::integer as jours_depuis_envoi
        FROM devis d
        LEFT JOIN clients c ON d.client_id = c.id
        ORDER BY d.created_at DESC
      `;
    }

    return NextResponse.json(devis);
  } catch (error) {
    console.error('Erreur devis GET:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des devis' },
      { status: 500 }
    );
  }
}

// POST - Création d'un devis
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      client_id,
      demande_brute,
      titre,
      description,
      produit_type,
      quantite,
      format,
      papier,
      finition,
      recto_verso,
      prix_unitaire,
      prix_total,
      statut = 'brouillon',
    } = body;

    // Générer le numéro de devis
    const year = new Date().getFullYear();
    const countResult = await sql`
      SELECT COUNT(*)::integer as count FROM devis WHERE numero LIKE ${`DEV-${year}-%`}
    `;
    const count = (countResult[0]?.count || 0) + 1;
    const numero = `DEV-${year}-${count.toString().padStart(3, '0')}`;

    const result = await sql`
      INSERT INTO devis (
        numero, client_id, demande_brute, titre, description,
        produit_type, quantite, format, papier, finition, recto_verso,
        prix_unitaire, prix_total, statut,
        date_envoi, date_validite
      )
      VALUES (
        ${numero},
        ${client_id || null},
        ${demande_brute || null},
        ${titre || null},
        ${description || null},
        ${produit_type || null},
        ${quantite || null},
        ${format || null},
        ${papier || null},
        ${finition || null},
        ${recto_verso || false},
        ${prix_unitaire || null},
        ${prix_total || null},
        ${statut},
        ${statut === 'envoye' ? new Date().toISOString() : null},
        ${statut === 'envoye' ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : null}
      )
      RETURNING *
    `;

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('Erreur devis POST:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création du devis' },
      { status: 500 }
    );
  }
}
