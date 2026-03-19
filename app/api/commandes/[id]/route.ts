import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET - Récupérer une commande par ID
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    const result = await sql`
      SELECT 
        cmd.*,
        c.nom as client_nom,
        c.email as client_email,
        c.telephone as client_telephone,
        c.entreprise as client_entreprise
      FROM commandes cmd
      LEFT JOIN clients c ON cmd.client_id = c.id
      WHERE cmd.id = ${id}
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Commande non trouvée' },
        { status: 404 }
      );
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Erreur commande GET by ID:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de la commande' },
      { status: 500 }
    );
  }
}

// PATCH - Mettre à jour une commande (statut principalement)
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { statut, notes_production } = body;

    if (statut) {
      // Si on passe à "livré", on met à jour la date de livraison réelle
      if (statut === 'livre') {
        await sql`
          UPDATE commandes 
          SET statut = ${statut}, 
              date_livraison_reelle = NOW(),
              updated_at = NOW()
          WHERE id = ${id}
        `;

        // Créer automatiquement une facture
        const cmdResult = await sql`SELECT * FROM commandes WHERE id = ${id}`;
        const commande = cmdResult[0];

        if (commande) {
          // Générer numéro de facture
          const year = new Date().getFullYear();
          const countResult = await sql`
            SELECT COUNT(*)::integer as count FROM factures WHERE numero LIKE ${`FAC-${year}-%`}
          `;
          const count = (countResult[0]?.count || 0) + 1;
          const numero = `FAC-${year}-${count.toString().padStart(3, '0')}`;

          // Calculer TVA (20%)
          const montant_ht = commande.prix_total || 0;
          const tva = montant_ht * 0.2;
          const montant_ttc = montant_ht + tva;

          // Créer la facture
          await sql`
            INSERT INTO factures (numero, commande_id, client_id, montant_ht, tva, montant_ttc, statut, date_emission, date_echeance)
            VALUES (
              ${numero},
              ${id},
              ${commande.client_id},
              ${montant_ht},
              ${tva},
              ${montant_ttc},
              'emise',
              NOW(),
              NOW() + INTERVAL '30 days'
            )
          `;
        }
      } else {
        await sql`
          UPDATE commandes 
          SET statut = ${statut}, 
              updated_at = NOW()
          WHERE id = ${id}
        `;
      }
    }

    if (notes_production !== undefined) {
      await sql`
        UPDATE commandes 
        SET notes_production = ${notes_production}, 
            updated_at = NOW()
        WHERE id = ${id}
      `;
    }

    // Récupérer la commande mise à jour
    const result = await sql`SELECT * FROM commandes WHERE id = ${id}`;

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Erreur commande PATCH:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de la commande' },
      { status: 500 }
    );
  }
}
