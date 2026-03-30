import { useCallback, useEffect, useState } from "react";
import Card from "../ui/Card";
import Button from "../ui/Button";
import Spinner from "../ui/Spinner";
import { adminApi } from "../../api/adminApi";
import { formatVND, formatDate, formatDateTime } from "../../utils/format";
import { BOOKING_STATUS_LABELS } from "../../utils/constants";
import { useToast } from "../../contexts/ToastContext";

function StatusBadge({ status }) {
  const colors = {
    PENDING: "bg-yellow-50 text-yellow-700",
    CONFIRMED: "bg-blue-50 text-blue-700",
    PAID: "bg-green-50 text-green-700",
    CANCELLED: "bg-red-50 text-red-700",
    REFUNDED: "bg-orange-50 text-orange-700",
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${colors[status] || "bg-slate-100 text-slate-600"}`}>
      {BOOKING_STATUS_LABELS[status] || status}
    </span>
  );
}

function BookingDetail({ booking, onClose }) {
  if (!booking) return null;
  const b = booking;
  const nights = b.check_in && b.check_out
    ? Math.max(1, Math.ceil((new Date(b.check_out) - new Date(b.check_in)) / 86400000))
    : 0;
  const total = (b.price_per_night || 0) * nights;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <Card className="w-full max-w-lg p-5 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-extrabold text-slate-900">Chi tiết đặt phòng #{b.id}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">✕</button>
        </div>

        <div className="space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-xs text-slate-500">Trạng thái</div>
              <StatusBadge status={b.status} />
            </div>
            <div>
              <div className="text-xs text-slate-500">Phương thức TT</div>
              <div className="font-semibold">{b.payment_method === "online" ? "Online" : "Tại khách sạn"}</div>
            </div>
          </div>

          <Card className="p-3 bg-slate-50">
            <div className="text-xs text-slate-500 mb-1">Khách hàng</div>
            <div className="font-semibold text-slate-900">{b.user_email || "-"}</div>
            {b.user_name && <div className="text-xs text-slate-600">{b.user_name}</div>}
          </Card>

          <Card className="p-3 bg-slate-50">
            <div className="text-xs text-slate-500 mb-1">Khách sạn & Phòng</div>
            <div className="font-semibold text-slate-900">{b.hotel_name || "-"}</div>
            {b.hotel_address && <div className="text-xs text-slate-600">{b.hotel_address}</div>}
            <div className="mt-1">Phòng: <span className="font-semibold">{b.room_name || "-"}</span></div>
          </Card>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-xs text-slate-500">Check-in</div>
              <div className="font-semibold">{formatDate(b.check_in)}</div>
            </div>
            <div>
              <div className="text-xs text-slate-500">Check-out</div>
              <div className="font-semibold">{formatDate(b.check_out)}</div>
            </div>
            <div>
              <div className="text-xs text-slate-500">Số đêm</div>
              <div className="font-semibold">{nights}</div>
            </div>
            <div>
              <div className="text-xs text-slate-500">Giá/đêm</div>
              <div className="font-semibold">{b.price_per_night ? formatVND(b.price_per_night) : "-"}</div>
            </div>
          </div>

          <Card className="p-3 border-2 border-[#febb02] bg-[#fff8e1]">
            <div className="flex items-center justify-between">
              <span className="text-slate-700">Tổng tiền</span>
              <span className="text-xl font-extrabold text-slate-900">{formatVND(total)}</span>
            </div>
          </Card>

          {b.payment_id && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs text-slate-500">Mã thanh toán</div>
                <div className="font-semibold">#{b.payment_id}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Số tiền TT</div>
                <div className="font-semibold">{b.payment_amount ? formatVND(b.payment_amount) : "-"}</div>
              </div>
            </div>
          )}

          <div>
            <div className="text-xs text-slate-500">Ngày tạo</div>
            <div>{formatDateTime(b.created_at)}</div>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <Button variant="secondary" onClick={onClose}>Đóng</Button>
        </div>
      </Card>
    </div>
  );
}

export default function AdminBookings() {
  const toast = useToast();
  const [bookings, setBookings] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (status) params.status = status;
      const res = await adminApi.getAllBookings(params);
      setBookings(res.bookings || []);
      setTotal(res.total || 0);
    } catch { /* ignore */ }
    setLoading(false);
  }, [page, status]);

  useEffect(() => { fetch(); }, [fetch]);

  async function viewDetail(b) {
    // Use the data we already have from the list
    setDetail(b);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-extrabold text-slate-900">Quản lý đặt phòng ({total})</h1>
      </div>

      {/* Filters */}
      <Card className="p-3 mb-4">
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-600">Trạng thái:</span>
          <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}
            className="rounded-md border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-[#0071c2]">
            <option value="">Tất cả</option>
            {Object.entries(BOOKING_STATUS_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
      </Card>

      {loading ? <Spinner text="Đang tải..." /> : (
        <Card className="p-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b">
                <th className="py-2">ID</th>
                <th className="py-2">Khách hàng</th>
                <th className="py-2">Khách sạn</th>
                <th className="py-2">Phòng</th>
                <th className="py-2">Check-in</th>
                <th className="py-2">Check-out</th>
                <th className="py-2">Trạng thái</th>
                <th className="py-2">Thanh toán</th>
                <th className="py-2 text-right">Giá/đêm</th>
                <th className="py-2">Tạo lúc</th>
                <th className="py-2 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {bookings.map(b => (
                <tr key={b.id} className="hover:bg-slate-50">
                  <td className="py-2 text-slate-500">{b.id}</td>
                  <td className="py-2">
                    <div className="text-slate-900 text-xs">{b.user_email || "-"}</div>
                    {b.user_name && <div className="text-xs text-slate-500">{b.user_name}</div>}
                  </td>
                  <td className="py-2 font-semibold text-slate-900 max-w-[150px] truncate">{b.hotel_name || "-"}</td>
                  <td className="py-2 text-slate-600">{b.room_name || "-"}</td>
                  <td className="py-2">{formatDate(b.check_in)}</td>
                  <td className="py-2">{formatDate(b.check_out)}</td>
                  <td className="py-2"><StatusBadge status={b.status} /></td>
                  <td className="py-2 text-xs">{b.payment_method === "online" ? "Online" : "Tại KS"}</td>
                  <td className="py-2 text-right">{b.price_per_night ? formatVND(b.price_per_night) : "-"}</td>
                  <td className="py-2 text-xs text-slate-500">{formatDateTime(b.created_at)}</td>
                  <td className="py-2 text-right">
                    <button onClick={() => viewDetail(b)} className="text-xs text-[#0071c2] hover:underline">Chi tiết</button>
                  </td>
                </tr>
              ))}
              {bookings.length === 0 && (
                <tr><td colSpan={11} className="py-6 text-center text-slate-500">Không có đặt phòng nào</td></tr>
              )}
            </tbody>
          </table>
        </Card>
      )}

      <div className="flex gap-2 mt-3 justify-center">
        <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="text-sm px-3 py-1 rounded border disabled:opacity-30">← Trước</button>
        <span className="text-sm py-1">Trang {page}</span>
        <button disabled={bookings.length < 20} onClick={() => setPage(p => p + 1)} className="text-sm px-3 py-1 rounded border disabled:opacity-30">Sau →</button>
      </div>

      {detail && <BookingDetail booking={detail} onClose={() => setDetail(null)} />}
    </div>
  );
}
