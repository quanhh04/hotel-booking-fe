import { useState, useEffect, useCallback } from 'react';
import { hotelApi } from '../api/hotelApi';

export function useHotelDetail(id) {
  const [hotel, setHotel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDetail = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const [hotelData, roomsData] = await Promise.all([
        hotelApi.getHotelDetail(id),
        hotelApi.getHotelRooms(id),
      ]);
      setHotel(hotelData);
      setRooms(roomsData.rooms || roomsData || []);
    } catch (err) {
      setError(err.message || 'Đã có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  return { hotel, rooms, loading, error };
}
