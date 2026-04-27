import { useFetch } from './useFetch';
import { hotelApi } from '../api/hotelApi';

/**
 * Lấy danh sách khách sạn theo filter.
 * BE trả: { hotels: [...], total: number }
 *
 * Filters là object → JSON.stringify để useEffect biết khi nào filters đổi
 * (mảng/object so sánh tham chiếu sẽ luôn "khác", JSON hoá rồi so chuỗi thì chuẩn).
 */
export function useHotels(filters) {
  const key = JSON.stringify(filters);

  const { data, loading, error, refetch } = useFetch(
    () => hotelApi.getHotels(filters),
    [key]
  );

  return {
    hotels: data?.hotels || [],
    total: data?.total || 0,
    loading,
    error,
    refetch,
  };
}
