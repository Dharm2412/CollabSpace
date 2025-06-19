import React from "react";
import {
  MessageSquare,
  Code2,
  Pencil,
  Zap,
  Users,
  Lock,
  Share2,
  Star,
  ArrowRight,
} from "lucide-react";
import Navbar from "./Navbar";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import collabIllustration from './assets/58c2439f-4ac6-4ae5-9a40-7ccdde10742c.png';

// Animation utility (TailwindCSS + animate.css or custom)
const fadeIn = "animate-fade-in-up";

function Home() {
  const navigate = useNavigate();
  const { loading } = useAuth();

  const handleStartChat = () => {
    navigate("/chat");
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white relative overflow-x-hidden">
      <Navbar />
      {/* Animated SVG Wave Background */}
      <div className="absolute top-0 left-0 w-full z-0 pointer-events-none" style={{height:'420px'}}>
        <svg viewBox="0 0 1440 320" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <path fill="#6366f1" fillOpacity="0.15" d="M0,160L60,170.7C120,181,240,203,360,197.3C480,192,600,160,720,133.3C840,107,960,85,1080,101.3C1200,117,1320,171,1380,197.3L1440,224L1440,0L1380,0C1320,0,1200,0,1080,0C960,0,840,0,720,0C600,0,480,0,360,0C240,0,120,0,60,0L0,0Z"></path>
        </svg>
      </div>
      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-44 pb-32 relative z-10">
        <div className={`text-center mb-20 ${fadeIn}`} style={{animationDelay:'0.1s'}}>
          <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-6 leading-tight drop-shadow-lg">
            Collaborate in <span className="text-indigo-600">Real-Time</span>
          </h1>
          <p className="text-2xl text-gray-700 mb-10 max-w-2xl mx-auto font-medium">
            Experience seamless communication with integrated whiteboard and code sharing. All in one powerful platform.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
            <button
              onClick={handleStartChat}
              className="bg-indigo-600 shadow-lg text-white px-8 py-3 rounded-full text-lg font-semibold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all focus:ring-4 focus:ring-indigo-300"
            >
              <ArrowRight className="w-5 h-5" /> Get Started Free
            </button>
            <button className="border-2 border-indigo-600 text-indigo-600 px-8 py-3 rounded-full text-lg font-semibold flex items-center justify-center gap-2 hover:bg-indigo-50 shadow-md transition-all">
              <Star className="w-5 h-5 text-yellow-400" /> Live Demo
            </button>
          </div>
          {/* Hero Illustration/Mockup Placeholder */}
          <div className="flex justify-center mt-8">
            <img
              src={collabIllustration}
              alt="Collaboration app illustration"
              className="w-full max-w-2xl rounded-3xl shadow-2xl border-4 border-indigo-50 object-cover animate-fade-in-up"
              style={{animationDelay:'0.2s'}}
            />
          </div>
        </div>
        {/* Feature Cards */}
        <div className={`grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto ${fadeIn}`} style={{animationDelay:'0.3s'}}>
          <FeatureCard
            icon={<MessageSquare className="w-7 h-7 text-indigo-600" />}
            title="Real-Time Chat"
            description="Instant messaging with rich text formatting and file sharing capabilities."
            onClick={handleStartChat}
          />
          <FeatureCard
            icon={<Pencil className="w-7 h-7 text-indigo-600" />}
            title="Interactive Whiteboard"
            description="Collaborative drawing with multiple colors and tools for visual communication."
            onClick={() => navigate("/whiteboard")}
          />
          <FeatureCard
            icon={<Code2 className="w-7 h-7 text-indigo-600" />}
            title="Code Sharing"
            description="Real-time code editor with syntax highlighting and collaborative editing."
            onClick={() => navigate("/code")}
          />
        </div>
      </div>
      {/* Why Choose Section */}
      <div className="bg-white py-20">
        <div className="container mx-auto px-4">
          <h2 className={`text-3xl md:text-4xl font-bold text-center mb-16 ${fadeIn}`}>Why Choose Our Platform?</h2>
          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 ${fadeIn}`} style={{animationDelay:'0.5s'}}>
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
      {/* Call to Action Section */}
      <div className="container mx-auto px-4 py-20">
        <div className={`bg-gradient-to-r from-indigo-600 to-blue-600 rounded-3xl p-8 md:p-12 text-white text-center shadow-2xl ${fadeIn}`} style={{animationDelay:'0.6s'}}>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Transform Your Collaboration?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of teams already using our platform
          </p>
          <button className="bg-white text-indigo-600 px-8 py-3 rounded-full text-lg font-semibold hover:bg-opacity-90 shadow-lg transition-colors flex items-center gap-2 mx-auto">
            <ArrowRight className="w-5 h-5" /> Start Free Trial
          </button>
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

function FeatureCard({ icon, title, description, onClick }) {
  return (
    <div
      className={`p-7 text-center bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer group ${fadeIn}`}
      style={{animationDelay:'0.2s'}}
      onClick={onClick}
    >
      <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-4 group-hover:bg-indigo-200 transition-all">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2 text-gray-900">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

export default Home;
