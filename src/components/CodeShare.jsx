import React from 'react';
import RoomSidebar from './RoomSidebar';
import { useParams } from 'react-router-dom';

export default function CodeShare() {
  const { roomId } = useParams();
  
  return (
    <div className="flex h-screen">
      <RoomSidebar roomId={roomId} users={[]} />
      <div className="flex-1 p-4 bg-gray-100">
        <h2 className="text-2xl font-bold mb-4">Code Editor - Room {roomId}</h2>
        <div className="bg-white rounded-lg p-4 shadow">
          {/* Code editor will be added here */}
          <p className="text-gray-500">Code sharing feature coming soon!</p>
        </div>
      </div>
    </div>
  );
} 