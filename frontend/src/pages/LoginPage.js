// src/pages/LoginPage.js
import React from 'react';
import Login from '../components/Login';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const navigate = useNavigate();

  const onLoginSuccess = (token) => {
    // Assuming you are storing the token in local storage
    localStorage.setItem('token', token);
    navigate('/home'); // Navigate to the home page upon successful login
    window.location.reload(false);
  };

  return (
    <Login onLoginSuccess={onLoginSuccess} />
  );
};

export default LoginPage;
