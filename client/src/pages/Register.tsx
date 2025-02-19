// client/src/pages/Register.tsx
import React, { useState } from 'react';
import API from '../api';
import { useNavigate, Link } from 'react-router-dom';
import Cookies from 'js-cookie';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await API.post('/auth/register', { email, password });
      // stocke token, mail, id & avatar dans cookies
      Cookies.set('token', res.data.token, { expires: 1 });
      Cookies.set('userEmail', email, { expires: 1 });
      Cookies.set('userId', res.data.userId, { expires: 1 });
      if (res.data.avatar) {
        Cookies.set('avatar', res.data.avatar, { expires: 1 });
      }
      navigate('/');
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.msg || 'Erreur lors de l’inscription');
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
      }}>Inscription</h1>
      {error && <p style={{ color: 'red', marginBottom: '1.5rem' }}>{error}</p>}
      <form onSubmit={handleRegister} style={{ width: '100%', marginTop: '3rem' }}>
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
          <button type="submit" style={{ width: '100%' }}>S'inscrire</button>
        </div>
      </form>
      <p style={{ marginTop: '2rem' }}>
        Déjà inscrit ? <Link to="/login">Se connecter</Link>
      </p>
    </div>
  );
};

export default Register;