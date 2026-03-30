import { useCallback, useEffect, useState } from "react";
import Card from "../ui/Card";
import Spinner from "../ui/Spinner";
import { adminApi } from "../../api/adminApi";
import { formatVND } from "../../utils/format";

function StatCard({ label, value, icon }) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <div className="text-2xl">{icon}</div>
        <div>
          <div className="text-xs text-slate-500">{label}</div>
          <div className="text-xl font-extrabold text-slate-900">{value}</div>
        </div>
      </div>
    </Card>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [topHotels, setTopHotels] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const [s, h] = await Promise.all([
        adminApi.getStats(),
        adminApi.getTopHotels("revenue", 5),
      ]);
      setStats(s);
      setTopHotels(Array.isArray(h) ? h : []);
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  if (loading) return <Spinner text="Đang tải dashboard..." />;

  return (
    <div>
      <h1 className="text-xl font-extrabold text-slate-900 mb-4">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <StatCard icon="📋" label="Tổng booking" value={stats?.total_bookings || 0} />
        <StatCard icon="💰" label="Doanh thu" value={formatVND(stats?.total_revenue || 0)} />
        <StatCard icon="🏨" label="Khách sạn" value={stats?.total_hotels || 0} />
        <StatCard icon="🛏️" label="Loại phòng" value={stats?.total_rooms || 0} />
        <StatCard icon="👥" label="Người dùng" value={stats?.total_users || 0} />
      </div>

      {/* Top Hotels */}
      <Card className="p-4 mt-4">
        <h2 className="font-extrabold text-slate-900 mb-3">Top khách sạn theo doanh thu</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500 border-b">
              <th className="py-2">#</th>
              <th className="py-2">Khách sạn</th>
              <th className="py-2">Địa chỉ</th>
              <th className="py-2 text-right">Bookings</th>
              <th className="py-2 text-right">Doanh thu</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {topHotels.map((h, i) => (
              <tr key={h.id}>
                <td className="py-2 text-slate-500">{i + 1}</td>
                <td className="py-2 font-semibold text-slate-900">{h.name}</td>
                <td className="py-2 text-slate-600">{h.address}</td>
                <td className="py-2 text-right">{h.booking_count}</td>
                <td className="py-2 text-right font-semibold">{formatVND(h.revenue)}</td>
              </tr>
            ))}
            {topHotels.length === 0 && (
              <tr><td colSpan={5} className="py-4 text-center text-slate-500">Chưa có dữ liệu</td></tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
