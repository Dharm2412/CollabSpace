import React from 'react';
import { Zap, Lock, Users, Share2, Code2, MessageSquare } from 'lucide-react';
import Navbar from '../Navbar';

export default function Features() {
  const features = [
    {
      icon: <MessageSquare className="w-6 h-6 text-indigo-600" />,
      title: "Real-Time Chat",
      description: "Instant messaging with markdown support and file sharing"
    },
    {
      icon: <Code2 className="w-6 h-6 text-indigo-600" />,
      title: "Collaborative Coding", 
      description: "Multiplayer code editor with syntax highlighting"
    },
    {
      icon: <Share2 className="w-6 h-6 text-indigo-600" />,
      title: "Interactive Whiteboard",
      description: "Draw and brainstorm together in real-time"
    },
    {
      icon: <Lock className="w-6 h-6 text-indigo-600" />,
      title: "Secure & Private",
      description: "End-to-end encryption for all collaborations"
    },
    {
      icon: <Users className="w-6 h-6 text-indigo-600" />,
      title: "Team Management",
      description: "Invite members and manage permissions"
    },
    {
      icon: <Zap className="w-6 h-6 text-indigo-600" />,
      title: "AI Assistance",
      description: "Smart suggestions and code completion"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      <Navbar />
      <div className="container mx-auto px-4 py-20">
        <h1 className="text-4xl font-bold text-center mb-12">Features</h1>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="bg-indigo-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}