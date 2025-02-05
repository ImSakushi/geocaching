// src/pages/Dashboard.tsx
import React, { useEffect, useState } from 'react';
import API from '../api';
import MapComponent, { Geocache } from '../components/MapComponent';
import { useNavigate } from 'react-router-dom';

interface DashboardGeocache extends Geocache {
  difficulty: number;
  creator: { email: string; _id: string };
  comments: any[];
}

const Dashboard: React.FC = () => {
  const [geocaches, setGeocaches] = useState<DashboardGeocache[]>([]);
  const [error, setError] = useState('');
  // Pour ajouter une nouvelle géocache
  const [newPos, setNewPos] = useState<{ lat: number; lng: number } | null>(null);
  const [newDescription, setNewDescription] = useState('');
  const [newDifficulty, setNewDifficulty] = useState<number>(1);
  // Pour modifier une géocache existante
  const [editCache, setEditCache] = useState<DashboardGeocache | null>(null);
  const [editDescription, setEditDescription] = useState('');
  const [editDifficulty, setEditDifficulty] = useState<number>(1);
  const navigate = useNavigate();

  // Récupère les infos utilisateur depuis le localStorage
  const token = localStorage.getItem('token');
  const currentUserEmail = localStorage.getItem('userEmail');

  // Vérifie que l'utilisateur est connecté, sinon redirige vers /login
  useEffect(() => {
    if (!token || !currentUserEmail) {
      navigate('/login');
    }
  }, [token, currentUserEmail, navigate]);

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
    localStorage.removeItem('userEmail');
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
      // Réinitialise le formulaire et ferme la modale
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

  // Suppression d'une géocache
  const handleDeleteGeocache = async (id: string) => {
    if (!window.confirm("Voulez-vous vraiment supprimer cette géocache ?")) return;
    try {
      await API.delete(`/geocache/${id}`);
      fetchGeocaches();
    } catch (err: any) {
      console.error(err);
      setError("Erreur lors de la suppression de la géocache");
    }
  };

  // Ouverture de la modale d'édition en préremplissant les champs
  const openEditModal = (cache: DashboardGeocache) => {
    setEditCache(cache);
    setEditDescription(cache.description);
    setEditDifficulty(cache.difficulty);
  };

  const handleEditGeocache = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCache) return;
    try {
      const payload = {
        gpsCoordinates: editCache.gpsCoordinates, // On garde les mêmes coordonnées pour cet exemple
        difficulty: editDifficulty,
        description: editDescription,
      };
      await API.put(`/geocache/${editCache._id}`, payload);
      setEditCache(null);
      fetchGeocaches();
    } catch (err: any) {
      console.error(err);
      setError("Erreur lors de la modification de la géocache");
    }
  };

  const handleCancelEdit = () => {
    setEditCache(null);
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

      {/* Modal d'ajout d'une nouvelle géocache */}
      {newPos && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Ajouter une nouvelle géocache</h3>
            <p>
              Position sélectionnée : {newPos.lat.toFixed(4)}, {newPos.lng.toFixed(4)}
            </p>
            <form onSubmit={handleAddGeocache}>
              <div>
                <label>Description :</label>
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

      {/* Modal d'édition d'une géocache */}
      {editCache && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Modifier la géocache</h3>
            <p>
              Position : {editCache.gpsCoordinates.lat.toFixed(4)}, {editCache.gpsCoordinates.lng.toFixed(4)}
            </p>
            <form onSubmit={handleEditGeocache}>
              <div>
                <label>Description :</label>
                <input
                  type="text"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  required
                />
              </div>
              <div>
                <label>Difficulté :</label>
                <input
                  type="number"
                  value={editDifficulty}
                  onChange={(e) => setEditDifficulty(Number(e.target.value))}
                  min="1"
                  max="5"
                  required
                />
              </div>
              <div style={{ marginTop: '10px' }}>
                <button type="submit">Enregistrer</button>
                <button type="button" onClick={handleCancelEdit} style={{ marginLeft: '10px' }}>
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
              <strong>{cache.description}</strong> (Difficulté: {cache.difficulty}) – Créé par: {cache.creator.email}
              {/* Afficher les boutons Modifier et Supprimer si l'utilisateur connecté est le créateur */}
              {currentUserEmail && cache.creator.email === currentUserEmail && (
                <span style={{ marginLeft: '10px' }}>
                  <button onClick={() => openEditModal(cache)}>Modifier</button>
                  <button onClick={() => handleDeleteGeocache(cache._id)} style={{ marginLeft: '5px' }}>
                    Supprimer
                  </button>
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;