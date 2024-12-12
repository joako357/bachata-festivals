import React, { useState, useEffect } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
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

  const cleanData = (data) => {
    return data
      .filter((row) => row[0]?.trim() && row[1]?.trim()) // Ensure name and date
      .map((row) => ({
        name: row[0].trim(),
        date: row[1].trim(),
        location: row[2]?.trim() || 'Location not available',
        website: row[3]?.trim() || 'Website not provided',
        promoCodes: row.slice(4).filter((code) => code?.trim()),
      }));
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const fetchFestivals = async () => {
      try {
        const response = await fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}?key=${API_KEY}`
        );
        const data = await response.json();
        if (data.values) {
          const cleanedData = cleanData(data.values);
          setFestivals(cleanedData);
          setFilteredFestivals(cleanedData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
  
    fetchFestivals();
  }, [API_KEY]); // Add API_KEY here
  


  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter((prev) => ({ ...prev, [name]: value }));
  };

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
    <Container>
      <Typography variant="h3" gutterBottom style={{ marginTop: '20px', textAlign: 'center' }}>
        Bachata Festival Finder
      </Typography>
      <Box display="flex" justifyContent="center" gap={2} marginBottom={4}>
        <TextField
          label="Region"
          variant="outlined"
          name="region"
          value={filter.region}
          onChange={handleFilterChange}
          placeholder="e.g., Europe"
        />
        <TextField
          label="Month"
          variant="outlined"
          type="number"
          name="month"
          value={filter.month}
          onChange={handleFilterChange}
          placeholder="e.g., 1 for January"
        />
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
