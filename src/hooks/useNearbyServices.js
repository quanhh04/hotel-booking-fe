import { useCallback, useEffect, useState } from 'react';
import { hotelApi } from '../api/hotelApi';

/**
 * Hook lấy dịch vụ lân cận khách sạn.
 * @param {number} hotelId - ID khách sạn
 */
export function useNearbyServices(hotelId) {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);

  const fetchServices = useCallback(async (category) => {
    if (!hotelId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await hotelApi.getNearbyServices(hotelId, { category: category || undefined });
      setServices(res.services || []);
      setCategories(res.categories || []);
    } catch (err) {
      setError(err.message || 'Không thể tải dịch vụ');
      setServices([]);
    } finally {
      setLoading(false);
    }
  }, [hotelId]);

  useEffect(() => {
    fetchServices(activeCategory);
  }, [fetchServices, activeCategory]);

  const selectCategory = useCallback((cat) => {
    setActiveCategory(cat === activeCategory ? null : cat);
  }, [activeCategory]);

  return { services, categories, loading, error, activeCategory, selectCategory };
}
