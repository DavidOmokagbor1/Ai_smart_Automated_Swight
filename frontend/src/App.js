import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import './App.css';

function App() {
  return (
    <Router>
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 p-8">
          <Routes>
            <Route path="/" element={<div>Welcome to Smart Lighting System</div>} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App; 