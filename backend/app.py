from __future__ import annotations

import json
import os
import re
import sqlite3
from pathlib import Path
from typing import Annotated, Any, Literal

from fastapi import Depends, FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.security import HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr, Field
from starlette.staticfiles import StaticFiles

from .db import DB_PATH, ROOT, get_connection, rows_to_dicts, seed_all
from .security import (
    ADMIN_EMAIL,
    ADMIN_PASSWORD,
    SimpleRateLimitMiddleware,
    SecurityHeadersMiddleware,
    bearer_scheme,
    create_access_token,
    hash_password,
    require_admin,
    verify_password,
)

APP_NAME = 'Gaming Community API'
FRONTEND_DIR = ROOT
ALLOWED_ORIGINS = [origin.strip() for origin in os.getenv('ALLOWED_ORIGINS', '*').split(',') if origin.strip()]

app = FastAPI(title=APP_NAME, version='2.0.0')
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(SimpleRateLimitMiddleware, max_requests=180, window_seconds=60)
app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'] if ALLOWED_ORIGINS == ['*'] else ALLOWED_ORIGINS,
    allow_credentials=False,
    allow_methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allow_headers=['*'],
)
app.mount('/assets', StaticFiles(directory=str(FRONTEND_DIR / 'assets')), name='assets')


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)


class NewsletterRequest(BaseModel):
    email: EmailStr
    source: str = 'site'


class ContactRequest(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    message: str = Field(min_length=10, max_length=4000)


class OrderItemIn(BaseModel):
    productId: str | None = None
    name: str
    category: str | None = None
    quantity: int = Field(ge=1, le=99)
    unitPrice: float = Field(ge=0)
    lineTotal: float = Field(ge=0)


class OrderRequest(BaseModel):
    customerName: str | None = Field(default=None, max_length=120)
    deliveryEmail: EmailStr | None = None
    gamerTag: str | None = Field(default=None, max_length=120)
    region: str | None = Field(default=None, max_length=80)
    preferredLanguage: str | None = Field(default=None, max_length=80)
    customerNote: str | None = Field(default=None, max_length=1000)
    currency: str = 'EUR'
    subtotal: float = Field(ge=0)
    total: float = Field(ge=0)
    source: Literal['whatsapp', 'manual', 'admin'] = 'whatsapp'
    whatsappUrl: str | None = None
    items: list[OrderItemIn]


class BundlePreviewRequest(BaseModel):
    items: list[dict[str, Any]] = Field(default_factory=list)


def db() -> sqlite3.Connection:
    conn = get_connection()
    try:
        yield conn
    finally:
        conn.close()


def bootstrap_admin() -> None:
    with get_connection() as conn:
        conn.execute('DELETE FROM admin_users')
        conn.execute(
            'INSERT INTO admin_users (email, password_hash, role) VALUES (?, ?, ?)',
            (ADMIN_EMAIL, hash_password(ADMIN_PASSWORD), 'admin'),
        )
        conn.commit()


def log_event(conn: sqlite3.Connection, event_type: str, actor: str | None, details: dict[str, Any]) -> None:
    conn.execute(
        'INSERT INTO audit_logs (event_type, actor, details) VALUES (?, ?, ?)',
        (event_type, actor, json.dumps(details)),
    )
    conn.commit()


def slugify(value: str) -> str:
    value = re.sub(r'[^a-zA-Z0-9]+', '-', value.lower()).strip('-')
    return value


@app.on_event('startup')
def startup() -> None:
    seed_all()
    bootstrap_admin()


@app.get('/api/health')
def health() -> dict[str, Any]:
    return {'ok': True, 'service': APP_NAME, 'dbPath': str(DB_PATH), 'timestamp': __import__('datetime').datetime.utcnow().isoformat() + 'Z'}


@app.get('/api/products')
def get_products(category: str | None = None, q: str | None = None, conn: sqlite3.Connection = Depends(db)):
    sql = 'SELECT * FROM products WHERE 1=1'
    params: list[Any] = []
    if category:
        sql += ' AND category = ?'
        params.append(category)
    if q:
        sql += ' AND (name LIKE ? OR description LIKE ?)'
        term = f'%{q}%'
        params.extend([term, term])
    sql += ' ORDER BY category, price ASC'
    rows = conn.execute(sql, params).fetchall()
    return rows_to_dicts(rows)


@app.get('/api/products/{product_id}')
def get_product(product_id: str, conn: sqlite3.Connection = Depends(db)):
    row = conn.execute('SELECT * FROM products WHERE id = ?', (product_id,)).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail='Product not found')
    return dict(row)


@app.get('/api/live-deals')
def get_live_deals(conn: sqlite3.Connection = Depends(db)):
    return rows_to_dicts(conn.execute('SELECT * FROM live_deals ORDER BY updated_at DESC, title ASC').fetchall())


@app.get('/api/offers')
def get_offers(conn: sqlite3.Connection = Depends(db)):
    rows = conn.execute('SELECT * FROM offers ORDER BY title ASC').fetchall()
    payload = []
    for row in rows:
        item = dict(row)
        item['details'] = json.loads(item.pop('raw_json'))
        payload.append(item)
    return payload


@app.post('/api/newsletter')
def subscribe(payload: NewsletterRequest, conn: sqlite3.Connection = Depends(db)):
    try:
        conn.execute('INSERT INTO newsletter_subscribers (email, source) VALUES (?, ?)', (payload.email, payload.source))
        conn.commit()
    except sqlite3.IntegrityError:
        return {'ok': True, 'message': 'Already subscribed.', 'email': payload.email}
    log_event(conn, 'newsletter.subscribe', payload.email, {'source': payload.source})
    return {'ok': True, 'message': 'Subscription received.', 'email': payload.email}


@app.post('/api/contact')
def contact(payload: ContactRequest, conn: sqlite3.Connection = Depends(db)):
    cur = conn.execute(
        'INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)',
        (payload.name, payload.email, payload.message),
    )
    conn.commit()
    log_event(conn, 'contact.created', payload.email, {'contactId': cur.lastrowid})
    return {'ok': True, 'id': cur.lastrowid, 'message': 'Contact request submitted.'}


@app.post('/api/bundle-preview')
def bundle_preview(payload: BundlePreviewRequest):
    clean_items = [
        {
            'id': item.get('id'),
            'name': item.get('name'),
            'category': item.get('category'),
            'price': float(item.get('price', 0) or 0),
        }
        for item in payload.items if item
    ]
    total = round(sum(item['price'] for item in clean_items), 2)
    categories = {item.get('category') for item in clean_items}
    note = 'Bundle request generated.'
    if {'subscriptions', 'games', 'giftcards'}.issubset(categories):
        note = 'Balanced starter pack: subscription, game, and wallet support all in one order.'
    elif {'subscriptions', 'games'}.issubset(categories):
        note = 'Strong play-now bundle: access plus a game in one request.'
    elif categories == {'giftcards'}:
        note = 'Gift-card-only request: simple and fast to deliver.'
    return {'ok': True, 'items': clean_items, 'total': total, 'note': note}


@app.post('/api/order-preview')
def order_preview(payload: OrderRequest):
    return {
        'ok': True,
        'reference': f'GC-{__import__("secrets").randbelow(90000) + 10000}',
        'createdAt': __import__('datetime').datetime.utcnow().isoformat() + 'Z',
        'currency': payload.currency,
        'customer': payload.model_dump(exclude={'items'}),
        'items': [item.model_dump() for item in payload.items],
        'total': round(sum(item.lineTotal for item in payload.items), 2),
        'status': 'preview',
    }


@app.post('/api/orders', status_code=201)
def create_order(payload: OrderRequest, conn: sqlite3.Connection = Depends(db)):
    order_reference = f'GC-{__import__("secrets").randbelow(90000) + 10000}'
    cur = conn.execute(
        '''
        INSERT INTO orders (
            order_reference, customer_name, delivery_email, gamer_tag, region,
            preferred_language, customer_note, currency, subtotal, total, source, whatsapp_url
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''',
        (
            order_reference,
            payload.customerName,
            payload.deliveryEmail,
            payload.gamerTag,
            payload.region,
            payload.preferredLanguage,
            payload.customerNote,
            payload.currency,
            payload.subtotal,
            payload.total,
            payload.source,
            payload.whatsappUrl,
        ),
    )
    order_id = cur.lastrowid
    conn.executemany(
        '''
        INSERT INTO order_items (order_id, product_id, name, category, quantity, unit_price, line_total)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ''',
        [
            (order_id, item.productId, item.name, item.category, item.quantity, item.unitPrice, item.lineTotal)
            for item in payload.items
        ],
    )
    conn.commit()
    log_event(conn, 'order.created', payload.deliveryEmail or payload.customerName or 'guest', {'orderReference': order_reference})
    return {'ok': True, 'orderReference': order_reference, 'id': order_id, 'status': 'pending'}


@app.post('/api/auth/login')
def login(payload: LoginRequest, conn: sqlite3.Connection = Depends(db)):
    row = conn.execute('SELECT * FROM admin_users WHERE email = ? AND is_active = 1', (payload.email,)).fetchone()
    if not row or not verify_password(payload.password, row['password_hash']):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Invalid email or password')
    token = create_access_token(row['email'], row['role'])
    log_event(conn, 'admin.login', row['email'], {'success': True})
    return {'ok': True, 'token': token, 'role': row['role'], 'email': row['email']}


AdminAuth = Annotated[HTTPAuthorizationCredentials | None, Depends(bearer_scheme)]


@app.get('/api/admin/stats')
def admin_stats(credentials: AdminAuth, conn: sqlite3.Connection = Depends(db)):
    payload = require_admin(credentials)
    stats = {
        'products': conn.execute('SELECT COUNT(*) AS c FROM products').fetchone()['c'],
        'orders': conn.execute('SELECT COUNT(*) AS c FROM orders').fetchone()['c'],
        'newsletterSubscribers': conn.execute('SELECT COUNT(*) AS c FROM newsletter_subscribers').fetchone()['c'],
        'contactMessages': conn.execute('SELECT COUNT(*) AS c FROM contact_messages').fetchone()['c'],
    }
    log_event(conn, 'admin.stats.view', payload['sub'], stats)
    return {'ok': True, 'stats': stats}


@app.get('/api/admin/orders')
def admin_orders(credentials: AdminAuth, conn: sqlite3.Connection = Depends(db)):
    payload = require_admin(credentials)
    orders = rows_to_dicts(conn.execute('SELECT * FROM orders ORDER BY created_at DESC').fetchall())
    for order in orders:
        items = conn.execute('SELECT * FROM order_items WHERE order_id = ? ORDER BY id ASC', (order['id'],)).fetchall()
        order['items'] = rows_to_dicts(items)
    log_event(conn, 'admin.orders.view', payload['sub'], {'count': len(orders)})
    return {'ok': True, 'orders': orders}


@app.get('/api/admin/newsletter')
def admin_newsletter(credentials: AdminAuth, conn: sqlite3.Connection = Depends(db)):
    payload = require_admin(credentials)
    rows = rows_to_dicts(conn.execute('SELECT * FROM newsletter_subscribers ORDER BY created_at DESC').fetchall())
    log_event(conn, 'admin.newsletter.view', payload['sub'], {'count': len(rows)})
    return {'ok': True, 'subscribers': rows}


@app.get('/api/admin/contacts')
def admin_contacts(credentials: AdminAuth, conn: sqlite3.Connection = Depends(db)):
    payload = require_admin(credentials)
    rows = rows_to_dicts(conn.execute('SELECT * FROM contact_messages ORDER BY created_at DESC').fetchall())
    log_event(conn, 'admin.contacts.view', payload['sub'], {'count': len(rows)})
    return {'ok': True, 'messages': rows}


@app.get('/admin')
def admin_page():
    return FileResponse(FRONTEND_DIR / 'admin.html')


@app.get('/')
def root_page():
    return FileResponse(FRONTEND_DIR / 'index.html')


@app.get('/{page_name}')
def static_pages(page_name: str):
    safe_pages = {
        'offer.html', 'privacy.html', 'refund.html', 'terms.html', 'index.html', 'admin.html'
    }
    if page_name in safe_pages:
        return FileResponse(FRONTEND_DIR / page_name)
    raise HTTPException(status_code=404, detail='Page not found')
