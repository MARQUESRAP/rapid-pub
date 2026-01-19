import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PATCH - Mettre à jour une facture (marquer comme payée)
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { statut } = body;

    if (statut === 'payee') {
      await sql`
        UPDATE factures 
        SET statut = 'payee', 
            date_paiement = NOW(),
            updated_at = NOW()
        WHERE id = ${id}
      `;
    } else if (statut) {
      await sql`
        UPDATE factures 
        SET statut = ${statut}, 
            updated_at = NOW()
        WHERE id = ${id}
      `;
    }

    const result = await sql`SELECT * FROM factures WHERE id = ${id}`;

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Erreur facture PATCH:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de la facture' },
      { status: 500 }
    );
  }
}
