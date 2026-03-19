# 📝 PROMPT - Interface de gestion Rapid Pub LinkedIn

## CONTEXTE
Créer une interface web de gestion de posts LinkedIn pour Rapid Pub, une imprimerie en ligne B2B française avec livraison en 24h.

## UTILISATEUR
- Client unique (propriétaire de Rapid Pub)
- Peu de temps disponible, doit valider rapidement (< 30 secondes pour 2 posts)
- Utilise sur mobile ET desktop

## AUTHENTIFICATION
- Code PIN simple : "2032"
- Pas de système de compte complexe

## BASE DE DONNÉES
- Supabase (PostgreSQL)
- Table principale : posts (id, titre_interne, categorie, hook, corps, cta, hashtags, image_url, score_ia, statut, date_publication_prevue)

## FONCTIONNALITÉS PRINCIPALES

### 1. ÉCRAN DE CONNEXION
- Pavé numérique pour entrer le code PIN (4 chiffres)
- Design épuré, logo Rapid Pub
- Animation de shake si code incorrect

### 2. DASHBOARD PRINCIPAL
- Stats en haut : Total posts (6), À valider, Validés
- Grille de cards avec image + titre + statut + score IA
- Filtres : Tous / À valider / Validés
- Clic sur une card = ouvre le détail

### 3. VUE DÉTAIL D'UN POST (Modal)
- Preview LinkedIn réaliste (avatar, nom entreprise, contenu, image, boutons like/comment/share)
- 3 actions uniquement :
  * ✓ Valider → planifie automatiquement au prochain créneau libre
  * ✏️ Modifier le texte → champ prompt libre → webhook n8n
  * 🖼️ Modifier l'image → champ prompt libre → webhook n8n
- Affiche la date de publication si déjà planifié

### 4. CALENDRIER (2 vues)
- **Vue semaine** : 7 jours avec miniatures des posts planifiés, navigation sem. préc/suiv
- **Vue mois** : Grille mensuelle avec indicateurs de posts, navigation mois préc/suiv
- Toggle pour switcher entre les deux vues
- Liste "Prochaines publications" en dessous

### 5. PLANIFICATION AUTOMATIQUE INTELLIGENTE
- Créneaux fixes : **Mardi 10h** + **Jeudi 14h**
- Quand un post est validé :
  1. Cherche le prochain créneau libre (Mardi ou Jeudi)
  2. Si cette semaine est complète → passe à la semaine suivante
  3. Les créneaux se remplissent chronologiquement
- Aucune date ne peut être en double

## DESIGN

### Couleurs
- Orange principal : #E94E1B
- Orange clair : #FF6B3D
- Vert accent : #A4C639
- Blanc : #FFFFFF
- Gris : #F9FAFB → #111827 (échelle complète)

### Style
- Minimaliste, intuitif
- Compréhensible d'un coup d'œil
- Pas de features inutiles
- Cards avec hover effect (translateY + shadow)
- Boutons avec feedback visuel

### Typographie
- Police : Poppins (Google Fonts)
- Poids : 400, 500, 600, 700

### Responsive
- Mobile-first obligatoire
- Grilles adaptatives (auto-fill, minmax)
- Touch-friendly (boutons assez grands)

## WEBHOOKS N8N
```javascript
// Modifier texte
POST https://n8n.example.com/webhook/modify-text
{
  "post_id": "uuid",
  "prompt": "Rends le hook plus punchy",
  "type": "text"
}

// Modifier image
POST https://n8n.example.com/webhook/modify-image
{
  "post_id": "uuid", 
  "prompt": "Ajoute plus d'orange",
  "type": "image"
}
```

## STACK TECHNIQUE
- React / Next.js
- Supabase pour la BDD
- Déploiement Vercel
- CSS-in-JS (inline styles)

## CONTRAINTES
- Interface ultra rapide à utiliser
- Maximum 3 clics pour valider un post
- Pas de scroll horizontal sur mobile
- Feedback visuel sur toutes les actions
- 6 posts générés par semaine (pas 10)

## DONNÉES DE TEST (6 posts)
1. "5 erreurs d'impression à éviter" - Educatif - Score 8.5
2. "Coulisses atelier nuit" - Coulisses - Score 7.8
3. "Tendance packaging 2025" - Actualite - Score 8.2 (déjà validé)
4. "Client restaurant success story" - Storytelling - Score 9.1 (déjà validé)
5. "Débat mat vs brillant" - Decale - Score 8.7
6. "Astuce carte de visite" - Educatif - Score 8.9
