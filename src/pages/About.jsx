import React from 'react';
import { Users, Clock, Trophy, HeartHandshake, Target, Award, Globe, ArrowRight } from 'lucide-react';
import Navbar from '../Navbar';

export default function About() {
  const milestones = [
    {
      year: "2018",
      title: "Founded",
      description: "Started as a small team passionate about revolutionizing remote collaboration",
      icon: <HeartHandshake className="w-6 h-6 text-indigo-600" />
    },
    {
      year: "2020",
      title: "First Release",
      description: "Launched initial version with real-time chat and basic collaboration tools",
      icon: <Trophy className="w-6 h-6 text-indigo-600" />
    },
    {
      year: "2022",
      title: "1M Users",
      description: "Reached milestone of 1 million active users across 150+ countries",
      icon: <Users className="w-6 h-6 text-indigo-600" />
    },
    {
      year: "2023",
      title: "Advanced Features",
      description: "Introduced AI-powered whiteboard, code collaboration, and enterprise features",
      icon: <Award className="w-6 h-6 text-indigo-600" />
    }
  ];

  const values = [
    {
      icon: <Users className="w-8 h-8 text-white" />,
      title: "Collaboration First",
      description: "We believe great things happen when people work together seamlessly",
      gradient: "from-blue-500 to-blue-600"
    },
    {
      icon: <Target className="w-8 h-8 text-white" />,
      title: "Innovation Driven",
      description: "Constantly pushing boundaries to create the best collaboration experience",
      gradient: "from-purple-500 to-purple-600"
    },
    {
      icon: <Globe className="w-8 h-8 text-white" />,
      title: "Global Impact",
      description: "Empowering teams worldwide to work better, regardless of location",
      gradient: "from-green-500 to-green-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Navbar />
      
      {/* Hero Section */}
      <div className="pt-24 pb-16 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            About
            <span className="block bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
              CollabSpace
            </span>
          </h1>
          <p className="text-xl text-indigo-100 max-w-3xl mx-auto leading-relaxed">
            Revolutionizing the way teams collaborate remotely through innovative real-time tools and cutting-edge technology
          </p>
        </div>
      </div>

      {/* Mission Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center mb-20">
          <h2 className="text-4xl font-bold mb-8 text-gray-800">Our Mission</h2>
          <p className="text-xl text-gray-600 leading-relaxed">
            To empower teams worldwide to collaborate seamlessly, regardless of their location. 
            We believe that great ideas can come from anywhere, and our platform makes it possible 
            for teams to work together as if they were in the same room.
          </p>
        </div>

        {/* Values Section */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-20">
          {values.map((value, index) => (
            <div 
              key={index} 
              className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
            >
              <div className={`bg-gradient-to-r ${value.gradient} w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg`}>
                {value.icon}
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-800 group-hover:text-indigo-600 transition-colors">
                {value.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {value.description}
              </p>
            </div>
          ))}
        </div>

        {/* Team & Mission Grid */}
        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto mb-20">
          <div className="space-y-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
              <div className="flex items-start space-x-4 mb-6">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-3 rounded-full">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2 text-gray-800">Our Team</h3>
                  <p className="text-gray-600 leading-relaxed">
                    A diverse group of passionate developers, designers, and collaboration experts 
                    from around the world, united by our shared vision of making remote work better.
                  </p>
                </div>
              </div>
              <div className="flex items-center text-indigo-600 font-semibold hover:text-indigo-700 transition-colors cursor-pointer">
                Meet our team
                <ArrowRight className="w-4 h-4 ml-2" />
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
              <div className="flex items-start space-x-4 mb-6">
                <div className="bg-gradient-to-r from-green-500 to-blue-600 p-3 rounded-full">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2 text-gray-800">Our Vision</h3>
                  <p className="text-gray-600 leading-relaxed">
                    To become the world's leading platform for remote collaboration, 
                    enabling teams to achieve their full potential regardless of physical boundaries.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Milestones */}
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
            <h3 className="text-2xl font-bold mb-8 text-gray-800">Our Journey</h3>
            <div className="space-y-8">
              {milestones.map((milestone, index) => (
                <div key={index} className="flex items-start space-x-4 group">
                  <div className="bg-gradient-to-r from-indigo-100 to-purple-100 px-4 py-2 rounded-full flex items-center space-x-2 group-hover:from-indigo-200 group-hover:to-purple-200 transition-colors">
                    {milestone.icon}
                    <span className="text-indigo-600 font-bold">{milestone.year}</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-lg text-gray-800 mb-1">{milestone.title}</h4>
                    <p className="text-gray-600 leading-relaxed">{milestone.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-12 rounded-3xl text-white text-center mb-20">
          <h2 className="text-3xl font-bold mb-12">Trusted by Teams Worldwide</h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="text-4xl font-bold mb-2">1M+</div>
              <div className="text-indigo-100">Active Users</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">150+</div>
              <div className="text-indigo-100">Countries</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">10K+</div>
              <div className="text-indigo-100">Organizations</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">99.9%</div>
              <div className="text-indigo-100">Uptime</div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="bg-white p-12 rounded-3xl shadow-xl border border-gray-100 max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-4 text-gray-800">
              Join the Future of Collaboration
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Be part of the movement that's transforming how teams work together remotely
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg">
                Start Free Trial
              </button>
              <button className="border-2 border-indigo-600 text-indigo-600 px-8 py-4 rounded-xl font-semibold hover:bg-indigo-600 hover:text-white transition-all duration-300">
                Contact Us
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 