import React from 'react';
import { BadgeCheck, Zap, Globe } from 'lucide-react';
import Navbar from '../Navbar';

export default function Pricing() {
  const plans = [
    {
      name: "Starter",
      price: "Free",
      features: [
        "5 collaborators",
        "Basic whiteboard",
        "2GB storage",
        "Community support"
      ]
    },
    {
      name: "Pro",
      price: "$9",
      period: "/mo",
      popular: true,
      features: [
        "Unlimited collaborators",
        "Advanced whiteboard tools",
        "10GB storage",
        "Priority support",
        "AI Assistance"
      ]
    },
    {
      name: "Enterprise",
      price: "Custom",
      features: [
        "Unlimited everything",
        "Dedicated support",
        "SSO & SAML",
        "Custom SLAs",
        "24/7 support"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      <Navbar />
      <div className="container mx-auto px-4 py-20">
        <h1 className="text-4xl font-bold text-center mb-12">Pricing Plans</h1>
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div key={index} className={`bg-white p-8 rounded-2xl shadow-lg ${plan.popular ? 'ring-2 ring-indigo-600' : ''}`}>
              {plan.popular && (
                <div className="bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-medium mb-4 inline-flex items-center">
                  <Zap className="w-4 h-4 mr-2" /> Most Popular
                </div>
              )}
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <div className="text-4xl font-bold mb-6">
                {plan.price}<span className="text-lg text-gray-500">{plan.period}</span>
              </div>
              <ul className="space-y-3">
                {plan.features.map((feature, fIndex) => (
                  <li key={fIndex} className="flex items-center text-gray-600">
                    <BadgeCheck className="w-5 h-5 text-indigo-600 mr-2" /> {feature}
                  </li>
                ))}
              </ul>
              <button className={`w-full mt-6 py-2 rounded-lg font-medium ${
                plan.popular 
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}>
                Get Started
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 