import { useCallback, useEffect, useState } from 'react';
import { Tldraw, useEditor } from 'tldraw';
import { useParams } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import 'tldraw/tldraw.css';
import RoomSidebar from './RoomSidebar';

export default function Whiteboard() {
  const { roomId } = useParams();
  const socket = useSocket();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (!socket) return;

    const handleUserUpdate = (userList) => {
      setUsers(userList);
    };

    socket.on('user-joined-whiteboard', handleUserUpdate);
    socket.on('user-left-whiteboard', handleUserUpdate);
    
    return () => {
      socket.off('user-joined-whiteboard', handleUserUpdate);
      socket.off('user-left-whiteboard', handleUserUpdate);
    };
  }, [socket]);

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
      socket.emit('draw', { roomId, changes });
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
          const { added, updated, removed } = data.changes;
          Object.values(added).forEach(record => editor.store.put([record]));
          Object.values(updated).forEach(([, to]) => editor.store.put([to]));
          Object.values(removed).forEach(record => editor.store.remove([record.id]));
        });
      }
    };

    socket.on('draw', handleRemoteChange);
    return () => socket.off('draw', handleRemoteChange);
  }, [socket, roomId, editor]);

  useEffect(() => {
    socket.emit('join-whiteboard', roomId);
    return () => {
      socket.emit('leave-whiteboard', roomId);
    };
  }, [socket, roomId]);

  return null;
} 