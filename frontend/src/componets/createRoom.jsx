import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CreateRoom = ({ token }) => {
  const [form, setForm] = useState({
    roomName: '',
    isPrivate: false,
    password: ''
  });
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_ENDPOINT; 

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/room/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });

      const data = await res.json();
      if (res.ok) {
        alert(`Room "${data.roomName}" created! Code: ${data.roomCode}`);
        navigate(`/room/${data.roomCode}`);
      } else {
        alert(data.error || 'Room creation failed');
      }
    } catch (err) {
      alert('Server error. Could not create room.');
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: '600px' }}>
      <h2 className="mb-4">Create a Room</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="roomName"
          className="form-control mb-3"
          placeholder="Room Name (optional)"
          value={form.roomName}
          onChange={handleChange}
        />

        <div className="form-check mb-3">
          <input
            type="checkbox"
            name="isPrivate"
            className="form-check-input"
            id="privateCheck"
            checked={form.isPrivate}
            onChange={handleChange}
          />
          <label className="form-check-label" htmlFor="privateCheck">
            Make room private
          </label>
        </div>

        {form.isPrivate && (
          <input
            type="password"
            name="password"
            className="form-control mb-3"
            placeholder="Set room password"
            value={form.password}
            onChange={handleChange}
            required
          />
        )}

        <button type="submit" className="btn btn-primary w-100">
          Create Room
        </button>
      </form>
    </div>
  );
};

export default CreateRoom;
