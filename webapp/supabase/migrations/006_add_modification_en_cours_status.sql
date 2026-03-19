-- ============================================
-- Migration 006: Ajouter le statut 'Modification_En_Cours' à posts_promo
-- ============================================

ALTER TABLE posts_promo DROP CONSTRAINT posts_promo_statut_check;

ALTER TABLE posts_promo ADD CONSTRAINT posts_promo_statut_check
  CHECK (statut IN ('A_Valider', 'Valide', 'Planifie', 'Publie', 'Rejete', 'Modifie', 'Modification_En_Cours', 'Erreur_Publication'));
