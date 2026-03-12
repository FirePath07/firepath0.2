import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

interface NavigationProps {
  showFullNav?: boolean;
}

export const Navigation = ({ showFullNav = true }: NavigationProps) => {
  const navigate = useNavigate();
  const { isSignedIn, user, signOut } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {user?.email !== 'firepathjjrp@gmail.com' && (
              <button
                onClick={() => navigate('/')}
                className="text-2xl font-bold text-emerald-800 dark:text-emerald-400 hover:opacity-80 transition">
                FIRE<span className="text-amber-500">Path</span>
              </button>
            )}
            {user?.email === 'firepathjjrp@gmail.com' && (
               <div className="text-2xl font-black text-slate-400 tracking-tighter italic">ADMIN<span className="text-emerald-500 not-italic">_MODE</span></div>
            )}
          </div>

          {showFullNav && (
            <div className="hidden md:flex items-center space-x-8">
              {user?.email !== 'firepathjjrp@gmail.com' && (
                <>
                  <button
                    onClick={() => navigate('/articles')}
                    className="text-gray-600 dark:text-gray-300 hover:text-emerald-700 dark:hover:text-emerald-400 font-medium transition">
                    Articles
                  </button>
                  <button
                    onClick={() => navigate('/calculators')}
                    className="text-gray-600 dark:text-gray-300 hover:text-emerald-700 dark:hover:text-emerald-400 font-medium transition">
                    Calculators
                  </button>
                </>
              )}

              {isSignedIn ? (
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => navigate(user?.email === 'firepathjjrp@gmail.com' ? '/admin?tab=suggestions' : '/feedback')}
                    className="text-gray-600 dark:text-gray-300 hover:text-emerald-700 dark:hover:text-emerald-400 font-medium transition">
                    Feedback
                  </button>
                  {user?.email !== 'firepathjjrp@gmail.com' && (
                    <button
                      onClick={() => navigate('/future-goals')}
                      className="text-gray-600 dark:text-gray-300 hover:text-emerald-700 dark:hover:text-emerald-400 font-medium transition">
                      Future Goals
                    </button>
                  )}
                  {user?.email !== 'firepathjjrp@gmail.com' && (
                    <button onClick={() => navigate('/user-details')} className="text-gray-700 dark:text-gray-300 font-medium hover:text-emerald-700 dark:hover:text-emerald-400 hover:underline">{user?.name}</button>
                  )}
                  <button
                    onClick={() => navigate(user?.email === 'firepathjjrp@gmail.com' ? '/admin' : '/profile')}
                    className="bg-emerald-700 text-white px-4 py-2 rounded-md hover:bg-emerald-800 transition">
                    Dashboard
                  </button>
                  <button
                    onClick={() => {
                      signOut();
                      navigate('/');
                    }}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                    Sign Out
                  </button>
                  <button
                    onClick={toggleDarkMode}
                    className="p-2 ml-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 shadow hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                    aria-label="Toggle Dark Mode"
                  >
                    {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => navigate('/login')}
                    className="bg-emerald-700 text-white px-4 py-2 rounded-md hover:bg-emerald-800 transition">
                    Sign In
                  </button>
                  <button
                    onClick={toggleDarkMode}
                    className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 shadow hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                    aria-label="Toggle Dark Mode"
                  >
                    {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
