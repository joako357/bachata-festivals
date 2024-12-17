require('dotenv').config();

const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

const GEOCODE_API_KEY = process.env.REACT_APP_OPENCAGE_API_KEY;
console.log("OpenCage API Key:", GEOCODE_API_KEY);


// Geocoding endpoint
app.post('/api/geocode', async (req, res) => {
    console.log("Received request body:", req.body);

    const { location } = req.body;

    if (!location) {
        console.error("Error: Location is missing");
        return res.status(400).json({ error: 'Location is required' });
    }

    try {
        // Make a request to OpenCage API
        const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(location)}&key=${GEOCODE_API_KEY}`;
        const response = await axios.get(url);

        if (response.data && response.data.results.length > 0) {
            const { lat, lng } = response.data.results[0].geometry;

            console.log(`Coordinates for ${location}:`, { lat, lng });
            res.json({
                location,
                coordinates: { lat, lng }
            });
        } else {
            console.warn(`No results for location: ${location}`);
            res.status(404).json({ error: 'Location not found' });
        }
    } catch (error) {
        console.error("Error calling OpenCage API:", error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
