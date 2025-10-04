import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import ProfessionalDashboard from './components/ProfessionalDashboard';
import LevelSelection from './pages/LevelSelection';
import ExperiencePage from './pages/ExperiencePage';
import NotesPage from './pages/NotesPage';
import { initBarbaTransitions } from './utils/barbaTransitions';
import './App.css';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/auth" replace />;
};

function App() {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '786319065229-v6p89f13lacfgb1a6q0bk6rmcvdq1lc7.apps.googleusercontent.com';

  useEffect(() => {
    // Initialize Barba.js transitions
    // Note: Barba.js works best with server-side routing, 
    // so we're using it selectively for enhanced transitions
    // initBarbaTransitions();
  }, []);

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/login" element={<AuthPage />} />
            <Route path="/register" element={<AuthPage />} />
            
            {/* Protected Routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <ProfessionalDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/landing" 
              element={
                <ProtectedRoute>
                  <LevelSelection />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/experience" 
              element={
                <ProtectedRoute>
                  <ExperiencePage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/notes" 
              element={
                <ProtectedRoute>
                  <NotesPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          
          {/* Global Toast Notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: 'rgba(20, 20, 30, 0.95)',
                color: '#fff',
                border: '1px solid rgba(102, 126, 234, 0.3)',
                borderRadius: '12px',
                backdropFilter: 'blur(10px)',
              },
              success: {
                iconTheme: {
                  primary: '#4ade80',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </div>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;
