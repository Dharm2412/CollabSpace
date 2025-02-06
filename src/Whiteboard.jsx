import React, { useRef, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import { motion } from 'framer-motion';

const SOCKET_URL = 'http://localhost:5000';

export default function Whiteboard() {
  const navigate = useNavigate();
  const { roomId } = useParams();
  const canvasRef = useRef(null);
  const [socket, setSocket] = useState(null);
  const [color, setColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(5);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPoint, setLastPoint] = useState(null);
  const [tool, setTool] = useState('pen');

  useEffect(() => {
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    // Initialize canvas
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = window.innerWidth - 300;
    canvas.height = window.innerHeight - 100;

    // Socket listeners
    newSocket.on('draw', (data) => {
      drawFromData(data);
    });

    newSocket.on('clear', () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    });

    // Join or create room
    if (roomId) {
      newSocket.emit('join_whiteboard', roomId);
    } else {
      newSocket.emit('create_whiteboard', (newRoomId) => {
        navigate(`/whiteboard/${newRoomId}`);
      });
    }

    return () => newSocket.disconnect();
  }, []);

  const drawFromData = (data) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const { type, points, color, lineWidth } = data;
    
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';

    if (type === 'start') {
      ctx.moveTo(points.x, points.y);
    } else {
      ctx.moveTo(points.x0, points.y0);
      ctx.lineTo(points.x1, points.y1);
      ctx.stroke();
    }
  };

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;

    setIsDrawing(true);
    setLastPoint({ x, y });

    socket.emit('draw', {
      type: 'start',
      points: { x, y },
      color: tool === 'eraser' ? '#FFFFFF' : color,
      lineWidth: tool === 'eraser' ? 20 : lineWidth,
      roomId
    });
  };

  const draw = (e) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;

    socket.emit('draw', {
      type: 'draw',
      points: { x0: lastPoint.x, y0: lastPoint.y, x1: x, y1: y },
      color: tool === 'eraser' ? '#FFFFFF' : color,
      lineWidth: tool === 'eraser' ? 20 : lineWidth,
      roomId
    });

    setLastPoint({ x, y });
  };

  const endDrawing = () => {
    setIsDrawing(false);
    setLastPoint(null);
  };

  const clearCanvas = () => {
    socket.emit('clear', roomId);
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Toolbar */}
      <div className="bg-white p-4 border-b flex items-center gap-4">
        <div className="flex gap-2">
          <button
            onClick={() => setTool('pen')}
            className={`px-4 py-2 rounded-lg ${tool === 'pen' ? 'bg-indigo-600 text-white' : 'bg-gray-100'}`}
          >
            ✏️ Pen
          </button>
          <button
            onClick={() => setTool('highlighter')}
            className={`px-4 py-2 rounded-lg ${tool === 'highlighter' ? 'bg-yellow-400' : 'bg-gray-100'}`}
          >
            🖍 Highlighter
          </button>
          <button
            onClick={() => setTool('eraser')}
            className={`px-4 py-2 rounded-lg ${tool === 'eraser' ? 'bg-red-500 text-white' : 'bg-gray-100'}`}
          >
            🧹 Eraser
          </button>
        </div>
        
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="w-12 h-12 cursor-pointer"
          disabled={tool !== 'pen'}
        />
        
        <div className="flex items-center gap-2">
          <span>Size:</span>
          <input
            type="range"
            min="1"
            max="50"
            value={lineWidth}
            onChange={(e) => setLineWidth(e.target.value)}
            className="w-32"
          />
        </div>
        
        <button
          onClick={clearCanvas}
          className="ml-auto px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
        >
          Clear Canvas
        </button>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="flex-1 bg-white cursor-crosshair"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={endDrawing}
        onMouseLeave={endDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={endDrawing}
      />

      {/* Room ID */}
      <div className="bg-white p-4 border-t flex items-center gap-4">
        <span className="font-medium">Room ID: {roomId}</span>
        <button
          onClick={() => navigator.clipboard.writeText(window.location.href)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Copy Link
        </button>
      </div>
    </div>
  );
} 