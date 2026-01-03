import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import HomePage from '@/pages/HomePage/HomePage.tsx'
import LoginPage from '@/pages/LoginPage/LoginPage.tsx'
import CaseInformationPage from '@/pages/CaseInformationPage/CaseInformationPage.tsx'
import AIConsultationPage from '@/pages/AIConsultationPage/AIConsultationPage.tsx'
import LegalLearningPage from '@/pages/LegalLearningPage/LegalLearningPage.tsx'
import LegalRiskAnalysisPage from '@/pages/LegalRiskAnalysisPage/LegalRiskAnalysisPage.tsx'
import { getUserInfo } from '@/services/api/userApi';
import useStore from '@/store/store';

function App() {
  const { changeUserInfo } = useStore();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        return;
      }

      try {
        const response = await getUserInfo();
        if (response.data) {
          changeUserInfo(response.data);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('token');
      }
    };

    checkAuth();
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/case-info" element={<CaseInformationPage />} />
        <Route path="/consultation" element={<AIConsultationPage />} />
        <Route path="/legal-learning" element={<LegalLearningPage />} />
        <Route path="/risk-analysis" element={<LegalRiskAnalysisPage />} />
      </Routes>
    </Router>
  )
}

export default App
