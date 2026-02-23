import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Navigation } from '../components/Navigation';

export const HomePage = () => {
  const navigate = useNavigate();
  const { isSignedIn, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <Navigation showFullNav={true} />

      {/* Hero Section */}
      <div className="relative bg-emerald-900 dark:bg-emerald-950 overflow-hidden">
        <div className="absolute inset-0">
          <img
            className="w-full h-full object-cover opacity-30"
            src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&auto=format&fit=crop&w=2021&q=80"
            alt="Travel and Freedom"
          />
        </div>
        <div className="relative max-w-7xl mx-auto py-24 px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-4">
            Master Your Finances.<br />
            <span className="text-amber-400">Design Your Freedom.</span>
          </h1>
          <p className="mt-4 max-w-2xl text-xl text-gray-200">
            The ultimate resource for Financial Independence and Early Retirement.
            Calculate your number, learn the strategy, and join the community.
          </p>
          <div className="mt-8 flex gap-4">
            {isSignedIn ? (
              <>
                <button
                  onClick={() => navigate('/profile')}
                  className="bg-amber-500 text-white px-8 py-3 rounded-lg font-bold text-lg hover:bg-amber-600 transition shadow-lg">
                  Continue Planning
                </button>
                <button
                  onClick={() => navigate('/profile')}
                  className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-bold text-lg hover:bg-white hover:text-emerald-900 transition">
                  Go to Dashboard
                </button>
                <button
                  onClick={() => signOut()}
                  className="bg-red-600 text-white px-8 py-3 rounded-lg font-bold text-lg hover:bg-red-700 transition shadow-lg">
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate('/signup')}
                  className="bg-amber-500 text-white px-8 py-3 rounded-lg font-bold text-lg hover:bg-amber-600 transition shadow-lg">
                  Get Started
                </button>
                <button
                  onClick={() => navigate('/calculators')}
                  className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-bold text-lg hover:bg-white hover:text-emerald-900 transition">
                  Try Calculator
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Feature Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: "Smart Budgeting", desc: "Track every dollar with our zero-based budgeting tools.", img: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=800&q=80" },
            { title: "Community Forums", desc: "Connect with like-minded individuals on the path to freedom.", img: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80" },
            { title: "Investment Guides", desc: "Learn about index funds, real estate, and safe withdrawal rates.", img: "https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?auto=format&fit=crop&w=800&q=80" }
          ].map((item, idx) => (
            <div key={idx} className="group bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition duration-300 overflow-hidden cursor-pointer">
              <div className="h-48 overflow-hidden">
                <img src={item.img} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-black text-gray-400 py-12 mt-12 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p>&copy; 2024 FIREPath. All rights reserved. Not financial advice.</p>
        </div>
      </footer>
    </div>
  );
};
