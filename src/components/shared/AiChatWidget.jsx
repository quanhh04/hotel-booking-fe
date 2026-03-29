import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAiChat } from "../../hooks/useAiChat";
import { formatVND } from "../../utils/format";

function RoomCard({ room }) {
  return (
    <Link
      to={`/hotels/${room.hotel_id || ""}`}
      className="block rounded-lg border border-slate-200 p-2 mt-1 hover:bg-slate-50 transition text-left"
    >
      <div className="font-semibold text-slate-900 text-xs">{room.room_name || room.name}</div>
      <div className="text-xs text-slate-600">{room.hotel_name}</div>
      <div className="text-xs text-slate-500 mt-1">
        {room.price_per_night ? formatVND(room.price_per_night) + "/đêm" : ""}
        {room.max_guests ? ` • ${room.max_guests} khách` : ""}
      </div>
    </Link>
  );
}

export default function AiChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const { messages, loading, send, clear } = useAiChat();
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  function onSubmit(e) {
    e.preventDefault();
    if (!input.trim() || loading) return;
    send(input.trim());
    setInput("");
  }

  return (
    <>
      {/* FAB */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-5 right-5 z-50 h-14 w-14 rounded-full bg-[#003580] text-white shadow-lg hover:bg-[#00256b] transition flex items-center justify-center"
        aria-label="Mở trợ lý AI"
      >
        {open ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 right-5 z-50 w-80 sm:w-96 rounded-xl bg-white shadow-2xl border border-slate-200 flex flex-col" style={{ maxHeight: "70vh" }}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-[#003580] rounded-t-xl">
            <div>
              <div className="text-white font-semibold text-sm">Trợ lý AI</div>
              <div className="text-white/70 text-xs">Hỏi về khách sạn, phòng, giá...</div>
            </div>
            <button onClick={clear} className="text-white/60 hover:text-white text-xs px-2 py-1 rounded hover:bg-white/10">
              Xoá chat
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3" style={{ minHeight: "200px" }}>
            {messages.length === 0 && (
              <div className="text-center text-slate-400 text-sm py-8">
                Xin chào! Tôi có thể giúp bạn tìm phòng, so sánh giá, hoặc trả lời câu hỏi về khách sạn.
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                  msg.role === "user"
                    ? "bg-[#003580] text-white"
                    : "bg-slate-100 text-slate-800"
                }`}>
                  <div className="whitespace-pre-line">{msg.content}</div>
                  {msg.rooms?.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {msg.rooms.slice(0, 5).map((r, j) => (
                        <RoomCard key={r.room_id || j} room={r} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-slate-100 rounded-lg px-3 py-2 text-sm text-slate-500">
                  <span className="inline-flex gap-1">
                    <span className="animate-bounce">●</span>
                    <span className="animate-bounce" style={{ animationDelay: "0.1s" }}>●</span>
                    <span className="animate-bounce" style={{ animationDelay: "0.2s" }}>●</span>
                  </span>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <form onSubmit={onSubmit} className="border-t border-slate-200 px-3 py-2 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Nhập tin nhắn..."
              className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#0071c2] focus:ring-1 focus:ring-[#0071c2]/20"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="rounded-lg bg-[#003580] px-3 py-2 text-white text-sm font-semibold hover:bg-[#00256b] disabled:opacity-50 transition"
            >
              Gửi
            </button>
          </form>
        </div>
      )}
    </>
  );
}
