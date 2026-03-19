import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';

// POST - Envoyer un email (devis ou relance)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, devisId, destinataire, sujet, message } = body;

    if (!destinataire || !sujet) {
      return NextResponse.json(
        { error: 'Destinataire et sujet requis' },
        { status: 400 }
      );
    }

    // Récupérer les paramètres email
    const parametres = await sql`SELECT cle, valeur FROM parametres WHERE cle LIKE 'email_%' OR cle LIKE 'entreprise_%'`;
    const config: Record<string, string> = {};
    for (const p of parametres) {
      config[p.cle as string] = p.valeur as string;
    }

    // En production, ici on utiliserait nodemailer ou un service comme Resend/SendGrid
    // Pour la démo, on simule l'envoi
    console.log('📧 Email simulé:', {
      from: config.email_expediteur || 'devis@rapid-pub.fr',
      to: destinataire,
      subject: sujet,
      body: message,
    });

    // Si c'est une relance, mettre à jour le compteur
    if (type === 'relance' && devisId) {
      await sql`
        UPDATE devis 
        SET relance_count = relance_count + 1,
            relance_derniere = NOW(),
            updated_at = NOW()
        WHERE id = ${devisId}
      `;
    }

    // Simuler un délai réseau
    await new Promise(resolve => setTimeout(resolve, 500));

    return NextResponse.json({ 
      success: true, 
      message: 'Email envoyé avec succès',
      // En prod, retourner l'ID de l'email envoyé
    });
  } catch (error) {
    console.error('Erreur envoi email:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'envoi de l\'email' },
      { status: 500 }
    );
  }
}
