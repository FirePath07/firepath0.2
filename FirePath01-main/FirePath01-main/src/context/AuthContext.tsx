import { createContext, useState, useContext, type ReactNode, useEffect } from 'react';

export interface UserFinancialData {
  monthlyIncome: number;
  currentSavings: number;
  monthlyExpenses: number;
  age: number;
  targetRetirementAge: number;
  riskProfile?: string;
  primaryGoal?: string;
  selectedFireAmount?: number;   // The actual FIRE number the user chose (Lean/Trad/Fat)
  timePressure?: string;
  foundationLevel?: string;
  mostImportantMetric?: 'Savings Rate' | 'Years to FIRE' | 'Net Worth';
  inflationRate?: number;
  budget?: number;
  expensesList?: Array<{
    id: string;
    amount: number;
    description: string;
    date: string;
  }>;
}

export interface User {
  id: string;
  name: string;
  email: string;
  financialData: UserFinancialData;
  createdAt?: Date;
}

interface AuthContextType {
  user: User | null;
  isSignedIn: boolean;
  signIn: (user: User) => void; // Deprecated, keeping for interface compatibility if needed, but logic will change
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => void;
  updateFinancialData: (data: Partial<UserFinancialData>) => Promise<void>;
  hardReset: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = 'http://localhost:5000/api/auth';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for token on mount
  useEffect(() => {
    const checkUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await fetch(`${API_URL}/me`, {
            headers: { 'x-auth-token': token }
          });
          if (res.ok) {
            const userData = await res.json();
            // Ensure financialData exists
            if (!userData.financialData) {
              userData.financialData = {
                monthlyIncome: 0,
                currentSavings: 0,
                monthlyExpenses: 0,
                age: 25,
                targetRetirementAge: 60,
                riskProfile: 'medium',
                inflationRate: 6
              };
            }
            setUser({ ...userData, id: userData._id || userData.id });
          } else {
            localStorage.removeItem('token');
          }
        } catch (err) {
          console.error("Error fetching user:", err);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };
    checkUser();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.msg || 'Login failed');
    }

    localStorage.setItem('token', data.token);
    setUser(data.user);
  };

  const register = async (name: string, email: string, password: string) => {
    const res = await fetch(`${API_URL}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.msg || 'Registration failed');
    }

    localStorage.setItem('token', data.token);
    setUser(data.user);
  };

  const signIn = (newUser: User) => {
    // Fallback for types or older compatibility, shouldn't be used with backend generally
    setUser(newUser);
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('firePathUser'); // Clean up old data too
  };

  const updateFinancialData = async (data: Partial<UserFinancialData>) => {
    if (user) {
      const updatedUser = {
        ...user,
        financialData: { ...user.financialData, ...data }
      };

      // Optimistic update
      setUser(updatedUser);

      // Backend update
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const res = await fetch(`${API_URL}/profile`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'x-auth-token': token
            },
            body: JSON.stringify({ financialData: updatedUser.financialData })
          });
          if (!res.ok) {
            console.error("Failed to update profile on backend");
            // Potentially revert state here if critical
          }
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const hardReset = async () => {
    if (user) {
      const resetData: UserFinancialData = {
        monthlyIncome: 0,
        currentSavings: 0,
        monthlyExpenses: 0,
        age: 25,
        targetRetirementAge: 60,
        riskProfile: 'medium',
        inflationRate: 6
      };

      const updatedUser = { ...user, financialData: resetData };
      setUser(updatedUser);

      try {
        const token = localStorage.getItem('token');
        if (token) {
          await fetch(`${API_URL}/profile`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'x-auth-token': token
            },
            body: JSON.stringify({ financialData: resetData })
          });
        }
      } catch (err) {
        console.error("Hard reset backend sync failed:", err);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, isSignedIn: !!user, signIn, login, register, signOut, updateFinancialData, hardReset, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
