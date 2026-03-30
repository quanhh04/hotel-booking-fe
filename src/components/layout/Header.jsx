import { useCallback, useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import Container from "../ui/Container";
import Button from "../ui/Button";
import { useAuth } from "../../contexts/AuthContext";
import { notificationApi } from "../../api/notificationApi";
import { formatDateTime } from "../../utils/format";

function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState([]);
  const [unread, setUnread] = useState(0);
  const ref = useRef(null);

  const fetch = useCallback(async () => {
    try {
      const res = await notificationApi.getNotifications(1, 10);
      setNotifs(res.notifications || []);
      setUnread(res.unread_count || 0);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { fetch(); const t = setInterval(fetch, 30000); return () => clearInterval(t); }, [fetch]);

  useEffect(() => {
    function onClick(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  async function markAllRead() {
    try { await notificationApi.markAllAsRead(); fetch(); } catch { /* ignore */ }
  }

  async function markRead(id) {
    try { await notificationApi.markAsRead(id); fetch(); } catch { /* ignore */ }
  }

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(v => !v)} className="relative p-2 rounded-md hover:bg-white/10 transition">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#febb02]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
        {unread > 0 && <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center">{unread > 9 ? "9+" : unread}</span>}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-80 rounded-lg bg-white shadow-xl border border-slate-200 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 border-b bg-slate-50">
            <span className="text-sm font-semibold text-slate-900">Thông báo</span>
            {unread > 0 && <button onClick={markAllRead} className="text-xs text-[#0071c2] hover:underline">Đọc tất cả</button>}
          </div>
          <div className="max-h-72 overflow-y-auto">
            {notifs.length === 0 ? (
              <div className="p-4 text-center text-sm text-slate-500">Không có thông báo</div>
            ) : notifs.map(n => (
              <div key={n.id} onClick={() => !n.is_read && markRead(n.id)}
                className={`px-3 py-2.5 border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition ${!n.is_read ? "bg-blue-50/50" : ""}`}>
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

export default function Header() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const returnTo = encodeURIComponent(location.pathname + location.search);

  return (
    <header className="bg-[#003580] text-white">
      <Container className="py-3">
        <div className="flex items-center justify-between gap-3">
          <Link to="/" className="text-lg font-extrabold tracking-wide">
            Booking<span className="text-[#febb02]">VN</span>
          </Link>

          <nav className="hidden md:flex items-center gap-2">
            <NavLink to="/" className={({ isActive }) => `px-3 py-2 rounded-md text-sm font-semibold ${isActive ? "bg-white/10" : "hover:bg-white/10"}`}>Lưu trú</NavLink>
            <a href="#" className="px-3 py-2 rounded-md text-sm font-semibold hover:bg-white/10">Chuyến bay</a>
            <a href="#" className="px-3 py-2 rounded-md text-sm font-semibold hover:bg-white/10">Thuê xe</a>
          </nav>

          <div className="flex items-center gap-2">
            {!user ? (
              <>
                <Link to={`/register?returnTo=${returnTo}`}><Button variant="secondary" className="bg-white text-[#003580] border-white">Đăng ký</Button></Link>
                <Link to={`/login?returnTo=${returnTo}`}><Button variant="secondary" className="bg-white text-[#003580] border-white">Đăng nhập</Button></Link>
              </>
            ) : (
              <>
                <span className="hidden md:inline text-sm text-white/90">Xin chào, <b>{user.display_name || user.email}</b></span>
                <NotificationBell />
                <Link to="/me/bookings"><Button variant="secondary" className="bg-white text-[#003580] border-white">Đặt phòng của tôi</Button></Link>
                <Link to="/me/profile"><Button variant="secondary" className="bg-white/10 text-white border-white/20 hover:bg-white/20">Tài khoản</Button></Link>
                {user.role === "admin" && <Link to="/admin"><Button variant="secondary" className="bg-[#febb02] text-[#003580] border-[#febb02]">Admin</Button></Link>}
                <Button variant="secondary" className="bg-white text-[#003580] border-white" onClick={logout}>Đăng xuất</Button>
              </>
            )}
          </div>
        </div>
      </Container>
    </header>
  );
}
