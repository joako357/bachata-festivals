// src/hooks/useFestivalData.js
import { useState, useEffect } from 'react';

const SHEET_ID = '1wz9w_KyTtN2FUoEg6tYQYzgGWJkASiDdcTceSHe-lSI';
const API_KEY = process.env.REACT_APP_GOOGLE_API_KEY;
const RANGE = 'Calendar and Promo Codes';

const useFestivalData = () => {
  const [festivals, setFestivals] = useState([]);
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);

  const cleanData = (data) => {
    const cleanedFestivals = [];
    let currentFestival = null;

    data.forEach((row) => {
      const isHeader =
        row[0]?.toLowerCase() === 'festival' ||
        row[1]?.toLowerCase() === 'when' ||
        row[2]?.toLowerCase() === 'location';

      if (isHeader || !row.some((cell) => cell?.trim())) return;

      const name = row[0]?.trim();
      const date = row[1]?.trim();
      const location = row[2]?.trim() || 'Location not available';
      const website = row[3]?.trim();
      const promoCodes = row.slice(4).filter((code) => code?.trim());

      if (name || date) {
        if (currentFestival) cleanedFestivals.push(currentFestival);
        currentFestival = { name, date, location, links: [website], promoCodes };
      } else if (currentFestival) {
        if (website) currentFestival.links.push(website);
      }
    });

    if (currentFestival) cleanedFestivals.push(currentFestival);

    const uniqueCountries = [
      ...new Set(cleanedFestivals.map((festival) => festival.location.split(', ').pop())),
    ];
    setCountries(uniqueCountries);

    return cleanedFestivals;
  };

  useEffect(() => {
    const fetchFestivals = async () => {
      try {
        const response = await fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}?key=${API_KEY}`
        );
        const data = await response.json();
        const cleanedData = cleanData(data.values);
        setFestivals(cleanedData);
      } catch (error) {
        console.error('Error fetching festivals:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFestivals();
  }, []);

  return { festivals, countries, loading };
};

export default useFestivalData;
