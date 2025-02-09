import express from 'express';
import http from 'http';
import { Server } from 'socket.io';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // Allow all origins for simplicity
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 3001;

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    socket.to(roomId).emit('user-joined', { 
      message: `${socket.username || 'A user'} has joined the room` 
    });
  });

  socket.on('send-message', ({ roomId, message }) => {
    io.to(roomId).emit('receive-message', message);
  });

  socket.on('whiteboard-draw', (data) => {
    const { roomId, changes } = data;
    socket.to(roomId).emit('whiteboard-draw', { roomId, changes });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 