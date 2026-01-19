import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';

interface RouteParams {
  params: Promise<{ type: string; id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { type, id } = await params;

    // Récupérer les paramètres entreprise
    const parametres = await sql`SELECT cle, valeur FROM parametres`;
    const config: Record<string, string> = {};
    for (const p of parametres) {
      config[p.cle as string] = p.valeur as string;
    }

    let data: Record<string, unknown> = {};

    if (type === 'devis') {
      const result = await sql`
        SELECT 
          d.*,
          c.nom as client_nom,
          c.email as client_email,
          c.telephone as client_telephone,
          c.adresse as client_adresse,
          c.entreprise as client_entreprise
        FROM devis d
        LEFT JOIN clients c ON d.client_id = c.id
        WHERE d.id = ${id}
      `;

      if (result.length === 0) {
        return NextResponse.json({ error: 'Devis non trouvé' }, { status: 404 });
      }

      data = result[0];
    } else if (type === 'facture') {
      const result = await sql`
        SELECT 
          f.*,
          c.nom as client_nom,
          c.email as client_email,
          c.telephone as client_telephone,
          c.adresse as client_adresse,
          c.entreprise as client_entreprise,
          cmd.titre as commande_titre,
          cmd.numero as commande_numero
        FROM factures f
        LEFT JOIN clients c ON f.client_id = c.id
        LEFT JOIN commandes cmd ON f.commande_id = cmd.id
        WHERE f.id = ${id}
      `;

      if (result.length === 0) {
        return NextResponse.json({ error: 'Facture non trouvée' }, { status: 404 });
      }

      data = result[0];
    } else {
      return NextResponse.json({ error: 'Type invalide' }, { status: 400 });
    }

    // Générer le HTML du PDF
    const html = generatePDFHtml(type, data, config);

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('Erreur génération PDF:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la génération du PDF' },
      { status: 500 }
    );
  }
}

function generatePDFHtml(
  type: string, 
  data: Record<string, unknown>, 
  config: Record<string, string>
): string {
  const isDevis = type === 'devis';
  const titre = isDevis ? 'DEVIS' : 'FACTURE';
  const numero = data.numero as string;
  
  const formatDate = (date: string | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('fr-FR');
  };

  const formatPrice = (price: number | null) => {
    if (!price) return '0,00 €';
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(price);
  };

  const prixHT = isDevis ? (data.prix_total as number) || 0 : (data.montant_ht as number) || 0;
  const tva = prixHT * (parseFloat(config.tva_taux || '20') / 100);
  const prixTTC = prixHT + tva;

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>${titre} ${numero}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Helvetica Neue', Arial, sans-serif; 
      font-size: 12px; 
      line-height: 1.5;
      color: #333;
      padding: 40px;
    }
    .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
    .logo { 
      font-size: 28px; 
      font-weight: bold; 
      color: #FF8C00;
    }
    .logo span { color: #333; }
    .company-info { text-align: right; font-size: 11px; color: #666; }
    .document-title {
      font-size: 24px;
      font-weight: bold;
      color: #FF8C00;
      margin-bottom: 5px;
    }
    .document-number { font-size: 14px; color: #666; margin-bottom: 30px; }
    .info-section { display: flex; justify-content: space-between; margin-bottom: 40px; }
    .info-box { 
      width: 45%; 
      padding: 20px;
      background: #f8f9fa;
      border-radius: 8px;
    }
    .info-box h3 { 
      font-size: 12px; 
      text-transform: uppercase; 
      color: #666; 
      margin-bottom: 10px;
      letter-spacing: 1px;
    }
    .info-box p { margin-bottom: 3px; }
    .info-box .name { font-weight: bold; font-size: 14px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
    th { 
      background: #FF8C00; 
      color: white; 
      padding: 12px; 
      text-align: left;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    th:last-child { text-align: right; }
    td { 
      padding: 12px; 
      border-bottom: 1px solid #eee; 
    }
    td:last-child { text-align: right; }
    .totals { 
      width: 300px; 
      margin-left: auto; 
      margin-bottom: 40px;
    }
    .totals-row { 
      display: flex; 
      justify-content: space-between; 
      padding: 8px 0;
      border-bottom: 1px solid #eee;
    }
    .totals-row.total { 
      font-weight: bold; 
      font-size: 16px;
      border-bottom: 2px solid #FF8C00;
      color: #FF8C00;
    }
    .conditions {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      font-size: 10px;
      color: #666;
    }
    .conditions h4 { margin-bottom: 10px; color: #333; }
    .footer {
      margin-top: 40px;
      text-align: center;
      font-size: 10px;
      color: #999;
      border-top: 1px solid #eee;
      padding-top: 20px;
    }
    @media print {
      body { padding: 20px; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="logo">Rapid<span>-Pub</span></div>
      <p style="color: #666; font-size: 11px;">Imprimerie professionnelle</p>
    </div>
    <div class="company-info">
      <p><strong>${config.entreprise_nom || 'Rapid-Pub'}</strong></p>
      <p>${config.entreprise_adresse || ''}</p>
      <p>Tél: ${config.entreprise_telephone || ''}</p>
      <p>${config.entreprise_email || ''}</p>
      <p style="margin-top: 5px;">SIRET: ${config.entreprise_siret || ''}</p>
      <p>TVA: ${config.entreprise_tva_intra || ''}</p>
    </div>
  </div>

  <div class="document-title">${titre}</div>
  <div class="document-number">N° ${numero}</div>

  <div class="info-section">
    <div class="info-box">
      <h3>Client</h3>
      <p class="name">${data.client_nom || 'Client'}</p>
      ${data.client_entreprise ? `<p>${data.client_entreprise}</p>` : ''}
      ${data.client_adresse ? `<p>${data.client_adresse}</p>` : ''}
      ${data.client_email ? `<p>${data.client_email}</p>` : ''}
      ${data.client_telephone ? `<p>${data.client_telephone}</p>` : ''}
    </div>
    <div class="info-box">
      <h3>Informations</h3>
      <p><strong>Date d'émission:</strong> ${formatDate(isDevis ? data.date_envoi as string : data.date_emission as string)}</p>
      ${isDevis ? `<p><strong>Validité:</strong> ${formatDate(data.date_validite as string)}</p>` : ''}
      ${!isDevis ? `<p><strong>Échéance:</strong> ${formatDate(data.date_echeance as string)}</p>` : ''}
      <p><strong>Délai de paiement:</strong> ${config.delai_paiement || '30'} jours</p>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width: 60%;">Désignation</th>
        <th style="width: 15%;">Qté</th>
        <th style="width: 25%;">Prix HT</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>
          <strong>${data.titre || (isDevis ? 'Prestation' : data.commande_titre) || 'Prestation'}</strong>
          ${data.description ? `<br><span style="color: #666; font-size: 11px;">${data.description}</span>` : ''}
          ${data.produit_type ? `<br><span style="color: #666; font-size: 11px;">Type: ${data.produit_type}</span>` : ''}
          ${data.format ? `<br><span style="color: #666; font-size: 11px;">Format: ${data.format}</span>` : ''}
          ${data.papier ? `<br><span style="color: #666; font-size: 11px;">Papier: ${data.papier}</span>` : ''}
          ${data.recto_verso ? `<br><span style="color: #666; font-size: 11px;">Recto-verso</span>` : ''}
          ${data.finition ? `<br><span style="color: #666; font-size: 11px;">Finition: ${data.finition}</span>` : ''}
        </td>
        <td>${data.quantite || 1}</td>
        <td>${formatPrice(prixHT)}</td>
      </tr>
    </tbody>
  </table>

  <div class="totals">
    <div class="totals-row">
      <span>Total HT</span>
      <span>${formatPrice(prixHT)}</span>
    </div>
    <div class="totals-row">
      <span>TVA (${config.tva_taux || '20'}%)</span>
      <span>${formatPrice(tva)}</span>
    </div>
    <div class="totals-row total">
      <span>Total TTC</span>
      <span>${formatPrice(prixTTC)}</span>
    </div>
  </div>

  <div class="conditions">
    <h4>${isDevis ? 'Conditions' : 'Modalités de paiement'}</h4>
    ${isDevis ? `
      <p>• Ce devis est valable 30 jours à compter de sa date d'émission.</p>
      <p>• Un acompte de 30% sera demandé à la commande.</p>
      <p>• Le solde est payable à réception de la facture.</p>
    ` : `
      <p>• Paiement à ${config.delai_paiement || '30'} jours.</p>
      <p>• En cas de retard de paiement, une pénalité de 3 fois le taux d'intérêt légal sera appliquée.</p>
      <p>• Indemnité forfaitaire pour frais de recouvrement: 40€.</p>
    `}
    ${config.iban ? `<p style="margin-top: 10px;"><strong>IBAN:</strong> ${config.iban}</p>` : ''}
  </div>

  <div class="footer">
    <p>${config.entreprise_nom || 'Rapid-Pub'} - ${config.entreprise_adresse || ''}</p>
    <p>SIRET: ${config.entreprise_siret || ''} - TVA: ${config.entreprise_tva_intra || ''}</p>
  </div>

  <div class="no-print" style="margin-top: 30px; text-align: center;">
    <button onclick="window.print()" style="
      background: #FF8C00;
      color: white;
      border: none;
      padding: 12px 24px;
      font-size: 14px;
      border-radius: 8px;
      cursor: pointer;
    ">
      🖨️ Imprimer / Enregistrer en PDF
    </button>
  </div>
</body>
</html>
  `;
}
