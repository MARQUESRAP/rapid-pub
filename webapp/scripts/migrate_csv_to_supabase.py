#!/usr/bin/env python3
"""
Script de migration des données Airtable CSV vers Supabase

Usage:
    python migrate_csv_to_supabase.py --posts Posts_LinkedIn-Grid\ view.csv --logs Logs_Workflow-Grid\ view.csv

Requirements:
    pip install psycopg2-binary python-dotenv
"""

import csv
import sys
import argparse
from datetime import datetime
from typing import Optional
import os
from pathlib import Path

try:
    import psycopg2
    from psycopg2.extras import execute_values
except ImportError:
    print("❌ Erreur: psycopg2 n'est pas installé")
    print("   Installez-le avec: pip install psycopg2-binary")
    sys.exit(1)

try:
    from dotenv import load_dotenv
except ImportError:
    print("❌ Erreur: python-dotenv n'est pas installé")
    print("   Installez-le avec: pip install python-dotenv")
    sys.exit(1)


# Charger les variables d'environnement
load_dotenv()


def get_supabase_connection():
    """Créer une connexion à Supabase"""
    try:
        # Format: postgresql://postgres:[password]@[host]:[port]/postgres
        supabase_url = os.getenv('SUPABASE_URL')
        supabase_password = os.getenv('SUPABASE_PASSWORD')

        if not supabase_url or not supabase_password:
            print("❌ Variables d'environnement manquantes:")
            print("   SUPABASE_URL et SUPABASE_PASSWORD doivent être définies dans .env")
            sys.exit(1)

        # Extraire le host du URL
        # Format: https://xxxxx.supabase.co
        host = supabase_url.replace('https://', '').replace('http://', '')

        conn = psycopg2.connect(
            host=host,
            database="postgres",
            user="postgres",
            password=supabase_password,
            port="5432"
        )
        return conn
    except Exception as e:
        print(f"❌ Erreur de connexion à Supabase: {e}")
        sys.exit(1)


def parse_date(date_str: str) -> Optional[datetime]:
    """Parse une date du format Airtable"""
    if not date_str or date_str.strip() == '':
        return None

    formats = [
        '%m/%d/%Y %I:%M%p',  # 1/23/2026 10:00am
        '%d/%m/%Y %H:%M',    # 23/1/2026 11:13
        '%Y-%m-%d %H:%M:%S', # ISO format
    ]

    for fmt in formats:
        try:
            return datetime.strptime(date_str.strip(), fmt)
        except ValueError:
            continue

    print(f"⚠️  Warning: Impossible de parser la date: {date_str}")
    return None


def parse_hashtags(hashtags_str: str) -> list:
    """Parse les hashtags depuis Airtable"""
    if not hashtags_str or hashtags_str.strip() == '':
        return []
    return [h.strip() for h in hashtags_str.split() if h.strip()]


def map_status(airtable_status: str) -> str:
    """Mapping des statuts Airtable → Supabase"""
    status_map = {
        'A_Valider': 'a_valider',
        'Planifie': 'valide',
        'Publie': 'publie',
        'Archive': 'archive',
    }
    return status_map.get(airtable_status, 'a_valider')


def migrate_posts(csv_path: str, conn):
    """Migrer les posts depuis le CSV"""
    print(f"\n📄 Migration des posts depuis: {csv_path}")

    cur = conn.cursor()
    posts_count = 0
    errors_count = 0

    try:
        with open(csv_path, 'r', encoding='utf-8-sig') as f:
            reader = csv.DictReader(f)

            for i, row in enumerate(reader, 1):
                # Skip empty rows
                if not row.get('Titre_Interne') or row.get('Titre_Interne').strip() == '':
                    print(f"   ⏩ Ligne {i} : Sautée (vide)")
                    continue

                try:
                    # Parse date
                    date_gen = parse_date(row.get('Date_Generation', ''))

                    # Parse hashtags
                    hashtags = parse_hashtags(row.get('Hashtags', ''))

                    # Parse score
                    score_ia = None
                    if row.get('Score_IA') and row['Score_IA'].strip():
                        try:
                            score_ia = float(row['Score_IA'])
                        except ValueError:
                            print(f"   ⚠️  Ligne {i} : Score IA invalide: {row['Score_IA']}")

                    # Map status
                    statut = map_status(row.get('Statut', 'A_Valider'))

                    # Insert
                    cur.execute("""
                        INSERT INTO posts (
                            date_generation, categorie, titre_interne, hook, corps, cta,
                            hashtags, format_visuel, prompt_image, image_url, score_ia,
                            suggestions_ia, statut
                        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    """, (
                        date_gen,
                        row.get('Categorie', ''),
                        row.get('Titre_Interne', ''),
                        row.get('Hook', ''),
                        row.get('Corps', ''),
                        row.get('CTA', ''),
                        hashtags,
                        row.get('Format_Visuel', ''),
                        row.get('Prompt_Image', ''),
                        row.get('URL_Image_1', ''),
                        score_ia,
                        row.get('Suggestions_IA', '') or None,
                        statut
                    ))

                    posts_count += 1
                    print(f"   ✅ Ligne {i} : {row['Titre_Interne'][:50]}...")

                except Exception as e:
                    errors_count += 1
                    print(f"   ❌ Ligne {i} : Erreur - {e}")

        conn.commit()
        print(f"\n✅ Posts migrés : {posts_count}")
        if errors_count > 0:
            print(f"⚠️  Erreurs : {errors_count}")

    except FileNotFoundError:
        print(f"❌ Fichier non trouvé : {csv_path}")
    except Exception as e:
        print(f"❌ Erreur lors de la migration des posts : {e}")
        conn.rollback()
    finally:
        cur.close()


def migrate_logs(csv_path: str, conn):
    """Migrer les logs depuis le CSV"""
    print(f"\n📄 Migration des logs depuis: {csv_path}")

    cur = conn.cursor()
    logs_count = 0
    errors_count = 0

    try:
        with open(csv_path, 'r', encoding='utf-8-sig') as f:
            reader = csv.DictReader(f)

            for i, row in enumerate(reader, 1):
                # Skip empty rows
                if not row.get('Date_Execution') or row.get('Date_Execution').strip() == '':
                    print(f"   ⏩ Ligne {i} : Sautée (vide)")
                    continue

                try:
                    # Parse date
                    date_exec = parse_date(row.get('Date_Execution', ''))
                    if not date_exec:
                        print(f"   ⚠️  Ligne {i} : Date invalide, utilisation de NOW()")
                        date_exec = datetime.now()

                    # Parse integers
                    posts_gen = None
                    if row.get('Posts_Generes') and row['Posts_Generes'].strip():
                        try:
                            posts_gen = int(row['Posts_Generes'])
                        except ValueError:
                            pass

                    images_gen = None
                    if row.get('Images_Generees') and row['Images_Generees'].strip():
                        try:
                            images_gen = int(row['Images_Generees'])
                        except ValueError:
                            pass

                    # Insert
                    cur.execute("""
                        INSERT INTO logs_workflow (
                            date_execution, statut, posts_generes, images_generees, erreurs
                        ) VALUES (%s, %s, %s, %s, %s)
                    """, (
                        date_exec,
                        row.get('Statut', 'Partiel'),
                        posts_gen,
                        images_gen,
                        row.get('Erreurs', '') or None
                    ))

                    logs_count += 1
                    print(f"   ✅ Ligne {i} : {date_exec} - {row.get('Statut', 'Partiel')}")

                except Exception as e:
                    errors_count += 1
                    print(f"   ❌ Ligne {i} : Erreur - {e}")

        conn.commit()
        print(f"\n✅ Logs migrés : {logs_count}")
        if errors_count > 0:
            print(f"⚠️  Erreurs : {errors_count}")

    except FileNotFoundError:
        print(f"❌ Fichier non trouvé : {csv_path}")
    except Exception as e:
        print(f"❌ Erreur lors de la migration des logs : {e}")
        conn.rollback()
    finally:
        cur.close()


def main():
    parser = argparse.ArgumentParser(description='Migrer les données CSV Airtable vers Supabase')
    parser.add_argument('--posts', help='Chemin vers le CSV des posts')
    parser.add_argument('--logs', help='Chemin vers le CSV des logs')
    parser.add_argument('--clear', action='store_true', help='Vider les tables avant migration')

    args = parser.parse_args()

    if not args.posts and not args.logs:
        parser.print_help()
        sys.exit(1)

    print("🚀 Migration Airtable → Supabase")
    print("=" * 50)

    # Connexion
    conn = get_supabase_connection()
    print("✅ Connecté à Supabase")

    # Clear tables if requested
    if args.clear:
        print("\n🗑️  Suppression des données existantes...")
        cur = conn.cursor()
        cur.execute("TRUNCATE TABLE posts CASCADE;")
        cur.execute("TRUNCATE TABLE logs_workflow CASCADE;")
        conn.commit()
        cur.close()
        print("✅ Tables vidées")

    # Migrate posts
    if args.posts:
        migrate_posts(args.posts, conn)

    # Migrate logs
    if args.logs:
        migrate_logs(args.logs, conn)

    conn.close()
    print("\n" + "=" * 50)
    print("✅ Migration terminée!")


if __name__ == '__main__':
    main()
