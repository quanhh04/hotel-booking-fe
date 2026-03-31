import { useState, useEffect } from 'react';
import { reviewApi } from '../api/reviewApi';

export function useReviews(hotelId) {
  const [reviews, setReviews] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!hotelId) return;
    let cancelled = false;

    async function fetchReviews() {
      setLoading(true);
      setError(null);
      try {
        const result = await reviewApi.getHotelReviews(hotelId);
        if (!cancelled) {
          setReviews(result.reviews || []);
          setTotal(result.total || 0);
        }
      } catch (err) {
        if (!cancelled) setError(err.message || 'Đã có lỗi xảy ra');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchReviews();
    return () => { cancelled = true; };
  }, [hotelId, refreshKey]);

  function refetch() { setRefreshKey((k) => k + 1); }

  return { reviews, total, loading, error, refetch };
}
