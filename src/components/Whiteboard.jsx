import { useCallback, useEffect, useState, useRef } from 'react';
import { Tldraw, useEditor } from 'tldraw';
import { useParams } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import 'tldraw/tldraw.css';
import RoomSidebar from './RoomSidebar';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

export default function Whiteboard() {
  const { roomId } = useParams();
  const socket = useSocket();
  const [users, setUsers] = useState([]);
  const [whiteboardData, setWhiteboardData] = useState(null);

  useEffect(() => {
    if (!socket) return;

    const handleUserUpdate = (userList) => {
      setUsers(userList);
    };

    socket.on('whiteboard-users', handleUserUpdate);
    
    return () => {
      socket.off('whiteboard-users', handleUserUpdate);
    };
  }, [socket]);

  useEffect(() => {
    socket.emit('join-room', roomId);

    return () => {
      socket.emit('leave-room', roomId);
    };
  }, [socket, roomId]);

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

  return (
    <div className="flex h-screen bg-white">
      <RoomSidebar roomId={roomId} users={users} />
      <div className="flex-1 bg-white">
        <Tldraw inferDarkMode={false} persistenceKey={roomId}>
          <EditorWrapper roomId={roomId} socket={socket} />
        </Tldraw>
      </div>
    </div>
  );
}

function EditorWrapper({ roomId, socket }) {
  const editor = useEditor();

  useEffect(() => {
    const handleChange = (changes) => {
      socket.emit('whiteboard-draw', { roomId, changes });
    };

    const cleanup = editor.store.listen(handleChange, {
      source: 'user',
      scope: 'document'
    });
    
    return () => cleanup();
  }, [socket, roomId, editor]);

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
        drawings.forEach(change => editor.store.applyDiff(change));
      });
    };

    socket.on('whiteboard-draw', handleRemoteChange);
    socket.on('whiteboard-history', handleInitialDrawings);
    
    return () => {
      socket.off('whiteboard-draw', handleRemoteChange);
      socket.off('whiteboard-history', handleInitialDrawings);
    };
  }, [socket, roomId, editor]);

  useEffect(() => {
    socket.emit('join-whiteboard', roomId);
    return () => {
      socket.emit('leave-whiteboard', roomId);
    };
  }, [socket, roomId]);

  return null;
}

function useThrottle(callback, delay) {
  const lastCall = useRef(0);
  return useCallback((...args) => {
    const now = new Date().getTime();
    if (now - lastCall.current >= delay) {
      lastCall.current = now;
      callback(...args);
    }
  }, [callback, delay]);
}