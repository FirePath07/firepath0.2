require('dotenv').config();
const express = require('express');
const NodeCache = require('node-cache');
const cors = require('cors');

const app = express();
const cache = new NodeCache({ stdTTL: 55 });
app.use(cors());

const PORT = process.env.PORT || 3000;

app.get('/api/market', async (req, res) => {
  try {
    const cached = cache.get('market');
    if (cached) return res.json(cached);

    const symbols = ['^NSEI', '^NSEBANK', '^BSESN'].join(',');

    // Prefer Twelve Data if key provided (not implemented symbol mapping here)
    const twelveKey = process.env.TWELVE_DATA_KEY;
    let result = null;

    if (twelveKey) {
      try {
        const url = `https://api.twelvedata.com/quote?symbol=${encodeURIComponent(symbols)}&apikey=${twelveKey}`;
        const r = await fetch(url);
        if (r.ok) {
          const json = await r.json();
          result = { source: 'twelvedata', data: json };
        }
      } catch (e) {
        console.warn('Twelve Data proxy error:', e);
      }
    }

    // Fallback: server-side fetch to Yahoo Finance
    if (!result) {
      try {
        const yahoo = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(symbols)}`;
        const r = await fetch(yahoo);
        if (r.ok) {
          const json = await r.json();
          result = { source: 'yahoo', data: json };
          console.log('✓ Yahoo Finance returned data');
        } else {
          console.warn(`Yahoo Finance failed with ${r.status}: ${r.statusText}`);
        }
      } catch (e) {
        console.warn('Yahoo Finance fetch error:', e.message);
      }
    }

    // Final fallback: return demo data if all APIs fail
    if (!result) {
      console.log('Using demo data (all APIs unavailable)');
      result = {
        source: 'demo',
        data: {
          quoteResponse: {
            result: [
              { symbol: '^NSEI', regularMarketPrice: 25973.25, regularMarketChange: 38.10, regularMarketChangePercent: 0.15 },
              { symbol: '^NSEBANK', regularMarketPrice: 51450.80, regularMarketChange: 52.30, regularMarketChangePercent: 0.10 },
              { symbol: '^BSESN', regularMarketPrice: 86025.45, regularMarketChange: 95.65, regularMarketChangePercent: 0.11 }
            ]
          }
        }
      };
    }

    cache.set('market', result);
    return res.json(result);
  } catch (err) {
    console.error('Server proxy error:', err);
    // Return demo data on error
    return res.json({
      source: 'demo',
      data: {
        quoteResponse: {
          result: [
            { symbol: '^NSEI', regularMarketPrice: 25973.25, regularMarketChange: 38.10, regularMarketChangePercent: 0.15 },
            { symbol: '^NSEBANK', regularMarketPrice: 51450.80, regularMarketChange: 52.30, regularMarketChangePercent: 0.10 },
            { symbol: '^BSESN', regularMarketPrice: 86025.45, regularMarketChange: 95.65, regularMarketChangePercent: 0.11 }
          ]
        }
      }
    });
  }
});

app.listen(PORT, () => {
  console.log(`Market proxy running on http://localhost:${PORT}`);
});
