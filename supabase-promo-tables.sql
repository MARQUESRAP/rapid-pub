-- ============================================
-- SCRIPT SQL SUPABASE - Tables Promo Rapid Pub
-- ============================================

-- Table des produits a promouvoir
CREATE TABLE IF NOT EXISTS produits_promo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference TEXT NOT NULL,
  nom_produit TEXT NOT NULL,
  categorie TEXT NOT NULL,
  url_image TEXT NOT NULL,
  couleurs_dispo TEXT,
  description TEXT,
  statut TEXT NOT NULL DEFAULT 'A_Poster'
    CONSTRAINT produits_promo_statut_check CHECK (statut IN ('A_Poster', 'En_Cours', 'Poste')),
  priorite INTEGER DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  posted_at TIMESTAMPTZ
);

-- Index pour optimiser les requetes
CREATE INDEX IF NOT EXISTS idx_produits_promo_statut ON produits_promo(statut);
CREATE INDEX IF NOT EXISTS idx_produits_promo_priorite ON produits_promo(priorite);
CREATE INDEX IF NOT EXISTS idx_produits_promo_created ON produits_promo(created_at);

-- Commentaires
COMMENT ON TABLE produits_promo IS 'Produits Rapid Pub a promouvoir sur LinkedIn';
COMMENT ON COLUMN produits_promo.statut IS 'A_Poster = en attente, En_Cours = post genere, Poste = publie sur LinkedIn';
COMMENT ON COLUMN produits_promo.priorite IS 'Plus le nombre est bas, plus la priorite est haute (1 = urgent)';

-- ============================================

-- Table des posts promo generes
CREATE TABLE IF NOT EXISTS posts_promo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  produit_id UUID REFERENCES produits_promo(id) ON DELETE SET NULL,
  reference_produit TEXT,
  nom_produit TEXT,
  categorie_produit TEXT,
  hook TEXT,
  corps TEXT,
  cta TEXT,
  hashtags TEXT,
  image_originale_url TEXT,
  image_transformee_url TEXT,
  prompt_transformation TEXT,
  analyse_produit JSONB,
  statut TEXT NOT NULL DEFAULT 'A_Valider'
    CONSTRAINT posts_promo_statut_check CHECK (statut IN ('A_Valider', 'Valide', 'Planifie', 'Publie', 'Rejete', 'Modifie', 'Erreur_Publication')),
  score_ia DECIMAL(3,1),
  date_publication_prevue TIMESTAMPTZ,
  date_publication_effective TIMESTAMPTZ,
  linkedin_post_id TEXT,
  lien_post_linkedin TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour optimiser les requetes
CREATE INDEX IF NOT EXISTS idx_posts_promo_statut ON posts_promo(statut);
CREATE INDEX IF NOT EXISTS idx_posts_promo_produit ON posts_promo(produit_id);
CREATE INDEX IF NOT EXISTS idx_posts_promo_date_pub ON posts_promo(date_publication_prevue);
CREATE INDEX IF NOT EXISTS idx_posts_promo_created ON posts_promo(created_at);

-- Commentaires
COMMENT ON TABLE posts_promo IS 'Posts LinkedIn promotionnels generes pour les produits Rapid Pub';
COMMENT ON COLUMN posts_promo.statut IS 'A_Valider = en attente validation, Valide = approuve, Planifie = programme, Publie = sur LinkedIn';
COMMENT ON COLUMN posts_promo.analyse_produit IS 'JSON contenant l analyse IA du produit (type, couleur, materiau, etc.)';

-- ============================================
-- Trigger pour mettre a jour updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger sur posts_promo
DROP TRIGGER IF EXISTS trigger_posts_promo_updated_at ON posts_promo;
CREATE TRIGGER trigger_posts_promo_updated_at
  BEFORE UPDATE ON posts_promo
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Fonction RPC pour obtenir le prochain slot disponible (posts promo)
-- ============================================

CREATE OR REPLACE FUNCTION get_next_available_slot_promo()
RETURNS TIMESTAMPTZ AS $$
DECLARE
  next_slot TIMESTAMPTZ;
  current_ts TIMESTAMPTZ := NOW() AT TIME ZONE 'Europe/Paris';
  check_date DATE := current_ts::DATE;
  slot_hour INTEGER;
  slot_day INTEGER;
  max_iterations INTEGER := 30; -- Limite a 30 jours
  iteration INTEGER := 0;
BEGIN
  -- Chercher le prochain creneau libre (Mardi 10h ou Jeudi 14h)
  WHILE iteration < max_iterations LOOP
    slot_day := EXTRACT(DOW FROM check_date);

    -- Mardi = 2, Jeudi = 4
    IF slot_day = 2 THEN
      slot_hour := 10;
      next_slot := check_date + INTERVAL '10 hours';

      -- Verifier si ce slot est libre (pas de post valeur ni promo)
      IF next_slot > current_ts AND NOT EXISTS (
        SELECT 1 FROM posts WHERE date_publication_prevue = next_slot AND statut IN ('Valide', 'Planifie')
        UNION ALL
        SELECT 1 FROM posts_promo WHERE date_publication_prevue = next_slot AND statut IN ('Valide', 'Planifie')
      ) THEN
        RETURN next_slot;
      END IF;

    ELSIF slot_day = 4 THEN
      slot_hour := 14;
      next_slot := check_date + INTERVAL '14 hours';

      IF next_slot > current_ts AND NOT EXISTS (
        SELECT 1 FROM posts WHERE date_publication_prevue = next_slot AND statut IN ('Valide', 'Planifie')
        UNION ALL
        SELECT 1 FROM posts_promo WHERE date_publication_prevue = next_slot AND statut IN ('Valide', 'Planifie')
      ) THEN
        RETURN next_slot;
      END IF;
    END IF;

    check_date := check_date + INTERVAL '1 day';
    iteration := iteration + 1;
  END LOOP;

  -- Fallback: retourner le prochain mardi 10h
  RETURN DATE_TRUNC('week', current_ts) + INTERVAL '1 week 2 days 10 hours';
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- DONNEES DE TEST
-- ============================================

-- Inserer quelques produits de test
INSERT INTO produits_promo (reference, nom_produit, categorie, url_image, couleurs_dispo, description, statut, priorite)
VALUES
  (
    'GOB-2024-BL',
    'Gobelet isotherme 350ml',
    'Gobelets',
    'https://res.cloudinary.com/dcxj1nknb/image/upload/v1/samples/gobelet-blanc.png',
    'Blanc, Noir, Bleu, Rouge',
    'Gobelet isotherme en acier inoxydable double paroi. Garde vos boissons chaudes 6h et froides 12h. Personnalisation par gravure laser ou impression.',
    'A_Poster',
    1
  ),
  (
    'STY-2024-MET',
    'Stylo metal premium',
    'Stylos',
    'https://res.cloudinary.com/dcxj1nknb/image/upload/v1/samples/stylo-metal.png',
    'Argent, Noir, Or rose',
    'Stylo a bille en metal avec mecanisme rotatif. Encre bleue. Personnalisation par gravure laser.',
    'A_Poster',
    2
  ),
  (
    'MUG-2024-CER',
    'Mug ceramique 330ml',
    'Mugs',
    'https://res.cloudinary.com/dcxj1nknb/image/upload/v1/samples/mug-blanc.png',
    'Blanc, Noir, Couleurs Pantone',
    'Mug en ceramique blanche haute qualite. Impression sublimation quadri. Passe au lave-vaisselle.',
    'A_Poster',
    3
  ),
  (
    'SAC-2024-TOT',
    'Tote bag coton bio',
    'Sacs',
    'https://res.cloudinary.com/dcxj1nknb/image/upload/v1/samples/tote-bag.png',
    'Naturel, Noir, Marine',
    'Tote bag en coton bio 180g/m2. Anses longues. Impression serigraphie ou transfert.',
    'A_Poster',
    4
  ),
  (
    'USB-2024-CLE',
    'Cle USB 16Go bois',
    'High-Tech',
    'https://res.cloudinary.com/dcxj1nknb/image/upload/v1/samples/cle-usb-bois.png',
    'Erable, Noyer, Bambou',
    'Cle USB 16Go dans un boitier en bois naturel. Gravure laser du logo. Livree en pochette kraft.',
    'A_Poster',
    5
  );

-- ============================================
-- VERIFICATION
-- ============================================

-- Verifier que les tables ont ete creees
SELECT
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as nb_columns
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_name IN ('produits_promo', 'posts_promo');

-- Verifier les produits de test
SELECT id, reference, nom_produit, categorie, statut, priorite
FROM produits_promo
ORDER BY priorite;
