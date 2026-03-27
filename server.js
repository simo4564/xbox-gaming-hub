const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const PRODUCTS_PATH = path.join(ROOT, 'products.json');
const OFFERS_PATH = path.join(ROOT, 'offer-data.js');

app.use(cors());
app.use(express.json());
app.use(express.static(ROOT));

function readProducts() {
  return JSON.parse(fs.readFileSync(PRODUCTS_PATH, 'utf8'));
}

function readOffers() {
  const raw = fs.readFileSync(OFFERS_PATH, 'utf8');
  const match = raw.match(/window\.OFFER_DETAILS\s*=\s*(\{[\s\S]*\});?/);
  if (!match) return {};
  return Function(`return (${match[1]})`)();
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'gaming-community-api', timestamp: new Date().toISOString() });
});

app.get('/api/products', (_req, res) => {
  res.json(readProducts());
});

app.get('/api/offers', (_req, res) => {
  res.json(readOffers());
});

app.post('/api/order-preview', (req, res) => {
  const { customer = {}, items = [], currency = '€' } = req.body || {};
  const total = items.reduce((sum, item) => sum + Number(item.lineTotal || 0), 0);
  const reference = `GC-${Math.floor(10000 + Math.random() * 90000)}`;
  res.json({
    reference,
    createdAt: new Date().toISOString(),
    customer,
    items,
    total: Number(total.toFixed(2)),
    currency,
    status: 'preview'
  });
});

app.post('/api/newsletter', (req, res) => {
  const { email } = req.body || {};
  if (!email) return res.status(400).json({ ok: false, message: 'Email is required.' });
  res.json({ ok: true, message: 'Subscription received.', email });
});

app.listen(PORT, () => {
  console.log(`Gaming Community backend running on http://localhost:${PORT}`);
});
