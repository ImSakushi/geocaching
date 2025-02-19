// client/src/components/LikeButton.tsx
import React from 'react';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { IconButton } from '@mui/material';

interface LikeButtonProps {
  liked: boolean;
  onClick: () => void;
}

const LikeButton: React.FC<LikeButtonProps> = ({ liked, onClick }) => {
  return (
    <IconButton onClick={onClick} aria-label="like" size="large">
      {liked ? (
        <FavoriteIcon style={{ color: 'red', fontSize: '1.5rem' }} />
      ) : (
        <FavoriteBorderIcon style={{ color: 'grey', fontSize: '1.5rem' }} />
      )}
    </IconButton>
  );
};

export default LikeButton;