import { useFetch } from './useFetch';
import { hotelApi } from '../api/hotelApi';

/**
 * Lấy thông tin chi tiết 1 khách sạn + danh sách phòng của nó.
 * Gọi 2 API song song bằng Promise.all để load nhanh hơn.
 */
export function useHotelDetail(id) {
  const { data, loading, error } = useFetch(
    () => Promise.all([
      hotelApi.getHotelDetail(id),
      hotelApi.getHotelRooms(id),
    ]).then(([hotel, roomsRes]) => ({
      hotel,
      // BE có thể trả { rooms: [...] } hoặc trực tiếp [...]
      rooms: roomsRes?.rooms || roomsRes || [],
    })),
    [id]
  );

  return {
    hotel: data?.hotel || null,
    rooms: data?.rooms || [],
    loading,
    error,
  };
}
