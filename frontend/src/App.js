// frontend/src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './components/Auth';
import GraphBuilder from './components/GraphBuilder';
import './App.css';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={!token ? <Auth setToken={setToken} /> : <Navigate to="/dashboard" />} 
        />
        <Route 
          path="/dashboard" 
          element={token ? <GraphBuilder token={token} logout={logout} /> : <Navigate to="/" />} 
        />
      </Routes>
    </Router>
  );
}

export default App;