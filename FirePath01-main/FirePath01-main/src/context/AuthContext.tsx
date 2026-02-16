import { createContext, useState, useContext, type ReactNode } from 'react';

export interface UserFinancialData {
  monthlyIncome: number;
  currentSavings: number;
  monthlyExpenses: number;
  age: number;
  targetRetirementAge: number;
  riskProfile?: 'safe' | 'medium' | 'risky';
  primaryGoal?: string;
  mostImportantMetric?: 'Savings Rate' | 'Years to FIRE' | 'Net Worth';
}

export interface User {
  id: string;
  name: string;
  email: string;
  financialData: UserFinancialData;
  createdAt: Date;
}

interface AuthContextType {
  user: User | null;
  isSignedIn: boolean;
  signIn: (user: User) => void;
  signOut: () => void;
  updateFinancialData: (data: Partial<UserFinancialData>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('firePathUser');
    return saved ? JSON.parse(saved) : null;
  });

  const signIn = (newUser: User) => {
    setUser(newUser);
    localStorage.setItem('firePathUser', JSON.stringify(newUser));
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem('firePathUser');
  };

  const updateFinancialData = (data: Partial<UserFinancialData>) => {
    if (user) {
      const updated = {
        ...user,
        financialData: { ...user.financialData, ...data }
      };
      setUser(updated);
      localStorage.setItem('firePathUser', JSON.stringify(updated));
    }
  };

  return (
    <AuthContext.Provider value={{ user, isSignedIn: !!user, signIn, signOut, updateFinancialData }}>
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
