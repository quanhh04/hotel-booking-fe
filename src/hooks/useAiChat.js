import { useCallback, useRef, useState } from 'react';
import { aiApi } from '../api/aiApi';

export function useAiChat() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(() => crypto.randomUUID());

  const latestRequestRef = useRef(0);
  const mountedRef = useRef(true);
  const lastTextRef = useRef('');

  const send = useCallback(async (text) => {
    if (!text.trim() || loading) return;

    lastTextRef.current = text;
    const requestId = ++latestRequestRef.current;

    const userMsg = { role: 'user', content: text, ts: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await aiApi.chat(text, sessionId);

      if (requestId !== latestRequestRef.current) return;
      if (!mountedRef.current) return;

      const botMsg = {
        role: 'bot',
        content: res.reply || res.message || 'Xin lỗi, tôi không hiểu.',
        rooms: Array.isArray(res.results) ? res.results : [],
        booking: res.booking || null,
        intent: res.intent || null,
        ts: Date.now(),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      if (requestId !== latestRequestRef.current) return;
      if (!mountedRef.current) return;

      setMessages((prev) => [
        ...prev,
        {
          role: 'bot',
          content: err.message || 'Không thể kết nối AI. Vui lòng thử lại.',
          isError: true,
          ts: Date.now(),
        },
      ]);
    } finally {
      if (requestId === latestRequestRef.current && mountedRef.current) {
        setLoading(false);
      }
    }
  }, [loading, sessionId]);

  const retry = useCallback(() => {
    if (!lastTextRef.current) return;
    setMessages((prev) => {
      const copy = [...prev];
      if (copy.length > 0 && copy[copy.length - 1].isError) copy.pop();
      if (copy.length > 0 && copy[copy.length - 1].role === 'user') copy.pop();
      return copy;
    });
    setLoading(false);
    setTimeout(() => send(lastTextRef.current), 0);
  }, [send]);

  const clear = useCallback(() => {
    setMessages([]);
    setSessionId(crypto.randomUUID());
    lastTextRef.current = '';
    latestRequestRef.current = 0;
  }, []);

  const setMounted = useCallback((v) => { mountedRef.current = v; }, []);

  return { messages, loading, send, clear, retry, setMounted };
}
