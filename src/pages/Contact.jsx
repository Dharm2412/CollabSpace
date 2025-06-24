import React from 'react';
import { Mail, MapPin, Phone, Send, Clock, MessageSquare, ArrowRight } from 'lucide-react';
import Navbar from '../Navbar';

export default function Contact() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Navbar />
      
      {/* Hero Section */}
      <div className="pt-24 pb-16 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Get in
            <span className="block bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
              Touch
            </span>
          </h1>
          <p className="text-xl text-indigo-100 max-w-3xl mx-auto leading-relaxed">
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-20">
        <div className="max-w-7xl mx-auto">
          
          {/* Contact Form & Info Grid */}
          <div className="grid lg:grid-cols-2 gap-16 mb-20">
            {/* Contact Form */}
            <div className="bg-white p-10 rounded-3xl shadow-xl border border-gray-100">
              <div className="flex items-center mb-10">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-3 rounded-full mr-4">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-800">Send us a Message</h2>
              </div>
              
              <form method="POST" action="https://formspree.io/f/xvgppaow" className="space-y-8">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 bg-gray-50 focus:bg-white"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 bg-gray-50 focus:bg-white"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Subject</label>
                  <input
                    type="text"
                    name="subject"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 bg-gray-50 focus:bg-white"
                    placeholder="What's this about?"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Message</label>
                  <textarea
                    name="message"
                    rows="6"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 bg-gray-50 focus:bg-white resize-none"
                    placeholder="Tell us more about your inquiry..."
                    required
                  ></textarea>
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center"
                >
                  Send Message
                  <Send className="w-4 h-4 ml-2" />
                </button>
              </form>
            </div>

            {/* Additional Info */}
            <div className="flex flex-col justify-center">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-10 rounded-3xl text-white">
                <h3 className="text-2xl font-bold mb-8">Why Choose CollabSpace?</h3>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-white bg-opacity-20 p-3 rounded-full flex-shrink-0">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg mb-2">24/7 Support</h4>
                      <p className="text-indigo-100 leading-relaxed">Round-the-clock assistance for enterprise customers with dedicated support teams.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="bg-white bg-opacity-20 p-3 rounded-full flex-shrink-0">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg mb-2">Live Chat</h4>
                      <p className="text-indigo-100 leading-relaxed">Instant support through our live chat system with real-time responses.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="bg-white bg-opacity-20 p-3 rounded-full flex-shrink-0">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg mb-2">Email Support</h4>
                      <p className="text-indigo-100 leading-relaxed">Detailed responses within 2-4 hours with comprehensive solutions.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Google Maps Section */}
          <div className="mb-20">
            <div className="bg-white p-10 rounded-3xl shadow-xl border border-gray-100">
              <div className="flex items-center mb-8">
                <div className="bg-gradient-to-r from-green-500 to-blue-600 p-3 rounded-full mr-4">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-800">Find Us</h2>
              </div>
              <p className="text-gray-600 mb-8 leading-relaxed text-lg">
                Visit our office at SAL College of Engineering. We're located in a prime area with easy access and modern facilities.
              </p>
              <div className="relative">
                <div className="w-full h-96 rounded-2xl overflow-hidden shadow-lg">
                  <iframe 
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3670.3912914805946!2d72.49375717537542!3d23.082767714079043!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395e9defab5465ef%3A0x78f0603f56bfb453!2sSAL%20College%20Of%20Engineering!5e0!3m2!1sen!2sin!4v1750611951004!5m2!1sen!2sin" 
                    width="100%" 
                    height="100%" 
                    style={{border:0}} 
                    allowFullScreen="" 
                    loading="lazy" 
                    referrerPolicy="no-referrer-when-downgrade"
                    className="rounded-2xl"
                  ></iframe>
                </div>
                <div className="absolute bottom-4 left-4 bg-white px-4 py-2 rounded-lg shadow-lg border border-gray-200">
                  <p className="text-sm font-semibold text-gray-800">SAL College of Engineering</p>
                  <p className="text-xs text-gray-600">Ahmedabad, Gujarat, India</p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <div className="bg-white p-12 rounded-3xl shadow-xl border border-gray-100 max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-4 text-gray-800">
                Ready to Get Started?
              </h2>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Join thousands of teams already using CollabSpace to work smarter and faster
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center">
                  Start Free Trial
                  <ArrowRight className="w-4 h-4 ml-2" />
                </button>
                <button className="border-2 border-indigo-600 text-indigo-600 px-8 py-4 rounded-xl font-semibold hover:bg-indigo-600 hover:text-white transition-all duration-300">
                  Schedule Demo
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 