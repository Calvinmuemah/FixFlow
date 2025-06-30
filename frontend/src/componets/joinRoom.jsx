import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const JoinRoom = ({ token }) => {
  const [roomCode, setRoomCode] = useState('');
  const [password, setPassword] = useState('');
  const [roomPrivate, setRoomPrivate] = useState(false);
  const [roomChecked, setRoomChecked] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const API_BASE_URL = import.meta.env.VITE_API_ENDPOINT; 

  const handleCheckRoom = async (e) => {
    e.preventDefault();
    if (!roomCode.trim()) return alert('Please enter room code');

    try {
      const res = await fetch(`${API_BASE_URL}/room/room/${roomCode}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) return setError(data.message || 'Room not found');

      if (data.isPrivate) {
        setRoomPrivate(true);
        setRoomChecked(true);
        setError('🔒 This room requires a password');
      } else {
        // Public room → directly join
        await joinRoomRequest('');
      }
    } catch (err) {
      console.error(err);
      setError('Server error');
    }
  };

  const joinRoomRequest = async (passwordInput) => {
    try {
      const res = await fetch(`${API_BASE_URL}/room/join/${roomCode}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ password: passwordInput }),
      });

      const data = await res.json();
      if (!res.ok) return setError(data.message || 'Failed to join');

      // ✅ Navigate to the room page
      navigate(`/room/${roomCode}`);
    } catch (err) {
      console.error(err);
      setError('Failed to join room');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!password.trim()) return setError('Password is required');
    await joinRoomRequest(password);
  };

  return (
    <div className="container mt-5" style={{ maxWidth: '500px' }}>
      <h2 className="mb-4">Join Room</h2>

      {!roomChecked && (
        <form onSubmit={handleCheckRoom}>
          <input
            type="text"
            className="form-control mb-3"
            placeholder="Enter Room Code"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value)}
            required
          />
          <button className="btn btn-primary w-100">Continue</button>
        </form>
      )}

      {roomPrivate && roomChecked && (
        <form onSubmit={handlePasswordSubmit}>
          <div className="alert alert-warning">🔒 This room requires a password</div>
          <input
            type="password"
            className="form-control mb-3"
            placeholder="Enter Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button className="btn btn-success w-100">Join Room</button>
        </form>
      )}

      {error && <div className="mt-3 text-danger">{error}</div>}
    </div>
  );
};

export default JoinRoom;
