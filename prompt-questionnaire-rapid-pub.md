# Prompt Claude Code — Questionnaire de sélection produits Rapid-Pub

## Contexte

Mon client Rapid-Pub (entreprise d'impression/goodies) veut mettre en avant certains produits de son catalogue sur LinkedIn. J'ai besoin d'un questionnaire web pour qu'il sélectionne les produits qu'il souhaite mettre en avant parmi son catalogue de ~1 350 produits.

Le client remplit le questionnaire une seule fois. À la soumission, les produits sélectionnés sont envoyés dans un Google Sheet via Google Apps Script.

## Fichiers fournis

- `products_grouped.json` : JSON contenant tous les produits déjà groupés (les doublons couleur sont fusionnés). Chaque produit a cette structure :
```json
{
  "ref": "260567",
  "name": "Stilolinea S45 Solid stylo",
  "category": "Ecriture",
  "price": 0.22,
  "colors": ["blanc/noir", "blanc/vert", "blanc/orange", "blanc/bleu clair", "blanc/rouge", "blanc", "blanc/pourpre", "blanc/bleu foncé"],
  "colorCount": 8
}
```

## Ce que tu dois créer

**Un seul fichier HTML** (`questionnaire-rapid-pub.html`) contenant tout le HTML, CSS et JavaScript inline. Le fichier doit embarquer directement les données produits en JSON dans une variable JavaScript.

## Spécifications UI/UX

### Structure de page

1. **Header** : Titre "Sélection des produits à mettre en avant" + sous-titre explicatif court ("Cochez les produits que vous souhaitez mettre en avant sur LinkedIn")
2. **Barre de recherche** : input de recherche en temps réel, toujours visible en haut (sticky), qui filtre les produits par nom à travers toutes les catégories. Quand une recherche est active, les catégories qui n'ont aucun résultat sont masquées, et les catégories avec des résultats s'ouvrent automatiquement.
3. **Compteur** : afficher en sticky à côté de la recherche le nombre de produits sélectionnés (ex: "42 produits sélectionnés")
4. **Accordéon par catégorie** : 8 catégories (Accessoires, Boissons, Bureau, Ecriture, Maison, Plein air, Sacs, Technologie). Chaque catégorie est un bloc dépliant (fermé par défaut).
5. **Bouton de validation** : en bas de page, bouton "Valider ma sélection" qui envoie les données.
6. **Message de succès** : après soumission réussie, remplacer tout le contenu par un message de succès clean.

### Pour chaque catégorie (bloc accordéon)

- **Header de catégorie** : nom de la catégorie + nombre de produits dans la catégorie + checkbox "Tout sélectionner" pour cocher/décocher tous les produits de la catégorie d'un coup.
- **Indicateur** : afficher combien de produits sont sélectionnés dans cette catégorie (ex: "12/184 sélectionnés").
- **Chevron** : icône pour indiquer ouvert/fermé.

### Pour chaque produit (ligne dans l'accordéon)

Afficher sur une seule ligne :
- **Checkbox** à gauche
- **Nom du produit**
- **Prix** (formaté en euros, ex: "0,22 €")
- **Nombre de couleurs** disponibles (ex: "8 couleurs")

Les lignes doivent être bien lisibles, avec un hover léger et un espacement aéré. Alterner un fond légèrement grisé une ligne sur deux pour la lisibilité.

### Responsive

Le questionnaire doit être utilisable sur desktop et mobile (le client pourrait le remplir sur son téléphone).

### Design

Style clean et moderne :
- Police : Inter ou system-ui
- Couleurs : fond blanc, texte gris foncé (#1a1a1a), accents bleu (#2563eb), hover léger
- Border-radius arrondis, ombres subtiles sur les blocs catégorie
- Transitions fluides pour l'ouverture/fermeture des accordéons

## Logique de soumission (Google Apps Script)

### Côté HTML (fetch)

À la soumission, envoyer un POST au Google Apps Script avec les données suivantes pour chaque produit sélectionné :

```json
{
  "products": [
    {
      "ref": "260567",
      "name": "Stilolinea S45 Solid stylo",
      "category": "Ecriture",
      "price": 0.22,
      "colors": "blanc/noir, blanc/vert, blanc/orange, blanc/bleu clair, blanc/rouge, blanc, blanc/pourpre, blanc/bleu foncé"
    }
  ]
}
```

Note : les couleurs sont envoyées en tant que chaîne (join par ", "), pas en array.

L'URL du Google Apps Script sera une constante en haut du JS : `const APPS_SCRIPT_URL = "REMPLACER_PAR_URL";`

Le fetch doit être en mode `no-cors` car Google Apps Script ne gère pas bien les CORS. Utiliser la technique classique :

```javascript
fetch(APPS_SCRIPT_URL, {
  method: 'POST',
  mode: 'no-cors',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload)
});
```

Après l'envoi, afficher directement le message de succès (on ne peut pas lire la réponse en mode no-cors).

### Côté Google Apps Script (à fournir séparément)

Créer aussi un fichier `google-apps-script.js` avec le code Google Apps Script à déployer. Ce script doit :

1. Recevoir le POST via `doPost(e)`
2. Parser le JSON
3. Écrire chaque produit dans le Google Sheet actif, avec les colonnes : Ref | Nom | Catégorie | Prix | Couleurs
4. Ajouter une ligne d'en-tête si le sheet est vide
5. Retourner un JSON de succès

```javascript
function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = JSON.parse(e.postData.contents);
  
  // Header if empty
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Ref', 'Nom', 'Catégorie', 'Prix', 'Couleurs']);
  }
  
  data.products.forEach(product => {
    sheet.appendRow([
      product.ref,
      product.name,
      product.category,
      product.price,
      product.colors
    ]);
  });
  
  return ContentService.createTextOutput(
    JSON.stringify({ status: 'success', count: data.products.length })
  ).setMimeType(ContentService.MimeType.JSON);
}
```

## Contraintes techniques

- **Tout dans un seul fichier HTML** (pas de fichiers externes, pas de CDN sauf les fonts Google si besoin)
- **Pas de framework JS** (vanilla JS uniquement)
- **Les données produits sont embarquées** directement dans le HTML dans une balise `<script>` sous forme de `const PRODUCTS = [...]`
- **Performance** : le DOM doit être performant avec 1 350 produits. Pas besoin de virtualisation, mais éviter de tout re-render à chaque frappe dans la recherche (utiliser un debounce de 200ms sur la recherche).
- **Accessibilité** : les checkboxes doivent être cliquables via le label complet (toute la ligne du produit)

## Structure attendue des fichiers en sortie

```
questionnaire-rapid-pub.html    # Le questionnaire complet (HTML + CSS + JS + données)
google-apps-script.js            # Le code Google Apps Script à déployer
```

## Données

Lis le fichier `products_grouped.json` fourni et embarque son contenu directement dans le HTML en tant que variable JavaScript `const PRODUCTS = [...]`.
