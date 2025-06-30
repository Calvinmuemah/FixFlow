import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Register = ({ onRegister }) => {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'viewer' });
  const navigate = useNavigate(); // 🚀 for navigation
  const API_BASE_URL = import.meta.env.VITE_API_ENDPOINT; 

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) onRegister(data);
      else alert(data.message || 'Registration failed');
    } catch (err) {
      alert('Error connecting to server');
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: '500px' }}>
      <h2 className="mb-4">Register</h2>
      <form onSubmit={handleSubmit}>
        <input
          name="name"
          className="form-control mb-2"
          placeholder="Name"
          required
          onChange={handleChange}
        />
        <input
          type="email"
          name="email"
          className="form-control mb-2"
          placeholder="Email"
          required
          onChange={handleChange}
        />
        <input
          type="password"
          name="password"
          className="form-control mb-2"
          placeholder="Password"
          required
          onChange={handleChange}
        />
        <select name="role" className="form-select mb-3" onChange={handleChange}>
          <option value="viewer">Viewer</option>
          <option value="host">Host</option>
        </select>
        <button className="btn btn-primary w-100">Register</button>
      </form>

      <div className="text-center mt-3">
        <span>Already have an account? </span>
        <button
          className="btn btn-link p-0"
          onClick={() => navigate('/')}
        >
          Login
        </button>
      </div>
    </div>
  );
};

export default Register;
