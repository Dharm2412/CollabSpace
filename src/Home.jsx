// src/Home.jsx
import React from 'react';
import { MessageSquare, Code2, Pencil, Sparkles, Users, Lock, Zap, Share2 } from 'lucide-react';
import Navbar from './Navbar'; // Import the Navbar component
import { Link, useNavigate } from 'react-router-dom'; // Import Link and useNavigate from react-router-dom

function Home() {
  const navigate = useNavigate();

  const handleStartChat = () => {
    navigate('/chat');  // Navigate to chat component
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-40 pb-32">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Collaborate in
            <span className="text-indigo-600"> Real-Time</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Experience seamless communication with integrated whiteboard and code sharing capabilities.
            All in one powerful platform.
          </p>
          <button 
            onClick={handleStartChat}
            className="bg-indigo-600 text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-indigo-700 transition-colors mr-4"
          >
            Get Started Free
          </button>
          <button className="border-2 border-indigo-600 text-indigo-600 px-8 py-3 rounded-full text-lg font-semibold hover:bg-indigo-50 transition-colors">
            Live Demo
          </button>
        </div>

        {/* Features Preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Chat Preview */}
          <div 
            onClick={handleStartChat}
            className="bg-white p-6 rounded-2xl shadow-lg transform hover:-translate-y-1 transition-transform cursor-pointer"
          >
            <div className="bg-indigo-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <MessageSquare className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Real-Time Chat</h3>
            <p className="text-gray-600">Instant messaging with rich text formatting and file sharing capabilities.</p>
          </div>
          {/* Whiteboard Preview */}
          <div 
            onClick={() => navigate('/whiteboard')}
            className="bg-white p-6 rounded-2xl shadow-lg transform hover:-translate-y-1 transition-transform cursor-pointer"
          >
            <div className="bg-indigo-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <Pencil className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Interactive Whiteboard</h3>
            <p className="text-gray-600">Collaborative drawing with multiple colors and tools for visual communication.</p>
          </div>

          {/* Code Editor Preview */}
          <div className="bg-white p-6 rounded-2xl shadow-lg transform hover:-translate-y-1 transition-transform">
            <div className="bg-indigo-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <Code2 className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Code Sharing</h3>
            <p className="text-gray-600">Real-time code editor with syntax highlighting and collaborative editing.</p>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16">Why Choose Our Platform?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<Zap className="w-6 h-6 text-indigo-600" />}
              title="Lightning Fast"
              description="Real-time updates with zero latency"
            />
            <FeatureCard
              icon={<Lock className="w-6 h-6 text-indigo-600" />}
              title="Secure"
              description="End-to-end encryption for all communications"
            />
            <FeatureCard
              icon={<Users className="w-6 h-6 text-indigo-600" />}
              title="Team Friendly"
              description="Perfect for teams of any size"
            />
            <FeatureCard
              icon={<Share2 className="w-6 h-6 text-indigo-600" />}
              title="Easy Sharing"
              description="Share your work with a single click"
            />
          </div>
        </div>
      </div>

      {/* Preview Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-3xl p-8 md:p-12 text-white text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Transform Your Collaboration?</h2>
          <p className="text-xl mb-8 opacity-90">Join thousands of teams already using our platform</p>
          <button className="bg-white text-indigo-600 px-8 py-3 rounded-full text-lg font-semibold hover:bg-opacity-90 transition-colors">
            Start Free Trial
          </button>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="p-6 text-center">
      <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

export default Home;