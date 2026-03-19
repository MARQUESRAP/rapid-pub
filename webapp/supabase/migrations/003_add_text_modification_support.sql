-- Migration 003: Add text modification support
-- Adds version history column and Modification_En_Cours status

-- Ajouter colonne pour historique des versions
ALTER TABLE posts
ADD COLUMN IF NOT EXISTS version_precedente JSONB;

COMMENT ON COLUMN posts.version_precedente IS 'Historique de la version avant modification IA';

-- Mettre à jour la contrainte de statut pour inclure Modification_En_Cours
ALTER TABLE posts
DROP CONSTRAINT IF EXISTS posts_statut_check;

ALTER TABLE posts
ADD CONSTRAINT posts_statut_check
CHECK (statut IN ('a_valider', 'valide', 'publie', 'archive', 'Modification_En_Cours'));

-- Index pour filtrer les posts en cours de modification (améliore les performances)
CREATE INDEX IF NOT EXISTS idx_posts_statut_modification
ON posts(statut) WHERE statut = 'Modification_En_Cours';
