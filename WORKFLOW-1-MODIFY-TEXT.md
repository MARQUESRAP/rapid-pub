# 📝 WORKFLOW 1 — Modification Texte

## Objectif
Recevoir une demande de modification de texte depuis l'app, utiliser GPT-4o pour modifier intelligemment le post selon le prompt utilisateur, sauvegarder l'historique, mettre à jour Supabase.

---

## Déclencheur

**Webhook** — Reçoit un POST de l'application

```json
{
  "post_id": "uuid-du-post",
  "prompt": "Rends le hook plus punchy et ajoute des émojis",
  "type": "text"
}
```

---

## Architecture du workflow

```
[Webhook] 
    → [Get Post from Supabase] 
    → [Save Previous Version] 
    → [Set Status "Modification en cours"]
    → [GPT-4o Modify Text] 
    → [Parse Response]
    → [Update Post in Supabase]
    → [Respond to Webhook]
```

---

## Étapes détaillées

### 1. Webhook Trigger

| Paramètre | Valeur |
|-----------|--------|
| HTTP Method | POST |
| Path | `/modify-text` |
| Response Mode | Last Node |

---

### 2. Get Post from Supabase

| Paramètre | Valeur |
|-----------|--------|
| Operation | Select |
| Table | `posts` |
| Filter | `id = {{ $json.post_id }}` |
| Limit | 1 |

---

### 3. Save Previous Version (Code Node)

**Langage** : JavaScript

```javascript
const post = $input.first().json;

return {
  json: {
    post_id: post.id,
    current_hook: post.hook,
    current_corps: post.corps,
    current_cta: post.cta,
    current_hashtags: post.hashtags,
    // Sérialiser la version précédente
    version_precedente: JSON.stringify({
      hook: post.hook,
      corps: post.corps,
      cta: post.cta,
      hashtags: post.hashtags,
      saved_at: new Date().toISOString()
    }),
    user_prompt: $('Webhook').first().json.prompt
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

### 5. GPT-4o Modify Text (OpenAI)

| Paramètre | Valeur |
|-----------|--------|
| Model | `gpt-4o` |
| Temperature | `0.7` |
| Max Tokens | `2000` |

#### System Prompt :

```
Tu es un expert en rédaction LinkedIn pour Rapid Pub, une imprimerie en ligne B2B française avec livraison en 24h.

RÈGLES DE MODIFICATION :
1. Modifie UNIQUEMENT les éléments concernés par la demande de l'utilisateur
2. Conserve la même longueur approximative (±20%)
3. Conserve le même ton : relâché et cool, mais professionnel
4. Conserve les hashtags existants SAUF si l'utilisateur demande de les changer
5. Ne change PAS la catégorie du post
6. Garde la structure : Hook → Corps → CTA → Hashtags

IDENTITÉ RAPID PUB :
- Imprimerie en ligne B2B
- Livraison en 24h
- Cible : PME, agences, commerces
- Ton : Accessible, pas corporate, expert mais pas hautain

FORMAT DE SORTIE OBLIGATOIRE (JSON) :
{
  "hook": "Nouveau hook si modifié, sinon l'ancien",
  "corps": "Nouveau corps si modifié, sinon l'ancien",
  "cta": "Nouveau CTA si modifié, sinon l'ancien",
  "hashtags": "Nouveaux hashtags si modifiés, sinon les anciens",
  "modifications_effectuees": "Description courte de ce qui a été changé"
}
```

#### User Prompt :

```
Voici le post LinkedIn actuel :

HOOK :
{{ $json.current_hook }}

CORPS :
{{ $json.current_corps }}

CTA :
{{ $json.current_cta }}

HASHTAGS :
{{ $json.current_hashtags }}

---

DEMANDE DE MODIFICATION :
{{ $json.user_prompt }}

---

Applique les modifications demandées en respectant les règles. Réponds uniquement en JSON valide.
```

---

### 6. Parse Response (Code Node)

**Langage** : JavaScript

```javascript
const response = $input.first().json;
const previousData = $('Save Previous Version').first().json;

let content = response.message?.content || response.content;

// Nettoyer le JSON si nécessaire
if (typeof content === 'string') {
  content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  content = JSON.parse(content);
}

return {
  json: {
    post_id: previousData.post_id,
    hook: content.hook,
    corps: content.corps,
    cta: content.cta,
    hashtags: content.hashtags,
    modifications_effectuees: content.modifications_effectuees,
    version_precedente: previousData.version_precedente
  }
};
```

---

### 7. Update Post in Supabase

| Paramètre | Valeur |
|-----------|--------|
| Operation | Update |
| Table | `posts` |
| Filter | `id = {{ $json.post_id }}` |

**Fields à mapper :**

| Champ Supabase | Valeur n8n |
|----------------|------------|
| `hook` | `{{ $json.hook }}` |
| `corps` | `{{ $json.corps }}` |
| `cta` | `{{ $json.cta }}` |
| `hashtags` | `{{ $json.hashtags }}` |
| `version_precedente` | `{{ $json.version_precedente }}` |
| `statut` | `A_Valider` |
| `updated_at` | `{{ $now.toISO() }}` |

---

### 8. Respond to Webhook (Code Node)

**Langage** : JavaScript

```javascript
return {
  json: {
    success: true,
    post_id: $json.post_id,
    modifications: $json.modifications_effectuees
  }
};
```

---

## Mise à jour Supabase

Exécute ce SQL pour ajouter la colonne historique et le nouveau statut :

```sql
-- Ajouter la colonne pour l'historique
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS version_precedente JSONB;

-- Mettre à jour la contrainte de statut
ALTER TABLE posts 
DROP CONSTRAINT IF EXISTS posts_statut_check;

ALTER TABLE posts 
ADD CONSTRAINT posts_statut_check 
CHECK (statut IN ('A_Valider', 'Valide', 'Modification_En_Cours', 'Rejete', 'Planifie', 'Publie'));
```

---

## Mise à jour de l'app — Supabase Realtime

Ajoute ce code dans le composant Dashboard pour la mise à jour automatique :

```javascript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

useEffect(() => {
  // S'abonner aux changements de la table posts
  const subscription = supabase
    .channel('posts-changes')
    .on('postgres_changes', 
      { event: 'UPDATE', schema: 'public', table: 'posts' },
      (payload) => {
        // Mettre à jour le post dans le state
        setPosts(current => 
          current.map(p => p.id === payload.new.id ? payload.new : p)
        );
      }
    )
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
}, []);
```

---

## Gestion des erreurs

Ajoute un **Error Trigger** connecté à un node qui :

1. **Remet le statut** : Update Supabase → `statut` = `A_Valider`
2. **Log l'erreur** : Insert dans table `workflow_logs`
3. **Retourne une erreur** au webhook :

```json
{
  "success": false,
  "error": "La modification a échoué. Veuillez réessayer."
}
```

---

## Workflow 1b — Restaurer version précédente

### Webhook

| Paramètre | Valeur |
|-----------|--------|
| HTTP Method | POST |
| Path | `/restore-version` |

**Body attendu :**
```json
{
  "post_id": "uuid-du-post"
}
```

### Architecture

```
[Webhook /restore-version]
    → [Get Post from Supabase]
    → [Parse & Restore]
    → [Update Post]
    → [Respond]
```

### Parse & Restore (Code Node)

```javascript
const post = $input.first().json;

if (!post.version_precedente) {
  throw new Error('Aucune version précédente disponible');
}

const previous = typeof post.version_precedente === 'string' 
  ? JSON.parse(post.version_precedente) 
  : post.version_precedente;

return {
  json: {
    post_id: post.id,
    hook: previous.hook,
    corps: previous.corps,
    cta: previous.cta,
    hashtags: previous.hashtags
  }
};
```

### Update Post (Supabase)

| Champ | Valeur |
|-------|--------|
| `hook` | `{{ $json.hook }}` |
| `corps` | `{{ $json.corps }}` |
| `cta` | `{{ $json.cta }}` |
| `hashtags` | `{{ $json.hashtags }}` |
| `version_precedente` | `null` |
| `statut` | `A_Valider` |

---

## Résumé des endpoints

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/modify-text` | POST | Modifie le texte d'un post via IA |
| `/restore-version` | POST | Restaure la version précédente |

---

## Coûts estimés

| Élément | Coût par modification |
|---------|----------------------|
| GPT-4o (~1500 tokens) | ~$0.02 |
| Supabase | Gratuit (tier free) |

**Estimation mensuelle** : ~20 modifications × $0.02 = **$0.40/mois**
