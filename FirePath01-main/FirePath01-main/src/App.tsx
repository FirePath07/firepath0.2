import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { CalculatorsPage } from './pages/CalculatorsPage';
import { UserProfileDashboard } from './pages/UserProfileDashboard';
import { ArticlesPage } from './pages/ArticlesPage';
import { LoginPage } from './pages/LoginPage';
import { SignUpPage } from './pages/SignUpPage';
import { QuestionnairePage } from './pages/QuestionnairePage';
import { RiskPage } from './pages/RiskPage';
import { AuthProvider } from './context/AuthContext';
import './App.css';

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
          <Route path="/calculators" element={<CalculatorsPage />} />
          <Route path="/articles" element={<ArticlesPage />} />
          <Route path="/risk" element={<RiskPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
