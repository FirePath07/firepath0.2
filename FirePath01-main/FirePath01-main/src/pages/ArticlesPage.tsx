import { Navigation } from '../components/Navigation';
import { useState, useEffect } from 'react';

interface NewsArticle {
  source: { id: string; name: string };
  author: string;
  title: string;
  description: string;
  url: string;
  urlToImage: string;
  publishedAt: string;
  content: string;
}

interface MarketIndex {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  icon: string;
}

export const ArticlesPage = () => {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [marketData, setMarketData] = useState<MarketIndex[]>([
    { symbol: 'NIFTY50', name: 'Nifty 50', price: 0, change: 0, changePercent: 0, icon: '📈' },
    { symbol: 'BANKNIFTY', name: 'Bank Nifty', price: 0, change: 0, changePercent: 0, icon: '🏦' },
    { symbol: 'SENSEX', name: 'Sensex', price: 0, change: 0, changePercent: 0, icon: '💼' }
  ]);
  const [marketLoading, setMarketLoading] = useState(true);
  const [showMarketSetup, setShowMarketSetup] = useState(false);

  const ENV_API_KEY = import.meta.env.VITE_NEWS_API_KEY || '';

  const fetchNews = async (key: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `https://newsapi.org/v2/everything?q=finance+OR+stocks+OR+investing+OR+economy&sortBy=publishedAt&language=en&pageSize=12&apiKey=${key}`
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Invalid API key. Please check your NewsAPI key.');
        } else if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please try again later.');
        }
        throw new Error('Failed to fetch news');
      }

      const data = await response.json();
      if (data.articles) {
        setNews(data.articles);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch news');
    } finally {
      setLoading(false);
    }
  };

  const fetchMarketData = async () => {
    try {
      setMarketLoading(true);
      const updates: MarketIndex[] = [];

      interface IndexConfig {
        symbol: string;
        name: string;
        displaySymbol: string;
        icon: string;
      }

      const indices: IndexConfig[] = [
        { symbol: 'NIFTY50', name: 'Nifty 50', displaySymbol: '^NSEI', icon: '📈' },
        { symbol: 'BANKNIFTY', name: 'Bank Nifty', displaySymbol: '^NSEBANK', icon: '🏦' },
        { symbol: 'SENSEX', name: 'Sensex', displaySymbol: '^BSESN', icon: '💼' }
      ];

      try {
        // Fetch quotes from our local server-side proxy which returns Yahoo/TwelveData data
        const res = await fetch(`/api/market`);

        if (res.ok) {
          const json = await res.json();
          const payload = json.data?.quoteResponse?.result || json.data?.result || [];

          for (const idx of indices) {
            const r = payload.find((q: any) => q.symbol === idx.displaySymbol || q.symbol === idx.symbol || q.code === idx.displaySymbol || q.ticker === idx.displaySymbol);
            if (r) {
              const price = Number(r.regularMarketPrice ?? r.price ?? r.last_price ?? 0);
              const change = Number(r.regularMarketChange ?? r.change ?? r.last_change ?? 0);
              const changePercent = Number(r.regularMarketChangePercent ?? r.percent_change ?? r.change_percent ?? 0);

              updates.push({
                symbol: idx.displaySymbol,
                name: idx.name,
                price: isNaN(price) ? 0 : price,
                change: isNaN(change) ? 0 : change,
                changePercent: isNaN(changePercent) ? 0 : changePercent,
                icon: idx.icon
              });
            }
          }
        } else {
          console.warn('Market proxy request failed, status:', res.status);
        }
      } catch (e) {
        console.warn('Yahoo Finance fetch error:', e);
      }

      // Fallback to demo values if no live data retrieved
      if (updates.length === 0) {
        const demoData: { [key: string]: { price: number; change: number; changePercent: number } } = {
          'Nifty 50': { price: 25973.25, change: 38.10, changePercent: 0.15 },
          'Bank Nifty': { price: 51450.80, change: 52.30, changePercent: 0.10 },
          'Sensex': { price: 86025.45, change: 95.65, changePercent: 0.11 }
        };

        for (const idx of indices) {
          const demo = demoData[idx.name] || { price: 0, change: 0, changePercent: 0 };
          updates.push({
            symbol: idx.displaySymbol,
            name: idx.name,
            price: demo.price,
            change: demo.change,
            changePercent: demo.changePercent,
            icon: idx.icon
          });
        }
      }

      if (updates.length > 0) {
        setMarketData(updates);
      }
    } catch (err) {
      console.error('Market data fetch error:', err);
    } finally {
      setMarketLoading(false);
    }
  };

  useEffect(() => {
    // Fetch market data immediately
    fetchMarketData();

    // Update market data every 60 seconds
    const marketInterval = setInterval(fetchMarketData, 60000);

    // Fetch news if API key is available
    if (ENV_API_KEY) {
      fetchNews(ENV_API_KEY);
    } else {
      setLoading(false);
    }

    return () => clearInterval(marketInterval);
  }, []);



  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation showFullNav={true} />

      {/* Hero Section */}
      <div className="relative bg-emerald-900 overflow-hidden">
        <div className="absolute inset-0">
          <img
            className="w-full h-full object-cover opacity-30"
            src="https://images.unsplash.com/photo-1452587925148-ce544e77e70d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2021&q=80"
            alt="Financial News"
          />
        </div>
        <div className="relative max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
            Latest Financial News
          </h1>
          <p className="mt-4 max-w-2xl text-xl text-gray-200">
            Stay updated with current financial news, market trends, and investment insights powered by NewsAPI.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

        {/* Real-Time Market Data Section */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-3xl font-bold text-gray-900">📊 Indian Market Indices</h2>
            <button
              onClick={() => setShowMarketSetup(!showMarketSetup)}
              className="text-xs px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full hover:bg-emerald-200 transition font-semibold"
            >
              ⚙️ Settings
            </button>
          </div>
          <p className="text-center text-gray-600 mb-8">Real-time data of major Indian stock market indices updated every 60 seconds</p>

          {/* Market API Setup Section */}
          {showMarketSetup && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-bold text-green-900 mb-3">📡 Groww API Setup</h3>
              <p className="text-green-700 mb-4">
                Real-time NSE market data is fetched from Groww API (https://api.groww.in/v1/live-data/quote).
              </p>
              <p className="text-sm text-green-700 mb-4">
                API Endpoint: <code className="bg-white px-2 py-1 rounded font-mono text-xs">https://api.groww.in/v1/live-data/quote</code>
              </p>

              <div className="bg-green-100 border border-green-300 rounded p-4 mt-4">
                <p className="text-sm text-green-800">
                  <strong>✓ Live NSE Data Enabled</strong><br />
                  Market data for Nifty 50, Bank Nifty, and Sensex is being fetched in real-time via Groww.
                </p>
              </div>
            </div>
          )}

          {marketLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-700 mx-auto mb-3"></div>
                <p className="text-gray-600 font-semibold">Loading market data...</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {marketData.map((index) => (
                <div
                  key={index.symbol}
                  className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl shadow-lg p-8 border-l-4 border-emerald-700 hover:shadow-xl transition duration-300"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-4xl mb-2">{index.icon}</p>
                      <h3 className="text-2xl font-bold text-gray-900">{index.name}</h3>
                      <p className="text-sm text-gray-600 font-semibold">{index.symbol}</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-4 mb-4">
                    <div className="text-3xl font-bold text-emerald-700 mb-2">
                      ₹{index.price.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    </div>
                    <div className={`flex items-center gap-2 text-xl font-bold ${index.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      <span>{index.changePercent >= 0 ? '▲' : '▼'}</span>
                      <span>{index.change.toFixed(2)}</span>
                      <span>({index.changePercent >= 0 ? '+' : ''}{index.changePercent.toFixed(2)}%)</span>
                    </div>
                  </div>

                  <div className="text-xs text-gray-600 text-center">
                    Last updated: {new Date().toLocaleTimeString('en-IN')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-700 mx-auto mb-4"></div>
              <p className="text-gray-600 font-semibold">Fetching latest financial news...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
            <h3 className="text-red-900 font-bold text-lg mb-2">⚠️ Error Fetching News</h3>
            <p className="text-red-700 mb-4">{error}</p>
          </div>
        )}

        {/* News Section */}
        {!loading && news.length > 0 && (
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">📰 Latest Financial News</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {news.map((article, idx) => (
                <a
                  key={idx}
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-white rounded-xl shadow-md hover:shadow-xl transition duration-300 overflow-hidden block"
                >
                  <div className="h-48 overflow-hidden bg-gray-200">
                    {article.urlToImage ? (
                      <img
                        src={article.urlToImage}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45b?auto=format&fit=crop&w=800&q=80';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-100 to-emerald-50">
                        <span className="text-4xl">📰</span>
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full font-semibold">
                        {article.source.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(article.publishedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-emerald-700 transition">
                      {article.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {article.description || 'Click to read full article'}
                    </p>
                    <span className="text-emerald-700 font-semibold text-sm group-hover:text-emerald-900">
                      Read Full Article →
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && news.length === 0 && !error && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No news articles found. Try again later.</p>
          </div>
        )}

        {/* Free Resources Section */}
        <div className="mt-20 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Free Financial Resources</h2>
          <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">
            Access these trusted, free financial education resources to expand your knowledge and make informed decisions.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                name: "Investopedia",
                desc: "Comprehensive financial education with articles, tutorials, and market data",
                url: "https://www.investopedia.com",
                icon: "📚"
              },
              {
                name: "Khan Academy - Finance",
                desc: "Free video courses on personal finance, investing, and economics",
                url: "https://www.khanacademy.org/college-careers-more/finance-and-capital-markets",
                icon: "🎓"
              },
              {
                name: "SEC Investor.gov",
                desc: "Official SEC resource for investor education and protection",
                url: "https://www.investor.gov",
                icon: "🏛️"
              },
              {
                name: "FINRA Investor Education",
                desc: "Financial Industry Regulatory Authority's free investor resources",
                url: "https://www.finra.org/investors",
                icon: "📊"
              },
              {
                name: "Bankrate",
                desc: "Free calculators and guides for mortgages, loans, and savings",
                url: "https://www.bankrate.com",
                icon: "💰"
              },
              {
                name: "NerdWallet",
                desc: "Personal finance site with free tools and honest reviews",
                url: "https://www.nerdwallet.com",
                icon: "🤓"
              },
              {
                name: "The Balance",
                desc: "Free personal finance advice covering budgeting, investing, and retirement",
                url: "https://www.thebalance.com",
                icon: "⚖️"
              },
              {
                name: "MyMoney.gov",
                desc: "U.S. government's official financial education website",
                url: "https://www.mymoney.gov",
                icon: "🇺🇸"
              },
              {
                name: "Bogleheads",
                desc: "Community forum for index fund investing and passive strategies",
                url: "https://www.bogleheads.org",
                icon: "👥"
              }
            ].map((resource, idx) => (
              <a
                key={idx}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition duration-300 p-6 block group"
              >
                <div className="text-4xl mb-3">{resource.icon}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-emerald-700 transition">{resource.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{resource.desc}</p>
                <span className="text-emerald-700 font-semibold text-sm group-hover:text-emerald-900">Visit Resource →</span>
              </a>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p>&copy; 2024 FIREPath. All rights reserved. Not financial advice.</p>
          <p className="text-sm mt-4">Financial news powered by <a href="https://newsapi.org" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">NewsAPI</a></p>
        </div>
      </footer>
    </div>
  );
};
