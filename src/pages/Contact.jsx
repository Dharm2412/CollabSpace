import React, { useState } from 'react';
import { Mail, MapPin, Phone } from 'lucide-react';
import Navbar from '../Navbar';
import toast from 'react-hot-toast';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          to: 'dharmpatel24123@gmail.com'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }
      
      toast.success('Message sent successfully!');
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      console.error('Email send error:', error);
      toast.error('Failed to send message. Please try again.');
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      <Navbar />
      
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8">Contact Us</h1>
          
          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                  <textarea
                    rows="4"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  ></textarea>
                </div>
                
                {submitStatus === 'success' && (
                  <div className="bg-green-100 text-green-800 p-4 rounded-lg">
                    Message sent successfully!
                  </div>
                )}
                {submitStatus === 'error' && (
                  <div className="bg-red-100 text-red-800 p-4 rounded-lg">
                    Failed to send message. Please try again.
                  </div>
                )}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-indigo-400"
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>

            {/* Contact Info */}
            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="bg-indigo-100 p-3 rounded-full">
                  <MapPin className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">Office Address</h3>
                  <p className="text-gray-600">123 Collaboration Street<br/>Digital City, DC 45678</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="bg-indigo-100 p-3 rounded-full">
                  <Phone className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">Phone</h3>
                  <p className="text-gray-600">+1 (555) 123-4567<br/>Mon-Fri, 9am-5pm EST</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="bg-indigo-100 p-3 rounded-full">
                  <Mail className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">Email</h3>
                  <p className="text-gray-600">support@collabspace.com<br/>help@collabspace.com</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 