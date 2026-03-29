import { useCallback, useRef, useState } from 'react';
import { aiApi } from '../api/aiApi';

export function useAiChat() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const sessionRef = useRef(crypto.randomUUID());

  const send = useCallback(async (text) => {
    if (!text.trim()) return;

    const userMsg = { role: 'user', content: text, ts: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await aiApi.chat(text, sessionRef.current);
      const botMsg = {
        role: 'bot',
        content: res.reply || res.message || 'Xin lỗi, tôi không hiểu.',
        rooms: res.results || [],
        booking: res.booking || null,
        intent: res.intent || null,
        ts: Date.now(),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'bot', content: err.message || 'Không thể kết nối AI.', ts: Date.now() },
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    setMessages([]);
    sessionRef.current = crypto.randomUUID();
  }, []);

  return { messages, loading, send, clear };
}
