# Scripts de Migration

Ce dossier contient les scripts utilitaires pour migrer les données d'Airtable vers Supabase.

---

## 📄 migrate_csv_to_supabase.py

Script Python pour migrer automatiquement les données depuis les exports CSV Airtable vers Supabase.

### Installation

```bash
pip install psycopg2-binary python-dotenv
```

### Configuration

1. Copiez `.env.example` vers `.env` :
   ```bash
   cp .env.example .env
   ```

2. Éditez `.env` avec vos credentials Supabase :
   ```bash
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_PASSWORD=your-database-password
   ```

   **Trouver le mot de passe :**
   - Allez sur [supabase.com](https://supabase.com)
   - Ouvrez votre projet
   - Settings → Database
   - Section "Connection string" → "Password"

### Usage

#### Migrer les posts uniquement
```bash
python migrate_csv_to_supabase.py --posts "path/to/Posts_LinkedIn-Grid view.csv"
```

#### Migrer les logs uniquement
```bash
python migrate_csv_to_supabase.py --logs "path/to/Logs_Workflow-Grid view.csv"
```

#### Migrer les deux
```bash
python migrate_csv_to_supabase.py \
  --posts "Posts_LinkedIn-Grid view.csv" \
  --logs "Logs_Workflow-Grid view.csv"
```

#### Vider les tables avant migration
```bash
python migrate_csv_to_supabase.py \
  --posts "Posts_LinkedIn-Grid view.csv" \
  --clear
```

### Exemple complet

```bash
# Depuis le dossier racine du projet
cd webapp/scripts

# Créer le fichier .env
cp .env.example .env
# Éditer .env avec vos credentials

# Migrer depuis le dossier parent
python migrate_csv_to_supabase.py \
  --posts "../../Posts_LinkedIn-Grid view.csv" \
  --logs "../../Logs_Workflow-Grid view.csv" \
  --clear
```

### Output attendu

```
🚀 Migration Airtable → Supabase
==================================================
✅ Connecté à Supabase

🗑️  Suppression des données existantes...
✅ Tables vidées

📄 Migration des posts depuis: Posts_LinkedIn-Grid view.csv
   ✅ Ligne 2 : Conseils d'impression...
   ✅ Ligne 3 : Astuces impression eco-friendly...

✅ Posts migrés : 2

📄 Migration des logs depuis: Logs_Workflow-Grid view.csv
   ✅ Ligne 2 : 2026-01-01 00:00:00 - Partiel
   ✅ Ligne 3 : 2026-01-23 11:13:00 - Succes
   ✅ Ligne 4 : 2026-01-23 11:20:00 - Succes

✅ Logs migrés : 3

==================================================
✅ Migration terminée!
```

---

## 🔧 Dépannage

### Erreur : "psycopg2 n'est pas installé"
```bash
pip install psycopg2-binary
```

### Erreur : "Variables d'environnement manquantes"
Vérifiez que le fichier `.env` existe et contient `SUPABASE_URL` et `SUPABASE_PASSWORD`.

### Erreur : "Erreur de connexion à Supabase"
- Vérifiez que l'URL est correcte (format: `https://xxxxx.supabase.co`)
- Vérifiez que le mot de passe est correct
- Vérifiez que votre IP est autorisée (Supabase → Settings → Database → Connection pooling)

### Erreur : "Fichier non trouvé"
Utilisez le chemin complet ou relatif correct vers le CSV :
```bash
python migrate_csv_to_supabase.py --posts "../../Posts_LinkedIn-Grid view.csv"
```

---

## 📝 Notes

- Le script détecte automatiquement les lignes vides et les saute
- Les dates sont parsées avec plusieurs formats automatiquement
- Les statuts Airtable sont mappés automatiquement :
  - `A_Valider` → `a_valider`
  - `Planifie` → `valide`
  - `Publie` → `publie`
  - `Archive` → `archive`
- Les hashtags sont automatiquement convertis en array PostgreSQL
- Les erreurs sont affichées mais n'arrêtent pas la migration

---

## 🚀 Alternative : Migration manuelle

Si vous préférez ne pas utiliser le script Python, vous pouvez utiliser directement les fichiers SQL :

1. `supabase/migrations/002_add_airtable_fields.sql` - Ajoute les champs
2. `supabase/seed_real_data.sql` - Insère les données

Voir [MIGRATION_AIRTABLE_TO_SUPABASE.md](../MIGRATION_AIRTABLE_TO_SUPABASE.md) pour plus de détails.
