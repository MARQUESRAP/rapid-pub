# LinkedIn Post Generator - Rapid Pub

Générateur automatique de posts LinkedIn pour Rapid Pub, une imprimerie B2B française avec livraison en 24h.

## Architecture WAT

Ce projet utilise l'architecture **WAT** (Workflows, Agents, Tools) pour séparer les préoccupations :

- **Workflows** (`workflows/`) : Instructions en markdown (SOPs)
- **Agents** (Claude) : Prise de décision intelligente et orchestration
- **Tools** (`tools/`) : Scripts Python d'exécution déterministes

## Structure du projet

```
├── CLAUDE.md              # Instructions pour l'agent
├── README.md              # Ce fichier
├── requirements.txt       # Dépendances Python
├── .env                   # Variables d'environnement (à créer)
├── .env.example           # Template pour .env
├── workflows/             # Workflows en markdown
├── tools/                 # Scripts Python
└── .tmp/                  # Fichiers temporaires (régénérables)
```

## Installation

1. **Cloner et installer les dépendances** :
```bash
pip install -r requirements.txt
```

2. **Configurer les variables d'environnement** :
```bash
cp .env.example .env
# Éditer .env avec vos vraies clés API
```

3. **Configurer les credentials Google** (optionnel) :
   - Placer `credentials.json` à la racine pour Google Sheets/Slides
   - Le fichier `token.json` sera généré automatiquement

## Workflow principal

Le workflow génère 10 posts LinkedIn variés en suivant ces étapes :

1. **Collecte** : RSS feeds + Contenus client Airtable
2. **Analyse IA** : Identification des tendances avec GPT-4
3. **Génération** : 10 posts variés (5 catégories × 2)
4. **Scoring** : Évaluation du potentiel d'engagement
5. **Visuels** : Génération de prompts puis images DALL-E
6. **Stockage** : Airtable + Cloudinary

## Catégories de posts

- **Éducatif** : Tips pratiques sur l'impression
- **Coulisses** : Behind the scenes, équipe, process
- **Actualité** : News secteur, tendances
- **Storytelling** : Cas clients, témoignages
- **Décalé** : Humour, format original

## Utilisation

Voir les workflows individuels dans `workflows/` pour les instructions détaillées.

## Migration depuis n8n

Ce projet était initialement un workflow n8n (voir `LinkedIn Post Generator RapidPub-2.json`). Il a été migré vers l'architecture WAT pour :
- Plus de contrôle et de flexibilité
- Meilleure gestion des erreurs
- Évolutivité et maintenance facilitée
- Coûts API optimisés

## Support

Pour toute question, référez-vous à `CLAUDE.md` pour comprendre comment l'agent fonctionne avec ce projet.
