"use client"

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import { motion } from 'framer-motion';
import { getAIResponse } from './utils/gemini';

const SOCKET_URL = 'http://localhost:5000';

function Chat() {
  const navigate = useNavigate();
  const [step, setStep] = useState('join'); // 'join' or 'chat'
  const [username, setUsername] = useState('');
  const [roomId, setRoomId] = useState('');
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [users, setUsers] = useState([]);
  const [isAILoading, setIsAILoading] = useState(false);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);
    return () => newSocket.close();
  }, []);

  const handleJoinRoom = (e) => {
    e.preventDefault();
    if (!username.trim()) return;

    if (roomId.trim()) {
      // Join existing room
      socket.emit('join_room', { roomId, username }, (response) => {
        if (response.success) {
          setMessages(response.messages);
          setUsers(response.users);
          setStep('chat');
        } else {
          alert(response.error);
        }
      });
    } else {
      // Create new room
      socket.emit('create_room', username, (response) => {
        if (response.success) {
          setRoomId(response.roomId);
          setMessages(response.messages);
          setUsers(response.users);
          setStep('chat');
        } else {
          alert(response.error);
        }
      });
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim() && socket) {
      socket.emit('send_message', message);
      setMessage('');
    }
  };

  const handleAIChat = async (e) => {
    e.preventDefault();
    if (!message.trim() || isAILoading) return;

    setIsAILoading(true);
    try {
      const aiResponse = await getAIResponse(message);
      const aiMessage = {
        id: Date.now(),
        text: aiResponse,
        sender: 'ai',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, aiMessage]);
      setMessage('');
    } catch (error) {
      console.error('AI Error:', error);
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: "Sorry, I'm having trouble connecting to AI",
        sender: 'system',
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsAILoading(false);
    }
  };

  useEffect(() => {
    if (!socket) return;

    socket.on('receive_message', (newMessage) => {
      setMessages(prev => [...prev, newMessage]);
    });

    socket.on('user_joined', ({ message, users }) => {
      setMessages(prev => [...prev, { id: Date.now(), text: message, sender: 'system' }]);
      setUsers(users);
    });

    socket.on('user_left', ({ message, users }) => {
      setMessages(prev => [...prev, { id: Date.now(), text: message, sender: 'system' }]);
      setUsers(users);
    });

    return () => {
      socket.off('receive_message');
      socket.off('user_joined');
      socket.off('user_left');
    };
  }, [socket]);

  // Add this helper function for timestamp formatting
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Add this helper function for message length
  const getMessageLengthIndicator = (text) => {
    if (text.length < 50) return 'Short';
    if (text.length < 200) return 'Medium';
    return 'Long';
  };

  if (step === 'join') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
          <h2 className="text-2xl font-bold mb-6 text-center">Join a Chat Room</h2>
          <form onSubmit={handleJoinRoom} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter your username"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Room ID (optional)</label>
              <input
                type="text"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="Leave empty to create new room"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              {roomId ? 'Join Room' : 'Create Room'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-64 bg-white border-r p-4">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Room: {roomId}</h2>
          <p className="text-sm text-gray-500">Share this ID to invite others</p>
        </div>
        <div>
          <h3 className="font-medium mb-2">Online Users</h3>
          <ul className="space-y-1">
            {users.map((user, index) => (
              <li key={index} className="text-gray-600">{user}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`max-w-lg ${
                msg.sender === username 
                  ? 'ml-auto bg-indigo-600 text-white' 
                  : msg.sender === 'system'
                  ? 'mx-auto bg-gray-200 text-gray-600'
                  : msg.sender === 'ai'
                  ? 'bg-green-100 text-black border-l-4 border-green-500'
                  : 'bg-white'
              } rounded-lg p-3 shadow`}
            >
              {msg.sender !== 'system' && (
                <p className="text-xs opacity-75 mb-1">{msg.sender}</p>
              )}
              {msg.sender === 'ai' ? (
                <div>
                  <h3 className="text-base font-bold mb-1">AI Response:</h3>
                  <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                </div>
              ) : (
                <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
              )}
            </motion.div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="p-4 bg-white border-t">
          <div className="flex space-x-4">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="Type your message..."
            />
            <button
              type="button"
              onClick={handleAIChat}
              disabled={isAILoading}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400"
            >
              {isAILoading ? '🤖 Thinking...' : '🤖 Ask AI'}
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Chat;