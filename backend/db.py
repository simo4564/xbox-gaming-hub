from __future__ import annotations

import json
import sqlite3
from pathlib import Path
from typing import Any, Iterable

ROOT = Path(__file__).resolve().parent.parent
BACKEND_ROOT = Path(__file__).resolve().parent
DATA_DIR = BACKEND_ROOT / 'data'
DB_PATH = DATA_DIR / 'gaming_community.db'
PRODUCTS_JSON = ROOT / 'products.json'
LIVE_DEALS_JSON = ROOT / 'live-deals.json'
OFFER_DATA_JS = ROOT / 'offer-data.js'

SCHEMA = '''
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    source_url TEXT,
    market_price REAL,
    margin_percent REAL,
    price REAL NOT NULL,
    old_price REAL,
    image TEXT,
    badge TEXT,
    description TEXT,
    in_stock INTEGER DEFAULT 1,
    last_updated TEXT,
    price_status TEXT
);

CREATE TABLE IF NOT EXISTS live_deals (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    subtitle TEXT,
    image TEXT,
    market_price REAL,
    store_price REAL,
    source_name TEXT,
    source_url TEXT,
    note TEXT,
    updated_at TEXT
);

CREATE TABLE IF NOT EXISTS offers (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    summary TEXT,
    image TEXT,
    price REAL,
    old_price REAL,
    cta_url TEXT,
    raw_json TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    source TEXT DEFAULT 'site'
);

CREATE TABLE IF NOT EXISTS contact_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'new'
);

CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_reference TEXT NOT NULL UNIQUE,
    customer_name TEXT,
    delivery_email TEXT,
    gamer_tag TEXT,
    region TEXT,
    preferred_language TEXT,
    customer_note TEXT,
    currency TEXT NOT NULL DEFAULT 'EUR',
    subtotal REAL NOT NULL,
    total REAL NOT NULL,
    source TEXT DEFAULT 'whatsapp',
    status TEXT DEFAULT 'pending',
    whatsapp_url TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    product_id TEXT,
    name TEXT NOT NULL,
    category TEXT,
    quantity INTEGER NOT NULL,
    unit_price REAL NOT NULL,
    line_total REAL NOT NULL,
    FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS admin_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    is_active INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_type TEXT NOT NULL,
    actor TEXT,
    details TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
'''


def get_connection() -> sqlite3.Connection:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute('PRAGMA foreign_keys = ON')
    return conn


def init_db() -> None:
    with get_connection() as conn:
        conn.executescript(SCHEMA)
        conn.commit()


def rows_to_dicts(rows: Iterable[sqlite3.Row]) -> list[dict[str, Any]]:
    return [dict(row) for row in rows]


def load_offer_details() -> dict[str, Any]:
    import subprocess
    node_script = f"const fs=require('fs'); const vm=require('vm'); const ctx={{window:{{}}}}; vm.createContext(ctx); vm.runInContext(fs.readFileSync({json.dumps(str(OFFER_DATA_JS))}, 'utf8'), ctx); console.log(JSON.stringify(ctx.window.OFFER_DETAILS || {{}}));"
    output = subprocess.check_output(['node', '-e', node_script], text=True)
    return json.loads(output)


def seed_products(conn: sqlite3.Connection) -> None:
    products = json.loads(PRODUCTS_JSON.read_text(encoding='utf-8'))
    conn.execute('DELETE FROM products')
    conn.executemany(
        '''
        INSERT INTO products (
            id, name, category, source_url, market_price, margin_percent, price, old_price,
            image, badge, description, in_stock, last_updated, price_status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''',
        [(
            item.get('id'),
            item.get('name'),
            item.get('category'),
            item.get('sourceUrl'),
            item.get('marketPrice'),
            item.get('marginPercent'),
            item.get('price'),
            item.get('oldPrice'),
            item.get('image'),
            item.get('badge'),
            item.get('description'),
            1 if item.get('inStock', True) else 0,
            item.get('lastUpdated'),
            item.get('priceStatus')
        ) for item in products]
    )


def seed_live_deals(conn: sqlite3.Connection) -> None:
    deals = json.loads(LIVE_DEALS_JSON.read_text(encoding='utf-8')) if LIVE_DEALS_JSON.exists() else []
    conn.execute('DELETE FROM live_deals')
    conn.executemany(
        '''
        INSERT INTO live_deals (
            id, title, subtitle, image, market_price, store_price, source_name, source_url, note, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''',
        [(
            item.get('id'), item.get('title'), item.get('subtitle'), item.get('image'),
            item.get('marketPrice'), item.get('storePrice'), item.get('sourceName'), item.get('sourceUrl'),
            item.get('note'), item.get('updatedAt')
        ) for item in deals]
    )


def seed_offers(conn: sqlite3.Connection) -> None:
    offers = load_offer_details()
    conn.execute('DELETE FROM offers')
    rows = []
    for offer_id, offer in offers.items():
        rows.append((
            offer_id,
            offer.get('title', offer_id),
            offer.get('summary'),
            offer.get('image'),
            offer.get('price'),
            offer.get('oldPrice'),
            f'offer.html?id={offer_id}',
            json.dumps(offer)
        ))
    conn.executemany(
        '''
        INSERT INTO offers (id, title, summary, image, price, old_price, cta_url, raw_json)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''',
        rows
    )


def seed_all() -> None:
    init_db()
    with get_connection() as conn:
        seed_products(conn)
        seed_live_deals(conn)
        seed_offers(conn)
        conn.commit()
