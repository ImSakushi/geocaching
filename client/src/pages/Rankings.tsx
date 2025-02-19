// client/src/pages/Rankings.tsx
import React, { useEffect, useState } from 'react';
import API from '../api';
import { useNavigate } from 'react-router-dom';
import { Container, Paper, Typography, Box, Button, List, ListItem, Avatar, Divider } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ExploreIcon from '@mui/icons-material/Explore';

interface BestCustomer {
  user: { _id: string; email: string; avatar: string };
  finds: number;
}

interface Cache {
  _id: string;
  description: string;
  likesCount?: number;
  foundCount?: number;
}

const Rankings: React.FC = () => {
  const [bestCustomers, setBestCustomers] = useState<BestCustomer[]>([]);
  const [popularCaches, setPopularCaches] = useState<Cache[]>([]);
  const [rareCaches, setRareCaches] = useState<Cache[]>([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    API.get('/rankings/best-customers')
      .then(res => setBestCustomers(res.data))
      .catch(() => setError("Erreur lors du chargement des meilleurs clients"));

    API.get('/rankings/popular-caches')
      .then(res => setPopularCaches(res.data))
      .catch(() => setError("Erreur lors du chargement des caches populaires"));

    API.get('/rankings/rarely-found-caches')
      .then(res => setRareCaches(res.data))
      .catch(() => setError("Erreur lors du chargement des caches rarement trouvées"));
  }, []);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box display="flex" alignItems="center" mb={4}>
          <EmojiEventsIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
          <Typography variant="h4" component="h1" sx={{ fontFamily: "'OpenAISans', sans-serif" }}>
            Classements
          </Typography>
        </Box>

        {error && (
          <Typography color="error" sx={{ mb: 3, fontFamily: "'OpenAISans', sans-serif" }}>
            {error}
          </Typography>
        )}

        <Box mb={6}>
          <Typography variant="h5" component="h2" sx={{ mb: 3, display: 'flex', alignItems: 'center', fontFamily: "'OpenAISans', sans-serif" }}>
            <ExploreIcon sx={{ mr: 1 }} /> Meilleurs Explorateurs
          </Typography>
          <List>
            {bestCustomers.map((item, index) => (
              <ListItem 
                key={item.user._id}
                sx={{
                  bgcolor: index < 3 ? 'rgba(255, 215, 0, 0.1)' : 'transparent',
                  borderRadius: 1,
                  mb: 1
                }}
              >
                <Box display="flex" alignItems="center" width="100%">
                  <Typography variant="h6" sx={{ minWidth: 32, fontFamily: "'OpenAISans', sans-serif" }}>
                    #{index + 1}
                  </Typography>
                  <Avatar 
                    src={item.user.avatar} 
                    sx={{ 
                      width: 50, 
                      height: 50,
                      mr: 2,
                      border: index < 3 ? '2px solid gold' : 'none'
                    }}
                  />
                  <Box flexGrow={1}>
                    <Typography sx={{ fontFamily: "'OpenAISans', sans-serif" }}>{item.user.email}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontFamily: "'OpenAISans', sans-serif" }}>
                      {item.finds} caches découvertes
                    </Typography>
                  </Box>
                </Box>
              </ListItem>
            ))}
          </List>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box mb={6}>
          <Typography variant="h5" component="h2" sx={{ mb: 3, display: 'flex', alignItems: 'center', fontFamily: "'OpenAISans', sans-serif" }}>
            <FavoriteIcon sx={{ mr: 1 }} /> Caches les Plus Populaires
          </Typography>
          <List>
            {popularCaches.map((cache, index) => (
              <ListItem key={cache._id}>
                <Typography sx={{ fontFamily: "'OpenAISans', sans-serif" }}>
                  <strong>#{index + 1}</strong> {cache.description}
                  <Typography component="span" color="text.secondary" sx={{ ml: 1, fontFamily: "'OpenAISans', sans-serif" }}>
                    ({cache.likesCount ?? 0} likes)
                  </Typography>
                </Typography>
              </ListItem>
            ))}
          </List>
        </Box>

        <Box mb={4}>
          <Typography variant="h5" component="h2" sx={{ mb: 3, fontFamily: "'OpenAISans', sans-serif" }}>
            Caches les Plus Mystérieuses
          </Typography>
          <List>
            {rareCaches.map((cache, index) => (
              <ListItem key={cache._id}>
                <Typography sx={{ fontFamily: "'OpenAISans', sans-serif" }}>
                  <strong>#{index + 1}</strong> {cache.description}
                  <Typography component="span" color="text.secondary" sx={{ ml: 1, fontFamily: "'OpenAISans', sans-serif" }}>
                    (trouvée {cache.foundCount ?? 0} fois)
                  </Typography>
                </Typography>
              </ListItem>
            ))}
          </List>
        </Box>

        <Box display="flex" justifyContent="center">
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
            size="large"
            sx={{ fontFamily: "'OpenAISans', sans-serif" }}
          >
            Retour
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Rankings;