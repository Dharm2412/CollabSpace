import React, { useEffect } from 'react'
import { BrowserRouter as Router, Route, Routes, useNavigate, Outlet, Navigate } from 'react-router-dom'
import Home from './Home'
import Chat from './Chat'
import Whiteboard from './components/Whiteboard'
import Pricing from './pages/Pricing'
import About from './pages/About'
import Features from './pages/Features'
import Contact from './pages/Contact'
import { Toaster } from 'react-hot-toast'
import { SocketProvider } from './context/SocketContext'
import { createBrowserRouter } from 'react-router-dom'
import Login from './pages/Login'
import { AuthProvider } from './context/AuthContext'
import Navbar from './Navbar'
import Signup from './pages/Signup'
import { auth } from './firebase'
import CodeShare from './components/CodeShare'
import { browserSessionPersistence, setPersistence, inMemoryPersistence } from 'firebase/auth'


const MainLayout = () => (
  <>
    <Navbar />
    <Outlet />
  </>
);

function AppWrapper() {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <App />
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
}

function App() {
  const navigate = useNavigate();

  useEffect(() => {
    // Set persistence once when app initializes
    setPersistence(auth, inMemoryPersistence)
      .catch((error) => {
        console.error("Auth persistence error:", error);
      });

    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        // Handle any post-login logic here if needed
      }
    });
    return unsubscribe;
  }, [navigate]);

  return (
    <div>
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
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route element={<MainLayout />}>
          <Route path="/features" element={<Features />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
        </Route>
        <Route path="/chat/:roomId?" element={<Chat />} />
        <Route path="/whiteboard/:roomId?" element={<Whiteboard />} />
        <Route path="/code/:roomId?" element={<CodeShare />} />
      </Routes>
    </div>
  );
}

export default AppWrapper;
