import { useState, useEffect } from 'react';
import api from '../api/axios';

const CACHE_KEY = 'autofix_locations';

export function useLocationsCache() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cached = sessionStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        setLocations(JSON.parse(cached));
        setLoading(false);
        return;
      } catch {
        sessionStorage.removeItem(CACHE_KEY);
      }
    }

    api.get('/locations')
      .then((res) => {
        setLocations(res.data);
        sessionStorage.setItem(CACHE_KEY, JSON.stringify(res.data));
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Failed to load locations');
      })
      .finally(() => setLoading(false));
  }, []);

  return { locations, loading, error };
}
