# Guide d'Installation - Workflows Modification d'Image

Ce guide vous accompagne dans l'installation et la configuration des workflows N8N pour la modification d'image.

---

## Fichiers Créés

✅ **[n8n-workflow-2a-modify-image.json](n8n-workflow-2a-modify-image.json)** - Workflow principal de modification d'image (13 nœuds)
✅ **[n8n-workflow-2b-restore-image.json](n8n-workflow-2b-restore-image.json)** - Workflow de restauration d'image (5 nœuds)
✅ **[webapp/src/lib/webhooks/n8n.ts](webapp/src/lib/webhooks/n8n.ts)** - Fonction `modifyImageWebhook()` activée
✅ **[webapp/.env.local.example](webapp/.env.local.example)** - Variables d'environnement mises à jour

---

## Étape 1 : Importer les Workflows dans N8N

### 1.1 Importer Workflow 2a (Modify Image)

1. Connectez-vous à votre instance N8N : https://n8n.srv1014748.hstgr.cloud
2. Cliquez sur le bouton **"+"** (New Workflow)
3. Menu **"⋯"** → **"Import from File"**
4. Sélectionnez **`n8n-workflow-2a-modify-image.json`**
5. Le workflow s'ouvre avec tous les nœuds configurés

### 1.2 Importer Workflow 2b (Restore Image)

1. Répétez le processus pour **`n8n-workflow-2b-restore-image.json`**

---

## Configuration Détaillée des Nœuds

Cette section détaille la configuration de chaque nœud pour référence ou configuration manuelle.

### 📋 Workflow 2a - Modify Image (13 nœuds)

#### Node 1 : Webhook Trigger
**Type** : `n8n-nodes-base.webhook`
**Position** : [250, 300]

| Paramètre | Valeur |
|-----------|--------|
| HTTP Method | `POST` |
| Path | `modify-image` |
| Response Mode | `responseOnReceived` |
| Response Code | `200` |
| Response Data | `={{ { "status": "processing", "message": "Modification en cours, l'image sera mise à jour automatiquement" } }}` |

---

#### Node 2 : Get Post from Supabase
**Type** : `n8n-nodes-base.supabase`
**Position** : [470, 300]

| Paramètre | Valeur |
|-----------|--------|
| Authentication | `serviceRole` |
| Operation | `getAll` (Select) |
| Table | `posts` |
| Return All | `false` |
| Limit | `1` |
| Filter Type | `manual` |
| Match Type | `matchAll` |

**Conditions** :
- Key Name: `id`
- Condition: `equals`
- Key Value: `={{ $json.post_id }}`

---

#### Node 3 : Save Previous Image URL (Code Node)
**Type** : `n8n-nodes-base.code`
**Position** : [690, 300]

**Code JavaScript** :
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

**Rôle** : Sauvegarde l'image actuelle dans l'historique et prépare le contexte pour GPT-4o

---

#### Node 4 : Set Status Modification_En_Cours
**Type** : `n8n-nodes-base.supabase`
**Position** : [910, 300]

| Paramètre | Valeur |
|-----------|--------|
| Authentication | `serviceRole` |
| Operation | `update` |
| Table | `posts` |
| Filter Type | `manual` |
| Match Type | `matchAll` |

**Conditions** :
- Key Name: `id`
- Condition: `equals`
- Key Value: `={{ $json.post_id }}`

**Columns to Update** :
- `statut`: `Modification_En_Cours`

**Rôle** : Change le statut pour déclencher l'indicateur de chargement dans l'UI

---

#### Node 5 : GPT-4o Enrich Prompt
**Type** : `@n8n/n8n-nodes-langchain.lmChatOpenAi`
**Position** : [1130, 300]

| Paramètre | Valeur |
|-----------|--------|
| Model | `gpt-4o` |
| Temperature | `0.7` |
| Max Tokens | `500` |

**System Message** :
```
Tu es un expert en génération de prompts pour Nano Banana Pro (Gemini 3 Pro Image), le modèle d'IA de génération d'images de Google.

Ta mission : Transformer une demande simple de l'utilisateur en un prompt détaillé et technique pour modifier une image existante.

AVANTAGES DE NANO BANANA PRO :
- Excellent pour le texte dans les images
- Comprend le contexte et le raisonnement
- Peut produire jusqu'à 4K de résolution
- Excellent pour maintenir la cohérence visuelle

CHARTE GRAPHIQUE RAPID PUB (à inclure SI l'utilisateur ne mentionne pas de couleurs spécifiques) :
- Couleur principale : Orange vif #E94E1B
- Couleur accent : Vert lime #A4C639
- Style : Flat design moderne avec touches 3D subtiles
- Éléments signature : Petits carrés/pixels dispersés (effet digital/vitesse)
- Ambiance : Dynamique, professionnelle, accessible

RÈGLES :
1. Le prompt doit être en ANGLAIS (meilleure compréhension)
2. Nano Banana Pro comprend les instructions complexes - sois détaillé
3. Inclure des détails techniques : style, éclairage, composition
4. Si l'utilisateur mentionne des couleurs, respecter son choix
5. Si l'utilisateur ne mentionne PAS de couleurs, inclure la charte Rapid Pub
6. Tu peux demander des modifications précises (ex: "change the background to...", "add orange accent colors to...")
7. Spécifie le style visuel souhaité (flat design, modern, professional, etc.)

FORMAT DE SORTIE OBLIGATOIRE (JSON) :
{
  "prompt_nano_banana": "Prompt détaillé en anglais pour Nano Banana Pro",
  "resolution": "2K",
  "aspect_ratio": "1:1",
  "justification": "Explication courte des modifications demandées"
}

RÉSOLUTIONS DISPONIBLES : "1K", "2K", "4K" (utilise 2K par défaut pour LinkedIn)
ASPECT RATIOS : "1:1", "4:3", "3:2", "16:9", "9:16", "3:4", "2:3", "5:4", "4:5", "21:9"
```

**User Message** :
```
CONTEXTE DU POST LINKEDIN :
- Titre : {{ $json.titre }}
- Catégorie : {{ $json.categorie }}
- Hook : {{ $json.hook }}

PROMPT ORIGINAL DE L'IMAGE :
{{ $json.current_prompt_image }}

---

DEMANDE DE MODIFICATION DE L'UTILISATEUR :
{{ $json.user_prompt }}

---

Génère un prompt enrichi pour Nano Banana Pro qui modifie l'image selon la demande. L'image sera utilisée pour un post LinkedIn professionnel B2B.
Réponds uniquement en JSON valide.
```

**Rôle** : Enrichit le prompt simple de l'utilisateur en instructions détaillées pour Nano Banana Pro

---

#### Node 6 : Parse Enriched Prompt (Code Node)
**Type** : `n8n-nodes-base.code`
**Position** : [1350, 300]

**Code JavaScript** :
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
    version_precedente: previousData.version_precedente,
    prompt_nano_banana: content.prompt_nano_banana,
    resolution: content.resolution || '2K',
    aspect_ratio: content.aspect_ratio || '1:1',
    justification: content.justification
  }
};
```

**Rôle** : Parse la réponse JSON de GPT-4o et nettoie le markdown si présent

---

#### Node 7 : Nano Banana Pro Image-to-Image
**Type** : `n8n-nodes-base.httpRequest`
**Position** : [1570, 300]

| Paramètre | Valeur |
|-----------|--------|
| Method | `POST` |
| URL | `https://fal.run/fal-ai/gemini-3-pro-image-preview/edit` |
| Authentication | `predefinedCredentialType` |
| Node Credential Type | `httpHeaderAuth` |
| Credential | `Fal.ai API` (Header Auth) |
| Content Type | `json` |
| Timeout | `120000` (120s) |

**Headers** :
- `Content-Type`: `application/json`

**Body Parameters** (JSON) :
```json
{
  "prompt": "={{ $json.prompt_nano_banana }}",
  "image_urls": ["={{ $json.current_image_url }}"],
  "resolution": "={{ $json.resolution }}",
  "aspect_ratio": "={{ $json.aspect_ratio }}",
  "num_images": 1,
  "output_format": "png"
}
```

**Réponse attendue** :
```json
{
  "images": [
    {
      "url": "https://storage.googleapis.com/...",
      "content_type": "image/png",
      "file_name": "output.png"
    }
  ]
}
```

**Rôle** : Génère la nouvelle image via Nano Banana Pro (Gemini 3 Pro Image)

---

#### Node 8 : Upload to Cloudinary
**Type** : `n8n-nodes-base.httpRequest`
**Position** : [1790, 300]

| Paramètre | Valeur |
|-----------|--------|
| Method | `POST` |
| URL | `https://api.cloudinary.com/v1_1/dcxj1nknb/image/upload` |
| Authentication | `none` |
| Content Type | `json` |
| Timeout | `30000` (30s) |

**Body Parameters** (JSON) :
```json
{
  "file": "={{ $json.images[0].url }}",
  "upload_preset": "rapid-pub-linkedin",
  "folder": "rapid-pub/linkedin-posts"
}
```

**Réponse attendue** :
```json
{
  "secure_url": "https://res.cloudinary.com/...",
  "public_id": "...",
  ...
}
```

**Rôle** : Upload l'image générée vers Cloudinary pour hébergement permanent

---

#### Node 9 : Update Post in Supabase
**Type** : `n8n-nodes-base.supabase`
**Position** : [2010, 300]

| Paramètre | Valeur |
|-----------|--------|
| Authentication | `serviceRole` |
| Operation | `update` |
| Table | `posts` |
| Filter Type | `manual` |
| Match Type | `matchAll` |

**Conditions** :
- Key Name: `id`
- Condition: `equals`
- Key Value: `={{ $('Parse Enriched Prompt').first().json.post_id }}`

**Columns to Update** :
- `image_url`: `={{ $json.secure_url }}`
- `prompt_image`: `={{ $('Parse Enriched Prompt').first().json.prompt_nano_banana }}`
- `version_precedente`: `={{ $('Parse Enriched Prompt').first().json.version_precedente }}`
- `statut`: `a_valider`
- `updated_at`: `={{ $now.toISO() }}`

**Rôle** : Met à jour le post avec la nouvelle image et restaure le statut

---

### 🔥 Branche de Gestion d'Erreur

#### Node 10 : Error Trigger
**Type** : `n8n-nodes-base.errorTrigger`
**Position** : [690, 520]

**Paramètres** : Aucun

**Rôle** : Détecte toute erreur dans le workflow principal

---

#### Node 11 : Error Handler (Code Node)
**Type** : `n8n-nodes-base.code`
**Position** : [910, 520]

**Code JavaScript** :
```javascript
const error = $input.first().json;
const postId = $('Save Previous Image URL').first().json?.post_id || 'unknown';

console.error('Workflow error:', error);

return {
  json: {
    post_id: postId,
    error_message: error.message || 'Erreur lors de la modification de l\'image',
    error_details: JSON.stringify(error, null, 2),
    timestamp: new Date().toISOString()
  }
};
```

**Rôle** : Capture les détails de l'erreur pour logging

---

#### Node 12 : Rollback Status
**Type** : `n8n-nodes-base.supabase`
**Position** : [1130, 520]

| Paramètre | Valeur |
|-----------|--------|
| Authentication | `serviceRole` |
| Operation | `update` |
| Table | `posts` |
| Filter Type | `manual` |
| Match Type | `matchAll` |

**Conditions** :
- Key Name: `id`
- Condition: `equals`
- Key Value: `={{ $json.post_id }}`

**Columns to Update** :
- `statut`: `a_valider`

**Rôle** : Restaure le statut du post en cas d'erreur pour permettre un nouveau tentative

---

### 📋 Workflow 2b - Restore Image (5 nœuds)

#### Node 1 : Webhook Trigger
**Type** : `n8n-nodes-base.webhook`
**Position** : [250, 300]

| Paramètre | Valeur |
|-----------|--------|
| HTTP Method | `POST` |
| Path | `restore-image` |
| Response Mode | `lastNode` |

---

#### Node 2 : Get Post from Supabase
**Type** : `n8n-nodes-base.supabase`
**Position** : [470, 300]

| Paramètre | Valeur |
|-----------|--------|
| Authentication | `serviceRole` |
| Operation | `getAll` (Select) |
| Table | `posts` |
| Return All | `false` |
| Limit | `1` |
| Filter Type | `manual` |
| Match Type | `matchAll` |

**Conditions** :
- Key Name: `id`
- Condition: `equals`
- Key Value: `={{ $json.post_id }}`

---

#### Node 3 : Check & Restore (Code Node)
**Type** : `n8n-nodes-base.code`
**Position** : [690, 300]

**Code JavaScript** :
```javascript
const post = $input.first().json;

// Vérifier version_precedente existe
if (!post.version_precedente) {
  throw new Error('Aucune image précédente disponible');
}

let versionPrecedente = typeof post.version_precedente === 'string'
  ? JSON.parse(post.version_precedente)
  : post.version_precedente;

// Vérifier historique image existe
if (!versionPrecedente.image_url) {
  throw new Error('Aucune image précédente disponible');
}

// Extraire image précédente
const previousImageUrl = versionPrecedente.image_url;
const previousPromptImage = versionPrecedente.prompt_image || null;

// Supprimer historique image (GARDER historique texte)
delete versionPrecedente.image_url;
delete versionPrecedente.prompt_image;
delete versionPrecedente.image_saved_at;

// Si vide, mettre à null
const updatedVersionPrecedente = Object.keys(versionPrecedente).length > 0
  ? JSON.stringify(versionPrecedente)
  : null;

return {
  json: {
    post_id: post.id,
    image_url: previousImageUrl,
    prompt_image: previousPromptImage,
    version_precedente: updatedVersionPrecedente
  }
};
```

**Rôle** : Vérifie l'historique, extrait l'image précédente, et préserve l'historique texte

---

#### Node 4 : Update Post
**Type** : `n8n-nodes-base.supabase`
**Position** : [910, 300]

| Paramètre | Valeur |
|-----------|--------|
| Authentication | `serviceRole` |
| Operation | `update` |
| Table | `posts` |
| Filter Type | `manual` |
| Match Type | `matchAll` |

**Conditions** :
- Key Name: `id`
- Condition: `equals`
- Key Value: `={{ $json.post_id }}`

**Columns to Update** :
- `image_url`: `={{ $json.image_url }}`
- `prompt_image`: `={{ $json.prompt_image }}`
- `version_precedente`: `={{ $json.version_precedente }}`
- `statut`: `a_valider`
- `updated_at`: `={{ $now.toISO() }}`

**Rôle** : Restaure l'image précédente et nettoie l'historique image

---

#### Node 5 : Respond (Code Node)
**Type** : `n8n-nodes-base.code`
**Position** : [1130, 300]

**Code JavaScript** :
```javascript
return {
  json: {
    success: true,
    message: 'Image précédente restaurée'
  }
};
```

**Rôle** : Retourne une confirmation de succès au webhook

---

### 📊 Connections entre les Nœuds

#### Workflow 2a - Modify Image

```
Webhook → Get Post from Supabase → Save Previous Image URL
→ Set Status Modification_En_Cours → GPT-4o Enrich Prompt
→ Parse Enriched Prompt → Nano Banana Pro Image-to-Image
→ Upload to Cloudinary → Update Post in Supabase

Branche d'erreur :
Error Trigger → Error Handler → Rollback Status
```

#### Workflow 2b - Restore Image

```
Webhook → Get Post from Supabase → Check & Restore
→ Update Post → Respond
```

---

## Étape 2 : Vérifier les Credentials

Les workflows utilisent les credentials suivants (déjà configurés selon vos réponses) :

### ✅ Supabase
- Type : **Supabase**
- Authentication : **Service Role**
- Host : Votre URL Supabase
- Service Role Key : Depuis votre dashboard Supabase

### ✅ OpenAI
- Type : **OpenAI**
- API Key : Votre clé API OpenAI

### ✅ Fal.ai (Nano Banana Pro)
- Type : **Header Auth**
- Name : **"Fal.ai API"**
- Header Name : `Authorization`
- Header Value : `Key YOUR_FAL_API_KEY`

**Important** : Si le credential "Fal.ai API" n'existe pas encore :
1. Settings → Credentials → Add Credential
2. Type : **Header Auth**
3. Name : `Fal.ai API`
4. Header Name : `Authorization`
5. Header Value : `Key <votre-clé-fal.ai>`

### ✅ Cloudinary
- Pas de credential nécessaire (utilise `upload_preset`)

---

## Étape 3 : Activer les Workflows

### Workflow 2a - Modify Image

1. Ouvrez le workflow importé
2. Cliquez sur le nœud **"Webhook"**
3. Notez l'URL du webhook (ex: `https://n8n.srv1014748.hstgr.cloud/webhook-test/modify-image`)
4. Activez le workflow (toggle en haut à droite)

### Workflow 2b - Restore Image

1. Répétez pour le workflow restore-image
2. Notez l'URL (ex: `https://n8n.srv1014748.hstgr.cloud/webhook-test/restore-image`)
3. Activez le workflow

---

## Étape 4 : Configurer la Webapp

### 4.1 Variables d'environnement

Créez ou modifiez **`webapp/.env.local`** :

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://ajufioyljbuhjbvawuee.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# n8n Webhooks
NEXT_PUBLIC_N8N_MODIFY_TEXT_URL=https://n8n.srv1014748.hstgr.cloud/webhook-test/modify-text
NEXT_PUBLIC_N8N_RESTORE_VERSION_URL=https://n8n.srv1014748.hstgr.cloud/webhook-test/restore-version
NEXT_PUBLIC_N8N_MODIFY_IMAGE_URL=https://n8n.srv1014748.hstgr.cloud/webhook-test/modify-image
NEXT_PUBLIC_N8N_RESTORE_IMAGE_URL=https://n8n.srv1014748.hstgr.cloud/webhook-test/restore-image

# App Config
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Important** : Remplacez les URLs des webhooks par celles notées à l'étape 3.

### 4.2 Redémarrer le serveur de développement

```bash
cd webapp
npm run dev
```

---

## Étape 5 : Tester

### Test 1 : Modification d'Image (Workflow 2a)

#### Via Postman/cURL :

```bash
curl -X POST https://n8n.srv1014748.hstgr.cloud/webhook-test/modify-image \
  -H "Content-Type: application/json" \
  -d '{
    "post_id": "UUID-DE-VOTRE-POST",
    "prompt": "Add more orange colors and make it more dynamic"
  }'
```

**Réponse attendue (immédiate) :**
```json
{
  "status": "processing",
  "message": "Modification en cours, l'image sera mise à jour automatiquement"
}
```

**Vérifications :**
1. Dans N8N, vérifiez l'exécution du workflow (onglet "Executions")
2. Le status du post passe à `Modification_En_Cours`
3. Après 30-50s, l'image est modifiée
4. Le status revient à `a_valider`
5. Dans Supabase, vérifiez que `version_precedente` contient l'ancienne `image_url`

#### Via l'Application :

1. Ouvrez l'application : http://localhost:3000
2. Connectez-vous (PIN)
3. Sélectionnez un post avec une image
4. Cliquez sur **"🖼️ Modifier l'image"**
5. Entrez un prompt : "Add more orange and make it dynamic"
6. Cliquez **"Envoyer"**
7. Observez :
   - Toast de confirmation immédiat
   - Status "Modification en cours..." apparaît
   - Après 30-50s, la nouvelle image apparaît automatiquement
   - Status revient à "À valider"

---

### Test 2 : Restauration d'Image (Workflow 2b)

**Prérequis** : Un post avec historique d'image (après avoir fait Test 1)

#### Via Postman/cURL :

```bash
curl -X POST https://n8n.srv1014748.hstgr.cloud/webhook-test/restore-image \
  -H "Content-Type: application/json" \
  -d '{
    "post_id": "UUID-DE-VOTRE-POST"
  }'
```

**Réponse attendue :**
```json
{
  "success": true,
  "message": "Image précédente restaurée"
}
```

**Vérifications :**
1. L'ancienne image est restaurée
2. `version_precedente.image_url` est supprimé dans Supabase
3. L'historique de texte (si présent) est préservé

---

### Test 3 : Gestion d'Erreur

#### Tester avec un post_id invalide :

```bash
curl -X POST https://n8n.srv1014748.hstgr.cloud/webhook-test/modify-image \
  -H "Content-Type: application/json" \
  -d '{
    "post_id": "invalid-uuid",
    "prompt": "Test error"
  }'
```

**Vérifications :**
1. Workflow échoue proprement
2. Error Handler est déclenché
3. Status revient à `a_valider` (rollback)
4. Erreur loggée dans N8N console

---

## Structure de `version_precedente`

Après modification de texte ET d'image, le JSONB ressemble à :

```json
{
  "hook": "Ancienne accroche",
  "corps": "Ancien corps",
  "cta": "Ancien CTA",
  "hashtags": ["#ancien"],
  "saved_at": "2026-01-28T10:00:00Z",
  "image_url": "https://cloudinary.com/.../ancienne-image.png",
  "prompt_image": "Ancien prompt Nano Banana",
  "image_saved_at": "2026-01-28T11:30:00Z"
}
```

**Avantage** : Les deux historiques coexistent sans conflit.

---

## Dépannage

### Erreur : "URL du webhook non configurée"

**Cause** : Variable d'environnement manquante dans `.env.local`

**Solution** :
1. Vérifiez que `.env.local` contient `NEXT_PUBLIC_N8N_MODIFY_IMAGE_URL`
2. Redémarrez le serveur Next.js : `npm run dev`

---

### Erreur : Timeout après 30s

**Cause** : Nano Banana Pro peut prendre jusqu'à 45s en haute résolution

**Solution** :
1. Dans le workflow, nœud "Nano Banana Pro", augmentez le timeout à 180000ms (3min)
2. Ou utilisez résolution "1K" pour des tests plus rapides

---

### Erreur : GPT-4o retourne JSON invalide

**Cause** : Rare, mais GPT peut wrapper le JSON dans du markdown

**Solution** : Le nœud "Parse Enriched Prompt" nettoie déjà les backticks. Si le problème persiste :
1. Vérifiez les logs d'exécution N8N
2. Augmentez la température à 0.5 (plus déterministe)

---

### L'image ne se met pas à jour dans l'UI

**Cause** : Problème de real-time subscription Supabase

**Solution** :
1. Vérifiez que Supabase Realtime est activé (Project Settings → API)
2. Rechargez la page manuellement
3. Vérifiez dans Supabase Table Editor si `image_url` a bien été mis à jour

---

## Coûts Estimés

| Service | Coût par modification |
|---------|----------------------|
| GPT-4o (~300 tokens) | $0.005 |
| Nano Banana Pro (2K) | $0.13 |
| Cloudinary | Gratuit (free tier) |
| **Total** | **~$0.135** |

**Estimation mensuelle** (20 modifications) : **$2.70**

---

## Prochaines Étapes

### Optimisations Possibles

1. **Cache des prompts enrichis** : Réutiliser le prompt GPT-4o si demande similaire
2. **Résolutions variables** : 1K pour preview, 2K pour publication
3. **Batch processing** : Traiter plusieurs modifications en parallèle
4. **Logs Supabase** : Créer table `workflow_logs` pour tracer les exécutions

### Monitoring

1. **N8N Executions** : Surveillez l'onglet "Executions" pour détecter les échecs
2. **Supabase Logs** : Activez Supabase Logs pour voir les requêtes en temps réel
3. **Fal.ai Dashboard** : Surveillez l'usage API et les quotas

---

## Support

Si vous rencontrez des problèmes :

1. Vérifiez les logs d'exécution N8N
2. Vérifiez les logs du serveur Next.js
3. Vérifiez les credentials dans N8N Settings
4. Testez chaque nœud individuellement avec le bouton "Execute Node"

---

## Résumé des Endpoints

| Endpoint | Méthode | Description | Response Mode |
|----------|---------|-------------|---------------|
| `/webhook-test/modify-text` | POST | Modification de texte | lastNode |
| `/webhook-test/restore-version` | POST | Restauration version texte | lastNode |
| `/webhook-test/modify-image` | POST | Modification d'image | responseOnReceived |
| `/webhook-test/restore-image` | POST | Restauration image | lastNode |

---

**Félicitations ! Les workflows sont prêts à être utilisés.** 🎉
