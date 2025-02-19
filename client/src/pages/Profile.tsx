// client/src/pages/Profile.tsx
import React, { useState, useEffect } from 'react';
import API from '../api';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { Container, Paper, Typography, Box, Button, Input, Avatar } from '@mui/material';
import { styled } from '@mui/material/styles';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const Profile: React.FC = () => {
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [message, setMessage] = useState('');
  const [currentAvatar, setCurrentAvatar] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const avatar = Cookies.get('avatar');
    if (avatar) {
      setCurrentAvatar(avatar);
    }
  }, []);

  const handleAvatarUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!avatarFile) return;
    const formData = new FormData();
    formData.append('avatar', avatarFile);
    try {
      const res = await API.put('/upload/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMessage('Avatar mis à jour avec succès');
      if (res.data.avatar) {
        setCurrentAvatar(res.data.avatar);
        Cookies.set('avatar', res.data.avatar, { expires: 1 });
      }
    } catch (err) {
      setMessage("Erreur lors de la mise à jour de l'avatar");
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Box display="flex" flexDirection="column" alignItems="center" gap={3}>
          <h2>Mon Profil</h2>

          <Avatar
            src={currentAvatar || undefined}
            sx={{ width: 150, height: 150 }}
            alt="Photo de profil"
          />

          {message && (
            <Typography 
              color={message.includes('succès') ? 'success.main' : 'error.main'}
              variant="body1"
            >
              {message}
            </Typography>
          )}

          <Box component="form" onSubmit={handleAvatarUpload}>
            <Button
              component="label"
              variant="contained"
              startIcon={<PhotoCamera />}
              sx={{ mb: 2 }}
            >
              Choisir une photo
              <VisuallyHiddenInput
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setAvatarFile(e.target.files[0]);
                  }
                }}
              />
            </Button>

            {avatarFile && (
              <Typography variant="body2" sx={{ mb: 2 }}>
                Fichier sélectionné: {avatarFile.name}
              </Typography>
            )}

            <Box display="flex" gap={2} justifyContent="center">
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={!avatarFile}
              >
                Mettre à jour
              </Button>

              <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate(-1)}
              >
                Retour
              </Button>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default Profile;