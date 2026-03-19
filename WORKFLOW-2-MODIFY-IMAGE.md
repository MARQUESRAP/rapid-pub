# 🎨 WORKFLOW 2 — Modification Image (Nano Banana Pro)

## Objectif
Recevoir une demande de modification d'image depuis l'app, enrichir le prompt utilisateur avec GPT-4o, utiliser **Nano Banana Pro** (Gemini 3 Pro Image) pour modifier l'image existante, uploader sur Cloudinary, sauvegarder l'historique, mettre à jour Supabase.

---

## Pourquoi Nano Banana Pro ?

| Critère | FLUX.2 | Nano Banana Pro |
|---------|--------|-----------------|
| Texte dans l'image | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ (meilleur) |
| Raisonnement | ❌ | ✅ (comprend le contexte) |
| Résolution max | 1024px | **4K** |
| Cohérence personnage | Bon | **Excellent** |
| Multilingue | Limité | ✅ Excellent |
| Prix (via Fal.ai) | ~$0.03 | ~$0.05-0.13 |

---

## Déclencheur

**Webhook** — Reçoit un POST de l'application

```json
{
  "post_id": "uuid-du-post",
  "prompt": "Ajoute plus d'orange et rends l'image plus dynamique",
  "type": "image"
}
```

---

## Architecture du workflow

```
[Webhook] 
    → [Respond Immediately]
    → [Get Post from Supabase] 
    → [Save Previous Image URL]
    → [Set Status "Modification en cours"]
    → [GPT-4o Enrich Prompt]
    → [Parse Enriched Prompt]
    → [Nano Banana Pro Image-to-Image]
    → [Upload to Cloudinary]
    → [Update Post in Supabase]
```

---

## Étapes détaillées

### 1. Webhook Trigger

| Paramètre | Valeur |
|-----------|--------|
| HTTP Method | POST |
| Path | `/modify-image` |
| Response Mode | Respond Immediately |

**Réponse immédiate :**
```json
{
  "status": "processing",
  "message": "Modification en cours, l'image sera mise à jour automatiquement"
}
```

> Note : On répond immédiatement car la génération d'image prend 15-45 secondes. L'app sera notifiée via Supabase Realtime.

---

### 2. Get Post from Supabase

| Paramètre | Valeur |
|-----------|--------|
| Operation | Select |
| Table | `posts` |
| Filter | `id = {{ $json.post_id }}` |
| Limit | 1 |

---

### 3. Save Previous Image URL (Code Node)

**Langage** : JavaScript

```javascript
const post = $input.first().json;
const webhookData = $('Webhook').first().json;

return {
  json: {
    post_id: post.id,
    current_image_url: post.image_url,
    current_prompt_image: post.prompt_image,
    image_precedente: post.image_url,
    user_prompt: webhookData.prompt,
    // Contexte du post pour enrichir le prompt
    titre: post.titre_interne,
    categorie: post.categorie,
    hook: post.hook
  }
};
```

---

### 4. Set Status "Modification en cours" (Supabase)

| Paramètre | Valeur |
|-----------|--------|
| Operation | Update |
| Table | `posts` |
| Filter | `id = {{ $json.post_id }}` |

**Fields :**
| Champ | Valeur |
|-------|--------|
| `statut` | `Modification_En_Cours` |

---

### 5. GPT-4o Enrich Prompt (OpenAI)

| Paramètre | Valeur |
|-----------|--------|
| Model | `gpt-4o` |
| Temperature | `0.7` |
| Max Tokens | `500` |

#### System Prompt :

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

#### User Prompt :

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

Génère un prompt enrichi pour Nano Banana Pro qui modifie l'image selon la demande. 
L'image sera utilisée pour un post LinkedIn professionnel B2B.
Réponds uniquement en JSON valide.
```

---

### 6. Parse Enriched Prompt (Code Node)

**Langage** : JavaScript

```javascript
const response = $input.first().json;
const previousData = $('Save Previous Image URL').first().json;

let content = response.message?.content || response.content;

// Nettoyer le JSON si nécessaire
if (typeof content === 'string') {
  content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  content = JSON.parse(content);
}

return {
  json: {
    post_id: previousData.post_id,
    current_image_url: previousData.current_image_url,
    image_precedente: previousData.image_precedente,
    prompt_nano_banana: content.prompt_nano_banana,
    resolution: content.resolution || "2K",
    aspect_ratio: content.aspect_ratio || "1:1",
    justification: content.justification
  }
};
```

---

### 7. Nano Banana Pro Image-to-Image (HTTP Request)

| Paramètre | Valeur |
|-----------|--------|
| Method | POST |
| URL | `https://fal.run/fal-ai/gemini-3-pro-image-preview/edit` |

#### Headers :

| Header | Value |
|--------|-------|
| `Authorization` | `Key YOUR_FAL_API_KEY` |
| `Content-Type` | `application/json` |

#### Body (JSON) :

```json
{
  "prompt": "{{ $json.prompt_nano_banana }}",
  "image_urls": ["{{ $json.current_image_url }}"],
  "resolution": "{{ $json.resolution }}",
  "aspect_ratio": "{{ $json.aspect_ratio }}",
  "num_images": 1,
  "output_format": "png"
}
```

#### Configuration n8n :

| Paramètre | Valeur |
|-----------|--------|
| Authentication | Generic Credential Type → Header Auth |
| Header Auth Name | `Authorization` |
| Header Auth Value | `Key YOUR_FAL_API_KEY` |
| Timeout | `120000` (120 secondes - Nano Banana Pro peut être plus lent) |

#### Réponse attendue :

```json
{
  "images": [
    {
      "url": "https://storage.googleapis.com/...",
      "content_type": "image/png",
      "file_name": "output.png"
    }
  ],
  "description": "..."
}
```

---

### 8. Upload to Cloudinary (HTTP Request)

| Paramètre | Valeur |
|-----------|--------|
| Method | POST |
| URL | `https://api.cloudinary.com/v1_1/dcxj1nknb/image/upload` |
| Body Content Type | JSON |

#### Body :

```json
{
  "file": "{{ $json.images[0].url }}",
  "upload_preset": "rapid-pub-linkedin",
  "folder": "rapid-pub/linkedin-posts"
}
```

---

### 9. Update Post in Supabase

| Paramètre | Valeur |
|-----------|--------|
| Operation | Update |
| Table | `posts` |
| Filter | `id = {{ $('Parse Enriched Prompt').first().json.post_id }}` |

**Fields à mapper :**

| Champ Supabase | Valeur n8n |
|----------------|------------|
| `image_url` | `{{ $json.secure_url }}` |
| `prompt_image` | `{{ $('Parse Enriched Prompt').first().json.prompt_nano_banana }}` |
| `image_precedente` | `{{ $('Parse Enriched Prompt').first().json.image_precedente }}` |
| `statut` | `A_Valider` |
| `updated_at` | `{{ $now.toISO() }}` |

---

## Mise à jour Supabase

Exécute ce SQL pour ajouter la colonne historique d'image :

```sql
-- Ajouter la colonne pour l'historique d'image
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS image_precedente TEXT;
```

---

## Gestion des erreurs

### Error Trigger → Error Handler

Crée une branche d'erreur qui :

1. **Log l'erreur** dans `workflow_logs`
2. **Remet le statut** à `A_Valider`
3. **Notifie** (optionnel) via email ou Slack

#### Error Handler (Code Node) :

```javascript
const error = $input.first().json;
const postId = $('Save Previous Image URL').first().json?.post_id || 'unknown';

return {
  json: {
    post_id: postId,
    error_message: error.message || 'Erreur lors de la modification de l\'image',
    error_details: JSON.stringify(error),
    timestamp: new Date().toISOString()
  }
};
```

#### Log Error (Supabase Insert) :

| Champ | Valeur |
|-------|--------|
| `date_execution` | `{{ $now.toISO() }}` |
| `statut` | `Erreur` |
| `erreurs` | `{{ $json.error_message }}` |

#### Update Post on Error (Supabase) :

| Champ | Valeur |
|-------|--------|
| `statut` | `A_Valider` |

---

## Workflow 2b — Restaurer image précédente

### Webhook

| Paramètre | Valeur |
|-----------|--------|
| HTTP Method | POST |
| Path | `/restore-image` |

**Body attendu :**
```json
{
  "post_id": "uuid-du-post"
}
```

### Architecture

```
[Webhook /restore-image]
    → [Get Post from Supabase]
    → [Check & Restore]
    → [Update Post]
    → [Respond]
```

### Check & Restore (Code Node)

```javascript
const post = $input.first().json;

if (!post.image_precedente) {
  throw new Error('Aucune image précédente disponible');
}

return {
  json: {
    post_id: post.id,
    image_url: post.image_precedente
  }
};
```

### Update Post (Supabase)

| Champ | Valeur |
|-------|--------|
| `image_url` | `{{ $json.image_url }}` |
| `image_precedente` | `null` |
| `statut` | `A_Valider` |

### Respond

```json
{
  "success": true,
  "message": "Image précédente restaurée"
}
```

---

## Configuration Fal.ai

### Créer un compte

1. Va sur [fal.ai](https://fal.ai)
2. Crée un compte
3. Va dans **Dashboard** → **Keys**
4. Crée une nouvelle API Key
5. Copie la clé (format : `fal_xxxxx...`)

### Créer le credential dans n8n

1. **Settings** → **Credentials** → **Add Credential**
2. Type : **Header Auth**
3. Name : `Fal.ai API`
4. Header Name : `Authorization`
5. Header Value : `Key YOUR_FAL_API_KEY`

---

## Paramètres Nano Banana Pro expliqués

| Paramètre | Description | Valeurs |
|-----------|-------------|---------|
| `prompt` | Instructions de modification | Texte en anglais |
| `image_urls` | Image(s) à modifier | Array d'URLs (max 14) |
| `resolution` | Qualité de sortie | `1K`, `2K`, `4K` |
| `aspect_ratio` | Format de l'image | `1:1`, `16:9`, etc. |
| `num_images` | Nombre d'images à générer | 1-4 |
| `output_format` | Format de sortie | `png`, `jpeg` |

### Résolutions et cas d'usage

| Résolution | Pixels | Cas d'usage | Prix estimé |
|------------|--------|-------------|-------------|
| `1K` | ~1024px | Brouillons, tests | ~$0.05 |
| `2K` | ~2048px | **LinkedIn (recommandé)** | ~$0.13 |
| `4K` | ~4096px | Print, haute qualité | ~$0.24 |

---

## Résumé des endpoints

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/modify-image` | POST | Modifie l'image d'un post via Nano Banana Pro |
| `/restore-image` | POST | Restaure l'image précédente |

---

## Coûts estimés

| Élément | Coût par modification |
|---------|----------------------|
| GPT-4o (~300 tokens) | ~$0.005 |
| Nano Banana Pro (2K) | ~$0.13 |
| Cloudinary | Gratuit (tier free) |
| **Total** | **~$0.135/modification** |

**Estimation mensuelle** : ~10 modifications × $0.135 = **$1.35/mois**

---

## Temps de traitement

| Étape | Durée estimée |
|-------|---------------|
| Webhook → GPT-4o | 2-3 secondes |
| Nano Banana Pro génération | 20-45 secondes |
| Cloudinary upload | 1-2 secondes |
| Supabase update | < 1 seconde |
| **Total** | **~30-50 secondes** |

L'utilisateur reçoit une confirmation immédiate, puis l'app se met à jour automatiquement via Supabase Realtime quand l'image est prête.

---

## Comparaison finale : Nano Banana Pro vs FLUX.2

| Aspect | FLUX.2 | Nano Banana Pro |
|--------|--------|-----------------|
| **Qualité globale** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Texte dans images** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Compréhension prompt** | Bonne | **Excellente** |
| **Cohérence édition** | Bonne | **Excellente** |
| **Prix** | $0.03 | $0.13 |
| **Vitesse** | 15-25s | 20-45s |
| **Résolution max** | 1024px | **4K** |

**Verdict** : Nano Banana Pro est 4x plus cher mais offre une qualité nettement supérieure, surtout pour du contenu B2B professionnel avec potentiellement du texte.

---

## Alternative directe via Google AI (sans Fal.ai)

Si tu préfères utiliser l'API Google directement :

**URL** : `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent`

**Headers** :
```
Content-Type: application/json
x-goog-api-key: YOUR_GOOGLE_API_KEY
```

**Body** :
```json
{
  "contents": [
    {
      "parts": [
        {
          "text": "{{ $json.prompt_nano_banana }}"
        },
        {
          "inline_data": {
            "mime_type": "image/png",
            "data": "BASE64_IMAGE_DATA"
          }
        }
      ]
    }
  ],
  "generationConfig": {
    "responseModalities": ["TEXT", "IMAGE"]
  }
}
```

> Note : Cette méthode nécessite de convertir l'image en base64, ce qui est plus complexe dans n8n. Fal.ai est plus simple car il accepte directement les URLs.
