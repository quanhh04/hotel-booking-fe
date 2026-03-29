import { useState, useEffect, useCallback } from 'react';
import { reviewApi } from '../api/reviewApi';

export function useReviews(hotelId) {
  const [reviews, setReviews] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReviews = useCallback(async () => {
    if (!hotelId) return;
    setLoading(true);
    setError(null);
    try {
      const result = await reviewApi.getHotelReviews(hotelId);
      setReviews(result.reviews || []);
      setTotal(result.total || 0);
    } catch (err) {
      setError(err.message || 'Đã có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  }, [hotelId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  return { reviews, total, loading, error, refetch: fetchReviews };
}
