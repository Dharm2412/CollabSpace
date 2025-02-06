import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { nanoid } from 'nanoid';

const app = express();
app.use(cors());

const server = createServer(app);
const io = new Server(server, {
  cors: {
    // Allow both development ports
    origin: ["http://localhost:5173", "http://localhost:5174"],
    methods: ["GET", "POST"],
    credentials: true
  },
});

// Store rooms and their data
const rooms = new Map();

// Add these with other room storage
const whiteboards = new Map();

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Create a new room
  socket.on("create_room", (username, callback) => {
    try {
      // Generate a unique 6-character room ID
      const roomId = nanoid(6).toUpperCase();
      
      // Initialize room data
      const room = {
        users: new Map([[socket.id, username]]),
        messages: [{
          id: nanoid(),
          text: `Welcome to room ${roomId}! Share this room ID with others to chat together.`,
          sender: "system",
          timestamp: new Date().toISOString(),
        }]
      };
      
      // Store room data
      rooms.set(roomId, room);

      // Join socket to room
      socket.join(roomId);
      socket.data.roomId = roomId;
      socket.data.username = username;

      // Send initial message to the room
      io.to(roomId).emit("receive_message", room.messages[0]);

      // Send room data to creator
      callback({
        success: true,
        roomId,
        messages: room.messages,
        users: Array.from(room.users.values())
      });
      
      console.log(`${username} created room ${roomId}`);
    } catch (error) {
      console.error("Error creating room:", error);
      callback({ success: false, error: "Failed to create room" });
    }
  });

  // Join an existing room
  socket.on("join_room", ({ roomId, username }, callback) => {
    try {
      const room = rooms.get(roomId.toUpperCase());
      
      if (!room) {
        callback({ success: false, error: "Room not found" });
        return;
      }

      // Add user to room
      room.users.set(socket.id, username);
      socket.join(roomId);
      socket.data.roomId = roomId;
      socket.data.username = username;

      // Notify others in the room
      io.to(roomId).emit("user_joined", {
        message: `${username} has joined the chat`,
        users: Array.from(room.users.values()),
        timestamp: new Date().toISOString(),
      });

      // Send room data to the joining user
      callback({ 
        success: true,
        messages: room.messages,
        users: Array.from(room.users.values())
      });
      
      console.log(`${username} joined room ${roomId}`);
    } catch (error) {
      console.error("Error joining room:", error);
      callback({ success: false, error: "Failed to join room" });
    }
  });

  // Handle messages
  socket.on("send_message", (message) => {
    try {
      const roomId = socket.data.roomId;
      const room = rooms.get(roomId);
      
      if (room) {
        const newMessage = {
          id: nanoid(),
          text: message,
          sender: socket.data.username,
          timestamp: new Date().toISOString(),
        };

        // Store message in room history
        room.messages.push(newMessage);
        
        // Broadcast to all users in the room
        io.to(roomId).emit("receive_message", newMessage);
        console.log(`Message from ${socket.data.username} in room ${roomId}: ${message}`);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    try {
      const roomId = socket.data.roomId;
      const room = rooms.get(roomId);
      
      if (room) {
        const username = socket.data.username;
        room.users.delete(socket.id);
        
        if (room.users.size === 0) {
          // Delete empty rooms
          rooms.delete(roomId);
          console.log(`Room ${roomId} deleted - no users remaining`);
        } else {
          // Notify remaining users
          io.to(roomId).emit("user_left", {
            message: `${username} has left the chat`,
            users: Array.from(room.users.values()),
            timestamp: new Date().toISOString(),
          });
        }
        console.log(`${username} left room ${roomId}`);
      }
    } catch (error) {
      console.error("Error handling disconnection:", error);
    }
    
    console.log("User disconnected:", socket.id);
  });

  // Whiteboard handlers
  socket.on('create_whiteboard', (callback) => {
    const whiteboardId = nanoid(6).toUpperCase();
    whiteboards.set(whiteboardId, new Set([socket.id]));
    callback(whiteboardId);
  });

  socket.on('join_whiteboard', (whiteboardId) => {
    if (whiteboards.has(whiteboardId)) {
      socket.join(whiteboardId);
      whiteboards.get(whiteboardId).add(socket.id);
    }
  });

  socket.on('draw', (data) => {
    socket.to(data.roomId).emit('draw', data);
  });

  socket.on('clear', (roomId) => {
    socket.to(roomId).emit('clear');
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 