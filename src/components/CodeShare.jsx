import React, { useState, useEffect, useCallback } from 'react';
import RoomSidebar from './RoomSidebar';
import { useParams } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import io from 'socket.io-client';
import { debounce } from 'lodash';

export default function CodeShare() {
  const { roomId } = useParams();
  const [code, setCode] = useState('');
  const [users, setUsers] = useState([]);
  const [socket, setSocket] = useState(null);
  const [aiPrompt, setAiPrompt] = useState('');

  useEffect(() => {
    // Connect to Socket.io server
    const newSocket = io('http://localhost:3001'); // Update with your server URL
    setSocket(newSocket);

    // Corrected event name to match server (hyphen instead of underscore)
    newSocket.emit('join-room', { 
      roomId, 
      username: 'Anonymous' // Replace with actual username
    });

    // Add room-data listener for initial code sync
    newSocket.on('room-data', ({ code, users }) => {
      setCode(code);
      setUsers(users);
    });

    // Add debounced code update handler
    let debounceTimer;
    newSocket.on('code_update', (newCode) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        setCode(prev => {
          if (prev !== newCode) return newCode;
          return prev;
        });
      }, 50); // Match debounce time with emit
    });

    // Update user list
    newSocket.on('user_list', (updatedUsers) => {
      setUsers(updatedUsers);
    });

    // Cleanup on unmount
    return () => {
      newSocket.disconnect();
    };
  }, [roomId]);

  // Add proper debounce for emitting changes
  const handleEditorChange = useCallback(
    debounce((value) => {
      if (socket && value !== code) {
        socket.emit('code_update', { roomId, code: value });
      }
    }, 50), // 50ms debounce
    [socket, roomId]
  );

  // Add AI generation function
  const generateCodeWithAI = async () => {
    try {
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyBQdCEmQAKkd6qDYFcPK6aZ1Mkus2nqGa8', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `As a senior developer, generate code for: ${aiPrompt}. Respond only with the code, no explanations.`
            }]
          }]
        })
      });

      const data = await response.json();
      const generatedCode = data.candidates[0].content.parts[0].text;
      setCode(generatedCode);
      
      // Broadcast AI-generated code to all room participants
      if (socket) {
        socket.emit('code_update', { roomId, code: generatedCode });
      }
    } catch (error) {
      console.error('AI Generation Error:', error);
    }
  };

  return (
    <div className="flex h-screen">
      <RoomSidebar roomId={roomId} users={users} />
      <div className="flex-1 p-4 bg-gray-100">
        <h2 className="text-2xl font-bold mb-4">Code Editor - Room {roomId}</h2>
        
        {/* Add AI Prompt Section */}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder="Enter AI prompt (e.g., 'Python game using pygame')"
            className="flex-1 p-2 rounded border"
          />
          <button
            onClick={generateCodeWithAI}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Generate Code
          </button>
        </div>

        <div className="bg-white rounded-lg p-4 shadow h-[calc(100vh-150px)]">
          <Editor
            key={roomId}
            height="100%"
            defaultLanguage="javascript"
            theme="vs-dark"
            value={code}
            options={{ 
              minimap: { enabled: false },
              fontSize: 14,
              scrollBeyondLastLine: false
            }}
            onChange={(value) => {
              setCode(value); // Immediate local update
              handleEditorChange(value); // Debounced emit
            }}
          />
        </div>
      </div>
    </div>
  );
} 