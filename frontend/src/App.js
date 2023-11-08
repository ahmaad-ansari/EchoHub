// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; // Import `Switch` instead of `Routes`
import Login from './components/Login'; // Import your Login component
import Registration from './components/Registration'; // Import your Registration component
import NavBar from './components/NavBar'; // Import your Chakra UI NavBar

function App() {
  return (
    <Router>
      <NavBar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Registration />} />
      </Routes>
    </Router>
  );
}

export default App;
