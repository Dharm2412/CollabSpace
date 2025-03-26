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

// Room structure: stores messages, users, code (as an object), and AI status
const rooms = new Map(); // roomId -> { messages: [], users: Set<string>, code: { [filename]: string }, aiStatus: {} }

const PORT = process.env.PORT || 3001;

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Initialize socket data
  socket.data = {
    rooms: new Set(),
    username: null,
  };

  socket.on("join-room", async ({ roomId, username }) => {
    // Initialize room if it doesn't exist
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

    // Send existing room data to the joining client
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

  // Handle individual file updates
  socket.on("code_update", ({ roomId, path, content }) => {
    const room = rooms.get(roomId);
    if (room) {
      if (content === null) {
        delete room.code[path]; // Delete file if content is null
      } else {
        room.code[path] = content; // Update or add file content
      }
      // Broadcast the update to all clients in the room
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
        // Broadcast AI status to all room members except sender
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
