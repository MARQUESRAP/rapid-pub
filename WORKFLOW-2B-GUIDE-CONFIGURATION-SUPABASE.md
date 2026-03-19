# 🔧 Guide de Configuration Supabase - Workflow 2b (Restore Image)

Ce guide vous accompagne pas à pas pour configurer les nœuds Supabase du workflow **Workflow 2b - Restaurer Image Précédente**.

---

## 📋 Vue d'Ensemble du Workflow

```
[Webhook] → [Get Post from Supabase] → [Check & Restore] → [Update Post] → [Respond]
              ⬆️ Nœud Supabase 1           Code Node          ⬆️ Nœud Supabase 2
```

**Nœuds Supabase à configurer :**
1. **Get Post from Supabase** - Récupérer le post
2. **Update Post** - Restaurer l'image précédente

---

## 🔐 Prérequis : Credential Supabase

### Vérifier que le credential existe

1. Dans N8N, allez dans **Settings** → **Credentials**
2. Cherchez votre credential Supabase (ex: "Supabase account")
3. Si absent, créez-le :
   - Type : **Supabase**
   - Name : `Supabase account`
   - Host : `https://ajufioyljbuhjbvawuee.supabase.co`
   - Service Role Key : Depuis Supabase Dashboard → Settings → API → service_role key

---

## 📥 Node 1 : Get Post from Supabase

### Position dans le workflow
**2ème nœud** - Après le Webhook

### Configuration Étape par Étape

#### 1. Paramètres de Base

| Champ | Valeur |
|-------|--------|
| **Credential** | Sélectionnez votre credential Supabase |
| **Operation** | **Get Many** (ou `getAll`) |
| **Table** | `posts` |

**Comment faire :**
1. Cliquez sur le nœud "Get Post from Supabase"
2. Dans "Credential to connect with", sélectionnez votre credential Supabase
3. Dans "Operation", choisissez **"Get Many"**
4. Dans "Table", tapez ou sélectionnez **`posts`**

---

#### 2. Options de Limite

| Champ | Valeur |
|-------|--------|
| **Return All** | ❌ Décoché (false) |
| **Limit** | `1` |

**Comment faire :**
1. Descendez à la section "Options"
2. **Return All** : Laissez **décoché** (toggle à gauche)
3. **Limit** : Entrez `1`

**Pourquoi ?** On veut récupérer UN SEUL post (celui avec le post_id du webhook)

---

#### 3. Filters (CRITIQUE)

**Section : Filters**

Cliquez sur **"Add Filter"** ou **"Add Condition"**

| Paramètre | Valeur |
|-----------|--------|
| **Filter Type** | Manual |
| **Key Name** | `id` |
| **Condition** | `eq` (equals) |
| **Key Value** | `={{ $json.post_id }}` |

**Instructions détaillées :**

1. Activez la section **"Filters"**
2. Cliquez sur **"Add Condition"**
3. **Key Name** : Tapez `id` (nom de la colonne dans votre table)
4. **Condition** : Sélectionnez `eq` (equals) dans le dropdown
5. **Key Value** : Tapez exactement `={{ $json.post_id }}`

**⚠️ ATTENTION :**
- NE PAS mettre `$json.body.post_id` ❌
- DOIT être `$json.post_id` ✅
- Les doubles accolades `={{ }}` sont OBLIGATOIRES

---

#### 4. Vérification Visuelle

Votre configuration devrait ressembler à :

```
┌─────────────────────────────────────┐
│ Get Post from Supabase              │
├─────────────────────────────────────┤
│ Credential: Supabase account        │
│ Operation: Get Many                 │
│ Table: posts                        │
│                                     │
│ Options:                            │
│   Return All: ☐                     │
│   Limit: 1                          │
│                                     │
│ Filters:                            │
│   ┌─────────────────────────────┐  │
│   │ Key Name: id                │  │
│   │ Condition: eq               │  │
│   │ Key Value: ={{ $json.post_id }}│  │
│   └─────────────────────────────┘  │
└─────────────────────────────────────┘
```

---

#### 5. Test du Nœud

**Tester avec des données factices :**

1. Cliquez sur **"Execute Node"** (bouton play dans le nœud)
2. Si erreur "Missing post_id" : C'est normal, le webhook n'a pas été déclenché
3. Pour tester avec données réelles :
   - Cliquez sur le nœud Webhook
   - Cliquez sur "Listen for Test Event"
   - Envoyez un POST avec curl :

```bash
curl -X POST https://VOTRE-N8N-URL/webhook/restore-image \
  -H "Content-Type: application/json" \
  -d '{"post_id": "UN-UUID-VALIDE-DE-VOTRE-DB"}'
```

---

## 💾 Node 2 : Update Post

### Position dans le workflow
**4ème nœud** - Après "Check & Restore"

### Configuration Étape par Étape

#### 1. Paramètres de Base

| Champ | Valeur |
|-------|--------|
| **Credential** | Sélectionnez votre credential Supabase |
| **Operation** | **Update** |
| **Table** | `posts` |

**Comment faire :**
1. Cliquez sur le nœud "Update Post"
2. Dans "Credential to connect with", sélectionnez votre credential Supabase
3. Dans "Operation", choisissez **"Update"**
4. Dans "Table", tapez ou sélectionnez **`posts`**

---

#### 2. Filters (Identifier le post à mettre à jour)

**Section : Filters**

| Paramètre | Valeur |
|-----------|--------|
| **Filter Type** | Manual |
| **Key Name** | `id` |
| **Condition** | `eq` (equals) |
| **Key Value** | `={{ $json.post_id }}` |

**Instructions détaillées :**

1. Activez la section **"Filters"**
2. Cliquez sur **"Add Condition"**
3. **Key Name** : Tapez `id`
4. **Condition** : Sélectionnez `eq` (equals)
5. **Key Value** : Tapez exactement `={{ $json.post_id }}`

**⚠️ CRITIQUE :** Le `$json.post_id` provient du nœud précédent "Check & Restore"

---

#### 3. Fields to Update (Les colonnes à mettre à jour)

**Section : Fields / Columns**

Vous devez ajouter **4 champs** :

##### Champ 1 : image_url
| Paramètre | Valeur |
|-----------|--------|
| **Field ID** | `image_url` |
| **Field Value** | `={{ $json.image_url }}` |

##### Champ 2 : image_precedente
| Paramètre | Valeur |
|-----------|--------|
| **Field ID** | `image_precedente` |
| **Field Value** | `null` |

**⚠️ IMPORTANT :**
- Pour `null`, dans N8N :
  - Option 1 : Laissez le champ vide et cochez "Set as null" si disponible
  - Option 2 : Tapez `null` (sans guillemets, sans accolades)

##### Champ 3 : statut
| Paramètre | Valeur |
|-----------|--------|
| **Field ID** | `statut` |
| **Field Value** | `a_valider` |

**⚠️ ATTENTION au format du statut :**
- Vérifiez dans votre DB : `a_valider` ou `A_Valider` ?
- Utilisez le format exact de votre contrainte DB

##### Champ 4 : updated_at
| Paramètre | Valeur |
|-----------|--------|
| **Field ID** | `updated_at` |
| **Field Value** | `={{ $now.toISO() }}` |

---

#### 4. Instructions Détaillées - Ajouter les Champs

1. Dans le nœud "Update Post", descendez à **"Fields"** ou **"Columns"**
2. Cliquez sur **"Add Field"** (4 fois, un par champ)
3. Pour chaque champ :
   - **Field ID** : Nom de la colonne (ex: `image_url`)
   - **Field Value** : Valeur à mettre (ex: `={{ $json.image_url }}`)

**Exemple pour image_url :**
```
┌─────────────────────────────────┐
│ Field 1                         │
├─────────────────────────────────┤
│ Field ID: image_url             │
│ Field Value: ={{ $json.image_url }}│
└─────────────────────────────────┘
```

---

#### 5. Vérification Visuelle Complète

Votre configuration devrait ressembler à :

```
┌─────────────────────────────────────┐
│ Update Post                         │
├─────────────────────────────────────┤
│ Credential: Supabase account        │
│ Operation: Update                   │
│ Table: posts                        │
│                                     │
│ Filters:                            │
│   ┌─────────────────────────────┐  │
│   │ Key Name: id                │  │
│   │ Condition: eq               │  │
│   │ Key Value: ={{ $json.post_id }}│  │
│   └─────────────────────────────┘  │
│                                     │
│ Fields:                             │
│   ┌─────────────────────────────┐  │
│   │ Field 1:                    │  │
│   │   ID: image_url             │  │
│   │   Value: ={{ $json.image_url }}│  │
│   ├─────────────────────────────┤  │
│   │ Field 2:                    │  │
│   │   ID: image_precedente      │  │
│   │   Value: null               │  │
│   ├─────────────────────────────┤  │
│   │ Field 3:                    │  │
│   │   ID: statut                │  │
│   │   Value: a_valider          │  │
│   ├─────────────────────────────┤  │
│   │ Field 4:                    │  │
│   │   ID: updated_at            │  │
│   │   Value: ={{ $now.toISO() }}  │  │
│   └─────────────────────────────┘  │
└─────────────────────────────────────┘
```

---

## 🧪 Test Complet du Workflow

### Préparation

1. **Vérifiez que la colonne existe** :
```sql
-- Dans Supabase SQL Editor
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'posts'
AND column_name = 'image_precedente';
```

Si la colonne n'existe pas, exécutez :
```sql
ALTER TABLE posts
ADD COLUMN IF NOT EXISTS image_precedente TEXT;
```

2. **Créez un post de test** avec une image :
```sql
UPDATE posts
SET image_precedente = 'https://res.cloudinary.com/demo/image/upload/sample.jpg'
WHERE id = 'VOTRE-UUID-DE-TEST';
```

---

### Test en Production

#### Étape 1 : Activer le Workflow
1. Dans N8N, ouvrez le workflow "Workflow 2b - Restaurer Image Précédente"
2. Cliquez sur le toggle **"Active"** en haut à droite
3. Le workflow passe en mode "Active" (vert)

---

#### Étape 2 : Récupérer l'URL du Webhook
1. Cliquez sur le nœud **"Webhook"**
2. Notez l'URL affichée, par exemple :
   ```
   https://n8n.srv1014748.hstgr.cloud/webhook-test/restore-image
   ```

---

#### Étape 3 : Tester avec cURL

```bash
curl -X POST https://n8n.srv1014748.hstgr.cloud/webhook-test/restore-image \
  -H "Content-Type: application/json" \
  -d '{
    "post_id": "REMPLACEZ-PAR-UUID-REEL"
  }'
```

**Réponse attendue :**
```json
{
  "success": true,
  "message": "Image précédente restaurée"
}
```

---

#### Étape 4 : Vérifications

**1. Dans N8N :**
- Allez dans **"Executions"** (barre latérale)
- Vérifiez que l'exécution est **"Success"** (vert)
- Cliquez sur l'exécution pour voir le détail de chaque nœud

**2. Dans Supabase :**
```sql
SELECT
  id,
  image_url,
  image_precedente,
  statut,
  updated_at
FROM posts
WHERE id = 'VOTRE-UUID-DE-TEST';
```

**Résultat attendu :**
- `image_url` : Doit contenir l'URL de l'ancienne image
- `image_precedente` : Doit être `NULL`
- `statut` : Doit être `a_valider`
- `updated_at` : Doit être l'heure actuelle

---

## 🚨 Dépannage

### Erreur : "Missing input data"

**Cause :** Le nœud précédent n'a pas renvoyé de données

**Solution :**
1. Vérifiez que le webhook a bien été appelé
2. Testez le nœud "Get Post from Supabase" séparément
3. Vérifiez que le `post_id` existe dans votre table

---

### Erreur : "Column 'image_precedente' does not exist"

**Cause :** La migration SQL n'a pas été exécutée

**Solution :**
```sql
ALTER TABLE posts
ADD COLUMN IF NOT EXISTS image_precedente TEXT;
```

---

### Erreur : "No rows updated"

**Cause :** Le filtre `id = {{ $json.post_id }}` ne trouve aucun post

**Solution :**
1. Vérifiez que le `post_id` est valide
2. Vérifiez le filtre dans le nœud "Update Post"
3. Testez avec ce SQL pour vérifier que le post existe :
```sql
SELECT * FROM posts WHERE id = 'VOTRE-UUID';
```

---

### Erreur : "Check constraint violation"

**Cause :** Le statut `a_valider` n'est pas dans les valeurs autorisées

**Solution :**
1. Vérifiez la contrainte de votre table :
```sql
SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'posts'::regclass
AND conname LIKE '%statut%';
```

2. Utilisez le bon format : `A_Valider` ou `a_valider` selon votre contrainte

---

### Le workflow s'exécute mais rien ne se passe

**Cause :** `image_precedente` est déjà NULL

**Solution :**
1. Vérifiez dans Supabase que le post a bien une valeur dans `image_precedente`
2. Le nœud "Check & Restore" lève une erreur si `image_precedente` est NULL (comportement attendu)

---

## ✅ Checklist de Configuration

Avant de tester, vérifiez :

- [ ] La colonne `image_precedente` existe dans Supabase
- [ ] Le credential Supabase est configuré dans N8N
- [ ] **Node "Get Post from Supabase"** :
  - [ ] Operation = "Get Many"
  - [ ] Table = "posts"
  - [ ] Limit = 1
  - [ ] Filter : `id` equals `={{ $json.post_id }}`
- [ ] **Node "Update Post"** :
  - [ ] Operation = "Update"
  - [ ] Table = "posts"
  - [ ] Filter : `id` equals `={{ $json.post_id }}`
  - [ ] Field 1 : `image_url` = `={{ $json.image_url }}`
  - [ ] Field 2 : `image_precedente` = `null`
  - [ ] Field 3 : `statut` = `a_valider`
  - [ ] Field 4 : `updated_at` = `={{ $now.toISO() }}`
- [ ] Le workflow est activé (toggle vert)
- [ ] L'URL du webhook est copiée dans `.env.local` du webapp

---

## 🎯 Résumé Rapide

### Node "Get Post from Supabase"
```
Operation: Get Many
Table: posts
Limit: 1
Filter: id = {{ $json.post_id }}
```

### Node "Update Post"
```
Operation: Update
Table: posts
Filter: id = {{ $json.post_id }}
Fields:
  - image_url: {{ $json.image_url }}
  - image_precedente: null
  - statut: a_valider
  - updated_at: {{ $now.toISO() }}
```

---

**Vous êtes maintenant prêt à configurer et tester le workflow 2b !** 🚀

Pour toute question, référez-vous aux sections de dépannage ou vérifiez les executions dans N8N.
