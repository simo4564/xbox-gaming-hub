"""Refreshes live deals and product pricing baselines.

This script is designed for deployment environments with outbound internet access.
It pulls discovery data from Xbox-Now deal pages and cheapest comparison baselines from
Allkeyshop pages, then rewrites live-deals.json and can be extended to update products.json.
"""
from __future__ import annotations

import json
import re
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[2]
LIVE_DEALS_JSON = ROOT / 'live-deals.json'

XBOX_NOW_URL = 'https://www.xbox-now.com/deal-list'
ALLKEYSHOP_URLS = {
    'gpu-ultimate': 'https://www.allkeyshop.com/blog/buy-xbox-game-pass-ultimate-cd-key-compare-prices/',
    'gpu-core': 'https://www.allkeyshop.com/blog/buy-xbox-game-pass-core-cd-key-compare-prices/',
}

HEADERS = {'User-Agent': 'GamingCommunityBot/1.0 (+https://gamingcommunity.local)'}


def parse_price(text: str) -> float | None:
    match = re.search(r'(\d+[\.,]\d+)', text)
    if not match:
        return None
    return float(match.group(1).replace(',', '.'))


def fetch_xbox_now_cards() -> list[dict]:
    response = requests.get(XBOX_NOW_URL, headers=HEADERS, timeout=30)
    response.raise_for_status()
    soup = BeautifulSoup(response.text, 'html.parser')
    cards = []
    for idx, card in enumerate(soup.select('a')[:12], start=1):
        title = ' '.join(card.get_text(' ', strip=True).split())
        href = card.get('href')
        if not title or not href:
            continue
        cards.append({
            'id': f'xboxnow-{idx}',
            'title': title[:120],
            'subtitle': 'Xbox-Now discovery feed',
            'image': '',
            'marketPrice': None,
            'storePrice': None,
            'sourceName': 'Xbox-Now',
            'sourceUrl': urljoin(XBOX_NOW_URL, href),
            'note': 'Spotted from Xbox-Now deal list. Price against Allkeyshop before publishing in-store.',
            'updatedAt': datetime.now(timezone.utc).isoformat(),
        })
    return cards


def fetch_allkeyshop_baselines() -> list[dict]:
    rows = []
    for slug, url in ALLKEYSHOP_URLS.items():
        response = requests.get(url, headers=HEADERS, timeout=30)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'html.parser')
        text = soup.get_text(' ', strip=True)
        price = parse_price(text)
        rows.append({
            'id': f'aks-{slug}',
            'title': slug.replace('-', ' ').title(),
            'subtitle': 'Allkeyshop comparison baseline',
            'image': '',
            'marketPrice': price,
            'storePrice': round(price * 1.2, 2) if price is not None else None,
            'sourceName': 'Allkeyshop',
            'sourceUrl': url,
            'note': 'Use the cheapest comparison price as baseline, then add 20% margin.',
            'updatedAt': datetime.now(timezone.utc).isoformat(),
        })
    return rows


def main() -> None:
    deals = fetch_allkeyshop_baselines() + fetch_xbox_now_cards()
    LIVE_DEALS_JSON.write_text(json.dumps(deals, indent=2), encoding='utf-8')
    print(f'Wrote {len(deals)} live deals to {LIVE_DEALS_JSON}')


if __name__ == '__main__':
    main()
