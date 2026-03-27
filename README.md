# Gaming Community Store

This repository contains a production-ready digital storefront for selling Xbox digital products such as Game Pass subscriptions, game keys and gift cards. The site uses vanilla HTML, TailwindCSS and JavaScript and integrates a WhatsApp-based checkout flow.

## Contents

* **index.html** – The main website. All of the UI and store logic lives in this file. It dynamically fetches product data from `products.json` (if present) and falls back to a built‑in dataset when necessary. It includes featured deals, favorites, recently viewed items, newsletter, a promo countdown, and an expanded WhatsApp checkout flow with richer automated order text.
* **pricing-source-map.json** – A configuration file that maps your internal product IDs to market source URLs (e.g. Allkeyshop) along with a margin percentage and fallback base price. This file is consumed by the update script.
* **update-prices.js** – A Node.js script that reads the source map, attempts to scrape the latest market prices, applies the configured margin and writes `products.json`. If scraping fails, it falls back to the last known good price or the configured base price.
* **products.json** – A generated data file containing the current product catalogue with calculated pricing. The front‑end loads this file automatically when present.
* **offer-data.js** – Shared featured-offer data used by the homepage and dedicated offer page.
* **offer.html** – A dedicated offer page template. Featured offers on the homepage link here and load the correct content via the `slug` query parameter.
* **README.md** – This document.

## Running Locally

1. Install the dependencies (optional) if you plan to enable live scraping:

```sh
npm install axios cheerio
```

2. Update product mappings in `pricing-source-map.json`. Each entry includes an ID, name, category, Allkeyshop source URL, margin percentage, fallback base price and product metadata.

3. Run the updater to refresh `products.json`:

```sh
node update-prices.js
```

By default the script uses the fallback base prices because network access is disabled. To enable real scraping in your own environment, uncomment the `axios`/`cheerio` lines and adjust the selector within `fetchLowestPriceFromSource()`.

4. Open `index.html` in a browser. If `products.json` exists, the site will load up‑to‑date prices. Otherwise the fallback dataset baked into the JavaScript will display.

## Customization

Common changes can be performed directly inside **index.html**:

| What                        | Where to edit                                             |
|----------------------------|------------------------------------------------------------|
| **Store name/logo**        | Find `Gaming<span class="text-brand">Community</span>` near the top of the file. Replace the text to change branding. |
| **WhatsApp number**        | In the `<script>` section, update `STORE_CONFIG.whatsappNumber` with your WhatsApp number (digits only). |
| **Theme colors**           | Edit the `tailwind.config` definition at the top of the file. Brand colours live under `colors.brand`. |
| **Hero images/text**       | Within the `#home` section, replace image URLs and modify headings or paragraphs as needed. |
| **Product list**           | Update `pricing-source-map.json` and re‑run `node update-prices.js`, or edit the `fallbackProducts` array in the JavaScript if you want static products. |
| **Featured offers**        | Edit `offer-data.js` to change offer images, labels, text, or which product each offer page points to. |
| **Margin or pricing logic** | Modify `marginPercent` values in `pricing-source-map.json` or adjust the calculations in `update-prices.js`. |

## Deployment

To deploy as a static site (e.g. via GitHub Pages, Netlify or Vercel):

1. Ensure `products.json` is committed to the repository alongside `index.html`.
2. Push the files to your hosting provider. No build step is required.
3. Optionally set up a scheduled job on a server to run `node update-prices.js` periodically and commit/publish the updated `products.json` back to the repository for live pricing.

## Last Updated Indicator

The site displays a “Last updated” timestamp in the Digital Store section. It uses the latest `lastUpdated` value from `products.json`. If the file is not present, it indicates that fallback prices are in use.


## New Useful Features

- **Compare products**: buyers can compare up to 3 products side by side before deciding.
- **Activation & Region Guide**: helps customers understand compatibility and what happens after payment.
- **Featured offer pages**: image-led deals open on dedicated pages with next-step guidance.


## Backend Included

This version also includes a simple **Express backend** so the project is no longer frontend-only:

- `server.js` — serves the storefront and exposes API endpoints
- `GET /api/health` — backend health check
- `GET /api/products` — product feed
- `GET /api/offers` — offer feed
- `POST /api/order-preview` — order preview payload for future checkout workflows
- `POST /api/newsletter` — newsletter signup endpoint

To run the full stack locally:

```sh
npm install
npm start
```

Then open `http://localhost:3000`.


## Extra Pages

This bundle now includes `terms.html`, `privacy.html`, and `refund.html` so the Legal links in the footer work correctly.
It also includes local gift card images inside `assets/` so the gift card products use accurate artwork instead of unrelated external images.


## Live deal feed

- `live-deals.json` stores the market-watch cards shown in the **Latest Deal Radar** section.
- `update-live-deals.js` is the refresh script for that feed. It is designed to use **Xbox-Now** for discovery and **Allkeyshop** for cheapest pricing baselines.
- Pricing rule: `storePrice = marketPrice * 1.20`.
- If you update the feed manually, keep the `updatedAt` field current so the frontend shows the correct timestamp.
