import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css' 
import Dashboard from './dashboard'; // Removed .jsx extension
import Auth from './auth' // Removed .jsx extension
import ChatBox from './chatbox' // Removed .jsx extension
import MyBooks from './mybooks' // Removed .jsx extension
import MyMessages from './mymessages' // Removed .jsx extension
import Admin from './admin' // Removed .jsx extension
import AdminDash from './admindash' // Removed .jsx extension and ensured correct capitalization

function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Auth />} />
        <Route path="/dash" element={<Dashboard />} />
        <Route path="/chat" element={<ChatBox />} />
        <Route path="/mybooks" element={<MyBooks />} />
        <Route path="/mymessages" element={<MyMessages />} />
        <Route path="/admin" element={<Admin />}/>
        <Route path="/admindash" element={<AdminDash />}/> {/* New route for the Admin Dashboard */}
      </Routes>
    </Router>
  )
}

export default App