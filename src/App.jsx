import React, { useRef } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Outlet,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import Home from "./Home";
import Chat from "./Chat";
import Whiteboard from "./components/Whiteboard";
import Pricing from "./pages/Pricing";
import About from "./pages/About";
import Features from "./pages/Features";
import Contact from "./pages/Contact";
import VideoCall from "./pages/VideoCall";
import { Toaster, toast } from "react-hot-toast";
import { SocketProvider } from "./context/SocketContext";
import Login from "./pages/Login";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./Navbar";
import Signup from "./pages/Signup";
import CodeShare from "./components/CodeShare";
import { browserSessionPersistence, setPersistence } from "firebase/auth";
import { auth } from "./firebase";

// Main layout with Navbar
const MainLayout = () => (
  <>
    <Navbar />
    <Outlet />
  </>
);

// PrivateRoute component to protect routes
const PrivateRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();
  const toastShown = useRef(false);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!currentUser && !toastShown.current) {
    toastShown.current = true;
    toast.error("Please login first", {
      id: 'auth-toast', // Unique ID prevents duplicate toasts
      position: 'top-center'
    });
    return <Navigate 
      to="/login" 
      replace 
      state={{ from: location }}
    />;
  }

  return children;
};

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
  setPersistence(auth, browserSessionPersistence).catch((error) => {
    console.error("Auth persistence error:", error);
  });

  return (
    <div>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: "8px",
            background: "#333",
            color: "#fff",
          },
        }}
      />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected Routes */}
        <Route path="/" element={<Home />} />
        <Route element={<MainLayout />}>
          <Route path="/features" element={<Features />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
        </Route>
        <Route
          path="/chat/:roomId?"
          element={
            <PrivateRoute>
              <Chat />
            </PrivateRoute>
          }
        />
        <Route
          path="/whiteboard/:roomId?"
          element={
            <PrivateRoute>
              <Whiteboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/code/:roomId?"
          element={
            <PrivateRoute>
              <CodeShare />
            </PrivateRoute>
          }
        />
        <Route
          path="/video-call/:roomId"
          element={
            <PrivateRoute>
              <VideoCall />
            </PrivateRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default AppWrapper;
