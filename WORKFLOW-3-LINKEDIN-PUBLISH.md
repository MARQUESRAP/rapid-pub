# 📤 WORKFLOW 3 — Publication Automatique LinkedIn

## Objectif
Publier automatiquement les posts validés sur la Page Entreprise LinkedIn de Rapid Pub aux créneaux planifiés (Mardi 10h, Jeudi 14h), avec notification email + in-app, et retry automatique en cas d'erreur.

---

## Prérequis

### App LinkedIn Developer
Le client a déjà créé une app sur [LinkedIn Developer Portal](https://www.linkedin.com/developers/) avec :
- **Client ID**
- **Client Secret**
- **Access Token** (avec les scopes nécessaires)

### Scopes requis
- `w_organization_social` — Publier sur une Page Entreprise
- `r_organization_social` — Lire les posts de la Page
- `rw_organization_admin` — Admin de la Page (pour upload media)

### ID de la Page Entreprise
- Format : `urn:li:organization:XXXXXXXX`
- Récupérable via l'API LinkedIn ou dans l'URL de la page

---

## Déclencheur

**Cron Trigger** — 2 schedules

| Schedule | Expression Cron | Heure |
|----------|-----------------|-------|
| Mardi 10h | `0 10 * * 2` | Mardi à 10:00 |
| Jeudi 14h | `0 14 * * 4` | Jeudi à 14:00 |

> Note : Ajuster le timezone dans n8n (Europe/Paris)

---

## Architecture du workflow

```
[Cron Trigger]
    → [Get Posts to Publish from Supabase]
    → [IF Posts Found]
        → [Loop: For Each Post]
            → [Download Image]
            → [Upload Image to LinkedIn]
            → [Create LinkedIn Post]
            → [Update Post Status in Supabase]
            → [Send Email Notification]
            → [Log Success]
        → [END Loop]
    → [ELSE: No Posts]
        → [Log: Nothing to publish]
```

### Branche Erreur
```
[Error Trigger]
    → [Schedule Retry in 1h]
    → [Send Error Notification (Email + Supabase)]
    → [Log Error]
```

---

## Étapes détaillées

### 1. Cron Trigger

| Paramètre | Valeur |
|-----------|--------|
| Mode | Cron |
| Cron Expression 1 | `0 10 * * 2` (Mardi 10h) |
| Cron Expression 2 | `0 14 * * 4` (Jeudi 14h) |
| Timezone | `Europe/Paris` |

---

### 2. Get Posts to Publish (Supabase)

| Paramètre | Valeur |
|-----------|--------|
| Operation | Select |
| Table | `posts` |
| Filters | `statut = 'Planifie'` AND `date_publication_prevue <= NOW()` |
| Order | `date_publication_prevue ASC` |
| Limit | 10 |

**Filter expression dans Supabase node :**
```
statut.eq.Planifie,date_publication_prevue.lte.{{ $now.toISO() }}
```

---

### 3. IF Posts Found (IF Node)

| Condition | Value |
|-----------|-------|
| Check | `{{ $json.length > 0 }}` |

- **True** → Continue vers Loop
- **False** → Log "Nothing to publish"

---

### 4. Loop Each Post (Loop Over Items)

Boucle sur chaque post retourné par Supabase.

---

### 5. Prepare Post Data (Code Node)

**Langage** : JavaScript

```javascript
const post = $input.first().json;

// Construire le contenu du post LinkedIn
const content = `${post.hook}

${post.corps}

${post.cta}

${post.hashtags}`;

return {
  json: {
    post_id: post.id,
    content: content,
    image_url: post.image_url,
    titre: post.titre_interne,
    // LinkedIn Organization URN (à remplacer par la vraie valeur)
    organization_urn: 'urn:li:organization:XXXXXXXX'
  }
};
```

---

### 6. Download Image (HTTP Request)

| Paramètre | Valeur |
|-----------|--------|
| Method | GET |
| URL | `{{ $json.image_url }}` |
| Response Format | File |

---

### 7. Register Image Upload to LinkedIn (HTTP Request)

Première étape : Enregistrer l'upload auprès de LinkedIn.

| Paramètre | Valeur |
|-----------|--------|
| Method | POST |
| URL | `https://api.linkedin.com/v2/assets?action=registerUpload` |

#### Headers :

| Header | Value |
|--------|-------|
| `Authorization` | `Bearer {{ $credentials.linkedInOAuth2Api.accessToken }}` |
| `Content-Type` | `application/json` |
| `X-Restli-Protocol-Version` | `2.0.0` |

#### Body :

```json
{
  "registerUploadRequest": {
    "recipes": ["urn:li:digitalmediaRecipe:feedshare-image"],
    "owner": "{{ $('Prepare Post Data').first().json.organization_urn }}",
    "serviceRelationships": [
      {
        "relationshipType": "OWNER",
        "identifier": "urn:li:userGeneratedContent"
      }
    ]
  }
}
```

#### Réponse attendue :

```json
{
  "value": {
    "uploadMechanism": {
      "com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest": {
        "uploadUrl": "https://api.linkedin.com/mediaUpload/..."
      }
    },
    "asset": "urn:li:digitalmediaAsset:XXXXXXXXX"
  }
}
```

---

### 8. Upload Image Binary to LinkedIn (HTTP Request)

| Paramètre | Valeur |
|-----------|--------|
| Method | PUT |
| URL | `{{ $json.value.uploadMechanism['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'].uploadUrl }}` |

#### Headers :

| Header | Value |
|--------|-------|
| `Authorization` | `Bearer {{ $credentials.linkedInOAuth2Api.accessToken }}` |

#### Body :

| Paramètre | Valeur |
|-----------|--------|
| Body Content Type | Binary |
| Input Data Field Name | `data` (du node Download Image) |

---

### 9. Create LinkedIn Post (HTTP Request)

| Paramètre | Valeur |
|-----------|--------|
| Method | POST |
| URL | `https://api.linkedin.com/v2/posts` |

#### Headers :

| Header | Value |
|--------|-------|
| `Authorization` | `Bearer {{ $credentials.linkedInOAuth2Api.accessToken }}` |
| `Content-Type` | `application/json` |
| `X-Restli-Protocol-Version` | `2.0.0` |

#### Body :

```json
{
  "author": "{{ $('Prepare Post Data').first().json.organization_urn }}",
  "lifecycleState": "PUBLISHED",
  "visibility": "PUBLIC",
  "distribution": {
    "feedDistribution": "MAIN_FEED",
    "targetEntities": [],
    "thirdPartyDistributionChannels": []
  },
  "content": {
    "media": {
      "id": "{{ $('Register Image Upload').first().json.value.asset }}"
    }
  },
  "commentary": "{{ $('Prepare Post Data').first().json.content }}"
}
```

#### Réponse attendue :

```json
{
  "id": "urn:li:share:XXXXXXXXX"
}
```

---

### 10. Update Post in Supabase

| Paramètre | Valeur |
|-----------|--------|
| Operation | Update |
| Table | `posts` |
| Filter | `id = {{ $('Prepare Post Data').first().json.post_id }}` |

**Fields :**

| Champ | Valeur |
|-------|--------|
| `statut` | `Publie` |
| `date_publication_reelle` | `{{ $now.toISO() }}` |
| `lien_post_linkedin` | `https://www.linkedin.com/feed/update/{{ $json.id }}` |
| `updated_at` | `{{ $now.toISO() }}` |

---

### 11. Send Email Notification (Send Email Node ou HTTP Request)

**Option A : Node Email natif n8n**

| Paramètre | Valeur |
|-----------|--------|
| To | `client@rapidpub.fr` |
| Subject | `✅ Post LinkedIn publié : {{ $('Prepare Post Data').first().json.titre }}` |

**Body HTML :**

```html
<h2>🎉 Post LinkedIn publié avec succès !</h2>

<p><strong>Titre :</strong> {{ $('Prepare Post Data').first().json.titre }}</p>
<p><strong>Date :</strong> {{ $now.format('DD/MM/YYYY HH:mm') }}</p>

<p>
  <a href="https://www.linkedin.com/feed/update/{{ $json.id }}" 
     style="background: #E94E1B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">
    Voir le post sur LinkedIn
  </a>
</p>

<hr>
<p style="color: #666; font-size: 12px;">
  Rapid Pub - Gestionnaire de posts LinkedIn
</p>
```

**Option B : Via API (SendGrid, Resend, etc.)**

---

### 12. Log Success (Supabase Insert)

| Paramètre | Valeur |
|-----------|--------|
| Operation | Insert |
| Table | `workflow_logs` |

**Fields :**

| Champ | Valeur |
|-------|--------|
| `date_execution` | `{{ $now.toISO() }}` |
| `statut` | `Succes` |
| `posts_generes` | `1` |
| `erreurs` | `null` |

---

## Gestion des erreurs

### Error Trigger

Capture les erreurs de n'importe quel node du workflow.

---

### Schedule Retry (Wait Node)

| Paramètre | Valeur |
|-----------|--------|
| Wait | 1 hour |

Après le Wait, relancer le workflow pour ce post spécifique.

**Alternative** : Utiliser un **Workflow séparé de retry** déclenché par webhook.

---

### Send Error Email

| Paramètre | Valeur |
|-----------|--------|
| To | `client@rapidpub.fr` |
| Subject | `⚠️ Erreur publication LinkedIn : {{ $('Prepare Post Data').first().json.titre }}` |

**Body HTML :**

```html
<h2>⚠️ Erreur lors de la publication</h2>

<p><strong>Post :</strong> {{ $('Prepare Post Data').first().json.titre }}</p>
<p><strong>Erreur :</strong> {{ $json.message }}</p>

<p>Une nouvelle tentative sera effectuée dans 1 heure.</p>

<hr>
<p style="color: #666; font-size: 12px;">
  Si l'erreur persiste, vérifiez les credentials LinkedIn dans n8n.
</p>
```

---

### Update Post Status on Error (Supabase)

| Champ | Valeur |
|-------|--------|
| `statut` | `Erreur_Publication` |

---

### Log Error (Supabase Insert)

| Champ | Valeur |
|-------|--------|
| `date_execution` | `{{ $now.toISO() }}` |
| `statut` | `Erreur` |
| `erreurs` | `{{ $json.message }}` |

---

## Mise à jour Supabase

Ajoute les nouveaux statuts et champs :

```sql
-- Mettre à jour la contrainte de statut
ALTER TABLE posts 
DROP CONSTRAINT IF EXISTS posts_statut_check;

ALTER TABLE posts 
ADD CONSTRAINT posts_statut_check 
CHECK (statut IN (
  'A_Valider', 
  'Valide', 
  'Modification_En_Cours', 
  'Rejete', 
  'Planifie', 
  'Publie',
  'Erreur_Publication'
));

-- S'assurer que les colonnes de publication existent
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS date_publication_reelle TIMESTAMPTZ;

ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS lien_post_linkedin TEXT;
```

---

## Configuration LinkedIn OAuth2 dans n8n

### 1. Créer le credential

1. **Settings** → **Credentials** → **Add Credential**
2. Type : **LinkedIn OAuth2 API**
3. Remplir :
   - Client ID : `(depuis LinkedIn Developer)`
   - Client Secret : `(depuis LinkedIn Developer)`
4. Cliquer sur **Connect** pour authentifier

### 2. Scopes à autoriser

Lors de l'autorisation, s'assurer que ces scopes sont inclus :
- `w_organization_social`
- `r_organization_social`
- `rw_organization_admin`

### 3. Trouver l'Organization URN

**Via l'API LinkedIn :**

```bash
curl -X GET "https://api.linkedin.com/v2/organizationalEntityAcls?q=roleAssignee&role=ADMINISTRATOR" \
  -H "Authorization: Bearer ACCESS_TOKEN"
```

**Ou dans l'URL de la page LinkedIn :**
`https://www.linkedin.com/company/XXXXX/` → L'ID est dans l'URL admin

---

## Variables d'environnement n8n

| Variable | Description |
|----------|-------------|
| `LINKEDIN_ORG_URN` | `urn:li:organization:XXXXXXXX` |
| `NOTIFICATION_EMAIL` | `client@rapidpub.fr` |
| `TIMEZONE` | `Europe/Paris` |

---

## Résumé des endpoints LinkedIn API

| Action | Method | Endpoint |
|--------|--------|----------|
| Register image upload | POST | `/v2/assets?action=registerUpload` |
| Upload image binary | PUT | `(URL from register response)` |
| Create post | POST | `/v2/posts` |

---

## Coûts estimés

| Élément | Coût |
|---------|------|
| LinkedIn API | **Gratuit** |
| Email (SendGrid free tier) | **Gratuit** (100/jour) |
| n8n executions | Inclus |
| **Total** | **$0/mois** |

---

## Fréquence d'exécution

| Jour | Heure | Action |
|------|-------|--------|
| Mardi | 10:00 | Check & Publish |
| Jeudi | 14:00 | Check & Publish |

**Posts publiés/semaine** : 2 maximum
**Posts publiés/mois** : 8 maximum

---

## Flux complet

```
1. Cron déclenche le workflow (Mar 10h ou Jeu 14h)
2. Récupère les posts avec statut "Planifie" et date <= maintenant
3. Pour chaque post :
   a. Télécharge l'image depuis Cloudinary
   b. Enregistre l'upload sur LinkedIn
   c. Upload l'image binaire
   d. Crée le post avec texte + image
   e. Met à jour Supabase (statut = Publie, lien LinkedIn)
   f. Envoie email de confirmation
   g. Log le succès
4. Si erreur :
   a. Notifie par email
   b. Met à jour Supabase (statut = Erreur_Publication)
   c. Schedule retry dans 1h
```

---

## Statuts du cycle de vie d'un post

```
A_Valider (généré par workflow)
    ↓
Modification_En_Cours (optionnel)
    ↓
A_Valider (après modification)
    ↓
Valide (validé par client → auto-planifié)
    ↓
Planifie (date de publication assignée)
    ↓
Publie (publié sur LinkedIn) ← SUCCÈS
    ou
Erreur_Publication ← ÉCHEC (retry 1h après)
```

---

## Test du workflow

### Test manuel

1. Créer un post de test dans Supabase avec :
   - `statut` = `Planifie`
   - `date_publication_prevue` = maintenant ou passé
2. Exécuter le workflow manuellement
3. Vérifier :
   - Post publié sur LinkedIn
   - Statut mis à jour dans Supabase
   - Email reçu
   - Log créé

### Vérification LinkedIn

Après publication, le post devrait apparaître sur :
`https://www.linkedin.com/company/rapid-pub/posts/`
