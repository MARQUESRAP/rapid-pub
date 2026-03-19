# Architecture complète : Système de création de contenu LinkedIn automatisé (8 posts/mois en 6 minutes)

---

## Ce que tu vas apprendre dans cette ressource

Tu vas découvrir l'architecture exacte du système que j'ai monté pour un de mes clients : un imprimeur en ligne B2B. Avant ce système, il passait 6h par semaine sur LinkedIn. Aujourd'hui, il se connecte 1 minute 30, il choisit ses posts parmi 3 suggestions, ajuste 2-3 mots, et valide. Le reste tourne tout seul.

8 posts par mois. 6 minutes de travail total. Publication automatique.

Ce document détaille tout : la stack technique, chaque workflow, la logique de génération, la base de données, l'interface web, et une checklist pour reproduire ça dans ton secteur.

> Ce n'est pas un template générique. C'est l'architecture exacte en production depuis plusieurs mois.

---

## Vue d'ensemble du système

Le système repose sur 3 piliers :

1. **Un workflow de génération automatique** qui tourne chaque lundi à 7h — il fait la veille, analyse les tendances, génère les posts, les score, crée les visuels, et notifie le client par email
2. **Une application web custom** où le client valide, modifie ou rejette les suggestions en quelques clics
3. **Un workflow de publication automatique** qui publie directement sur LinkedIn aux créneaux optimaux, sans intervention humaine

Le tout est orchestré par 6 workflows n8n interconnectés + une base de données Supabase + une webapp Next.js.

> SCREENSHOT RECOMMANDE : Schéma d'architecture global montrant les 3 piliers et les flux de données entre eux (à faire sur Excalidraw, Whimsical ou Canva)

---

## Stack technique complet

| Outil | Rôle | Coût mensuel |
|-------|------|-------------|
| **n8n** (auto-hébergé sur Hostinger) | Orchestration des 6 workflows automatisés | ~5€/mois (VPS) |
| **Claude API** (Sonnet) | Analyse de tendances, génération de posts, scoring, prompts d'images, modification de contenu | ~20-30€/mois |
| **Nano Banana Pro** (Gemini 3 Pro Image via fal.ai) | Génération et modification d'images photoréalistes | ~10-15€/mois |
| **Supabase** | Base de données PostgreSQL (posts, logs, métriques) | Gratuit (tier free) |
| **Cloudinary** | Hébergement permanent des images générées | Gratuit (tier free) |
| **Next.js 14** (hébergé sur Vercel) | Application web de validation pour le client | Gratuit (tier free) |
| **LinkedIn API** (app développeur) | Publication automatique des posts | Gratuit |
| **SMTP** (email) | Notification au client quand les posts sont prêts | Inclus |

**Coût total : ~35-50€/mois** pour un système qui remplace 24h de travail mensuel.

> SCREENSHOT RECOMMANDE : Dashboard n8n montrant les 6 workflows actifs avec leurs dernières exécutions

---

## Les 6 workflows en détail

---

### Workflow 1 : Génération des posts (le coeur du système)

C'est le workflow principal. Il fait tout : veille, analyse, génération, scoring, création d'images, et notification. Il tourne **chaque lundi à 7h**, automatiquement.

#### Étape 1 : Collecte de veille (6 flux RSS en parallèle)

Dès le déclenchement, 6 flux RSS sont interrogés simultanément :

- **Google News "printing industry"** — actualités mondiales de l'imprimerie
- **PrintWeek / Print Media Centre** — média spécialisé print
- **FESPA** — fédération européenne de l'impression
- **Google News "imprimerie"** — actualités françaises
- **Google News "restauration hôtellerie communication print"** — actualités des secteurs cibles du client
- **Google News "événementiel salon foire communication imprimerie"** — actualités événementielles

En parallèle, le workflow récupère les **20 derniers posts** déjà générés depuis Supabase. C'est le système anti-répétition : il empêche Claude de régénérer des angles ou des hooks déjà utilisés.

> SCREENSHOT RECOMMANDE : Vue du workflow n8n montrant les 6 nodes RSS en parallèle + le node Supabase "Get Recent Posts"

#### Étape 2 : Nettoyage et déduplication

Tous les flux RSS sont fusionnés, nettoyés (suppression HTML, troncature à 1000 caractères), dédupliqués (sur les 100 premiers caractères du titre), et triés par engagement. Seuls les **40 meilleurs éléments** sont conservés.

Le système utilise un accumulateur : il attend que les 6 flux soient arrivés avant de traiter. Si un flux plante, il continue sans bloquer les autres (timeout de 5 minutes).

#### Étape 3 : Analyse des tendances (Claude Sonnet)

Les 40 éléments de veille sont envoyés à Claude Sonnet avec un prompt spécialisé. Claude analyse et retourne un JSON structuré avec :

- **Hooks performants** — les accroches qui génèrent le plus d'engagement
- **Formats engageants** — listes, storytelling, questions, stats choc
- **Sujets tendance** — dans le secteur print ET dans les secteurs cibles (restauration, commerce, immobilier, BTP, événementiel)
- **Mythes à casser** — idées reçues sur le print à déconstruire
- **Chiffres marquants** — stats du secteur avec sources
- **Prédictions/tendances** — ce qui arrive dans l'industrie
- **Cas concrets sectoriels** — use cases de print réussi dans les secteurs cibles

> SCREENSHOT RECOMMANDE : Exemple de sortie JSON de l'analyse de tendances (floutée si nécessaire)

#### Étape 4 : Système anti-répétition

Les 20 derniers posts sont formatés en un résumé : catégorie, titre, hook. Ce résumé est injecté dans le prompt de génération avec l'instruction explicite : **"NE RÉPÈTE PAS ces sujets, angles ou hooks."**

Le système compte aussi les catégories récentes (ex: "educatif: 4 fois, actualite: 2 fois") pour que Claude priorise les catégories sous-représentées.

#### Étape 5 : Génération des posts (Claude Sonnet)

Claude reçoit en entrée :
- L'analyse des tendances (étape 3)
- Le résumé anti-répétition (étape 4)

Et génère **3 posts LinkedIn** en JSON, chacun avec :
- **Catégorie** (parmi 6 : Éducatif, Actualité, Cas concrets, Mythbusters, Chiffres choc, Prédictions)
- **Titre interne** (pour identification)
- **Hook** (max 200 caractères, avec emoji — c'est ce qui décide si on clique "voir plus")
- **Corps** (800-1300 caractères, phrases courtes, aéré)
- **CTA** (question ouverte qui pousse au commentaire)
- **Hashtags** (3-5 dont le hashtag de marque)
- **Format visuel** + **Idée de visuel**

Le prompt système est le coeur de la qualité. Il contient :
- L'identité complète de la marque (nom, année de création, équipe, zone, différenciateurs, preuve sociale)
- Les secteurs cibles et les décideurs types
- La voix de marque ("on", "chez nous", ton du collègue expert — PAS du professeur)
- 3 formats de posts en rotation (tip actionnable, observation terrain, point de vue tranché)
- Une règle anti-hallucination stricte (ne jamais inventer de chiffres, certifications ou témoignages)
- Les erreurs à éviter (posts trop longs, ton professoral, listes de 5+ points)

> Ce prompt fait plus de 2000 mots. C'est le résultat de plusieurs mois d'itérations. La qualité du prompt = la qualité des posts.

> SCREENSHOT RECOMMANDE : Capture du node "Generation 3 Posts" dans n8n montrant les paramètres (system prompt visible en partie)

#### Étape 6 : Scoring automatique (Claude Sonnet)

Chaque post est scoré individuellement par Claude sur 5 critères (note de 1 à 10) :

| Critère | Ce qu'il évalue |
|---------|----------------|
| **score_hook** | Les 3 premières lignes donnent-elles envie de cliquer "voir plus" ? |
| **score_commentaires** | Le CTA pousse-t-il à commenter ? |
| **score_originalité** | L'angle est-il frais ou déjà vu ? |
| **score_valeur** | Le lecteur apprend-il quelque chose d'utile ? |
| **score_structure** | Le post est-il bien aéré et lisible sur mobile ? |

Le prompt de scoring est calibré pour que la moyenne tourne autour de 7. Un 8+ est rare et signifie un post vraiment fort. Si le score est faible sur un critère, Claude ajoute une suggestion d'amélioration.

Le score final (moyenne des 5) est affiché dans l'interface de validation pour aider le client à choisir.

#### Étape 7 : Génération des prompts d'images (Claude Sonnet)

Pour chaque post, Claude génère un prompt d'image optimisé pour Nano Banana Pro (Gemini 3 Pro Image). Le prompt système contient :

- La charte graphique (couleurs de marque intégrées subtilement, pas en aplat)
- Le style obligatoire : **photographique réaliste**, comme une vraie photo pro — pas d'illustrations, pas de flat design
- Des règles par catégorie (ex: "Éducatif → gros plan sur des mains avec un document imprimé")
- Les spécifications techniques : "Shot on Canon EOS R5, 85mm lens, shallow depth of field f/2.8"
- L'interdiction de texte dans l'image (ou 1-3 mots maximum)

> Le résultat : des images qui ressemblent à de vraies photos professionnelles, pas à du contenu IA évident.

#### Étape 8 : Génération d'images (Nano Banana Pro)

Le prompt enrichi est envoyé à Nano Banana Pro via l'API fal.ai :
- Format : 1:1 (carré, optimal pour LinkedIn)
- Résolution : 2K
- Format de sortie : PNG
- Timeout : 120 secondes (la génération prend 30-50 secondes)

#### Étape 9 : Upload sur Cloudinary

L'image générée est uploadée sur Cloudinary pour un hébergement permanent. L'URL Cloudinary (HTTPS, CDN mondial) est celle qui sera utilisée dans le post LinkedIn et dans l'interface de validation.

#### Étape 10 : Sauvegarde dans Supabase

Chaque post est enregistré dans la table `posts` avec tous ses champs :
- Texte (hook, corps, CTA, hashtags)
- Scores (global + 5 sous-scores)
- Image (URL Cloudinary + prompt utilisé)
- Métadonnées (catégorie, date de génération, format visuel)
- Statut : **"a_valider"**

Un log d'exécution est aussi créé dans la table `logs_workflow` (date, statut, nombre de posts/images générés).

#### Étape 11 : Notification email

Le client reçoit un email avec :
- Un message clair : "Vos posts LinkedIn de la semaine sont prêts !"
- Un bouton CTA qui pointe directement vers le dashboard de validation
- Un rappel qu'il peut modifier les textes et visuels avant publication

> SCREENSHOT RECOMMANDE : Exemple de l'email reçu par le client

---

### Workflow 2 : Modification de texte

Quand le client veut ajuster un post depuis l'interface web, ce workflow se déclenche via webhook.

**Flow :**
1. Réception du webhook (post_id + instructions de modification)
2. Récupération du post depuis Supabase
3. Sauvegarde de la version précédente (hook, corps, CTA, hashtags) dans un champ JSONB `version_precedente` — ça permet le rollback
4. Passage du statut à "Modification_En_Cours" (l'interface affiche un loader)
5. Envoi à Claude avec le texte actuel + les instructions du client
6. Parsing de la réponse et mise à jour du post dans Supabase
7. Retour au statut "a_valider"
8. En cas d'erreur : rollback automatique au statut précédent

Le client peut par exemple écrire : *"Rends le hook plus percutant"* ou *"Remplace l'exemple du restaurateur par un agent immobilier"* — Claude comprend et ajuste.

> SCREENSHOT RECOMMANDE : Interface de modification de texte avec le champ d'instructions

---

### Workflow 3 : Modification d'image

Même principe que le workflow 2, mais pour les visuels.

**Flow :**
1. Réception du webhook (post_id + instructions de modification)
2. Récupération du post et sauvegarde de l'URL de l'image précédente
3. Passage en "Modification_En_Cours"
4. **Enrichissement du prompt** par Claude : le client écrit en français (ex: "Mets un fond plus chaud"), Claude transforme ça en prompt technique détaillé en anglais pour Nano Banana Pro
5. **Modification d'image** via Nano Banana Pro en mode image-to-image (il prend l'image existante et la modifie)
6. Upload de la nouvelle image sur Cloudinary
7. Mise à jour dans Supabase (nouvelle URL + nouveau prompt + ancien URL en backup)
8. Retour au statut "a_valider"
9. En cas d'erreur : rollback du statut

> L'enrichissement du prompt par Claude est clé : le client n'a pas besoin de savoir écrire un prompt technique. Il décrit ce qu'il veut en français, Claude traduit ça en instructions précises.

> SCREENSHOT RECOMMANDE : Avant/après d'une modification d'image (image originale vs image modifiée)

---

### Workflow 4 : Restauration de version texte

Si le client n'aime pas la modification, il peut revenir à la version précédente en 1 clic. Le workflow restaure les champs (hook, corps, CTA, hashtags) depuis le JSONB `version_precedente`.

---

### Workflow 5 : Restauration d'image

Même chose pour les images : restaure l'URL de l'image précédente stockée dans `image_precedente`.

---

### Workflow 6 : Publication LinkedIn automatique

Le workflow de publication tourne **2 fois par semaine** aux créneaux optimaux :
- **Mardi à 10h** (Europe/Paris)
- **Jeudi à 14h** (Europe/Paris)

**Flow :**
1. Le cron se déclenche au créneau prévu
2. Récupération des posts avec le statut **"Planifié"** triés par date de publication prévue
3. Si aucun post à publier → log et fin
4. Pour chaque post à publier :
   - Assemblage du contenu (hook + corps + CTA + hashtags)
   - Téléchargement de l'image depuis Cloudinary
   - **Register Upload** sur LinkedIn API (obtient une URL d'upload)
   - **Upload de l'image** en binaire vers LinkedIn
   - **Création du post** via LinkedIn API v2 (texte + image + visibilité publique)
   - Mise à jour du statut dans Supabase → **"Publié"**

La publication utilise l'**API LinkedIn v2** via une application développeur créée sur le compte LinkedIn du client. L'authentification se fait par OAuth2 avec un token de longue durée.

> SCREENSHOT RECOMMANDE : Vue du workflow n8n de publication montrant le flow complet (cron → LinkedIn API)

---

## L'application web de validation

L'interface est une application **Next.js 14** (TypeScript, React) hébergée sur Vercel. C'est là que le client passe ses 1 minute 30 par semaine.

### Connexion

Le client se connecte avec un **code PIN** à 4 chiffres. Pas de mot de passe complexe, pas d'email de confirmation. En 2 secondes il est dans son dashboard.

> SCREENSHOT RECOMMANDE : Page de connexion avec le pavé numérique PIN

### Dashboard principal

Le dashboard affiche tous les posts sous forme de **grille de cartes**. Chaque carte montre :
- L'image générée
- Le hook (les premières lignes)
- La catégorie (badge coloré)
- Le score IA (sur 10)
- Le statut (à valider, validé, planifié, publié)

Le client peut filtrer par statut grâce à des **onglets de filtre** en haut du dashboard. Une **barre de statistiques** affiche le total de posts, ceux à valider, et ceux validés.

> SCREENSHOT RECOMMANDE : Dashboard avec plusieurs posts en grille, différents statuts visibles

### Détail d'un post

En cliquant sur une carte, une **modale de détail** s'ouvre avec :

- **Preview LinkedIn** : un aperçu exact de ce à quoi le post ressemblera une fois publié sur LinkedIn (avec la photo de profil, le nom, l'image, le texte formaté)
- **Scores détaillés** : les 5 sous-scores (hook, commentaires, originalité, valeur, structure) + le score global
- **Suggestions IA** : si Claude a identifié des points d'amélioration
- **Boutons d'action** :
  - **Valider** → le post passe en statut "validé"
  - **Modifier le texte** → ouvre un champ pour écrire des instructions de modification
  - **Modifier l'image** → ouvre un champ pour décrire la modification visuelle souhaitée
  - **Rejeter** → archive le post

Les modifications sont **optimistes** : l'interface se met à jour instantanément (en <100ms) avant même que le workflow n8n ait fini de traiter. Si le workflow échoue, l'interface revient à l'état précédent.

> SCREENSHOT RECOMMANDE : Modale de détail d'un post avec la preview LinkedIn + les scores + les boutons d'action

### Vue calendrier

Une vue calendrier permet de voir les posts planifiés sur la semaine ou le mois :
- **Vue semaine** : 7 jours avec les slots de publication (mardi 10h, jeudi 14h)
- **Vue mois** : vision globale du planning de publication
- **Liste à venir** : les prochains posts planifiés dans l'ordre chronologique

Le système d'**auto-scheduling** attribue automatiquement les posts validés au prochain créneau disponible (mardi ou jeudi).

> SCREENSHOT RECOMMANDE : Vue calendrier semaine avec des posts planifiés sur les créneaux

---

## Base de données Supabase : structure

### Table `posts`

| Champ | Type | Description |
|-------|------|-------------|
| `id` | UUID | Identifiant unique auto-généré |
| `titre_interne` | TEXT | Titre pour identification interne |
| `categorie` | ENUM | Educatif, Actualite, Cas_Concrets, Mythbusters, Chiffres_Choc, Predictions |
| `hook` | TEXT | Accroche (max 200 caractères) |
| `corps` | TEXT | Corps du post (800-1300 caractères) |
| `cta` | TEXT | Call-to-action (question ouverte) |
| `hashtags` | TEXT | Hashtags séparés par des espaces |
| `image_url` | TEXT | URL Cloudinary de l'image |
| `prompt_image` | TEXT | Prompt utilisé pour générer l'image |
| `score_ia` | DECIMAL | Score global (moyenne des 5 sous-scores) |
| `score_hook` | DECIMAL | Score de l'accroche (1-10) |
| `score_commentaires` | DECIMAL | Score du potentiel de commentaires (1-10) |
| `score_originalite` | DECIMAL | Score d'originalité (1-10) |
| `score_valeur` | DECIMAL | Score de valeur ajoutée (1-10) |
| `score_structure` | DECIMAL | Score de structure/lisibilité (1-10) |
| `suggestions_ia` | TEXT | Suggestions d'amélioration de Claude |
| `statut` | ENUM | a_valider, valide, Planifie, publie, archive, Modification_En_Cours |
| `date_publication_prevue` | TIMESTAMPTZ | Date de publication planifiée (contrainte unique) |
| `version_precedente` | JSONB | Version précédente du texte (pour rollback) |
| `image_precedente` | TEXT | URL de l'image précédente (pour rollback) |
| `created_at` | TIMESTAMPTZ | Date de création |
| `updated_at` | TIMESTAMPTZ | Dernière modification (trigger automatique) |
| `validated_at` | TIMESTAMPTZ | Date de validation |
| `date_generation` | TIMESTAMPTZ | Date de génération par le workflow |

**Index clés :**
- `idx_posts_statut` — pour filtrer rapidement par statut
- `idx_posts_date_publication` — pour le workflow de publication
- `idx_posts_created_at DESC` — pour afficher les posts récents en premier

**Fonctions PostgreSQL :**
- `get_next_available_slot()` — retourne le prochain jeudi 14h disponible (vérifie la contrainte d'unicité sur `date_publication_prevue`)
- `update_updated_at_column()` — trigger qui met à jour `updated_at` automatiquement

### Table `logs_workflow`

| Champ | Type | Description |
|-------|------|-------------|
| `id` | UUID | Identifiant unique |
| `date_execution` | TIMESTAMPTZ | Date d'exécution du workflow |
| `statut` | ENUM | Succes, Partiel, Echec |
| `posts_generes` | INTEGER | Nombre de posts générés |
| `images_generees` | INTEGER | Nombre d'images générées |
| `erreurs` | TEXT | Détail des erreurs si échec |

> SCREENSHOT RECOMMANDE : Vue du Table Editor Supabase montrant la structure de la table posts

---

## Ce qui a été fait en amont (one-shot)

### Analyse des top performers de la niche

Avant de construire le système, j'ai fait un travail de recherche manuel :
- Identification de 10-15 comptes LinkedIn qui performent dans le secteur de l'imprimerie et du marketing B2B
- Analyse de leurs meilleurs posts : formats utilisés, structures narratives, hooks, CTA
- Extraction des patterns récurrents : longueur optimale, ratio texte/image, types de CTA qui génèrent le plus de commentaires

Ces insights ont été intégrés directement dans le **prompt système** du workflow de génération. C'est ce qui fait que les posts générés ne sont pas génériques — ils s'appuient sur ce qui marche réellement dans cette niche.

### Analyse de l'historique du client

J'ai aussi analysé les posts passés du client pour identifier :
- Son ton naturel (pour que les posts générés lui ressemblent)
- Les sujets qui ont le mieux fonctionné
- Les formats préférés de son audience
- Les heures et jours de publication optimaux

Ces données ont été utilisées pour calibrer les prompts et choisir les créneaux de publication (mardi 10h et jeudi 14h).

---

## Comment reproduire ce système dans ton secteur

### Phase 1 : Préparation (3-5 jours)

- [ ] **Choisis ta stack** : crée un compte Supabase (gratuit), souscris à l'API Claude (Anthropic), installe n8n (VPS à ~5€/mois ou n8n cloud)
- [ ] **Analyse ta niche** : identifie 10-15 comptes LinkedIn qui performent dans ton secteur. Analyse manuellement leurs 20 meilleurs posts. Note les patterns (formats, accroches, longueur, CTA)
- [ ] **Analyse ton historique** : exporte tes posts LinkedIn (Paramètres > Télécharger vos données). Si tu as moins de 30 posts, commence par publier manuellement pendant 1-2 mois pour avoir des données
- [ ] **Identifie tes sources de veille** : trouve 4-6 flux RSS pertinents pour ton secteur (Google News RSS, blogs spécialisés, médias pro). Teste-les manuellement pour vérifier qu'ils retournent du contenu pertinent
- [ ] **Crée ton identité de marque** : documente tout ce que l'IA doit savoir (nom, année, équipe, zone, différenciateurs, preuve sociale, secteurs cibles, ton de voix, sujets interdits). C'est le coeur de ton prompt système.

### Phase 2 : Construction (1-2 semaines)

- [ ] **Crée la base de données Supabase** : table `posts` avec les champs listés ci-dessus + table `logs_workflow`
- [ ] **Construis le workflow de génération** : c'est le plus complexe. Commence par les flux RSS + nettoyage, puis ajoute l'analyse de tendances, puis la génération, puis le scoring, puis les images. Teste chaque étape individuellement.
- [ ] **Écris ton prompt système** : c'est l'étape la plus importante. Intègre tes insights de la Phase 1 (patterns de ta niche, ton de voix, identité de marque). Itère sur le prompt jusqu'à ce que les 3 premiers posts générés soient publiables avec des modifications mineures.
- [ ] **Construis les workflows de modification** : texte + image. Ces workflows sont simples (webhook → Claude/Nano Banana → Supabase update)
- [ ] **Construis le workflow de publication** : nécessite la création d'une app LinkedIn Developer sur le compte LinkedIn. Configure OAuth2 et teste avec un post de test.
- [ ] **Configure la notification email** : un simple SMTP qui envoie un email au client avec un lien vers le dashboard

### Phase 3 : Interface web (1 semaine)

- [ ] **Dashboard** : grille de posts avec filtres par statut + stats
- [ ] **Détail post** : modale avec preview LinkedIn + scores + boutons d'action
- [ ] **Modification** : champ texte pour les instructions + appel webhook vers n8n
- [ ] **Calendrier** (optionnel) : vue semaine/mois des posts planifiés
- [ ] **Auth** : un simple PIN suffit (le client est le seul utilisateur)
- [ ] **Hébergement** : Vercel (gratuit, déploiement automatique depuis GitHub)

### Phase 4 : Tests et itérations (1-2 semaines)

- [ ] Lance le workflow de génération manuellement 3-4 fois
- [ ] Évalue chaque post : est-ce que ça sonne comme du contenu que tu publierais ?
- [ ] Ajuste le prompt système à chaque itération (c'est là que tu gagnes en qualité)
- [ ] Teste la modification de texte et d'image depuis l'interface
- [ ] Teste la publication automatique (publie 1-2 posts)
- [ ] Active le cron du workflow de génération (lundi 7h) et celui de publication (mardi 10h + jeudi 14h)

### Phase 5 : Production

- [ ] Le système tourne. Chaque lundi, le client reçoit un email.
- [ ] Il se connecte, valide 2 posts sur 3, ajuste un mot ou deux si besoin.
- [ ] Les posts sont publiés automatiquement mardi et jeudi.
- [ ] Chaque mois, regarde les métriques LinkedIn. Si un format performe particulièrement bien, ajuste le prompt pour en générer davantage.

---

## Coût de fonctionnement détaillé

| Poste | Coût mensuel | Détail |
|-------|-------------|--------|
| Claude API (Sonnet) | ~20-30€ | 4 appels Claude par run × 4 runs/mois + modifications |
| Nano Banana Pro (fal.ai) | ~10-15€ | 3 images/run × 4 runs/mois + modifications (~0.10€/image) |
| Cloudinary | Gratuit | <1000 images/an, tier gratuit suffit |
| Supabase | Gratuit | <500MB, tier gratuit suffit |
| n8n (VPS Hostinger) | ~5€ | VPS basique auto-hébergé |
| Vercel | Gratuit | Tier hobby suffit pour 1 utilisateur |
| LinkedIn API | Gratuit | App développeur gratuite |
| **TOTAL** | **~35-50€/mois** | |

Pour comparaison : un community manager freelance facture 500-1500€/mois pour le même volume de contenu.

---

## Erreurs à éviter

1. **Prompt système trop générique** — Si tu copie-colles un prompt ChatGPT basique, tes posts seront insipides. Le prompt doit contenir ton identité de marque complète, les patterns de ta niche, et des règles anti-hallucination strictes.

2. **Pas assez de sources de veille** — 2 flux RSS ne suffisent pas. Tu as besoin de 4-6 sources minimum pour que Claude ait assez de matière pour trouver des angles intéressants.

3. **Négliger le système anti-répétition** — Sans ça, Claude va régénérer les mêmes angles et hooks. Le fait de lui envoyer les 20 derniers posts fait une différence massive sur la diversité du contenu.

4. **Vouloir 100% d'automatisation** — La validation humaine est non-négociable. L'IA suggère, l'humain valide. C'est ce qui maintient l'authenticité du contenu.

5. **Ignorer le scoring** — Les scores permettent au client de faire un choix éclairé en 10 secondes au lieu de lire chaque post en détail.

6. **Oublier le rollback** — Quand le client demande une modification et que le résultat ne lui plaît pas, il doit pouvoir revenir en arrière en 1 clic. Le système de versioning (version_precedente) est essentiel.

7. **Publier sans tester les créneaux** — Mardi 10h et jeudi 14h marchent pour le B2B en France. Tes créneaux optimaux peuvent être différents. Teste pendant 1 mois avant de fixer.

---

## Résultats concrets

- **Avant** : 6h par semaine de travail sur LinkedIn (recherche + rédaction + visuel + publication)
- **Après** : 1 minute 30 par semaine (ouvrir l'app, valider 2 posts, ajuster 2-3 mots)
- **Volume** : 8 posts/mois publiés, contre 2-3 quand c'était fait manuellement
- **Qualité** : engagement en hausse grâce aux insights data-driven et au scoring
- **Coût** : ~40€/mois vs 500-1500€ pour un community manager
- **Temps de mise en place** : ~4 semaines pour la première version fonctionnelle

---

## Checklist des screenshots à inclure dans ta version

- [ ] Schéma d'architecture global (Excalidraw/Whimsical/Canva)
- [ ] Dashboard n8n avec les 6 workflows
- [ ] Workflow de génération ouvert (vue complète montrant les nodes)
- [ ] Détail d'un node Claude (prompt visible)
- [ ] Exemple de l'email de notification
- [ ] Page de connexion PIN de l'app web
- [ ] Dashboard de l'app avec posts en grille
- [ ] Modale de détail d'un post (preview LinkedIn + scores)
- [ ] Interface de modification de texte
- [ ] Avant/après d'une modification d'image
- [ ] Vue calendrier (semaine ou mois)
- [ ] Table Editor Supabase montrant la structure
- [ ] Exemple d'un post LinkedIn publié automatiquement par le système
