// src/components/FilterBar.js
import React from 'react';
import { Box, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

const FilterBar = ({ filter, onFilterChange, countries }) => {
  return (
    <Box display="flex" justifyContent="center" gap={2} marginBottom={4}>
      {/* Region Filter */}
      <FormControl variant="outlined" style={{ minWidth: 200 }}>
        <InputLabel>Region</InputLabel>
        <Select value={filter.region} onChange={onFilterChange} label="Region" name="region">
          <MenuItem value="">All</MenuItem>
          <MenuItem value="Europe">Europe</MenuItem>
          <MenuItem value="Americas">Americas</MenuItem>
          <MenuItem value="Asia">Asia</MenuItem>
          <MenuItem value="Africa">Africa</MenuItem>
          <MenuItem value="Oceania">Oceania</MenuItem>
        </Select>
      </FormControl>

      {/* Month Filter */}
      <FormControl variant="outlined" style={{ minWidth: 200 }}>
        <InputLabel>Month</InputLabel>
        <Select value={filter.month} onChange={onFilterChange} label="Month" name="month">
          <MenuItem value="">All</MenuItem>
          {Array.from({ length: 12 }, (_, i) => (
            <MenuItem value={i + 1} key={i}>
              {new Date(0, i).toLocaleString('default', { month: 'long' })}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Country Filter */}
      <FormControl variant="outlined" style={{ minWidth: 200 }}>
        <InputLabel>Country</InputLabel>
        <Select value={filter.country} onChange={onFilterChange} label="Country" name="country">
          <MenuItem value="">All</MenuItem>
          {countries.map((country, index) => (
            <MenuItem value={country} key={index}>
              {country}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Type Filter */}
      <FormControl variant="outlined" style={{ minWidth: 200 }}>
        <InputLabel>Type</InputLabel>
        <Select value={filter.type} onChange={onFilterChange} label="Type" name="type">
          <MenuItem value="">All</MenuItem>
          <MenuItem value="Bachata">Bachata</MenuItem>
          <MenuItem value="Salsa">Salsa</MenuItem>
          <MenuItem value="Kizomba">Kizomba</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
};

export default FilterBar;
