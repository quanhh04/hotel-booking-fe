import { useFetch } from './useFetch';
import { aiApi } from '../api/aiApi';

/**
 * Lấy danh sách phòng AI gợi ý dựa trên params (guests, max_price, amenities,...).
 * BE trả thẳng mảng phòng.
 */
export function useAiRecommendations(params) {
  const key = JSON.stringify(params);

  const { data, loading, error } = useFetch(
    () => aiApi.getRecommendations(params),
    [key]
  );

  return {
    rooms: Array.isArray(data) ? data : [],
    loading,
    error,
  };
}
