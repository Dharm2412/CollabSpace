import { useEffect, useRef, useState } from 'react';
import socket from '../context/SocketContext';

const CollabRoom = ({ roomId, username }) => {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const canvasRef = useRef(null);
  
  useEffect(() => {
    socket.connect();
    
    // Room setup
    socket.emit('join-room', { roomId, username }, (response) => {
      if (!response.success) {
        // Handle error
      }
    });

    // Message handling
    socket.on('new-message', (message) => {
      setMessages(prev => [...prev, message]);
    });

    // Drawing handling
    socket.on('draw', handleRemoteDraw);
    socket.on('clear-canvas', clearCanvas);

    // User updates
    socket.on('user-joined', (username) => {
      setUsers(prev => [...prev, username]);
    });

    socket.on('user-left', (username) => {
      setUsers(prev => prev.filter(u => u !== username));
    });

    return () => {
      socket.off('new-message');
      socket.off('draw');
      socket.off('clear-canvas');
      socket.off('user-joined');
      socket.off('user-left');
      socket.disconnect();
    };
  }, [roomId, username]);

  // Drawing functions
  const handleDraw = (drawingData) => {
    // Update local canvas
    // ...
    // Send to others
    socket.emit('draw', drawingData);
  };

  const handleClear = () => {
    // Clear local canvas
    // ...
    socket.emit('clear-canvas');
  };

  return (
    <div className="flex h-screen">
      {/* Whiteboard Section */}
      <div className="flex-1 border-r">
        <canvas 
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseUp={endDrawing}
          onMouseMove={draw}
        />
        <button onClick={handleClear}>Clear</button>
      </div>
      
      {/* Chat Section */}
      <div className="w-80 bg-gray-100 p-4">
        <div className="h-[calc(100vh-160px)] overflow-y-auto">
          {messages.map(msg => (
            <div key={msg.id} className="mb-2">
              <strong>{msg.sender}:</strong> {msg.text}
            </div>
          ))}
        </div>
        <input 
          type="text" 
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              socket.emit('send-message', e.target.value);
              e.target.value = '';
            }
          }}
          className="w-full p-2 border mt-4"
        />
      </div>
    </div>
  );
};

export default CollabRoom; 