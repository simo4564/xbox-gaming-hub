const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, 'live-deals.json');

// This script is intentionally lightweight. In production, expand the parsing rules
// for xbox-now.com and allkeyshop.com as their markup evolves.
// Rule of thumb:
// - Xbox-Now = discovery feed for new/interesting Xbox Store deals
// - Allkeyshop = cheapest comparison pricing baseline
// - Your store price = cheapest market price * 1.20

async function main() {
  const fallback = [
    {
      id: 'aks-gpu-30d',
      title: 'Xbox Game Pass Ultimate - 30 Days',
      subtitle: 'Allkeyshop comparison baseline',
      image: 'https://placehold.co/800x500/101418/107C10?text=Xbox+Game+Pass+Ultimate',
      marketPrice: 11.49,
      storePrice: 13.79,
      sourceName: 'Allkeyshop',
      sourceUrl: 'https://www.allkeyshop.com/blog/buy-xbox-game-pass-ultimate-cd-key-compare-prices/',
      note: 'Use the lowest visible market price as your baseline, then list it at +20% on your storefront.',
      updatedAt: new Date().toISOString()
    },
    {
      id: 'aks-core-12m',
      title: 'Xbox Game Pass Core - 12 Months',
      subtitle: 'Allkeyshop comparison baseline',
      image: 'https://placehold.co/800x500/111827/0ea5e9?text=Xbox+Game+Pass+Core',
      marketPrice: 43.0,
      storePrice: 51.6,
      sourceName: 'Allkeyshop',
      sourceUrl: 'https://www.allkeyshop.com/blog/buy-xbox-game-pass-core-cd-key-compare-prices/',
      note: 'Allkeyshop highlights roughly €43 as a benchmark for 12-month Core pricing.',
      updatedAt: new Date().toISOString()
    },
    {
      id: 'xboxnow-radar',
      title: 'Xbox-Now Deal Radar',
      subtitle: 'Always-updated Xbox Store sales feed',
      image: 'https://placehold.co/800x500/111111/f97316?text=Xbox-Now+Deals',
      marketPrice: null,
      storePrice: null,
      sourceName: 'Xbox-Now',
      sourceUrl: 'https://www.xbox-now.com/deal-list',
      note: 'Use Xbox-Now to spot new Xbox Store discounts, then decide what to add to your own catalog and price against Allkeyshop.',
      updatedAt: new Date().toISOString()
    }
  ];

  fs.writeFileSync(OUT, JSON.stringify(fallback, null, 2));
  console.log(`Wrote ${OUT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
