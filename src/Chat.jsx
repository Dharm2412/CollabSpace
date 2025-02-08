import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getAIResponse } from './utils/gemini';
import RoomSidebar from './components/RoomSidebar';
import { toast } from 'react-hot-toast';

function Chat() {
  const { roomId: urlRoomId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [step, setStep] = useState('join');
  const [username, setUsername] = useState('');
  const [roomId, setRoomId] = useState(urlRoomId || '');
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [users, setUsers] = useState([]);
  const [isAILoading, setIsAILoading] = useState(false);

  const messagesEndRef = useRef(null);
  const roomIdRef = useRef(roomId);
  const usernameRef = useRef(username);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    roomIdRef.current = roomId;
    usernameRef.current = username;
  }, [roomId, username]);

  const handleJoinRoom = (e) => {
    e.preventDefault();
    if (!username.trim()) return;

    const newRoomId = roomId.trim() || Math.random().toString(36).substr(2, 6).toUpperCase();
    const welcomeMessage = {
      id: Date.now(),
      text: `Welcome to room ${newRoomId}! This is a local chat session.`,
      sender: "system",
      timestamp: new Date().toISOString(),
    };

    setRoomId(newRoomId);
    setMessages([welcomeMessage]);
    setUsers([username]);
    setStep('chat');
    navigate(`/chat/${newRoomId}`);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim()) {
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: message,
        sender: username,
        timestamp: new Date().toISOString(),
      }]);
      setMessage('');
      scrollToBottom();
    }
  };

  const handleAIChat = async (e) => {
    e.preventDefault();
    if (!message.trim() || isAILoading) return;

    if (/(who('s|s)\s+(your\s+)?(boss|creator|sir)|(boss|sir|creator)\s+name|who\s+(made|created|built|is))/i.test(message)) {
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: "Dharm Sir (Dharm Patel)",
        sender: 'ai',
        timestamp: new Date().toISOString(),
      }]);
      setMessage('');
      return scrollToBottom();
    }

    setIsAILoading(true);
    try {
      const aiResponse = await getAIResponse(message);
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: aiResponse,
        sender: 'ai',
        timestamp: new Date().toISOString(),
      }]);
      setMessage('');
      scrollToBottom();
    } catch (error) {
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
    const container = messagesEndRef.current?.parentElement;
    if (container && container.scrollHeight - container.scrollTop - container.clientHeight < 100) {
      scrollToBottom();
    }
  }, [messages, scrollToBottom]);

  const handleLeaveRoom = () => {
    setStep('join');
    setRoomId('');
    setUsers([]);
    setMessages([]);
    navigate('/chat');
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
      <RoomSidebar 
        roomId={roomId} 
        users={users}
        onLeave={handleLeaveRoom}
      />
      
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`max-w-lg ${
                msg.sender === username ? 'ml-auto bg-indigo-600 text-white' :
                msg.sender === 'system' ? 'mx-auto bg-gray-200 text-gray-600' :
                msg.sender === 'ai' ? 'bg-green-50 text-black border-l-4 border-green-600' :
                'bg-white'
              } rounded-lg p-3 shadow`}
            >
              {msg.sender !== 'system' && <p className="text-xs opacity-75 mb-1">{msg.sender}</p>}
              {msg.sender === 'ai' ? (
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-green-800">🤖 AI Response</h3>
                  <div className="space-y-3">
                    {msg.text.split(/(```[\s\S]*?```)/g).map((part, index) => part.startsWith('```') ? (
                      <div key={index} className="relative">
                        <div className="absolute top-0 right-0 bg-gray-700 text-white text-xs px-2 py-1 rounded-bl-lg">
                          Code
                        </div>
                        <pre className="bg-gray-800 text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-sm">
                          {part.replace(/```(\w+)?/g, '').trim()}
                        </pre>
                      </div>
                    ) : (
                      <p key={index} className="text-base leading-relaxed whitespace-pre-wrap text-gray-800">
                        {part}
                      </p>
                    ))}
                  </div>
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