import React from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Home from './Home'
import Chat from './Chat'
import Whiteboard from './Whiteboard'
import Pricing from './pages/Pricing'
import About from './pages/About'
import Features from './pages/Features'
import Contact from './pages/Contact'
import { Toaster } from 'react-hot-toast'

function App() {
  return (
    <div>
      <Router>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              borderRadius: '8px',
              background: '#333',
              color: '#fff',
            },
          }}
        />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/chat/:roomId" element={<Chat />} />
          <Route path="/whiteboard/:roomId?" element={<Whiteboard />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/about" element={<About />} />
          <Route path="/features" element={<Features />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </Router>
    </div>
  )
}

export default App
