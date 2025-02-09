import React from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Home from './Home'
import Chat from './Chat'
import Whiteboard from './components/Whiteboard'
import Pricing from './pages/Pricing'
import About from './pages/About'
import Features from './pages/Features'
import Contact from './pages/Contact'
import { Toaster } from 'react-hot-toast'
import { SocketProvider } from './context/SocketContext'

function App() {
  return (
    <SocketProvider>
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
            <Route path="/chat/:roomId?" element={<Chat />} />
            <Route path="/whiteboard/:roomId?" element={<Whiteboard />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/about" element={<About />} />
            <Route path="/features" element={<Features />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </Router>
      </div>
    </SocketProvider>
  )
}

export default App
