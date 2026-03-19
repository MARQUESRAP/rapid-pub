import { NextResponse } from 'next/server';

const SYSTEM_PROMPT = `Tu es un assistant spécialisé dans l'analyse de demandes de devis pour une imprimerie.

Ton rôle est d'extraire et structurer les informations d'une demande client brute (email, message, etc.) pour pré-remplir un formulaire de devis.

Tu dois extraire les informations suivantes si elles sont présentes:

1. INFORMATIONS CLIENT:
- nom: Le nom de la personne
- entreprise: Le nom de l'entreprise/société
- email: L'adresse email
- telephone: Le numéro de téléphone

2. INFORMATIONS PRODUIT:
- type: Le type de produit (flyers, cartes_visite, affiches, depliants, kakemono, stickers, brochures, autres)
- quantite: Le nombre d'exemplaires demandés
- format: Le format (A6, A5, A4, A3, A2, 85x55mm, personnalise)
- papier: Le grammage du papier (90g, 135g, 170g, 250g, 350g, 400g)
- recto_verso: true si impression recto-verso mentionnée
- finitions: Liste des finitions (pelliculage mat, pelliculage brillant, vernis sélectif, dorure, etc.)

3. AUTRES INFOS:
- delai: La date ou le délai de livraison souhaité
- notes: Toute autre information pertinente

4. CONFIANCE:
- Un score de confiance entre 0 et 1 indiquant la qualité de l'extraction

IMPORTANT: 
- Ne JAMAIS inventer d'informations non présentes dans le texte
- Si une information n'est pas mentionnée, laisser le champ vide ou null
- Le score de confiance doit refléter la clarté de la demande

Réponds UNIQUEMENT avec un objet JSON valide, sans markdown ni explication.`;

export async function POST(request: Request) {
  try {
    const { demande } = await request.json();

    if (!demande) {
      return NextResponse.json(
        { error: 'La demande est requise' },
        { status: 400 }
      );
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    
    if (!apiKey || apiKey === 'sk-ant-xxxxx') {
      // Mode démo sans clé API - analyse basique
      return NextResponse.json(analyzeWithoutAI(demande));
    }

    // Appel à l'API Claude
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: `Analyse cette demande de devis:\n\n${demande}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      console.error('Erreur API Claude:', await response.text());
      // Fallback sur l'analyse basique
      return NextResponse.json(analyzeWithoutAI(demande));
    }

    const data = await response.json();
    const content = data.content[0]?.text;

    try {
      const result = JSON.parse(content);
      return NextResponse.json(result);
    } catch {
      // Si le JSON est invalide, utiliser l'analyse basique
      return NextResponse.json(analyzeWithoutAI(demande));
    }
  } catch (error) {
    console.error('Erreur analyse IA:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'analyse' },
      { status: 500 }
    );
  }
}

// Analyse basique sans IA (fallback)
function analyzeWithoutAI(demande: string) {
  const text = demande.toLowerCase();
  
  // Détection du type de produit
  let type = 'autres';
  if (text.includes('flyer') || text.includes('tract')) type = 'flyers';
  else if (text.includes('carte de visite') || text.includes('cartes de visite')) type = 'cartes_visite';
  else if (text.includes('affiche')) type = 'affiches';
  else if (text.includes('dépliant') || text.includes('depliant')) type = 'depliants';
  else if (text.includes('kakémono') || text.includes('kakemono') || text.includes('roll-up') || text.includes('rollup')) type = 'kakemono';
  else if (text.includes('sticker') || text.includes('autocollant')) type = 'stickers';
  else if (text.includes('brochure')) type = 'brochures';

  // Détection de la quantité
  const quantiteMatch = text.match(/(\d+)\s*(ex|exemplaire|pièce|unité|flyer|carte|affiche|sticker)/i);
  const quantite = quantiteMatch ? parseInt(quantiteMatch[1]) : null;

  // Détection du format
  let format = '';
  if (text.includes('a6')) format = 'A6';
  else if (text.includes('a5')) format = 'A5';
  else if (text.includes('a4')) format = 'A4';
  else if (text.includes('a3')) format = 'A3';
  else if (text.includes('a2')) format = 'A2';
  else if (text.includes('85x55') || text.includes('85 x 55')) format = '85x55mm';

  // Détection du papier
  let papier = '';
  if (text.includes('350g') || text.includes('350 g')) papier = '350g';
  else if (text.includes('250g') || text.includes('250 g')) papier = '250g';
  else if (text.includes('170g') || text.includes('170 g')) papier = '170g';
  else if (text.includes('135g') || text.includes('135 g')) papier = '135g';
  else if (text.includes('90g') || text.includes('90 g')) papier = '90g';

  // Détection recto-verso
  const recto_verso = text.includes('recto-verso') || text.includes('recto verso') || text.includes('r/v');

  // Détection des finitions
  const finitions: string[] = [];
  if (text.includes('pelliculage mat') || text.includes('mat')) finitions.push('pelliculage mat');
  if (text.includes('pelliculage brillant') || text.includes('brillant')) finitions.push('pelliculage brillant');
  if (text.includes('vernis sélectif') || text.includes('vernis selectif')) finitions.push('vernis sélectif');
  if (text.includes('dorure')) finitions.push('dorure');

  // Extraction email
  const emailMatch = demande.match(/[\w.-]+@[\w.-]+\.\w+/);
  const email = emailMatch ? emailMatch[0] : '';

  // Extraction téléphone
  const telMatch = demande.match(/(?:0|\+33)[1-9](?:[\s.-]?\d{2}){4}/);
  const telephone = telMatch ? telMatch[0] : '';

  return {
    client: {
      nom: '',
      entreprise: '',
      email,
      telephone,
    },
    produit: {
      type,
      quantite,
      format,
      papier,
      recto_verso,
      finitions,
    },
    delai: '',
    notes: '',
    confiance: 0.6,
  };
}
