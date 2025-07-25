import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import Appointments from './pages/Appointments';
import Calendar from './pages/Calendar';
import Inventory from './pages/Inventory';
import Billing from './pages/Billing';
import Settings from './pages/Settings';
import Login from './pages/Login';
import { useAuth } from './hooks/useAuth';
import { useEffect } from 'react';

function AuthHandler() {
  const navigate = useNavigate();
  const { session, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!session) {
        navigate('/login');
      }
    }
  }, [session, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }
}

function App() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={session ? <Navigate to="/" replace /> : <Login />}
        />
        <Route
          path="/"
          element={session ? <Layout /> : <Navigate to="/login" replace />}
        >
          <Route index element={<Dashboard />} />
          <Route path="patients" element={<Patients />} />
          <Route path="appointments" element={<Appointments />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="billing" element={<Billing />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;