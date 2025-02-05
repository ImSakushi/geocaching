// src/pages/Dashboard.tsx
import React, { useEffect, useState } from 'react';
import API from '../api';
import MapComponent, { Geocache } from '../components/MapComponent';
import { useNavigate } from 'react-router-dom';

interface DashboardGeocache extends Geocache {
  difficulty: number;
  creator: { email: string };
  comments: any[];
}

const Dashboard: React.FC = () => {
  const [geocaches, setGeocaches] = useState<DashboardGeocache[]>([]);
  const [error, setError] = useState('');
  // Pour stocker la position où l'utilisateur a cliqué sur la carte
  const [newPos, setNewPos] = useState<{ lat: number; lng: number } | null>(null);
  // États du formulaire pour la nouvelle géocache
  const [newDescription, setNewDescription] = useState('');
  const [newDifficulty, setNewDifficulty] = useState<number>(1);
  const navigate = useNavigate();

  useEffect(() => {
    fetchGeocaches();
  }, []);

  const fetchGeocaches = () => {
    API.get('/geocache')
      .then((res) => setGeocaches(res.data))
      .catch(() => setError('Erreur lors du chargement des géocaches'));
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleMapClick = (lat: number, lng: number) => {
    setNewPos({ lat, lng });
  };

  const handleAddGeocache = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPos) return;
    try {
      const payload = {
        gpsCoordinates: newPos,
        difficulty: newDifficulty,
        description: newDescription,
      };
      await API.post('/geocache', payload);
      // Réinitialise le formulaire et ferme la modal
      setNewPos(null);
      setNewDescription('');
      setNewDifficulty(1);
      fetchGeocaches();
    } catch (err: any) {
      console.error(err);
      setError("Erreur lors de l’ajout de la géocache");
    }
  };

  const handleCancelAdd = () => {
    setNewPos(null);
    setNewDescription('');
    setNewDifficulty(1);
  };

  return (
    <div className="dashboard-container">
      <header>
        <h2>Dashboard</h2>
        <button onClick={handleLogout}>Logout</button>
      </header>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div className="map-container">
        <MapComponent geocaches={geocaches} onMapClick={handleMapClick} />
      </div>
      {newPos && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Ajouter une nouvelle géocache</h3>
            <p>
              Position sélectionnée : {newPos.lat.toFixed(4)}, {newPos.lng.toFixed(4)}
            </p>
            <form onSubmit={handleAddGeocache}>
              <div>
                <label>Nom/Description :</label>
                <input
                  type="text"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  required
                />
              </div>
              <div>
                <label>Difficulté :</label>
                <input
                  type="number"
                  value={newDifficulty}
                  onChange={(e) => setNewDifficulty(Number(e.target.value))}
                  min="1"
                  max="5"
                  required
                />
              </div>
              <div style={{ marginTop: '10px' }}>
                <button type="submit">Ajouter</button>
                <button type="button" onClick={handleCancelAdd} style={{ marginLeft: '10px' }}>
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <div>
        <h3>Liste des géocaches</h3>
        <ul className="geocache-list">
          {geocaches.map((cache) => (
            <li key={cache._id}>
              {cache.description} (Difficulté: {cache.difficulty}) – Créé par: {cache.creator.email}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;