const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json()); // Parse JSON requests
app.use(cors()); // Enable CORS for frontend communication

const GEOCODE_API_KEY = process.env.OPENCAGE_API_KEY;

// Health check endpoint (optional for testing)
app.get('/', (req, res) => {
  res.send('Server is running!');
});

// Geocoding endpoint
app.post('/api/geocode', async (req, res) => {
  const { location } = req.body;

  if (!location) {
    return res.status(400).json({ error: 'Location is required' });
  }

  try {
    // Call OpenCage Geocoding API
    const GEOCODE_API_URL = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
      location
    )}&key=${GEOCODE_API_KEY}`;

    const response = await axios.get(GEOCODE_API_URL);
    const data = response.data;

    if (data && data.results && data.results.length > 0) {
      const { lat, lng } = data.results[0].geometry;
      return res.json({
        location,
        coordinates: { lat, lng },
      });
    } else {
      return res.status(404).json({ error: 'Location not found' });
    }
  } catch (error) {
    console.error('Geocoding API Error:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
