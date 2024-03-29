import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SettingsPage from './pages/SettingsPage';
import HomePage from './pages/HomePage';
// ... other imports

function App() {
  const isAuthenticated = () => {
    const token = localStorage.getItem('token');
    return token != null;
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={isAuthenticated() ? <HomePage /> : <Navigate to="/login" />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/settings" element={isAuthenticated() ? <SettingsPage /> : <Navigate to="/login" />} />
        <Route path="/home" element={isAuthenticated() ? <HomePage /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;


