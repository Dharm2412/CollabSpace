import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getAIResponse } from './utils/gemini';
import RoomSidebar from './components/RoomSidebar';
import { toast } from 'react-hot-toast';
import { useSocket } from './context/SocketContext';
import { ref, onValue, onDisconnect, set, remove } from 'firebase/database';
import { rtdb } from './firebase';

// Add localStorage persistence for user session
const SESSION_KEY = 'chat_session';

function Chat() {
  const { roomId: urlRoomId } = useParams();
  const navigate = useNavigate();
  const socket = useSocket();
  const [step, setStep] = useState('join');
  const [username, setUsername] = useState(localStorage.getItem(SESSION_KEY)?.username || '');
  const [roomId, setRoomId] = useState(localStorage.getItem(SESSION_KEY)?.roomId || '');
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [users, setUsers] = useState([]);
  const [isAILoading, setIsAILoading] = useState(false);
  const [userId] = useState(localStorage.getItem(SESSION_KEY)?.userId || crypto.randomUUID());

  const messagesEndRef = useRef(null);
  const usernameRef = useRef(username);
  const roomIdRef = useRef(roomId);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    usernameRef.current = username;
    roomIdRef.current = roomId;
  }, [username, roomId]);

  useEffect(() => {
    if (!socket || !roomId) return;

    const handleReceiveMessage = (newMessage) => {
      setMessages(prev => [...prev, newMessage]);
      scrollToBottom();
    };

    const handleUserJoined = (user) => {
      setUsers(prev => {
        if (!prev.includes(user.username)) {
          return [...prev, user.username];
        }
        return prev;
      });
      toast.success(`${user.username} joined the room`);
    };

    const handleUserLeft = (user) => {
      setUsers(prev => prev.filter(u => u !== user.username));
      toast.error(`${user.username} left the room`);
    };

    const handleRoomData = ({ messages: roomMessages, users: roomUsers }) => {
      setMessages(roomMessages);
      setUsers([...new Set(roomUsers)]);
      scrollToBottom();
    };

    socket.on('receive-message', handleReceiveMessage);
    socket.on('user-joined', handleUserJoined);
    socket.on('user-left', handleUserLeft);
    socket.on('room-data', handleRoomData);

    return () => {
      socket.off('receive-message', handleReceiveMessage);
      socket.off('user-joined', handleUserJoined);
      socket.off('user-left', handleUserLeft);
      socket.off('room-data', handleRoomData);
    };
  }, [socket, roomId, scrollToBottom]);

  // Auto-fill room ID from URL parameter
  useEffect(() => {
    if (urlRoomId) {
      setRoomId(urlRoomId);
    }
  }, [urlRoomId]);

  // Persist session to localStorage
  useEffect(() => {
    if (roomId && username) {
      localStorage.setItem(SESSION_KEY, JSON.stringify({
        username,
        roomId,
        userId,
        messages
      }));
    }
  }, [roomId, username, userId, messages]);

  useEffect(() => {
    const chatRef = ref(rtdb, `chats/${roomId}`);
    const unsubscribe = onValue(chatRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const messagesArray = Object.values(data);
        setMessages(messagesArray);
        localStorage.setItem(SESSION_KEY, JSON.stringify({
          username,
          roomId,
          userId,
          messages: messagesArray
        }));
      }
    });

    // Track user presence
    const presenceRef = ref(rtdb, `presence/${roomId}/${userId}`);
    onDisconnect(presenceRef).remove();
    set(presenceRef, true);

    return () => {
      unsubscribe();
    };
  }, [roomId, userId]);

  const handleJoinRoom = (e) => {
    e.preventDefault();
    const trimmedUsername = username.trim();
    if (!trimmedUsername) {
      toast.error('Please enter a username');
      return;
    }

    const newRoomId = urlRoomId || roomId.trim() || Math.random().toString(36).substr(2, 6).toUpperCase();
    
    socket.emit('join-room', { 
      roomId: newRoomId,
      username: trimmedUsername
    });

    setStep('chat');
    navigate(`/chat/${newRoomId}`);
    // Load previous messages if rejoining
    const savedSession = localStorage.getItem(SESSION_KEY);
    if (savedSession?.roomId === newRoomId) {
      setMessages(JSON.parse(savedSession).messages || []);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    const trimmedMessage = message.trim();
    if (!trimmedMessage) return;

    const newMessage = {
      text: trimmedMessage,
      sender: usernameRef.current,
    };

    socket.emit('send-message', { 
      roomId: roomIdRef.current,
      message: newMessage
    });
    
    setMessage('');
  };

  const handleAIChat = async (e) => {
    e.preventDefault();
    const trimmedMessage = message.trim();
    if (!trimmedMessage || isAILoading) return;

    // Special case handling for creator info
    if (/(who('s|s)\s+(your\s+)?(boss|creator|sir)|(boss|sir|creator)\s+name|who\s+(made|created|built|is))/i.test(trimmedMessage)) {
      const aiResponse = {
        id: Date.now() + Math.random().toString(36).substr(2, 9),
        text: "Dharm Sir (Dharm Patel)",
        sender: 'ai',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, aiResponse]);
      setMessage('');
      scrollToBottom();
      return;
    }

    setIsAILoading(true);
    try {
      const aiText = await getAIResponse(trimmedMessage);
      const aiResponse = {
        id: Date.now() + Math.random().toString(36).substr(2, 9),
        text: aiText,
        sender: 'ai',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, aiResponse]);
      setMessage('');
      scrollToBottom();
    } catch (error) {
      toast.error('Failed to get AI response');
    } finally {
      setIsAILoading(false);
    }
  };

  const handleLeaveRoom = () => {
    socket.emit('leave-room', { 
      roomId: roomIdRef.current,
      username: usernameRef.current
    });
    localStorage.removeItem(SESSION_KEY);
    setStep('join');
    setRoomId('');
    setUsername('');
    setUsers([]);
    setMessages([]);
    navigate('/chat');
  };

  useEffect(() => {
    const container = messagesEndRef.current?.parentElement;
    if (container && container.scrollHeight - container.scrollTop - container.clientHeight < 100) {
      scrollToBottom();
    }
  }, [messages, scrollToBottom]);

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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {urlRoomId ? 'Room ID' : 'Room ID (optional)'}
              </label>
              <input
                type="text"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="Leave empty to create new room"
                readOnly={!!urlRoomId}
                disabled={!!urlRoomId}
              />
            </div>
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              {urlRoomId ? 'Join Room' : 'Create Room'}
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
          {messages.map((message, index) => (
            message.type === 'system' ? (
              <div key={index} className="text-center">
                <span className="inline-block px-4 py-2 text-sm text-gray-500 bg-gray-100 rounded-full">
                  {message.content}
                </span>
              </div>
            ) : (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`max-w-lg ${
                  message.sender === username ? 'ml-auto bg-indigo-600 text-white' :
                  message.sender === 'system' ? 'mx-auto bg-gray-200 text-gray-600' :
                  message.sender === 'ai' ? 'bg-green-50 text-black border-l-4 border-green-600' :
                  'bg-white'
                } rounded-lg p-3 shadow`}
              >
                {message.sender !== 'system' && message.sender !== 'ai' && (
                  <p className="text-xs opacity-75 mb-1">{message.sender}</p>
                )}
                
                {message.sender === 'ai' ? (
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-green-800">🤖 AI Response</h3>
                    <div className="space-y-3">
                      {message.text.split(/(```[\s\S]*?```)/g).map((part, index) => part.startsWith('```') ? (
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
                  <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                )}
                
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </p>
              </motion.div>
            )
          ))}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="p-4 bg-white border-t">
          <div className="flex gap-4">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="Type your message..."
              disabled={isAILoading}
            />
            <button
              type="button"
              onClick={handleAIChat}
              disabled={isAILoading}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
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
