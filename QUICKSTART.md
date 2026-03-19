# Guide de Démarrage Rapide

## 1. Installation initiale

### a) Installer les dépendances Python

```bash
pip install -r requirements.txt
```

### b) Configurer les variables d'environnement

```bash
# Copier le template
cp .env.example .env

# Éditer avec vos vraies clés API
nano .env  # ou votre éditeur préféré
```

**Clés requises minimum** :
- `OPENAI_API_KEY` : Pour génération de contenu et images
- `AIRTABLE_API_KEY` : Pour stockage des posts
- `CLOUDINARY_*` : Pour hébergement des images

**Optionnel** :
- `APIFY_API_KEY` : Pour scraping LinkedIn (coûteux, peut être sauté)

### c) Vérifier la configuration Airtable

Assurez-vous que vos bases Airtable ont la bonne structure :

**Base** : `appjGlY7zdhLNoigh` (Rapid Pub - LinkedIn)

**Table `Posts_LinkedIn`** (tbl5jbF40or90nQVC) :
- Date_Generation (DateTime)
- Categorie (Select: Educatif, Coulisses, Actualite, Storytelling, Decale)
- Titre_Interne (Text)
- Hook (Long Text)
- Corps (Long Text)
- CTA (Text)
- Hashtags (Text)
- Format_Visuel (Select: carrousel, image_simple, infographie, photo_style)
- Prompt_Image (Long Text)
- URL_Image_1 (URL)
- Score_IA (Number)
- Suggestions_IA (Long Text)
- Statut (Select: A_Valider, Valide, Modifie, Rejete, Planifie, Publie)

**Table `Contenus_Client`** (tbl4hdYxOpeqVT1Md) :
- Titre (Text)
- Contenu (Long Text)
- Deja_Utilise (Checkbox)
- Date (DateTime)

**Table `Logs_Workflow`** (tblWxC5gAG6FbFa8A) :
- Date_Execution (DateTime)
- Statut (Select: Succes, Erreur, Partiel)
- Posts_Generes (Number)
- Images_Generees (Number)
- Erreurs (Long Text)

## 2. Test rapide

### Test des outils individuels

```bash
# Test 1 : Récupération RSS
python tools/fetch_rss_feeds.py

# Test 2 : Récupération Airtable
python tools/fetch_airtable_content.py

# Test 3 : Nettoyage des données
python tools/clean_and_dedupe.py

# Test 4 : Analyse des tendances (utilise OpenAI)
python tools/analyze_trends.py
```

Chaque outil crée un fichier dans `.tmp/` que vous pouvez inspecter.

### Workflow complet (partiel)

```bash
python run_workflow.py
```

Pour le moment, cela exécute les 4 premières étapes.

## 3. Architecture du projet

```
LinkedIn Post Generator/
├── CLAUDE.md                    # Instructions pour l'agent IA
├── README.md                    # Documentation générale
├── QUICKSTART.md               # Ce guide
├── requirements.txt            # Dépendances Python
├── .env                        # Variables d'environnement (à créer)
├── .env.example               # Template pour .env
├── .gitignore                 # Fichiers à ignorer par git
│
├── run_workflow.py            # Orchestrateur principal
│
├── workflows/                 # 📋 Workflows (SOPs en markdown)
│   └── generate_linkedin_posts.md
│
├── tools/                     # 🔧 Outils d'exécution (Python)
│   ├── fetch_rss_feeds.py
│   ├── fetch_airtable_content.py
│   ├── clean_and_dedupe.py
│   ├── analyze_trends.py
│   ├── utils.py
│   │
│   └── [À créer] :
│       ├── generate_posts.py
│       ├── score_posts.py
│       ├── generate_image_prompts.py
│       ├── generate_images.py
│       ├── upload_to_cloudinary.py
│       ├── save_to_airtable.py
│       └── log_execution.py
│
└── .tmp/                      # 📦 Fichiers temporaires
    ├── rss_data.json
    ├── airtable_data.json
    ├── cleaned_data.json
    ├── trends_analysis.json
    ├── errors.log
    └── images/                # Images générées par DALL-E
```

## 4. Développement des outils manquants

Pour compléter le workflow, vous (ou l'agent IA) devez créer :

1. **tools/generate_posts.py**
   - Input : `.tmp/trends_analysis.json`
   - Output : `.tmp/generated_posts.json`
   - Utilise GPT-4o pour générer 10 posts variés

2. **tools/score_posts.py**
   - Input : `.tmp/generated_posts.json`
   - Output : `.tmp/scored_posts.json`
   - Score chaque post sur 3 critères

3. **tools/generate_image_prompts.py**
   - Input : `.tmp/scored_posts.json`
   - Output : `.tmp/posts_with_prompts.json`
   - Crée des prompts DALL-E adaptés

4. **tools/generate_images.py**
   - Input : `.tmp/posts_with_prompts.json`
   - Output : Images dans `.tmp/images/` + `.tmp/posts_with_local_images.json`
   - Génère les visuels avec DALL-E 3

5. **tools/upload_to_cloudinary.py**
   - Input : `.tmp/posts_with_local_images.json`
   - Output : `.tmp/posts_with_cloudinary_urls.json`
   - Upload les images sur Cloudinary

6. **tools/save_to_airtable.py**
   - Input : `.tmp/posts_with_cloudinary_urls.json`
   - Output : Records dans Airtable
   - Sauvegarde finale des posts

7. **tools/log_execution.py**
   - Input : Métriques d'exécution
   - Output : Record dans table Logs_Workflow
   - Traçabilité des exécutions

## 5. Commandes utiles

```bash
# Nettoyer les fichiers temporaires
rm -rf .tmp/*

# Voir les logs d'erreurs
tail -f .tmp/errors.log

# Lancer le workflow complet (quand terminé)
python run_workflow.py

# Lancer sans scraping LinkedIn (économise des crédits Apify)
python run_workflow.py --skip-scraping

# Mode dry-run (ne sauvegarde pas dans Airtable)
python run_workflow.py --dry-run

# Lancer un seul outil
python tools/fetch_rss_feeds.py
```

## 6. Workflow avec l'agent IA (Claude)

L'agent IA suit les instructions de `CLAUDE.md` pour :

1. **Lire le workflow** dans `workflows/generate_linkedin_posts.md`
2. **Exécuter les outils** dans le bon ordre
3. **Gérer les erreurs** gracieusement
4. **Mettre à jour le workflow** quand il apprend de nouvelles contraintes

**Exemple d'utilisation avec Claude** :

> "Génère 10 posts LinkedIn pour Rapid Pub en suivant le workflow"

Claude va :
- Lire `workflows/generate_linkedin_posts.md`
- Exécuter chaque outil dans l'ordre
- Gérer les erreurs (RSS timeout, etc.)
- Te présenter les résultats finaux

## 7. Migration depuis n8n

Le fichier `LinkedIn Post Generator RapidPub-2.json` est l'ancien workflow n8n. Il est conservé comme référence mais n'est plus utilisé.

**Avantages de la nouvelle architecture WAT** :
- ✅ Plus de contrôle sur l'exécution
- ✅ Gestion d'erreurs améliorée
- ✅ Débogage plus facile
- ✅ Coûts API optimisés
- ✅ Tests unitaires possibles
- ✅ Évolution progressive

## 8. Prochaines étapes

1. [ ] Créer les 7 outils manquants (voir section 4)
2. [ ] Tester le workflow complet end-to-end
3. [ ] Ajuster les prompts OpenAI selon les résultats
4. [ ] Ajouter des tests unitaires
5. [ ] Configurer l'exécution automatique (cron, etc.)
6. [ ] Dashboard de suivi des performances

## Besoin d'aide ?

Demandez à l'agent IA :
- "Crée l'outil generate_posts.py"
- "Teste le workflow complet"
- "Améliore le prompt d'analyse des tendances"
- "Ajoute la gestion d'erreur pour les timeouts API"

L'agent connaît l'architecture et peut développer les outils manquants de manière autonome.
