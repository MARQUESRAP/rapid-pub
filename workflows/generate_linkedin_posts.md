# Workflow : Génération de Posts LinkedIn pour Rapid Pub

## Objectif
Générer automatiquement 10 posts LinkedIn variés et engageants pour Rapid Pub (imprimerie B2B française), avec visuels DALL-E, en analysant les tendances du secteur.

## Inputs requis
- Aucun input manuel (workflow automatique)
- Les clés API doivent être configurées dans `.env`

## Étapes du workflow

### 1. Collecte de données (Parallèle)
**Objectif** : Rassembler le contenu de veille depuis plusieurs sources

**Outils à utiliser** :
- `tools/fetch_rss_feeds.py` : Collecte des 4 flux RSS (GraphiLine, PrintWeek, FESPA, Imprimerie)
- `tools/fetch_airtable_content.py` : Récupère les contenus clients non utilisés
- `tools/scrape_linkedin.py` (optionnel) : Scraping via Apify des concurrents LinkedIn

**Outputs** :
- Fichier JSON temporaire dans `.tmp/raw_data.json` avec tous les contenus collectés

**Notes** :
- Le scraping LinkedIn prend ~60s via Apify
- Si Apify échoue ou coûte trop cher, continuer sans (RSS + Airtable suffisent)

---

### 2. Nettoyage et déduplication
**Objectif** : Nettoyer le HTML, dédupliquer, et trier par engagement

**Outils à utiliser** :
- `tools/clean_and_dedupe.py`

**Inputs** :
- `.tmp/raw_data.json`

**Outputs** :
- `.tmp/cleaned_data.json` (max 40 éléments, triés par engagement)

**Règles** :
- Retirer les balises HTML
- Tronquer les textes à 1000 caractères
- Dédupliquer sur les 100 premiers caractères du titre
- Trier par engagement (likes + comments)
- Garder top 40

---

### 3. Analyse des tendances (IA)
**Objectif** : Identifier les hooks, formats, et sujets performants

**Outils à utiliser** :
- `tools/analyze_trends.py`

**Inputs** :
- `.tmp/cleaned_data.json`

**Outputs** :
- `.tmp/trends_analysis.json`

**Prompt système** :
```
Tu es un expert en analyse de contenu LinkedIn pour le secteur de l'imprimerie B2B.

Analyse les posts et actualités fournis et identifie :
1. Les hooks qui génèrent le plus d'engagement
2. Les formats de posts qui fonctionnent (liste, storytelling, question, stat choc...)
3. Les sujets tendance dans le secteur
4. Les bonnes pratiques de formatting
5. Les erreurs à éviter

Réponds en JSON structuré.
```

**Modèle** : GPT-4o
**Température** : 0.7
**Max tokens** : 2000

---

### 4. Génération des 10 posts (IA)
**Objectif** : Créer 10 posts variés respectant l'identité de marque Rapid Pub

**Outils à utiliser** :
- `tools/generate_posts.py`

**Inputs** :
- `.tmp/trends_analysis.json`

**Outputs** :
- `.tmp/generated_posts.json`

**Règles de rédaction** :
- Hook percutant en 1ère ligne (emoji + question ou stat)
- Paragraphes courts (2-3 lignes max)
- 3-5 emojis max par post
- CTA engageant (question ouverte de préférence)
- 4-6 hashtags pertinents
- Longueur : 800-1500 caractères

**Catégories à couvrir** (2 posts chacune) :
- Éducatif : Tips pratiques impression
- Coulisses : Behind the scenes
- Actualité : News secteur
- Storytelling : Cas clients (fictifs mais réalistes)
- Décalé : Humour, format original

**Ton de marque** :
- Relâché et cool mais professionnel
- Pas corporate
- B2B (95% PME, agences, commerces)
- USP : Livraison 24h

**Modèle** : GPT-4o
**Température** : 0.8
**Max tokens** : 6000

---

### 5. Scoring des posts (IA)
**Objectif** : Évaluer chaque post et suggérer des améliorations

**Outils à utiliser** :
- `tools/score_posts.py`

**Inputs** :
- `.tmp/generated_posts.json`

**Outputs** :
- `.tmp/scored_posts.json`

**Critères de scoring** (1-10) :
1. Potentiel d'engagement (hook, CTA, format)
2. Originalité (pas vu 100 fois)
3. Valeur ajoutée (utile pour cible B2B)

**Score final** = moyenne des 3

Si score < 7 : générer des suggestions d'amélioration

**Modèle** : GPT-4o
**Température** : 0.3
**Max tokens** : 500

---

### 6. Génération des prompts visuels (IA)
**Objectif** : Créer des prompts DALL-E adaptés à chaque post

**Outils à utiliser** :
- `tools/generate_image_prompts.py`

**Inputs** :
- `.tmp/scored_posts.json`

**Outputs** :
- `.tmp/posts_with_prompts.json`

**Charte graphique Rapid Pub** :
- Couleur principale : Orange vif #E94E1B
- Couleur accent : Vert lime #A4C639
- Style : Flat design moderne avec touches 3D subtiles
- Éléments signature : Petits carrés/pixels dispersés (effet digital/vitesse)
- Ambiance : Dynamique, professionnelle, accessible

**Formats selon catégorie** :
- Éducatif : Carrousel portrait 1080x1350
- Coulisses : Carré 1200x1200
- Actualité : Infographie carrée 1200x1200
- Storytelling : Paysage 1200x628
- Décalé : Portrait créatif 1080x1350

**Modèle** : GPT-4o
**Température** : 0.8
**Max tokens** : 2000

---

### 7. Génération des images (DALL-E)
**Objectif** : Créer les visuels avec DALL-E 3

**Outils à utiliser** :
- `tools/generate_images.py`

**Inputs** :
- `.tmp/posts_with_prompts.json`

**Outputs** :
- Images téléchargées dans `.tmp/images/`
- `.tmp/posts_with_local_images.json`

**Paramètres DALL-E** :
- Modèle : DALL-E 3
- Quality : HD
- Size : 1024x1024 (ajusté selon format)
- Style : vivid

**Notes** :
- Télécharger chaque image localement avant upload Cloudinary
- En cas d'erreur, continuer avec les autres posts
- Logger les erreurs dans `.tmp/image_errors.log`

---

### 8. Upload vers Cloudinary
**Objectif** : Héberger les images de manière permanente

**Outils à utiliser** :
- `tools/upload_to_cloudinary.py`

**Inputs** :
- `.tmp/posts_with_local_images.json`
- Images dans `.tmp/images/`

**Outputs** :
- `.tmp/posts_with_cloudinary_urls.json`

**Configuration** :
- Upload preset : `rapid-pub-linkedin`
- Cloud name : configuré dans `.env`

---

### 9. Sauvegarde vers Airtable
**Objectif** : Stocker les posts pour validation client

**Outils à utiliser** :
- `tools/save_to_airtable.py`

**Inputs** :
- `.tmp/posts_with_cloudinary_urls.json`

**Outputs** :
- Records créés dans Airtable (table `Posts_LinkedIn`)

**Champs Airtable** :
- Date_Generation
- Categorie
- Titre_Interne
- Hook
- Corps
- CTA
- Hashtags
- Format_Visuel
- Prompt_Image
- URL_Image_1
- Score_IA
- Suggestions_IA
- Statut (= "A_Valider")

---

### 10. Logging d'exécution
**Objectif** : Tracer l'exécution pour suivi

**Outils à utiliser** :
- `tools/log_execution.py`

**Inputs** :
- Nombre de posts générés
- Nombre d'images créées
- Erreurs éventuelles

**Outputs** :
- Record dans Airtable (table `Logs_Workflow`)

**Champs** :
- Date_Execution
- Statut (Succes / Erreur / Partiel)
- Posts_Generes
- Images_Generees
- Erreurs (texte)

---

## Gestion des erreurs

### Erreurs récupérables
- **RSS timeout** : Continuer sans ce flux
- **Apify échec** : Continuer sans scraping LinkedIn
- **DALL-E échec image** : Logger et continuer avec les autres
- **Cloudinary échec** : Sauver le post sans URL image

### Erreurs bloquantes
- **OpenAI API key invalide** : Arrêter et alerter
- **Airtable échec** : Arrêter (car c'est la sortie finale)
- **Aucune donnée collectée** : Arrêter (pas de sens de continuer)

## Optimisations possibles

1. **Batch DALL-E** : Générer plusieurs images en parallèle si OpenAI le permet
2. **Cache des analyses** : Réutiliser l'analyse de tendances si < 24h
3. **Retry logic** : 3 tentatives avec backoff exponentiel pour les API
4. **Rate limiting** : Respecter les limites OpenAI et Airtable

## Améliorations futures

- [ ] Ajouter une validation humaine avant publication
- [ ] Implémenter un système de A/B testing des hooks
- [ ] Créer un dashboard de performance des posts
- [ ] Automatiser la publication sur LinkedIn (après validation)
- [ ] Générer des carrousels multi-slides (actuellement 1 image/post)
