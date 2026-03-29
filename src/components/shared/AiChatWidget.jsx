import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAiChat } from "../../hooks/useAiChat";
import { useAuth } from "../../contexts/AuthContext";
import { formatVND } from "../../utils/format";

const QUICK_REPLIES = [
  "Tìm phòng ở Đà Nẵng",
  "Phòng giá dưới 2 triệu",
  "Khách sạn 5 sao Phú Quốc",
  "Gợi ý phòng cho 2 người",
];

function RoomCard({ room }) {
  return (
    <Link
      to={`/hotels/${room.hotel_id || ""}`}
      className="flex items-center gap-2 rounded-lg border border-slate-200 p-2 mt-1 hover:border-[#0071c2] hover:bg-blue-50/30 transition text-left group"
    >
      <div className="h-10 w-10 rounded-md bg-[#003580]/10 flex items-center justify-center shrink-0">
        <span className="text-base">🏨</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-slate-900 text-xs truncate group-hover:text-[#0071c2]">{room.room_name || room.name}</div>
        <div className="text-xs text-slate-500 truncate">{room.hotel_name}</div>
        <div className="text-xs text-slate-600 mt-0.5">
          {room.price_per_night ? <span className="font-semibold">{formatVND(room.price_per_night)}</span> : ""}
          {room.max_guests ? <span className="text-slate-400"> • {room.max_guests} khách</span> : ""}
        </div>
      </div>
      <svg className="h-4 w-4 text-slate-300 group-hover:text-[#0071c2] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
    </Link>
  );
}

function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="flex items-center gap-2 bg-slate-100 rounded-2xl rounded-bl-md px-4 py-2.5">
        <div className="flex gap-1">
          <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "0ms" }} />
          <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "150ms" }} />
          <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    </div>
  );
}

export default function AiChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const { user } = useAuth();
  const { messages, loading, send, clear } = useAiChat();
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  function onSubmit(e) {
    e.preventDefault();
    if (!input.trim() || loading) return;
    send(input.trim());
    setInput("");
  }

  function onQuickReply(text) {
    if (loading) return;
    send(text);
  }

  return (
    <>
      {/* FAB */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={`fixed bottom-5 right-5 z-50 h-14 w-14 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center ${
          open
            ? "bg-slate-700 hover:bg-slate-800 rotate-0"
            : "bg-gradient-to-br from-[#003580] to-[#0071c2] hover:from-[#00256b] hover:to-[#005fa3] animate-pulse-slow"
        }`}
        aria-label={open ? "Đóng trợ lý AI" : "Mở trợ lý AI"}
      >
        {open ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
            {messages.length === 0 && (
              <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-[#febb02] border-2 border-white" />
            )}
          </>
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 right-5 z-50 w-[340px] sm:w-[400px] rounded-2xl bg-white shadow-2xl border border-slate-200/80 flex flex-col overflow-hidden" style={{ maxHeight: "75vh" }}>
          {/* Header */}
          <div className="relative px-5 py-4 bg-gradient-to-r from-[#003580] to-[#0071c2]">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-lg">🤖</span>
              </div>
              <div className="flex-1">
                <div className="text-white font-semibold text-sm">Trợ lý BookingVN</div>
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-white/70 text-xs">Online • Powered by AI</span>
                </div>
              </div>
              <button onClick={clear} className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-lg transition" title="Xoá lịch sử chat">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" /></svg>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-slate-50/50" style={{ minHeight: "250px" }}>
            {messages.length === 0 && (
              <div className="text-center py-6">
                <div className="text-3xl mb-3">👋</div>
                <div className="text-sm font-semibold text-slate-700">Xin chào{user ? ` ${user.display_name || ''}` : ''}!</div>
                <div className="text-xs text-slate-500 mt-1 max-w-[240px] mx-auto">
                  Tôi có thể giúp bạn tìm phòng, so sánh giá, hoặc đặt phòng trực tiếp.
                </div>
                {/* Quick replies */}
                <div className="mt-4 flex flex-wrap gap-1.5 justify-center">
                  {QUICK_REPLIES.map((q) => (
                    <button
                      key={q}
                      onClick={() => onQuickReply(q)}
                      className="text-xs px-3 py-1.5 rounded-full border border-[#0071c2]/30 text-[#0071c2] hover:bg-[#0071c2] hover:text-white transition"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}>
                {msg.role === "bot" && (
                  <div className="h-6 w-6 rounded-full bg-[#003580] flex items-center justify-center shrink-0 mr-2 mt-1">
                    <span className="text-xs text-white">AI</span>
                  </div>
                )}
                <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-[#003580] text-white rounded-br-md"
                    : "bg-white text-slate-800 shadow-sm border border-slate-100 rounded-bl-md"
                }`}>
                  <div className="whitespace-pre-line">{msg.content}</div>
                  {msg.booking && (
                    <Link
                      to="/me/bookings"
                      className="flex items-center gap-2 mt-2 rounded-lg border border-green-200 bg-green-50 p-2.5 text-xs text-green-800 hover:bg-green-100 transition"
                    >
                      <span className="text-base">✅</span>
                      <div>
                        <div className="font-semibold">Đặt phòng thành công — Mã #{msg.booking.id}</div>
                        <div className="text-green-600 mt-0.5">Xem lịch sử đặt phòng →</div>
                      </div>
                    </Link>
                  )}
                  {msg.rooms?.length > 0 && (
                    <div className="mt-2 space-y-1.5">
                      {msg.rooms.slice(0, 5).map((r, j) => (
                        <RoomCard key={r.room_id || j} room={r} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && <TypingIndicator />}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="border-t border-slate-200 bg-white px-3 py-3">
            <form onSubmit={onSubmit} className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Nhập tin nhắn..."
                className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-[#0071c2] focus:bg-white focus:ring-2 focus:ring-[#0071c2]/10 transition placeholder:text-slate-400"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="h-10 w-10 rounded-xl flex items-center justify-center transition-all duration-200 shrink-0 active:scale-95 bg-[#003580] text-white hover:bg-[#00256b] disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" /></svg>
              </button>
            </form>
            <div className="text-center mt-1.5">
              <span className="text-[10px] text-slate-400">Powered by Google Gemini</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
