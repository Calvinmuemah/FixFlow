import React from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = ({ user }) => {
  const navigate = useNavigate();

  return (
    <div className="container text-center mt-5">
      <h2>Welcome, {user.name}</h2>
      <p className="mb-4">Select an option below:</p>
      <div className="d-grid gap-3 col-6 mx-auto">
        {user.role === 'host' && (
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/create')}>
            Create Room
          </button>
        )}
        <button className="btn btn-success btn-lg" onClick={() => navigate('/join')}>
          Join Room
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
