"""
Utility functions shared across tools.
"""

import os
import json
from datetime import datetime

def ensure_tmp_dir():
    """Ensure .tmp directory exists."""
    os.makedirs('.tmp', exist_ok=True)
    os.makedirs('.tmp/images', exist_ok=True)

def load_json(filepath):
    """Load JSON file with error handling."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        raise FileNotFoundError(f"File not found: {filepath}")
    except json.JSONDecodeError as e:
        raise ValueError(f"Invalid JSON in {filepath}: {e}")

def save_json(data, filepath, indent=2):
    """Save data as JSON with pretty formatting."""
    ensure_tmp_dir()
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=indent, ensure_ascii=False)

def log_error(message, filepath='.tmp/errors.log'):
    """Log error message to file."""
    ensure_tmp_dir()
    timestamp = datetime.now().isoformat()
    with open(filepath, 'a', encoding='utf-8') as f:
        f.write(f"[{timestamp}] {message}\n")

def format_post_text(hook, corps, cta, hashtags):
    """Format a complete LinkedIn post."""
    parts = [hook, '', corps, '', cta]

    if isinstance(hashtags, list):
        hashtags = ' '.join(hashtags)

    parts.append('')
    parts.append(hashtags)

    return '\n'.join(parts)
