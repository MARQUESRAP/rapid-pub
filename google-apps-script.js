/**
 * Google Apps Script - Réception des produits sélectionnés
 *
 * Instructions de déploiement :
 * 1. Ouvrir Google Sheets
 * 2. Extensions > Apps Script
 * 3. Coller ce code
 * 4. Déployer > Nouveau déploiement
 * 5. Type : Application Web
 * 6. Exécuter en tant que : Moi
 * 7. Accès : Tout le monde
 * 8. Copier l'URL et la mettre dans APPS_SCRIPT_URL du fichier HTML
 */

function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const data = JSON.parse(e.postData.contents);

    // Ajouter l'en-tête si le sheet est vide
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Ref', 'Nom', 'Catégorie', 'Prix', 'Couleurs', 'Date de soumission']);

      // Formater l'en-tête
      const headerRange = sheet.getRange(1, 1, 1, 6);
      headerRange.setFontWeight('bold');
      headerRange.setBackground('#f3f4f6');
    }

    const timestamp = new Date().toLocaleString('fr-FR');

    // Ajouter chaque produit
    data.products.forEach(product => {
      sheet.appendRow([
        product.ref,
        product.name,
        product.category,
        product.price,
        product.colors,
        timestamp
      ]);
    });

    // Ajuster la largeur des colonnes
    sheet.autoResizeColumns(1, 6);

    return ContentService.createTextOutput(
      JSON.stringify({
        status: 'success',
        count: data.products.length,
        message: `${data.products.length} produits ajoutés avec succès`
      })
    ).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({
        status: 'error',
        message: error.toString()
      })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

// Fonction de test pour vérifier que le script fonctionne
function testDoPost() {
  const testData = {
    postData: {
      contents: JSON.stringify({
        products: [
          {
            ref: "TEST001",
            name: "Produit de test",
            category: "Test",
            price: 9.99,
            colors: "rouge, bleu, vert"
          }
        ]
      })
    }
  };

  const result = doPost(testData);
  Logger.log(result.getContent());
}
