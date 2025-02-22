import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins for simplicity
    methods: ["GET", "POST"],
  },
});

// Updated room structure to store code as an object
const rooms = new Map(); // roomId -> { messages: [], users: Set<string>, code: { [filename]: string } }

const PORT = process.env.PORT || 3001;

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Store user's rooms and username
  socket.data = {
    rooms: new Set(),
    username: null,
  };

  socket.on("join-room", async ({ roomId, username }) => {
    // Initialize room if it doesn’t exist
    if (!rooms.has(roomId)) {
      rooms.set(roomId, {
        messages: [],
        users: new Set(),
        code: { "main.js": "// Start coding here!\n" }, // Initialize with an object
      });
    }

    const room = rooms.get(roomId);
    room.users.add(username);

    socket.data.username = username;
    socket.data.rooms.add(roomId);
    socket.join(roomId);

    // Send existing room data including code object
    socket.emit("room-data", {
      messages: room.messages,
      users: Array.from(room.users),
      code: room.code,
    });

    // Notify others in the room
    socket.to(roomId).emit("user-joined", {
      username,
      message: `${username} has joined the room`,
    });
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

  socket.on("code_update", ({ roomId, code }) => {
    const room = rooms.get(roomId);
    if (room) {
      room.code = code; // Store code as an object
      io.to(roomId).emit("code_update", code); // Broadcast to all in room
    }
  });

  // Handle request for full room data (useful for page navigation)
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

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    socket.data.rooms.forEach((roomId) => {
      const room = rooms.get(roomId);
      if (room) {
        room.users.delete(socket.data.username);

        socket.to(roomId).emit("user-left", {
          username: socket.data.username,
          message: `${socket.data.username} has left the room`,
        });

        if (room.users.size === 0) {
          rooms.delete(roomId); // Cleanup empty rooms
        }
      }
    });
  });

  socket.on("leave-room", ({ roomId, username }) => {
    socket.leave(roomId);
    socket.data.rooms.delete(roomId);
    socket.to(roomId).emit("user-left", {
      username,
      message: `${username} has left the room`,
    });
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
