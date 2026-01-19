-- =====================================================
-- RAPID-PUB - Script d'initialisation de la base de données
-- Version 2.0 avec grille tarifaire et données de démo
-- =====================================================

-- Activation de l'extension UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- SUPPRESSION DES TABLES EXISTANTES (pour reset)
-- =====================================================
DROP TABLE IF EXISTS factures CASCADE;
DROP TABLE IF EXISTS commandes CASCADE;
DROP TABLE IF EXISTS devis CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS parametres CASCADE;

-- =====================================================
-- TABLE: clients
-- =====================================================
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nom VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  telephone VARCHAR(50),
  adresse TEXT,
  entreprise VARCHAR(255),
  notes TEXT,
  statut VARCHAR(50) DEFAULT 'actif',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLE: devis
-- =====================================================
CREATE TABLE devis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  numero VARCHAR(50) UNIQUE NOT NULL,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  demande_brute TEXT,
  titre VARCHAR(255),
  description TEXT,
  produit_type VARCHAR(100),
  quantite INTEGER,
  format VARCHAR(50),
  papier VARCHAR(50),
  finition TEXT,
  recto_verso BOOLEAN DEFAULT FALSE,
  prix_unitaire DECIMAL(10, 2),
  prix_total DECIMAL(10, 2),
  marge_percent DECIMAL(5, 2),
  statut VARCHAR(50) DEFAULT 'brouillon',
  date_envoi TIMESTAMP WITH TIME ZONE,
  date_reponse TIMESTAMP WITH TIME ZONE,
  date_validite TIMESTAMP WITH TIME ZONE,
  relance_count INTEGER DEFAULT 0,
  relance_derniere TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLE: commandes
-- =====================================================
CREATE TABLE commandes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  numero VARCHAR(50) UNIQUE NOT NULL,
  devis_id UUID REFERENCES devis(id) ON DELETE SET NULL,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  titre VARCHAR(255),
  description TEXT,
  prix_total DECIMAL(10, 2),
  statut VARCHAR(50) DEFAULT 'nouvelle',
  date_livraison_prevue TIMESTAMP WITH TIME ZONE,
  date_livraison_reelle TIMESTAMP WITH TIME ZONE,
  notes_production TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLE: factures
-- =====================================================
CREATE TABLE factures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  numero VARCHAR(50) UNIQUE NOT NULL,
  commande_id UUID REFERENCES commandes(id) ON DELETE SET NULL,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  montant_ht DECIMAL(10, 2),
  tva DECIMAL(10, 2),
  montant_ttc DECIMAL(10, 2),
  statut VARCHAR(50) DEFAULT 'emise',
  date_emission TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  date_echeance TIMESTAMP WITH TIME ZONE,
  date_paiement TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLE: parametres
-- =====================================================
CREATE TABLE parametres (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cle VARCHAR(100) UNIQUE NOT NULL,
  valeur TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEX
-- =====================================================
CREATE INDEX idx_devis_client_id ON devis(client_id);
CREATE INDEX idx_devis_statut ON devis(statut);
CREATE INDEX idx_commandes_client_id ON commandes(client_id);
CREATE INDEX idx_commandes_statut ON commandes(statut);
CREATE INDEX idx_commandes_livraison ON commandes(date_livraison_prevue);
CREATE INDEX idx_factures_client_id ON factures(client_id);
CREATE INDEX idx_factures_statut ON factures(statut);

-- =====================================================
-- PARAMÈTRES PAR DÉFAUT
-- =====================================================
INSERT INTO parametres (cle, valeur) VALUES
  ('entreprise_nom', 'Rapid-Pub'),
  ('entreprise_adresse', '123 rue de l''Imprimerie, 75001 Paris'),
  ('entreprise_siret', '123 456 789 00012'),
  ('entreprise_tva_intra', 'FR12345678901'),
  ('entreprise_telephone', '01 23 45 67 89'),
  ('entreprise_email', 'contact@rapid-pub.fr'),
  ('tva_taux', '20'),
  ('delai_paiement', '30'),
  ('iban', 'FR76 1234 5678 9012 3456 7890 123'),
  ('email_expediteur', 'devis@rapid-pub.fr'),
  ('email_signature', 'Cordialement,

L''équipe Rapid-Pub
Tél: 01 23 45 67 89'),
  ('prix_flyers_a6_500', '85'),
  ('prix_flyers_a6_1000', '120'),
  ('prix_flyers_a6_2000', '180'),
  ('prix_flyers_a5_500', '120'),
  ('prix_flyers_a5_1000', '180'),
  ('prix_flyers_a5_2000', '280'),
  ('prix_flyers_a4_500', '180'),
  ('prix_flyers_a4_1000', '280'),
  ('prix_flyers_a4_2000', '450'),
  ('prix_cdv_250', '45'),
  ('prix_cdv_500', '65'),
  ('prix_cdv_1000', '95'),
  ('prix_affiche_a3_50', '120'),
  ('prix_affiche_a3_100', '180'),
  ('prix_affiche_a2_50', '180'),
  ('prix_affiche_a2_100', '280'),
  ('prix_recto_verso', '30'),
  ('prix_pelliculage_mat', '25'),
  ('prix_pelliculage_brillant', '25'),
  ('prix_vernis_selectif', '40'),
  ('prix_dorure', '60'),
  ('relance_j1', '3'),
  ('relance_j2', '7');

-- =====================================================
-- DONNÉES DE DÉMONSTRATION
-- =====================================================

-- Clients
INSERT INTO clients (id, nom, email, telephone, adresse, entreprise, statut) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Jean Dupont', 'jean.dupont@dupont-sarl.fr', '06 12 34 56 78', '15 rue des Entrepreneurs, 75015 Paris', 'Dupont SARL', 'actif'),
  ('22222222-2222-2222-2222-222222222222', 'Marie Martin', 'marie@martinco.fr', '06 98 76 54 32', '8 avenue de la République, 69001 Lyon', 'Martin & Co', 'actif'),
  ('33333333-3333-3333-3333-333333333333', 'Pierre Garcia', 'p.garcia@garcia-industries.com', '07 11 22 33 44', '45 boulevard Industriel, 31000 Toulouse', 'Garcia Industries', 'actif'),
  ('44444444-4444-4444-4444-444444444444', 'Sophie Leroy', 's.leroy@leroy-distribution.fr', '06 55 66 77 88', '12 rue du Commerce, 33000 Bordeaux', 'Leroy Distribution', 'actif'),
  ('55555555-5555-5555-5555-555555555555', 'Luc Bernard', 'luc@bernardfils.com', '07 99 88 77 66', '3 place du Marché, 59000 Lille', 'Bernard & Fils', 'actif');

-- Devis
INSERT INTO devis (id, numero, client_id, titre, description, produit_type, quantite, format, papier, finition, recto_verso, prix_total, statut, date_envoi, date_validite, relance_count) VALUES
  ('aaaa1111-1111-1111-1111-111111111111', 'DEV-2026-001', '11111111-1111-1111-1111-111111111111', 'Flyers A5 recto-verso', 'Flyers promotionnels pour soldes', 'flyers', 500, 'A5', '350g', 'pelliculage mat', true, 156, 'brouillon', NULL, NULL, 0),
  ('aaaa2222-2222-2222-2222-222222222222', 'DEV-2026-002', '55555555-5555-5555-5555-555555555555', 'Kakémono 80x200cm', 'Roll-up pour salon', 'kakemono', 2, 'personnalise', NULL, NULL, false, 320, 'brouillon', NULL, NULL, 0),
  ('aaaa3333-3333-3333-3333-333333333333', 'DEV-2026-003', '22222222-2222-2222-2222-222222222222', 'Cartes de visite premium', 'Cartes avec vernis sélectif', 'cartes_visite', 1000, '85x55mm', '350g', 'vernis sélectif', true, 133, 'envoye', NOW() - INTERVAL '5 days', NOW() + INTERVAL '25 days', 1),
  ('aaaa4444-4444-4444-4444-444444444444', 'DEV-2026-004', '33333333-3333-3333-3333-333333333333', 'Flyers A4 quadri', 'Flyers campagne printemps', 'flyers', 2000, 'A4', '170g', NULL, true, 364, 'envoye', NOW() - INTERVAL '2 days', NOW() + INTERVAL '28 days', 0),
  ('aaaa5555-5555-5555-5555-555555555555', 'DEV-2026-005', '11111111-1111-1111-1111-111111111111', 'Dépliants 3 volets', 'Dépliants nouveau produit', 'depliants', 1000, 'A4', '250g', 'pelliculage brillant', true, 420, 'envoye', NOW() - INTERVAL '8 days', NOW() + INTERVAL '22 days', 2),
  ('aaaa6666-6666-6666-6666-666666666666', 'DEV-2025-120', '44444444-4444-4444-4444-444444444444', 'Affiches A2 pelliculage', 'Affiches grand format', 'affiches', 100, 'A2', '250g', 'pelliculage brillant', false, 350, 'accepte', NOW() - INTERVAL '15 days', NOW() + INTERVAL '15 days', 0),
  ('aaaa7777-7777-7777-7777-777777777777', 'DEV-2025-118', '55555555-5555-5555-5555-555555555555', 'Brochures 12 pages', 'Catalogue produits 2026', 'brochures', 500, 'A5', '170g', 'pelliculage mat', true, 890, 'accepte', NOW() - INTERVAL '20 days', NOW() + INTERVAL '10 days', 0);

-- Commandes
INSERT INTO commandes (id, numero, devis_id, client_id, titre, description, prix_total, statut, date_livraison_prevue, notes_production) VALUES
  ('bbbb1111-1111-1111-1111-111111111111', 'CMD-2026-001', 'aaaa6666-6666-6666-6666-666666666666', '44444444-4444-4444-4444-444444444444', 'Affiches A2 pelliculage', 'Affiches grand format', 350, 'en_production', NOW() + INTERVAL '3 days', 'Vérifier couleurs CMJN'),
  ('bbbb2222-2222-2222-2222-222222222222', 'CMD-2026-002', 'aaaa7777-7777-7777-7777-777777777777', '55555555-5555-5555-5555-555555555555', 'Brochures 12 pages', 'Catalogue produits', 890, 'en_production', NOW() + INTERVAL '5 days', 'Reliure dos carré collé'),
  ('bbbb3333-3333-3333-3333-333333333333', 'CMD-2025-098', NULL, '11111111-1111-1111-1111-111111111111', 'Flyers promo hiver', 'Flyers A5 promo', 280, 'pret', NOW() + INTERVAL '1 day', NULL),
  ('bbbb4444-4444-4444-4444-444444444444', 'CMD-2025-095', NULL, '22222222-2222-2222-2222-222222222222', 'Cartes de visite standard', 'Cartes 85x55mm', 95, 'livre', NOW() - INTERVAL '5 days', NULL),
  ('bbbb5555-5555-5555-5555-555555555555', 'CMD-2025-090', NULL, '33333333-3333-3333-3333-333333333333', 'Affiches événement', 'Affiches A3', 180, 'livre', NOW() - INTERVAL '10 days', NULL),
  ('bbbb6666-6666-6666-6666-666666666666', 'CMD-2026-003', NULL, '22222222-2222-2222-2222-222222222222', 'Stickers vinyle', 'Autocollants', 150, 'nouvelle', NOW() + INTERVAL '2 days', NULL),
  ('bbbb7777-7777-7777-7777-777777777777', 'CMD-2026-004', NULL, '44444444-4444-4444-4444-444444444444', 'Dépliants salon', 'Dépliants salon pro', 320, 'nouvelle', NOW() + INTERVAL '4 days', NULL);

-- Factures
INSERT INTO factures (id, numero, commande_id, client_id, montant_ht, tva, montant_ttc, statut, date_emission, date_echeance, date_paiement) VALUES
  ('cccc1111-1111-1111-1111-111111111111', 'FAC-2025-098', 'bbbb3333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 280, 56, 336, 'emise', NOW() - INTERVAL '5 days', NOW() + INTERVAL '25 days', NULL),
  ('cccc2222-2222-2222-2222-222222222222', 'FAC-2025-095', 'bbbb4444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222', 95, 19, 114, 'payee', NOW() - INTERVAL '10 days', NOW() + INTERVAL '20 days', NOW() - INTERVAL '3 days'),
  ('cccc3333-3333-3333-3333-333333333333', 'FAC-2025-090', 'bbbb5555-5555-5555-5555-555555555555', '33333333-3333-3333-3333-333333333333', 180, 36, 216, 'payee', NOW() - INTERVAL '15 days', NOW() + INTERVAL '15 days', NOW() - INTERVAL '8 days'),
  ('cccc4444-4444-4444-4444-444444444444', 'FAC-2025-085', NULL, '44444444-4444-4444-4444-444444444444', 450, 90, 540, 'en_retard', NOW() - INTERVAL '45 days', NOW() - INTERVAL '15 days', NULL),
  ('cccc5555-5555-5555-5555-555555555555', 'FAC-2025-080', NULL, '55555555-5555-5555-5555-555555555555', 320, 64, 384, 'emise', NOW() - INTERVAL '3 days', NOW() + INTERVAL '27 days', NULL);
