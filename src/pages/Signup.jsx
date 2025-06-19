import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, googleProvider } from '../firebase';
import { createUserWithEmailAndPassword, signInWithPopup, updateProfile } from 'firebase/auth';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

// Animation utility
const fadeIn = "animate-fade-in-up";

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const handleEmailSignup = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: username });
      toast.success('Account created successfully!');
      navigate('/');
    } catch (err) {
      setError(err.message.replace('Firebase: ', ''));
    }
  };

  const handleGoogleSignup = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result?.user) {
        toast.success('Account created successfully!');
        navigate('/');
      }
    } catch (err) {
      let errorMessage = 'Failed to sign up with Google. Please try again.';
      if (err.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Sign-up canceled by user.';
      }
      setError(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-blue-100 flex items-center justify-center py-8">
      <div className="w-full max-w-5xl mx-auto flex flex-col md:flex-row shadow-2xl rounded-3xl overflow-hidden bg-white/70 backdrop-blur-lg border border-indigo-100">
        {/* Illustration Section */}
        <div className="hidden md:flex flex-col justify-center items-center bg-gradient-to-br from-indigo-500 to-blue-400 w-1/2 p-12 relative">
          <svg width="320" height="220" viewBox="0 0 320 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-8 animate-fade-in-up">
            <ellipse cx="160" cy="110" rx="140" ry="90" fill="#6366f1" fillOpacity="0.12" />
            <ellipse cx="160" cy="110" rx="100" ry="60" fill="#6366f1" fillOpacity="0.18" />
            <ellipse cx="160" cy="110" rx="60" ry="36" fill="#6366f1" fillOpacity="0.25" />
          </svg>
          <h2 className="text-3xl font-bold text-white text-center drop-shadow-lg">Join CollabSpace</h2>
          <p className="text-lg text-indigo-100 mt-4 text-center max-w-xs">Create your account and start collaborating instantly.</p>
        </div>
        {/* Signup Form Section */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center animate-fade-in-up">
          <div className="flex flex-col items-center mb-8">
            <h1 className="text-3xl font-extrabold text-indigo-700 mb-2">Create Account</h1>
            <p className="text-gray-500 mb-4">Sign up to start collaborating with your team.</p>
            {error && (
              <div className="w-full max-w-xs mt-2 p-2 bg-red-100 text-red-700 rounded-lg text-sm text-center">
                {error}
              </div>
            )}
          </div>
          <button
            onClick={handleGoogleSignup}
            className="w-full max-w-xs mx-auto font-bold shadow-md rounded-lg py-3 bg-white text-gray-800 flex items-center justify-center transition-all duration-300 ease-in-out focus:outline-none hover:shadow-lg border border-gray-200 mb-6"
          >
            <div className="bg-indigo-100 p-2 rounded-full">
              <svg className="w-5" viewBox="0 0 533.5 544.3">
                <path d="M533.5 278.4c0-18.5-1.5-37.1-4.7-55.3H272.1v104.8h147c-6.1 33.8-25.7 63.7-54.4 82.7v68h87.7c51.5-47.4 81.1-117.4 81.1-200.2z" fill="#4285f4" />
                <path d="M272.1 544.3c73.4 0 135.3-24.1 180.4-65.7l-87.7-68c-24.4 16.6-55.9 26-92.6 26-71 0-131.2-47.9-152.8-112.3H28.9v70.1c46.2 91.9 140.3 149.9 243.2 149.9z" fill="#34a853" />
                <path d="M119.3 324.3c-11.4-33.8-11.4-70.4 0-104.2V150H28.9c-38.6 76.9-38.6 167.5 0 244.4l90.4-70.1z" fill="#fbbc04" />
                <path d="M272.1 107.7c38.8-.6 76.3 14 104.4 40.8l77.7-77.7C405 24.6 339.7-.8 272.1 0 169.2 0 75.1 58 28.9 150l90.4 70.1c21.5-64.5 81.8-112.4 152.8-112.4z" fill="#ea4335" />
              </svg>
            </div>
            <span className="ml-4">Sign up with Google</span>
          </button>
          <div className="my-8 border-b text-center w-full">
            <div className="leading-none px-2 inline-block text-sm text-gray-600 tracking-wide font-medium bg-white transform translate-y-1/2">
              Or sign up with email
            </div>
          </div>
          <form onSubmit={handleEmailSignup} className="mx-auto max-w-xs w-full">
            <input
              className="w-full px-6 py-3 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-base focus:outline-none focus:border-indigo-400 focus:bg-white mb-4 shadow-sm"
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <input
              className="w-full px-6 py-3 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-base focus:outline-none focus:border-indigo-400 focus:bg-white mb-4 shadow-sm"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              className="w-full px-6 py-3 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-base focus:outline-none focus:border-indigo-400 focus:bg-white mb-4 shadow-sm"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="submit"
              className="mt-2 tracking-wide font-semibold bg-indigo-600 text-white w-full py-3 rounded-lg hover:bg-indigo-700 transition-all duration-300 flex items-center justify-center shadow-md focus:shadow-outline focus:outline-none"
            >
              <span className="ml-3">Create Account</span>
            </button>
          </form>
          <div className="mt-8 text-center">
            <span className="text-gray-600">Already have an account?</span>
            <a href="/login" className="text-indigo-600 hover:underline font-bold ml-1">
              Login
            </a>
          </div>
        </div>
      </div>
      {/* Animation Keyframes (inline for demo) */}
      <style>{`
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(40px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 1s cubic-bezier(0.23, 1, 0.32, 1) both;
        }
      `}</style>
    </div>
  );
}