import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set');
}

export const sql = neon(process.env.DATABASE_URL);

// Helper pour les requêtes avec gestion d'erreur
// Note: Le client Neon utilise des tagged template literals
// Exemple d'usage: sql`SELECT * FROM users WHERE id = ${userId}`
export async function executeQuery<T>(queryFn: () => Promise<unknown[]>): Promise<T[]> {
  try {
    const result = await queryFn();
    return result as T[];
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}
