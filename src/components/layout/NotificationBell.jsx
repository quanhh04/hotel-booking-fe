import { useEffect, useRef, useState } from "react";
import { notificationApi } from "../../api/notificationApi";
import { formatDateTime } from "../../utils/format";

/**
 * Chuông thông báo ở header.
 *
 * Tính năng:
 *   - Tự fetch danh sách thông báo + số lượng chưa đọc khi mount.
 *   - Polling mỗi 30s để cập nhật thông báo mới.
 *   - Click ra ngoài → đóng popup (dùng ref + listener mousedown).
 *   - Click 1 thông báo chưa đọc → mark-as-read.
 *   - Nút "Đọc tất cả" → mark-all-as-read.
 */
export default function NotificationBell() {
  const [open, setOpen]             = useState(false);
  const [notifs, setNotifs]         = useState([]);
  const [unread, setUnread]         = useState(0);
  const [refreshKey, setRefreshKey] = useState(0); // tăng để buộc fetch lại
  const ref = useRef(null);

  // Fetch + polling 30s. refreshKey thay đổi → fetch ngay.
  useEffect(() => {
    let cancelled = false;

    async function fetchNotifs() {
      try {
        const res = await notificationApi.getNotifications(1, 10);
        if (!cancelled) {
          setNotifs(res.notifications || []);
          setUnread(res.unread_count || 0);
        }
      } catch { /* lỗi không quan trọng — bỏ qua */ }
    }

    fetchNotifs();
    const timer = setInterval(fetchNotifs, 30000);
    return () => { cancelled = true; clearInterval(timer); };
  }, [refreshKey]);

  // Click ra ngoài popup → đóng
  useEffect(() => {
    function onClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  async function markAllRead() {
    try {
      await notificationApi.markAllAsRead();
      setRefreshKey((k) => k + 1);
    } catch { /* ignore */ }
  }

  async function markRead(id) {
    try {
      await notificationApi.markAsRead(id);
      setRefreshKey((k) => k + 1);
    } catch { /* ignore */ }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 rounded-md hover:bg-white/10 transition"
      >
        {/* Icon chuông */}
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#febb02]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {/* Badge số chưa đọc — hiển thị "9+" nếu > 9 */}
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-80 rounded-lg bg-white shadow-xl border border-slate-200 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 border-b bg-slate-50">
            <span className="text-sm font-semibold text-slate-900">Thông báo</span>
            {unread > 0 && (
              <button onClick={markAllRead} className="text-xs text-[#0071c2] hover:underline">
                Đọc tất cả
              </button>
            )}
          </div>
          <div className="max-h-72 overflow-y-auto">
            {notifs.length === 0 ? (
              <div className="p-4 text-center text-sm text-slate-500">Không có thông báo</div>
            ) : notifs.map((n) => (
              <div
                key={n.id}
                onClick={() => !n.is_read && markRead(n.id)}
                className={`px-3 py-2.5 border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition ${!n.is_read ? "bg-blue-50/50" : ""}`}
              >
                <div className="text-sm text-slate-800">{n.message || n.title}</div>
                <div className="text-xs text-slate-400 mt-0.5">{formatDateTime(n.created_at)}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
