import React from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Home from './Home'
import Chat from './Chat'
import Whiteboard from './Whiteboard'

function App() {
  return (
    <div>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/whiteboard/:roomId?" element={<Whiteboard />} />
        </Routes>
      </Router>
    </div>
  )
}

export default App
