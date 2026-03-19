export type PostStatus = 'a_valider' | 'valide' | 'publie' | 'archive' | 'Modification_En_Cours';
export type PostCategory = 'Educatif' | 'Coulisses' | 'Actualite' | 'Storytelling' | 'Decale';

export interface Post {
  id: string;
  titre_interne: string;
  categorie: PostCategory;
  hook: string;
  corps: string;
  cta: string;
  hashtags: string[];
  image_url: string | null;
  score_ia: number;
  statut: PostStatus;
  date_publication_prevue: string | null; // ISO 8601
  created_at: string;
  updated_at: string;
  validated_at: string | null;
  version_precedente?: {
    hook: string;
    corps: string;
    cta: string;
    hashtags: string[];
    saved_at: string;
  } | null;

  // Champs additionnels Airtable
  date_generation?: string | null; // Date de génération par le workflow
  format_visuel?: string | null; // Format de l'image (carrousel, photo_style, etc.)
  prompt_image?: string | null; // Prompt DALL-E utilisé
  suggestions_ia?: string | null; // Suggestions d'amélioration IA
}

export interface PostStats {
  total: number;
  a_valider: number;
  valide: number;
}

export interface ScheduledSlot {
  date: Date;
  isAvailable: boolean;
  post?: Post;
}

export interface WebhookPayload {
  post_id: string;
  prompt: string;
  type: 'text' | 'image';
}

// --- Promo Posts ---

export type PromoPostStatus = 'A_Valider' | 'Valide' | 'Planifie' | 'Publie' | 'Rejete' | 'Modifie' | 'Modification_En_Cours' | 'Erreur_Publication';

export interface PromoPost {
  id: string;
  produit_id: string | null;
  reference_produit: string | null;
  nom_produit: string | null;
  categorie_produit: string | null;
  hook: string;
  corps: string;
  cta: string;
  hashtags: string; // TEXT (not array)
  image_originale_url: string | null;
  image_transformee_url: string | null;
  prompt_transformation: string | null;
  analyse_produit: Record<string, unknown> | null;
  statut: PromoPostStatus;
  score_ia: number | null;
  date_publication_prevue: string | null;
  date_publication_effective: string | null;
  linkedin_post_id: string | null;
  lien_post_linkedin: string | null;
  version_precedente?: {
    hook: string;
    corps: string;
    cta: string;
    hashtags: string;
    saved_at: string;
  } | null;
  created_at: string;
  updated_at: string;
}

export interface GenericPostItem {
  postType: 'generic';
  data: Post;
}

export interface PromoPostItem {
  postType: 'promo';
  data: PromoPost;
}

export type UnifiedPost = GenericPostItem | PromoPostItem;

// --- Products ---

export type ProductStatus = 'A_Poster' | 'En_Cours' | 'Poste';

export interface Product {
  id: string;
  reference: string;
  nom_produit: string;
  categorie: string;
  url_image: string;
  couleurs_dispo: string | null;
  description: string | null;
  statut: ProductStatus;
  priorite: number;
  created_at: string;
  posted_at: string | null;
}

// --- Logs ---

export type LogStatus = 'Succes' | 'Partiel' | 'Echec';

export interface WorkflowLog {
  id: string;
  date_execution: string; // ISO 8601
  statut: LogStatus;
  posts_generes: number | null;
  images_generees: number | null;
  erreurs: string | null;
  created_at: string;
}
