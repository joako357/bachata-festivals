import React, { useState } from 'react';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import FilterBar from './components/FilterBar';
import FestivalCard from './components/FestivalCard';
import MapComponent from './MapComponent';
import useFestivalData from './hooks/useFestivalData';

const App = () => {
  const { festivals, countries } = useFestivalData();
console.log('Festivals:', festivals);
console.log('Countries:', countries);

  const [filter, setFilter] = useState({ region: '', month: '', country: '', type: '' });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter((prev) => ({ ...prev, [name]: value }));
  };

  const filteredFestivals = festivals.filter((festival) => {
    return (
      (!filter.region || festival.location.includes(filter.region)) &&
      (!filter.country || festival.location.includes(filter.country)) &&
      (!filter.month || festival.date.includes(filter.month))
    );
  });

  return (
    <Container>
      <Typography variant="h3" align="center" marginY={4}>
        Bachata Festival Finder
      </Typography>
      <FilterBar filter={filter} onFilterChange={handleFilterChange} countries={countries} />
      <MapComponent festivals={filteredFestivals} />
      <Grid container spacing={3}>
        {filteredFestivals.map((festival, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <FestivalCard festival={festival} />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default App;
