import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import Peer from 'simple-peer';

const socket = io('http://localhost:5000');

const RoomPage = ({ token, user }) => {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [participants, setParticipants] = useState([]);
  const [typing, setTyping] = useState('');
  const [stream, setStream] = useState(null);
  const [videoOn, setVideoOn] = useState(true);
  const [audioOn, setAudioOn] = useState(true);
  const [peers, setPeers] = useState({});
  const myVideo = useRef();
  const userVideos = useRef({});
  const messagesEndRef = useRef();
//   const API_BASE_URL = import.meta.env.VITE_API_ENDPOINT; 


  useEffect(() => {
    if (!token || !user) return;

    const startConnection = async () => {
      try {
        const currentStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setStream(currentStream);
        if (myVideo.current) myVideo.current.srcObject = currentStream;

        socket.emit('join-room', { roomCode, user });

        socket.on('all-users', users => {
          const newPeers = {};
          users.forEach(({ id, user: remoteUser }) => {
            const peer = createPeer(id, socket.id, currentStream);
            newPeers[id] = { peer, user: remoteUser };
          });
          setPeers(newPeers);
        });

        socket.on('user-joined', payload => {
          const peer = addPeer(payload.signal, payload.callerId, currentStream);
          setPeers(prev => ({ ...prev, [payload.callerId]: { peer, user: payload.user } }));
        });

        socket.on('receiving-returned-signal', payload => {
          setPeers(prev => {
            const peerObj = prev[payload.id]?.peer;
            if (peerObj) peerObj.signal(payload.signal);
            return prev;
          });
        });
      } catch (err) {
        alert('Camera and mic access is required.');
        console.error(err);
        navigate('/join');
      }
    };

    startConnection();

    socket.on('room-message', msg => setMessages(prev => [...prev, msg]));
    socket.on('typing', name => setTyping(`${name} is typing...`));
    socket.on('stop-typing', () => setTyping(''));
    socket.on('update-participants', setParticipants);

    const handleBeforeUnload = () => {
      socket.emit('leave-room', { roomCode, user });
      socket.disconnect();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      socket.emit('leave-room', { roomCode, user });
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [token, roomCode, user, navigate]);

  const createPeer = (userToSignal, callerId, stream) => {
    const peer = new Peer({ initiator: true, trickle: false, stream });
    peer.on('signal', signal => {
      socket.emit('sending-signal', { userToSignal, callerId, signal, user });
    });
    peer.on('stream', userStream => {
      const videoRef = document.getElementById(userToSignal);
      if (videoRef) videoRef.srcObject = userStream;
    });
    return peer;
  };

  const addPeer = (incomingSignal, callerId, stream) => {
    const peer = new Peer({ initiator: false, trickle: false, stream });
    peer.on('signal', signal => {
      socket.emit('returning-signal', { signal, to: callerId });
    });
    peer.on('stream', userStream => {
      const videoRef = document.getElementById(callerId);
      if (videoRef) videoRef.srcObject = userStream;
    });
    peer.signal(incomingSignal);
    return peer;
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    socket.emit('send-message', { roomCode, message, user });
    setMessage('');
    socket.emit('stop-typing', roomCode);
  };

  const handleTyping = (e) => {
    setMessage(e.target.value);
    socket.emit('typing', { roomCode, name: user.name });
  };

  const startScreenShare = async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      if (myVideo.current) myVideo.current.srcObject = screenStream;
      Object.values(peers).forEach(({ peer }) => {
        peer.replaceTrack(
          stream.getVideoTracks()[0],
          screenStream.getVideoTracks()[0],
          stream
        );
      });
    } catch (err) {
      alert('Screen sharing not allowed or supported');
    }
  };

  const toggleVideo = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      videoTrack.enabled = !videoTrack.enabled;
      setVideoOn(videoTrack.enabled);
    }
  };

  const toggleAudio = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      audioTrack.enabled = !audioTrack.enabled;
      setAudioOn(audioTrack.enabled);
    }
  };

  return (
    <div className="container py-4">
      <h2 className="mb-4 text-center">Room: {roomCode}</h2>

      <div className="mb-3">
        <strong>Participants:</strong>
        <ul>
          {participants.map((p, index) => (
            <li key={index}>{p.name} - {p.role || 'Participant'}</li>
          ))}
        </ul>
      </div>

      <div className="row mb-4">
        <div className="col-md-6 mb-3">
          <div className="border rounded overflow-hidden">
            <video ref={myVideo} autoPlay muted playsInline className="w-100" />
            <div className="bg-light text-center py-1 small">Your Video</div>
          </div>
        </div>
        {Object.entries(peers).map(([peerId, { user }]) => (
          <div key={peerId} className="col-md-6 mb-3">
            <div className="border rounded overflow-hidden">
              <video id={peerId} autoPlay playsInline className="w-100" />
              <div className="bg-light text-center py-1 small">{user.name}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center mb-4 d-flex justify-content-center gap-3">
        <button className="btn btn-outline-secondary" onClick={startScreenShare}>Share Screen</button>
        <button className="btn btn-outline-danger" onClick={toggleVideo}>
          {videoOn ? 'Turn Off Camera' : 'Turn On Camera'}
        </button>
        <button className="btn btn-outline-warning" onClick={toggleAudio}>
          {audioOn ? 'Mute Mic' : 'Unmute Mic'}
        </button>
      </div>

      <div className="card p-3">
        <h5 className="mb-3">Chat</h5>
        <div className="border p-2 mb-2" style={{ height: '200px', overflowY: 'auto' }}>
          {messages.map((msg, idx) => (
            <div key={idx}>
              <strong>{msg.user.name}:</strong> {msg.message}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        {typing && <div className="text-muted small ms-1 mb-2">{typing}</div>}
        <form onSubmit={sendMessage} className="d-flex">
          <input
            type="text"
            className="form-control me-2"
            value={message}
            onChange={handleTyping}
            placeholder="Type a message..."
          />
          <button className="btn btn-primary">Send</button>
        </form>
      </div>
    </div>
  );
};

export default RoomPage;
