# Guide de Test - Rapid Pub LinkedIn Manager

## 🧪 Tests Phase 3 : Flow de validation

### Tests de validation de base

#### Test 1 : Validation simple d'un post
**Objectif** : Vérifier que la validation fonctionne correctement

**Étapes** :
1. Se connecter avec PIN `2032`
2. Cliquer sur un post "À valider"
3. Cliquer sur le bouton "✓ Valider"
4. Observer le comportement

**Résultat attendu** :
- Toast "Validation en cours..." s'affiche immédiatement
- Après 1-2 secondes : Toast de succès avec date planifiée
- Le modal se ferme après 500ms
- Le post passe à "Validé"
- Les stats sont mises à jour (À valider -1, Validés +1)
- La date de publication est affichée

**Vérifications Supabase** :
```sql
SELECT titre_interne, statut, date_publication_prevue, validated_at
FROM posts
ORDER BY validated_at DESC;
```

---

#### Test 2 : Validation avec rechargement de données
**Objectif** : S'assurer que les données sont bien rafraîchies

**Étapes** :
1. Noter le nombre de posts "À valider" (stats bar)
2. Valider un post
3. Revenir au dashboard
4. Vérifier les stats

**Résultat attendu** :
- Stats mises à jour correctement
- Le post validé n'apparaît plus dans "À valider"
- Le post apparaît dans "Validés"
- Le badge sur le post affiche "Validé"

---

#### Test 3 : Double validation (déjà validé)
**Objectif** : Vérifier qu'on ne peut pas valider deux fois

**Étapes** :
1. Cliquer sur un post déjà "Validé"
2. Cliquer sur le bouton "✓ Déjà validé"

**Résultat attendu** :
- Le bouton est désactivé (grisé)
- Toast "Ce post est déjà validé" s'affiche
- Aucune requête Supabase n'est envoyée

---

### Tests de planification automatique

#### Test 4 : Planification Mardi 10h
**Objectif** : Vérifier que le prochain Mardi est bien choisi

**Étapes** :
1. Vider toutes les dates de publication (SQL) :
   ```sql
   UPDATE posts SET statut = 'a_valider', date_publication_prevue = NULL, validated_at = NULL;
   ```
2. Valider le premier post
3. Vérifier la date planifiée

**Résultat attendu** :
- Date de publication = prochain Mardi à 10h00 (Europe/Paris)
- Format : "mardi 11 février 2026 à 10h00"

---

#### Test 5 : Planification Jeudi 14h (après Mardi)
**Objectif** : Vérifier l'alternance Mardi/Jeudi

**Étapes** :
1. Avoir un post déjà planifié le Mardi
2. Valider un second post
3. Vérifier la date planifiée

**Résultat attendu** :
- Date de publication = Jeudi même semaine à 14h00
- Pas de conflit de dates

---

#### Test 6 : Planification semaine suivante
**Objectif** : Vérifier le passage à la semaine suivante

**Étapes** :
1. Avoir 2 posts planifiés (Mardi + Jeudi de cette semaine)
2. Valider un troisième post
3. Vérifier la date planifiée

**Résultat attendu** :
- Date de publication = Mardi de la semaine suivante à 10h00
- Constraint UNIQUE empêche les doublons

---

### Tests de cas limites

#### Test 7 : Erreur de connexion Supabase
**Objectif** : Tester la gestion d'erreur réseau

**Simulation** :
1. Désactiver temporairement le réseau (mode avion)
2. Tenter de valider un post

**Résultat attendu** :
- Toast d'erreur : "Erreur lors de la validation du post"
- Le post reste "À valider"
- Aucune modification en base

---

#### Test 8 : Validation simultanée (race condition)
**Objectif** : Vérifier que les constraints fonctionnent

**Étapes** :
1. Ouvrir 2 onglets du dashboard
2. Cliquer sur "Valider" dans les deux onglets en même temps
3. Observer le comportement

**Résultat attendu** :
- Un seul post est validé
- L'autre reçoit une erreur de conflit
- Les dates restent uniques (UNIQUE constraint)

---

#### Test 9 : 52 semaines complètes (cas extrême)
**Objectif** : Tester le fallback après 52 semaines

**Simulation** :
```sql
-- Remplir les 52 prochaines semaines (104 créneaux)
-- Script SQL pour créer des posts sur tous les créneaux
```

**Résultat attendu** :
- La fonction retourne un Mardi dans 1 an
- Pas d'erreur
- Toast affiche la date lointaine

---

### Tests d'UX et performance

#### Test 10 : Temps de validation (< 3 clics)
**Objectif** : Vérifier la rapidité du flow

**Mesure** :
1. Chronomètre démarré à l'ouverture du dashboard
2. Clic sur post → Clic sur Valider
3. Chronomètre arrêté à la fermeture du modal

**Résultat attendu** :
- **< 5 secondes** pour valider un post
- **Exactement 2 clics** (post + valider)

---

#### Test 11 : Feedback visuel immédiat
**Objectif** : S'assurer que l'UI réagit instantanément

**Observation** :
- Au clic sur "Valider", le bouton affiche un spinner immédiatement
- Toast "Validation en cours..." apparaît en < 100ms
- Pas de freeze de l'interface

---

#### Test 12 : Responsive mobile
**Objectif** : Tester sur mobile réel

**Device** : iPhone ou Android réel (pas juste DevTools)

**Tests** :
- Modal s'affiche plein écran
- Boutons facilement tapables (≥ 44px)
- Pas de scroll horizontal
- Animations fluides (60fps)

---

### Tests de modification (placeholders)

#### Test 13 : Modifier le texte
**Objectif** : Vérifier les placeholders webhooks

**Étapes** :
1. Cliquer sur "✏️ Modifier le texte"
2. Entrer un prompt : "Rends le hook plus punchy"
3. Cliquer "Envoyer"

**Résultat attendu** :
- Spinner sur le bouton
- Console.log dans DevTools avec le payload
- Toast "Webhook will be integrated with n8n in next version"
- Prompt se vide après envoi

---

#### Test 14 : Modifier l'image
**Objectif** : Même test pour l'image

**Étapes** :
1. Cliquer sur "🖼️ Modifier l'image"
2. Entrer un prompt : "Ajoute plus d'orange"
3. Cliquer "Envoyer"

**Résultat attendu** :
- Même comportement que Test 13
- Payload type = "image" dans console

---

### Tests de filtrage

#### Test 15 : Filtrage par statut
**Objectif** : Vérifier que les filtres fonctionnent

**Étapes** :
1. Cliquer sur "Tous" → voir 6 posts
2. Cliquer sur "À valider" → voir 4 posts
3. Cliquer sur "Validés" → voir 2 posts
4. Valider un post
5. Vérifier que les compteurs sont mis à jour

**Résultat attendu** :
- Filtres affichent le bon nombre
- Compteurs se mettent à jour après validation

---

### Tests de date et timezone

#### Test 16 : Timezone Europe/Paris
**Objectif** : S'assurer que les dates sont correctes

**Vérification** :
```sql
SELECT
  titre_interne,
  date_publication_prevue,
  date_publication_prevue AT TIME ZONE 'Europe/Paris' as paris_time
FROM posts
WHERE date_publication_prevue IS NOT NULL;
```

**Résultat attendu** :
- Heures affichées = 10h ou 14h en heure de Paris
- Jours = Mardi ou Jeudi

---

## 📊 Checklist complète

### Validation de base
- [ ] Test 1 : Validation simple
- [ ] Test 2 : Rechargement des données
- [ ] Test 3 : Double validation bloquée

### Planification
- [ ] Test 4 : Mardi 10h
- [ ] Test 5 : Jeudi 14h
- [ ] Test 6 : Semaine suivante

### Cas limites
- [ ] Test 7 : Erreur réseau
- [ ] Test 8 : Race condition
- [ ] Test 9 : 52 semaines pleines

### UX/Performance
- [ ] Test 10 : < 5 secondes, 2 clics
- [ ] Test 11 : Feedback immédiat
- [ ] Test 12 : Mobile responsive

### Modifications
- [ ] Test 13 : Modifier texte
- [ ] Test 14 : Modifier image

### Filtrage
- [ ] Test 15 : Filtres fonctionnels

### Timezone
- [ ] Test 16 : Europe/Paris correct

---

## 🐛 Bugs connus à tester

### Bug potentiel 1 : Décalage horaire
**Symptôme** : Les heures affichées ne correspondent pas à l'heure de Paris
**Solution** : Vérifier la fonction `get_next_available_slot()` dans Supabase

### Bug potentiel 2 : Modal ne se ferme pas
**Symptôme** : Le modal reste ouvert après validation
**Solution** : Vérifier le setTimeout dans ActionButtons

### Bug potentiel 3 : Stats pas à jour
**Symptôme** : Les compteurs ne se mettent pas à jour
**Solution** : Vérifier que `loadData()` est bien appelé après validation

---

## 🔧 Outils de debug

### Console commands
```javascript
// Afficher tous les posts
console.table(posts)

// Vérifier l'état
console.log({
  posts,
  stats,
  activeFilter,
  selectedPost,
  isModalOpen
})

// Forcer un rechargement
loadData()
```

### SQL queries utiles
```sql
-- Reset tous les posts
UPDATE posts SET statut = 'a_valider', date_publication_prevue = NULL, validated_at = NULL;

-- Voir les posts validés
SELECT * FROM posts WHERE statut = 'valide' ORDER BY date_publication_prevue;

-- Trouver les conflits de dates
SELECT date_publication_prevue, COUNT(*)
FROM posts
WHERE date_publication_prevue IS NOT NULL
GROUP BY date_publication_prevue
HAVING COUNT(*) > 1;

-- Tester la fonction de slot
SELECT get_next_available_slot();
```

---

## ✅ Critères de succès Phase 3

Pour considérer la Phase 3 comme réussie, tous ces critères doivent être remplis :

1. ✅ **Validation fonctionnelle** : Les posts sont validés et planifiés correctement
2. ✅ **Mise à jour optimiste** : L'UI réagit immédiatement
3. ✅ **Gestion des erreurs** : Les erreurs sont catchées et affichées
4. ✅ **Feedback utilisateur** : Toast affiche les étapes
5. ✅ **Planification correcte** : Mardi 10h / Jeudi 14h alternés
6. ✅ **Pas de doublons** : Constraint UNIQUE empêche les conflits
7. ✅ **Performance** : < 5 secondes, < 3 clics
8. ✅ **Mobile-friendly** : Tout fonctionne sur mobile réel
9. ✅ **Stats à jour** : Les compteurs se mettent à jour en temps réel
10. ✅ **Dates correctes** : Timezone Europe/Paris respectée

---

## 📝 Rapport de test

Utilisez ce template pour reporter vos résultats :

```markdown
## Test Report - Phase 3

**Date** : ___________
**Testeur** : ___________
**Environment** : Development / Production

### Tests réussis
- [ ] Test 1
- [ ] Test 2
...

### Tests échoués
- [ ] Test X : Raison de l'échec

### Bugs découverts
1. **Bug description** : ...
   **Sévérité** : Critique / Majeur / Mineur
   **Steps to reproduce** : ...

### Recommandations
- ...

### Conclusion
Phase 3 prête pour production : Oui / Non
```

---

**Bon test ! 🧪**
