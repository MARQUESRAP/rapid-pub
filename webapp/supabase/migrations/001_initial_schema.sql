-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Posts table
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Content fields
  titre_interne TEXT NOT NULL,
  categorie TEXT NOT NULL CHECK (categorie IN ('Educatif', 'Coulisses', 'Actualite', 'Storytelling', 'Decale')),
  hook TEXT NOT NULL,
  corps TEXT NOT NULL,
  cta TEXT NOT NULL,
  hashtags TEXT[] DEFAULT '{}',

  -- Media
  image_url TEXT,

  -- Metadata
  score_ia DECIMAL(3,1) CHECK (score_ia >= 0 AND score_ia <= 10),
  statut TEXT NOT NULL DEFAULT 'a_valider' CHECK (statut IN ('a_valider', 'valide', 'publie', 'archive')),
  date_publication_prevue TIMESTAMP WITH TIME ZONE,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  validated_at TIMESTAMP WITH TIME ZONE,

  -- Indexing for performance
  UNIQUE(date_publication_prevue)  -- Prevent duplicate scheduling
);

-- Index for common queries
CREATE INDEX idx_posts_statut ON posts(statut);
CREATE INDEX idx_posts_date_publication ON posts(date_publication_prevue);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Helper function: Get next available slot
CREATE OR REPLACE FUNCTION get_next_available_slot()
RETURNS TIMESTAMP WITH TIME ZONE AS $$
DECLARE
  next_slot TIMESTAMP WITH TIME ZONE;
  current_date_val DATE := CURRENT_DATE;
  check_date DATE;
  tuesday_10am TIMESTAMP WITH TIME ZONE;
  thursday_2pm TIMESTAMP WITH TIME ZONE;
  week_start DATE;
BEGIN
  -- Start checking from current week
  FOR week_offset IN 0..52 LOOP
    check_date := current_date_val + (week_offset * 7);

    -- Find Monday of this week (ISO week starts on Monday)
    week_start := check_date - ((EXTRACT(ISODOW FROM check_date)::INTEGER - 1) || ' days')::INTERVAL;

    -- Find Tuesday of this week (Monday + 1 day) at 10:00 Europe/Paris
    tuesday_10am := (week_start + INTERVAL '1 day' + INTERVAL '10 hours') AT TIME ZONE 'Europe/Paris' AT TIME ZONE 'UTC';

    -- Find Thursday of this week (Monday + 3 days) at 14:00 Europe/Paris
    thursday_2pm := (week_start + INTERVAL '3 days' + INTERVAL '14 hours') AT TIME ZONE 'Europe/Paris' AT TIME ZONE 'UTC';

    -- Check if Tuesday slot is free and in the future
    IF tuesday_10am > NOW() AND NOT EXISTS (
      SELECT 1 FROM posts WHERE date_publication_prevue = tuesday_10am
    ) THEN
      RETURN tuesday_10am;
    END IF;

    -- Check if Thursday slot is free and in the future
    IF thursday_2pm > NOW() AND NOT EXISTS (
      SELECT 1 FROM posts WHERE date_publication_prevue = thursday_2pm
    ) THEN
      RETURN thursday_2pm;
    END IF;
  END LOOP;

  -- Fallback: return Tuesday 1 year from now
  week_start := (current_date_val + INTERVAL '1 year') - ((EXTRACT(ISODOW FROM current_date_val + INTERVAL '1 year')::INTEGER - 1) || ' days')::INTERVAL;
  RETURN (week_start + INTERVAL '1 day' + INTERVAL '10 hours') AT TIME ZONE 'Europe/Paris' AT TIME ZONE 'UTC';
END;
$$ LANGUAGE plpgsql;

-- RLS (Row Level Security) - Enable but allow all for now (single user MVP)
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Allow all operations (for MVP with PIN auth)
CREATE POLICY "Allow all operations for now"
  ON posts FOR ALL
  USING (true)
  WITH CHECK (true);
