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
import TextField from '@mui/material/TextField';
import Container from '@mui/material/Container';
import MapComponent from './MapComponent';

const App = () => {
  const [festivals, setFestivals] = useState([]);
  const [filteredFestivals, setFilteredFestivals] = useState([]);
  const [filter, setFilter] = useState({ region: '', month: '', country: '', type: '', name: '' });
  const [countries, setCountries] = useState([]); // Dynamically populated countries

  const SHEET_ID = '1wz9w_KyTtN2FUoEg6tYQYzgGWJkASiDdcTceSHe-lSI'; // Replace with your Google Sheet ID
  const API_KEY = process.env.REACT_APP_GOOGLE_API_KEY;
  const RANGE = 'Calendar and Promo Codes'; // Replace with your sheet's range

  // Function to clean and transform data from Google Sheets
  const cleanData = (data) => {
    const cleanedFestivals = [];
    let currentFestival = null;

    data.forEach((row) => {
      const isHeader =
        row[0]?.toLowerCase() === 'festival' ||
        row[1]?.toLowerCase() === 'when' ||
        row[2]?.toLowerCase() === 'location';

      if (isHeader || !row.some((cell) => cell?.trim())) {
        return;
      }

      const name = row[0]?.trim();
      const date = row[1]?.trim();
      const location = row[2]?.trim() || 'Location not available';
      const website = row[3]?.trim();
      const promoCodes = row.slice(4).filter((code) => code?.trim());

      if (name || date) {
        if (currentFestival) {
          cleanedFestivals.push(currentFestival);
        }
        currentFestival = {
          name: name || 'Unnamed Festival',
          date: date || 'Unspecified Date',
          location,
          links: website ? [website] : [],
          promoCodes: [...promoCodes],
        };
      } else if (currentFestival) {
        if (website) {
          currentFestival.links.push(website);
        }
        currentFestival.promoCodes.push(...promoCodes);
      }
    });

    if (currentFestival) {
      cleanedFestivals.push(currentFestival);
    }

    return cleanedFestivals;
  };

  const fetchCountryFromGeocode = async (festival) => {
    const GEOCODE_API_URL = 'https://api.opencagedata.com/geocode/v1/json';
    const GEOCODE_API_KEY = process.env.REACT_APP_OPENCAGE_API_KEY;

    try {
      const response = await fetch(
        `${GEOCODE_API_URL}?q=${festival.location}&key=${GEOCODE_API_KEY}`
      );
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        const country = data.results[0].components.country;
        return country || 'Unknown';
      }
    } catch (error) {
      console.error(`Error fetching country for location: ${festival.location}`, error);
    }
    return 'Unknown';
  };

  // Fetch festival data and dynamically populate countries
  useEffect(() => {
    const fetchFestivals = async () => {
      try {
        const response = await fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}?key=${API_KEY}`
        );
        const data = await response.json();
        console.log('Raw Data:', data.values);
        if (data.values) {
          const cleanedData = cleanData(data.values);

          // Fetch countries dynamically from geocoded data
          const countryPromises = cleanedData.map(async (festival) => {
            const country = await fetchCountryFromGeocode(festival);
            festival.country = country; // Append the country to each festival
            return country;
          });

          const resolvedCountries = await Promise.all(countryPromises);
          const uniqueCountries = [...new Set(resolvedCountries)].sort(); // Unique and sorted
          setCountries(uniqueCountries);

          setFestivals(cleanedData);
          setFilteredFestivals(cleanedData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setFestivals([]);
        setFilteredFestivals([]);
        setCountries([]);
      }
    };

    fetchFestivals();
  }, [API_KEY]);

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
      filtered = filtered.filter((festival) => {
        const festivalDate = new Date(festival.date);
        if (!isNaN(festivalDate)) {
          return festivalDate.getMonth() + 1 === parseInt(filter.month);
        }
        return false;
      });
    }

    if (filter.country) {
      filtered = filtered.filter((festival) => festival.country?.toLowerCase() === filter.country.toLowerCase());
    }

    if (filter.type) {
      filtered = filtered.filter((festival) => festival.type?.toLowerCase() === filter.type.toLowerCase());
    }

    if (filter.name) {
      filtered = filtered.filter((festival) =>
        festival.name.toLowerCase().includes(filter.name.toLowerCase())
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

        <FormControl variant="outlined" style={{ minWidth: 200 }}>
          <InputLabel>Month</InputLabel>
          <Select
            value={filter.month}
            onChange={handleFilterChange}
            label="Month"
            name="month"
          >
            <MenuItem value="">All</MenuItem>
            {Array.from({ length: 12 }, (_, i) => (
              <MenuItem value={i + 1} key={i}>
                {new Date(0, i).toLocaleString('default', { month: 'long' })}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl variant="outlined" style={{ minWidth: 200 }}>
          <InputLabel>Country</InputLabel>
          <Select
            value={filter.country}
            onChange={handleFilterChange}
            label="Country"
            name="country"
          >
            <MenuItem value="">All</MenuItem>
            {countries.map((country, index) => (
              <MenuItem value={country} key={index}>
                {country}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl variant="outlined" style={{ minWidth: 200 }}>
          <InputLabel>Type</InputLabel>
          <Select
            value={filter.type}
            onChange={handleFilterChange}
            label="Type"
            name="type"
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="Bachata">Bachata</MenuItem>
            <MenuItem value="Salsa">Salsa</MenuItem>
            <MenuItem value="Kizomba">Kizomba</MenuItem>
          </Select>
        </FormControl>

        <TextField
          variant="outlined"
          label="Search by Name"
          name="name"
          value={filter.name}
          onChange={handleFilterChange}
          style={{ minWidth: 200 }}
        />
      </Box>

      <MapComponent festivals={filteredFestivals} />

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
