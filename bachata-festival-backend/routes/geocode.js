const express = require('express');
const axios = require('axios');
const router = express.Router();

const GEOCODE_API_URL = 'https://api.opencagedata.com/geocode/v1/json';

router.post('/', async (req, res) => {
  const { location } = req.body;

  if (!location) {
    return res.status(400).json({ error: 'Location is required' });
  }

  try {
    const response = await axios.get(GEOCODE_API_URL, {
      params: {
        q: location,
        key: process.env.OPENCAGE_API_KEY,
      },
    });

    const { results } = response.data;
    if (results.length > 0) {
      const { lat, lng } = results[0].geometry;
      const country = results[0].components.country || 'Unknown Country';
      return res.json({ lat, lng, country });
    }

    res.status(404).json({ error: 'Location not found' });
  } catch (error) {
    console.error('Error fetching geocode:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
