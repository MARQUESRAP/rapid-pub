-- Add missing fields from Airtable to posts table

ALTER TABLE posts
ADD COLUMN IF NOT EXISTS date_generation TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS format_visuel TEXT,
ADD COLUMN IF NOT EXISTS prompt_image TEXT,
ADD COLUMN IF NOT EXISTS suggestions_ia TEXT;

-- Create logs_workflow table
CREATE TABLE IF NOT EXISTS logs_workflow (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date_execution TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  statut TEXT NOT NULL CHECK (statut IN ('Succes', 'Partiel', 'Echec')),
  posts_generes INTEGER DEFAULT 0,
  images_generees INTEGER DEFAULT 0,
  erreurs TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for logs
CREATE INDEX idx_logs_date_execution ON logs_workflow(date_execution DESC);
CREATE INDEX idx_logs_statut ON logs_workflow(statut);

-- Comment on tables
COMMENT ON TABLE posts IS 'Table des posts LinkedIn générés par le workflow';
COMMENT ON TABLE logs_workflow IS 'Logs d''exécution du workflow de génération de posts';

-- Comment on new columns
COMMENT ON COLUMN posts.date_generation IS 'Date de génération du post par le workflow';
COMMENT ON COLUMN posts.format_visuel IS 'Format de l''image (carrousel, photo_style, etc.)';
COMMENT ON COLUMN posts.prompt_image IS 'Prompt utilisé pour générer l''image via DALL-E';
COMMENT ON COLUMN posts.suggestions_ia IS 'Suggestions d''amélioration générées par l''IA';
