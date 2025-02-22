import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Outlet,
  Navigate,
  useNavigate,
} from "react-router-dom";
import Home from "./Home";
import Chat from "./Chat";
import Whiteboard from "./components/Whiteboard";
import Pricing from "./pages/Pricing";
import About from "./pages/About";
import Features from "./pages/Features";
import Contact from "./pages/Contact";
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
  const navigate = useNavigate();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!currentUser) {
    toast.error("Please login first", {
      duration: 3000,
      position: "top-right",
    });
    return <Navigate to="/login" replace />;
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
        position="top-right"
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
      </Routes>
    </div>
  );
}

export default AppWrapper;
