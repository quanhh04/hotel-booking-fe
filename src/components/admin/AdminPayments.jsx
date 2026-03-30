import { useCallback, useEffect, useState } from "react";
import Card from "../ui/Card";
import Button from "../ui/Button";
import Spinner from "../ui/Spinner";
import { adminApi } from "../../api/adminApi";
import { formatVND, formatDateTime } from "../../utils/format";
import { useToast } from "../../contexts/ToastContext";

export default function AdminPayments() {
  const toast = useToast();
  const [payments, setPayments] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.getAllPayments({ page, limit: 20 });
      setPayments(res.payments || []);
      setTotal(res.total || 0);
    } catch { /* ignore */ }
    setLoading(false);
  }, [page]);

  useEffect(() => { fetch(); }, [fetch]);

  async function onRefund(bookingId) {
    if (!window.confirm("Hoàn tiền cho booking #" + bookingId + "?")) return;
    try { await adminApi.refund(bookingId); toast.success("Đã hoàn tiền"); fetch(); }
    catch (err) { toast.error(err.message); }
  }

  if (loading) return <Spinner text="Đang tải..." />;

  return (
    <div>
      <h1 className="text-xl font-extrabold text-slate-900 mb-4">Quản lý thanh toán ({total})</h1>
      <Card className="p-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500 border-b">
              <th className="py-2">ID</th>
              <th className="py-2">Booking</th>
              <th className="py-2">Khách sạn</th>
              <th className="py-2 text-right">Số tiền</th>
              <th className="py-2">Trạng thái</th>
              <th className="py-2">Ngày</th>
              <th className="py-2 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {payments.map(p => (
              <tr key={p.id}>
                <td className="py-2 text-slate-500">{p.id}</td>
                <td className="py-2">#{p.booking_id}</td>
                <td className="py-2 text-slate-900">{p.hotel_name || "-"}</td>
                <td className="py-2 text-right font-semibold">{formatVND(p.amount)}</td>
                <td className="py-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${p.status === "SUCCESS" ? "bg-green-50 text-green-700" : p.status === "REFUNDED" ? "bg-orange-50 text-orange-700" : "bg-slate-100 text-slate-600"}`}>{p.status}</span>
                </td>
                <td className="py-2 text-xs text-slate-500">{formatDateTime(p.created_at)}</td>
                <td className="py-2 text-right">
                  {p.status === "SUCCESS" && <button onClick={() => onRefund(p.booking_id)} className="text-xs text-orange-600 hover:underline">Hoàn tiền</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <div className="flex gap-2 mt-3 justify-center">
        <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="text-sm px-3 py-1 rounded border disabled:opacity-30">← Trước</button>
        <span className="text-sm py-1">Trang {page}</span>
        <button disabled={payments.length < 20} onClick={() => setPage(p => p + 1)} className="text-sm px-3 py-1 rounded border disabled:opacity-30">Sau →</button>
      </div>
    </div>
  );
}
