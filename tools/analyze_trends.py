#!/usr/bin/env python3
"""
Analyze trends from collected content using OpenAI.

Usage:
    python tools/analyze_trends.py

Inputs:
    .tmp/cleaned_data.json

Outputs:
    .tmp/trends_analysis.json
"""

import os
import sys
import json
from datetime import datetime
from dotenv import load_dotenv
from openai import OpenAI

# Load environment variables
load_dotenv()

SYSTEM_PROMPT = """Tu es un expert en analyse de contenu LinkedIn pour le secteur de l'imprimerie B2B.

Analyse les posts et actualités fournis et identifie :
1. Les hooks qui génèrent le plus d'engagement
2. Les formats de posts qui fonctionnent (liste, storytelling, question, stat choc...)
3. Les sujets tendance dans le secteur
4. Les bonnes pratiques de formatting
5. Les erreurs à éviter

Réponds en JSON structuré avec cette structure :
{
  "hooks_performants": ["exemple 1", "exemple 2"],
  "formats_engageants": ["format 1 avec explication"],
  "sujets_tendance": ["sujet 1", "sujet 2"],
  "bonnes_pratiques": ["pratique 1"],
  "erreurs_a_eviter": ["erreur 1"],
  "insights_cles": "Résumé des insights principaux"
}"""

def analyze_trends(cleaned_data):
    """Call OpenAI to analyze trends."""
    try:
        api_key = os.getenv('OPENAI_API_KEY')
        if not api_key:
            print("✗ Error: OPENAI_API_KEY not configured", file=sys.stderr)
            sys.exit(1)

        client = OpenAI(api_key=api_key)

        items = cleaned_data.get('items', [])
        count = len(items)

        print(f"Analyzing {count} items with GPT-4o...")

        user_prompt = f"""Voici les données de veille collectées ({count} éléments) :

{json.dumps(items, indent=2, ensure_ascii=False)}

Analyse ces contenus et fournis tes insights en JSON avec la structure demandée."""

        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.7,
            max_tokens=2000,
            response_format={"type": "json_object"}
        )

        analysis = json.loads(response.choices[0].message.content)

        print("✓ Trends analysis completed")
        return analysis

    except Exception as e:
        print(f"✗ Error during analysis: {e}", file=sys.stderr)
        sys.exit(1)

def main():
    """Main function."""

    # Load cleaned data
    input_path = '.tmp/cleaned_data.json'
    if not os.path.exists(input_path):
        print(f"✗ Error: {input_path} not found. Run clean_and_dedupe.py first.", file=sys.stderr)
        sys.exit(1)

    with open(input_path, 'r', encoding='utf-8') as f:
        cleaned_data = json.load(f)

    # Analyze trends
    analysis = analyze_trends(cleaned_data)

    # Save output
    output_path = '.tmp/trends_analysis.json'
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump({
            'timestamp': datetime.now().isoformat(),
            'analysis': analysis
        }, f, indent=2, ensure_ascii=False)

    print(f"✓ Saved to {output_path}")

if __name__ == '__main__':
    main()
