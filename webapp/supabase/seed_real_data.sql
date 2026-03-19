-- Clear existing test data
TRUNCATE TABLE posts CASCADE;
TRUNCATE TABLE logs_workflow CASCADE;

-- Insert real posts from Airtable
INSERT INTO posts (
  date_generation,
  categorie,
  titre_interne,
  hook,
  corps,
  cta,
  hashtags,
  format_visuel,
  prompt_image,
  image_url,
  score_ia,
  suggestions_ia,
  statut,
  date_publication_prevue
) VALUES
(
  '2026-01-23 10:00:00+00',
  'Educatif',
  'Conseils d''impression',
  '🎯 Vous perdez du temps à choisir le bon papier ?',
  'Le choix du papier est crucial pour garantir une impression de qualité. Découvrez comment sélectionner le bon grammage et finition pour vos projets. Optez pour du papier recyclé pour vos supports éphémères et du papier couché pour des documents plus durables.',
  'Quel type de papier utilisez-vous le plus souvent dans vos impressions ?',
  ARRAY['#imprimerie', '#print', '#papier', '#B2B'],
  'carrousel',
  'Create an educational carousel image for LinkedIn about printing tips, featuring a modern flat design with subtle 3D elements. The main slide should introduce the topic, ''Printing Tips'', with vibrant orange #E94E1B as the primary color and lime green #A4C639 as the accent. Include small scattered squares to give a digital speed effect. The ambiance should be dynamic, professional, and accessible.',
  'https://res.cloudinary.com/dcxj1nknb/image/upload/v1769163172/xg2704mgalrqnzixmqho.png',
  7.7,
  NULL,
  'a_valider',
  NULL
),
(
  '2026-01-23 10:18:00+00',
  'Educatif',
  'Astuces impression eco-friendly',
  '🌱 Saviez-vous que vous pouvez économiser 30% sur l''encre ?',
  'Choisir le bon type de papier et d''encre peut non seulement réduire vos coûts, mais aussi votre empreinte écologique. Optez pour des encres à base de soja et du papier recyclé pour une impression plus verte et économique. 🌍

Chez Rapid Pub, nous sommes engagés à vous fournir des solutions d''impression éco-responsables.',
  'Quelles autres astuces d''impression verte utilisez-vous ?',
  ARRAY['#impressionverte', '#ecoresponsable', '#B2B', '#imprimerie'],
  'carrousel',
  'A vibrant educational slide illustrating eco-friendly printing tips. The main focus is on the benefits of using ecological inks and papers, designed in a modern flat style with subtle 3D elements. The slide features the signature scattered small squares/pixels giving a digital and dynamic feel. The dominant color is vivid orange #E94E1B with accents of lime green #A4C639, conveying a professional and accessible atmosphere.',
  'https://res.cloudinary.com/dcxj1nknb/image/upload/v1769163630/mt05bbvtsmpgzihjt1wp.png',
  7.7,
  NULL,
  'a_valider',
  NULL
);

-- Insert logs from Airtable
INSERT INTO logs_workflow (date_execution, statut, posts_generes, images_generees, erreurs) VALUES
('2026-01-01 00:00:00+00', 'Partiel', NULL, NULL, NULL),
('2026-01-23 11:13:00+00', 'Succes', 1, 1, NULL),
('2026-01-23 11:20:00+00', 'Succes', 1, 1, NULL);
