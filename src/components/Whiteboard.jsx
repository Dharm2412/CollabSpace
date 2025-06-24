import { useCallback, useEffect, useState, useRef } from "react";
import { Tldraw, useEditor } from "tldraw";
import { useParams, useNavigate } from "react-router-dom";
import "tldraw/tldraw.css";
import RoomSidebar from "./RoomSidebar";
import { doc, updateDoc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { useSocket } from "../context/SocketContext";

import toast from "react-hot-toast";

export default function Whiteboard() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const socket = useSocket();
  const [users, setUsers] = useState([]);
  const [whiteboardData, setWhiteboardData] = useState(null);
  const editorRef = useRef(null);

  // Get username from localStorage
  const username = localStorage.getItem("username") || "Anonymous";
  const savedSession = JSON.parse(localStorage.getItem("chat_session") || "{}");
  const userId = savedSession.userId || crypto.randomUUID();

  // Use Firestore with throttled updates
  const updateWhiteboard = useThrottle((data) => {
    const docRef = doc(db, "whiteboards", roomId);
    updateDoc(docRef, { data });
  }, 1000);

  // Real-time listener
  useEffect(() => {
    const docRef = doc(db, "whiteboards", roomId);
    const unsubscribe = onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        setWhiteboardData(doc.data().data);
      }
    });
    return unsubscribe;
  }, [roomId]);

  // Join whiteboard room
  useEffect(() => {
    if (socket && roomId) {
      socket.emit("join-room", { 
        roomId, 
        username, 
        userId 
      });

      // Listen for user updates
      socket.on("room-data", ({ users: roomUsers }) => {
        setUsers(roomUsers);
      });

      socket.on("user-joined", (user) => {
        setUsers(prev => {
          const userExists = prev.some(u => 
            (typeof u === 'object' && u.userId === user.userId) || 
            (typeof u === 'string' && u === user.username)
          );
          if (!userExists) {
            return [...prev, { username: user.username, userId: user.userId }];
          }
          return prev;
        });
      });

      socket.on("user-left", (user) => {
        setUsers(prev => prev.filter(u => {
          if (typeof u === 'object') {
            return u.userId !== user.userId;
          }
          return u !== user.username;
        }));
      });

      return () => {
        socket.off("room-data");
        socket.off("user-joined");
        socket.off("user-left");
      };
    }
  }, [socket, roomId, username, userId]);

  const handleImageGenerated = async (url) => {
    if (editorRef.current) {
      const editor = editorRef.current;
      const viewportBounds = editor.viewportPageBounds;
      const centerX =
        viewportBounds.minX + (viewportBounds.maxX - viewportBounds.minX) / 2;
      const centerY =
        viewportBounds.minY + (viewportBounds.maxY - viewportBounds.minY) / 2;

      const assetId = await editor.createAsset({
        type: "image",
        props: {
          src: url,
          w: 1920, // Original full HD width
          h: 1080, // Original full HD height
          name: `HD-${prompt.substring(0, 12)}`,
          mimeType: "image/jpeg",
          isAnimated: false,
        },
      });

      editor.createShapes([
        {
          type: "image",
          x: centerX - 100, // Smaller display size (200px width)
          y: centerY - 75, // Smaller display size (150px height)
          props: {
            assetId: assetId,
            w: 200, // Display width
            h: 150, // Display height
          },
        },
      ]);

      toast.success("Image placed on whiteboard!");
    }
  };

  const handleLeaveRoom = () => {
    // Leave the room via socket
    if (socket && roomId) {
      socket.emit("leave-room", {
        roomId,
        username,
        userId
      });
    }
    navigate("/chat");
  };

  return (
    <div className="flex h-screen bg-white">
      <RoomSidebar roomId={roomId} users={users} />
      <div className="flex-1 bg-white">
        <Tldraw inferDarkMode={false} persistenceKey={roomId}>
          <EditorWrapper roomId={roomId} editorRef={editorRef} />
        </Tldraw>
      </div>
    </div>
  );
}

function EditorWrapper({ roomId, editorRef }) {
  const editor = useEditor();
  const socket = useSocket();

  useEffect(() => {
    editorRef.current = editor;

    const handleChange = (changes) => {
      if (socket && roomId) {
        socket.emit('whiteboard-draw', { roomId, changes });
      }
    };

    const cleanup = editor.store.listen(handleChange, {
      source: "user",
      scope: "document",
    });

    return () => cleanup();
  }, [roomId, editor, editorRef, socket]);

  useEffect(() => {
    const handleRemoteChange = (data) => {
      if (data.roomId === roomId) {
        editor.store.mergeRemoteChanges(() => {
          editor.store.applyDiff(data.changes);
        });
      }
    };

    const handleInitialDrawings = (drawings) => {
      editor.store.mergeRemoteChanges(() => {
        drawings.forEach((change) => editor.store.applyDiff(change));
      });
    };

    if (socket) {
      socket.on('whiteboard-draw', handleRemoteChange);
      socket.on('whiteboard-history', handleInitialDrawings);
    }

    return () => {
      if (socket) {
        socket.off('whiteboard-draw', handleRemoteChange);
        socket.off('whiteboard-history', handleInitialDrawings);
      }
    };
  }, [roomId, editor, socket]);

  useEffect(() => {
  }, []);

  return null;
}

function useThrottle(callback, delay) {
  const lastCall = useRef(0);
  return useCallback(
    (...args) => {
      const now = new Date().getTime();
      if (now - lastCall.current >= delay) {
        lastCall.current = now;
        callback(...args);
      }
    },
    [callback, delay]
  );
}
