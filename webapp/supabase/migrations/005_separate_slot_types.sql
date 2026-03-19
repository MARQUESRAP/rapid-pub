-- ============================================
-- Migration 005: Séparer les créneaux par type de post
-- Mardi 10h = posts promo uniquement
-- Jeudi 14h = posts génériques uniquement
-- ============================================

-- Mettre à jour la fonction pour les posts génériques : JEUDI 14h seulement
CREATE OR REPLACE FUNCTION get_next_available_slot()
RETURNS TIMESTAMP WITH TIME ZONE AS $$
DECLARE
  next_slot TIMESTAMP WITH TIME ZONE;
  current_date_val DATE := CURRENT_DATE;
  check_date DATE;
  thursday_2pm TIMESTAMP WITH TIME ZONE;
  week_start DATE;
BEGIN
  -- Start checking from current week
  FOR week_offset IN 0..52 LOOP
    check_date := current_date_val + (week_offset * 7);

    -- Find Monday of this week (ISO week starts on Monday)
    week_start := check_date - ((EXTRACT(ISODOW FROM check_date)::INTEGER - 1) || ' days')::INTERVAL;

    -- Find Thursday of this week (Monday + 3 days) at 14:00 Europe/Paris
    thursday_2pm := (week_start + INTERVAL '3 days' + INTERVAL '14 hours') AT TIME ZONE 'Europe/Paris' AT TIME ZONE 'UTC';

    -- Check if Thursday slot is free and in the future
    IF thursday_2pm > NOW() AND NOT EXISTS (
      SELECT 1 FROM posts WHERE date_publication_prevue = thursday_2pm AND statut IN ('valide', 'planifie')
    ) THEN
      RETURN thursday_2pm;
    END IF;
  END LOOP;

  -- Fallback: return Thursday 1 year from now
  week_start := (current_date_val + INTERVAL '1 year') - ((EXTRACT(ISODOW FROM current_date_val + INTERVAL '1 year')::INTEGER - 1) || ' days')::INTERVAL;
  RETURN (week_start + INTERVAL '3 days' + INTERVAL '14 hours') AT TIME ZONE 'Europe/Paris' AT TIME ZONE 'UTC';
END;
$$ LANGUAGE plpgsql;

-- Mettre à jour la fonction pour les posts promo : MARDI 10h seulement
CREATE OR REPLACE FUNCTION get_next_available_slot_promo()
RETURNS TIMESTAMPTZ AS $$
DECLARE
  next_slot TIMESTAMPTZ;
  current_ts TIMESTAMPTZ := NOW() AT TIME ZONE 'Europe/Paris';
  check_date DATE := current_ts::DATE;
  max_iterations INTEGER := 52; -- Limite à 52 semaines
  iteration INTEGER := 0;
  week_start DATE;
  tuesday_10am TIMESTAMPTZ;
BEGIN
  -- Start checking from current week
  FOR week_offset IN 0..max_iterations LOOP
    check_date := current_ts::DATE + (week_offset * 7);

    -- Find Monday of this week
    week_start := check_date - ((EXTRACT(ISODOW FROM check_date)::INTEGER - 1) || ' days')::INTERVAL;

    -- Find Tuesday of this week (Monday + 1 day) at 10:00 Europe/Paris
    tuesday_10am := (week_start + INTERVAL '1 day' + INTERVAL '10 hours') AT TIME ZONE 'Europe/Paris' AT TIME ZONE 'UTC';

    -- Check if Tuesday slot is free and in the future
    IF tuesday_10am > NOW() AND NOT EXISTS (
      SELECT 1 FROM posts_promo WHERE date_publication_prevue = tuesday_10am AND statut IN ('Valide', 'Planifie')
    ) THEN
      RETURN tuesday_10am;
    END IF;
  END LOOP;

  -- Fallback: return next Tuesday 10h
  week_start := (current_ts::DATE + INTERVAL '1 year') - ((EXTRACT(ISODOW FROM current_ts::DATE + INTERVAL '1 year')::INTEGER - 1) || ' days')::INTERVAL;
  RETURN (week_start + INTERVAL '1 day' + INTERVAL '10 hours') AT TIME ZONE 'Europe/Paris' AT TIME ZONE 'UTC';
END;
$$ LANGUAGE plpgsql;
