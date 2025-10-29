import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css'
import Dashboard from './dashboard.jsx';
import Auth from './auth.jsx'
import ChatBox from './chatbox.jsx'
import MyBooks from './mybooks.jsx'
import MyMessages from './mymessages.jsx';

function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Auth />} />
        <Route path="/dash" element={<Dashboard />} />
        <Route path="/chat" element={<ChatBox />} />
        <Route path="/mybooks" element={<MyBooks />} />
        <Route path="/mymessages" element={<MyMessages />} />
      </Routes>
    </Router>
  )
}

export default App
