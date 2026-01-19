import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';

// GET - Récupérer tous les paramètres
export async function GET() {
  try {
    const parametres = await sql`SELECT * FROM parametres ORDER BY cle`;
    
    // Convertir en objet clé-valeur
    const config: Record<string, string> = {};
    for (const p of parametres) {
      config[p.cle as string] = p.valeur as string;
    }
    
    return NextResponse.json(config);
  } catch (error) {
    console.error('Erreur paramètres GET:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des paramètres' },
      { status: 500 }
    );
  }
}

// POST - Mettre à jour un ou plusieurs paramètres
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    for (const [cle, valeur] of Object.entries(body)) {
      await sql`
        INSERT INTO parametres (cle, valeur)
        VALUES (${cle}, ${valeur as string})
        ON CONFLICT (cle) 
        DO UPDATE SET valeur = ${valeur as string}, updated_at = NOW()
      `;
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur paramètres POST:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour des paramètres' },
      { status: 500 }
    );
  }
}
