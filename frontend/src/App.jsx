import { Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import PatientProfile from './pages/PatientProfile';
import CBCAnalysis from './pages/CBCAnalysis';
import HealthCheck from './pages/HealthCheck';
import AIAnalysis from './pages/AIAnalysis';
import Reports from './pages/Reports';
import KnowledgeHub from './pages/KnowledgeHub';
import CarePlan from './pages/CarePlan';
import EmergencyHelp from './pages/EmergencyHelp';
import Feedback from './pages/Feedback';
import HealthJourney from './pages/HealthJourney';
import HealthQuiz from './pages/HealthQuiz';
import Reminders from './pages/Reminders';
import DoctorDashboard from './pages/DoctorDashboard';
import DoctorPatients from './pages/DoctorPatients';
import DoctorReview from './pages/DoctorReview';

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Patient protected routes */}
        <Route path="/dashboard" element={<ProtectedRoute requiredRole="patient"><Dashboard /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute requiredRole="patient"><PatientProfile /></ProtectedRoute>} />
        <Route path="/cbc-analysis" element={<ProtectedRoute requiredRole="patient"><CBCAnalysis /></ProtectedRoute>} />
        <Route path="/health-check" element={<ProtectedRoute requiredRole="patient"><HealthCheck /></ProtectedRoute>} />
        <Route path="/ai-analysis" element={<ProtectedRoute requiredRole="patient"><AIAnalysis /></ProtectedRoute>} />
        <Route path="/ai-analysis/:id" element={<ProtectedRoute requiredRole="patient"><AIAnalysis /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute requiredRole="patient"><Reports /></ProtectedRoute>} />
        <Route path="/care-plan" element={<ProtectedRoute requiredRole="patient"><CarePlan /></ProtectedRoute>} />
        <Route path="/knowledge-hub" element={<ProtectedRoute requiredRole="patient"><KnowledgeHub /></ProtectedRoute>} />
        <Route path="/emergency" element={<ProtectedRoute requiredRole="patient"><EmergencyHelp /></ProtectedRoute>} />
        <Route path="/feedback" element={<ProtectedRoute requiredRole="patient"><Feedback /></ProtectedRoute>} />
        <Route path="/health-journey" element={<ProtectedRoute requiredRole="patient"><HealthJourney /></ProtectedRoute>} />
        <Route path="/health-quiz" element={<ProtectedRoute requiredRole="patient"><HealthQuiz /></ProtectedRoute>} />
        <Route path="/reminders" element={<ProtectedRoute requiredRole="patient"><Reminders /></ProtectedRoute>} />

        {/* Doctor protected routes */}
        <Route path="/doctor-dashboard" element={<ProtectedRoute requiredRole="doctor"><DoctorDashboard /></ProtectedRoute>} />
        <Route path="/doctor-patients" element={<ProtectedRoute requiredRole="doctor"><DoctorPatients /></ProtectedRoute>} />
        <Route path="/doctor-review/:patientId" element={<ProtectedRoute requiredRole="doctor"><DoctorReview /></ProtectedRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
