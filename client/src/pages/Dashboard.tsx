// client/src/pages/Dashboard.tsx
import React, { useEffect, useState } from 'react';
import API from '../api';
import MapComponent, { Geocache as BaseGeocache } from '../components/MapComponent';
import { useNavigate, Link } from 'react-router-dom';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode'; // Assurez-vous d'importer jwt-decode
import LikeButton from '../components/LikeButton';


// Interface pour décoder le token JWT
interface DecodedToken {
  user: {
    id: string;
    isAdmin: boolean;
  };
  exp: number;
  iat: number;
}

// Interfaces locales pour le Dashboard avec les likes sous forme de string[]
export interface DashboardComment {
  _id: string;
  user: { email: string; avatar?: string } | undefined;
  text: string;
  date: string;
  likes: string[]; // tableau d'ID utilisateur
}

export interface DashboardGeocache extends Omit<BaseGeocache, 'likes' | 'comments'> {
  difficulty: number;
  creator: { email: string; _id: string };
  comments: DashboardComment[];
  likes: string[]; // tableau d'ID
  foundBy: string[];
  photos: string[];
  password?: string; // <-- Nouveau champ pour le mot de passe (optionnel)
}

const Dashboard: React.FC = () => {
  const [geocaches, setGeocaches] = useState<DashboardGeocache[]>([]);
  const [error, setError] = useState('');

  // États pour l'ajout d'une nouvelle géocache
  const [newPos, setNewPos] = useState<{ lat: number; lng: number } | null>(null);
  const [newDescription, setNewDescription] = useState('');
  const [newDifficulty, setNewDifficulty] = useState<number>(1);
  const [newPhoto, setNewPhoto] = useState<File | null>(null);
  const [newCachePassword, setNewCachePassword] = useState(''); // <-- État pour le mdp de la géocache

  // États pour la modification d'une géocache existante
  const [editCache, setEditCache] = useState<DashboardGeocache | null>(null);
  const [editDescription, setEditDescription] = useState('');
  const [editDifficulty, setEditDifficulty] = useState<number>(1);

  // État pour stocker le contenu des nouveaux commentaires pour chaque géocache
  const [newComments, setNewComments] = useState<{ [key: string]: string }>({});

  // État pour la géocache sélectionnée (pour afficher ses commentaires dans une modale)
  const [selectedCache, setSelectedCache] = useState<DashboardGeocache | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  // Nouvel état pour le rayon de recherche en km
  const [radius, setRadius] = useState<number>(50);

  // État pour l'édition d'un commentaire (admin ou auteur)
  const [editComment, setEditComment] = useState<{ cacheId: string, commentId: string, text: string } | null>(null);

  const navigate = useNavigate();
  const token = Cookies.get('token');
  const currentUserEmail = Cookies.get('userEmail');
  const currentUserId = Cookies.get('userId');

  // Décodage du token pour obtenir isAdmin
  let isAdmin = false;
  if (token) {
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      isAdmin = decoded.user.isAdmin;
    } catch (err) {
      console.error('Erreur lors du décodage du token', err);
    }
  }

  useEffect(() => {
    // Si pas de token ou d'informations, redirige vers login
    if (!token || !currentUserEmail || !currentUserId) {
      navigate('/login');
    }
  }, [token, currentUserEmail, currentUserId, navigate]);

  // Récupération des géocaches à chaque changement de userLocation ou de radius
  useEffect(() => {
    fetchGeocaches();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userLocation, radius]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error("Erreur lors de la récupération de la géolocalisation", error);
        }
      );
    }
  }, []);

  const fetchGeocaches = () => {
    const url = userLocation
      ? `/geocache?lat=${userLocation.lat}&lng=${userLocation.lng}&radius=${radius}`
      : '/geocache';
    API.get(url)
      .then((res) => setGeocaches(res.data as DashboardGeocache[]))
      .catch(() => setError('Erreur lors du chargement des géocaches'));
  };

  const handleLogout = () => {
    Cookies.remove('token');
    Cookies.remove('userEmail');
    Cookies.remove('userId');
    Cookies.remove('avatar');
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
        password: newCachePassword // <-- Envoi du mdp (optionnel)
      };
      const res = await API.post('/geocache', payload);
      // Si une photo a été sélectionnée, uploader la photo
      if (newPhoto && res.data._id) {
        const formData = new FormData();
        formData.append('photo', newPhoto);
        await API.post(`/upload/geocache/${res.data._id}/photo`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      setNewPos(null);
      setNewDescription('');
      setNewDifficulty(1);
      setNewPhoto(null);
      setNewCachePassword(''); // Réinitialise le mot de passe
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
    setNewCachePassword('');
  };

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

  const handleLikeComment = async (cacheId: string, commentId: string) => {
    try {
      await API.post(`/geocache/${cacheId}/comment/${commentId}/like`);
      fetchGeocaches();
    } catch (err: any) {
      console.error(err);
      setError("Erreur lors du like du commentaire");
    }
  };

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
        gpsCoordinates: editCache.gpsCoordinates,
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

  const handleAddComment = async (e: React.FormEvent, cacheId: string) => {
    e.preventDefault();
    const text = newComments[cacheId];
    if (!text) return;
    try {
      await API.post(`/geocache/${cacheId}/comment`, { text });
      setNewComments({ ...newComments, [cacheId]: '' });
      fetchGeocaches();
    } catch (err: any) {
      console.error(err);
      setError("Erreur lors de l'ajout du commentaire");
    }
  };

  const handleLikeGeocache = async (id: string) => {
    try {
      await API.post(`/geocache/${id}/like`);
      fetchGeocaches();
    } catch (err) {
      console.error(err);
      setError("Erreur lors du like de la géocache");
    }
  };

  // Modification de la fonction de validation ("Trouvé")
  const handleFoundCache = async (cache: BaseGeocache) => {
    let passwordInput = '';
    // Si la géocache est protégée par un mot de passe, on demande à l'utilisateur de le saisir
    if ((cache as DashboardGeocache).password) {
      passwordInput = window.prompt("Entrez le mot de passe de la géocache:") || '';
      if (!passwordInput) return; // annulation si aucun mot de passe n'est saisi
    }
    try {
      await API.post(`/geocache/${cache._id}/found`, { password: passwordInput });
      fetchGeocaches();
    } catch (err: any) {
      console.error(err);
      setError("Erreur lors de la mise à jour de l'état 'trouvé'");
    }
  };

  // Fonctions pour l'édition et la suppression des commentaires (accessible pour l'auteur ou l'admin)
  const openEditCommentModal = (cacheId: string, commentId: string, currentText: string) => {
    setEditComment({ cacheId, commentId, text: currentText });
  };

  const handleEditCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editComment) return;
    try {
      await API.put(
        `/geocache/${editComment.cacheId}/comment/${editComment.commentId}`,
        { text: editComment.text }
      );
      setEditComment(null);
      fetchGeocaches();
    } catch (err: any) {
      console.error(err);
      setError("Erreur lors de la mise à jour du commentaire");
    }
  };

  const handleDeleteComment = async (cacheId: string, commentId: string) => {
    if (window.confirm("Voulez-vous vraiment supprimer ce commentaire ?")) {
      try {
        await API.delete(`/geocache/${cacheId}/comment/${commentId}`);
        fetchGeocaches();
      } catch (err: any) {
        console.error(err);
        setError("Erreur lors de la suppression du commentaire");
      }
    }
  };

  return (
    <div className="dashboard-container">
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        padding: '20px',
        background: 'white',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        borderRadius: '8px',
        margin: '20px 0'
      }}>
        <div 
          style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
          onClick={() => navigate('/profile')}
        >
          {Cookies.get('avatar') ? (
            <img 
              src={Cookies.get('avatar')} 
              alt="Avatar" 
              style={{ 
                width: '50px', 
                height: '50px', 
                objectFit: 'cover', 
                borderRadius: '50%', 
                marginRight: '15px',
                border: '2px solid #3f51b5'
              }} 
            />
          ) : (
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              backgroundColor: '#e0e0e0',
              marginRight: '15px'
            }} />
          )}
          <h2 style={{ 
            margin: 0,
            fontSize: '24px',
            color: '#2c3e50'
          }}>Dashboard</h2>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={() => navigate('/rankings')}
            style={{
              padding: '8px 16px',
              borderRadius: '6px', 
              border: '1px solid #3f51b5',
              background: 'white',
              color: '#3f51b5',
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontWeight: 500
            }}
          >Classements</button>
          <button 
            onClick={handleLogout}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              background: '#f44336',
              color: 'white',
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontWeight: 500
            }}
          >Déconnexion</button>
        </div>
      </header>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Slider pour ajuster le rayon de recherche */}
      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="radiusSlider">Rayon de recherche : {radius} km</label>
        <input
          id="radiusSlider"
          type="range"
          min="5"
          max="10000"
          step="5"
          value={radius}
          onChange={(e) => setRadius(Number(e.target.value))}
          style={{ width: '100%' }}
        />
      </div>

      <div className="map-container">
        <MapComponent
          geocaches={geocaches.map((cache) => ({
            ...cache,
            likes: cache.likes ? [...cache.likes] : [],
          }))}
          onMapClick={handleMapClick}
          onMarkerClick={(cache) => setSelectedCache(cache as DashboardGeocache)}
          onFound={handleFoundCache}
        />
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
              <div>
                <label>Mot de passe (optionnel) :</label>
                <input
                  type="text"
                  value={newCachePassword}
                  onChange={(e) => setNewCachePassword(e.target.value)}
                  placeholder="Laissez vide si non protégé"
                />
              </div>
              <div>
                <label>Photo (optionnelle) :</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setNewPhoto(e.target.files[0]);
                    }
                  }}
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

      {selectedCache && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Commentaires pour : {selectedCache.description}</h3>
            <ul>
              {selectedCache.comments && selectedCache.comments.length > 0 ? (
                selectedCache.comments.map((comment) => {
                  const commentHasLiked = currentUserId
                    ? ((comment.likes || []).includes(currentUserId))
                    : false;
                  return (
                    <li key={comment._id} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                      {comment.user && comment.user.avatar && (
                        <img
                          src={comment.user.avatar}
                          alt="avatar"
                          style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '50%', marginRight: '5px' }}
                        />
                      )}
                      <div>
                        <p>
                          <strong>
                            {comment.user?.email
                              ? comment.user.email.split('@')[0]
                              : 'Utilisateur inconnu'}
                          </strong>
                        </p>
                        <p>{comment.text}</p>
                        <small>{new Date(comment.date).toLocaleString()}</small>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          {/* Remplacement de l'icône like par le composant LikeButton */}
                          <LikeButton
                            liked={commentHasLiked}
                            onClick={() => handleLikeComment(selectedCache._id, comment._id)}
                          />
                          <span style={{ marginLeft: '5px' }}>{(comment.likes || []).length} likes</span>
                          {isAdmin && (
                            <>
                              <button
                                onClick={() => openEditCommentModal(selectedCache._id, comment._id, comment.text)}
                                style={{ marginLeft: '10px' }}
                              >
                                Modifier
                              </button>
                              <button
                                onClick={() => handleDeleteComment(selectedCache._id, comment._id)}
                                style={{ marginLeft: '5px' }}
                              >
                                Supprimer
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })
              ) : (
                <p>Aucun commentaire pour le moment.</p>
              )}
            </ul>
            <form onSubmit={(e) => handleAddComment(e, selectedCache._id)}>
              <input
                type="text"
                placeholder="Ajouter un commentaire..."
                value={newComments[selectedCache._id] || ''}
                onChange={(e) =>
                  setNewComments({ ...newComments, [selectedCache._id]: e.target.value })
                }
                required
              />
              <button type="submit">Envoyer</button>
            </form>
            <button onClick={() => setSelectedCache(null)}>Fermer</button>
          </div>
        </div>
      )}

      <div>
        <h3>Liste des géocaches</h3>
        <ul className="geocache-list">
          {geocaches.map((cache) => {
            const hasLiked = currentUserId ? ((cache.likes || []).includes(currentUserId)) : false;
            return (
              <li key={cache._id} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                {cache.photos && cache.photos.length > 0 && (
                  <img src={cache.photos[0]} alt="Photo géocache" style={{ width: '100px', height: '100px', objectFit: 'cover', marginRight: '10px' }} />
                )}
                <div>
                  <p>
                    <strong>{cache.description}</strong> (Difficulté: {cache.difficulty}) – Créé par: {cache.creator?.email}
                  </p>
                  <span>
                    {(cache.creator?.email === currentUserEmail || isAdmin) && (
                      <>
                        <button onClick={() => openEditModal(cache)}>Modifier</button>
                        <button onClick={() => handleDeleteGeocache(cache._id)} style={{ marginLeft: '5px' }}>
                          Supprimer
                        </button>
                      </>
                    )}


                  <LikeButton liked={hasLiked} onClick={() => handleLikeGeocache(cache._id)} />
                  <span>{cache.likes ? cache.likes.length : 0} likes</span>

                  </span>
                  <div className="comment-section" style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #ddd' }}>
                    <h4>Commentaires</h4>
                    {cache.comments && cache.comments.length > 0 ? (
                      <ul>
                        {cache.comments.map((comment) => {
                          const commentHasLiked = currentUserId ? ((comment.likes || []).includes(currentUserId)) : false;
                          return (
                            <li key={comment._id} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                              {comment.user && comment.user.avatar && (
                                <img src={comment.user.avatar} alt="Avatar" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '50%', marginRight: '5px' }} />
                              )}
                              <div>
                                <p>
                                  <strong>
                                    {comment.user?.email
                                      ? comment.user.email.split('@')[0]
                                      : 'Utilisateur inconnu'}
                                  </strong>
                                </p>
                                <p>{comment.text}</p>
                                <small>{new Date(comment.date).toLocaleString()}</small>
                                <div>
                                  <LikeButton liked={commentHasLiked} onClick={() => handleLikeComment(cache._id, comment._id)} />
                                  {(comment.likes || []).length} likes
                                  {isAdmin && (
                                    <>
                                      <button onClick={() => openEditCommentModal(cache._id, comment._id, comment.text)} style={{ marginLeft: '10px' }}>
                                        Modifier
                                      </button>
                                      <button onClick={() => handleDeleteComment(cache._id, comment._id)} style={{ marginLeft: '5px' }}>
                                        Supprimer
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      <p>Aucun commentaire pour le moment.</p>
                    )}
                    <form onSubmit={(e) => handleAddComment(e, cache._id)}>
                      <input
                        type="text"
                        placeholder="Ajouter un commentaire..."
                        value={newComments[cache._id] || ''}
                        onChange={(e) =>
                          setNewComments({ ...newComments, [cache._id]: e.target.value })
                        }
                        required
                      />
                      <button type="submit">Envoyer</button>
                    </form>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
      {isAdmin && (
        <button 
          className="admin-button" 
          onClick={() => navigate('/admin')}
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: 1000
          }}
        >
          Admin
        </button>
      )}
    </div>
  );
};

export default Dashboard;