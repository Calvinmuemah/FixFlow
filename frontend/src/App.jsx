import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Register from './componets/register';
import Login from './componets/login';
import Dashboard from './componets/dashboard';
import CreateRoom from './componets/createRoom';
import JoinRoom from './componets/joinRoom';
import RoomPage from './componets/room';

const App = () => {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const handleAuth = ({ user, token }) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setUser(user);
    setToken(token);
  };

  return (
    <Routes>
      {!user ? (
        <>
          <Route path="/" element={<Login onLogin={handleAuth} />} />
          <Route path="/register" element={<Register onRegister={handleAuth} />} />
          <Route path="*" element={<Navigate to="/" />} />
        </>
      ) : (
        <>
          <Route path="/" element={<Dashboard user={user} />} />
          <Route path="/create" element={<CreateRoom token={token} />} />
          <Route path="/join" element={<JoinRoom token={token} />} />
          <Route path="/room/:roomCode" element={<RoomPage token={token} user={user} />} /> {/* ✅ RoomPage route */}
          <Route path="*" element={<Navigate to="/" />} />
        </>
      )}
    </Routes>
  );
};

export default App;
