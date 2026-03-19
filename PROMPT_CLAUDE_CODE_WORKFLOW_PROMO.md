# PROMPT CLAUDE CODE - Workflow LinkedIn Promo Produits Rapid Pub

## CONTEXTE DU PROJET

Tu travailles sur un projet d'automatisation LinkedIn pour **Rapid Pub**, une imprimerie en ligne B2B française spécialisée dans les goodies et supports de communication personnalisés.

### Architecture existante :
- **Frontend** : Next.js + React (dashboard de validation des posts)
- **Backend/BDD** : Supabase
- **Workflow automation** : n8n (self-hosted)
- **Génération d'images** : Fal.ai (Nano Banana Pro pour le workflow 1)
- **Stockage images** : Cloudinary
- **Publication** : LinkedIn API v2

### Ce qui existe déjà :
1. **Workflow 1** (fichier joint) : Génère des posts LinkedIn "valeur" (éducatif, actualité, décalé, mythbusters, chiffres choc, prédictions) - 100% génération IA
2. **Table Supabase `posts`** : Stocke les posts valeur avec statuts (A_Valider, Valide, Publie, Rejete)
3. **Dashboard React** : Interface pour valider/modifier/programmer les posts

---

## OBJECTIF : CRÉER LE WORKFLOW 2 - POSTS PROMO PRODUITS

Le client veut aussi faire des posts promotionnels pour mettre en avant des produits spécifiques (goodies : stylos, mugs, briquets, gobelets, etc.).

### Différence avec Workflow 1 :
- Workflow 1 = Contenu généré 100% par IA (pas de produit réel)
- Workflow 2 = Mise en valeur d'un VRAI produit avec son image transformée

---

## FLUX DU WORKFLOW PROMO

### Déclenchement
- Schedule Trigger : 1 fois par semaine (jour/heure à configurer)
- OU déclenchement manuel

### Étapes du workflow :

```
1. [Schedule Trigger] Déclenchement hebdomadaire
        ↓
2. [Supabase] Récupérer le premier produit avec statut "A_Poster"
        ↓
3. [HTTP Request] Télécharger l'image produit depuis URL
        ↓
4. [OpenAI GPT-4o] Analyser l'image pour identifier :
   - Type de produit (stylo, mug, briquet, gobelet...)
   - Couleur dominante
   - Caractéristiques visuelles
        ↓
5. [OpenAI GPT-4o] Générer le prompt de mise en situation :
   - Contexte adapté au produit (bureau pour stylo, cuisine pour mug...)
   - Ambiance professionnelle B2B
   - Éclairage, composition
        ↓
6. [Fal.ai Flux Kontext] Transformer l'image :
   - Input : Image produit fond blanc
   - Prompt : Mise en situation générée
   - Output : Produit IDENTIQUE dans un nouveau contexte
        ↓
7. [Cloudinary] Upload de l'image transformée
        ↓
8. [OpenAI GPT-4o] Générer le texte du post LinkedIn :
   - Hook accrocheur
   - Mise en avant du produit
   - Avantages pour le client B2B
   - CTA vers contact/devis
   - Hashtags pertinents
        ↓
9. [Supabase] Créer l'entrée dans table `posts_promo` (statut: A_Valider)
        ↓
10. [Supabase] Mettre à jour le produit source (statut: "En_Cours")
```

---

## STRUCTURE BASE DE DONNÉES

### Table source : `produits_promo` (à créer)

| Colonne | Type | Description |
|---------|------|-------------|
| id | uuid | PK auto-généré |
| reference | text | Référence produit (ex: GOB-2024-BL) |
| nom_produit | text | Nom lisible (ex: Gobelet isotherme 350ml) |
| categorie | text | Catégorie (Gobelets, Stylos, Mugs, Briquets, Textiles...) |
| url_image | text | URL de l'image catalogue (fond blanc) |
| couleurs_dispo | text | Couleurs disponibles |
| description | text | Description produit (optionnel) |
| statut | text | A_Poster, En_Cours, Poste |
| priorite | int | Ordre de priorité (1 = plus urgent) |
| created_at | timestamp | Date d'ajout |
| posted_at | timestamp | Date de publication (nullable) |

**Contrainte CHECK sur statut** : `statut IN ('A_Poster', 'En_Cours', 'Poste')`

### Table destination : `posts_promo` (à créer)

| Colonne | Type | Description |
|---------|------|-------------|
| id | uuid | PK auto-généré |
| produit_id | uuid | FK vers produits_promo |
| reference_produit | text | Copie de la référence |
| nom_produit | text | Copie du nom |
| categorie_produit | text | Copie de la catégorie |
| hook | text | Première ligne accrocheuse |
| corps | text | Corps du post |
| cta | text | Call to action |
| hashtags | text | Hashtags séparés par espaces |
| image_originale_url | text | URL image catalogue |
| image_transformee_url | text | URL image mise en situation |
| prompt_transformation | text | Prompt utilisé pour Flux Kontext |
| analyse_produit | text | JSON de l'analyse IA du produit |
| statut | text | A_Valider, Valide, Publie, Rejete, Modifie |
| score_ia | decimal | Score de qualité (optionnel) |
| date_publication_prevue | timestamp | Date programmée |
| date_publication_effective | timestamp | Date réelle de publication |
| linkedin_post_id | text | ID du post LinkedIn après publication |
| created_at | timestamp | Date de génération |
| updated_at | timestamp | Dernière modification |

**Contrainte CHECK sur statut** : `statut IN ('A_Valider', 'Valide', 'Publie', 'Rejete', 'Modifie')`

---

## CONFIGURATION FAL.AI - FLUX KONTEXT

### Endpoint
```
POST https://fal.run/fal-ai/flux-pro/kontext
```

### Headers
```
Authorization: Key {FAL_API_KEY}
Content-Type: application/json
```

### Body
```json
{
  "prompt": "{{prompt_mise_en_situation}}",
  "image_url": "{{url_image_produit}}",
  "guidance_scale": 7.5,
  "num_inference_steps": 28,
  "output_format": "png"
}
```

### Principe Flux Kontext
- Prend une image existante + un prompt
- Transforme l'image en gardant le sujet principal intact
- Idéal pour : changer le fond, ajouter du contexte, mise en situation

---

## PROMPTS IA À INTÉGRER

### Prompt 1 : Analyse du produit (Vision GPT-4o)

```
Tu es un expert en analyse de produits promotionnels/goodies.

Analyse cette image de produit et identifie :

1. TYPE_PRODUIT : Quel type de produit c'est exactement (stylo, mug, gobelet, briquet, carnet, clé USB, t-shirt, casquette, sac, porte-clés, etc.)

2. COULEUR_PRINCIPALE : La couleur dominante du produit

3. COULEURS_SECONDAIRES : Autres couleurs visibles

4. MATERIAU_APPARENT : Le matériau (plastique, métal, céramique, tissu, verre, bois...)

5. CARACTERISTIQUES : Particularités visuelles (logo, texte, forme spéciale, finition mate/brillante...)

6. TAILLE_ESTIMEE : Estimation de la taille (petit objet de poche, objet de bureau, grand objet...)

Réponds en JSON :
{
  "type_produit": "",
  "couleur_principale": "",
  "couleurs_secondaires": [],
  "materiau": "",
  "caracteristiques": [],
  "taille": "",
  "contexte_utilisation_suggere": ""
}
```

### Prompt 2 : Génération du prompt de mise en situation

```
Tu es un expert en direction artistique et photographie de produits pour le e-commerce B2B.

PRODUIT ANALYSÉ :
{{ JSON de l'analyse produit }}

CHARTE GRAPHIQUE RAPID PUB :
- Orange principal : #E94E1B
- Vert accent : #A4C639
- Style : Moderne, dynamique, professionnel B2B

OBJECTIF : Générer un prompt pour Flux Kontext qui va transformer cette image de produit sur fond blanc en une mise en situation professionnelle et attrayante.

RÈGLES :
1. Le produit doit rester EXACTEMENT identique (Flux Kontext le garde intact)
2. Le contexte doit être cohérent avec l'utilisation du produit
3. L'ambiance doit être professionnelle, lumineuse, moderne
4. Éviter les contextes trop chargés qui détournent l'attention du produit
5. Inclure subtilement les couleurs Rapid Pub si possible (éléments orange/vert en arrière-plan)

EXEMPLES DE CONTEXTES PAR TYPE :
- Stylo → Bureau moderne avec carnet, lumière naturelle
- Mug → Cuisine moderne ou bureau, vapeur de café
- Gobelet → Bureau, salle de réunion, espace de coworking
- Briquet → Table de terrasse, ambiance extérieure
- Carnet → Bureau créatif, avec plante et café
- Clé USB → Bureau tech, écran en arrière-plan flou
- T-shirt → Porté par silhouette floue ou posé sur surface design
- Sac → Hall d'entreprise moderne, posé sur banquette

RÉPONDS EN JSON :
{
  "prompt_flux_kontext": "Description détaillée en ANGLAIS pour Flux Kontext, gardant le produit intact mais ajoutant un contexte professionnel...",
  "contexte_choisi": "Bureau moderne / Terrasse / etc.",
  "elements_arriere_plan": ["élément 1", "élément 2"],
  "ambiance_lumiere": "Description de l'éclairage",
  "justification": "Pourquoi ce contexte est pertinent pour ce produit"
}
```

### Prompt 3 : Génération du post LinkedIn

```
Tu es un expert en copywriting LinkedIn pour Rapid Pub, imprimerie B2B spécialisée dans les goodies et objets publicitaires personnalisés.

PRODUIT À PROMOUVOIR :
- Nom : {{ nom_produit }}
- Catégorie : {{ categorie }}
- Analyse : {{ JSON analyse produit }}

OBJECTIF : Créer un post LinkedIn promotionnel qui met en valeur ce produit de manière engageante, sans être trop "vendeur" ou pushy.

RÈGLES DE RÉDACTION :
1. Hook percutant (emoji + phrase qui arrête le scroll)
2. Mettre en avant les BÉNÉFICES pour le client B2B (pas juste les caractéristiques)
3. Inclure un élément de preuve sociale ou de crédibilité si possible
4. CTA qui invite à l'échange (pas juste "contactez-nous")
5. 4-6 hashtags pertinents
6. Ton : Professionnel mais accessible, pas corporate ennuyeux
7. Longueur : 600-1000 caractères

ANGLES POSSIBLES :
- L'objet comme outil de fidélisation client
- Le cadeau d'entreprise qui marque les esprits
- L'objet du quotidien qui rappelle votre marque
- Le goodies événementiel parfait
- La personnalisation qui fait la différence

RÉPONDS EN JSON :
{
  "hook": "Première ligne avec emoji",
  "corps": "Corps du post avec sauts de ligne...",
  "cta": "Question ou invitation à l'échange",
  "hashtags": "#goodies #objetspub #B2B #communication #marquage",
  "angle_choisi": "L'angle utilisé pour ce post"
}
```

---

## FICHIERS FOURNIS

1. `LinkedIn_Post_Generator_RapidPub.json` - Workflow 1 existant (référence pour le style et les connexions)
2. Dossier de l'application Next.js (dashboard)

---

## LIVRABLES ATTENDUS

### 1. Fichier JSON du workflow n8n
- Nom : `LinkedIn_Promo_Generator_RapidPub.json`
- Workflow complet et fonctionnel
- Même style de nommage des nodes que le workflow 1
- Sticky notes explicatives

### 2. Script SQL pour Supabase
- Création des tables `produits_promo` et `posts_promo`
- Contraintes et index appropriés
- Exemples de données de test

### 3. Modifications du dashboard (si applicable)
- Nouvelle section pour les posts promo
- Composants nécessaires pour afficher/valider les promos

---

## CREDENTIALS À RÉUTILISER (déjà configurés dans n8n)

- OpenAI : `OpenAi account` (id: 5WT5sohMVHxikmyM)
- Supabase : Utiliser les mêmes credentials que workflow 1
- Cloudinary : Upload preset `rapid-pub-linkedin`, cloud name `dcxj1nknb`
- Fal.ai : Header Auth avec `Authorization: Key {clé}` (id: WIbk16kRxy9Y9vsZ)

---

## NOTES IMPORTANTES

1. **Flux Kontext** est crucial : il doit GARDER le produit identique, seul le contexte change
2. **Statuts produits** : Le workflow doit mettre à jour le statut du produit source après traitement
3. **Gestion d'erreurs** : Prévoir des fallbacks si l'image ne peut pas être transformée
4. **Dashboard unifié** : Les deux types de posts (valeur et promo) seront validés dans le même dashboard mais dans des onglets/sections différents

---

## QUESTIONS À ME POSER SI BESOIN

Si tu as besoin de clarifications sur :
- La structure exacte des credentials
- Le fonctionnement de composants du dashboard existant
- Les préférences de style de code
- Toute autre information manquante

Demande-moi avant de commencer à coder.
