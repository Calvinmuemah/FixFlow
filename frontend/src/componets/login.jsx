import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = ({ onLogin }) => {
  const [form, setForm] = useState({ email: '', password: '' });
  const navigate = useNavigate(); // 🚀 navigation hook
  const API_BASE_URL = import.meta.env.VITE_API_ENDPOINT; 

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (res.ok) {
        onLogin(data);       // 🔐 Save token and user
        navigate('/');       // 🧭 Go to dashboard
      } else {
        alert(data.message || 'Login failed');
      }
    } catch (err) {
      alert('Error connecting to server');
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: '500px' }}>
      <h2 className="mb-4">Login</h2>
      <form onSubmit={handleSubmit}>
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
          className="form-control mb-3"
          placeholder="Password"
          required
          onChange={handleChange}
        />
        <button className="btn btn-success w-100">Login</button>
      </form>

      <div className="text-center mt-3">
        <span>Don't have an account? </span>
        <button
          className="btn btn-link p-0"
          onClick={() => navigate('/register')}
        >
          Register
        </button>
      </div>
    </div>
  );
};

export default Login;
