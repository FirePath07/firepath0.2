import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { CalculatorsPage } from './pages/CalculatorsPage';
import { UserProfileDashboard } from './pages/UserProfileDashboard';
import { ArticlesPage } from './pages/ArticlesPage';
import { LoginPage } from './pages/LoginPage';
import { SignUpPage } from './pages/SignUpPage';
import { QuestionnairePage } from './pages/QuestionnairePage';
import { RiskPage } from './pages/RiskPage';
import { ExpensesPage } from './pages/ExpensesPage';
import { AuthProvider } from './context/AuthContext';
import './App.css';

import { UserProfilePage } from './pages/UserProfilePage';
import { StrategyExplanationPage } from './pages/StrategyExplanationPage';
import { InvestmentProgressDashboard } from './pages/InvestmentProgressDashboard';
import { FutureGoalsDashboard } from './pages/FutureGoalsDashboard';
import { FeedbackPage } from './pages/FeedbackPage';
import { AdminDashboard } from './pages/AdminDashboard';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/questionnaire" element={<QuestionnairePage />} />
          <Route path="/profile" element={<UserProfileDashboard />} />
          <Route path="/user-details" element={<UserProfilePage />} />
          <Route path="/calculators" element={<CalculatorsPage />} />
          <Route path="/articles" element={<ArticlesPage />} />
          <Route path="/risk" element={<RiskPage />} />
          <Route path="/expenses" element={<ExpensesPage />} />
          <Route path="/strategy-explanation" element={<StrategyExplanationPage />} />
          <Route path="/investment-dashboard" element={<InvestmentProgressDashboard />} />
          <Route path="/future-goals" element={<FutureGoalsDashboard />} />
          <Route path="/feedback" element={<FeedbackPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
