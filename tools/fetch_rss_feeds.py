#!/usr/bin/env python3
"""
Fetch RSS feeds for LinkedIn post content research.

Usage:
    python tools/fetch_rss_feeds.py

Outputs:
    .tmp/rss_data.json
"""

import os
import sys
import json
import feedparser
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def fetch_feed(url, source_name):
    """Fetch and parse a single RSS feed."""
    try:
        print(f"Fetching {source_name}...")
        feed = feedparser.parse(url)

        items = []
        for entry in feed.entries[:10]:  # Limit to 10 items per feed
            items.append({
                'source': source_name,
                'title': entry.get('title', ''),
                'description': entry.get('description', ''),
                'content': entry.get('content', [{}])[0].get('value', ''),
                'link': entry.get('link', ''),
                'pubDate': entry.get('published', ''),
                'date': entry.get('published', datetime.now().isoformat())
            })

        print(f"✓ Fetched {len(items)} items from {source_name}")
        return items

    except Exception as e:
        print(f"✗ Error fetching {source_name}: {e}", file=sys.stderr)
        return []

def main():
    """Main function to fetch all RSS feeds."""

    # Get RSS URLs from environment
    feeds = [
        (os.getenv('RSS_GRAPHILINE'), 'GraphiLine'),
        (os.getenv('RSS_PRINTWEEK'), 'PrintWeek'),
        (os.getenv('RSS_FESPA'), 'FESPA'),
        (os.getenv('RSS_IMPRIMERIE'), 'Imprimerie')
    ]

    all_items = []

    for url, name in feeds:
        if not url:
            print(f"⚠ Skipping {name}: URL not configured in .env")
            continue

        items = fetch_feed(url, name)
        all_items.extend(items)

    # Save to .tmp/
    output_path = '.tmp/rss_data.json'
    os.makedirs('.tmp', exist_ok=True)

    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump({
            'count': len(all_items),
            'timestamp': datetime.now().isoformat(),
            'items': all_items
        }, f, indent=2, ensure_ascii=False)

    print(f"\n✓ Total items fetched: {len(all_items)}")
    print(f"✓ Saved to {output_path}")

if __name__ == '__main__':
    main()
