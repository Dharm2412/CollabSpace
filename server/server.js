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

const rooms = new Map(); // roomId -> { messages: [], users: Set<string>, code: { [filename]: string }, aiStatus: {} }

const PORT = process.env.PORT || 10000;

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.data = {
    rooms: new Set(),
    username: null,
  };

  socket.on("join-room", ({ roomId, username }) => {
    if (!rooms.has(roomId)) {
      rooms.set(roomId, {
        messages: [],
        users: new Set(),
        code: { "main.js": "// Start coding here!\n" },
      });
    }

    const room = rooms.get(roomId);
    room.users.add(username);

    socket.data.username = username;
    socket.data.rooms.add(roomId);
    socket.join(roomId);

    socket.emit("room-data", {
      messages: room.messages,
      users: Array.from(room.users),
      code: room.code,
    });

    socket.to(roomId).emit("user-joined", { username });
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
        users: Array.from(room.users),
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
        room.users.delete(socket.data.username);
        socket.to(roomId).emit("user-left", { username: socket.data.username });
        if (room.users.size === 0) {
          rooms.delete(roomId);
        }
      }
    });
  });

  socket.on("leave-room", ({ roomId, username }) => {
    socket.leave(roomId);
    socket.data.rooms.delete(roomId);
    socket.to(roomId).emit("user-left", { username });
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
