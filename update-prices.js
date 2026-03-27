/**
 * GAMING COMMUNITY - PRICE UPDATER SCRIPT
 *
 * DESCRIPTION:
 * This script reads product configuration from `pricing-source-map.json`, scrapes the latest market price
 * (lowest offer) from each configured source URL, applies a defined markup margin (e.g., +20%),
 * and writes a refreshed `products.json` file consumed by the frontend.
 *
 * In this demo environment network requests are disabled. The script is written to gracefully
 * fall back to existing price data from a previous `products.json` or to a static fallback base price if
 * scraping fails. The scraping logic is provided but commented out; you can uncomment it and install
 * the required packages (`axios` and `cheerio`) to enable live price fetching in your own environment.
 *
 * USAGE:
 * node update-prices.js
 *
 * AUTOMATION:
 * Set up a cron job or scheduled task to run this script at regular intervals (e.g., daily) on your server.
 */

const fs = require('fs');
const path = require('path');
// const axios = require('axios');
// const cheerio = require('cheerio');

const CONFIG_PATH = path.join(__dirname, 'pricing-source-map.json');
const OUTPUT_PATH = path.join(__dirname, 'products.json');

/**
 * Attempt to extract the lowest price from the given URL. If network access is disabled or the
 * page structure changes, this function should throw an error so fallback logic can engage.
 *
 * @param {string} url - A product page URL on Allkeyshop or other pricing source
 * @returns {Promise<number>} The lowest market price
 */
async function fetchLowestPriceFromSource(url) {
  // In your own environment uncomment the following lines and adjust selectors as needed.
  /*
  const response = await axios.get(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0',
      'Accept-Language': 'en-US,en;q=0.9',
    },
  });
  const $ = cheerio.load(response.data);
  // NOTE: Allkeyshop frequently updates their HTML structure. Inspect the page to locate
  // the selector where the best price is displayed. The following is a rough example:
  const priceText = $('.akstore-bestprice .price').first().text().replace(/[^\d.,]/g, '').replace(',', '.');
  const parsed = parseFloat(priceText);
  if (!isNaN(parsed) && parsed > 0) return parsed;
  */
  // Throw so fallback logic is used in this demo environment
  throw new Error('Live scraping not enabled in this environment');
}

/**
 * Load previous product data from the existing products.json file if available.
 * This is used to preserve the last known valid price when scraping fails.
 *
 * @returns {Object<string, Object>|null} Mapping of product ID to previous product object
 */
function loadPreviousData() {
  try {
    if (fs.existsSync(OUTPUT_PATH)) {
      const raw = fs.readFileSync(OUTPUT_PATH, 'utf-8');
      const arr = JSON.parse(raw);
      const map = {};
      for (const p of arr) {
        map[p.id] = p;
      }
      return map;
    }
  } catch (err) {
    console.error('Error reading previous products.json:', err.message);
  }
  return null;
}

/**
 * Main update routine. Reads configuration, attempts to fetch market prices, applies margins and
 * writes the refreshed product array to OUTPUT_PATH.
 */
async function updatePrices() {
  console.log('=== GAMING COMMUNITY: Updating Prices ===');
  // Load config
  const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
  const previous = loadPreviousData();
  const productsOut = [];
  for (const item of config.products) {
    let marketPrice;
    let priceStatus = 'fallback';
    try {
      marketPrice = await fetchLowestPriceFromSource(item.sourceUrl);
      priceStatus = 'scraped';
    } catch (err) {
      // Use previous valid price if available
      if (previous && previous[item.id] && typeof previous[item.id].marketPrice === 'number') {
        marketPrice = previous[item.id].marketPrice;
        priceStatus = 'previous';
      } else {
        marketPrice = item.basePriceFallback;
        priceStatus = 'fallback';
      }
    }
    // Apply margin
    const finalPrice = parseFloat((marketPrice * (1 + item.marginPercent / 100)).toFixed(2));
    // Generate old price (optional: higher than final price for discount perception)
    const oldPrice = parseFloat((finalPrice * 1.3).toFixed(2));
    const productObj = {
      id: item.id,
      name: item.name,
      category: item.category,
      sourceUrl: item.sourceUrl,
      marketPrice: parseFloat(marketPrice.toFixed(2)),
      marginPercent: item.marginPercent,
      price: finalPrice,
      oldPrice: oldPrice,
      image: item.image,
      badge: item.badge || '',
      description: item.description,
      inStock: true,
      lastUpdated: new Date().toISOString(),
      priceStatus: priceStatus,
    };
    productsOut.push(productObj);
    console.log(`${productObj.name}: ${priceStatus} price -> Market €${productObj.marketPrice}, Final €${productObj.price}`);
  }
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(productsOut, null, 2));
  console.log(`\nWritten updated product data to ${OUTPUT_PATH}`);
}

updatePrices().catch(err => {
  console.error('Update process failed:', err);
});