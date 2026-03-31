import { useState, useEffect } from 'react';
import { hotelApi } from '../api/hotelApi';

export function useHotels(filters) {
  const [hotels, setHotels] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Serialize filters để detect thay đổi
  const filtersKey = JSON.stringify(filters);

  useEffect(() => {
    let cancelled = false;

    async function fetchHotels() {
      setLoading(true);
      setError(null);
      try {
        const result = await hotelApi.getHotels(filters);
        if (!cancelled) {
          setHotels(result.hotels || []);
          setTotal(result.total || 0);
        }
      } catch (err) {
        if (!cancelled) setError(err.message || 'Đã có lỗi xảy ra');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchHotels();
    return () => { cancelled = true; };
  }, [filtersKey, refreshKey]);

  function refetch() { setRefreshKey((k) => k + 1); }

  return { hotels, total, loading, error, refetch };
}
