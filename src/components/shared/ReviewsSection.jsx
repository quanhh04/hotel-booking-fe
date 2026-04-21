import { useMemo } from "react";
import Card from "../ui/Card";
import Spinner from "../ui/Spinner";
import { useReviews } from "../../hooks/useReviews";

function fmtTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${dd}/${mm}/${yyyy} ${hh}:${mi}`;
}

/**
 * Hiển thị danh sách đánh giá của khách sạn (chỉ xem, không viết/sửa).
 * Viết đánh giá được thực hiện ở trang "Lịch sử đặt phòng" (/me/bookings).
 */
export default function ReviewsSection({ hotelId }) {
  const { reviews, loading, error } = useReviews(hotelId);

  const stats = useMemo(() => {
    const count = reviews.length;
    if (!count) return { count: 0, avg: 0 };
    const sum = reviews.reduce((acc, r) => acc + Number(r.rating || 0), 0);
    const avg = Math.round((sum / count) * 10) / 10;
    return { count, avg };
  }, [reviews]);

  if (loading) {
    return <Card className="p-4"><Spinner text="Đang tải đánh giá..." /></Card>;
  }

  return (
    <Card className="p-4">
      <div>
        <h2 className="font-extrabold text-slate-900">Đánh giá</h2>
        <div className="text-sm text-slate-600 mt-1">
          {stats.count > 0 ? (
            <>Điểm trung bình: <b>{stats.avg}</b> • {stats.count} đánh giá</>
          ) : (
            "Chưa có đánh giá nào."
          )}
        </div>
      </div>

      {error && (
        <div className="mt-3 rounded-md bg-red-50 text-red-700 text-sm px-3 py-2">{error}</div>
      )}

      {/* Danh sách đánh giá */}
      <div className="mt-4 space-y-3">
        {reviews.map((r) => (
          <div key={r.id} className="rounded-lg border border-slate-200 p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-semibold text-slate-900">{r.display_name || r.user_name || "Người dùng"}</div>
                <div className="text-xs text-slate-500 mt-1">{fmtTime(r.updated_at || r.created_at)}</div>
              </div>
              <span className="rounded-md bg-[#003580] px-2 py-1 text-sm font-extrabold text-white">
                {r.rating}
              </span>
            </div>
            <div className="mt-2 text-sm text-slate-700 whitespace-pre-line">{r.comment}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}
