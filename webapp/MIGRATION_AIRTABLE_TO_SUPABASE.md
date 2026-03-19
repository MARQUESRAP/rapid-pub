# Migration Airtable → Supabase

## 📋 Vue d'ensemble

Ce guide explique comment migrer vos données existantes d'Airtable vers Supabase pour l'application Rapid Pub LinkedIn Manager.

---

## 🔄 Schéma de migration

### Table `posts` - Mapping des champs

| Airtable | Supabase | Type | Notes |
|----------|----------|------|-------|
| Date_Generation | date_generation | TIMESTAMPTZ | Date de génération du post |
| Categorie | categorie | TEXT | Educatif, Coulisses, Actualite, Storytelling, Decale |
| Titre_Interne | titre_interne | TEXT | Titre interne pour identification |
| Hook | hook | TEXT | Accroche du post |
| Corps | corps | TEXT | Corps du post |
| CTA | cta | TEXT | Call-to-action |
| Hashtags | hashtags | TEXT[] | Array de hashtags |
| Format_Visuel | format_visuel | TEXT | carrousel, photo_style, etc. |
| Prompt_Image | prompt_image | TEXT | Prompt DALL-E utilisé |
| URL_Image_1 | image_url | TEXT | URL Cloudinary |
| Score_IA | score_ia | DECIMAL(3,1) | Score 0-10 |
| Suggestions_IA | suggestions_ia | TEXT | Suggestions d'amélioration |
| Statut | statut | TEXT | A_Valider → a_valider, Planifie → valide |
| - | date_publication_prevue | TIMESTAMPTZ | Date de publication planifiée |

### Table `logs_workflow`

| Airtable | Supabase | Type | Notes |
|----------|----------|------|-------|
| Date_Execution | date_execution | TIMESTAMPTZ | Date d'exécution |
| Statut | statut | TEXT | Succes, Partiel, Echec |
| Posts_Generes | posts_generes | INTEGER | Nombre de posts générés |
| Images_Generees | images_generees | INTEGER | Nombre d'images générées |
| Erreurs | erreurs | TEXT | Messages d'erreur |

---

## 🚀 Instructions de migration

### Étape 1 : Exécuter la migration du schéma

Dans votre projet Supabase, allez dans **SQL Editor** et exécutez :

```bash
# Migration 002 - Ajoute les champs Airtable manquants
```

Copiez et collez le contenu de :
📄 `supabase/migrations/002_add_airtable_fields.sql`

**Ce que fait cette migration :**
- ✅ Ajoute `date_generation` à la table posts
- ✅ Ajoute `format_visuel` à la table posts
- ✅ Ajoute `prompt_image` à la table posts
- ✅ Ajoute `suggestions_ia` à la table posts
- ✅ Crée la table `logs_workflow`
- ✅ Ajoute les index nécessaires

---

### Étape 2 : Importer les données réelles

Dans **SQL Editor**, exécutez :

```bash
# Seed - Données réelles depuis Airtable
```

Copiez et collez le contenu de :
📄 `supabase/seed_real_data.sql`

**Ce que fait ce script :**
- 🗑️ Supprime les données de test
- ✅ Insère les 2 posts réels depuis votre Airtable
- ✅ Insère les 3 logs d'exécution

**Résultat attendu :**
```
Success. 2 rows affected (posts)
Success. 3 rows affected (logs_workflow)
```

---

### Étape 3 : Vérifier les données

```sql
-- Voir les posts importés
SELECT
  titre_interne,
  categorie,
  statut,
  score_ia,
  date_generation,
  format_visuel
FROM posts
ORDER BY date_generation DESC;

-- Voir les logs importés
SELECT
  date_execution,
  statut,
  posts_generes,
  images_generees
FROM logs_workflow
ORDER BY date_execution DESC;
```

**Résultat attendu :**
- 2 posts "Educatif" avec score_ia = 7.7
- 3 logs d'exécution

---

## 📥 Migration complète depuis CSV

Si vous avez plus de données dans votre CSV Airtable, voici comment les migrer :

### Script Python de migration

Créez un fichier `migrate_airtable_csv.py` :

```python
import csv
import psycopg2
from datetime import datetime

# Configuration Supabase
SUPABASE_HOST = "your-project.supabase.co"
SUPABASE_DB = "postgres"
SUPABASE_USER = "postgres"
SUPABASE_PASSWORD = "your-password"
SUPABASE_PORT = "5432"

# Connexion
conn = psycopg2.connect(
    host=SUPABASE_HOST,
    database=SUPABASE_DB,
    user=SUPABASE_USER,
    password=SUPABASE_PASSWORD,
    port=SUPABASE_PORT
)
cur = conn.cursor()

# Lire le CSV
with open('Posts_LinkedIn-Grid view.csv', 'r', encoding='utf-8-sig') as f:
    reader = csv.DictReader(f)

    for row in reader:
        # Skip empty rows
        if not row['Titre_Interne']:
            continue

        # Parse date
        date_gen = None
        if row['Date_Generation']:
            date_gen = datetime.strptime(row['Date_Generation'], '%m/%d/%Y %I:%M%p')

        # Parse hashtags
        hashtags = [h.strip() for h in row['Hashtags'].split() if h.strip()]

        # Map status
        statut_map = {
            'A_Valider': 'a_valider',
            'Planifie': 'valide',
            'Publie': 'publie'
        }
        statut = statut_map.get(row['Statut'], 'a_valider')

        # Insert
        cur.execute("""
            INSERT INTO posts (
                date_generation, categorie, titre_interne, hook, corps, cta,
                hashtags, format_visuel, prompt_image, image_url, score_ia,
                suggestions_ia, statut
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            date_gen,
            row['Categorie'],
            row['Titre_Interne'],
            row['Hook'],
            row['Corps'],
            row['CTA'],
            hashtags,
            row['Format_Visuel'],
            row['Prompt_Image'],
            row['URL_Image_1'],
            float(row['Score_IA']) if row['Score_IA'] else None,
            row['Suggestions_IA'] or None,
            statut
        ))

conn.commit()
cur.close()
conn.close()

print("✅ Migration terminée!")
```

**Exécuter :**
```bash
pip install psycopg2-binary
python migrate_airtable_csv.py
```

---

## 🔧 Mapping des statuts

Airtable → Supabase :
- `A_Valider` → `a_valider`
- `Planifie` → `valide`
- `Publie` → `publie`
- `Archive` → `archive`

---

## 🎨 Nouveaux champs dans l'interface

Les nouveaux champs sont maintenant disponibles dans l'interface :

### Interface TypeScript mise à jour

```typescript
interface Post {
  // ... champs existants

  // Nouveaux champs Airtable
  date_generation?: string | null;
  format_visuel?: string | null;
  prompt_image?: string | null;
  suggestions_ia?: string | null;
}

interface WorkflowLog {
  id: string;
  date_execution: string;
  statut: 'Succes' | 'Partiel' | 'Echec';
  posts_generes: number | null;
  images_generees: number | null;
  erreurs: string | null;
}
```

---

## 📊 Utilisation dans l'application

### Afficher la date de génération

```typescript
{post.date_generation && (
  <span>
    Généré le {formatDateFr(post.date_generation, 'd MMMM yyyy')}
  </span>
)}
```

### Afficher le format visuel

```typescript
{post.format_visuel && (
  <Badge>{post.format_visuel}</Badge>
)}
```

### Afficher les suggestions IA

```typescript
{post.suggestions_ia && (
  <div className="suggestions">
    <h4>Suggestions d'amélioration</h4>
    <p>{post.suggestions_ia}</p>
  </div>
)}
```

---

## 🔄 Synchronisation continue

Pour synchroniser automatiquement Airtable → Supabase, vous pouvez :

### Option 1 : Webhook Airtable → n8n → Supabase

1. Créer une automation Airtable qui déclenche sur "Nouveau record"
2. Appeler un webhook n8n
3. n8n insère dans Supabase

### Option 2 : Script Python périodique

```python
# Exécuter toutes les heures via cron
# Récupère les nouveaux posts depuis Airtable
# Insère dans Supabase
```

### Option 3 : Migration manuelle

Exporter CSV depuis Airtable → Exécuter script de migration

---

## ✅ Checklist de migration

- [ ] Exécuter migration 001 (schéma de base)
- [ ] Exécuter migration 002 (champs Airtable)
- [ ] Vérifier que les tables existent
- [ ] Exécuter seed_real_data.sql
- [ ] Vérifier les données importées
- [ ] Tester l'application avec les vraies données
- [ ] (Optionnel) Migrer tout l'historique avec le script Python

---

## 🐛 Dépannage

### Erreur : "column already exists"
**Solution :** Les colonnes ont déjà été ajoutées. Continuez avec le seed.

### Erreur : "constraint violation"
**Solution :** Vérifiez que les valeurs de `statut` correspondent aux valeurs autorisées.

### Erreur : "invalid input syntax for type timestamp"
**Solution :** Vérifiez le format des dates. Utilisez le format ISO 8601.

---

## 📞 Support

Si vous rencontrez des problèmes, vérifiez :
1. Les logs Supabase (Dashboard → Database → Logs)
2. Les contraintes de la table (Dashboard → Table Editor → Structure)
3. Les types de données (doivent correspondre au schéma)

---

**Migration terminée ! 🎉**

Vos données Airtable sont maintenant dans Supabase et prêtes à être utilisées par l'application Rapid Pub LinkedIn Manager.
