import { useFetch } from './useFetch';
import { bookingApi } from '../api/bookingApi';

/**
 * Lấy danh sách booking của user đang đăng nhập.
 * BE có thể trả mảng [] hoặc object { bookings: [] } → chuẩn hoá về mảng.
 */
export function useBookings() {
  const { data, loading, error, refetch } = useFetch(
    () => bookingApi.getMyBookings(),
    []
  );

  const bookings = Array.isArray(data) ? data : data?.bookings || [];

  return { bookings, loading, error, refetch };
}
