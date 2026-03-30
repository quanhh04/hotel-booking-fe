import { Link, NavLink, Outlet, Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import Spinner from "../ui/Spinner";

const NAV = [
  { to: "/admin", label: "Dashboard", icon: "📊" },
  { to: "/admin/hotels", label: "Khách sạn", icon: "🏨" },
  { to: "/admin/rooms", label: "Phòng", icon: "🛏️" },
  { to: "/admin/bookings", label: "Đặt phòng", icon: "📋" },
  { to: "/admin/users", label: "Người dùng", icon: "👥" },
  { to: "/admin/cities", label: "Thành phố", icon: "🏙️" },
  { to: "/admin/payments", label: "Thanh toán", icon: "💳" },
];

export default function AdminLayout() {
  const { user, loading } = useAuth();

  if (loading) return <div className="flex items-center justify-center h-screen"><Spinner /></div>;
  if (!user || user.role !== "admin") return <Navigate to="/login" replace />;

  return (
    <div className="flex h-screen bg-slate-100">
      {/* Sidebar */}
      <aside className="w-56 bg-[#003580] text-white flex flex-col shrink-0">
        <Link to="/admin" className="px-4 py-4 text-lg font-extrabold border-b border-white/10">
          BookingVN Admin
        </Link>
        <nav className="flex-1 py-2">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.to === "/admin"}
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2.5 text-sm transition ${
                  isActive ? "bg-white/15 font-semibold" : "text-white/70 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              <span>{n.icon}</span> {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="px-4 py-3 border-t border-white/10 text-xs text-white/50">
          {user.email}
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}
