import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET - Récupérer un devis par ID
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    const result = await sql`
      SELECT 
        d.*,
        c.nom as client_nom,
        c.email as client_email,
        c.telephone as client_telephone,
        c.entreprise as client_entreprise
      FROM devis d
      LEFT JOIN clients c ON d.client_id = c.id
      WHERE d.id = ${id}
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Devis non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Erreur devis GET by ID:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du devis' },
      { status: 500 }
    );
  }
}

// PATCH - Mettre à jour un devis
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { 
      statut, 
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
    } = body;

    // Si changement de statut
    if (statut) {
      // Relance
      if (statut === 'relance') {
        await sql`
          UPDATE devis 
          SET relance_count = relance_count + 1,
              relance_derniere = NOW(),
              updated_at = NOW()
          WHERE id = ${id}
        `;
      }
      // Si on passe à "envoyé", on met à jour la date d'envoi
      else if (statut === 'envoye') {
        await sql`
          UPDATE devis 
          SET statut = ${statut}, 
              date_envoi = NOW(),
              date_validite = NOW() + INTERVAL '30 days',
              updated_at = NOW()
          WHERE id = ${id}
        `;
      }
      // Si on passe à "accepté", on crée une commande
      else if (statut === 'accepte') {
        // Récupérer le devis
        const devisResult = await sql`SELECT * FROM devis WHERE id = ${id}`;
        const devis = devisResult[0];

        if (devis) {
          // Générer numéro de commande
          const year = new Date().getFullYear();
          const countResult = await sql`
            SELECT COUNT(*)::integer as count FROM commandes WHERE numero LIKE ${`CMD-${year}-%`}
          `;
          const count = (countResult[0]?.count || 0) + 1;
          const numero = `CMD-${year}-${count.toString().padStart(3, '0')}`;

          // Créer la commande
          await sql`
            INSERT INTO commandes (numero, devis_id, client_id, titre, description, prix_total, statut, date_livraison_prevue)
            VALUES (
              ${numero},
              ${id},
              ${devis.client_id},
              ${devis.titre},
              ${devis.description},
              ${devis.prix_total},
              'nouvelle',
              NOW() + INTERVAL '7 days'
            )
          `;
        }

        // Mettre à jour le statut du devis
        await sql`
          UPDATE devis 
          SET statut = ${statut}, 
              date_reponse = NOW(),
              updated_at = NOW()
          WHERE id = ${id}
        `;
      }
      // Autres statuts (refuse, etc.)
      else {
        await sql`
          UPDATE devis 
          SET statut = ${statut}, 
              date_reponse = CASE WHEN ${statut} = 'refuse' THEN NOW() ELSE date_reponse END,
              updated_at = NOW()
          WHERE id = ${id}
        `;
      }
    }

    // Mise à jour des autres champs si présents
    if (titre !== undefined || description !== undefined || produit_type !== undefined || 
        quantite !== undefined || format !== undefined || papier !== undefined ||
        finition !== undefined || recto_verso !== undefined || prix_unitaire !== undefined ||
        prix_total !== undefined) {
      
      await sql`
        UPDATE devis 
        SET 
          titre = COALESCE(${titre ?? null}, titre),
          description = COALESCE(${description ?? null}, description),
          produit_type = COALESCE(${produit_type ?? null}, produit_type),
          quantite = COALESCE(${quantite ?? null}, quantite),
          format = COALESCE(${format ?? null}, format),
          papier = COALESCE(${papier ?? null}, papier),
          finition = COALESCE(${finition ?? null}, finition),
          recto_verso = COALESCE(${recto_verso ?? null}, recto_verso),
          prix_unitaire = COALESCE(${prix_unitaire ?? null}, prix_unitaire),
          prix_total = COALESCE(${prix_total ?? null}, prix_total),
          updated_at = NOW()
        WHERE id = ${id}
      `;
    }

    // Récupérer le devis mis à jour
    const result = await sql`
      SELECT 
        d.*,
        c.nom as client_nom,
        c.email as client_email,
        c.telephone as client_telephone,
        c.entreprise as client_entreprise
      FROM devis d
      LEFT JOIN clients c ON d.client_id = c.id
      WHERE d.id = ${id}
    `;

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Erreur devis PATCH:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du devis' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un devis
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    await sql`DELETE FROM devis WHERE id = ${id}`;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur devis DELETE:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du devis' },
      { status: 500 }
    );
  }
}
