// client/src/pages/AdminDashboard.tsx
import React, { useEffect, useState } from 'react';
import API from '../api';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

interface User {
  _id: string;
  email: string;
  isAdmin: boolean;
}

const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState('');
  const [newPassword, setNewPassword] = useState<{ [key: string]: string }>({});
  const navigate = useNavigate();

  // Fonction pour éjecter l'utilisateur non-admin
  const ejectUser = () => {
    alert("Accès refusé. Vous n'êtes pas administrateur.");
    Cookies.remove('token');
    Cookies.remove('userEmail');
    Cookies.remove('userId');
    navigate('/login');
  };

  // Chargement de la liste des utilisateurs
  const fetchUsers = () => {
    API.get('/admin/users')
      .then((res) => setUsers(res.data))
      .catch((err) => {
        console.error(err);
        if (err.response && err.response.status === 403) {
          ejectUser();
        } else {
          setError("Erreur lors du chargement des utilisateurs");
        }
      });
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = (id: string) => {
    if (window.confirm("Voulez-vous vraiment supprimer cet utilisateur ?")) {
      API.delete(`/admin/users/${id}`)
        .then(() => fetchUsers())
        .catch(() => setError("Erreur lors de la suppression"));
    }
  };

  const handlePasswordUpdate = (e: React.FormEvent, id: string) => {
    e.preventDefault();
    if (!newPassword[id]) return;
    API.put(`/admin/users/${id}`, { newPassword: newPassword[id] })
      .then(() => {
        alert("Mot de passe mis à jour");
        setNewPassword({ ...newPassword, [id]: '' });
      })
      .catch(() => setError("Erreur lors de la mise à jour du mot de passe"));
  };

  // Nouvelle fonction pour basculer le statut admin
  const handleToggleAdmin = (userId: string, currentStatus: boolean) => {
    API.put(`/admin/users/${userId}/admin`, { isAdmin: !currentStatus })
      .then(() => {
        alert("Statut admin mis à jour");
        fetchUsers();
      })
      .catch(() => setError("Erreur lors de la mise à jour du statut admin"));
  };

  return (
    <div className="dashboard-container">
      <h2>Admin Dashboard - Gestion des Utilisateurs</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button onClick={() => navigate(-1)}>Retour</button>
      <table>
        <thead>
          <tr>
            <th>Email</th>
            <th>Admin</th>
            <th>Changer Statut Admin</th>
            <th>Modifier mot de passe</th>
            <th>Supprimer</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id}>
              <td>{user.email}</td>
              <td>{user.isAdmin ? 'Oui' : 'Non'}</td>
              <td>
                {/* Bouton pour basculer le statut admin */}
                <button
                  onClick={() => handleToggleAdmin(user._id, user.isAdmin)}
                  style={{ backgroundColor: user.isAdmin ? '#3498db' : '#95a5a6', color: '#fff', padding: '5px 10px', border: 'none', borderRadius: '4px' }}
                >
                  {user.isAdmin ? 'Révoquer Admin' : 'Définir Admin'}
                </button>
              </td>
              <td>
                <form onSubmit={(e) => handlePasswordUpdate(e, user._id)}>
                  <input
                    type="password"
                    placeholder="Nouveau mot de passe"
                    value={newPassword[user._id] || ''}
                    onChange={(e) =>
                      setNewPassword({ ...newPassword, [user._id]: e.target.value })
                    }
                    required
                  />
                  <button type="submit">Mettre à jour</button>
                </form>
              </td>
              <td>
                <button onClick={() => handleDelete(user._id)}>Supprimer</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminDashboard;