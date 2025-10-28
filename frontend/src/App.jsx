import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css'
import Dashboard from './dashboard.jsx';
import Auth from './auth.jsx'

function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Auth />} />
        <Route path="/dash" element={<Dashboard />} />
      </Routes>
    </Router>
  )
}

export default App
