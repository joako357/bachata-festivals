import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axios from 'axios';

const locationOverrides = {
  "Long Beach, Kryemedhenj, golem": "Kryemëdhenj, Bashkia Kavajë, Central Albania, Albania",
};

const getGeocodeQuery = (location) => {
  return locationOverrides[location] || location; // Return override or original location
};

// Geocode a single festival's location and cache it
const geocodeFestival = async (festival, GEOCODE_API_URL, GEOCODE_API_KEY) => {
  const query = getGeocodeQuery(festival.location); // Define query here
  const cachedData = localStorage.getItem(query); // Use query for caching
  if (cachedData) {
    return JSON.parse(cachedData);
  }

  try {
    const response = await axios.get(GEOCODE_API_URL, {
      params: {
        q: query, // Use query for geocoding
        key: GEOCODE_API_KEY,
      },
    });

    const { results } = response.data;
    if (results.length > 0) {
      const { lat, lng } = results[0].geometry;
      const coordinates = { lat, lng };
      localStorage.setItem(query, JSON.stringify(coordinates)); // Cache using query
      return coordinates;
    } else {
      console.warn(`No results for ${query}`);
    }
  } catch (error) {
    console.error(`Error geocoding ${query}:`, error);
  }
  return null;
};

const MapComponent = ({ festivals }) => {
  const [locations, setLocations] = useState([]);

  const GEOCODE_API_URL = 'https://api.opencagedata.com/geocode/v1/json';
  const GEOCODE_API_KEY = process.env.REACT_APP_OPENCAGE_API_KEY;

  const customIcon = L.icon({
    iconUrl: '/icons/woman.png', // Replace with a relevant festival icon
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });

  useEffect(() => {
    const fetchCoordinates = async () => {
      const geocodedLocations = [];
      const unresolvedLocations = [];

      for (const festival of festivals) {
        if (!festival.location) {
          console.warn(`Skipping festival with missing location: ${festival.name}`);
          continue;
        }
        try {
          const cachedLocation = await fetchBackendCache(festival.location);
          if (cachedLocation) {
            geocodedLocations.push({ ...festival, coordinates: cachedLocation });
            continue;
          }
  
          const coordinates = await geocodeFestival(festival, GEOCODE_API_URL, GEOCODE_API_KEY);
          if (coordinates) {
            geocodedLocations.push({ ...festival, coordinates });
            saveToBackendCache(festival.location, coordinates);
          } else {
            unresolvedLocations.push(festival.location);
          }
        } catch (error) {
          console.error(`Failed to geocode ${festival.location}`, error);
          unresolvedLocations.push(festival.location);
        }
      }
      if (unresolvedLocations.length > 0) {
        console.group("Unresolved Locations");
        unresolvedLocations.forEach((loc) => console.warn(loc));
        console.groupEnd();
      }

      setLocations(geocodedLocations);
    };

    fetchCoordinates();
  }, [festivals, GEOCODE_API_KEY]);

  // Mock functions for backend caching
const fetchBackendCache = async (location) => {
  // Replace with actual API call
  return null;
};

const saveToBackendCache = async (location, coordinates) => {
  // Replace with actual API call
};

  return (
    <MapContainer center={[51.505, -0.09]} zoom={4} style={{ height: '500px', width: '100%' }}>
  <TileLayer
    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
  />

    {locations.map((location, index) =>
      location.coordinates ? (
        <Marker
          key={index}
          position={[location.coordinates.lat, location.coordinates.lng]}
          icon={customIcon}
        >
          <Popup>
            <strong>{location.name}</strong>
            <br />
            <em>{location.location}</em>
            <br />
            {location.links && location.links.length > 0 && (
              <a href={location.links[0]} target="_blank" rel="noopener noreferrer">
                Visit Website
              </a>
            )}
          </Popup>
        </Marker>
      ) : null
    )}
</MapContainer>
  );
};

export default MapComponent;
