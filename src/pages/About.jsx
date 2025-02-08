import React from 'react';
import { Users, Clock, Trophy, HeartHandshake } from 'lucide-react';
import Navbar from '../Navbar';

export default function About() {
  const milestones = [
    {
      year: "2018",
      title: "Founded",
      description: "Started as a small team passionate about collaboration"
    },
    {
      year: "2020",
      title: "First Release",
      description: "Launched initial version of real-time chat"
    },
    {
      year: "2022",
      title: "1M Users",
      description: "Reached milestone of 1 million active users"
    },
    {
      year: "2023",
      title: "New Features",
      description: "Introduced whiteboard and code collaboration"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      <Navbar />
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h1 className="text-4xl font-bold mb-6">About CollabSpace</h1>
          <p className="text-xl text-gray-600">
            Revolutionizing the way teams collaborate remotely through innovative real-time tools
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
          <div className="space-y-8">
            <div className="flex items-start space-x-4">
              <div className="bg-indigo-100 p-3 rounded-full">
                <Users className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Our Team</h3>
                <p className="text-gray-600">
                  A diverse group of passionate developers, designers, and collaboration experts
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-indigo-100 p-3 rounded-full">
                <Trophy className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Our Mission</h3>
                <p className="text-gray-600">
                  Empower teams to collaborate seamlessly regardless of location
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <h3 className="text-xl font-semibold mb-6">Milestones</h3>
            <div className="space-y-6">
              {milestones.map((milestone, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="bg-indigo-100 px-3 py-1 rounded-full">
                    <span className="text-indigo-600 font-medium">{milestone.year}</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">{milestone.title}</h4>
                    <p className="text-gray-600 text-sm">{milestone.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 