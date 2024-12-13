import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';

const MapComponent = ({ festivals }) => {
  const [locations, setLocations] = useState([]);

  const GEOCODE_API_URL = 'https://api.opencagedata.com/geocode/v1/json';
  const GEOCODE_API_KEY = process.env.REACT_APP_OPENCAGE_API_KEY;

  // Geocode festival locations
  useEffect(() => {
    const fetchCoordinates = async () => {
        const geocodedLocations = [];
        const unresolvedLocations = []; // Collect unresolved locations for summary
      
        for (const festival of festivals) {
          if (!festival.location) continue; // Skip if no location
      
          try {
            const response = await axios.get(GEOCODE_API_URL, {
              params: {
                q: festival.location,
                key: GEOCODE_API_KEY,
              },
            });
      
            const { results } = response.data;
            if (results.length > 0) {
              const { lat, lng } = results[0].geometry;
              geocodedLocations.push({ ...festival, lat, lng });
              console.log(`Resolved: ${festival.location} -> (${lat}, ${lng})`);
            } else {
              console.warn(`Unresolved: ${festival.location}`);
              unresolvedLocations.push(festival.location); // Add to unresolved list
            }
          } catch (error) {
            console.error(`Error fetching coordinates for ${festival.location}:`, error);
            unresolvedLocations.push(festival.location); // Add to unresolved list
          }
        }
      
        // Summarize unresolved locations in one clean log
        if (unresolvedLocations.length > 0) {
          console.group("Unresolved Locations");
          unresolvedLocations.forEach((loc) => console.warn(loc));
          console.groupEnd();
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
        <Marker key={index} position={[location.lat, location.lng]}>
          <Popup>
            <strong>{location.name}</strong>
            <br />
            Date: {location.date}
            <br />
            Location: {location.location}
            <br />
            <a href={location.links[0]} target="_blank" rel="noopener noreferrer">
              Visit Website
            </a>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default MapComponent;
