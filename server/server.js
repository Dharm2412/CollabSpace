import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Adjust for production
    methods: ["GET", "POST"],
  },
});

const rooms = new Map(); // roomId -> { messages: [], users: Map<userId, {username, socketId}>, code: { [filename]: string }, aiStatus: {} }

const PORT = process.env.PORT || 3001;

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.data = {
    rooms: new Set(),
    username: null,
    userId: null,
  };

  socket.on("join-room", ({ roomId, username, userId }) => {
    if (!rooms.has(roomId)) {
      rooms.set(roomId, {
        messages: [],
        users: new Map(), // userId -> {username, socketId}
        code: { "main.js": "// Start coding here!\n" },
      });
    }

    const room = rooms.get(roomId);
    
    // Check if user already exists in room
    const existingUser = Array.from(room.users.values()).find(u => u.username === username);
    if (existingUser) {
      // Update the existing user's socket ID
      room.users.set(existingUser.userId, { username, socketId: socket.id });
    } else {
      // Add new user
      room.users.set(userId, { username, socketId: socket.id });
    }

    socket.data.username = username;
    socket.data.userId = userId;
    socket.data.rooms.add(roomId);
    socket.join(roomId);

    socket.emit("room-data", {
      messages: room.messages,
      users: Array.from(room.users.values()).map(u => ({ username: u.username, userId: Array.from(room.users.keys()).find(key => room.users.get(key) === u) })),
      code: room.code,
    });

    socket.to(roomId).emit("user-joined", { username, userId });
  });

  socket.on("send-message", ({ roomId, message }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    const fullMessage = {
      ...message,
      id: Date.now(),
      timestamp: new Date().toISOString(),
    };
    room.messages.push(fullMessage);
    io.to(roomId).emit("receive-message", fullMessage);
  });

  socket.on("whiteboard-draw", (data) => {
    const { roomId, changes } = data;
    socket.to(roomId).emit("whiteboard-draw", { roomId, changes });
  });

  socket.on("code_update", ({ roomId, path, content }) => {
    const room = rooms.get(roomId);
    if (room) {
      if (content === null) {
        delete room.code[path];
      } else {
        room.code[path] = content;
      }
      io.to(roomId).emit("code_update", { path, content });
    }
  });

  socket.on(
    "ai_generation_status",
    ({ roomId, status, prompt, filesGenerated, error }) => {
      const room = rooms.get(roomId);
      if (room) {
        room.aiStatus = {
          status,
          prompt,
          filesGenerated,
          error,
          timestamp: Date.now(),
        };
        socket.to(roomId).emit("ai_generation_status", {
          status,
          prompt,
          filesGenerated,
          error,
          username: socket.data.username,
        });
      }
    }
  );

  socket.on("request-room-data", ({ roomId }) => {
    const room = rooms.get(roomId);
    if (room) {
      socket.emit("room-data", {
        messages: room.messages,
        users: Array.from(room.users.values()).map(u => ({ username: u.username, userId: Array.from(room.users.keys()).find(key => room.users.get(key) === u) })),
        code: room.code,
      });
    }
  });

  // WebRTC Signaling with Group Call Support
  socket.on('call-request', ({ roomId, from, type, to }) => {
    // Broadcast to all users in the room except the caller
    socket.to(roomId).emit('call-request', { 
      from, 
      type,
      to 
    });
  });

  socket.on('call-accept', ({ roomId, from, to }) => {
    io.to(roomId).emit('call-accept', { from, to });
  });

  socket.on('call-decline', ({ roomId, from, to }) => {
    io.to(roomId).emit('call-decline', { from, to });
  });

  socket.on('call-ended', ({ roomId, from, reason }) => {
    io.to(roomId).emit('call-ended', { from, reason });
  });

  socket.on('offer', ({ roomId, offer, to }) => {
    socket.to(roomId).emit('offer', { 
      offer, 
      from: socket.data.username
    });
  });

  socket.on('answer', ({ roomId, answer, to }) => {
    socket.to(roomId).emit('answer', { 
      answer, 
      from: socket.data.username
    });
  });

  socket.on('ice-candidate', ({ roomId, candidate, to }) => {
    socket.to(roomId).emit('ice-candidate', { 
      candidate, 
      from: socket.data.username
    });
  });

  socket.on("end-call", ({ roomId, to }) => {
    socket.to(roomId).emit("call-ended", { from: socket.data.username, to });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    socket.data.rooms.forEach((roomId) => {
      const room = rooms.get(roomId);
      if (room) {
        // Find and remove the user by socket ID
        for (const [userId, userData] of room.users.entries()) {
          if (userData.socketId === socket.id) {
            room.users.delete(userId);
            socket.to(roomId).emit("user-left", { username: userData.username, userId });
            break;
          }
        }
        if (room.users.size === 0) {
          rooms.delete(roomId);
        }
      }
    });
  });

  socket.on("leave-room", ({ roomId, username, userId }) => {
    socket.leave(roomId);
    socket.data.rooms.delete(roomId);
    
    const room = rooms.get(roomId);
    if (room && userId) {
      room.users.delete(userId);
    }
    
    socket.to(roomId).emit("user-left", { username, userId });
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
