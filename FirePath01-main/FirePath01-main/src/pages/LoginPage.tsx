import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, type User } from '../context/AuthContext';
import { Navigation } from '../components/Navigation';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!email || !password) {
        throw new Error('Please fill in all fields');
      }

      // This is where you would typically call a backend to verify credentials.
      // For this demo, we'll retrieve the user from localStorage.
      const savedUser = localStorage.getItem('firePathUser');
      if (savedUser) {
        const user: User = JSON.parse(savedUser);
        // NOTE: In a real app, you'd verify the password hash. Here we just check email.
        if (user.email === email) {
          signIn(user);
          navigate('/profile');
        } else {
          throw new Error('Invalid email or password');
        }
      } else {
        throw new Error('No account found with this email.');
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation showFullNav={false} />
      <div className="max-w-md mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">
            Welcome Back
          </h1>
          <p className="text-gray-600 text-center mb-6">
            Sign in to your FIREPath account.
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-emerald-700 transition disabled:opacity-50"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              Don't have an account?{' '}
              <button
                onClick={() => navigate('/signup')}
                className="text-emerald-600 font-bold hover:underline"
              >
                Sign Up
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
