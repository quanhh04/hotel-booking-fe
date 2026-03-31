import { useState, useEffect } from 'react';
import { bookingApi } from '../api/bookingApi';

export function useBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function fetchBookings() {
      setLoading(true);
      setError(null);
      try {
        const result = await bookingApi.getMyBookings();
        if (!cancelled) setBookings(Array.isArray(result) ? result : result.bookings || []);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Đã có lỗi xảy ra');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchBookings();
    return () => { cancelled = true; };
  }, [refreshKey]);

  function refetch() { setRefreshKey((k) => k + 1); }

  return { bookings, loading, error, refetch };
}
