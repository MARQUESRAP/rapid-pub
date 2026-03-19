#!/usr/bin/env python3
"""
Fetch unused client content from Airtable.

Usage:
    python tools/fetch_airtable_content.py

Outputs:
    .tmp/airtable_data.json
"""

import os
import sys
import json
from datetime import datetime
from dotenv import load_dotenv
from pyairtable import Api

# Load environment variables
load_dotenv()

def fetch_client_content():
    """Fetch unused content from Airtable."""
    try:
        # Get credentials from environment
        api_key = os.getenv('AIRTABLE_API_KEY')
        base_id = os.getenv('AIRTABLE_BASE_ID')
        table_name = os.getenv('AIRTABLE_CONTENUS_TABLE')

        if not all([api_key, base_id, table_name]):
            print("✗ Error: Airtable credentials not configured in .env", file=sys.stderr)
            return []

        print("Connecting to Airtable...")
        api = Api(api_key)
        table = api.table(base_id, table_name)

        # Fetch records where Deja_Utilise is not checked
        print("Fetching unused content...")
        records = table.all(formula="NOT({Deja_Utilise})")

        items = []
        for record in records:
            fields = record['fields']
            items.append({
                'source': 'Client Airtable',
                'title': fields.get('Titre', ''),
                'content': fields.get('Contenu', ''),
                'text': fields.get('Text', ''),
                'companyName': fields.get('Entreprise', 'Rapid Pub'),
                'date': fields.get('Date', datetime.now().isoformat()),
                'record_id': record['id']
            })

        print(f"✓ Fetched {len(items)} unused client content items")
        return items

    except Exception as e:
        print(f"✗ Error fetching Airtable content: {e}", file=sys.stderr)
        return []

def main():
    """Main function."""
    items = fetch_client_content()

    # Save to .tmp/
    output_path = '.tmp/airtable_data.json'
    os.makedirs('.tmp', exist_ok=True)

    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump({
            'count': len(items),
            'timestamp': datetime.now().isoformat(),
            'items': items
        }, f, indent=2, ensure_ascii=False)

    print(f"✓ Saved to {output_path}")

if __name__ == '__main__':
    main()
