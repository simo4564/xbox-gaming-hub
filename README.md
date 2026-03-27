# Gaming Community Store — Full-Stack Edition

This bundle upgrades the storefront into a fuller launch-ready structure:

- premium storefront frontend (`index.html`, `offer.html`, legal pages)
- secure-ish backend API with **FastAPI**
- **SQLite database** for products, live deals, orders, contacts, newsletter subscribers, admin users, and audit logs
- **admin dashboard** (`admin.html`)
- market-watch tooling for **Xbox-Now** deal discovery and **Allkeyshop** comparison baselines
- order persistence before redirecting to WhatsApp

## What is included

### Frontend
- `index.html` — main storefront
- `offer.html` — dedicated offer pages
- `admin.html` — admin login and dashboard UI
- `terms.html`, `privacy.html`, `refund.html` — working legal pages
- `assets/` — local product visuals, including corrected gift card images
- `products.json` — base storefront product catalog
- `live-deals.json` — bundled market-watch feed
- `offer-data.js` — featured offer content

### Backend
- `backend/app.py` — FastAPI application
- `backend/db.py` — SQLite schema + seeding helpers
- `backend/security.py` — password hashing, JWT auth, security headers, simple rate limiting
- `backend/requirements.txt` — Python dependencies
- `backend/.env.example` — environment variable template
- `backend/scripts/seed_database.py` — seeds the SQLite database
- `backend/scripts/sync_market_sources.py` — refresh script for Xbox-Now and Allkeyshop feeds
- `backend/data/gaming_community.db` — SQLite database created after seeding/running the backend

### Ops / deployment
- `Dockerfile`
- `docker-compose.yml`
- `.gitignore`
- `package.json` — convenience scripts for running the backend and legacy update scripts

## Database tables

The SQLite database contains:
- `products`
- `live_deals`
- `offers`
- `orders`
- `order_items`
- `newsletter_subscribers`
- `contact_messages`
- `admin_users`
- `audit_logs`

## Security improvements included

This version is stronger than the static-only build, but still not magically unbreakable.

Included:
- JWT-based admin login
- password hashing with PBKDF2
- basic rate limiting middleware
- security headers middleware (CSP, X-Frame-Options, Referrer-Policy, etc.)
- audit logging for important backend events
- database-backed persistence for orders / subscribers / contacts

Important reality check:
- **frontend source code can never be fully hidden from visitors** because browsers must download it
- sensitive logic is now moved to the backend where possible
- for real production, keep the repository private and deploy the backend on your own server / VPS / platform

## Run locally

### Option 1 — Python directly

```bash
cd worksite_v13
python -m uvicorn backend.app:app --reload --host 0.0.0.0 --port 8000
```

Open:
- storefront: `http://localhost:8000/`
- admin: `http://localhost:8000/admin`

### Option 2 — seed first, then start

```bash
python backend/scripts/seed_database.py
python -m uvicorn backend.app:app --host 0.0.0.0 --port 8000
```

### Option 3 — Docker

```bash
docker compose up --build
```

## Default admin credentials

These are controlled by environment variables.

See `backend/.env.example`:
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `JWT_SECRET`

Change them before real deployment.

## API overview

### Public
- `GET /api/health`
- `GET /api/products`
- `GET /api/products/{id}`
- `GET /api/live-deals`
- `GET /api/offers`
- `POST /api/newsletter`
- `POST /api/contact`
- `POST /api/bundle-preview`
- `POST /api/order-preview`
- `POST /api/orders`

### Admin
- `POST /api/auth/login`
- `GET /api/admin/stats`
- `GET /api/admin/orders`
- `GET /api/admin/newsletter`
- `GET /api/admin/contacts`

## Market-watch workflow

### Xbox-Now
Use Xbox-Now to discover fresh Xbox Store deals and sales to feature in the catalog.

### Allkeyshop
Use Allkeyshop comparison pages to determine the **cheapest visible market baseline**, then apply your rule:

```text
store price = cheapest market price * 1.20
```

The refresh script for this is:

```bash
python backend/scripts/sync_market_sources.py
```

## Frontend/backend flow now

- frontend displays products and offer pages
- contact form posts to the backend
- WhatsApp checkout also stores an internal order record first
- admin dashboard can review orders, newsletter signups, and contact messages
- product data and live deals are backed by SQLite after startup

## Still recommended before serious public launch

To go beyond MVP and into stronger production readiness, add:
- reverse proxy (Nginx / Caddy)
- HTTPS certificates
- proper secret management
- backup strategy for the SQLite DB or migration to PostgreSQL
- scheduled sync jobs for pricing/deals
- more granular admin roles
- bot protection / WAF (Cloudflare)
- monitoring and error tracking

## Useful file customization points

- storefront branding: `index.html`
- featured offers: `offer-data.js`
- fallback catalog: `products.json`
- market source mapping: `pricing-source-map.json`
- backend auth / limits: `backend/security.py`
- DB schema: `backend/db.py`
