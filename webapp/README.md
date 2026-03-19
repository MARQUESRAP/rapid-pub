# Rapid Pub - LinkedIn Manager

Interface web de gestion et planification des posts LinkedIn pour Rapid Pub.

## 🚀 Démarrage rapide

### 1. Installer les dépendances

```bash
npm install
```

### 2. Configurer Supabase

#### a) Créer un projet Supabase

1. Allez sur [https://supabase.com](https://supabase.com)
2. Créez un nouveau projet :
   - **Nom** : `rapid-pub-linkedin`
   - **Région** : EU Central (Frankfurt) ou la plus proche de la France
   - **Mot de passe** : Générez un mot de passe fort

#### b) Exécuter les migrations

1. Dans votre projet Supabase, allez dans **SQL Editor**
2. Créez une nouvelle requête et collez le contenu de `supabase/migrations/001_initial_schema.sql`
3. Exécutez la requête (cliquez sur "Run")
4. Créez une autre requête et collez le contenu de `supabase/seed.sql`
5. Exécutez pour insérer les 6 posts de test

#### c) Récupérer les clés API

1. Allez dans **Settings** → **API**
2. Copiez :
   - **Project URL** (ex: `https://xxxxx.supabase.co`)
   - **anon public key**

### 3. Configurer les variables d'environnement

Créez un fichier `.env.local` à la racine du dossier `webapp/` :

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-cle-anon

# n8n Webhooks (placeholders pour MVP)
NEXT_PUBLIC_N8N_MODIFY_TEXT_URL=https://n8n.example.com/webhook/modify-text
NEXT_PUBLIC_N8N_MODIFY_IMAGE_URL=https://n8n.example.com/webhook/modify-image

# App Config
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Lancer le serveur de développement

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

### 5. Se connecter

Utilisez le code PIN : **2032**

---

## 📁 Structure du projet

```
webapp/
├── src/
│   ├── app/                    # Pages Next.js (App Router)
│   │   ├── layout.tsx          # Layout racine
│   │   ├── page.tsx            # Page de connexion (/)
│   │   ├── dashboard/          # Dashboard principal
│   │   └── calendar/           # Vue calendrier
│   ├── components/             # Composants React
│   │   ├── auth/               # Authentification (PinLogin)
│   │   ├── dashboard/          # Composants du dashboard
│   │   ├── detail/             # Modal de détail
│   │   ├── calendar/           # Composants calendrier
│   │   └── shared/             # Composants réutilisables
│   ├── lib/                    # Logique métier
│   │   ├── supabase/           # Client et requêtes Supabase
│   │   ├── scheduling/         # Planification automatique
│   │   ├── auth/               # Authentification PIN
│   │   └── webhooks/           # Webhooks n8n
│   ├── types/                  # Types TypeScript
│   └── styles/                 # Styles globaux
├── supabase/                   # Configuration Supabase
│   ├── migrations/             # Schéma de base de données
│   └── seed.sql                # Données de test
└── public/                     # Assets statiques
```

---

## 🎨 Design System

### Couleurs

```css
--color-orange-primary: #E94E1B;   /* Orange principal */
--color-orange-light: #FF6B3D;     /* Orange clair */
--color-green-accent: #A4C639;     /* Vert accent */
--color-white: #FFFFFF;            /* Blanc */
--color-gray-50 → 900: ...         /* Échelle de gris */
```

### Typographie

- **Police** : Poppins (Google Fonts)
- **Poids** : 400 (normal), 500 (medium), 600 (semibold), 700 (bold)

---

## 🔑 Authentification

L'authentification utilise un code PIN simple à 4 chiffres :

- **Code PIN** : `2032`
- **Stockage** : localStorage (token encodé)
- **Redirection** : Si déjà authentifié, redirige vers `/dashboard`

Pour se déconnecter, utilisez le bouton dans le header du dashboard.

---

## 🗄️ Base de données

### Table `posts`

| Champ | Type | Description |
|-------|------|-------------|
| `id` | UUID | Identifiant unique |
| `titre_interne` | TEXT | Titre interne pour identification |
| `categorie` | ENUM | Type de post (Educatif, Coulisses, etc.) |
| `hook` | TEXT | Accroche du post |
| `corps` | TEXT | Corps du post |
| `cta` | TEXT | Call-to-action |
| `hashtags` | TEXT[] | Liste de hashtags |
| `image_url` | TEXT | URL Cloudinary de l'image |
| `score_ia` | DECIMAL | Score IA (0-10) |
| `statut` | ENUM | Statut (a_valider, valide, publie, archive) |
| `date_publication_prevue` | TIMESTAMPTZ | Date de publication planifiée (UNIQUE) |

### Fonction `get_next_available_slot()`

Retourne le prochain créneau disponible :
- **Mardi 10h00** (Europe/Paris)
- **Jeudi 14h00** (Europe/Paris)

---

## 🚀 Commandes disponibles

```bash
# Développement
npm run dev              # Démarre le serveur de développement

# Production
npm run build            # Build de production
npm run start            # Démarre le serveur de production

# Utilitaires
npm run type-check       # Vérification TypeScript
npm run lint             # Lint du code
```

---

## 📝 Données de test

Le fichier `supabase/seed.sql` insère 6 posts de test :

1. **5 erreurs d'impression à éviter** (Educatif) - À valider
2. **Coulisses atelier nuit** (Coulisses) - À valider
3. **Tendance packaging 2025** (Actualite) - Validé
4. **Client restaurant success story** (Storytelling) - Validé
5. **Débat mat vs brillant** (Decale) - À valider
6. **Astuce carte de visite** (Educatif) - À valider

**Statistiques** :
- Total : 6 posts
- À valider : 4 posts
- Validés : 2 posts

---

## 🎯 Fonctionnalités principales

### ✅ Phase 1 : Foundation (Terminée)

- [x] Projet Next.js 14 avec TypeScript
- [x] Structure de dossiers complète
- [x] Configuration Supabase (migrations + seed)
- [x] Authentification PIN avec clavier numérique
- [x] Layout de base avec navigation
- [x] Composants partagés (Button, Logo, LoadingSpinner)

### 🚧 Phase 2 : Dashboard Core (En cours)

- [ ] Composants dashboard (PostCard, PostGrid, StatsBar)
- [ ] Filtres par statut (Tous / À valider / Validés)
- [ ] Modal de détail avec preview LinkedIn
- [ ] Actions de validation et modification

### 📅 Phases suivantes

- **Phase 3** : Flow de validation avec planification automatique
- **Phase 4** : Placeholders de modification (webhooks n8n)
- **Phase 5** : Vues calendrier (semaine et mois)
- **Phase 6** : Polish et optimisation mobile
- **Phase 7** : Déploiement Vercel

---

## 🔧 Développement

### Ajouter un nouveau composant

1. Créer le fichier dans `src/components/[categorie]/`
2. Utiliser TypeScript avec types explicites
3. Utiliser inline styles (CSS-in-JS)
4. S'assurer que le composant est responsive (mobile-first)

### Ajouter une nouvelle page

1. Créer un dossier dans `src/app/`
2. Ajouter un fichier `page.tsx`
3. Utiliser `'use client'` si le composant utilise des hooks

### Requêtes Supabase

Toutes les requêtes sont dans `src/lib/supabase/queries.ts`. Ajouter de nouvelles fonctions selon les besoins.

---

## 📱 Mobile-First

L'application est conçue **mobile-first** :

- Grilles responsive (`auto-fill`, `minmax`)
- Boutons touch-friendly (≥ 44px)
- Pas de scroll horizontal
- Modal plein écran sur mobile
- Performance optimisée (< 3 clics pour valider un post)

---

## 🐛 Dépannage

### Erreur : "Missing Supabase environment variables"

**Solution** : Vérifiez que votre fichier `.env.local` contient bien `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

### Erreur : "Cannot find module '@/...'

**Solution** : Vérifiez que `tsconfig.json` contient bien le path mapping `"@/*": ["./src/*"]`.

### Le PIN ne fonctionne pas

**Solution** : Le code PIN correct est **2032**. Vérifiez dans `src/lib/auth/pin-auth.ts`.

### Les posts ne s'affichent pas

**Solution** : Vérifiez que vous avez bien exécuté les migrations et le seed dans Supabase.

---

## 📄 Licence

Ce projet est privé et propriétaire de Rapid Pub.

---

## 👤 Contact

Pour toute question, contactez l'équipe de développement Rapid Pub.

---

**Bon développement ! 🚀**
