-- Insert 6 test posts for Rapid Pub LinkedIn Manager

INSERT INTO posts (titre_interne, categorie, hook, corps, cta, hashtags, image_url, score_ia, statut, date_publication_prevue) VALUES
(
  '5 erreurs d''impression à éviter',
  'Educatif',
  'Vous perdez de l''argent sans le savoir ? Ces 5 erreurs d''impression coûtent cher à votre entreprise.',
  'Erreur n°1 : Négliger la résolution des images (minimum 300 DPI)
Erreur n°2 : Oublier les fonds perdus (3mm minimum)
Erreur n°3 : Utiliser le RVB au lieu du CMJN
Erreur n°4 : Négliger le choix du papier
Erreur n°5 : Commander sans BAT validé

Chez Rapid Pub, on vérifie tout ça pour vous. Et on livre en 24h.',
  'Besoin d''imprimer sans stress ? Contactez-nous.',
  ARRAY['#Impression', '#ConseilsPro', '#RapidPub', '#B2B'],
  'https://res.cloudinary.com/dcxj1nknb/image/upload/v1/rapid-pub/test-post-1.jpg',
  8.5,
  'a_valider',
  NULL
),
(
  'Coulisses atelier nuit',
  'Coulisses',
  '3h du matin. Les machines tournent. Votre commande urgente prend vie.',
  'Cette nuit, pendant que vous dormiez, notre équipe a imprimé 5000 flyers pour un salon qui ouvre ce matin.

C''est ça, la livraison 24h. Pas un slogan marketing. Une réalité.

3 rotatives en service. 2 équipes qui se relaient. 1 seul objectif : tenir nos délais.

Parce qu''on sait que votre réputation dépend de la nôtre.',
  'Une urgence ? On est là.',
  ARRAY['#Coulisses', '#Impression24h', '#TeamWork', '#RapidPub'],
  'https://res.cloudinary.com/dcxj1nknb/image/upload/v1/rapid-pub/test-post-2.jpg',
  7.8,
  'a_valider',
  NULL
),
(
  'Tendance packaging 2025',
  'Actualite',
  'Le packaging minimaliste fait son grand retour en 2025. Voici pourquoi c''est une excellente nouvelle.',
  'Moins d''encre = moins de coûts
Designs épurés = plus d''impact
Eco-responsabilité = valeur ajoutée

Les marques l''ont compris : le minimalisme vend.

Rapid Pub vous accompagne sur ces nouvelles tendances. Papiers recyclés, encres végétales, designs sobres qui claquent.',
  'Envie de moderniser votre packaging ? Parlons-en.',
  ARRAY['#Packaging', '#Design2025', '#Tendances', '#RapidPub'],
  'https://res.cloudinary.com/dcxj1nknb/image/upload/v1/rapid-pub/test-post-3.jpg',
  8.2,
  'valide',
  '2026-02-04 09:00:00+00'  -- Tuesday Feb 4, 10am Europe/Paris = 09:00 UTC
),
(
  'Client restaurant success story',
  'Storytelling',
  'Comment un restaurant lyonnais a doublé ses réservations grâce à... des sets de table bien imprimés.',
  'Le Bistrot des Canuts avait un problème : les clients ne revenaient pas assez.

Solution simple : des sets de table avec un QR code vers leur programme de fidélité.

Résultat après 3 mois :
→ +120% d''inscriptions au programme
→ +85% de clients fidèles
→ +40% de CA

L''impression, c''est pas juste du papier. C''est un outil de croissance.

On a imprimé 10 000 sets en 24h. Ils ont explosé leurs objectifs.',
  'Votre communication mérite mieux que du générique.',
  ARRAY['#SuccessStory', '#CasClient', '#Marketing', '#RapidPub'],
  'https://res.cloudinary.com/dcxj1nknb/image/upload/v1/rapid-pub/test-post-4.jpg',
  9.1,
  'valide',
  '2026-02-06 13:00:00+00'  -- Thursday Feb 6, 2pm Europe/Paris = 13:00 UTC
),
(
  'Débat mat vs brillant',
  'Decale',
  'Team Mat ou Team Brillant ? Le débat qui divise le monde de l''impression depuis toujours.',
  'Team Mat :
"C''est plus classe, plus sobre, plus premium."

Team Brillant :
"Ouais mais ça claque, ça attire l''œil, ça fait pro."

Notre avis chez Rapid Pub ?

Les deux ont raison. Tout dépend du message.

→ Mat pour le luxe, l''élégance, le B2B sérieux
→ Brillant pour l''impact, les promos, l''événementiel

Arrêtez de choisir un camp. Choisissez le bon outil pour le bon job.',
  'Besoin de conseils sur vos finitions ? On est là.',
  ARRAY['#Impression', '#MatVsBrillant', '#ConseilsPro', '#RapidPub'],
  'https://res.cloudinary.com/dcxj1nknb/image/upload/v1/rapid-pub/test-post-5.jpg',
  8.7,
  'a_valider',
  NULL
),
(
  'Astuce carte de visite',
  'Educatif',
  'Votre carte de visite part à la poubelle en moins de 5 secondes. Voici comment changer ça.',
  'Le problème des cartes de visite classiques ? Elles sont toutes pareilles.

3 astuces pour vous démarquer :

1. Papier texturé (sensation unique au toucher)
2. Vernis sélectif (votre logo en relief discret)
3. Tranche colorée (détail qui change tout)

Coût supplémentaire : 15€ pour 500 cartes.
Impact : 10x supérieur.

Rapid Pub imprime vos cartes en 24h avec toutes les finitions premium.',
  'Demandez un devis, c''est gratuit.',
  ARRAY['#CartesDeVisite', '#Networking', '#ConseilsPro', '#RapidPub'],
  'https://res.cloudinary.com/dcxj1nknb/image/upload/v1/rapid-pub/test-post-6.jpg',
  8.9,
  'a_valider',
  NULL
);
