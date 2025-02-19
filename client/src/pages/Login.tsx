// client/src/pages/Login.tsx
import React, { useState } from 'react';
import API from '../api';
import { useNavigate, Link } from 'react-router-dom';
import Cookies from 'js-cookie'; // Import de js-cookie


const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await API.post('/auth/login', { email, password });
      // Stocker le token et éventuellement l'email dans des cookies
      Cookies.set('token', res.data.token, { expires: 1 });
      Cookies.set('userEmail', email, { expires: 1 });
      Cookies.set('userId', res.data.userId, { expires: 1 });
      navigate('/');
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.msg || 'Erreur lors de la connexion');
    }
  };

  return (
    <div className="dashboard-container" style={{ 
      maxWidth: '400px',
      minHeight: '100vh',
      margin: '0 auto',
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '2rem'
    }}>
      <h1 style={{ 
        marginBottom: '2rem',
        position: 'absolute',
        top: '2rem',
        left: '50%',
        transform: 'translateX(-50%)'
      }}>Connexion</h1>
      {error && <p style={{ color: 'red', marginBottom: '1.5rem' }}>{error}</p>}
      <form onSubmit={handleLogin} style={{ width: '100%', marginTop: '3rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ marginBottom: '0.5rem', display: 'block' }}>Email : </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%' }}
          />
        </div>
        <div style={{ marginBottom: '2rem' }}>
          <label style={{ marginBottom: '0.5rem', display: 'block' }}>Mot de passe : </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%' }}
          />
        </div>
        <div>
          <button type="submit" style={{ width: '100%' }}>Se connecter</button>
        </div>
      </form>
      <p style={{ marginTop: '2rem' }}>
        Pas encore inscrit ? <Link to="/register">S'inscrire</Link>
      </p>
    </div>
  );
};

export default Login;