-- Migration 004: Add image_precedente column
-- Adds separate column for image history (separate from text history)

-- Ajouter colonne pour historique de l'image précédente
ALTER TABLE posts
ADD COLUMN IF NOT EXISTS image_precedente TEXT;

COMMENT ON COLUMN posts.image_precedente IS 'URL de l''image précédente (avant modification IA)';

-- Index pour optimiser les requêtes de restauration d'image
CREATE INDEX IF NOT EXISTS idx_posts_image_precedente
ON posts(image_precedente) WHERE image_precedente IS NOT NULL;
