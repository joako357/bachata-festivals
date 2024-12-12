// File: src/App.js
import React, { useState, useEffect } from 'react';

const SHEET_ID = '1wz9w_KyTtN2FUoEg6tYQYzgGWJkASiDdcTceSHe-lSI'; // Replace with actual Sheet ID
const API_KEY = 'AIzaSyDGeuamof3ZeVVj9wni9gRt_cb9Z0fVpN8'; // Replace with your API Key
const RANGE = 'Calendar and Promo Codes'; // Update with the correct range or sheet name

const App = () => {
  const [festivals, setFestivals] = useState([]);
  const [filteredFestivals, setFilteredFestivals] = useState([]);
  const [filter, setFilter] = useState({ region: '', month: '' });

  // Helper function to clean and standardize data
  const cleanData = (data) => {
    return data
      .filter((row, index) => {
        // Log rows for debugging
        console.log('Processing row:', row);
  
        // Exclude rows that are likely headers
        const isHeader = (
          row[0]?.toLowerCase() === 'festival' || // First column is "Festival"
          row[1]?.toLowerCase() === 'when' ||     // Second column is "When"
          row[2]?.toLowerCase() === 'location'   // Third column is "Location"
        );
  
        if (isHeader) {
          console.log('Skipping header row:', row);
          return false; // Skip header rows
        }
  
        // Ensure the row has at least a name and date
        const name = row[0]?.trim();
        const date = row[1]?.trim();
  
        if (!name || !date) {
          console.log('Skipping incomplete row:', row);
          return false; // Skip rows missing essential data
        }
  
        return true; // Keep valid rows
      })
      .map((row) => ({
        // Map the rows to cleaned objects
        name: row[0].trim(),
        date: row[1].trim(),
        location: row[2]?.trim() || 'Location not available', // Fallback for location
        website: row[3]?.trim() || 'Website not provided', // Fallback for website
        promoCodes: row.slice(4).filter((code) => code?.trim()), // Clean promo codes
      }));
  };
  

  useEffect(() => {
    const fetchFestivals = async () => {
      try {
        const response = await fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}?key=${API_KEY}`
        );
        const data = await response.json();
        console.log('Raw Data from Google Sheets:', data.values); // Log all rows

        if (data.values) {
          const cleanedData = cleanData(data.values);
          console.log('Cleaned Data:', cleanedData); // Log after cleaning
          setFestivals(cleanedData);
          setFilteredFestivals(cleanedData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchFestivals();
  }, []);

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter((prev) => ({ ...prev, [name]: value }));
  };

  // Apply filters
  useEffect(() => {
    let filtered = festivals;
    if (filter.region) {
      filtered = filtered.filter((festival) =>
        festival.location.toLowerCase().includes(filter.region.toLowerCase())
      );
    }
    if (filter.month) {
      filtered = filtered.filter((festival) =>
        new Date(festival.date).getMonth() + 1 === parseInt(filter.month)
      );
    }
    setFilteredFestivals(filtered);
  }, [filter, festivals]);

  return (
    <div>
      <h1>Bachata Festival Finder</h1>
      <div>
        <label>
          Region:
          <input
            type="text"
            name="region"
            value={filter.region}
            onChange={handleFilterChange}
            placeholder="e.g., Europe"
          />
        </label>
        <label>
          Month:
          <input
            type="number"
            name="month"
            value={filter.month}
            onChange={handleFilterChange}
            placeholder="e.g., 1 for January"
          />
        </label>
      </div>
      <div>
        {filteredFestivals.map((festival, index) => (
          <div key={index} style={{ border: '1px solid black', margin: '10px', padding: '10px' }}>
            <h3>{festival.name}</h3>
            <p><strong>Date:</strong> {festival.date}</p>
            <p><strong>Location:</strong> {festival.location}</p>
            <p><strong>Website:</strong> <a href={festival.website} target="_blank" rel="noopener noreferrer">{festival.website}</a></p>
            <p><strong>Promo Codes:</strong> {festival.promoCodes.join(', ') || 'N/A'}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
