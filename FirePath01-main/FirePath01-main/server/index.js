require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');

const app = express();
app.use(cors());
app.use(express.json()); // Parse JSON bodies

const PORT = process.env.PORT || 5000; // Default to 5000 as per plan

// Connect to MongoDB
const uri = process.env.ATLAS_URI || process.env.MONGODB_URI;
mongoose.connect(uri)
  .then(() => console.log("MongoDB database connection established successfully"))
  .catch(err => console.log("MongoDB connection error: ", err));

app.use('/api/auth', authRoutes);

app.get('/api/market', async (req, res) => {
  try {
    const symbols = ['^NSEI', '^NSEBANK', '^BSESN'];
    const requests = symbols.map(symbol =>
      fetch(`https://query2.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`, {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      }).then(r => r.json())
    );

    const results = await Promise.all(requests);
    const formattedResults = results.map((data, index) => {
      const meta = data.chart.result[0].meta;
      return {
        symbol: symbols[index],
        regularMarketPrice: meta.regularMarketPrice,
        regularMarketChange: meta.regularMarketPrice - meta.previousClose,
        regularMarketChangePercent: ((meta.regularMarketPrice - meta.previousClose) / meta.previousClose) * 100
      };
    });

    return res.json({
      source: 'yahoo_chart',
      data: {
        quoteResponse: {
          result: formattedResults
        }
      }
    });

  } catch (err) {
    console.error("Market Data Error:", err);
    // Fallback if APIs fail
    res.json({
      source: 'demo_fallback',
      data: {
        quoteResponse: {
          result: [
            { symbol: '^NSEI', regularMarketPrice: 26150.75, regularMarketChange: 145.20, regularMarketChangePercent: 0.56 },
            { symbol: '^NSEBANK', regularMarketPrice: 53200.40, regularMarketChange: 210.30, regularMarketChangePercent: 0.40 },
            { symbol: '^BSESN', regularMarketPrice: 86500.25, regularMarketChange: 450.10, regularMarketChangePercent: 0.52 }
          ]
        }
      }
    });
  }
});

app.listen(PORT, () => {
  console.log(`Market proxy running on http://localhost:${PORT}`);
});
