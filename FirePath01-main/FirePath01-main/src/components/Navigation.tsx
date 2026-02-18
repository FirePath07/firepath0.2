import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface NavigationProps {
  showFullNav?: boolean;
}

export const Navigation = ({ showFullNav = true }: NavigationProps) => {
  const navigate = useNavigate();
  const { isSignedIn, user, signOut } = useAuth();

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/')}
              className="text-2xl font-bold text-emerald-800 hover:opacity-80 transition">
              FIRE<span className="text-amber-500">Path</span>
            </button>
          </div>

          {showFullNav && (
            <div className="hidden md:flex items-center space-x-8">
              <button
                onClick={() => navigate('/articles')}
                className="text-gray-600 hover:text-emerald-700 font-medium transition">
                Articles
              </button>
              <button
                onClick={() => navigate('/calculators')}
                className="text-gray-600 hover:text-emerald-700 font-medium transition">
                Calculators
              </button>
              <button
                onClick={() => navigate('/articles')}
                className="text-gray-600 hover:text-emerald-700 font-medium transition">
                Community
              </button>
              {isSignedIn ? (
                <div className="flex items-center gap-4">
                  <button onClick={() => navigate('/user-details')} className="text-gray-700 font-medium hover:text-emerald-700 hover:underline">{user?.name}</button>
                  <button
                    onClick={() => navigate('/profile')}
                    className="bg-emerald-700 text-white px-4 py-2 rounded-md hover:bg-emerald-800 transition">
                    Dashboard
                  </button>
                  <button
                    onClick={() => {
                      signOut();
                      navigate('/');
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition">
                    Sign Out
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => navigate('/login')}
                  className="bg-emerald-700 text-white px-4 py-2 rounded-md hover:bg-emerald-800 transition">
                  Sign In
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
