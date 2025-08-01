import { useNavigate, useLocation } from 'react-router-dom';
import React from 'react';

export default function RoomSidebar({ roomId, users }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path) => {
    navigate(path, {
      state: { 
        prevPath: location.pathname,
        rejoinRoom: true
      }
    });
  };

  return (
    <div className="w-64 bg-white border-r p-4 flex flex-col">
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Room: {roomId}</h2>
        <p className="text-sm text-gray-500">Share this ID to invite others</p>
      </div>
      
      <div className="mb-6 space-y-2 flex-1">
        <div className="space-y-2">
          <button
            onClick={() => handleNavigation(`/chat/${roomId}`)}
            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            💬 Chat
          </button>
          <button
            onClick={() => handleNavigation(`/whiteboard/${roomId}`)}
            className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            🎨 Whiteboard
          </button>
          <button
            onClick={() => handleNavigation(`/code/${roomId}`)}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            💻 Code Share
          </button>
        </div>
      </div>

      <div className="border-t pt-4">
        <h3 className="font-medium mb-2">Online Users</h3>
        <ul className="space-y-1">
          {users.map((user, index) => (
            <li key={index} className="text-gray-600 truncate flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              {typeof user === 'object' && user.username ? user.username : user}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
} 
