import { useState, useEffect } from 'react';
import { hotelApi } from '../api/hotelApi';

export function useHotelDetail(id) {
  const [hotel, setHotel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    async function fetchDetail() {
      setLoading(true);
      setError(null);
      try {
        const [hotelData, roomsData] = await Promise.all([
          hotelApi.getHotelDetail(id),
          hotelApi.getHotelRooms(id),
        ]);
        if (!cancelled) {
          setHotel(hotelData);
          setRooms(roomsData.rooms || roomsData || []);
        }
      } catch (err) {
        if (!cancelled) setError(err.message || 'Đã có lỗi xảy ra');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchDetail();
    return () => { cancelled = true; };
  }, [id]);

  return { hotel, rooms, loading, error };
}
