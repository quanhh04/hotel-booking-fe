import { useCallback, useEffect, useState } from "react";
import Card from "../ui/Card";
import Spinner from "../ui/Spinner";
import { adminApi } from "../../api/adminApi";

export default function AdminAiStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try { const res = await adminApi.getAiStats(); setStats(res); }
    catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  if (loading) return <Spinner text="Đang tải AI stats..." />;
  if (!stats) return <Card className="p-6 text-center text-slate-500">Không có dữ liệu</Card>;

  return (
    <div>
      <h1 className="text-xl font-extrabold text-slate-900 mb-4">AI Analytics</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <Card className="p-4">
          <div className="text-xs text-slate-500">Tổng chat sessions</div>
          <div className="text-2xl font-extrabold text-slate-900">{stats.total_sessions || stats.totalSessions || 0}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-slate-500">Tổng messages</div>
          <div className="text-2xl font-extrabold text-slate-900">{stats.total_messages || stats.totalMessages || 0}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-slate-500">Room clicks</div>
          <div className="text-2xl font-extrabold text-slate-900">{stats.total_clicks || stats.totalClicks || 0}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-slate-500">Amenity queries</div>
          <div className="text-2xl font-extrabold text-slate-900">{stats.total_amenity_queries || 0}</div>
        </Card>
      </div>

      {/* Top Intents */}
      {stats.top_intents && stats.top_intents.length > 0 && (
        <Card className="p-4 mb-4">
          <h2 className="font-semibold text-slate-900 mb-3">Top Intents</h2>
          <div className="space-y-2">
            {stats.top_intents.map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-sm text-slate-700">{item.intent || item.name}</span>
                <span className="text-sm font-semibold text-slate-900">{item.count}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Top Rooms Clicked */}
      {stats.top_rooms && stats.top_rooms.length > 0 && (
        <Card className="p-4 mb-4">
          <h2 className="font-semibold text-slate-900 mb-3">Top phòng được click</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b">
                <th className="py-2">Phòng</th>
                <th className="py-2">Khách sạn</th>
                <th className="py-2 text-right">Clicks</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {stats.top_rooms.map((r, i) => (
                <tr key={i}>
                  <td className="py-2 font-semibold text-slate-900">{r.room_name}</td>
                  <td className="py-2 text-slate-600">{r.hotel_name}</td>
                  <td className="py-2 text-right">{r.click_count || r.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* Top Amenities */}
      {stats.top_amenities && stats.top_amenities.length > 0 && (
        <Card className="p-4">
          <h2 className="font-semibold text-slate-900 mb-3">Top tiện ích được tìm</h2>
          <div className="flex flex-wrap gap-2">
            {stats.top_amenities.map((a, i) => (
              <span key={i} className="text-xs rounded-full bg-slate-100 px-3 py-1 text-slate-700">
                {a.amenity || a.name} ({a.count})
              </span>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
