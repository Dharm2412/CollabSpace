// src/Navbar.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

function Navbar() {
  const { currentUser, logout } = useAuth();

  return (
    <nav className="bg-white shadow-md fixed w-full z-10">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="text-2xl font-bold text-indigo-600">
              CollabSpace
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex space-x-8">
            <Link to="/features" className="text-gray-700 hover:text-indigo-600 transition-colors">
              Features
            </Link>
            <Link to="/pricing" className="text-gray-700 hover:text-indigo-600 transition-colors">
              Pricing
            </Link>
            <Link to="/about" className="text-gray-700 hover:text-indigo-600 transition-colors">
              About
            </Link>
            <Link to="/contact" className="text-gray-700 hover:text-indigo-600 transition-colors">
              Contact 
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-4">
            {currentUser ? (
              <div className="flex items-center space-x-4">
                {currentUser.photoURL && (
                  <img 
                    src={currentUser.photoURL} 
                    alt="Profile" 
                    className="w-8 h-8 rounded-full"
                  />
                )}
                <span className="text-gray-700">
                  {currentUser.displayName || currentUser.email}
                </span>
                <button
                  onClick={logout}
                  className="bg-red-100 text-red-600 px-4 py-2 rounded-full hover:bg-red-200 transition-colors flex items-center"
                >
                  <svg 
                    className="w-5 h-5 mr-2" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
                    />
                  </svg>
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-indigo-600 hover:bg-indigo-50 px-4 py-2 rounded-full transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="bg-indigo-600 text-white px-6 py-2 rounded-full hover:bg-indigo-700 transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;