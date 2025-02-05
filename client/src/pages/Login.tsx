// src/pages/Login.tsx
import React, { useState } from 'react';
import API from '../api';
import { useNavigate, Link } from 'react-router-dom';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await API.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      navigate('/');
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.msg || 'Erreur lors de la connexion');
    }
  };

  return (
    <div className="dashboard-container" style={{ maxWidth: '400px', marginTop: '50px' }}>
      <h2>Connexion</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleLogin}>
        <div>
          <label>Email :</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Mot de passe :</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div style={{ marginTop: '10px' }}>
          <button type="submit">Se connecter</button>
        </div>
      </form>
      <p>
        Pas encore inscrit ? <Link to="/register">S'inscrire</Link>
      </p>
    </div>
  );
};

export default Login;