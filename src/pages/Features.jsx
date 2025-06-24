import React from 'react';
import { Zap, Lock, Users, Share2, Code2, MessageSquare, ArrowRight } from 'lucide-react';
import Navbar from '../Navbar';

export default function Features() {
  const features = [
    {
      icon: <MessageSquare className="w-8 h-8 text-white" />,
      title: "Real-Time Chat",
      description: "Instant messaging with markdown support and file sharing capabilities for seamless team communication.",
      gradient: "from-blue-500 to-blue-600"
    },
    {
      icon: <Code2 className="w-8 h-8 text-white" />,
      title: "Collaborative Coding", 
      description: "Multiplayer code editor with syntax highlighting and real-time collaboration features.",
      gradient: "from-purple-500 to-purple-600"
    },
    {
      icon: <Share2 className="w-8 h-8 text-white" />,
      title: "Interactive Whiteboard",
      description: "Draw and brainstorm together in real-time with advanced drawing tools and templates.",
      gradient: "from-green-500 to-green-600"
    },
    {
      icon: <Lock className="w-8 h-8 text-white" />,
      title: "Secure & Private",
      description: "End-to-end encryption for all collaborations ensuring your data remains confidential.",
      gradient: "from-red-500 to-red-600"
    },
    {
      icon: <Users className="w-8 h-8 text-white" />,
      title: "Team Management",
      description: "Invite members, manage permissions, and organize teams with advanced admin controls.",
      gradient: "from-orange-500 to-orange-600"
    },
    {
      icon: <Zap className="w-8 h-8 text-white" />,
      title: "AI Assistance",
      description: "Smart suggestions, code completion, and intelligent automation to boost productivity.",
      gradient: "from-indigo-500 to-indigo-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Navbar />
      
      {/* Hero Section */}
      <div className="pt-24 pb-16 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Powerful Features for
            <span className="block bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
              Modern Teams
            </span>
          </h1>
          <p className="text-xl text-indigo-100 max-w-3xl mx-auto leading-relaxed">
            Everything you need to collaborate effectively, from real-time messaging to advanced coding tools
          </p>
        </div>
      </div>

      {/* Features Grid */}
      <div className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
            >
              <div className={`bg-gradient-to-r ${feature.gradient} w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg`}>
                {feature.icon}
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-800 group-hover:text-indigo-600 transition-colors">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                {feature.description}
              </p>
              <div className="flex items-center text-indigo-600 font-semibold group-hover:text-indigo-700 transition-colors">
                Learn more
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center">
          <div className="bg-white p-12 rounded-3xl shadow-xl border border-gray-100 max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-4 text-gray-800">
              Ready to Transform Your Collaboration?
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Join thousands of teams already using CollabSpace to work smarter and faster
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg">
                Start Free Trial
              </button>
              <button className="border-2 border-indigo-600 text-indigo-600 px-8 py-4 rounded-xl font-semibold hover:bg-indigo-600 hover:text-white transition-all duration-300">
                Schedule Demo
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}