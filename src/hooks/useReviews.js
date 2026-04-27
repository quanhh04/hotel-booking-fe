import { useFetch } from './useFetch';
import { reviewApi } from '../api/reviewApi';

/**
 * Lấy danh sách review của 1 khách sạn.
 * BE trả: { reviews: [...], total: number }
 */
export function useReviews(hotelId) {
  const { data, loading, error, refetch } = useFetch(
    () => reviewApi.getHotelReviews(hotelId),
    [hotelId]
  );

  return {
    reviews: data?.reviews || [],
    total: data?.total || 0,
    loading,
    error,
    refetch,
  };
}
