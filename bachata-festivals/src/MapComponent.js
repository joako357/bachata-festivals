import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axios from 'axios';

const locationOverrides = {
  "Long Beach, Kryemedhenj, golem": "Kryemëdhenj, Bashkia Kavajë, Central Albania, Albania",
};

const getGeocodeQuery = (location) => {
  return locationOverrides[location] || location;
};

const fetchGeocode = async (location) => {
  const cachedData = localStorage.getItem(location);
  if (cachedData) {
    return JSON.parse(cachedData);
  }

  try {
    const response = await axios.post('http://localhost:5000/api/geocode', { location });
    const { coordinates } = response.data;
    localStorage.setItem(location, JSON.stringify(coordinates)); // Cache result
    return coordinates;
  } catch (error) {
    console.warn(`Failed to fetch geocode for ${location}`, error.message);
    return null;
  }
};

const MapComponent = ({ festivals }) => {
  const [locations, setLocations] = useState([]);

  const customIcon = L.icon({
    iconUrl: '/icons/woman.png', // Use your own marker icon
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });

  useEffect(() => {
    const fetchCoordinates = async () => {
      const geocodedLocations = [];

      for (const festival of festivals) {
        const query = getGeocodeQuery(festival.location);

        if (!query) {
          console.warn(`Skipping festival without a location: ${festival.name}`);
          continue;
        }

        const coordinates = await fetchGeocode(query);
        if (coordinates) {
          geocodedLocations.push({
            ...festival,
            coordinates,
          });
        } else {
          console.warn(`Unable to resolve coordinates for ${festival.location}`);
        }
      }

      setLocations(geocodedLocations);
    };

    fetchCoordinates();
  }, [festivals]);

  return (
    <MapContainer center={[51.505, -0.09]} zoom={4} style={{ height: '500px', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
      />
      {locations.map((location, index) => (
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
            <em>{location.date}</em>
            <br />
            {location.links?.length > 0 && (
              <a href={location.links[0]} target="_blank" rel="noopener noreferrer">
                Visit Website
              </a>
            )}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default MapComponent;
