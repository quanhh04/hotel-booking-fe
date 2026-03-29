import { useState, useEffect, useCallback, useRef } from 'react';
import { hotelApi } from '../api/hotelApi';

export function useHotels(filters) {
  const [hotels, setHotels] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const filtersRef = useRef(filters);

  // Track filter changes by serializing
  const filtersKey = JSON.stringify(filters);

  const fetchHotels = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await hotelApi.getHotels(filtersRef.current);
      setHotels(result.hotels || []);
      setTotal(result.total || 0);
    } catch (err) {
      setError(err.message || 'Đã có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  }, [filtersKey]);

  useEffect(() => {
    filtersRef.current = filters;
  }, [filtersKey]);

  useEffect(() => {
    fetchHotels();
  }, [fetchHotels]);

  return { hotels, total, loading, error, refetch: fetchHotels };
}
