-- ============================================
-- Migration 007: Ajouter version_precedente à posts_promo
-- Permet de restaurer la version précédente du texte après modification
-- ============================================

ALTER TABLE posts_promo ADD COLUMN IF NOT EXISTS version_precedente JSONB;

COMMENT ON COLUMN posts_promo.version_precedente IS 'Sauvegarde du hook, corps, cta avant modification (permet rollback)';
