import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ZegoVideoCall from '../components/ui/ZegoVideoCall';
import { useAuth } from '../context/AuthContext';

function VideoCall() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [isCallActive, setIsCallActive] = useState(false);

  useEffect(() => {
    setIsCallActive(true);
  }, []);

  const handleEndCall = () => {
    setIsCallActive(false);
    navigate(`/chat/${roomId}`);
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center text-white">
          <h2 className="text-xl mb-4">Please login to join video call</h2>
          <button
            onClick={() => navigate('/login')}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative">
      {/* Simple Header */}
      <div className="absolute top-4 left-4 z-10 flex items-center space-x-4">
        <button
          onClick={() => navigate(`/chat/${roomId}`)}
          className="text-white hover:text-gray-300"
        >
          ← Back
        </button>
        <span className="text-white text-sm">Room: {roomId}</span>
      </div>

      {/* End Call Button */}
      <button
        onClick={handleEndCall}
        className="absolute top-4 right-4 z-10 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
      >
        End Call
      </button>

      {/* Video Call */}
      {isCallActive && (
        <ZegoVideoCall
          roomId={roomId}
          username={roomId}
        />
      )}
    </div>
  );
}

export default VideoCall; 