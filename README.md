# 🖨️ Rapid-Pub - Dashboard de gestion pour imprimerie

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38B2AC?style=for-the-badge&logo=tailwind-css)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-336791?style=for-the-badge&logo=postgresql)

**Application complète de gestion pour imprimerie : devis, commandes, factures, clients et production.**

[Démo](#-démonstration) • [Fonctionnalités](#-fonctionnalités) • [Installation](#-installation) • [Technologies](#-stack-technique)

</div>

---

## 📋 À propos

Rapid-Pub est un dashboard de gestion conçu pour les imprimeries et entreprises de communication visuelle. Il permet de gérer l'ensemble du cycle de vente : de la demande client jusqu'à la facturation, en passant par la production.

### Le problème résolu

Les imprimeries gèrent souvent leurs devis sur Excel, leurs commandes sur papier, et perdent du temps à relancer manuellement les clients. Rapid-Pub centralise tout dans une interface moderne et automatise les tâches répétitives.

---

## ✨ Fonctionnalités

### 🎯 Gestion commerciale
- **Analyse IA des demandes** : Collez un email client, l'IA extrait automatiquement les informations (produit, quantité, format, finitions)
- **Génération de devis PDF** : Documents professionnels avec logo, conditions, TVA
- **Suivi des relances** : Compteur de relances et alertes pour les devis sans réponse
- **Envoi email intégré** : Envoyez vos devis directement depuis l'application

### 📊 Dashboard intelligent
- **Vue Kanban** : Visualisez vos devis et commandes par statut
- **Graphiques temps réel** : CA mensuel, taux de conversion, top clients
- **Alertes intelligentes** : Notifications pour les actions urgentes
- **Recherche globale** : Trouvez n'importe quoi en tapant ⌘K

### 📦 Gestion de production
- **Calendrier de production** : Vue mensuelle des livraisons prévues
- **Suivi des commandes** : Nouvelle → En production → Prêt → Livré
- **Génération automatique** : Devis accepté = Commande créée automatiquement

### 💰 Facturation
- **Création automatique** : Commande livrée = Facture générée
- **Suivi des paiements** : Émise, Payée, En retard
- **Calcul TVA automatique** : Configurable dans les paramètres

### ⚙️ Configuration
- **Grille tarifaire** : Définissez vos prix par produit et quantité
- **Informations entreprise** : SIRET, TVA, IBAN pour les documents
- **Paramètres email** : Signature et expéditeur personnalisables

---

## 🖼️ Aperçu

```
┌────────────────────────────────────────────────────────────────┐
│  🟠 Rapid-Pub                    🔍 Rechercher... (⌘K)    🔔   │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│  │ À traiter│ │ Envoyés  │ │ En prod. │ │ CA mois  │          │
│  │    3     │ │    5     │ │    2     │ │  2 450€  │          │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘          │
│                                                                │
│  ┌─────────────┬─────────────┬─────────────┬─────────────┐    │
│  │ À TRAITER   │ DEVIS ENVOY │ PRODUCTION  │ TERMINÉ     │    │
│  ├─────────────┼─────────────┼─────────────┼─────────────┤    │
│  │ DEV-2026-01 │ DEV-2026-03 │ CMD-2026-01 │ CMD-2025-98 │    │
│  │ Dupont SARL │ Martin & Co │ Leroy Dist. │ Dupont SARL │    │
│  │ 156€        │ 133€  J+5   │ 350€        │ 280€        │    │
│  └─────────────┴─────────────┴─────────────┴─────────────┘    │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Stack technique

| Catégorie | Technologie |
|-----------|-------------|
| **Framework** | Next.js 15 (App Router) |
| **Langage** | TypeScript |
| **Style** | Tailwind CSS |
| **Base de données** | PostgreSQL (Neon) |
| **Graphiques** | Recharts |
| **IA** | Claude API (Anthropic) |
| **Icônes** | Lucide React |

### Architecture

```
rapid-pub/
├── app/
│   ├── api/           # 13 routes API REST
│   ├── devis/         # Pages devis
│   ├── commandes/     # Pages commandes
│   ├── clients/       # Pages clients
│   ├── factures/      # Pages factures
│   ├── calendrier/    # Planning production
│   └── parametres/    # Configuration
├── components/
│   ├── ui/            # Composants réutilisables
│   ├── layout/        # Sidebar, Header
│   └── dashboard/     # Kanban, Charts
├── lib/
│   ├── db.ts          # Connexion PostgreSQL
│   └── utils.ts       # Fonctions utilitaires
└── scripts/
    └── init-db.sql    # Script initialisation BDD
```

---

## 📡 API Routes

| Route | Méthodes | Description |
|-------|----------|-------------|
| `/api/dashboard` | GET | Données Kanban |
| `/api/clients` | GET, POST | Liste et création clients |
| `/api/devis` | GET, POST | Liste et création devis |
| `/api/devis/[id]` | GET, PATCH, DELETE | Détail et modification devis |
| `/api/commandes` | GET | Liste commandes |
| `/api/commandes/[id]` | GET, PATCH | Détail et modification commande |
| `/api/factures` | GET | Liste factures |
| `/api/factures/[id]` | PATCH | Marquer facture payée |
| `/api/stats` | GET | Statistiques pour graphiques |
| `/api/alertes` | GET | Alertes intelligentes |
| `/api/search` | GET | Recherche globale |
| `/api/calendrier` | GET | Planning production |
| `/api/email` | POST | Envoi email |
| `/api/pdf/[type]/[id]` | GET | Génération PDF |
| `/api/ai/analyze` | POST | Analyse IA demande client |
| `/api/parametres` | GET, POST | Configuration |

---

## 🔄 Workflow métier

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   DEMANDE   │────▶│    DEVIS    │────▶│  COMMANDE   │────▶│   FACTURE   │
│   CLIENT    │     │  Brouillon  │     │  Nouvelle   │     │   Émise     │
└─────────────┘     │  → Envoyé   │     │  → En prod  │     │   → Payée   │
                    │  → Accepté  │     │  → Prêt     │     └─────────────┘
                    └─────────────┘     │  → Livré    │
                           │            └─────────────┘
                           │                   │
                           └───── AUTO ────────┘
                         (Commande créée       (Facture créée
                          automatiquement)      automatiquement)
```

---

## 🎯 Roadmap

- [ ] **Portail client** - Validation devis en ligne avec signature électronique
- [ ] **Calcul auto des prix** - L'IA calcule le prix selon la grille tarifaire
- [ ] **Planning Gantt** - Vue avancée de la production par poste de travail
- [ ] **Export comptable** - Génération CSV/Excel pour le comptable
- [ ] **Notifications SMS** - "Votre commande est prête à récupérer"
- [ ] **Gestion des stocks** - Alertes quand un papier est bientôt épuisé
- [ ] **Application mobile** - Gestion depuis le téléphone

---

## 📊 Données de démonstration

Le script `init-db.sql` inclut des données de test :

- **5 clients** (Dupont SARL, Martin & Co, Garcia Industries...)
- **7 devis** (2 brouillons, 3 envoyés, 2 acceptés)
- **7 commandes** (nouvelles, en production, prêtes, livrées)
- **5 factures** (émises, payées, en retard)
- **32 paramètres** (grille tarifaire, infos entreprise...)

---

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.

1. Fork le projet
2. Créez votre branche (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Committez vos changements (`git commit -m 'Ajout nouvelle fonctionnalité'`)
4. Push sur la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. Ouvrez une Pull Request

---

## 📄 Licence

MIT © [Gralt](https://gralt.fr)

---

<div align="center">

**Développé avec ❤️ par [Gralt](https://gralt.fr)**

*Automatisation IA & Process pour PME*

[Site web](https://gralt.fr) • [LinkedIn](https://linkedin.com/in/votre-profil)

</div>
