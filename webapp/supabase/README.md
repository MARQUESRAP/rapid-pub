# Supabase Setup Instructions

## 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign in or create an account
3. Click "New Project"
4. Fill in:
   - **Project name**: `rapid-pub-linkedin`
   - **Database password**: (generate a strong password)
   - **Region**: Choose closest to France (e.g., Frankfurt, eu-central-1)
5. Wait for project to be created (~2 minutes)

## 2. Get Your API Keys

1. In your Supabase project, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **Project API keys** → **anon public** (this is your ANON_KEY)

## 3. Configure Environment Variables

1. In the webapp root, create a `.env.local` file (copy from `.env.local.example`)
2. Add your Supabase credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## 4. Run the Migration

1. In your Supabase project, go to **SQL Editor**
2. Click "New Query"
3. Copy the contents of `migrations/001_initial_schema.sql`
4. Paste into the editor and click "Run"
5. You should see: "Success. No rows returned"

## 5. Seed the Database

1. In the **SQL Editor**, create another "New Query"
2. Copy the contents of `seed.sql`
3. Paste and click "Run"
4. You should see: "Success. Returned 6 rows"

## 6. Verify Setup

1. Go to **Table Editor** in Supabase
2. You should see the `posts` table
3. Click on it to see your 6 test posts:
   - 4 with `statut = 'a_valider'`
   - 2 with `statut = 'valide'` (already scheduled)

## 7. Test the Scheduling Function

In the SQL Editor, run:

```sql
SELECT get_next_available_slot();
```

This should return the next available Tuesday 10am or Thursday 2pm slot in the future.

---

## Database Schema

### Table: `posts`

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| titre_interne | TEXT | Internal title for identification |
| categorie | ENUM | Educatif, Coulisses, Actualite, Storytelling, Decale |
| hook | TEXT | Attention-grabbing opening |
| corps | TEXT | Main post body |
| cta | TEXT | Call to action |
| hashtags | TEXT[] | Array of hashtags |
| image_url | TEXT | Cloudinary image URL |
| score_ia | DECIMAL | AI score (0-10) |
| statut | ENUM | a_valider, valide, publie, archive |
| date_publication_prevue | TIMESTAMPTZ | Scheduled publication date (UNIQUE) |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp (auto-updated) |
| validated_at | TIMESTAMPTZ | Validation timestamp |

### Function: `get_next_available_slot()`

Returns the next available time slot:
- **Tuesday 10:00** Europe/Paris
- **Thursday 14:00** Europe/Paris

Checks up to 52 weeks in advance.

---

## Troubleshooting

### Issue: Migration fails with "extension uuid-ossp already exists"
**Solution**: This is fine. The extension was already enabled. Continue with the rest of the migration.

### Issue: Seed fails with "duplicate key value violates unique constraint"
**Solution**: The posts were already inserted. You can skip this or delete all posts first:
```sql
DELETE FROM posts;
```

### Issue: Function returns error
**Solution**: Make sure the migration ran completely. Check that the `posts` table exists.

---

## Next Steps

Once Supabase is configured:
1. Update your `.env.local` with the credentials
2. Start the Next.js dev server: `npm run dev`
3. Navigate to `http://localhost:3000`
