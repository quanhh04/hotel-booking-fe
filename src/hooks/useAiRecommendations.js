import { useState, useEffect } from 'react';
import { aiApi } from '../api/aiApi';

export function useAiRecommendations(params) {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const depsKey = JSON.stringify([params?.guests, params?.max_price, params?.amenities, params?.limit]);

  useEffect(() => {
    let cancelled = false;

    async function fetch() {
      setLoading(true);
      setError(null);
      try {
        const res = await aiApi.getRecommendations(params);
        if (!cancelled) setRooms(Array.isArray(res) ? res : []);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Không thể tải gợi ý');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetch();
    return () => { cancelled = true; };
  }, [depsKey]);

  return { rooms, loading, error };
}

export function useAiTrending(days = 7) {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetch() {
      setLoading(true);
      setError(null);
      try {
        const res = await aiApi.getTrending(days);
        if (!cancelled) setRooms(Array.isArray(res) ? res : []);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Không thể tải phòng trending');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetch();
    return () => { cancelled = true; };
  }, [days]);

  return { rooms, loading, error };
}

export function useAiHistoryBased(enabled = true) {
  const [data, setData] = useState({ recommendations: [], message: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;

    async function fetch() {
      setLoading(true);
      setError(null);
      try {
        const res = await aiApi.getHistoryBased();
        if (!cancelled) setData(res);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Không thể tải gợi ý');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetch();
    return () => { cancelled = true; };
  }, [enabled]);

  return { ...data, loading, error };
}
