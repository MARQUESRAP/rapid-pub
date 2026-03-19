# 🔧 Corrections à Apporter au Workflow 2a - Modify Image

Ce document liste toutes les corrections à faire dans votre workflow N8N configuré.

---

## 📋 Étape Préliminaire : Ajouter la Colonne `image_precedente`

### Migration SQL à Exécuter

Connectez-vous à Supabase et exécutez cette migration :

```sql
-- Migration 004: Add image_precedente column
-- Adds separate column for image history (separate from text history)

-- Ajouter colonne pour historique de l'image précédente
ALTER TABLE posts
ADD COLUMN IF NOT EXISTS image_precedente TEXT;

COMMENT ON COLUMN posts.image_precedente IS 'URL de l''image précédente (avant modification IA)';

-- Index pour optimiser les requêtes de restauration d'image
CREATE INDEX IF NOT EXISTS idx_posts_image_precedente
ON posts(image_precedente) WHERE image_precedente IS NOT NULL;
```

**Fichier de migration** : [webapp/supabase/migrations/004_add_image_precedente.sql](webapp/supabase/migrations/004_add_image_precedente.sql)

---

## 🔴 Correction 1 : Node "Get Post from Supabase"

**Localisation** : 2ème nœud du workflow

### Erreur Actuelle
```json
"keyValue": "={{ $json.body.post_id }}"
```

### Correction
```json
"keyValue": "={{ $json.post_id }}"
```

**Comment faire** :
1. Ouvrez le nœud "Get Post from Supabase"
2. Dans les Filters → Conditions
3. Changez `{{ $json.body.post_id }}` → `{{ $json.post_id }}`

---

## 🔴 Correction 2 : Node "Save Previous Image URL"

**Localisation** : 3ème nœud (Code Node)

### Code Actuel (Incorrect)
```javascript
const post = $input.first().json;
const webhookData = $('Webhook').first().json;

// Parse existing version_precedente if it exists
let versionPrecedente = {};
if (post.version_precedente) {
  versionPrecedente = typeof post.version_precedente === 'string'
    ? JSON.parse(post.version_precedente)
    : post.version_precedente;
}

// Add image history to existing JSONB structure (preserve text history)
versionPrecedente.image_url = post.image_url;
versionPrecedente.prompt_image = post.prompt_image;
versionPrecedente.image_saved_at = new Date().toISOString();

return {
  json: {
    post_id: post.id,
    current_image_url: post.image_url,
    current_prompt_image: post.prompt_image || '',
    user_prompt: webhookData.prompt,
    // Context for prompt enrichment
    titre: post.titre_interne || '',
    categorie: post.categorie || '',
    hook: post.hook || '',
    // Serialize for Supabase
    version_precedente: JSON.stringify(versionPrecedente)
  }
};
```

### Code Corrigé
```javascript
const post = $input.first().json;
const webhookData = $('Webhook').first().json;

return {
  json: {
    post_id: post.id,
    current_image_url: post.image_url,
    current_prompt_image: post.prompt_image || '',
    image_precedente: post.image_url,
    user_prompt: webhookData.prompt,
    // Context for prompt enrichment
    titre: post.titre_interne || '',
    categorie: post.categorie || '',
    hook: post.hook || ''
  }
};
```

**Changements** :
- ✅ Plus simple : on stocke directement l'image_url actuelle dans `image_precedente`
- ✅ `version_precedente` reste pour l'historique texte uniquement
- ✅ Suppression de la logique JSONB complexe

---

## 🔴 Correction 3 : Node "Set Status Modification_En_Cours"

**Localisation** : 4ème nœud (Supabase Update)

### Erreur Actuelle
```json
"keyValue": "={{ $json.body.post_id }}"
```

### Correction
```json
"keyValue": "={{ $json.post_id }}"
```

**Comment faire** :
1. Ouvrez le nœud "Set Status Modification_En_Cours"
2. Dans les Filters → Conditions
3. Changez `{{ $json.body.post_id }}` → `{{ $json.post_id }}`

---

## 🔴 Correction 4 : Node "Message a model" (GPT-4o)

**Localisation** : Node OpenAI

### Erreur Actuelle (ligne 325)
```
"content": "=CONTEXTE DU POST LINKEDIN :\n..."
```

### Correction
```
"content": "CONTEXTE DU POST LINKEDIN :\n..."
```

**Comment faire** :
1. Ouvrez le nœud "Message a model"
2. Dans le User Message
3. Supprimez le `=` au début du texte

---

## 🔴 Correction 5 : Node "Parse Enriched Prompt"

**Localisation** : 5ème nœud (Code Node après GPT-4o)

### Code Actuel
Ligne avec `version_precedente`:
```javascript
version_precedente: previousData.version_precedente,
```

### Code Corrigé
```javascript
image_precedente: previousData.image_precedente,
```

**Code Complet Corrigé** :
```javascript
const response = $input.first().json;
const previousData = $('Save Previous Image URL').first().json;

// Extract content from GPT response
let content = response.message?.content || response.content || response.text;

// Clean markdown wrapping if present
if (typeof content === 'string') {
  content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  try {
    content = JSON.parse(content);
  } catch (error) {
    throw new Error('GPT-4o did not return valid JSON: ' + content);
  }
}

return {
  json: {
    post_id: previousData.post_id,
    current_image_url: previousData.current_image_url,
    image_precedente: previousData.image_precedente,
    prompt_nano_banana: content.prompt_nano_banana,
    resolution: content.resolution || '2K',
    aspect_ratio: content.aspect_ratio || '1:1',
    justification: content.justification
  }
};
```

---

## 🔴 Correction 6 : Node "Update Post in Supabase"

**Localisation** : Dernier nœud de la chaîne principale

### Erreur Actuelle
```json
{
  "fieldId": "image_precedente",
  "fieldValue": "={{ $('Parse Enriched Prompt').first().json.image_precedente }}"
}
```

### Correction
Remplacer `image_precedente` par le nom correct : `image_precedente` (c'est correct !)

**Champs à mettre à jour** :
```json
{
  "fieldId": "image_url",
  "fieldValue": "={{ $json.secure_url }}"
},
{
  "fieldId": "prompt_image",
  "fieldValue": "={{ $('Parse Enriched Prompt').first().json.prompt_nano_banana }}"
},
{
  "fieldId": "image_precedente",
  "fieldValue": "={{ $('Parse Enriched Prompt').first().json.image_precedente }}"
},
{
  "fieldId": "statut",
  "fieldValue": "A_Valider"
},
{
  "fieldId": "updated_at",
  "fieldValue": "={{ $now.toISO() }}"
}
```

**⚠️ Important** : Le statut doit être `A_Valider` (avec majuscule) ou `a_valider` selon votre contrainte DB

---

## 🔴 Correction 7 : Node "Rollback Status"

**Localisation** : Branche d'erreur, 3ème nœud

### Erreur Actuelle
Pas de filtre pour identifier le post

### Correction à Ajouter
Ajouter un filtre AVANT les fields :

```json
"filters": {
  "conditions": [
    {
      "keyName": "id",
      "condition": "eq",
      "keyValue": "={{ $json.post_id }}"
    }
  ]
},
"fieldsUi": {
  "fieldValues": [
    {
      "fieldId": "statut",
      "fieldValue": "A_Valider"
    }
  ]
}
```

**Comment faire** :
1. Ouvrez le nœud "Rollback Status"
2. Activez les Filters
3. Ajoutez une condition : `id` equals `{{ $json.post_id }}`

---

## ⚠️ Correction 8 : Node "Webhook" (Optionnel mais Recommandé)

**Localisation** : 1er nœud

### Amélioration à Ajouter
Ajouter une réponse JSON personnalisée

**Paramètres à ajouter** :
- Response Code: `200`
- Response Data: `={{ { "status": "processing", "message": "Modification en cours, l'image sera mise à jour automatiquement" } }}`

**Comment faire** :
1. Ouvrez le nœud "Webhook"
2. Dans "Response" section
3. Response Code: `200`
4. Response Data: Collez le JSON ci-dessus

---

## 🎯 Résumé des Corrections par Priorité

### 🔴 Critiques (Workflow échouera sans ça)
1. ✅ **Migration SQL** - Ajouter colonne `image_precedente`
2. ✅ Node "Get Post" - Corriger `$json.body.post_id` → `$json.post_id`
3. ✅ Node "Set Status" - Corriger `$json.body.post_id` → `$json.post_id`
4. ✅ Node "Save Previous Image" - Simplifier le code
5. ✅ Node "Parse Enriched Prompt" - Changer `version_precedente` → `image_precedente`
6. ✅ Node "Rollback Status" - Ajouter le filtre sur post_id

### ⚠️ Importantes (Workflow fonctionne mais comportement incorrect)
7. ⚠️ Node "Message a model" - Enlever le `=` au début

### 💡 Recommandées (Meilleure UX)
8. 💡 Node "Webhook" - Ajouter réponse JSON personnalisée

---

## 🧪 Test Après Corrections

Une fois toutes les corrections appliquées, testez avec :

```bash
curl -X POST https://n8n.srv1014748.hstgr.cloud/webhook-test/modify-image \
  -H "Content-Type: application/json" \
  -d '{
    "post_id": "VOTRE-UUID-VALIDE",
    "prompt": "Add more orange colors and make it dynamic"
  }'
```

**Vérifications** :
1. ✅ Réponse immédiate : `{"status": "processing", "message": "..."}`
2. ✅ Dans Supabase : `statut` = `Modification_En_Cours`
3. ✅ Après 30-50s : Nouvelle image dans `image_url`
4. ✅ Ancienne image dans `image_precedente`
5. ✅ `statut` revient à `A_Valider`
6. ✅ `version_precedente` reste inchangé (historique texte préservé)

---

## 📊 Nouvelle Structure de Données

Après modification d'image :

```json
{
  "id": "uuid...",
  "hook": "Mon hook actuel",
  "corps": "Mon corps actuel",
  "image_url": "https://res.cloudinary.com/.../nouvelle-image.png",
  "image_precedente": "https://res.cloudinary.com/.../ancienne-image.png",
  "version_precedente": {
    "hook": "Ancien hook",
    "corps": "Ancien corps",
    "saved_at": "2026-01-28T10:00:00Z"
  }
}
```

**Avantages** :
- ✅ Séparation claire : texte dans `version_precedente`, image dans `image_precedente`
- ✅ Plus simple à comprendre et maintenir
- ✅ Pas de conflit entre historiques
- ✅ Restauration indépendante du texte et de l'image

---

**Bon courage pour les corrections ! N'hésitez pas si vous avez des questions.** 🚀
