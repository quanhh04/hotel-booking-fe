import { useCallback, useEffect, useState } from "react";
import Card from "../ui/Card";
import Spinner from "../ui/Spinner";
import { useToast } from "../../contexts/ToastContext";
import { formatDateTime } from "../../utils/format";
import httpClient from "../../api/httpClient";

const P = import.meta.env.VITE_API_PREFIX ?? '/api';

export default function AdminReviews() {
  const toast = useToast();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      // Use hotel list to get all reviews across hotels
      const hotelsRes = await httpClient.get(`${P}/hotels`, { limit: 100 });
      const hotels = hotelsRes.hotels || [];
      const allReviews = [];
      for (const h of hotels.slice(0, 20)) {
        try {
          const res = await httpClient.get(`${P}/reviews/hotel/${h.id}`, { limit: 50 });
          const revs = res.reviews || res || [];
          revs.forEach(r => allReviews.push({ ...r, hotel_name: h.name }));
        } catch { /* skip */ }
      }
      allReviews.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setReviews(allReviews);
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  async function onDelete(id) {
    if (!window.confirm("Xoá review này?")) return;
    try {
      await httpClient.del(`${P}/reviews/admin/${id}`);
      toast.success("Đã xoá review");
      fetch();
    } catch (err) { toast.error(err.message); }
  }

  if (loading) return <Spinner text="Đang tải reviews..." />;

  return (
    <div>
      <h1 className="text-xl font-extrabold text-slate-900 mb-4">Quản lý đánh giá ({reviews.length})</h1>
      <Card className="p-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500 border-b">
              <th className="py-2">ID</th>
              <th className="py-2">Khách sạn</th>
              <th className="py-2">Người dùng</th>
              <th className="py-2 text-center">Điểm</th>
              <th className="py-2">Nội dung</th>
              <th className="py-2">Ngày</th>
              <th className="py-2 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {reviews.map(r => (
              <tr key={r.id} className="hover:bg-slate-50">
                <td className="py-2 text-slate-500">{r.id}</td>
                <td className="py-2 font-semibold text-slate-900">{r.hotel_name || "-"}</td>
                <td className="py-2 text-slate-600">{r.display_name || r.user_name || `User #${r.user_id}`}</td>
                <td className="py-2 text-center">
                  <span className="rounded-md bg-[#003580] px-2 py-0.5 text-xs font-bold text-white">{r.rating}</span>
                </td>
                <td className="py-2 text-slate-700 max-w-xs truncate">{r.comment}</td>
                <td className="py-2 text-xs text-slate-500">{formatDateTime(r.created_at)}</td>
                <td className="py-2 text-right">
                  <button onClick={() => onDelete(r.id)} className="text-xs text-red-500 hover:underline">Xoá</button>
                </td>
              </tr>
            ))}
            {reviews.length === 0 && (
              <tr><td colSpan={7} className="py-6 text-center text-slate-500">Chưa có đánh giá nào</td></tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
