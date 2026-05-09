import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import DayTracker from './pages/DayTracker';
import WeeklyStats from './pages/WeeklyStats';
import Goals from './pages/Goals';
import Navbar from './components/Navbar';
import { ThemeProvider } from './context/ThemeContext';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading">Loading…</div>;
  return user ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                  path="/*"
                  element={
                    <PrivateRoute>
                      <>
                        <Navbar />
                        <Routes>
                          <Route path="/" element={<Dashboard />} />
                          <Route path="/day/:date" element={<DayTracker />} />
                          <Route path="/weekly" element={<WeeklyStats />} />
                          <Route path="/goals" element={<Goals />} />
                        </Routes>
                      </>
                    </PrivateRoute>
                  }
                />
              </Routes>
            </BrowserRouter>
          </AuthProvider>
    </ThemeProvider>
  );
}
