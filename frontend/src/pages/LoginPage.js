import React from 'react';
import Login from '../components/Login'; // Assuming this component handles the login UI
import { useNavigate } from 'react-router-dom'; // Using react-router-dom for navigation

// Creating the LoginPage component
const LoginPage = () => {
  const navigate = useNavigate(); // Hook for navigation

  // Function to handle login success
  const onLoginSuccess = (token) => {
    // Storing the token in the local storage upon successful login
    localStorage.setItem('token', token);

    // Navigate to the home page upon successful login
    navigate('/home');

    // Reloading the window to apply changes (if necessary)
    window.location.reload(false);
  };

  // Rendering the Login component and passing the onLoginSuccess function as a prop
  return (
    <Login onLoginSuccess={onLoginSuccess} />
  );
};

export default LoginPage; // Exporting the LoginPage component
