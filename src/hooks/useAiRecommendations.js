import { useState, useEffect, useCallback } from 'react';
import { aiApi } from '../api/aiApi';

export function useAiRecommendations(params) {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await aiApi.getRecommendations(params);
      setRooms(Array.isArray(res) ? res : []);
    } catch (err) {
      setError(err.message || 'Không thể tải gợi ý');
    } finally {
      setLoading(false);
    }
  }, [params?.guests, params?.max_price, params?.amenities, params?.limit]);

  useEffect(() => { fetch(); }, [fetch]);

  return { rooms, loading, error, refetch: fetch };
}

export function useAiTrending(days = 7) {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await aiApi.getTrending(days);
      setRooms(Array.isArray(res) ? res : []);
    } catch (err) {
      setError(err.message || 'Không thể tải phòng trending');
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => { fetch(); }, [fetch]);

  return { rooms, loading, error, refetch: fetch };
}

export function useAiHistoryBased(enabled = true) {
  const [data, setData] = useState({ recommendations: [], message: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError(null);
    try {
      const res = await aiApi.getHistoryBased();
      setData(res);
    } catch (err) {
      setError(err.message || 'Không thể tải gợi ý');
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => { fetch(); }, [fetch]);

  return { ...data, loading, error, refetch: fetch };
}
