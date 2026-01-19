import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';

export interface SearchResult {
  id: string;
  type: 'client' | 'devis' | 'commande' | 'facture';
  titre: string;
  sousTitre: string;
  lien: string;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');

    if (!q || q.length < 2) {
      return NextResponse.json([]);
    }

    const searchTerm = `%${q}%`;
    const results: SearchResult[] = [];

    // Recherche dans les clients
    const clients = await sql`
      SELECT id, nom, entreprise, email
      FROM clients
      WHERE nom ILIKE ${searchTerm}
        OR entreprise ILIKE ${searchTerm}
        OR email ILIKE ${searchTerm}
      LIMIT 5
    `;

    for (const client of clients) {
      results.push({
        id: client.id as string,
        type: 'client',
        titre: client.nom as string,
        sousTitre: (client.entreprise || client.email || '') as string,
        lien: `/clients`,
      });
    }

    // Recherche dans les devis
    const devis = await sql`
      SELECT d.id, d.numero, d.titre, c.nom as client_nom
      FROM devis d
      LEFT JOIN clients c ON d.client_id = c.id
      WHERE d.numero ILIKE ${searchTerm}
        OR d.titre ILIKE ${searchTerm}
        OR c.nom ILIKE ${searchTerm}
      LIMIT 5
    `;

    for (const d of devis) {
      results.push({
        id: d.id as string,
        type: 'devis',
        titre: d.numero as string,
        sousTitre: `${d.client_nom || 'Client'} - ${d.titre || 'Sans titre'}`,
        lien: `/devis/${d.id}`,
      });
    }

    // Recherche dans les commandes
    const commandes = await sql`
      SELECT cmd.id, cmd.numero, cmd.titre, c.nom as client_nom
      FROM commandes cmd
      LEFT JOIN clients c ON cmd.client_id = c.id
      WHERE cmd.numero ILIKE ${searchTerm}
        OR cmd.titre ILIKE ${searchTerm}
        OR c.nom ILIKE ${searchTerm}
      LIMIT 5
    `;

    for (const cmd of commandes) {
      results.push({
        id: cmd.id as string,
        type: 'commande',
        titre: cmd.numero as string,
        sousTitre: `${cmd.client_nom || 'Client'} - ${cmd.titre || 'Sans titre'}`,
        lien: `/commandes`,
      });
    }

    // Recherche dans les factures
    const factures = await sql`
      SELECT f.id, f.numero, f.montant_ttc, c.nom as client_nom
      FROM factures f
      LEFT JOIN clients c ON f.client_id = c.id
      WHERE f.numero ILIKE ${searchTerm}
        OR c.nom ILIKE ${searchTerm}
      LIMIT 5
    `;

    for (const f of factures) {
      results.push({
        id: f.id as string,
        type: 'facture',
        titre: f.numero as string,
        sousTitre: `${f.client_nom || 'Client'} - ${f.montant_ttc}€`,
        lien: `/factures`,
      });
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error('Erreur recherche:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la recherche' },
      { status: 500 }
    );
  }
}
