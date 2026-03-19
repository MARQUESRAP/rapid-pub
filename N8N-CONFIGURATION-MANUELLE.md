# 🛠️ Configuration manuelle des workflows n8n

Les fichiers JSON simplifiés permettent l'import, mais vous devrez configurer manuellement certains paramètres.

---

## 📥 Import des workflows

1. **Menu n8n (☰) → Import from File**
2. Sélectionner `n8n-workflow-1-modify-text.json`
3. Le workflow s'ouvre (certains nodes auront des alertes ⚠️)
4. Répéter pour `n8n-workflow-1b-restore-version.json`

---

## ⚙️ Configuration Workflow 1 : Modification de texte

### Node 1 : Webhook ✅
**Déjà configuré** - Rien à faire

---

### Node 2 : Get Post from Supabase

1. **Cliquer sur le node**
2. **Credential** : Sélectionner votre credential Supabase
3. **Operation** : `Get Many` (ou `Select`)
4. **Table** : `posts`
5. **Return All** : OFF
6. **Limit** : `1`
7. **Filters** → **Add Filter** :
   - **Field** : `id`
   - **Operator** : `equals`
   - **Value** : `={{ $json.post_id }}`

---

### Node 3 : Save Previous Version ✅
**Code Node déjà configuré** - Rien à faire

---

### Node 4 : Set Status "Modification_En_Cours"

1. **Cliquer sur le node**
2. **Credential** : Sélectionner Supabase
3. **Operation** : `Update`
4. **Table** : `posts`
5. **Update Key** : `id`
6. **Update Key Value** : `={{ $json.post_id }}`
7. **Columns** → **Add Column** (2 colonnes) :

   **Colonne 1** :
   - **Column** : `statut`
   - **Value** : `Modification_En_Cours`

   **Colonne 2** :
   - **Column** : `updated_at`
   - **Value** : `={{ $now.toISO() }}`

---

### Node 5 : GPT-4o Modify Text

**Option A : Utiliser le node OpenAI Chat (Recommandé)**

1. **Supprimer le node actuel**
2. **Ajouter un nouveau node** : Rechercher `OpenAI` → Sélectionner `OpenAI Chat Model`
3. **Credential** : Sélectionner votre credential OpenAI
4. **Model** : `gpt-4o`
5. **Messages** → **Add Message** (2 messages) :

   **Message 1 (System)** :
   - **Role** : `System`
   - **Content** :
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

   **Message 2 (User)** :
   - **Role** : `User`
   - **Content** :
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

6. **Options** → **Add Option** :
   - **Temperature** : `0.7`
   - **Max Tokens** : `2000`

**Option B : Utiliser HTTP Request vers OpenAI API**

1. **Supprimer le node actuel**
2. **Ajouter** : `HTTP Request`
3. **Method** : `POST`
4. **URL** : `https://api.openai.com/v1/chat/completions`
5. **Authentication** : `Generic Credential Type` → `Header Auth`
   - **Name** : `Authorization`
   - **Value** : `Bearer YOUR_OPENAI_API_KEY`
6. **Body** : `JSON`
7. **JSON** :
```json
{
  "model": "gpt-4o",
  "temperature": 0.7,
  "max_tokens": 2000,
  "messages": [
    {
      "role": "system",
      "content": "Tu es un expert en rédaction LinkedIn pour Rapid Pub, une imprimerie en ligne B2B française avec livraison en 24h.\n\nRÈGLES DE MODIFICATION :\n1. Modifie UNIQUEMENT les éléments concernés par la demande de l'utilisateur\n2. Conserve la même longueur approximative (±20%)\n3. Conserve le même ton : relâché et cool, mais professionnel\n4. Conserve les hashtags existants SAUF si l'utilisateur demande de les changer\n5. Ne change PAS la catégorie du post\n6. Garde la structure : Hook → Corps → CTA → Hashtags\n\nIDENTITÉ RAPID PUB :\n- Imprimerie en ligne B2B\n- Livraison en 24h\n- Cible : PME, agences, commerces\n- Ton : Accessible, pas corporate, expert mais pas hautain\n\nFORMAT DE SORTIE OBLIGATOIRE (JSON) :\n{\n  \"hook\": \"Nouveau hook si modifié, sinon l'ancien\",\n  \"corps\": \"Nouveau corps si modifié, sinon l'ancien\",\n  \"cta\": \"Nouveau CTA si modifié, sinon l'ancien\",\n  \"hashtags\": \"Nouveaux hashtags si modifiés, sinon les anciens\",\n  \"modifications_effectuees\": \"Description courte de ce qui a été changé\"\n}"
    },
    {
      "role": "user",
      "content": "Voici le post LinkedIn actuel :\n\nHOOK :\n{{ $json.current_hook }}\n\nCORPS :\n{{ $json.current_corps }}\n\nCTA :\n{{ $json.current_cta }}\n\nHASHTAGS :\n{{ $json.current_hashtags }}\n\n---\n\nDEMANDE DE MODIFICATION :\n{{ $json.user_prompt }}\n\n---\n\nApplique les modifications demandées en respectant les règles. Réponds uniquement en JSON valide."
    }
  ]
}
```

---

### Node 6 : Parse Response ✅
**Code Node déjà configuré**

Si vous utilisez HTTP Request pour OpenAI, modifiez le code :
```javascript
const response = $input.first().json;
const previousData = $('Save Previous Version').first().json;

// Pour HTTP Request, la réponse est dans choices[0].message.content
let content = response.choices?.[0]?.message?.content || response.message?.content || response.content;

// Nettoyer le JSON si wrapped dans markdown
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

### Node 7 : Update Post in Supabase

1. **Credential** : Sélectionner Supabase
2. **Operation** : `Update`
3. **Table** : `posts`
4. **Update Key** : `id`
5. **Update Key Value** : `={{ $json.post_id }}`
6. **Columns** → **Add Column** (7 colonnes) :

   - **Column** : `hook` | **Value** : `={{ $json.hook }}`
   - **Column** : `corps` | **Value** : `={{ $json.corps }}`
   - **Column** : `cta` | **Value** : `={{ $json.cta }}`
   - **Column** : `hashtags` | **Value** : `={{ $json.hashtags }}`
   - **Column** : `version_precedente` | **Value** : `={{ $json.version_precedente }}`
   - **Column** : `statut` | **Value** : `a_valider`
   - **Column** : `updated_at` | **Value** : `={{ $now.toISO() }}`

---

### Node 8 : Respond to Webhook ✅
**Code Node déjà configuré** - Rien à faire

---

### Node 9 : Error Trigger ✅
**Déjà configuré** - Rien à faire

---

### Node 10 : Rollback Status

1. **Credential** : Sélectionner Supabase
2. **Operation** : `Update`
3. **Table** : `posts`
4. **Update Key** : `id`
5. **Update Key Value** : `={{ $('Webhook').first().json.post_id }}`
6. **Columns** → **Add Column** (2 colonnes) :
   - **Column** : `statut` | **Value** : `a_valider`
   - **Column** : `updated_at` | **Value** : `={{ $now.toISO() }}`

---

### Node 11 : Error Response ✅
**Code Node déjà configuré** - Rien à faire

---

## ⚙️ Configuration Workflow 1b : Restaurer Version

### Node 1 : Webhook ✅
**Déjà configuré**

---

### Node 2 : Get Post from Supabase

Même configuration que Workflow 1, Node 2

---

### Node 3 : Parse & Restore ✅
**Code Node déjà configuré**

---

### Node 4 : Update Post

1. **Credential** : Sélectionner Supabase
2. **Operation** : `Update`
3. **Table** : `posts`
4. **Update Key** : `id`
5. **Update Key Value** : `={{ $json.post_id }}`
6. **Columns** → **Add Column** (7 colonnes) :
   - **Column** : `hook` | **Value** : `={{ $json.hook }}`
   - **Column** : `corps` | **Value** : `={{ $json.corps }}`
   - **Column** : `cta` | **Value** : `={{ $json.cta }}`
   - **Column** : `hashtags` | **Value** : `={{ $json.hashtags }}`
   - **Column** : `version_precedente` | **Value** : `null`
   - **Column** : `statut` | **Value** : `a_valider`
   - **Column** : `updated_at` | **Value** : `={{ $now.toISO() }}`

---

### Node 5 : Respond ✅
**Code Node déjà configuré**

---

## ✅ Activation et test

1. **Activer les deux workflows** (toggle Active en haut à droite)
2. **Récupérer les URLs** :
   - Workflow 1 : Cliquer sur node Webhook → Copier l'URL
   - Workflow 1b : Cliquer sur node Webhook → Copier l'URL
3. **Ajouter dans `.env.local`** :
```bash
NEXT_PUBLIC_N8N_MODIFY_TEXT_URL=https://votre-url/webhook/modify-text
NEXT_PUBLIC_N8N_RESTORE_VERSION_URL=https://votre-url/webhook/restore-version
```
4. **Tester avec curl** (voir N8N-SETUP-GUIDE.md)

---

## 🐛 Points d'attention

### Hashtags
Si Supabase stocke `hashtags` comme un array PostgreSQL, utilisez cette valeur :
- **Value** : `={{ JSON.parse($json.hashtags) }}`

### Version précédente null
Pour mettre `version_precedente` à NULL dans Workflow 1b :
- Laisser le champ **Value** vide
- OU utiliser : `={{ null }}`

### GPT-4o response format
Si GPT retourne la réponse dans un format différent, ajustez le node "Parse Response".

---

Bon courage ! 🚀
