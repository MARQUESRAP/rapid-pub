# 🚀 Guide d'installation n8n - Workflows de modification de texte

Ce guide vous permet d'importer et configurer les workflows n8n pour la modification de texte LinkedIn.

---

## 📦 Fichiers à importer

Deux fichiers JSON sont fournis dans le projet :

1. **`n8n-workflow-1-modify-text.json`** - Workflow principal de modification
2. **`n8n-workflow-1b-restore-version.json`** - Workflow de restauration

---

## 🔧 Prérequis dans n8n

Avant d'importer les workflows, vous devez configurer vos **Credentials** dans n8n :

### 1. Supabase API Credentials

**Nom dans n8n** : `Supabase account`

1. Aller dans **Settings → Credentials → New**
2. Chercher **Supabase**
3. Remplir les champs :
   - **Host** : `https://ajufioyljbuhjbvawuee.supabase.co`
   - **Service Role Secret** : Votre clé `service_role` Supabase
     - Allez dans Supabase Dashboard → Settings → API
     - Copiez la clé `service_role` (PAS la clé `anon`)
4. Cliquer **Save**

> ⚠️ **Important** : Utilisez la clé `service_role` pour n8n (backend), pas la clé `anon` (frontend)

### 2. OpenAI API Credentials

**Nom dans n8n** : `OpenAI account`

1. Aller dans **Settings → Credentials → New**
2. Chercher **OpenAI**
3. Remplir :
   - **API Key** : Votre clé OpenAI (commence par `sk-...`)
4. Cliquer **Save**

---

## 📥 Import des workflows

### Méthode 1 : Import via l'interface n8n (Recommandé)

1. **Ouvrir n8n** → Cliquer sur le menu hamburger (☰) en haut à gauche
2. Cliquer sur **Import from File**
3. Sélectionner `n8n-workflow-1-modify-text.json`
4. Le workflow s'ouvre dans l'éditeur
5. Répéter pour `n8n-workflow-1b-restore-version.json`

### Méthode 2 : Import via CLI n8n

```bash
# Si vous utilisez n8n en ligne de commande
n8n import:workflow --input=n8n-workflow-1-modify-text.json
n8n import:workflow --input=n8n-workflow-1b-restore-version.json
```

---

## ⚙️ Configuration post-import

### Workflow 1 : Modification de texte

Après l'import, vous devez **connecter vos credentials** :

1. **Ouvrir le workflow** dans l'éditeur n8n

2. **Node "Get Post from Supabase"**
   - Cliquer sur le node
   - Dans le panneau de droite, section **Credential to connect with**
   - Sélectionner votre credential **Supabase account**

3. **Node "Set Status Modification_En_Cours"**
   - Même opération : sélectionner **Supabase account**

4. **Node "GPT-4o Modify Text"**
   - Sélectionner votre credential **OpenAI account**

5. **Node "Update Post in Supabase"**
   - Sélectionner **Supabase account**

6. **Node "Rollback Status"** (dans le flow d'erreur)
   - Sélectionner **Supabase account**

7. **Activer le workflow**
   - Toggle **Active** en haut à droite
   - Le statut doit passer à "Active"

8. **Récupérer l'URL du webhook**
   - Cliquer sur le node **Webhook**
   - Copier l'URL affichée (ex: `https://votre-n8n.com/webhook/modify-text`)
   - La sauvegarder pour le `.env.local`

### Workflow 1b : Restaurer version

Même procédure :

1. Ouvrir le workflow
2. Connecter les credentials Supabase sur :
   - **Get Post from Supabase**
   - **Update Post**
3. Activer le workflow
4. Récupérer l'URL du webhook `/restore-version`

---

## 🔗 Configuration des URLs dans Next.js

Une fois les deux workflows actifs, copiez les URLs webhook dans votre fichier `/webapp/.env.local` :

```bash
# n8n Webhooks
NEXT_PUBLIC_N8N_MODIFY_TEXT_URL=https://votre-n8n.com/webhook/modify-text
NEXT_PUBLIC_N8N_RESTORE_VERSION_URL=https://votre-n8n.com/webhook/restore-version
```

**Redémarrez Next.js** :
```bash
cd webapp
npm run dev
```

---

## 🧪 Test des workflows

### Test 1 : Workflow de modification

Utilisez **Postman**, **Insomnia**, ou **curl** pour tester :

```bash
curl -X POST https://votre-n8n.com/webhook/modify-text \
  -H "Content-Type: application/json" \
  -d '{
    "post_id": "uuid-existant-dans-supabase",
    "prompt": "Ajoute plus d'émojis"
  }'
```

**Réponse attendue** :
```json
{
  "success": true,
  "post_id": "uuid-du-post",
  "modifications": "Ajout de 3 émojis dans le hook et le corps"
}
```

**Vérifications** :
1. ✅ Le workflow s'exécute sans erreur dans n8n
2. ✅ Dans Supabase, le statut passe temporairement à `Modification_En_Cours`
3. ✅ Le post est mis à jour avec le nouveau texte
4. ✅ Le statut repasse à `a_valider`
5. ✅ `version_precedente` contient la version originale

### Test 2 : Workflow de restauration

```bash
curl -X POST https://votre-n8n.com/webhook/restore-version \
  -H "Content-Type: application/json" \
  -d '{
    "post_id": "uuid-du-post-modifie"
  }'
```

**Réponse attendue** :
```json
{
  "success": true,
  "message": "Version précédente restaurée"
}
```

**Vérifications** :
1. ✅ Le post revient à la version originale
2. ✅ `version_precedente` est remis à `null`
3. ✅ Statut repasse à `a_valider`

---

## 🐛 Résolution de problèmes

### Erreur : "Credential not found"
- **Cause** : Les credentials ne sont pas connectés
- **Solution** : Revenir à "Configuration post-import" et connecter tous les credentials

### Erreur : "Table 'posts' not found"
- **Cause** : La migration SQL n'a pas été exécutée
- **Solution** : Exécuter `webapp/supabase/migrations/003_add_text_modification_support.sql` dans Supabase

### Erreur : "Column 'version_precedente' does not exist"
- **Cause** : Colonne manquante dans Supabase
- **Solution** : Exécuter la migration SQL (voir ci-dessus)

### Erreur : "Invalid enum value for statut"
- **Cause** : Le statut `Modification_En_Cours` n'est pas dans la contrainte
- **Solution** : Exécuter la migration SQL qui met à jour la contrainte

### Le workflow ne se déclenche pas
- **Cause** : Workflow pas actif OU mauvaise URL
- **Solution** :
  1. Vérifier que le toggle **Active** est ON
  2. Vérifier l'URL du webhook dans n8n
  3. Vérifier que l'URL dans `.env.local` est correcte

### GPT-4o retourne une erreur
- **Cause** : Clé OpenAI invalide ou quota dépassé
- **Solution** :
  1. Vérifier la clé API dans les credentials
  2. Vérifier le quota sur platform.openai.com
  3. Vérifier que vous avez accès au modèle `gpt-4o`

### Le JSON parsing échoue
- **Cause** : GPT-4o retourne du texte au lieu de JSON
- **Solution** : Le node "Parse Response" gère déjà ce cas (retire les ```json)
  - Si ça persiste, modifier le system prompt pour insister sur "JSON uniquement"

---

## 📊 Monitoring des workflows

### Dans n8n

1. **Executions** → Voir l'historique de toutes les exécutions
2. Cliquer sur une exécution pour voir le détail de chaque node
3. En cas d'erreur, le flow d'erreur est exécuté automatiquement

### Logs utiles

Vous pouvez ajouter un node **Set** avant "Respond" pour logger :
```javascript
console.log('Modification completed:', {
  post_id: $json.post_id,
  modifications: $json.modifications_effectuees
});
```

---

## 🎯 Checklist finale

Avant de passer en production :

- [ ] Migration SQL exécutée dans Supabase
- [ ] Credentials Supabase configurés dans n8n
- [ ] Credentials OpenAI configurés dans n8n
- [ ] Workflow 1 importé et actif
- [ ] Workflow 1b importé et actif
- [ ] URLs webhook copiées dans `.env.local`
- [ ] Next.js redémarré
- [ ] Test avec Postman/curl réussi
- [ ] Test end-to-end depuis l'app Next.js réussi

---

## 💡 Optimisations possibles

### 1. Ajouter un rate limit
Ajouter un node **Rate Limit** avant GPT-4o pour éviter de dépasser le quota OpenAI

### 2. Logger dans une table Supabase
Créer une table `modification_logs` et ajouter un node pour y enregistrer chaque modification

### 3. Notifications
Ajouter un node **Send Email** ou **Slack** pour être notifié des modifications

### 4. Retry automatique
Configurer **Retry on Fail** sur le node GPT-4o :
- Settings du node → **Retry On Fail**
- Max Tries : 3
- Wait Between Tries : 5000ms

---

## 📞 Support

Si vous rencontrez des problèmes :

1. Vérifier les logs d'exécution dans n8n (menu Executions)
2. Vérifier les logs Supabase (Database → Logs)
3. Tester chaque node individuellement en mode "Test workflow"

Bon courage ! 🚀
