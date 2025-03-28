import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../context/SocketContext';
import CallPopup from './CallPopup';
import toast from 'react-hot-toast';

const MediaCall = ({ roomId, username, isVideo, isActive, onEnd, users }) => {
  const socket = useSocket();
  const [callState, setCallState] = useState(null);
  const [participants, setParticipants] = useState(new Map()); // username -> {status, stream, peerConnection}
  const [localStream, setLocalStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(isVideo);
  
  const localVideoRef = useRef(null);
  const peerConnections = useRef(new Map()); // username -> RTCPeerConnection

  const configuration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ]
  };

  const getMediaStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: isVideo,
        audio: true
      });
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      return stream;
    } catch (err) {
      console.error('Media device error:', err);
      toast.error('Failed to access camera/microphone');
      throw err;
    }
  };

  const createPeerConnection = async (remoteUser) => {
    try {
      const pc = new RTCPeerConnection(configuration);
      
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit('ice-candidate', {
            roomId,
            candidate: event.candidate,
            to: remoteUser
          });
        }
      };

      pc.ontrack = (event) => {
        setParticipants(prev => {
          const newParticipants = new Map(prev);
          const participant = newParticipants.get(remoteUser) || {};
          newParticipants.set(remoteUser, {
            ...participant,
            stream: event.streams[0]
          });
          return newParticipants;
        });
      };

      // Add local tracks to the peer connection
      if (localStream) {
        localStream.getTracks().forEach(track => {
          pc.addTrack(track, localStream);
        });
      }

      peerConnections.current.set(remoteUser, pc);
      return pc;
    } catch (err) {
      console.error('PeerConnection creation error:', err);
      throw err;
    }
  };

  const startGroupCall = async () => {
    try {
      await getMediaStream();
      setCallState('active');
      
      // Initialize connections with all other users
      const otherUsers = users.filter(user => user !== username);
      setParticipants(new Map(otherUsers.map(user => [user, { status: 'connecting' }])));

      // Create peer connections and send offers to all users
      await Promise.all(otherUsers.map(async (user) => {
        const pc = await createPeerConnection(user);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        
        socket.emit('offer', {
          roomId,
          offer,
          to: user
        });
      }));
    } catch (err) {
      console.error('Failed to start group call:', err);
      endCall();
    }
  };

  const handleIncomingCall = async (from) => {
    try {
      const stream = await getMediaStream();
      setCallState('active');
      
      const pc = await createPeerConnection(from);
      setParticipants(prev => {
        const newParticipants = new Map(prev);
        newParticipants.set(from, { status: 'connecting' });
        return newParticipants;
      });
    } catch (err) {
      console.error('Failed to handle incoming call:', err);
      endCall();
    }
  };

  useEffect(() => {
    if (isActive) {
      startGroupCall();
    }

    socket.on('offer', async ({ offer, from }) => {
      try {
        if (!localStream) {
          await handleIncomingCall(from);
        }
        
        const pc = peerConnections.current.get(from);
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        
        socket.emit('answer', {
          roomId,
          answer,
          to: from
        });
      } catch (err) {
        console.error('Error handling offer:', err);
      }
    });

    socket.on('answer', async ({ answer, from }) => {
      try {
        const pc = peerConnections.current.get(from);
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
      } catch (err) {
        console.error('Error handling answer:', err);
      }
    });

    socket.on('ice-candidate', async ({ candidate, from }) => {
      try {
        const pc = peerConnections.current.get(from);
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.error('Error handling ICE candidate:', err);
      }
    });

    socket.on('user-left', ({ username }) => {
      const pc = peerConnections.current.get(username);
      if (pc) {
        pc.close();
        peerConnections.current.delete(username);
      }
      setParticipants(prev => {
        const newParticipants = new Map(prev);
        newParticipants.delete(username);
        return newParticipants;
      });
    });

    return () => {
      socket.off('offer');
      socket.off('answer');
      socket.off('ice-candidate');
      socket.off('user-left');
      endCall();
    };
  }, [isActive, roomId, username, socket]);

  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (localStream && isVideo) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoEnabled(!isVideoEnabled);
    }
  };

  const endCall = () => {
    peerConnections.current.forEach(pc => pc.close());
    peerConnections.current.clear();
    
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    
    setParticipants(new Map());
    setCallState(null);
    onEnd();
  };

  return (
    <div className="fixed bottom-4 right-4 flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto">
        {/* Local video */}
        <div className="relative">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className={`rounded-lg shadow-lg ${isVideo ? 'w-64 h-48' : 'hidden'}`}
          />
          {!isVideo && (
            <div className="w-64 h-48 bg-gray-800 rounded-lg flex items-center justify-center">
              <div className="text-white text-xl">You</div>
            </div>
          )}
        </div>
        
        {/* Remote videos */}
        {Array.from(participants).map(([participantUsername, { stream }]) => (
          <div key={participantUsername} className="relative">
            <video
              autoPlay
              playsInline
              srcObject={stream}
              className={`rounded-lg shadow-lg ${isVideo ? 'w-64 h-48' : 'hidden'}`}
            />
            {!isVideo && (
              <div className="w-64 h-48 bg-gray-800 rounded-lg flex items-center justify-center">
                <div className="text-white text-xl">{participantUsername}</div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Controls */}
      <div className="flex justify-center gap-4">
        <button
          onClick={toggleMute}
          className={`p-3 rounded-full ${isMuted ? 'bg-red-500' : 'bg-gray-700'}`}
        >
          {isMuted ? 'Unmute' : 'Mute'}
        </button>
        {isVideo && (
          <button
            onClick={toggleVideo}
            className={`p-3 rounded-full ${!isVideoEnabled ? 'bg-red-500' : 'bg-gray-700'}`}
          >
            {isVideoEnabled ? 'Disable Video' : 'Enable Video'}
          </button>
        )}
        <button
          onClick={endCall}
          className="p-3 rounded-full bg-red-500"
        >
          End Call
        </button>
      </div>
    </div>
  );
};

export default MediaCall;







