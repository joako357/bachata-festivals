import React, { useState, useEffect } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Container from '@mui/material/Container';

const App = () => {
  const [festivals, setFestivals] = useState([]);
  const [filteredFestivals, setFilteredFestivals] = useState([]);
  const [filter, setFilter] = useState({ region: '', month: '' });

  const SHEET_ID = '1wz9w_KyTtN2FUoEg6tYQYzgGWJkASiDdcTceSHe-lSI'; // Replace with your Google Sheet ID
  const API_KEY = process.env.REACT_APP_GOOGLE_API_KEY;
  const RANGE = 'Calendar and Promo Codes'; // Replace with your sheet's range

  // Function to clean and transform data from Google Sheets
  const cleanData = (data) => {
    return data
      .filter((row) => row[0]?.trim()) // Ensure the name exists
      .map((row) => {
        const rawDate = row[1]?.trim(); // Original date value
        const parsedDate = new Date(rawDate);
        const date = isNaN(parsedDate) ? rawDate || 'Unspecified Date' : parsedDate.toDateString();
  
        return {
          name: row[0].trim(),
          date,
          location: row[2]?.trim() || 'Location not available',
          website: row[3]?.trim() || 'Website not provided',
          promoCodes: row.slice(4).filter((code) => code?.trim()),
        };
      });
  };
  

  // Fetch festival data from Google Sheets API
  useEffect(() => {
    const fetchFestivals = async () => {
      try {
        const response = await fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}?key=${API_KEY}`
        );
        const data = await response.json();
        console.log('Raw Data:', data.values); // Debugging the raw data
        if (data.values) {
          const cleanedData = cleanData(data.values);
          setFestivals(cleanedData);
          setFilteredFestivals(cleanedData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setFestivals([]); // Fallback to an empty list if an error occurs
        setFilteredFestivals([]);
      }
    };

    fetchFestivals();
  }, [API_KEY]);

  // Handle dropdown filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter((prev) => ({ ...prev, [name]: value }));
  };

  // Filter festivals based on region and month
  useEffect(() => {
    let filtered = festivals;

    if (filter.region) {
      filtered = filtered.filter((festival) =>
        festival.location.toLowerCase().includes(filter.region.toLowerCase())
      );
    }

    if (filter.month) {
      filtered = filtered.filter((festival) => {
        const festivalDate = new Date(festival.date);
        if (!isNaN(festivalDate)) {
          return festivalDate.getMonth() + 1 === parseInt(filter.month);
        }
        return false; // Skip invalid dates
      });
    }

    setFilteredFestivals(filtered);
  }, [filter, festivals]);

  return (
    <Container>
      <Typography variant="h3" gutterBottom style={{ marginTop: '20px', textAlign: 'center' }}>
        Bachata Festival Finder
      </Typography>
      <Box display="flex" justifyContent="center" gap={2} marginBottom={4}>
        {/* Region Dropdown */}
        <FormControl variant="outlined" style={{ minWidth: 200 }}>
          <InputLabel>Region</InputLabel>
          <Select
            value={filter.region}
            onChange={handleFilterChange}
            label="Region"
            name="region"
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="Europe">Europe</MenuItem>
            <MenuItem value="Americas">Americas</MenuItem>
            <MenuItem value="Asia">Asia</MenuItem>
            <MenuItem value="Africa">Africa</MenuItem>
            <MenuItem value="Oceania">Oceania</MenuItem>
          </Select>
        </FormControl>

        {/* Month Dropdown */}
        <FormControl variant="outlined" style={{ minWidth: 200 }}>
          <InputLabel>Month</InputLabel>
          <Select
            value={filter.month}
            onChange={handleFilterChange}
            label="Month"
            name="month"
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="1">January</MenuItem>
            <MenuItem value="2">February</MenuItem>
            <MenuItem value="3">March</MenuItem>
            <MenuItem value="4">April</MenuItem>
            <MenuItem value="5">May</MenuItem>
            <MenuItem value="6">June</MenuItem>
            <MenuItem value="7">July</MenuItem>
            <MenuItem value="8">August</MenuItem>
            <MenuItem value="9">September</MenuItem>
            <MenuItem value="10">October</MenuItem>
            <MenuItem value="11">November</MenuItem>
            <MenuItem value="12">December</MenuItem>
          </Select>
        </FormControl>
      </Box>
      <Grid container spacing={3}>
        {filteredFestivals.map((festival, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
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
                    {festival.website}
                  </a>
                </Typography>
                <Typography variant="body2">
                  <strong>Promo Codes:</strong> {festival.promoCodes.join(', ') || 'N/A'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default App;
