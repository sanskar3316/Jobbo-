import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from 'react-hot-toast';
import Navigation from './components/Navigation';
import Login from './components/Login';
import Register from './components/Register';
import ForgotPassword from './components/ForgotPassword';
import ProfilePage from './pages/ProfilePage';
import SavedJobsPage from './pages/SavedJobsPage';
import JobSearchPage from './pages/JobSearchPage';
import PrivateRoute from './components/PrivateRoute';

function AppContent() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Router>
        <Navigation />
        <main className="page-container">
          <div className="content-container">
            <Routes>
              <Route path="/" element={<JobSearchPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route
                path="/profile"
                element={
                  <PrivateRoute>
                    <ProfilePage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/saved-jobs"
                element={
                  <PrivateRoute>
                    <SavedJobsPage />
                  </PrivateRoute>
                }
              />
            </Routes>
          </div>
        </main>
        <Toaster position="top-right" />
      </Router>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
