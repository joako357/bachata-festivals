// src/components/FestivalCard.js
import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';

const FestivalCard = ({ festival }) => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h5">{festival.name}</Typography>
        <Typography variant="body2">
          <strong>Date:</strong> {festival.date}
        </Typography>
        <Typography variant="body2">
          <strong>Location:</strong> {festival.location}
        </Typography>
        <Typography variant="body2">
          <strong>Website:</strong>{' '}
          <a href={festival.website} target="_blank" rel="noopener noreferrer">
            {festival.website || 'N/A'}
          </a>
        </Typography>
        <Typography variant="body2">
          <strong>Promo Codes:</strong> {festival.promoCodes.join(', ') || 'N/A'}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default FestivalCard;
