#!/usr/bin/env python3
"""
Clean, deduplicate, and sort collected data.

Usage:
    python tools/clean_and_dedupe.py

Inputs:
    .tmp/rss_data.json
    .tmp/airtable_data.json

Outputs:
    .tmp/cleaned_data.json
"""

import os
import json
import re
from datetime import datetime
from html.parser import HTMLParser

class HTMLStripper(HTMLParser):
    """Strip HTML tags from text."""
    def __init__(self):
        super().__init__()
        self.reset()
        self.strict = False
        self.convert_charrefs = True
        self.text = []

    def handle_data(self, data):
        self.text.append(data)

    def get_data(self):
        return ''.join(self.text)

def strip_html(html):
    """Remove HTML tags and clean text."""
    if not html:
        return ''

    stripper = HTMLStripper()
    stripper.feed(html)
    text = stripper.get_data()

    # Clean up whitespace
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def clean_text(text, max_length=1000):
    """Clean and truncate text."""
    if not text:
        return ''

    cleaned = strip_html(text)

    # Truncate if too long
    if len(cleaned) > max_length:
        cleaned = cleaned[:max_length]

    return cleaned

def load_json_safe(filepath):
    """Load JSON file, return empty dict if not found."""
    try:
        if os.path.exists(filepath):
            with open(filepath, 'r', encoding='utf-8') as f:
                return json.load(f)
    except Exception as e:
        print(f"⚠ Warning loading {filepath}: {e}")

    return {'items': []}

def main():
    """Main function."""

    # Load data files
    print("Loading data files...")
    rss_data = load_json_safe('.tmp/rss_data.json')
    airtable_data = load_json_safe('.tmp/airtable_data.json')

    # Merge all items
    all_items = []
    all_items.extend(rss_data.get('items', []))
    all_items.extend(airtable_data.get('items', []))

    print(f"Total items before cleaning: {len(all_items)}")

    # Clean and deduplicate
    seen_keys = set()
    cleaned = []

    for item in all_items:
        # Create deduplication key from first 100 chars of title
        title = item.get('title', item.get('text', item.get('content', '')))
        key = title[:100].lower().strip()

        if not key or key in seen_keys:
            continue

        seen_keys.add(key)

        # Clean the item
        cleaned_item = {
            'source': item.get('source', item.get('companyName', 'RSS')),
            'title': clean_text(item.get('title', '')),
            'content': clean_text(
                item.get('content') or
                item.get('text') or
                item.get('description', '')
            ),
            'engagement': item.get('likes', item.get('reactions', item.get('numLikes', 0))),
            'comments': item.get('comments', item.get('numComments', 0)),
            'date': item.get('pubDate', item.get('postedAt', item.get('date', datetime.now().isoformat()))),
            'url': item.get('link', item.get('url', item.get('postUrl', '')))
        }

        # Only add if has meaningful content
        if cleaned_item['title'] or cleaned_item['content']:
            cleaned.append(cleaned_item)

    print(f"Items after deduplication: {len(cleaned)}")

    # Sort by engagement (likes + comments)
    cleaned.sort(
        key=lambda x: (x['engagement'] + x['comments']),
        reverse=True
    )

    # Keep top 40
    top_items = cleaned[:40]

    print(f"Keeping top {len(top_items)} items")

    # Save output
    output_path = '.tmp/cleaned_data.json'
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump({
            'count': len(top_items),
            'timestamp': datetime.now().isoformat(),
            'items': top_items
        }, f, indent=2, ensure_ascii=False)

    print(f"✓ Saved to {output_path}")

if __name__ == '__main__':
    main()
